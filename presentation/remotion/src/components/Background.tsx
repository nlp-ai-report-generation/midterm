import { AbsoluteFill } from 'remotion';
import { colors } from '../data/tokens';

export const Background: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: colors.bg }}>
      {/* Subtle top-center radial for depth */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255, 107, 0, 0.03), transparent 70%)',
        }}
      />
    </AbsoluteFill>
  );
};
