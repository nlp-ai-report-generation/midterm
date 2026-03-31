import { useCurrentFrame } from 'remotion';
import { colors, fonts } from '../data/tokens';
import { fadeIn, slideUp } from '../utils/animate';

type SubtitleProps = {
  lines: string[];
  sceneDurationInFrames?: number;
};

export const Subtitle: React.FC<SubtitleProps> = ({ lines, sceneDurationInFrames }) => {
  const frame = useCurrentFrame();
  const duration = sceneDurationInFrames || 300;

  const lineInterval = Math.floor(duration / lines.length);
  const currentLineIndex = Math.min(
    Math.floor(frame / lineInterval),
    lines.length - 1
  );

  if (currentLineIndex < 0) return null;

  const lineStartFrame = currentLineIndex * lineInterval;
  const localFrame = frame - lineStartFrame;

  const opacity = fadeIn(localFrame, 0, 12);
  const translateY = slideUp(localFrame, 0, 8, 12);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 56,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.82)',
          borderRadius: 10,
          padding: '12px 28px',
          maxWidth: '75%',
        }}
      >
        <div
          style={{
            fontFamily: fonts.main,
            fontSize: 26,
            fontWeight: 500,
            color: '#FFFFFF',
            opacity,
            transform: `translateY(${translateY}px)`,
            textAlign: 'center',
            letterSpacing: -0.3,
            lineHeight: 1.45,
          }}
        >
          {lines[currentLineIndex]}
        </div>
      </div>
    </div>
  );
};
