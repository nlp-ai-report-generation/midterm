import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { colors, fonts, appleEase } from '../data/tokens';
import { fadeIn, slideUp, stagger, cameraPan } from '../utils/animate';

export const ReportPreviewScene: React.FC = () => {
  const frame = useCurrentFrame();
  const CLAMP = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
  const panX = cameraPan(frame, 390, 50);

  const sections = [
    {
      label: '강점', color: colors.green,
      items: [
        '레고 블록 비유로 컴포넌트 개념을 효과적으로 전달했습니다',
        '학습 진행 중 이해도를 자주 확인합니다 (분당 0.8회)',
        '예제 코드와 설명 사이의 전환이 자연스럽습니다',
      ],
    },
    {
      label: '개선점', color: colors.yellow,
      items: [
        '학습 목표를 수업 시작 시 명시적으로 안내하지 않았습니다',
        '"이제"가 분당 4.2회 반복됩니다 — 습관적 사용으로 보입니다',
        '코드 예제 후 실습 연결이 부족합니다',
      ],
    },
    {
      label: '제안', color: colors.blue,
      items: [
        '수업 시작 3분 안에 오늘 배울 내용을 요약해 주세요',
        '습관어 대신 짧은 침묵을 두면 학생 집중도가 올라갑니다',
        '예제 코드 직후 "직접 해보세요" 시간을 1분만 추가하세요',
      ],
    },
  ];

  return (
    <AbsoluteFill style={{ justifyContent: 'center', padding: '0 80px' }}>
      <div style={{ transform: `translateX(${panX}px)`, display: 'flex', flexDirection: 'column', gap: 32, width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: fonts.main, fontSize: 15, fontWeight: 600, color: colors.primary, letterSpacing: 2, textTransform: 'uppercase' as const, opacity: fadeIn(frame, 0), marginBottom: 10 }}>리포트 출력</div>
          <div style={{ fontFamily: fonts.main, fontSize: 42, fontWeight: 800, color: colors.text, letterSpacing: -1.5, opacity: fadeIn(frame, 5, 22), transform: `translateY(${slideUp(frame, 5, 20, 22)}px)` }}>
            강점, 개선점, 구체적인 제안까지 정리됩니다
          </div>
        </div>

        {/* Three sections — no boxes, just color accent on left + text */}
        <div style={{ display: 'flex', gap: 48, width: '100%' }}>
          {sections.map((section, si) => {
            const sd = stagger(si, 50, 90);
            return (
              <div key={section.label} style={{ flex: 1, opacity: fadeIn(frame, sd, 25), transform: `translateY(${slideUp(frame, sd, 16, 25)}px)` }}>
                <div style={{ fontFamily: fonts.main, fontSize: 22, fontWeight: 800, color: section.color, marginBottom: 16 }}>{section.label}</div>
                {section.items.map((item, ii) => {
                  const id = stagger(ii, sd + 20, 25);
                  return (
                    <div key={ii} style={{
                      fontFamily: fonts.main, fontSize: 14, color: colors.textSecondary,
                      lineHeight: 1.6, paddingLeft: 14,
                      borderLeft: `2px solid ${section.color}`,
                      marginBottom: 12,
                      opacity: fadeIn(frame, id, 18),
                    }}>{item}</div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Overall score */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 12, opacity: fadeIn(frame, 340, 20) }}>
          <span style={{ fontFamily: fonts.main, fontSize: 16, color: colors.textSecondary }}>2026-02-09 강의 종합 점수</span>
          <span style={{ fontFamily: fonts.mono, fontSize: 44, fontWeight: 800, color: colors.primary }}>3.24</span>
          <span style={{ fontFamily: fonts.mono, fontSize: 14, color: colors.textMuted }}>/5.0</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
