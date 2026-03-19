import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { colors, fonts } from '../data/tokens';
import { fadeIn, slideUp, scaleIn, cameraZoom } from '../utils/animate';

export const ClosingScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, transform: `scale(${cameraZoom(frame, 210, 0.04)})`, transformOrigin: 'center center' }}>
        {/* Orange square — no text */}
        <div style={{
          width: 56, height: 56, borderRadius: 16, background: colors.primary,
          opacity: fadeIn(frame, 0, 20), transform: `scale(${scaleIn(frame, 0, 20)})`,
        }} />

        <div style={{
          fontFamily: fonts.main, fontSize: 52, fontWeight: 800,
          color: colors.text, letterSpacing: -2, textAlign: 'center',
          opacity: fadeIn(frame, 8, 22),
          transform: `translateY(${slideUp(frame, 8, 24, 22)}px)`,
        }}>
          AI 강의 분석
        </div>

        <div style={{
          fontFamily: fonts.main, fontSize: 20, color: colors.textSecondary,
          opacity: fadeIn(frame, 18, 20), textAlign: 'center',
          maxWidth: 580, lineHeight: 1.6,
        }}>
          녹취록 하나면 강의 리포트가 나옵니다.
          <br />
          <span style={{ color: colors.primary, fontWeight: 700 }}>전부 자동입니다.</span>
        </div>

        <div style={{
          display: 'flex', gap: 20, marginTop: 16,
          fontFamily: fonts.main, fontSize: 14, color: colors.textMuted,
          opacity: fadeIn(frame, 28, 18),
        }}>
          <span>멋쟁이사자처럼</span>
          <span style={{ color: colors.textDim }}>·</span>
          <span>NLP 과제 1-2조</span>
          <span style={{ color: colors.textDim }}>·</span>
          <span>2026 중간평가</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
