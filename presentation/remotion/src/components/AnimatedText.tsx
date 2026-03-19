import { useCurrentFrame } from 'remotion';
import { colors, fonts } from '../data/tokens';
import { fadeIn, slideUp, stagger } from '../utils/animate';

type AnimatedTextProps = {
  text: string;
  delay?: number;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
  style?: React.CSSProperties;
  letterSpacing?: number;
};

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  delay = 0,
  fontSize = 48,
  color = colors.text,
  fontWeight = 600,
  style = {},
  letterSpacing = -0.5,
}) => {
  const frame = useCurrentFrame();

  const opacity = fadeIn(frame, delay);
  const translateY = slideUp(frame, delay);

  return (
    <div
      style={{
        fontFamily: fonts.main,
        fontSize,
        fontWeight,
        color,
        opacity,
        transform: `translateY(${translateY}px)`,
        letterSpacing,
        lineHeight: 1.3,
        ...style,
      }}
    >
      {text}
    </div>
  );
};

type StaggeredWordsProps = {
  text: string;
  delay?: number;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
  staggerFrames?: number;
  style?: React.CSSProperties;
};

export const StaggeredWords: React.FC<StaggeredWordsProps> = ({
  text,
  delay = 0,
  fontSize = 48,
  color = colors.text,
  fontWeight = 600,
  staggerFrames = 3,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const words = text.split(' ');

  return (
    <div
      style={{
        fontFamily: fonts.main,
        fontSize,
        fontWeight,
        color,
        display: 'flex',
        flexWrap: 'wrap',
        gap: `0 ${fontSize * 0.25}px`,
        lineHeight: 1.4,
        ...style,
      }}
    >
      {words.map((word, i) => {
        const wordDelay = stagger(i, delay, staggerFrames);
        const opacity = fadeIn(frame, wordDelay);
        const y = slideUp(frame, wordDelay, 16, 20);

        return (
          <span
            key={`${word}-${i}`}
            style={{
              opacity,
              transform: `translateY(${y}px)`,
              display: 'inline-block',
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
