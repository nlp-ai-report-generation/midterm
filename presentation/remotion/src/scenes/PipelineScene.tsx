import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { colors, fonts } from '../data/tokens';
import { fadeIn, slideUp, scaleIn, stagger, cameraZoom } from '../utils/animate';

export const PipelineScene: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = cameraZoom(frame, 390, 0.06);

  // 13s = 390f, 5 subtitles → 78f per beat
  // Beat 1 (0~78):   '전체 구조는 이렇습니다.'             → header
  // Beat 2 (78~156): 'LangGraph 파이프라인이 전 과정을...'  → Row 1 (스크립트 → 전처리)
  // Beat 3 (156~234): '스크립트가 전처리를 거치고,'          → connector + parallel label
  // Beat 4 (234~312): '5개 평가 채널을 동시에 통과한 뒤,'    → parallel categories
  // Beat 5 (312~390): '하나의 리포트로 합쳐집니다.'          → Row 3 (집계 → 보정 → 리포트)

  const categories = ['언어 표현', '강의 구조', '개념 설명', '예제 연계', '학생 소통'];

  return (
    <AbsoluteFill style={{ justifyContent: 'center', padding: '0 80px' }}>
      <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36, width: '100%' }}>
        {/* Header — Beat 1 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: fonts.main, fontSize: 15, fontWeight: 600, color: colors.primary, letterSpacing: 2, textTransform: 'uppercase' as const, opacity: fadeIn(frame, 0), marginBottom: 10 }}>작동 원리</div>
          <div style={{ fontFamily: fonts.main, fontSize: 44, fontWeight: 800, color: colors.text, letterSpacing: -1.5, opacity: fadeIn(frame, 5, 22), transform: `translateY(${slideUp(frame, 5, 20, 22)}px)` }}>
            스크립트가 들어가면 전처리, 평가, 집계를 거쳐 리포트가 됩니다
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
          {/* Row 1 — Beat 2 (78f~) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, opacity: fadeIn(frame, 78, 25) }}>
            <PNode label="강의 스크립트" sub=".txt 15개" delay={78} frame={frame} />
            <PArrow delay={90} frame={frame} />
            <PNode label="전처리" sub="줄 단위 파싱, 30분 청킹" delay={100} frame={frame} bold />
          </div>

          {/* Connector — Beat 3 (156f~) */}
          <div style={{ width: 2, height: 20, background: colors.border, opacity: fadeIn(frame, 156, 15) }} />

          {/* Parallel — Beat 3~4 (156f~312f) */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 20, padding: '16px 32px',
            borderRadius: 16,
            opacity: fadeIn(frame, 160, 22), position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
              background: colors.bg, padding: '0 12px',
              fontFamily: fonts.mono, fontSize: 11, fontWeight: 600, color: colors.primary,
            }}>동시 평가</div>
            {categories.map((cat, i) => {
              const d = stagger(i, 200, 15);
              return (
                <div key={cat} style={{
                  textAlign: 'center', width: 150,
                  opacity: fadeIn(frame, d, 18),
                  transform: `translateY(${slideUp(frame, d, 12, 18)}px)`,
                }}>
                  <div style={{ fontFamily: fonts.mono, fontSize: 14, fontWeight: 700, color: colors.primary, marginBottom: 4 }}>C{i + 1}</div>
                  <div style={{ fontFamily: fonts.main, fontSize: 16, fontWeight: 600, color: colors.text, lineHeight: 1.3 }}>{cat}</div>
                  <div style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.textMuted, marginTop: 3 }}>GPT-4o-mini</div>
                </div>
              );
            })}
          </div>

          {/* Connector — Beat 5 (312f~) */}
          <div style={{ width: 2, height: 20, background: colors.border, opacity: fadeIn(frame, 312, 15) }} />

          {/* Row 3 — Beat 5 (312f~) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, opacity: fadeIn(frame, 315, 25) }}>
            <PNode label="집계" sub="5개 결과 가중 평균" delay={315} frame={frame} bold />
            <PArrow delay={330} frame={frame} />
            <PNode label="보정" sub="점수 쏠림 교정" delay={340} frame={frame} />
            <PArrow delay={350} frame={frame} />
            <PNode label="리포트" sub="강점 · 개선점 · 제안" delay={355} frame={frame} bold />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const PNode: React.FC<{ label: string; sub: string; delay: number; frame: number; bold?: boolean }> = ({ label, sub, delay, frame, bold }) => (
  <div style={{
    textAlign: 'center', padding: '14px 24px', minWidth: 140,
    opacity: fadeIn(frame, delay, 18), transform: `scale(${scaleIn(frame, delay, 18)})`,
  }}>
    <div style={{ fontFamily: fonts.main, fontSize: 18, fontWeight: bold ? 800 : 600, color: colors.text, marginBottom: 3 }}>{label}</div>
    <div style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.textMuted }}>{sub}</div>
  </div>
);

const PArrow: React.FC<{ delay: number; frame: number }> = ({ delay, frame }) => (
  <div style={{ opacity: fadeIn(frame, delay, 12), display: 'flex', alignItems: 'center' }}>
    <div style={{ width: 32, height: 2, background: colors.textDim }} />
    <div style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: `8px solid ${colors.textDim}` }} />
  </div>
);
