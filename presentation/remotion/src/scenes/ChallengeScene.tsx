import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { colors, fonts, appleEase } from '../data/tokens';
import { fadeIn, slideUp, stagger, cameraPan, cameraZoom } from '../utils/animate';

export const ChallengeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const CLAMP = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
  const panY = cameraPan(frame, 360, 50);
  const zoom = cameraZoom(frame, 360, 0.05);

  return (
    <AbsoluteFill style={{ justifyContent: 'center', padding: '0 80px' }}>
      <div style={{ transform: `translateY(${panY}px) scale(${zoom})`, transformOrigin: 'center center', display: 'flex', flexDirection: 'column', gap: 48, width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: fonts.main, fontSize: 15, fontWeight: 600, color: colors.primary, letterSpacing: 2, textTransform: 'uppercase' as const, opacity: fadeIn(frame, 0), marginBottom: 14 }}>배경</div>
          <div style={{ fontFamily: fonts.main, fontSize: 50, fontWeight: 800, color: colors.text, letterSpacing: -2, lineHeight: 1.15, opacity: fadeIn(frame, 5, 22), transform: `translateY(${slideUp(frame, 5, 24, 22)}px)` }}>
            멋쟁이사자처럼 AXP에서는
            <br />
            수십 개의 부트캠프 강의가 동시에 진행됩니다
          </div>
        </div>

        {/* Stats — pure typography, no boxes */}
        <div style={{ display: 'flex', gap: 60, justifyContent: 'center', opacity: fadeIn(frame, 30, 25) }}>
          {[
            { value: '15', unit: '개', label: '분석 대상 강의' },
            { value: '22,756', unit: '줄', label: '총 발화량' },
            { value: '24', unit: '명', label: '화자 수' },
            { value: '3', unit: '주', label: '수업 기간' },
          ].map((s, i) => (
            <div key={s.label} style={{ textAlign: 'center', opacity: fadeIn(frame, stagger(i, 35, 6)) }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 2 }}>
                <span style={{ fontFamily: fonts.mono, fontSize: 48, fontWeight: 800, color: colors.text }}>{s.value}</span>
                <span style={{ fontFamily: fonts.main, fontSize: 18, fontWeight: 500, color: colors.textMuted }}>{s.unit}</span>
              </div>
              <div style={{ fontFamily: fonts.main, fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Problems — text only, no cards */}
        <div style={{ display: 'flex', gap: 80, justifyContent: 'center', opacity: fadeIn(frame, 100, 25) }}>
          {[
            { label: '시간이 오래 걸립니다', desc: '강의 하나를 평가하는 데 수 시간이 소요됩니다' },
            { label: '평가자마다 기준이 다릅니다', desc: '같은 강의도 누가 보느냐에 따라 점수가 달라집니다' },
            { label: '전부 다루기 어렵습니다', desc: '강의 수가 늘어나면 빠지는 강의가 생깁니다' },
          ].map((p, i) => (
            <div key={p.label} style={{ textAlign: 'center', maxWidth: 260, opacity: fadeIn(frame, stagger(i, 185, 10)), transform: `translateY(${slideUp(frame, stagger(i, 185, 10), 14, 20)}px)` }}>
              <div style={{ fontFamily: fonts.main, fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 8 }}>{p.label}</div>
              <div style={{ fontFamily: fonts.main, fontSize: 14, color: colors.textSecondary, lineHeight: 1.55 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
