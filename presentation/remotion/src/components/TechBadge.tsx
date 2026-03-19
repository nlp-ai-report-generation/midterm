import { useCurrentFrame } from 'remotion';
import { colors, fonts } from '../data/tokens';
import { fadeIn, scaleIn } from '../utils/animate';

type TechBadgeProps = {
  name: string;
  description: string;
  color: string;
  icon: string;
  delay?: number;
};

export const TechBadge: React.FC<TechBadgeProps> = ({
  name,
  description,
  color,
  icon,
  delay = 0,
}) => {
  const frame = useCurrentFrame();

  const opacity = fadeIn(frame, delay);
  const scale = scaleIn(frame, delay);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '18px 24px',
        opacity,
        transform: `scale(${scale})`,
        flex: 1,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: colors.bgSurface,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 26,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontFamily: fonts.main,
            fontSize: 18,
            fontWeight: 700,
            color: colors.text,
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontFamily: fonts.main,
            fontSize: 13,
            color: colors.textSecondary,
            marginTop: 2,
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
};
