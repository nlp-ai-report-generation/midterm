import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { colors, fonts, appleEase } from '../data/tokens';
import { fadeIn, slideUp, stagger, cameraZoom } from '../utils/animate';

export const ScoreMergeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const CLAMP = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
  const zoom = cameraZoom(frame, 510, 0.07);

  const categories = [
    {
      name: '언어 표현', color: colors.primary,
      items: [{ name: '반복 표현', score: 3, w: '1.0' }, { name: '발화 완결성', score: 4, w: '0.7' }, { name: '언어 일관성', score: 4, w: '0.7' }],
      final: 3.5,
    },
    {
      name: '개념 설명', color: colors.purple,
      items: [{ name: '개념 정의', score: 4, w: '1.0' }, { name: '비유 활용', score: 5, w: '1.0' }, { name: '선행 개념', score: 3, w: '0.7' }, { name: '발화 속도', score: 4, w: '0.7' }],
      final: 4.1,
    },
    {
      name: '학생 소통', color: colors.green,
      items: [{ name: '이해도 확인', score: 4, w: '1.0' }, { name: '참여 유도', score: 4, w: '0.7' }, { name: '질의응답', score: 3, w: '0.7' }],
      final: 3.9,
    },
  ];

  return (
    <AbsoluteFill style={{ justifyContent: 'center', padding: '0 80px' }}>
      <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', display: 'flex', flexDirection: 'column', gap: 36, width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: fonts.main, fontSize: 15, fontWeight: 600, color: colors.blue, letterSpacing: 2, textTransform: 'uppercase' as const, opacity: fadeIn(frame, 0), marginBottom: 10 }}>점수 합산</div>
          <div style={{ fontFamily: fonts.main, fontSize: 42, fontWeight: 800, color: colors.text, letterSpacing: -1.5, opacity: fadeIn(frame, 5, 22), transform: `translateY(${slideUp(frame, 5, 20, 22)}px)` }}>
            세부 항목 점수가 가중치를 거쳐 카테고리 점수가 됩니다
          </div>
        </div>

        {/* No boxes — just numbers and text flowing */}
        <div style={{ display: 'flex', gap: 60, width: '100%' }}>
          {categories.map((cat, ci) => {
            const d = stagger(ci, 30, 80);
            const mergeProgress = interpolate(frame - d - 80, [0, 40], [0, 1], { easing: appleEase, ...CLAMP });

            return (
              <div key={cat.name} style={{ flex: 1, opacity: fadeIn(frame, d, 25) }}>
                {/* Category name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 3, background: cat.color }} />
                  <div style={{ fontFamily: fonts.main, fontSize: 20, fontWeight: 800, color: colors.text }}>{cat.name}</div>
                </div>

                {/* Items — pure text + numbers */}
                {cat.items.map((item, ii) => {
                  const id = stagger(ii, d + 15, 12);
                  return (
                    <div key={item.name} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                      padding: '6px 0',
                      borderBottom: ii < cat.items.length - 1 ? `1px solid ${colors.borderLight}` : 'none',
                      opacity: fadeIn(frame, id, 15),
                    }}>
                      <span style={{ fontFamily: fonts.main, fontSize: 15, color: colors.textSecondary }}>{item.name}</span>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                        <span style={{ fontFamily: fonts.mono, fontSize: 20, fontWeight: 700, color: colors.text }}>{item.score}</span>
                        <span style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textDim }}>×{item.w}</span>
                      </div>
                    </div>
                  );
                })}

                {/* Arrow + final score */}
                <div style={{ textAlign: 'center', marginTop: 20, opacity: interpolate(mergeProgress, [0, 1], [0, 1]) }}>
                  <div style={{ fontFamily: fonts.mono, fontSize: 14, color: colors.textDim, marginBottom: 8 }}>↓</div>
                  <div style={{ fontFamily: fonts.mono, fontSize: 44, fontWeight: 800, color: cat.color }}>{cat.final.toFixed(1)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
