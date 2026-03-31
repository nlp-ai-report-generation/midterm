import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { colors, fonts, appleEase } from '../data/tokens';
import { fadeIn, slideUp, stagger, cameraPan, cameraZoom } from '../utils/animate';

export const MetricsExplainScene: React.FC = () => {
  const frame = useCurrentFrame();
  const CLAMP = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
  const panY = cameraPan(frame, 450, 50);
  const zoom = cameraZoom(frame, 450, 0.06);

  const metrics = [
    {
      name: 'ICC',
      fullName: 'Intraclass Correlation Coefficient',
      desc: '같은 강의를 3번 평가했을 때 점수가 얼마나 같은지 측정합니다',
      formula: 'σ²ᵦ / (σ²ᵦ + σ²ᵥ)',
      threshold: '≥ 0.75 → Good',
      value: '0.877',
    },
    {
      name: "Cohen's κ",
      fullName: "Cohen's Kappa",
      desc: '두 번의 평가가 우연이 아닌 실제 일치인지 측정합니다',
      formula: '(Pₒ − Pₑ) / (1 − Pₑ)',
      threshold: '≥ 0.80 → Almost Perfect',
      value: '0.883',
    },
    {
      name: "Krippendorff's α",
      fullName: "Krippendorff's Alpha",
      desc: '여러 번의 평가 전체가 합의하는지 측정합니다',
      formula: '1 − Dₒ / Dₑ',
      threshold: '≥ 0.80 → Reliable',
      value: '0.873',
    },
  ];

  return (
    <AbsoluteFill style={{ justifyContent: 'center', padding: '0 80px' }}>
      <div style={{ transform: `translateY(${panY}px) scale(${zoom})`, transformOrigin: 'center center', display: 'flex', flexDirection: 'column', gap: 32, width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: fonts.main, fontSize: 15, fontWeight: 600, color: colors.primary, letterSpacing: 2, textTransform: 'uppercase' as const, opacity: fadeIn(frame, 0), marginBottom: 10 }}>검증 지표</div>
          <div style={{ fontFamily: fonts.main, fontSize: 42, fontWeight: 800, color: colors.text, letterSpacing: -1.5, opacity: fadeIn(frame, 5, 22), transform: `translateY(${slideUp(frame, 5, 20, 22)}px)` }}>
            세 가지 신뢰도 지표로 일관성을 검증합니다
          </div>
        </div>

        <div style={{ display: 'flex', gap: 48, width: '100%' }}>
          {metrics.map((m, i) => {
            const d = stagger(i, 60, 100);
            return (
              <div key={m.name} style={{ flex: 1, opacity: fadeIn(frame, d, 25), transform: `translateY(${slideUp(frame, d, 16, 25)}px)` }}>
                {/* Metric name — big */}
                <div style={{ fontFamily: fonts.mono, fontSize: 32, fontWeight: 800, color: colors.text, marginBottom: 4 }}>{m.name}</div>
                <div style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.textMuted, marginBottom: 16 }}>{m.fullName}</div>

                {/* Description */}
                <div style={{ fontFamily: fonts.main, fontSize: 15, color: colors.textSecondary, lineHeight: 1.6, marginBottom: 16 }}>{m.desc}</div>

                {/* Formula */}
                <div style={{
                  fontFamily: fonts.mono, fontSize: 14, color: colors.text,
                  padding: '8px 0',
                  borderTop: `1px solid ${colors.borderLight}`,
                  borderBottom: `1px solid ${colors.borderLight}`,
                  marginBottom: 16,
                  opacity: fadeIn(frame, d + 30, 18),
                }}>{m.formula}</div>

                {/* Threshold + Value */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', opacity: fadeIn(frame, d + 45, 18) }}>
                  <span style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.textMuted }}>{m.threshold}</span>
                  <span style={{ fontFamily: fonts.mono, fontSize: 28, fontWeight: 800, color: colors.green }}>{m.value}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
