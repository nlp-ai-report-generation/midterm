import { interpolate, useCurrentFrame } from 'remotion';
import { colors, fonts, appleEase } from '../data/tokens';
import { fadeIn, stagger } from '../utils/animate';

type CycleStep = { label: string; sub?: string };
type CycleDiagramProps = { steps: CycleStep[]; delay?: number };

export const CycleDiagram: React.FC<CycleDiagramProps> = ({ steps, delay = 0 }) => {
  const frame = useCurrentFrame();
  const CLAMP = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
  const n = steps.length;

  // Rotating highlight across steps
  const rotateProgress = interpolate(frame - delay, [0, 300], [0, n], { easing: appleEase, ...CLAMP });
  const activeIdx = Math.floor(rotateProgress) % n;

  // Return arrow draw progress
  const returnArrowProgress = interpolate(frame - delay - 40, [0, 60], [0, 1], { easing: appleEase, ...CLAMP });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, width: '100%' }}>
      {/* Horizontal step flow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%' }}>
        {steps.map((step, i) => {
          const d = stagger(i, delay, 12);
          const isActive = i === activeIdx;

          return (
            <div
              key={step.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                flex: 1,
              }}
            >
              {/* Step */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  opacity: fadeIn(frame, d, 20),
                  transform: `scale(${isActive ? 1.05 : 1})`,
                  transition: 'transform 0.3s',
                }}
              >
                <div
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 13,
                    fontWeight: 700,
                    color: isActive ? colors.primary : colors.textDim,
                    letterSpacing: 1,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div
                  style={{
                    fontFamily: fonts.main,
                    fontSize: 18,
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? colors.text : colors.textSecondary,
                    textAlign: 'center',
                    lineHeight: 1.3,
                  }}
                >
                  {step.label}
                </div>
                {step.sub && (
                  <div
                    style={{
                      fontFamily: fonts.mono,
                      fontSize: 12,
                      color: isActive ? colors.primary : colors.textMuted,
                    }}
                  >
                    {step.sub}
                  </div>
                )}
              </div>

              {/* Arrow between steps */}
              {i < n - 1 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    opacity: fadeIn(frame, d + 8, 15),
                    flexShrink: 0,
                    padding: '0 4px',
                  }}
                >
                  <svg width="48" height="20" viewBox="0 0 48 20">
                    <line
                      x1="0" y1="10" x2="36" y2="10"
                      stroke={isActive ? colors.primary : colors.textDim}
                      strokeWidth="2"
                    />
                    <polygon
                      points="36,5 48,10 36,15"
                      fill={isActive ? colors.primary : colors.textDim}
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Return arrow — curved path from last step back to first */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', opacity: fadeIn(frame, delay + 30, 20) }}>
        <svg width="100%" height="40" viewBox="0 0 800 40" preserveAspectRatio="xMidYMid meet">
          <defs>
            <marker id="cycle-return-arrow" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={colors.primary} />
            </marker>
          </defs>
          <path
            d="M 700 5 Q 750 35, 400 35 Q 50 35, 100 5"
            fill="none"
            stroke={colors.primary}
            strokeWidth="2"
            strokeDasharray="600"
            strokeDashoffset={600 * (1 - returnArrowProgress)}
            markerEnd="url(#cycle-return-arrow)"
            opacity={0.6}
          />
          <text
            x="400" y="28"
            textAnchor="middle"
            fontFamily={fonts.mono}
            fontSize="11"
            fontWeight="600"
            fill={colors.primary}
            opacity={returnArrowProgress}
          >
            반복 개선
          </text>
        </svg>
      </div>
    </div>
  );
};
