import { useCurrentFrame } from 'remotion';
import { colors, fonts } from '../data/tokens';
import { fadeIn, slideUp, scaleIn, stagger } from '../utils/animate';

type MetricCardProps = {
  icon: string;
  label: string;
  value: string;
  color?: string;
  delay?: number;
  width?: number;
};

export const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  label,
  value,
  color = colors.primary,
  delay = 0,
}) => {
  const frame = useCurrentFrame();

  const opacity = fadeIn(frame, delay);
  const translateY = slideUp(frame, delay);

  return (
    <div
      style={{
        flex: 1,
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div style={{ fontSize: 30 }}>{icon}</div>
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 32,
          fontWeight: 700,
          color,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: fonts.main,
          fontSize: 14,
          color: colors.textSecondary,
          lineHeight: 1.4,
        }}
      >
        {label}
      </div>
    </div>
  );
};

type CategoryCardProps = {
  number: number;
  title: string;
  items: string[];
  color: string;
  delay?: number;
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  number,
  title,
  items,
  color,
  delay = 0,
}) => {
  const frame = useCurrentFrame();

  const opacity = fadeIn(frame, delay);
  const translateY = slideUp(frame, delay);

  return (
    <div
      style={{
        flex: 1,
        padding: '22px',
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: colors.bgSurface,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: fonts.mono,
            fontSize: 15,
            fontWeight: 700,
            color,
          }}
        >
          {number}
        </div>
        <div
          style={{
            fontFamily: fonts.main,
            fontSize: 16,
            fontWeight: 600,
            color: colors.text,
          }}
        >
          {title}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((item, i) => {
          const itemDelay = stagger(i, delay + 8, 4);
          const iop = fadeIn(frame, itemDelay);
          return (
            <div
              key={i}
              style={{
                fontFamily: fonts.main,
                fontSize: 13,
                color: colors.textSecondary,
                opacity: iop,
                paddingLeft: 14,
                position: 'relative',
                lineHeight: 1.5,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  color: colors.primary,
                  fontSize: 8,
                  top: 5,
                }}
              >
                ●
              </span>
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
};
