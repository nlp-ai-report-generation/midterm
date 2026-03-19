import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const scenes = [
  {
    id: 'title',
    text: 'AI Lecture Analysis Report Generator. Automating quality evaluation for online education at scale.',
  },
  {
    id: 'challenge',
    text: 'Online bootcamp lectures generate thousands of hours of content every semester. But evaluating teaching quality manually takes time, introduces subjective bias, and simply does not scale.',
  },
  {
    id: 'data',
    text: 'We start with fifteen STT-transcribed lecture scripts, spanning three weeks of instruction. Each file captures timestamps, speaker identities, and every spoken word across two hundred thousand lines of raw dialogue.',
  },
  {
    id: 'framework',
    text: 'Our evaluation framework defines eighteen criteria organized into five categories. Language expression quality. Lecture structure. Concept clarity. Example linkage. And student interaction. Each scored on a five-point scale.',
  },
  {
    id: 'pipeline-overview',
    text: "Here is how it all comes together. A LangGraph-powered pipeline orchestrates the entire analysis. Raw transcripts enter the preprocessing node, flow through five parallel evaluation channels, and converge into a structured report.",
  },
  {
    id: 'preprocessing',
    text: 'The preprocessor parses each transcript line by line. It extracts timestamps, identifies speakers by utterance count, and chunks content into thirty-minute windows with five-minute overlaps to preserve context at boundaries.',
  },
  {
    id: 'parallel-eval',
    text: 'Five specialized evaluation nodes fire simultaneously, each analyzing a different quality dimension. GPT-4o-mini reads the chunked transcript, scores each criterion from one to five, and provides evidence-based reasoning with direct quotes.',
  },
  {
    id: 'aggregation',
    text: 'The aggregator merges all parallel results and computes weighted category scores. An optional calibration node then adjusts for systematic bias. Finally, the report generator produces a structured analysis with strengths, improvements, and actionable recommendations.',
  },
  {
    id: 'demo-dashboard',
    text: 'The dashboard gives operators an instant overview. Overall scores, category breakdowns, and lecture-by-lecture trends are all visible at a glance. One click opens any individual lecture for deep analysis.',
  },
  {
    id: 'demo-eda',
    text: 'The exploratory data analysis page reveals patterns hidden in raw transcripts. Speaker distribution ratios, interaction frequency heatmaps, filler word density charts, and curriculum flow timelines, all interactive and filterable.',
  },
  {
    id: 'demo-experiments',
    text: 'The experiments page tracks model comparisons across configurations. GPT-4o-mini, Claude Opus, Claude Sonnet, each tested with different temperature and chunking settings. ICC reliability scores validate consistency.',
  },
  {
    id: 'demo-validation',
    text: "Validation is where we prove the system works. Inter-rater reliability metrics including ICC, Cohen's Kappa, and Krippendorff's Alpha confirm that automated evaluation scores are consistent and reproducible.",
  },
  {
    id: 'hypothesis-cycle',
    text: "When ICC scores drop below threshold for specific criteria, we refine the evaluation prompt with clearer definitions and examples, then re-run the assessment. This iterative cycle steadily improves overall reliability.",
  },
  {
    id: 'role-access',
    text: 'The system provides different views based on user roles. Operators see the full analysis suite including EDA, experiments, and validation. Instructors see only their own lecture scores and trends.',
  },
  {
    id: 'eval-closeup',
    text: "Let's zoom into one category: concept clarity. The model reads through the chunked transcript, identifies how the instructor defines each concept, and scores four items: definition quality, use of analogies, prerequisite checks, and speaking pace.",
  },
  {
    id: 'evidence-gen',
    text: 'For every score, the model must provide evidence. It highlights relevant passages from the original transcript and quotes them directly. If the instructor said "a component is like a Lego block," that exact quote becomes evidence for the analogy score.',
  },
  {
    id: 'score-merge',
    text: "Individual item scores flow into category averages using weighted aggregation. High-priority items like concept definition carry a weight of one point zero. Medium items like speaking pace carry zero point seven. The weighted average becomes the final category score.",
  },
  {
    id: 'report-preview',
    text: "The final report presents three sections: strengths that should be maintained, improvement areas with specific suggestions, and actionable next steps the instructor can apply immediately in their next lecture.",
  },
  {
    id: 'data-flow',
    text: "Watch the data flow end to end. A raw transcript enters the system. The preprocessor chunks it into thirty-minute segments. Five evaluation nodes score it in parallel. The aggregator merges results. The calibrator adjusts. And a structured report emerges.",
  },
  {
    id: 'metrics-explain',
    text: "ICC measures test-retest reliability: if we score the same lecture three times, how similar are the results? A value above zero point seven five means consistent. Cohen's Kappa measures agreement between any two evaluations, adjusting for chance. Krippendorff's Alpha extends this to multiple evaluators. All three must pass their thresholds for the system to be trustworthy.",
  },
  {
    id: 'demo-trends',
    text: 'The trends page tracks score changes over time as a time series. Each lecture gets a data point. Categories can be viewed individually. This reveals whether teaching quality is improving, declining, or staying consistent across the semester.',
  },
  {
    id: 'integrations',
    text: 'Transcripts can be imported directly from Google Drive. Evaluation results export to Notion databases, creating a seamless workflow between analysis and documentation.',
  },
  {
    id: 'techstack',
    text: 'Built on a modern, production-ready stack. LangGraph orchestrates the evaluation pipeline. FastAPI serves the backend. React with Recharts powers the dashboard. And OpenAI provides the language intelligence.',
  },
  {
    id: 'closing',
    text: 'AI Lecture Analysis Report Generator. Transforming raw lecture transcripts into actionable teaching insights. Automatically.',
  },
];

const AUDIO_DIR = path.resolve(__dirname, '../public/audio');

async function generateTTS() {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });

  console.log(`Generating TTS for ${scenes.length} scenes...`);

  for (const scene of scenes) {
    const outFile = path.join(AUDIO_DIR, `${scene.id}.mp3`);

    if (fs.existsSync(outFile)) {
      console.log(`  [skip] ${scene.id}.mp3 already exists`);
      continue;
    }

    console.log(`  [gen]  ${scene.id}.mp3 ...`);

    const response = await openai.audio.speech.create({
      model: 'tts-1-hd',
      voice: 'shimmer',
      input: scene.text,
      speed: 1.15,
      response_format: 'mp3',
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(outFile, buffer);
    console.log(`         → ${(buffer.length / 1024).toFixed(1)} KB`);
  }

  console.log('\nDone! All audio files saved to public/audio/');
}

generateTTS().catch((err) => {
  console.error('TTS generation failed:', err.message);
  process.exit(1);
});
