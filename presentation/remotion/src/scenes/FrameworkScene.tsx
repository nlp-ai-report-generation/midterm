import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { colors, fonts } from '../data/tokens';
import { fadeIn, slideUp, stagger, cameraZoom } from '../utils/animate';

export const FrameworkScene: React.FC = () => {
  const frame = useCurrentFrame();
  // 14s = 420f, 5 subtitles → ~84f per beat

  const categories = [
    { num: 1, name: '언어 표현 품질', count: 3, items: ['불필요한 반복', '발화 완결성', '언어 일관성'] },
    { num: 2, name: '강의 구조', count: 5, items: ['학습 목표 안내', '이전 강의 연결', '설명 순서', '핵심 강조', '정리/요약'] },
    { num: 3, name: '개념 명확성', count: 4, items: ['개념 정의', '비유/예시', '선행 개념 확인', '발화 속도'] },
    { num: 4, name: '예제 연계', count: 3, items: ['예제 적절성', '실습 연계', '오류 대응'] },
    { num: 5, name: '학생 상호작용', count: 3, items: ['이해도 확인', '참여 유도', '질의응답'] },
  ];

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36, width: '100%', padding: '0 80px', transform: `scale(${cameraZoom(frame, 420, 0.05)})`, transformOrigin: 'center center' }}>
        {/* Header — Beat 1 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: fonts.main, fontSize: 15, fontWeight: 600,
            color: colors.primary, letterSpacing: 2, textTransform: 'uppercase' as const,
            opacity: fadeIn(frame, 0), marginBottom: 14,
          }}>평가 기준</div>
          <div style={{
            fontFamily: fonts.main, fontSize: 44, fontWeight: 800,
            color: colors.text, letterSpacing: -1.5,
            opacity: fadeIn(frame, 5, 22),
            transform: `translateY(${slideUp(frame, 5, 24, 22)}px)`,
          }}>
            강의를 어떤 기준으로 평가하는지 정의했습니다
          </div>
        </div>

        {/* Categories — Beat 2~4, staggered per category */}
        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', width: '100%' }}>
          {categories.map((cat, ci) => {
            // Each category appears in sequence with subtitles
            const catDelay = 84 + ci * 50; // stagger across beats 2-4
            return (
              <div key={cat.name} style={{
                flex: 1, textAlign: 'center',
                opacity: fadeIn(frame, catDelay, 22),
                transform: `translateY(${slideUp(frame, catDelay, 16, 22)}px)`,
              }}>
                <div style={{
                  fontFamily: fonts.mono, fontSize: 13, fontWeight: 700,
                  color: colors.primary, marginBottom: 8,
                }}>{String(cat.num).padStart(2, '0')}</div>
                <div style={{
                  fontFamily: fonts.main, fontSize: 17, fontWeight: 700,
                  color: colors.text, marginBottom: 10, lineHeight: 1.3,
                }}>{cat.name}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {cat.items.map((item, ii) => (
                    <div key={ii} style={{
                      fontFamily: fonts.main, fontSize: 15, color: colors.textSecondary,
                      opacity: fadeIn(frame, catDelay + 10 + ii * 4),
                      lineHeight: 1.5,
                    }}>{item}</div>
                  ))}
                </div>
                <div style={{ width: 24, height: 1.5, background: colors.border, margin: '12px auto 0' }} />
              </div>
            );
          })}
        </div>

        {/* Scoring note — Beat 5 */}
        <div style={{
          fontFamily: fonts.main, fontSize: 15, color: colors.textMuted,
          opacity: fadeIn(frame, 340, 20), textAlign: 'center',
        }}>
          각 항목은 1점에서 5점까지 채점합니다 — 1 매우 미흡 · 3 보통 · 5 매우 우수
        </div>
      </div>
    </AbsoluteFill>
  );
};
