"""Provider-agnostic LLM client interfaces."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol


class LLMClient(Protocol):
    def complete(self, prompt: str) -> str:
        ...


@dataclass
class OpenAIClient:
    model: str

    def complete(self, prompt: str) -> str:
        return f"[openai:{self.model}] {prompt[:120]}"


@dataclass
class AnthropicClient:
    model: str

    def complete(self, prompt: str) -> str:
        return f"[anthropic:{self.model}] {prompt[:120]}"


def create_client(provider: str, model: str) -> LLMClient:
    provider_normalized = provider.strip().lower()
    if provider_normalized == "openai":
        return OpenAIClient(model=model)
    if provider_normalized == "anthropic":
        return AnthropicClient(model=model)
    raise ValueError(f"Unsupported provider: {provider}")
