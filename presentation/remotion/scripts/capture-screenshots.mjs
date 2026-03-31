import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.resolve(__dirname, '../public/assets');
const BASE = process.env.FRONTEND_URL || 'http://localhost:3003';
const VP = { width: 1920, height: 1080 };

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function snap(page, name) {
  await page.screenshot({ path: path.join(ASSETS_DIR, name) });
  console.log(`  ✓ ${name}`);
}

async function clickTab(page, label) {
  // Find and click tab/button by text content
  await page.evaluate((text) => {
    const els = document.querySelectorAll('button, [role="tab"], .tab-item');
    for (const el of els) {
      if (el.textContent?.trim().includes(text)) {
        el.click();
        return true;
      }
    }
    return false;
  }, label);
  await wait(2000);
}

async function setOperator(page) {
  await page.evaluate(() => {
    localStorage.setItem('lecture-analysis-role', 'operator');
  });
}

async function setInstructor(page) {
  await page.evaluate(() => {
    localStorage.setItem('lecture-analysis-role', 'instructor');
    localStorage.setItem('lecture-analysis-instructor', '김영아');
  });
}

async function main() {
  console.log(`Capturing from ${BASE}\n`);
  const browser = await puppeteer.launch({ headless: 'new', defaultViewport: VP, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  try {
    // 1. 역할 선택 화면 (인증 전)
    console.log('[1] 역할 선택');
    await page.goto(BASE, { waitUntil: 'networkidle2' });
    await wait(1000);
    await snap(page, 'ui-role-select.png');

    // 2. 운영자 모드 — 대시보드
    console.log('[2] 대시보드');
    await setOperator(page);
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle2' });
    await wait(2500);
    await snap(page, 'ui-dashboard.png');

    // 3. EDA 탭들
    console.log('[3] EDA 탭');
    await page.goto(`${BASE}/eda`, { waitUntil: 'networkidle2' });
    await wait(2500);
    await snap(page, 'ui-eda-overview.png');

    await clickTab(page, '화자 구성');
    await snap(page, 'ui-eda-speakers.png');

    await clickTab(page, '소통 빈도');
    await snap(page, 'ui-eda-interaction.png');

    await clickTab(page, '습관 표현');
    await snap(page, 'ui-eda-filler.png');

    // 4. 실험
    console.log('[4] 실험');
    await page.goto(`${BASE}/experiments`, { waitUntil: 'networkidle2' });
    await wait(2500);
    await snap(page, 'ui-experiments.png');

    // 5. 검증 — 일관성 탭
    console.log('[5] 검증');
    await page.goto(`${BASE}/validation`, { waitUntil: 'networkidle2' });
    await wait(2500);
    await snap(page, 'ui-validation-icc.png');

    await clickTab(page, '청크');
    await snap(page, 'ui-validation-chunk.png');

    // 6. 연동
    console.log('[6] 연동');
    await page.goto(`${BASE}/integrations`, { waitUntil: 'networkidle2' });
    await wait(2500);
    await snap(page, 'ui-integrations.png');

    // 7. 강의 상세
    console.log('[7] 강의 상세');
    await page.goto(`${BASE}/lectures/2026-02-09`, { waitUntil: 'networkidle2' });
    await wait(2500);
    await snap(page, 'ui-lecture-detail.png');

    // 8. 강사 모드 — 대시보드
    console.log('[8] 강사 모드');
    await setInstructor(page);
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle2' });
    await wait(2500);
    await snap(page, 'ui-instructor-dashboard.png');

    console.log('\n✅ 완료!');
  } catch (err) {
    console.error('실패:', err.message);
  } finally {
    await browser.close();
  }
}

main();
