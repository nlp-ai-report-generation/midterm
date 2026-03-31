import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { colors, fonts } from '../data/tokens';
import { fadeIn, slideUp, slideRight, stagger, cameraZoom } from '../utils/animate';

export const DataScene: React.FC = () => {
  const frame = useCurrentFrame();
  // 13s = 390f, 4 subtitles → ~97f per beat

  const metrics = [
    { label: '강의 스크립트', value: '15개' },
    { label: '대화 줄 수', value: '22,756줄' },
    { label: '화자', value: '24명' },
    { label: '기간', value: '3주' },
  ];

  const transcriptLines = [
    { time: '09:02:15', speaker: '김영아', text: '자, 오늘은 React 컴포넌트 구조를 알아보겠습니다.' },
    { time: '09:02:28', speaker: '김영아', text: '먼저 지난 시간에 배운 HTML, CSS를 간단히 복습하고,' },
    { time: '09:03:01', speaker: '김영아', text: '그다음에 React가 왜 필요한지 말씀드리겠습니다.' },
    { time: '09:03:15', speaker: '학생1', text: '네, 알겠습니다.' },
    { time: '09:03:22', speaker: '김영아', text: '좋습니다. 그럼 컴포넌트가 무엇인지부터...' },
  ];

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36, width: '100%', padding: '0 80px', transform: `scale(${cameraZoom(frame, 360, 0.05)})`, transformOrigin: 'center center' }}>
        {/* Header — Beat 1 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: fonts.main, fontSize: 15, fontWeight: 600,
            color: colors.primary, letterSpacing: 2, textTransform: 'uppercase' as const,
            opacity: fadeIn(frame, 0), marginBottom: 14,
          }}>데이터</div>
          <div style={{
            fontFamily: fonts.main, fontSize: 44, fontWeight: 800,
            color: colors.text, letterSpacing: -1.5, lineHeight: 1.2,
            opacity: fadeIn(frame, 5, 22),
            transform: `translateY(${slideUp(frame, 5, 24, 22)}px)`,
          }}>
            3주간 진행된 부트캠프 강의 15개를
            <br />
            STT로 텍스트화했습니다
          </div>
        </div>

        {/* Metrics — Beat 2 */}
        <div style={{ display: 'flex', gap: 48, justifyContent: 'center', opacity: fadeIn(frame, 30, 22) }}>
          {metrics.map((m, i) => (
            <div key={m.label} style={{ textAlign: 'center', opacity: fadeIn(frame, stagger(i, 35, 5)) }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 34, fontWeight: 800, color: colors.text }}>{m.value}</div>
              <div style={{ fontFamily: fonts.main, fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Transcript — Beat 3+4 */}
        <div style={{
          width: '100%', background: colors.bgSurface, border: `1px solid ${colors.border}`,
          borderRadius: 16, padding: '20px 28px',
          opacity: fadeIn(frame, 90, 22),
          transform: `translateY(${slideUp(frame, 90, 16, 22)}px)`,
        }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.textMuted, marginBottom: 14 }}>
            2026-02-09_kdt-backendj-21th.txt
          </div>
          {transcriptLines.map((line, i) => {
            const d = stagger(i, 100, 8);
            const isStudent = line.speaker !== '김영아';
            return (
              <div key={i} style={{
                display: 'flex', gap: 12, padding: '3px 0',
                fontFamily: fonts.mono, fontSize: 14, lineHeight: 1.6,
                opacity: fadeIn(frame, d),
                transform: `translateX(${slideRight(frame, d, -8, 16)}px)`,
              }}>
                <span style={{ color: colors.textDim, flexShrink: 0 }}>{line.time}</span>
                <span style={{ color: isStudent ? colors.blue : colors.primary, fontWeight: 600, flexShrink: 0, width: 48 }}>{line.speaker}</span>
                <span style={{ color: colors.text }}>{line.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
