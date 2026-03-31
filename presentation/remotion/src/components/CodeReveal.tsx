import { useCurrentFrame } from 'remotion';
import { colors, fonts } from '../data/tokens';
import { fadeIn, slideRight } from '../utils/animate';

type CodeRevealProps = {
  code: string;
  language?: string;
  delay?: number;
  fontSize?: number;
  lineDelay?: number;
};

export const CodeReveal: React.FC<CodeRevealProps> = ({
  code,
  language = 'python',
  delay = 0,
  fontSize = 14,
  lineDelay = 3,
}) => {
  const frame = useCurrentFrame();
  const lines = code.split('\n');

  const keywords = [
    'def', 'class', 'import', 'from', 'return', 'if', 'else', 'elif',
    'for', 'in', 'while', 'with', 'as', 'async', 'await', 'yield',
    'try', 'except', 'finally', 'raise', 'True', 'False', 'None',
    'and', 'or', 'not', 'is', 'lambda', 'pass', 'break', 'continue',
  ];

  const highlightLine = (line: string): React.ReactNode[] => {
    if (line.trimStart().startsWith('#') || line.trimStart().startsWith('//')) {
      return [<span key="c" style={{ color: colors.textMuted }}>{line}</span>];
    }
    const parts: React.ReactNode[] = [];
    const tokens = line.split(/(\s+|[()[\]{},.:=+\-*/<>!@"'])/);
    tokens.forEach((token, idx) => {
      if (keywords.includes(token)) {
        parts.push(<span key={idx} style={{ color: '#AF52DE' }}>{token}</span>);
      } else if (token.startsWith('"') || token.startsWith("'")) {
        parts.push(<span key={idx} style={{ color: '#34C759' }}>{token}</span>);
      } else if (/^\d+$/.test(token)) {
        parts.push(<span key={idx} style={{ color: colors.primary }}>{token}</span>);
      } else if (['(', ')', '[', ']', '{', '}'].includes(token)) {
        parts.push(<span key={idx} style={{ color: '#8E8E93' }}>{token}</span>);
      } else {
        parts.push(<span key={idx}>{token}</span>);
      }
    });
    return parts;
  };

  return (
    <div
      style={{
        background: colors.bgSurface,
        border: `1px solid ${colors.border}`,
        borderRadius: 16,
        padding: '20px 24px',
        overflow: 'hidden',
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 12,
            color: colors.textMuted,
            textTransform: 'uppercase' as const,
            letterSpacing: 1,
          }}
        >
          {language}
        </div>
      </div>
      <div style={{ fontFamily: fonts.mono, fontSize, lineHeight: 1.75 }}>
        {lines.map((line, i) => {
          const d = delay + i * lineDelay;
          const opacity = fadeIn(frame, d);
          const translateX = slideRight(frame, d, -12, 20);

          return (
            <div
              key={i}
              style={{
                opacity,
                transform: `translateX(${translateX}px)`,
                display: 'flex',
                gap: 16,
              }}
            >
              <span style={{ color: colors.textDim, minWidth: 28, textAlign: 'right', userSelect: 'none' }}>
                {i + 1}
              </span>
              <span style={{ color: colors.text }}>
                {highlightLine(line)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
