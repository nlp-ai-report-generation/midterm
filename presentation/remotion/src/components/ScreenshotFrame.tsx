import { Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { colors, fonts, spacing, appleEase } from '../data/tokens';
import { fadeIn, slideUp, scaleIn } from '../utils/animate';

type ScreenshotFrameProps = {
  src: string;
  title?: string;
  delay?: number;
  width?: number;
  height?: number;
  animation?: 'none' | 'scrollDown' | 'zoomIn' | 'panRight';
  scrollDistance?: number;
  zoomScale?: number;
};

export const ScreenshotFrame: React.FC<ScreenshotFrameProps> = ({
  src,
  title,
  delay = 0,
  width = 1400,
  height = 780,
  animation = 'none',
  scrollDistance = 200,
  zoomScale = 1.15,
}) => {
  const frame = useCurrentFrame();

  const opacity = fadeIn(frame, delay, 25);
  const translateY = slideUp(frame, delay, 24, 25);
  const scale = scaleIn(frame, delay, 25);

  // Animation for the screenshot content (starts after entrance)
  const animStart = delay + 30;
  const animDuration = 120; // ~4 seconds of smooth animation

  const CLAMP = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

  let imgTransform = '';
  let imgHeight = height - 42;

  // For scrollDown: image keeps natural width-proportional height, just pans up
  let useNaturalHeight = false;

  if (animation === 'scrollDown') {
    const scrollY = interpolate(frame - animStart, [0, animDuration], [0, -scrollDistance], {
      easing: appleEase,
      ...CLAMP,
    });
    imgTransform = `translateY(${scrollY}px)`;
    useNaturalHeight = true;
  } else if (animation === 'zoomIn') {
    const zoomProgress = interpolate(frame - animStart, [0, animDuration], [1, zoomScale], {
      easing: appleEase,
      ...CLAMP,
    });
    imgTransform = `scale(${zoomProgress})`;
  } else if (animation === 'panRight') {
    const panX = interpolate(frame - animStart, [0, animDuration], [0, -80], {
      easing: appleEase,
      ...CLAMP,
    });
    imgTransform = `translateX(${panX}px)`;
  }

  const chromeHeight = 42;

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
            <div
              style={{
                flex: 1,
                textAlign: 'center',
                fontFamily: fonts.main,
                fontSize: 13,
                color: colors.textMuted,
              }}
            >
              {title}
            </div>
          )}
        </div>
        {/* Screenshot with animation */}
        <div
          style={{
            width: '100%',
            height: height - chromeHeight,
            overflow: 'hidden',
          }}
        >
          <Img
            src={staticFile(src)}
            style={{
              width: '100%',
              height: useNaturalHeight ? 'auto' : imgHeight,
              objectFit: useNaturalHeight ? undefined : 'cover',
              objectPosition: useNaturalHeight ? undefined : 'top center',
              display: 'block',
              transform: imgTransform,
              transformOrigin: 'top center',
            }}
          />
        </div>
      </div>
    </div>
  );
};
