import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { colors, fonts, appleEase } from '../data/tokens';
import { fadeIn, slideUp, stagger, cameraPan, cameraZoom } from '../utils/animate';

export const IntegrationsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const CLAMP = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
  const panX = cameraPan(frame, 330, 60);
  const zoom = cameraZoom(frame, 330, 0.05);

  // Motion graphic flow: Google Drive → 분석 시스템 → Notion
  const flowStages = [
    { name: 'Google Drive', desc: 'OAuth로 연결하고\n스크립트 .txt를 선택합니다', position: 'left' as const },
    { name: '분석 파이프라인', desc: '전처리 → 평가 → 집계\n자동으로 처리됩니다', position: 'center' as const },
    { name: 'Notion', desc: '평가 결과가\n데이터베이스에 자동 저장됩니다', position: 'right' as const },
  ];

  return (
    <AbsoluteFill style={{ justifyContent: 'center', padding: '0 80px' }}>
      <div style={{ transform: `translateX(${panX}px) scale(${zoom})`, transformOrigin: 'center center', display: 'flex', flexDirection: 'column', gap: 48, width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: fonts.main, fontSize: 15, fontWeight: 600, color: colors.primary, letterSpacing: 2, textTransform: 'uppercase' as const, opacity: fadeIn(frame, 0), marginBottom: 10 }}>연동</div>
          <div style={{ fontFamily: fonts.main, fontSize: 44, fontWeight: 800, color: colors.text, letterSpacing: -1.5, opacity: fadeIn(frame, 5, 22), transform: `translateY(${slideUp(frame, 5, 20, 22)}px)` }}>
            Google Drive에서 불러오고, Notion에 저장합니다
          </div>
        </div>

        {/* Flow: three stages connected by arrows */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, width: '100%' }}>
          {flowStages.map((stage, i) => {
            const d = stagger(i, 60, 60);
            const arrowProgress = i > 0 ? interpolate(frame - d + 30, [0, 20], [0, 1], { easing: appleEase, ...CLAMP }) : 0;

            return (
              <div key={stage.name} style={{ display: 'flex', alignItems: 'center' }}>
                {/* Arrow */}
                {i > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0 24px', opacity: arrowProgress }}>
                    <div style={{ width: 100, height: 2, background: colors.primary }} />
                    <div style={{ width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: `10px solid ${colors.primary}` }} />
                  </div>
                )}

                {/* Stage — text only */}
                <div style={{
                  flex: 1, textAlign: 'center',
                  opacity: fadeIn(frame, d, 25),
                  transform: `translateY(${slideUp(frame, d, 18, 25)}px)`,
                }}>
                  <div style={{ fontFamily: fonts.mono, fontSize: 24, fontWeight: 800, color: colors.text, marginBottom: 12 }}>{stage.name}</div>
                  <div style={{ fontFamily: fonts.main, fontSize: 15, color: colors.textSecondary, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{stage.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
