import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { colors, fonts } from '../data/tokens';
import { MultiScreenshotFrame } from '../components/MultiScreenshotFrame';
import { fadeIn, slideUp, stagger } from '../utils/animate';

export const EDADemoScene: React.FC = () => {
  const frame = useCurrentFrame();

  const features = [
    '발화량 분석 — 일별 라인 수와 평균',
    '화자 구성 — 강사 vs 학생 비율',
    '소통 빈도 — 질문, 이해도 확인 횟수',
    '습관 표현 — "자", "그래서", "이제" 빈도',
  ];

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%', padding: '0 80px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: fonts.main, fontSize: 15, fontWeight: 600,
            color: colors.primary, letterSpacing: 2, textTransform: 'uppercase' as const,
            opacity: fadeIn(frame, 0), marginBottom: 10,
          }}>탐색적 분석</div>
          <div style={{
            fontFamily: fonts.main, fontSize: 38, fontWeight: 800,
            color: colors.text, letterSpacing: -1, lineHeight: 1.2,
            opacity: fadeIn(frame, 4, 20),
            transform: `translateY(${slideUp(frame, 4, 20, 20)}px)`,
          }}>
            강의 스크립트 안에 숨어 있는 패턴을 찾습니다
          </div>
        </div>

        <MultiScreenshotFrame
          sources={[
            'assets/ui-eda-overview.png',
            'assets/ui-eda-speakers.png',
            'assets/ui-eda-interaction.png',
            'assets/ui-eda-filler.png',
          ]}
          labels={['발화량', '화자 구성', '소통 빈도', '습관 표현']}
          title="localhost:3000/eda"
          delay={8}
          width={1400}
          height={780}
        />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center', maxWidth: 1200 }}>
          {features.map((feat, i) => (
            <div key={i} style={{
              fontFamily: fonts.main, fontSize: 13, color: colors.textSecondary,
              opacity: fadeIn(frame, stagger(i, 22, 4)),
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ color: colors.primary, fontSize: 8 }}>●</span>
              {feat}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
