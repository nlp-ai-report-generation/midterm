import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { colors, fonts } from '../data/tokens';
import { ScreenshotFrame } from '../components/ScreenshotFrame';
import { fadeIn, slideUp, cameraZoom } from '../utils/animate';

export const TrendsDemoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = cameraZoom(frame, 400, 0.06);

  return (
    <AbsoluteFill style={{ justifyContent: 'center', padding: '0 80px' }}>
      <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%' }}>
        <div style={{ textAlign: 'center', maxWidth: 700 }}>
          <div style={{ fontFamily: fonts.main, fontSize: 15, fontWeight: 600, color: colors.primary, letterSpacing: 2, textTransform: 'uppercase' as const, opacity: fadeIn(frame, 0), marginBottom: 10 }}>점수 추이</div>
          <div style={{ fontFamily: fonts.main, fontSize: 38, fontWeight: 800, color: colors.text, letterSpacing: -1, lineHeight: 1.2, opacity: fadeIn(frame, 4, 20), transform: `translateY(${slideUp(frame, 4, 20, 20)}px)` }}>
            카테고리별 점수 변화를 시계열로 추적합니다
          </div>
        </div>

        <ScreenshotFrame
          src="assets/ui-trends-full.png"
          title="localhost:3000/trends"
          delay={8}
          width={1400}
          height={780}
          animation="scrollDown"
          scrollDistance={500}
        />
      </div>
    </AbsoluteFill>
  );
};
