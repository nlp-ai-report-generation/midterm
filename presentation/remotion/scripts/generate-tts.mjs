import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const remotionRoot = path.resolve(__dirname, "..");
const outlinePath = path.resolve(remotionRoot, "../content/outline.json");
const audioDir = path.resolve(remotionRoot, "public/audio");

const outline = JSON.parse(readFileSync(outlinePath, "utf8"));
mkdirSync(audioDir, { recursive: true });

// .env에서 키 로드
const envPath = path.resolve(remotionRoot, "../../.env");
let apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  try {
    const envContent = readFileSync(envPath, "utf8");
    const match = envContent.match(/OPENAI_API_KEY=(.+)/);
    if (match) apiKey = match[1].trim();
  } catch { /* ignore */ }
}

if (!apiKey) {
  console.error("OPENAI_API_KEY를 찾을 수 없어요. .env 파일이나 환경변수를 확인해주세요");
  process.exit(1);
}

const voice = "nova"; // 영어 나레이션에 적합한 목소리

for (const scene of outline.videoScenes) {
  const mp3Path = path.join(audioDir, `${scene.id}.mp3`);
  console.log(`[${scene.id}] TTS 생성 중...`);

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1-hd",
      voice,
      input: scene.narration,
      response_format: "mp3",
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error(`  실패: ${response.status} — ${err}`);
    continue;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(mp3Path, buffer);
  console.log(`  → ${mp3Path} (${(buffer.length / 1024).toFixed(0)}KB)`);
}

console.log(`\n${outline.videoScenes.length}개 나레이션 생성 완료! (voice: ${voice})`);
