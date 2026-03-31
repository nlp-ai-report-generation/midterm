import { AbsoluteFill, Sequence, staticFile } from 'remotion';
import { Audio } from '@remotion/media';
import { Background } from './components/Background';
import { Subtitle } from './components/Subtitle';
import { getSceneTimings } from './data/scenes';
import { FPS } from './data/tokens';

import { TitleScene } from './scenes/TitleScene';
import { ChallengeScene } from './scenes/ChallengeScene';
import { DataScene } from './scenes/DataScene';
import { FrameworkScene } from './scenes/FrameworkScene';
import { PipelineScene } from './scenes/PipelineScene';
import { PreprocessScene } from './scenes/PreprocessScene';
import { ParallelEvalScene } from './scenes/ParallelEvalScene';
import { AggregationScene } from './scenes/AggregationScene';
import { DataFlowScene } from './scenes/DataFlowScene';
import { EvalCloseupScene } from './scenes/EvalCloseupScene';
import { EvidenceGenScene } from './scenes/EvidenceGenScene';
import { ScoreMergeScene } from './scenes/ScoreMergeScene';
import { ReportPreviewScene } from './scenes/ReportPreviewScene';
import { HypothesisCycleScene } from './scenes/HypothesisCycleScene';
import { MetricsExplainScene } from './scenes/MetricsExplainScene';
import { TrendsDemoScene } from './scenes/TrendsDemoScene';
import { DemoScene } from './scenes/DemoScene';
import { RoleAccessScene } from './scenes/RoleAccessScene';
import { EDADemoScene } from './scenes/EDADemoScene';
import { TechStackScene } from './scenes/TechStackScene';
import { IntegrationsScene } from './scenes/IntegrationsScene';
import { ClosingScene } from './scenes/ClosingScene';

const sceneComponents: Record<string, React.FC> = {
  title: TitleScene,
  challenge: ChallengeScene,
  data: DataScene,
  framework: FrameworkScene,
  'pipeline-overview': PipelineScene,
  preprocessing: PreprocessScene,
  'data-flow': DataFlowScene,
  'parallel-eval': ParallelEvalScene,
  'eval-closeup': EvalCloseupScene,
  'evidence-gen': EvidenceGenScene,
  aggregation: AggregationScene,
  'score-merge': ScoreMergeScene,
  'report-preview': ReportPreviewScene,
  'hypothesis-cycle': HypothesisCycleScene,
  'demo-dashboard': () => (
    <DemoScene
      sectionLabel="대시보드"
      title="전체 강의 현황이 한 화면에 나타납니다"
      description="종합 점수와 카테고리별 분석, 강의별 추세를 확인하고 강의를 클릭하면 상세 리포트로 넘어갑니다."
      screenshotSrc="assets/ui-dashboard-full.png"
      screenshotTitle="localhost:3000/dashboard"
      animation="scrollDown"
      scrollDistance={300}
      features={[
        '종합 점수와 추세를 한눈에 확인',
        '카테고리별 레이더 차트',
        '강의 목록에서 점수 바로 확인',
        '클릭하면 개별 강의 상세 리포트',
      ]}
    />
  ),
  'role-access': RoleAccessScene,
  'demo-eda': EDADemoScene,
  'metrics-explain': MetricsExplainScene,
  'demo-experiments': () => (
    <DemoScene
      sectionLabel="실험"
      title="모델과 청크 크기를 바꿔가며 어떤 설정이 나은지 비교했습니다"
      description="30분 청크로 평가했을 때 15분보다 점수가 0.212점 높았고, 이 차이는 통계적으로 유의미합니다."
      screenshotSrc="assets/ui-experiments-full.png"
      screenshotTitle="localhost:3000/experiments"
      animation="scrollDown"
      scrollDistance={600}
      features={[
        'GPT-4o-mini, Claude Opus, Sonnet 비교',
        '30분 vs 15분 청크: 0.212점 차이',
        't(14) = 4.421, p < 0.001',
        "Cohen's d = 1.142 — 큰 효과 크기",
      ]}
    />
  ),
  'demo-validation': () => (
    <DemoScene
      sectionLabel="신뢰도 검증"
      title="같은 강의를 세 번 평가했을 때, 매번 거의 같은 점수가 나왔습니다"
      description="자동 평가의 일관성을 보장하기 위해 ICC, Kappa, Alpha로 검증했습니다."
      screenshotSrc="assets/ui-validation-icc-full.png"
      screenshotTitle="localhost:3000/validation"
      animation="scrollDown"
      scrollDistance={600}
      features={[
        'ICC 0.877 — 15개 중 13개가 신뢰 기준 통과',
        "Cohen's κ 0.883 — 세 번 평가 결과가 거의 일치",
        "Krippendorff's α 0.873 — 다중 평가자 기준 충족",
        'SSI 0.974 — 점수 변동이 거의 없음',
      ]}
    />
  ),
  'demo-trends': TrendsDemoScene,
  integrations: IntegrationsScene,
  techstack: TechStackScene,
  closing: ClosingScene,
};

export const MidtermPitchVideo: React.FC = () => {
  const timings = getSceneTimings();

  return (
    <AbsoluteFill>
      <Background />

      {timings.map((scene) => {
        const SceneComponent = sceneComponents[scene.id];
        if (!SceneComponent) return null;

        return (
          <Sequence
            key={scene.id}
            from={scene.startFrame}
            durationInFrames={scene.durationInFrames}
            premountFor={FPS}
          >
            <SceneComponent />
            <Subtitle lines={scene.subtitles} sceneDurationInFrames={scene.durationInFrames} />
          </Sequence>
        );
      })}

      {timings.map((scene) => (
        <Sequence
          key={`audio-${scene.id}`}
          from={scene.startFrame}
          durationInFrames={scene.durationInFrames}
          premountFor={10}
        >
          <Audio src={staticFile(`audio/${scene.id}.mp3`)} volume={1} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
