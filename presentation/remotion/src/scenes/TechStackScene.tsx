import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { colors, fonts } from '../data/tokens';
import { fadeIn, slideUp, stagger, cameraZoom } from '../utils/animate';

export const TechStackScene: React.FC = () => {
  const frame = useCurrentFrame();

  const layers = [
    {
      label: 'AI',
      items: [
        { name: 'OpenAI GPT-4o', desc: '스크립트를 읽고 항목별 점수를 매깁니다' },
      ],
    },
    {
      label: '파이프라인',
      items: [
        { name: 'LangGraph', desc: '전처리 → 평가 → 집계 → 리포트 전체를 조율합니다' },
        { name: 'Python + pandas', desc: 'ICC, Kappa 같은 통계 지표를 계산합니다' },
      ],
    },
    {
      label: '서버',
      items: [
        { name: 'FastAPI', desc: '프론트에서 평가 요청을 받아 처리합니다' },
        { name: 'Supabase', desc: 'Google 로그인과 역할 관리를 담당합니다' },
      ],
    },
    {
      label: '프론트',
      items: [
        { name: 'React + Recharts', desc: '점수, 차트, 리포트를 화면에 표시합니다' },
      ],
    },
  ];

  let globalIdx = 0;

  return (
    <AbsoluteFill style={{ justifyContent: 'center', padding: '0 80px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 36, width: '100%', transform: `scale(${cameraZoom(frame, 360, 0.05)})`, transformOrigin: 'center center' }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: fonts.main, fontSize: 15, fontWeight: 600,
            color: colors.primary, letterSpacing: 2, textTransform: 'uppercase' as const,
            opacity: fadeIn(frame, 0), marginBottom: 10,
          }}>기술 스택</div>
          <div style={{
            fontFamily: fonts.main, fontSize: 44, fontWeight: 800,
            color: colors.text, letterSpacing: -1.5,
            opacity: fadeIn(frame, 5, 22),
            transform: `translateY(${slideUp(frame, 5, 20, 22)}px)`,
          }}>
            지금 바로 운영할 수 있는 구조입니다
          </div>
        </div>

        {/* Layered architecture */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
          {layers.map((layer, li) => {
            const layerDelay = stagger(li, 30, 30);
            return (
              <div key={layer.label} style={{
                display: 'flex', alignItems: 'stretch', gap: 0,
                opacity: fadeIn(frame, layerDelay, 22),
                transform: `translateY(${slideUp(frame, layerDelay, 14, 22)}px)`,
              }}>
                {/* Layer label */}
                <div style={{
                  width: 100, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                  paddingRight: 20,
                }}>
                  <div style={{
                    fontFamily: fonts.mono, fontSize: 12, fontWeight: 700,
                    color: colors.textMuted, textTransform: 'uppercase' as const,
                    letterSpacing: 1,
                  }}>{layer.label}</div>
                </div>

                {/* Items in this layer */}
                <div style={{
                  flex: 1, display: 'flex', gap: 12,
                  borderLeft: `2px solid ${colors.border}`,
                  paddingLeft: 20,
                  paddingTop: 10, paddingBottom: 10,
                }}>
                  {layer.items.map((tech) => {
                    const idx = globalIdx++;
                    const d = stagger(idx, 35, 15);
                    return (
                      <div key={tech.name} style={{
                        flex: 1,
                        opacity: fadeIn(frame, d, 18),
                      }}>
                        <div style={{ fontFamily: fonts.mono, fontSize: 18, fontWeight: 800, color: colors.text }}>
                          {tech.name}
                        </div>
                        <div style={{ fontFamily: fonts.main, fontSize: 13, color: colors.textSecondary, marginTop: 4, lineHeight: 1.5 }}>
                          {tech.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
