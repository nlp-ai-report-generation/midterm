import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { colors, fonts, appleEase } from '../data/tokens';
import { fadeIn, slideUp, slideRight, stagger, cameraZoom } from '../utils/animate';

export const EvalCloseupScene: React.FC = () => {
  const frame = useCurrentFrame();
  const CLAMP = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
  const zoom = cameraZoom(frame, 420, 0.07);

  const items = [
    { id: '3.1', name: '개념 정의', weight: 'HIGH', score: 4, desc: '핵심 용어를 명확히 설명했는지' },
    { id: '3.2', name: '비유/예시 활용', weight: 'HIGH', score: 5, desc: '비유나 예시로 이해를 도왔는지' },
    { id: '3.3', name: '선행 개념 확인', weight: 'MED', score: 3, desc: '이전에 배운 내용과 연결했는지' },
    { id: '3.4', name: '발화 속도', weight: 'MED', score: 4, desc: '너무 빠르거나 느리지 않은지' },
  ];

  return (
    <AbsoluteFill style={{ justifyContent: 'center', padding: '0 80px' }}>
      <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', display: 'flex', flexDirection: 'column', gap: 36, width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 13, fontWeight: 700, color: colors.purple, letterSpacing: 2, opacity: fadeIn(frame, 0), marginBottom: 10 }}>카테고리 3 — 개념 설명의 명확성</div>
          <div style={{ fontFamily: fonts.main, fontSize: 44, fontWeight: 800, color: colors.text, letterSpacing: -1.5, opacity: fadeIn(frame, 5, 22), transform: `translateY(${slideUp(frame, 5, 20, 22)}px)` }}>
            세부 항목 4개를 하나씩 채점합니다
          </div>
        </div>

        {/* Items — no boxes, just lines with score bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, width: '100%' }}>
          {items.map((item, i) => {
            const d = stagger(i, 20, 60);
            const barWidth = interpolate(frame - d - 20, [0, 30], [0, item.score / 5 * 100], { easing: appleEase, ...CLAMP });
            const scoreReveal = fadeIn(frame, d + 35, 15);

            return (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: 20, width: '100%',
                padding: '14px 0',
                borderBottom: i < items.length - 1 ? `1px solid ${colors.borderLight}` : 'none',
                opacity: fadeIn(frame, d, 22),
                transform: `translateX(${slideRight(frame, d, -16, 22)}px)`,
              }}>
                <div style={{ fontFamily: fonts.mono, fontSize: 14, fontWeight: 700, color: colors.purple, width: 32 }}>{item.id}</div>
                <div style={{ width: 180 }}>
                  <div style={{ fontFamily: fonts.main, fontSize: 17, fontWeight: 700, color: colors.text }}>{item.name}</div>
                  <div style={{ fontFamily: fonts.main, fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{item.desc}</div>
                </div>
                <div style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.textMuted, width: 40 }}>{item.weight}</div>
                {/* Bar — just the fill, minimal */}
                <div style={{ flex: 1, height: 4, background: colors.bgSurface, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${barWidth}%`, height: '100%', background: colors.purple, borderRadius: 2 }} />
                </div>
                <div style={{ fontFamily: fonts.mono, fontSize: 32, fontWeight: 800, color: colors.text, width: 50, textAlign: 'right', opacity: scoreReveal }}>{item.score}</div>
              </div>
            );
          })}
        </div>

        {/* Category final */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, alignItems: 'baseline', opacity: fadeIn(frame, 370, 20) }}>
          <span style={{ fontFamily: fonts.main, fontSize: 16, color: colors.textSecondary }}>카테고리 최종 점수</span>
          <span style={{ fontFamily: fonts.mono, fontSize: 48, fontWeight: 800, color: colors.purple }}>4.1</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
