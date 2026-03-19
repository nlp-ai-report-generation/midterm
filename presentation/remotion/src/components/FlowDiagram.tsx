import { useCurrentFrame } from 'remotion';
import { colors, fonts } from '../data/tokens';
import { fadeIn, slideUp, slideRight, stagger } from '../utils/animate';

type FlowNode = {
  label: string;
  icon?: string;
  color?: string;
  sub?: string;
};

type FlowDiagramProps = {
  nodes: FlowNode[];
  delay?: number;
  direction?: 'horizontal' | 'vertical';
  nodeWidth?: number;
  nodeHeight?: number;
};

export const FlowDiagram: React.FC<FlowDiagramProps> = ({
  nodes,
  delay = 0,
  direction = 'horizontal',
  nodeWidth = 200,
  nodeHeight = 80,
}) => {
  const frame = useCurrentFrame();
  const isH = direction === 'horizontal';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isH ? 'row' : 'column',
        alignItems: 'center',
        gap: 0,
      }}
    >
      {nodes.map((node, i) => {
        const d = stagger(i, delay, 8);
        const opacity = fadeIn(frame, d);
        const translate = isH ? slideRight(frame, d, -20, 22) : slideUp(frame, d, 20, 22);

        const arrowD = stagger(i, delay + 4, 8);
        const arrowOpacity = fadeIn(frame, arrowD);

        return (
          <div
            key={`${node.label}-${i}`}
            style={{
              display: 'flex',
              flexDirection: isH ? 'row' : 'column',
              alignItems: 'center',
            }}
          >
            {i > 0 && (
              <div
                style={{
                  opacity: arrowOpacity,
                  color: colors.textDim,
                  fontSize: 20,
                  padding: isH ? '0 10px' : '6px 0',
                  fontFamily: fonts.mono,
                }}
              >
                {isH ? '→' : '↓'}
              </div>
            )}
            <div
              style={{
                width: nodeWidth,
                minHeight: nodeHeight,
                background: colors.bgSurface,
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 16px',
                opacity,
                transform: isH
                  ? `translateX(${translate}px)`
                  : `translateY(${translate}px)`,
              }}
            >
              {node.icon && <div style={{ fontSize: 26, marginBottom: 6 }}>{node.icon}</div>}
              <div
                style={{
                  fontFamily: fonts.main,
                  fontSize: 15,
                  fontWeight: 600,
                  color: colors.text,
                  textAlign: 'center',
                  lineHeight: 1.3,
                }}
              >
                {node.label}
              </div>
              {node.sub && (
                <div
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 11,
                    color: node.color || colors.primary,
                    marginTop: 4,
                    textAlign: 'center',
                  }}
                >
                  {node.sub}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
