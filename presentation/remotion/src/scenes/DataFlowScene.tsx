import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { colors, fonts, appleEase } from '../data/tokens';
import { fadeIn, slideUp, cameraZoom } from '../utils/animate';

export const DataFlowScene: React.FC = () => {
  const frame = useCurrentFrame();
  const CLAMP = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
  const zoom = cameraZoom(frame, 420, 0.06);

  const stageColors = [colors.primary, colors.blue, colors.purple, colors.cyan, colors.green, colors.yellow];

  const stages = [
    { label: '녹취록', sub: '.txt 입력', desc: '원본 스크립트 22,756줄을 읽어들입니다' },
    { label: '전처리', sub: '30분 청킹', desc: '전처리기가 30분 단위로 자릅니다' },
    { label: '병렬 평가', sub: '5개 동시', desc: '5개 평가 노드가 동시에 채점합니다' },
    { label: '집계', sub: '가중 평균', desc: '집계기가 결과를 합칩니다' },
    { label: '보정', sub: 'ICC 교정', desc: 'ICC 기반으로 편향된 점수를 보정합니다' },
    { label: '리포트', sub: '강점 · 개선점', desc: '최종 리포트가 완성됩니다' },
  ];

  // 14s = 420f, 5 subtitles → 84f per beat
  // Beat 1 (0~84):   header + stage 1 (녹취록)
  // Beat 2 (84~168):  stage 1→2 (스크립트→전처리)
  // Beat 3 (168~252): stage 3 (병렬 평가)
  // Beat 4 (252~336): stage 4 (집계)
  // Beat 5 (336~420): stage 5→6 (보정→리포트)

  // Map frame to current stage, synced with subtitles
  const stageBreaks = [0, 84, 168, 252, 336, 378]; // frame where each stage starts
  let currentStage = 0;
  for (let i = stageBreaks.length - 1; i >= 0; i--) {
    if (frame >= stageBreaks[i]) { currentStage = i; break; }
  }

  // Even distribution across 1760px usable width (1920 - 2*80)
  const stageX = (i: number) => 80 + i * (1760 / 5);

  // Smooth dot interpolation synced with subtitle beats
  const dotX = interpolate(frame,
    stageBreaks.concat([420]),
    [stageX(0), stageX(1), stageX(2), stageX(3), stageX(4), stageX(5), stageX(5)],
    { easing: appleEase, ...CLAMP });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', padding: '0 80px' }}>
      <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', display: 'flex', flexDirection: 'column', gap: 48, width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: fonts.main, fontSize: 15, fontWeight: 600, color: colors.primary, letterSpacing: 2, textTransform: 'uppercase' as const, opacity: fadeIn(frame, 0), marginBottom: 10 }}>전체 흐름</div>
          <div style={{ fontFamily: fonts.main, fontSize: 42, fontWeight: 800, color: colors.text, letterSpacing: -1.5, opacity: fadeIn(frame, 5, 22), transform: `translateY(${slideUp(frame, 5, 20, 22)}px)` }}>
            데이터가 처음부터 끝까지 흐르는 과정입니다
          </div>
        </div>

        <div style={{ position: 'relative', height: 160, width: '100%' }}>
          {/* Connection line */}
          <div style={{
            position: 'absolute', top: 18, left: stageX(0), width: stageX(5) - stageX(0),
            height: 3, background: colors.borderLight, opacity: fadeIn(frame, 15, 20),
          }} />

          {/* Progress line — fills up to current dot position */}
          <div style={{
            position: 'absolute', top: 18, left: stageX(0),
            width: Math.max(0, dotX - stageX(0)),
            height: 3, background: colors.primary, opacity: fadeIn(frame, 20, 10),
          }} />

          {/* Flowing dot — smooth interpolation */}
          <div style={{
            position: 'absolute', top: 12,
            left: dotX - 6,
            width: 12, height: 12, borderRadius: 6,
            background: colors.primary, opacity: fadeIn(frame, 20, 10),
          }} />

          {/* Stages */}
          {stages.map((stage, i) => {
            const isActive = i <= currentStage;
            const isCurrent = i === currentStage;
            return (
              <div key={stage.label} style={{
                position: 'absolute', left: stageX(i) - 80, top: 0,
                width: 160, textAlign: 'center',
                opacity: fadeIn(frame, 15 + i * 6, 20),
              }}>
                <div style={{
                  fontFamily: fonts.mono, fontSize: 28, fontWeight: 800,
                  color: isCurrent ? stageColors[i] : isActive ? colors.text : colors.textDim,
                  marginBottom: 8,
                }}>{i + 1}</div>
                <div style={{
                  fontFamily: fonts.main, fontSize: 16, fontWeight: isCurrent ? 800 : 700,
                  color: isActive ? colors.text : colors.textMuted,
                }}>{stage.label}</div>
                <div style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted, marginTop: 3 }}>{stage.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Current stage description — synced with subtitles */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 12, color: stageColors[currentStage], fontWeight: 600, marginBottom: 8 }}>현재 단계</div>
          <div style={{ fontFamily: fonts.main, fontSize: 18, color: colors.text, fontWeight: 600, maxWidth: 700, margin: '0 auto' }}>
            {stages[currentStage].desc}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
