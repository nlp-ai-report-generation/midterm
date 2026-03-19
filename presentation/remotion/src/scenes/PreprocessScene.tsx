import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { colors, fonts, appleEase } from '../data/tokens';
import { fadeIn, slideUp, stagger } from '../utils/animate';
import { CodeReveal } from '../components/CodeReveal';

const preprocessCode = `def preprocess(state):
    transcript = load_transcript(state["lecture_date"])

    # 줄마다 타임스탬프와 화자를 추출합니다
    lines = parse_lines(transcript)

    # 발화 횟수가 가장 많은 사람이 강사입니다
    main_speaker = max(speakers, key=lambda s: s.count)

    # 30분씩 자르고, 5분은 겹칩니다
    chunks = chunk_by_time(
        lines, window_minutes=30, overlap_minutes=5
    )
    return {"chunks": chunks, "main_speaker": main_speaker}`;

export const PreprocessScene: React.FC = () => {
  const frame = useCurrentFrame();
  // 13s = 390f, 5 subtitles → ~78f per beat
  const CLAMP = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

  const windows = [
    { start: '00:00', end: '30:00', offset: 0 },
    { start: '25:00', end: '55:00', offset: 25 },
    { start: '50:00', end: '80:00', offset: 50 },
  ];
  const windowColors = [colors.primary, colors.blue, colors.purple];

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, width: '100%', padding: '0 80px' }}>
        {/* Header — Beat 1 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: fonts.main, fontSize: 15, fontWeight: 600,
            color: colors.primary, letterSpacing: 2, textTransform: 'uppercase' as const,
            opacity: fadeIn(frame, 0), marginBottom: 14,
          }}>전처리</div>
          <div style={{
            fontFamily: fonts.main, fontSize: 42, fontWeight: 800,
            color: colors.text, letterSpacing: -1.5,
            opacity: fadeIn(frame, 5, 22),
            transform: `translateY(${slideUp(frame, 5, 24, 22)}px)`,
          }}>
            녹취록을 줄 단위로 읽어서 화자를 찾고, 30분 단위로 자릅니다
          </div>
        </div>

        <div style={{ display: 'flex', gap: 40, width: '100%', alignItems: 'flex-start' }}>
          {/* Sliding window — Beat 3~4 */}
          <div style={{ flex: 1, opacity: fadeIn(frame, 156, 22), padding: '20px 0' }}>
            <div style={{ fontFamily: fonts.main, fontSize: 15, fontWeight: 700, color: colors.text, marginBottom: 20 }}>
              30분씩 겹쳐가며 자릅니다
            </div>
            <div style={{ position: 'relative', height: 105, marginBottom: 12 }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: colors.border }} />
              {[0, 25, 50, 75, 100].map((pct) => (
                <div key={pct} style={{
                  position: 'absolute', top: -16, left: `${pct * 0.9}%`,
                  fontFamily: fonts.mono, fontSize: 10, color: colors.textDim,
                }}>{pct}분</div>
              ))}
              {windows.map((w, i) => {
                const d = stagger(i, 170, 15);
                // Slide from left instead of just fade
                const slideX = interpolate(frame - d, [0, 20], [-40, 0], { easing: appleEase, ...CLAMP });
                return (
                  <div key={i} style={{
                    position: 'absolute', top: 12 + i * 30, left: `${w.offset * 0.9}%`,
                    opacity: fadeIn(frame, d, 18),
                    transform: `translateX(${slideX}px)`,
                  }}>
                    <div style={{
                      width: 250, height: 22, borderRadius: 4,
                      background: `${windowColors[i]}10`, border: `1px solid ${windowColors[i]}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: fonts.mono, fontSize: 11, fontWeight: 600, color: windowColors[i],
                    }}>{w.start} — {w.end}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 20, fontFamily: fonts.mono, fontSize: 13, color: colors.textMuted }}>
              <span>윈도우 30분</span>
              <span style={{ color: colors.textDim }}>·</span>
              <span>오버랩 5분</span>
              <span style={{ color: colors.textDim }}>·</span>
              <span>스텝 25분</span>
            </div>
          </div>

          {/* Code — Beat 2 */}
          <div style={{ flex: 1, opacity: fadeIn(frame, 78, 25), transform: `translateY(${slideUp(frame, 78, 16, 25)}px)` }}>
            <CodeReveal code={preprocessCode} delay={85} fontSize={13} lineDelay={3} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
