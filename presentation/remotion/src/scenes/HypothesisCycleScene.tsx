import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { colors, fonts, appleEase } from '../data/tokens';
import { fadeIn, slideUp, stagger, cameraPan, cameraZoom } from '../utils/animate';

export const HypothesisCycleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const panY = cameraPan(frame, 360, 50);
  const zoom = cameraZoom(frame, 360, 0.05);

  const cycleSteps = [
    { num: '01', label: '평가 실행', sub: '3회 반복' },
    { num: '02', label: 'ICC 측정', sub: '일관성 확인' },
    { num: '03', label: '약한 항목 찾기', sub: '기준 미달 골라내기' },
    { num: '04', label: '기준 재정의', sub: '프롬프트 수정' },
  ];

  return (
    <AbsoluteFill style={{ justifyContent: 'center', padding: '0 80px' }}>
      <div style={{ transform: `translateY(${panY}px) scale(${zoom})`, transformOrigin: 'center center', display: 'flex', flexDirection: 'column', gap: 36, width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: fonts.main, fontSize: 15, fontWeight: 600, color: colors.primary, letterSpacing: 2, textTransform: 'uppercase' as const, opacity: fadeIn(frame, 0), marginBottom: 10 }}>고도화 사이클</div>
          <div style={{ fontFamily: fonts.main, fontSize: 42, fontWeight: 800, color: colors.text, letterSpacing: -1.5, lineHeight: 1.2, opacity: fadeIn(frame, 5, 22), transform: `translateY(${slideUp(frame, 5, 20, 22)}px)` }}>
            일관성이 낮은 항목을 골라 기준을 다시 쓰고, 재평가합니다
          </div>
        </div>

        <div style={{ display: 'flex', gap: 80, width: '100%' }}>
          {/* Left: Linear cycle steps with loop arrow */}
          <div style={{ flex: 1 }}>
            {cycleSteps.map((step, i) => {
              const d = stagger(i, 25, 30);
              return (
                <div key={step.num}>
                  <div style={{
                    display: 'flex', gap: 16, alignItems: 'flex-start',
                    padding: '14px 0',
                    borderBottom: i < cycleSteps.length - 1 ? `1px solid ${colors.borderLight}` : 'none',
                    opacity: fadeIn(frame, d, 22),
                    transform: `translateY(${slideUp(frame, d, 10, 22)}px)`,
                  }}>
                    <div style={{ fontFamily: fonts.mono, fontSize: 14, fontWeight: 700, color: colors.primary, marginTop: 2 }}>{step.num}</div>
                    <div>
                      <div style={{ fontFamily: fonts.main, fontSize: 18, fontWeight: 700, color: colors.text }}>{step.label}</div>
                      <div style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.textMuted, marginTop: 3 }}>{step.sub}</div>
                    </div>
                  </div>
                  {/* Arrow between steps */}
                  {i < cycleSteps.length - 1 && (
                    <div style={{ paddingLeft: 5, fontFamily: fonts.mono, fontSize: 14, color: colors.textDim, opacity: fadeIn(frame, d + 15, 12) }}>↓</div>
                  )}
                </div>
              );
            })}
            {/* Loop back arrow */}
            <div style={{
              marginTop: 12, paddingLeft: 5,
              fontFamily: fonts.mono, fontSize: 14, color: colors.primary, fontWeight: 600,
              opacity: fadeIn(frame, 160, 18),
            }}>
              ↩ 01로 돌아가서 반복
            </div>
          </div>

          {/* Right: Example */}
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: fonts.main, fontSize: 20, fontWeight: 800, color: colors.text, marginBottom: 28, opacity: fadeIn(frame, 80, 20) }}>
              실제 사례
            </div>

            {[
              { tag: '발견', text: '항목 3.2 비유/예시 활용', detail: 'ICC 0.697 — 기준 미달', color: colors.red },
              { tag: '수정', text: '프롬프트에 비유의 정의와 예시를 구체적으로 추가', detail: '', color: colors.primary },
              { tag: '결과', text: '재평가 결과 ICC 0.82로 개선', detail: '기준 통과', color: colors.green },
            ].map((step, i) => {
              const d = stagger(i, 100, 40);
              return (
                <div key={i} style={{
                  display: 'flex', gap: 20, alignItems: 'flex-start',
                  padding: '14px 0',
                  borderBottom: i < 2 ? `1px solid ${colors.borderLight}` : 'none',
                  opacity: fadeIn(frame, d, 22),
                  transform: `translateY(${slideUp(frame, d, 10, 22)}px)`,
                }}>
                  <div style={{ fontFamily: fonts.mono, fontSize: 15, fontWeight: 700, color: step.color, width: 40, flexShrink: 0, marginTop: 2 }}>{step.tag}</div>
                  <div>
                    <div style={{ fontFamily: fonts.main, fontSize: 17, fontWeight: 600, color: colors.text, lineHeight: 1.5 }}>{step.text}</div>
                    {step.detail && (
                      <div style={{ fontFamily: fonts.mono, fontSize: 14, color: step.color, marginTop: 4 }}>{step.detail}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
