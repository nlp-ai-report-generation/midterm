import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { colors, fonts, appleEase } from '../data/tokens';
import { fadeIn, slideUp, stagger, cameraZoom, cameraPan } from '../utils/animate';

export const ParallelEvalScene: React.FC = () => {
  const frame = useCurrentFrame();
  // 15s = 450f, 5 subtitles → ~90f per beat
  const CLAMP = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

  const catColors = [colors.primary, colors.blue, colors.purple, colors.cyan, colors.green];

  const categories = [
    {
      name: '언어 표현 품질', items: 3, score: 3.8, color: catColors[0],
      evidence: '"이제"가 분당 4.2회 반복됩니다. 습관적 사용으로 보입니다.',
    },
    {
      name: '강의 구조', items: 5, score: 3.5, color: catColors[1],
      evidence: '학습 목표를 명시적으로 안내하지 않았습니다.',
    },
    {
      name: '개념 설명', items: 4, score: 4.1, color: catColors[2],
      evidence: '"컴포넌트는 레고 블록 같은 것" — 비유가 효과적입니다.',
    },
    {
      name: '예제 연계', items: 3, score: 3.2, color: catColors[3],
      evidence: '코드 예제 후 실습 연결이 부족합니다.',
    },
    {
      name: '학생 소통', items: 3, score: 3.9, color: catColors[4],
      evidence: '"되셨나요?" 이해도 확인이 분당 0.8회 등장합니다.',
    },
  ];

  return (
    <AbsoluteFill style={{ justifyContent: 'center', padding: '0 80px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, width: '100%', transform: `scale(${cameraZoom(frame, 450, 0.06)}) translateY(${cameraPan(frame, 450, 50)}px)`, transformOrigin: 'center center' }}>
        {/* Header — Beat 1 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: fonts.main, fontSize: 15, fontWeight: 600,
            color: colors.primary, letterSpacing: 2, textTransform: 'uppercase' as const,
            opacity: fadeIn(frame, 0), marginBottom: 10,
          }}>병렬 평가</div>
          <div style={{
            fontFamily: fonts.main, fontSize: 40, fontWeight: 800,
            color: colors.text, letterSpacing: -1.5,
            opacity: fadeIn(frame, 5, 22),
            transform: `translateY(${slideUp(frame, 5, 20, 22)}px)`,
          }}>
            GPT-4o-mini가 5개 카테고리를 동시에 채점합니다
          </div>
        </div>

        {/* Score bars with evidence — full width */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
          {categories.map((cat, i) => {
            const d = stagger(i, 90, 50);
            const barWidth = interpolate(frame - d - 15, [0, 30], [0, cat.score / 5 * 100], { easing: appleEase, ...CLAMP });
            const scoreOpacity = fadeIn(frame, d + 25, 12);
            const evidenceOpacity = fadeIn(frame, d + 35, 15);

            return (
              <div key={cat.name} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                opacity: fadeIn(frame, d, 20),
                width: '100%',
              }}>
                {/* Category color dot + name */}
                <div style={{ width: 150, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: cat.color, flexShrink: 0 }} />
                  <div style={{
                    fontFamily: fonts.main, fontSize: 14, fontWeight: 600, color: colors.text,
                  }}>{cat.name}</div>
                </div>

                {/* Bar */}
                <div style={{ flex: 1, height: 24, background: colors.bgSurface, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    width: `${barWidth}%`, height: '100%',
                    background: cat.color, borderRadius: 4, opacity: 0.8,
                  }} />
                </div>

                {/* Score */}
                <div style={{
                  width: 44, fontFamily: fonts.mono, fontSize: 18, fontWeight: 700,
                  color: colors.text, opacity: scoreOpacity, textAlign: 'right', flexShrink: 0,
                }}>{cat.score.toFixed(1)}</div>

                {/* Evidence quote */}
                <div style={{
                  flex: 1, fontFamily: fonts.main, fontSize: 12, color: colors.textMuted,
                  opacity: evidenceOpacity,
                  paddingLeft: 12,
                  borderLeft: `2px solid ${cat.color}30`,
                  lineHeight: 1.4,
                }}>
                  {cat.evidence}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom note — Beat 5 */}
        <div style={{
          fontFamily: fonts.main, fontSize: 14, color: colors.textMuted,
          opacity: fadeIn(frame, 360, 20), textAlign: 'center',
        }}>
          원문에서 근거를 찾아 인용하고, 왜 이 점수인지 이유를 작성합니다
        </div>
      </div>
    </AbsoluteFill>
  );
};
