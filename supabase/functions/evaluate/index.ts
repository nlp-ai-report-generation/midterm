// Supabase Edge Function: 강의 트랜스크립트 평가
// Deploy: supabase functions deploy evaluate

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EVALUATION_PROMPT = `당신은 강의 품질 평가 전문가입니다. 아래 STT 트랜스크립트를 읽고 18개 항목을 1-5점으로 평가하세요.

## 평가 항목

카테고리 1: 언어 표현 품질
- 1.1 불필요한 반복 표현 (HIGH) — 동일 단어/문장 반복 여부
- 1.2 발화 완결성 (MEDIUM) — 문장 끝맺음 여부
- 1.3 언어 일관성 (MEDIUM) — 존댓말/반말 일관성

카테고리 2: 강의 도입 및 구조
- 2.1 학습 목표 안내 (HIGH) — 시작시 목표 안내
- 2.2 전날 복습 연계 (HIGH) — 이전 내용 연결
- 2.3 설명 순서 (MEDIUM) — 개념→예시→실습 순서
- 2.4 핵심 내용 강조 (MEDIUM) — 중요 내용 강조
- 2.5 마무리 요약 (LOW) — 핵심 정리

카테고리 3: 개념 설명 명확성
- 3.1 개념 정의 (HIGH) — 핵심 개념 정의
- 3.2 비유 및 예시 활용 (HIGH) — 비유/예시 사용
- 3.3 선행 개념 확인 (MEDIUM) — 갑작스러운 심화 방지
- 3.4 발화 속도 적절성 (MEDIUM) — 적절한 속도

카테고리 4: 예시 및 실습 연계
- 4.1 예시 적절성 (HIGH) — 수준에 맞는 예시
- 4.2 실습 연계 (HIGH) — 이론→실습 연결

카테고리 5: 수강생 상호작용
- 5.1 오류 대응 (MEDIUM) — 질문/오류 대응
- 5.2 이해 확인 질문 (HIGH) — "되셨어요?" 등
- 5.3 참여 유도 (HIGH) — 수강생 참여 유도
- 5.4 질문 응답 충분성 (HIGH) — 충분한 답변

## 응답 형식 (JSON)
{
  "category_results": [
    {
      "category_name": "1. 언어 표현 품질",
      "items": [
        {
          "item_id": "1.1",
          "item_name": "불필요한 반복 표현",
          "category": "1. 언어 표현 품질",
          "score": 3,
          "weight": "HIGH",
          "evidence": ["직접 인용 1", "직접 인용 2"],
          "reasoning": "평가 근거 설명",
          "confidence": 0.8,
          "caveats": []
        }
      ],
      "weighted_average": 3.0
    }
  ],
  "weighted_average": 3.0,
  "strengths": ["강점 1", "강점 2"],
  "improvements": ["개선점 1"],
  "recommendations": ["권장사항 1"],
  "report_markdown": "# 종합 평가\\n..."
}

weighted_average 계산: sum(score * weight) / sum(weight), HIGH=3, MEDIUM=2, LOW=1
evidence는 트랜스크립트에서 직접 인용하세요.
점수를 부풀리지 마세요. 정직하게 평가하세요.`;

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const { transcript, apiKey, model = "gpt-4o-mini", lectureDate, metadata } = await req.json();

    if (!transcript || !apiKey) {
      return new Response(
        JSON.stringify({ error: "transcript와 apiKey가 필요합니다" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // 트랜스크립트가 너무 길면 앞뒤만 사용
    const lines = transcript.split("\n");
    const truncated = lines.length > 500
      ? [...lines.slice(0, 400), "\n... (중략) ...\n", ...lines.slice(-100)].join("\n")
      : transcript;

    // OpenAI API 호출
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: EVALUATION_PROMPT },
          { role: "user", content: `다음 강의 트랜스크립트를 평가하세요:\n\n${truncated}` },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(
        JSON.stringify({ error: `OpenAI API 오류: ${response.status}`, detail: err }),
        { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return new Response(
        JSON.stringify({ error: "OpenAI 응답이 비어있습니다" }),
        { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const evaluation = JSON.parse(content);

    // 결과 포맷팅
    const result = {
      lecture_date: lectureDate || new Date().toISOString().slice(0, 10),
      transcript_path: "",
      metadata: metadata || {},
      ...evaluation,
      token_usage: {
        prompt_tokens: data.usage?.prompt_tokens || 0,
        completion_tokens: data.usage?.completion_tokens || 0,
        total_tokens: data.usage?.total_tokens || 0,
      },
      cost_usd: 0,
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
