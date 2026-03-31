import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { colors, fonts } from '../data/tokens';
import { ScreenshotFrame } from '../components/ScreenshotFrame';
import { fadeIn, slideUp, stagger, cameraPan, cameraZoom } from '../utils/animate';

export const AggregationScene: React.FC = () => {
  const frame = useCurrentFrame();
  const panY = cameraPan(frame, 450, 50);
  const zoom = cameraZoom(frame, 450, 0.05);

  // 15s = 450f, 5 subtitles → 90f per beat
  // Beat 1 (0~90): 집계기가 5개 결과를 합칩니다
  // Beat 2 (90~180): 항목 중요도에 따라 가중 평균
  // Beat 3 (180~270): 점수 보정
  // Beat 4 (270~360): 리포트 생성기가
  // Beat 5 (360~450): 강점, 개선점, 제안

  const steps = [
    { num: '01', label: '결과 병합', desc: '5개 카테고리 점수를 하나로 합칩니다' },
    { num: '02', label: '가중 평균', desc: 'HIGH 1.0 · MED 0.7 · LOW 0.4' },
    { num: '03', label: '점수 보정', desc: '한쪽으로 치우치면 교정합니다' },
    { num: '04', label: '리포트 작성', desc: '강점 · 개선점 · 제안을 정리합니다' },
  ];

  return (
    <AbsoluteFill style={{ justifyContent: 'center', padding: '0 80px' }}>
      <div style={{
        transform: `translateY(${panY}px) scale(${zoom})`,
        transformOrigin: 'center center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, width: '100%',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: fonts.main, fontSize: 15, fontWeight: 600, color: colors.primary, letterSpacing: 2, textTransform: 'uppercase' as const, opacity: fadeIn(frame, 0), marginBottom: 10 }}>집계</div>
          <div style={{ fontFamily: fonts.main, fontSize: 42, fontWeight: 800, color: colors.text, letterSpacing: -1.5, opacity: fadeIn(frame, 5, 22), transform: `translateY(${slideUp(frame, 5, 20, 22)}px)` }}>
            카테고리 점수를 합치고, 보정하고, 리포트를 작성합니다
          </div>
        </div>

        {/* Steps — horizontal, centered — Beat 1~2 */}
        <div style={{ display: 'flex', gap: 48, justifyContent: 'center', width: '100%' }}>
          {steps.map((s, i) => {
            const d = stagger(i, 20, 35);
            return (
              <div key={s.num} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                opacity: fadeIn(frame, d, 22),
                transform: `translateY(${slideUp(frame, d, 14, 22)}px)`,
              }}>
                <div style={{ fontFamily: fonts.mono, fontSize: 13, fontWeight: 700, color: colors.primary }}>{s.num}</div>
                <div style={{ fontFamily: fonts.main, fontSize: 17, fontWeight: 800, color: colors.text }}>{s.label}</div>
                <div style={{ fontFamily: fonts.main, fontSize: 13, color: colors.textSecondary, textAlign: 'center' }}>{s.desc}</div>
              </div>
            );
          })}
        </div>

        {/* Report screenshot — Beat 3~5, scrolls down to reveal report content */}
        <ScreenshotFrame
          src="assets/ui-lecture-detail-full.png"
          title="localhost:3000/lectures/front-end-programming"
          delay={160}
          width={1100}
          height={520}
          animation="scrollDown"
          scrollDistance={600}
        />
      </div>
    </AbsoluteFill>
  );
};
