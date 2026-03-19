import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { colors, fonts } from '../data/tokens';
import { fadeIn, slideUp, scaleIn, cameraZoom } from '../utils/animate';

export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, transform: `scale(${cameraZoom(frame, 180, 0.04)})`, transformOrigin: 'center center' }}>
        {/* Orange square — no text */}
        <div
          style={{
            width: 64, height: 64, borderRadius: 18,
            background: colors.primary,
            opacity: fadeIn(frame, 0, 22),
            transform: `scale(${scaleIn(frame, 0, 22)})`,
          }}
        />

        <div
          style={{
            textAlign: 'center',
            opacity: fadeIn(frame, 12, 22),
            transform: `translateY(${slideUp(frame, 12, 28, 22)}px)`,
          }}
        >
          <div style={{
            fontFamily: fonts.main, fontSize: 72, fontWeight: 800,
            color: colors.text, letterSpacing: -3, lineHeight: 1.05,
          }}>
            AI 강의 분석
          </div>
          <div style={{
            fontFamily: fonts.main, fontSize: 72, fontWeight: 800,
            color: colors.textSecondary, letterSpacing: -3, lineHeight: 1.05,
          }}>
            리포트 생성기
          </div>
        </div>

        <div style={{
          fontFamily: fonts.main, fontSize: 21, fontWeight: 400,
          color: colors.textMuted, letterSpacing: 0.3,
          opacity: fadeIn(frame, 24, 18),
        }}>
          부트캠프 강의 녹취록을 넣으면, 품질 리포트가 자동으로 나옵니다
        </div>
      </div>
    </AbsoluteFill>
  );
};
