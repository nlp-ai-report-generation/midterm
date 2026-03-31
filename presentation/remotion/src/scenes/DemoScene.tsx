import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { colors, fonts } from '../data/tokens';
import { ScreenshotFrame } from '../components/ScreenshotFrame';
import { fadeIn, slideUp, slideRight, stagger } from '../utils/animate';

type DemoSceneProps = {
  sectionLabel: string;
  title: string;
  description: string;
  screenshotSrc: string;
  screenshotTitle?: string;
  features?: string[];
  animation?: 'none' | 'scrollDown' | 'zoomIn' | 'panRight';
  scrollDistance?: number;
};

export const DemoScene: React.FC<DemoSceneProps> = ({
  sectionLabel, title, description,
  screenshotSrc, screenshotTitle,
  features = [], animation = 'none', scrollDistance,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, width: '100%', padding: '0 80px' }}>
        {/* Header — centered */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: fonts.main, fontSize: 15, fontWeight: 600,
            color: colors.primary, letterSpacing: 2, textTransform: 'uppercase' as const,
            opacity: fadeIn(frame, 0), marginBottom: 10,
          }}>{sectionLabel}</div>
          <div style={{
            fontFamily: fonts.main, fontSize: 38, fontWeight: 800,
            color: colors.text, letterSpacing: -1, lineHeight: 1.2,
            opacity: fadeIn(frame, 4, 20),
            transform: `translateY(${slideUp(frame, 4, 20, 20)}px)`,
          }}>{title}</div>
          <div style={{
            fontFamily: fonts.main, fontSize: 16, color: colors.textSecondary,
            lineHeight: 1.6, marginTop: 10,
            opacity: fadeIn(frame, 10, 18),
          }}>{description}</div>
        </div>

        {/* Screenshot */}
        <ScreenshotFrame
          src={screenshotSrc}
          title={screenshotTitle}
          delay={8}
          width={1400}
          height={780}
          animation={animation}
          scrollDistance={scrollDistance}
        />

        {/* Features — inline, bottom */}
        {features.length > 0 && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center',
            maxWidth: 1200,
          }}>
            {features.map((feat, i) => {
              const d = stagger(i, 22, 4);
              return (
                <div key={i} style={{
                  fontFamily: fonts.main, fontSize: 13, color: colors.textSecondary,
                  opacity: fadeIn(frame, d),
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ color: colors.primary, fontSize: 8 }}>●</span>
                  {feat}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
