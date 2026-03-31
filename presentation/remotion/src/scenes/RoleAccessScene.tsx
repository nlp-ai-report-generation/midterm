import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { colors, fonts, appleEase } from '../data/tokens';
import { fadeIn, slideUp, stagger, cameraPan } from '../utils/animate';

export const RoleAccessScene: React.FC = () => {
  const frame = useCurrentFrame();
  const CLAMP = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
  const panX = cameraPan(frame, 360, 50);

  const operatorPages = ['대시보드', '강의 목록', 'EDA 분석', '점수 추이', '강의 비교', '항목 분석', '모델 비교', '신뢰성 검증', '평가 기준', '설정', '연동'];
  const instructorPages = ['대시보드', '내 강의', '점수 추이', '설정'];

  return (
    <AbsoluteFill style={{ justifyContent: 'center', padding: '0 80px' }}>
      <div style={{ transform: `translateX(${panX}px)`, display: 'flex', flexDirection: 'column', gap: 48, width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: fonts.main, fontSize: 15, fontWeight: 600, color: colors.primary, letterSpacing: 2, textTransform: 'uppercase' as const, opacity: fadeIn(frame, 0), marginBottom: 14 }}>역할 분기</div>
          <div style={{ fontFamily: fonts.main, fontSize: 44, fontWeight: 800, color: colors.text, letterSpacing: -1.5, opacity: fadeIn(frame, 5, 22), transform: `translateY(${slideUp(frame, 5, 20, 22)}px)` }}>
            운영자와 강사가 보는 화면이 다릅니다
          </div>
        </div>

        <div style={{ display: 'flex', gap: 80, width: '100%', justifyContent: 'center' }}>
          {/* Operator — pure text list */}
          <div style={{ flex: 1, opacity: fadeIn(frame, 120, 25), transform: `translateY(${slideUp(frame, 120, 16, 25)}px)` }}>
            <div style={{ fontFamily: fonts.main, fontSize: 24, fontWeight: 800, color: colors.text, marginBottom: 20 }}>운영자</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px' }}>
              {operatorPages.map((page, i) => (
                <div key={page} style={{ fontFamily: fonts.main, fontSize: 16, color: colors.textSecondary, opacity: fadeIn(frame, stagger(i, 130, 3)) }}>{page}</div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: 1, background: colors.border, alignSelf: 'stretch', opacity: fadeIn(frame, 160, 15) }} />

          {/* Instructor — pure text list */}
          <div style={{ flex: 1, opacity: fadeIn(frame, 240, 25), transform: `translateY(${slideUp(frame, 240, 16, 25)}px)` }}>
            <div style={{ fontFamily: fonts.main, fontSize: 24, fontWeight: 800, color: colors.text, marginBottom: 20 }}>강사</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px' }}>
              {instructorPages.map((page, i) => (
                <div key={page} style={{ fontFamily: fonts.main, fontSize: 16, color: colors.textSecondary, opacity: fadeIn(frame, stagger(i, 250, 5)) }}>{page}</div>
              ))}
            </div>
            <div style={{ fontFamily: fonts.main, fontSize: 14, color: colors.textMuted, marginTop: 16, opacity: fadeIn(frame, 280, 15) }}>본인 강의만 필터링되어 표시됩니다</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
