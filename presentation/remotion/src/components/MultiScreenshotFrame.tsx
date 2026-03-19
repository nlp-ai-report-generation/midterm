import { Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { colors, fonts, spacing, appleEase } from '../data/tokens';
import { fadeIn, slideUp, scaleIn } from '../utils/animate';

type MultiScreenshotFrameProps = {
  sources: string[]; // array of staticFile paths
  labels?: string[]; // optional tab labels
  title?: string;
  delay?: number;
  width?: number;
  height?: number;
};

export const MultiScreenshotFrame: React.FC<MultiScreenshotFrameProps> = ({
  sources,
  labels,
  title,
  delay = 0,
  width = 1400,
  height = 780,
}) => {
  const frame = useCurrentFrame();

  const opacity = fadeIn(frame, delay, 25);
  const translateY = slideUp(frame, delay, 24, 25);
  const scale = scaleIn(frame, delay, 25);

  const chromeHeight = 42;
  const contentHeight = height - chromeHeight;

  // Calculate which screenshot to show
  const animStart = delay + 25;
  const intervalFrames = Math.floor((height > 0 ? 80 : 60)); // ~2.7s per tab
  const totalSlots = sources.length;

  const currentIndex = Math.min(
    Math.floor(Math.max(0, frame - animStart) / intervalFrames),
    totalSlots - 1
  );

  // Fade for transition
  const localFrame = (frame - animStart) % intervalFrames;
  const CLAMP = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
  const imgOpacity = frame < animStart ? 1 : interpolate(localFrame, [0, 10], [0, 1], { easing: appleEase, ...CLAMP });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width,
          borderRadius: spacing.cardRadius,
          overflow: 'hidden',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          background: colors.bgCard,
        }}
      >
        {/* Browser chrome */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 20px',
            background: colors.bgSurface,
            borderBottom: `1px solid ${colors.border}`,
            gap: 10,
            height: chromeHeight,
          }}
        >
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 6, background: '#FF5F57' }} />
            <div style={{ width: 12, height: 12, borderRadius: 6, background: '#FEBC2E' }} />
            <div style={{ width: 12, height: 12, borderRadius: 6, background: '#28C840' }} />
          </div>
          {title && (
            <div style={{ flex: 1, textAlign: 'center', fontFamily: fonts.main, fontSize: 13, color: colors.textMuted }}>
              {title}
            </div>
          )}
        </div>

        {/* Tab indicators */}
        {labels && labels.length > 0 && (
          <div style={{
            display: 'flex', gap: 0, background: colors.bgSurface,
            borderBottom: `1px solid ${colors.border}`, padding: '0 16px',
          }}>
            {labels.map((label, i) => (
              <div key={label} style={{
                padding: '8px 14px',
                fontFamily: fonts.main, fontSize: 12, fontWeight: i === currentIndex ? 600 : 400,
                color: i === currentIndex ? colors.primary : colors.textMuted,
                borderBottom: i === currentIndex ? `2px solid ${colors.primary}` : '2px solid transparent',
              }}>
                {label}
              </div>
            ))}
          </div>
        )}

        {/* Screenshot content with crossfade */}
        <div style={{ width: '100%', height: contentHeight - (labels ? 34 : 0), overflow: 'hidden', position: 'relative' }}>
          <Img
            src={staticFile(sources[currentIndex])}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top center',
              display: 'block',
              opacity: imgOpacity,
            }}
          />
        </div>
      </div>
    </div>
  );
};
