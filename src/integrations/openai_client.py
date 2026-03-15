"""OpenAI API 클라이언트 래퍼.

비동기 호출, rate limiting, 토큰 사용량 추적을 지원한다.
"""

from __future__ import annotations

import asyncio
import json
import logging
from dataclasses import dataclass, field
from pathlib import Path

from openai import AsyncOpenAI, BadRequestError
from dotenv import load_dotenv

logger = logging.getLogger(__name__)


def _sanitize_text_for_json(text: str) -> str:
    return "".join(
        ch for ch in text
        if ch in ("\n", "\r", "\t") or ord(ch) >= 32 and not 0xD800 <= ord(ch) <= 0xDFFF
    )


@dataclass
class TokenUsage:
    """API 호출 토큰 사용량 추적."""

    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0

    def add(self, other: TokenUsage) -> None:
        self.prompt_tokens += other.prompt_tokens
        self.completion_tokens += other.completion_tokens
        self.total_tokens += other.total_tokens

    def cost_usd(self, model: str = "gpt-4o") -> float:
        """예상 비용 계산 (USD)."""
        pricing = {
            "gpt-4o": (2.50 / 1_000_000, 10.00 / 1_000_000),
            "gpt-4o-mini": (0.15 / 1_000_000, 0.60 / 1_000_000),
        }
        input_price, output_price = pricing.get(model, pricing["gpt-4o"])
        return self.prompt_tokens * input_price + self.completion_tokens * output_price


@dataclass
class OpenAIEvalClient:
    """평가 파이프라인용 OpenAI 비동기 클라이언트."""

    model: str = "gpt-4o"
    temperature: float = 0.1
    max_concurrent: int = 5
    _client: AsyncOpenAI | None = field(default=None, init=False, repr=False)
    _semaphore: asyncio.Semaphore = field(init=False, repr=False)
    _total_usage: TokenUsage = field(default_factory=TokenUsage, repr=False)

    def __post_init__(self) -> None:
        load_dotenv(Path(__file__).parents[2] / ".env")
        self._client = AsyncOpenAI()
        self._semaphore = asyncio.Semaphore(self.max_concurrent)

    @property
    def total_usage(self) -> TokenUsage:
        return self._total_usage

    async def evaluate(
        self,
        system_prompt: str,
        user_prompt: str,
        response_schema: dict | None = None,
    ) -> dict:
        """구조화된 JSON 응답을 반환하는 평가 호출.

        Args:
            system_prompt: 시스템 프롬프트 (하네스 본문)
            user_prompt: 사용자 프롬프트 (스크립트 청크)
            response_schema: JSON 스키마 (structured output용)

        Returns:
            파싱된 JSON 딕셔너리
        """
        async with self._semaphore:
            kwargs: dict = {
                "model": self.model,
                "temperature": self.temperature,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            }

            if response_schema:
                kwargs["response_format"] = {
                    "type": "json_schema",
                    "json_schema": response_schema,
                }
            else:
                kwargs["response_format"] = {"type": "json_object"}

            try:
                response = await self._client.chat.completions.create(**kwargs)
            except BadRequestError as exc:
                error_message = str(exc)
                if "We could not parse the JSON body of your request" not in error_message:
                    raise

                logger.warning("Retrying OpenAI request with sanitized prompt text")
                kwargs["messages"] = [
                    {
                        "role": "system",
                        "content": _sanitize_text_for_json(system_prompt),
                    },
                    {
                        "role": "user",
                        "content": _sanitize_text_for_json(user_prompt),
                    },
                ]
                response = await self._client.chat.completions.create(**kwargs)

            if response.usage:
                usage = TokenUsage(
                    prompt_tokens=response.usage.prompt_tokens,
                    completion_tokens=response.usage.completion_tokens,
                    total_tokens=response.usage.total_tokens,
                )
                self._total_usage.add(usage)
                logger.debug(
                    "API call: %d tokens (prompt=%d, completion=%d)",
                    usage.total_tokens,
                    usage.prompt_tokens,
                    usage.completion_tokens,
                )

            content = response.choices[0].message.content or "{}"
            return json.loads(content)

    def reset_usage(self) -> None:
        """토큰 사용량 초기화."""
        self._total_usage = TokenUsage()
