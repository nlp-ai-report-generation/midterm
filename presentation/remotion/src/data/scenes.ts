import { FPS } from './tokens';

export type SceneData = {
  id: string;
  narration: string;
  subtitles: string[];
  durationSec: number;
};

export const scenes: SceneData[] = [
  // 1. title — audio 5.4s
  {
    id: 'title',
    narration: 'AI Lecture Analysis Report Generator. Automating quality evaluation for online education at scale.',
    subtitles: ['AI 강의 분석 리포트 생성기.', '강의 품질 평가를 자동으로 수행합니다.'],
    durationSec: 6,
  },
  // 2. challenge — audio 10.2s
  {
    id: 'challenge',
    narration: 'Online bootcamp lectures generate thousands of hours of content every semester. But evaluating teaching quality manually takes time, introduces subjective bias, and simply does not scale.',
    subtitles: ['AXP에서는 매 학기 수십 개의 부트캠프 강의가 진행됩니다.', '그런데 사람이 직접 평가하면 시간이 오래 걸립니다.', '평가자마다 기준이 달라 점수가 들쭉날쭉하고,', '강의 수가 늘어나면 전부 다루기 어렵습니다.'],
    durationSec: 11,
  },
  // 3. data — audio 11.7s
  {
    id: 'data',
    narration: 'We start with fifteen STT-transcribed lecture scripts, spanning three weeks of instruction. Each file captures timestamps, speaker identities, and every spoken word across two hundred thousand lines of raw dialogue.',
    subtitles: ['STT로 변환한 강의 스크립트 15개가 있습니다.', '3주간의 수업 내용이 담겨 있습니다.', '타임스탬프와 화자 정보가 모두 포함되어 있고,', '원본 대화만 20만 줄이 넘습니다.'],
    durationSec: 12,
  },
  // 4. framework — audio 12.1s
  {
    id: 'framework',
    narration: 'Our evaluation framework defines eighteen criteria organized into five categories. Language expression quality. Lecture structure. Concept clarity. Example linkage. And student interaction. Each scored on a five-point scale.',
    subtitles: ['평가 기준은 5개 카테고리로 나뉩니다.', '그 안에 18개의 세부 항목이 있습니다.', '언어 표현, 강의 구조, 개념 설명,', '예제 연계, 학생 상호작용.', '각 항목은 1점에서 5점까지 채점합니다.'],
    durationSec: 13,
  },
  // 5. pipeline-overview — audio 12.6s
  {
    id: 'pipeline-overview',
    narration: 'Here is how it all comes together. A LangGraph-powered pipeline orchestrates the entire analysis. Raw transcripts enter the preprocessing node, flow through five parallel evaluation channels, and converge into a structured report.',
    subtitles: ['전체 구조는 이렇습니다.', 'LangGraph 파이프라인이 분석 전 과정을 관리합니다.', '스크립트가 전처리를 거치고,', '5개 평가 채널을 동시에 통과한 뒤,', '하나의 리포트로 합쳐집니다.'],
    durationSec: 13,
  },
  // 6. data-flow — audio 13.8s
  {
    id: 'data-flow',
    narration: 'Watch the data flow end to end. A raw transcript enters the system. The preprocessor chunks it into thirty-minute segments. Five evaluation nodes score it in parallel. The aggregator merges results. The calibrator adjusts. And a structured report emerges.',
    subtitles: ['데이터가 처음부터 끝까지 흐르는 과정을 봅니다.', '원본 스크립트가 들어가면 전처리기가 30분 단위로 자릅니다.', '5개 평가 노드가 동시에 채점하고,', '집계기가 결과를 합칩니다.', '보정을 거쳐 최종 리포트가 나옵니다.'],
    durationSec: 14,
  },
  // 7. preprocessing — audio 12.2s
  {
    id: 'preprocessing',
    narration: 'The preprocessor parses each transcript line by line. It extracts timestamps, identifies speakers by utterance count, and chunks content into thirty-minute windows with five-minute overlaps to preserve context at boundaries.',
    subtitles: ['전처리기가 스크립트를 줄 단위로 읽습니다.', '타임스탬프를 추출하고,', '발화 횟수로 주 화자를 식별합니다.', '30분 단위로 구간을 나누되,', '앞뒤 5분은 겹쳐서 맥락이 끊기지 않게 합니다.'],
    durationSec: 13,
  },
  // 8. parallel-eval — audio 13.2s
  {
    id: 'parallel-eval',
    narration: 'Five specialized evaluation nodes fire simultaneously, each analyzing a different quality dimension. GPT-4o-mini reads the chunked transcript, scores each criterion from one to five, and provides evidence-based reasoning with direct quotes.',
    subtitles: ['평가 노드 5개가 동시에 실행됩니다.', '각각 서로 다른 품질 항목을 분석합니다.', 'GPT-4o-mini가 잘린 스크립트를 읽고,', '항목마다 1~5점을 매기며,', '원문을 직접 인용해 근거를 제시합니다.'],
    durationSec: 14,
  },
  // 9. eval-closeup — audio 13.3s
  {
    id: 'eval-closeup',
    narration: "Let's zoom into one category: concept clarity. The model reads through the chunked transcript, identifies how the instructor defines each concept, and scores four items: definition quality, use of analogies, prerequisite checks, and speaking pace.",
    subtitles: ['한 카테고리를 자세히 들여다봅니다 — 개념 설명의 명확성.', '모델이 청크된 스크립트를 읽으면서', '강사가 개념을 어떻게 설명하는지 파악합니다.', '정의 품질, 비유 활용, 선행 개념 확인, 발화 속도', '네 가지 항목을 각각 채점합니다.'],
    durationSec: 14,
  },
  // 10. evidence-gen — audio 13.8s
  {
    id: 'evidence-gen',
    narration: 'For every score, the model must provide evidence. It highlights relevant passages from the original transcript and quotes them directly. If the instructor said "a component is like a Lego block," that exact quote becomes evidence for the analogy score.',
    subtitles: ['모든 점수에는 반드시 근거가 필요합니다.', '모델이 원본 스크립트에서 관련 구절을 찾아', '직접 인용합니다.', '"컴포넌트는 레고 블록 같은 거예요"', '이 문장이 비유 점수의 근거가 됩니다.'],
    durationSec: 14,
  },
  // 11. score-merge — audio 14.7s
  {
    id: 'score-merge',
    narration: 'Individual item scores flow into category averages using weighted aggregation. High-priority items like concept definition carry a weight of one point zero. Medium items like speaking pace carry zero point seven. The weighted average becomes the final category score.',
    subtitles: ['세부 항목 점수가 가중치를 거쳐 카테고리 점수로 합쳐집니다.', 'HIGH 항목은 가중치 1.0,', 'MEDIUM 항목은 0.7이 적용됩니다.', '가중 평균이 최종 카테고리 점수가 됩니다.'],
    durationSec: 15,
  },
  // 12. aggregation — audio 14.5s
  {
    id: 'aggregation',
    narration: 'The aggregator merges all parallel results and computes weighted category scores. An optional calibration node then adjusts for systematic bias. Finally, the report generator produces a structured analysis with strengths, improvements, and actionable recommendations.',
    subtitles: ['집계기가 5개 결과를 합칩니다.', '항목 중요도에 따라 가중 평균을 산출하고,', '점수가 한쪽으로 치우치면 보정합니다.', '마지막으로 리포트 생성기가', '강점, 개선점, 구체적인 제안을 정리합니다.'],
    durationSec: 15,
  },
  // 13. report-preview — audio 11.4s
  {
    id: 'report-preview',
    narration: 'The final report presents three sections: strengths that should be maintained, improvement areas with specific suggestions, and actionable next steps the instructor can apply immediately in their next lecture.',
    subtitles: ['최종 리포트는 세 가지로 구성됩니다.', '유지해야 할 강점,', '구체적인 개선 방향,', '다음 강의에서 바로 적용할 수 있는 제안.'],
    durationSec: 12,
  },
  // 14. hypothesis-cycle — audio 12.0s
  {
    id: 'hypothesis-cycle',
    narration: 'When ICC scores drop below threshold for specific criteria, we refine the evaluation prompt with clearer definitions and examples, then re-run the assessment. This iterative cycle steadily improves overall reliability.',
    subtitles: ['ICC가 기준에 미달하는 항목이 나오면,', '해당 항목의 평가 기준을 더 구체적으로 다시 작성합니다.', '그리고 다시 평가를 돌립니다.', '이 과정을 반복하면 전체 신뢰도가 올라갑니다.'],
    durationSec: 12,
  },
  // 15. role-access — audio 10.7s
  {
    id: 'role-access',
    narration: 'The system provides different views based on user roles. Operators see the full analysis suite including EDA, experiments, and validation. Instructors see only their own lecture scores and trends.',
    subtitles: ['운영자와 강사가 보는 화면이 다릅니다.', '운영자는 분석, 검증, 실험까지 모두 볼 수 있고,', '강사는 본인 강의의 점수와 추세만 확인합니다.'],
    durationSec: 11,
  },
  // 16. demo-dashboard — audio 11.1s
  {
    id: 'demo-dashboard',
    narration: 'The dashboard gives operators an instant overview. Overall scores, category breakdowns, and lecture-by-lecture trends are all visible at a glance. One click opens any individual lecture for deep analysis.',
    subtitles: ['대시보드를 열면 전체 현황이 바로 나타납니다.', '종합 점수, 카테고리별 분석,', '강의별 추세를 한눈에 확인할 수 있습니다.', '강의를 클릭하면 상세 분석으로 넘어갑니다.'],
    durationSec: 12,
  },
  // 17. demo-eda — audio 12.5s
  {
    id: 'demo-eda',
    narration: 'The exploratory data analysis page reveals patterns hidden in raw transcripts. Speaker distribution ratios, interaction frequency heatmaps, filler word density charts, and curriculum flow timelines, all interactive and filterable.',
    subtitles: ['탐색적 분석 페이지에서', '스크립트 속 패턴을 시각적으로 확인합니다.', '화자 비율, 상호작용 빈도,', '습관어 분포, 커리큘럼 흐름까지.', '모든 차트는 클릭과 필터가 가능합니다.'],
    durationSec: 13,
  },
  // 18. metrics-explain — audio 20.5s
  {
    id: 'metrics-explain',
    narration: "ICC measures test-retest reliability: if we score the same lecture three times, how similar are the results? A value above zero point seven five means consistent. Cohen's Kappa measures agreement between any two evaluations, adjusting for chance. Krippendorff's Alpha extends this to multiple evaluators. All three must pass their thresholds for the system to be trustworthy.",
    subtitles: ['ICC는 같은 강의를 여러 번 채점했을 때 점수가 얼마나 같은지 측정합니다.', '0.75 이상이면 신뢰할 수 있습니다.', "Cohen의 Kappa는 두 번의 평가가 우연이 아닌 실제 일치인지 확인합니다.", "Krippendorff의 Alpha는 여러 번의 평가 전체가 합의하는지 봅니다.", '세 지표 모두 기준을 통과해야 시스템을 신뢰할 수 있습니다.'],
    durationSec: 21,
  },
  // 19. demo-experiments — audio 11.8s
  {
    id: 'demo-experiments',
    narration: 'The experiments page tracks model comparisons across configurations. GPT-4o-mini, Claude Opus, Claude Sonnet, each tested with different temperature and chunking settings. ICC reliability scores validate consistency.',
    subtitles: ['실험 페이지에서 모델 간 비교를 확인합니다.', 'GPT-4o-mini, Claude Opus, Claude Sonnet,', '온도와 청크 크기를 바꿔가며 테스트했습니다.', 'ICC 점수로 결과의 일관성을 검증합니다.'],
    durationSec: 12,
  },
  // 20. demo-validation — audio 11.3s
  {
    id: 'demo-validation',
    narration: "Validation is where we prove the system works. Inter-rater reliability metrics including ICC, Cohens Kappa, and Krippendorffs Alpha confirm that automated evaluation scores are consistent and reproducible.",
    subtitles: ['검증 단계에서 시스템이 실제로 작동하는지 증명합니다.', 'ICC, Cohen의 Kappa,', 'Krippendorff의 Alpha를 사용하여', '같은 강의를 여러 번 평가해도', '점수가 동일하게 나오는지 확인합니다.'],
    durationSec: 12,
  },
  // 21. demo-trends — audio 13.1s
  {
    id: 'demo-trends',
    narration: 'The trends page tracks score changes over time as a time series. Each lecture gets a data point. Categories can be viewed individually. This reveals whether teaching quality is improving, declining, or staying consistent across the semester.',
    subtitles: ['점수 추이 페이지에서 시계열 변화를 추적합니다.', '강의마다 데이터 포인트가 찍힙니다.', '카테고리별로도 볼 수 있습니다.', '강의력이 나아지고 있는지, 일정한지 확인할 수 있습니다.'],
    durationSec: 14,
  },
  // 22. integrations — audio 9.2s
  {
    id: 'integrations',
    narration: 'Transcripts can be imported directly from Google Drive. Evaluation results export to Notion databases, creating a seamless workflow between analysis and documentation.',
    subtitles: ['Google Drive에서 스크립트를 바로 불러올 수 있습니다.', '평가 결과는 Notion 데이터베이스에 저장됩니다.', '분석부터 기록까지 하나의 흐름으로 연결됩니다.'],
    durationSec: 10,
  },
  // 23. techstack — audio 11.2s
  {
    id: 'techstack',
    narration: 'Built on a modern, production-ready stack. LangGraph orchestrates the evaluation pipeline. FastAPI serves the backend. React with Recharts powers the dashboard. And OpenAI provides the language intelligence.',
    subtitles: ['바로 운영할 수 있는 기술 스택으로 구축했습니다.', 'LangGraph가 파이프라인을 관리하고,', 'FastAPI가 백엔드를 담당합니다.', 'React와 Recharts로 대시보드를 구현하고,', 'OpenAI가 평가를 수행합니다.'],
    durationSec: 12,
  },
  // 24. closing — audio 6.8s
  {
    id: 'closing',
    narration: 'AI Lecture Analysis Report Generator. Transforming raw lecture transcripts into actionable teaching insights. Automatically.',
    subtitles: ['AI 강의 분석 리포트 생성기.', '녹취록 하나면 강의 리포트가 나옵니다.', '전부 자동입니다.'],
    durationSec: 7,
  },
];

export function getSceneTimings() {
  let currentFrame = 0;
  return scenes.map((scene) => {
    const startFrame = currentFrame;
    const durationInFrames = scene.durationSec * FPS;
    currentFrame += durationInFrames;
    return { ...scene, startFrame, durationInFrames };
  });
}

export function getTotalDuration() {
  return scenes.reduce((sum, s) => sum + s.durationSec * FPS, 0);
}
