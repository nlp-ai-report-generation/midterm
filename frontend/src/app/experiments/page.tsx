"use client";

import { motion } from "framer-motion";

const reliabilityMetrics = [
  {
    name: "Cohen's Kappa (κ)",
    threshold: "≥ 0.61",
    description: "평가자 간 일치도 측정. 우연에 의한 일치를 보정한 신뢰도 지표",
    level: "Substantial Agreement",
  },
  {
    name: "Krippendorff's Alpha (α)",
    threshold: "≥ 0.667",
    description: "다수 평가자 간 신뢰도. 결측치 허용 및 다양한 측정 수준 지원",
    level: "Acceptable Reliability",
  },
  {
    name: "ICC (급내상관계수)",
    threshold: "≥ 0.75",
    description: "연속형 점수의 평가자 간 일관성. 절대적 일치와 일관성 모두 측정",
    level: "Good Reliability",
  },
  {
    name: "SSI (점수 안정성 지수)",
    threshold: "≥ 0.85",
    description: "동일 입력에 대한 반복 평가 안정성. 모델의 결정론적 일관성 측정",
    level: "High Stability",
  },
];

export default function ExperimentsPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">실험 프레임워크</h1>
        <p className="text-text-secondary mt-1">
          LLM 기반 평가의 신뢰성을 검증하기 위한 실험 설계 및 결과
        </p>
      </div>

      {/* Experiment Framework Explanation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-border-light"
      >
        <h2 className="text-lg font-bold text-foreground mb-3">실험 설계</h2>
        <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <p>
            AI 기반 강의 평가 시스템의 신뢰성을 확보하기 위해 다층적 실험 프레임워크를 설계했습니다.
            동일한 강의 스크립트에 대해 반복 평가를 수행하고, 평가자 간 일치도 및 점수 안정성을 측정합니다.
          </p>
          <p>
            실험은 다양한 모델(GPT-4o, Claude 3.5 Sonnet), 온도 설정(0.0~0.7),
            청킹 전략(15분/30분/45분), 보정 사용 여부 등의 조합으로 구성됩니다.
          </p>
          <p>
            각 실험 조건에서 최소 5회 반복 평가를 수행하며,
            아래의 신뢰도 지표가 임계값을 충족하는지 검증합니다.
          </p>
        </div>
      </motion.div>

      {/* Reliability Metrics */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">신뢰도 지표 기준</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reliabilityMetrics.map((metric, i) => (
            <motion.div
              key={metric.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-border-light"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-base font-bold text-foreground">{metric.name}</h3>
                <span className="text-lg font-bold text-primary">{metric.threshold}</span>
              </div>
              <p className="text-xs font-medium text-primary/80 mb-2">{metric.level}</p>
              <p className="text-sm text-text-secondary leading-relaxed">
                {metric.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-border-light text-center py-16"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-light flex items-center justify-center">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <p className="text-lg font-bold text-foreground mb-1">실험 데이터 준비 중</p>
        <p className="text-sm text-text-secondary">
          실험 데이터를 불러올 수 없습니다
        </p>
        <p className="text-xs text-text-tertiary mt-2">
          실험이 완료되면 여기에 결과가 표시됩니다
        </p>
      </motion.div>
    </div>
  );
}
