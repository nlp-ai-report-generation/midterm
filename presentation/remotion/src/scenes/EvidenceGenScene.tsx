import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { colors, fonts, appleEase } from '../data/tokens';
import { fadeIn, slideUp, stagger, cameraZoom } from '../utils/animate';

export const EvidenceGenScene: React.FC = () => {
  const frame = useCurrentFrame();
  const CLAMP = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
  const zoom = cameraZoom(frame, 420, 0.07);

  const transcriptLines = [
    { time: '09:15:22', text: '자, React에서 컴포넌트란 뭘까요?', highlight: false },
    { time: '09:15:35', text: '컴포넌트는 레고 블록 같은 거예요.', highlight: true },
    { time: '09:15:48', text: '하나하나가 독립적이고, 조합하면 큰 화면이 됩니다.', highlight: true },
    { time: '09:16:02', text: '예를 들어 Header, Sidebar, Content가 각각 컴포넌트입니다.', highlight: false },
    { time: '09:16:15', text: '이걸 합치면 전체 페이지가 되는 거예요.', highlight: false },
  ];

  return (
    <AbsoluteFill style={{ justifyContent: 'center', padding: '0 80px' }}>
      <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', display: 'flex', flexDirection: 'column', gap: 32, width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: fonts.main, fontSize: 15, fontWeight: 600, color: colors.green, letterSpacing: 2, textTransform: 'uppercase' as const, opacity: fadeIn(frame, 0), marginBottom: 10 }}>근거 생성</div>
          <div style={{ fontFamily: fonts.main, fontSize: 42, fontWeight: 800, color: colors.text, letterSpacing: -1.5, opacity: fadeIn(frame, 5, 22), transform: `translateY(${slideUp(frame, 5, 20, 22)}px)` }}>
            원문에서 근거를 찾아 인용하고, 점수의 이유를 설명합니다
          </div>
        </div>

        <div style={{ display: 'flex', gap: 60, width: '100%' }}>
          {/* Left: Transcript — no box, just lines */}
          <div style={{ flex: 1, opacity: fadeIn(frame, 20, 25) }}>
            <div style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.textMuted, marginBottom: 16 }}>원본 스크립트</div>
            {transcriptLines.map((line, i) => {
              const d = stagger(i, 25, 18);
              const highlightProgress = line.highlight
                ? interpolate(frame - d - 30, [0, 15], [0, 1], { easing: appleEase, ...CLAMP })
                : 0;

              return (
                <div key={i} style={{
                  display: 'flex', gap: 12, padding: '8px 0',
                  borderLeft: line.highlight
                    ? `3px solid rgba(52, 199, 89, ${highlightProgress})`
                    : '3px solid transparent',
                  paddingLeft: 14,
                  opacity: fadeIn(frame, d, 18),
                }}>
                  <span style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.textDim, flexShrink: 0 }}>{line.time}</span>
                  <span style={{
                    fontFamily: fonts.main, fontSize: 16, lineHeight: 1.55,
                    color: line.highlight ? colors.text : colors.textSecondary,
                    fontWeight: line.highlight ? 600 : 400,
                  }}>{line.text}</span>
                </div>
              );
            })}
          </div>

          {/* Right: Evidence — no box, just structured text */}
          <div style={{ flex: 1, opacity: fadeIn(frame, 120, 25), transform: `translateY(${slideUp(frame, 120, 16, 25)}px)` }}>
            <div style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.textMuted, marginBottom: 16 }}>추출된 근거</div>

            {/* Item + Score */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
              <span style={{ fontFamily: fonts.mono, fontSize: 14, fontWeight: 600, color: colors.green }}>3.2 비유/예시 활용</span>
              <span style={{ fontFamily: fonts.mono, fontSize: 28, fontWeight: 800, color: colors.green, opacity: fadeIn(frame, 220, 15) }}>5/5</span>
            </div>

            {/* Quote — just borderLeft, no bg */}
            <div style={{
              fontFamily: fonts.main, fontSize: 16, color: colors.text,
              lineHeight: 1.65, fontStyle: 'italic',
              borderLeft: `3px solid ${colors.green}`,
              paddingLeft: 16, marginBottom: 20,
              opacity: fadeIn(frame, 240, 20),
            }}>
              "컴포넌트는 레고 블록 같은 거예요. 하나하나가 독립적이고, 조합하면 큰 화면이 됩니다."
            </div>

            {/* Reasoning */}
            <div style={{ opacity: fadeIn(frame, 280, 20) }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.green, fontWeight: 600, marginBottom: 6 }}>판단 근거</div>
              <div style={{ fontFamily: fonts.main, fontSize: 14, color: colors.textSecondary, lineHeight: 1.55 }}>
                레고 블록 비유로 컴포넌트의 독립성과 조합 가능성을 직관적으로 전달했습니다.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
