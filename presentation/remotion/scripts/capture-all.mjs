import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.resolve(__dirname, '../public/assets');
const BASE = process.env.FRONTEND_URL || 'http://localhost:3004';
// Capture at content width only (no sidebar)
const VP = { width: 1920, height: 1080 };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function snap(page, name, scroll = 0) {
  if (scroll > 0) {
    await page.evaluate((s) => window.scrollTo(0, s), scroll);
    await wait(800);
  }
  // Force sidebar hidden + content full width via injected CSS
  await page.evaluate(() => {
    let style = document.getElementById('capture-override');
    if (!style) {
      style = document.createElement('style');
      style.id = 'capture-override';
      document.head.appendChild(style);
    }
    style.textContent = `
      aside, nav, [class*="sidebar"], [class*="Sidebar"] { display: none !important; width: 0 !important; min-width: 0 !important; }
      main, [class*="content"], [class*="Content"], [class*="layout"] > div:last-child,
      [class*="layout"] > div, body > div > div > div {
        margin-left: 0 !important;
        padding-left: 60px !important;
        padding-right: 60px !important;
        width: 100vw !important;
        max-width: 100vw !important;
        transform: none !important;
      }
    `;
  });
  await wait(500);
  await page.screenshot({ path: path.join(ASSETS, name) });
  console.log(`  ✓ ${name}`);
}

async function clickTab(page, label) {
  await page.evaluate((text) => {
    const els = document.querySelectorAll('button, [role="tab"], .tab-item');
    for (const el of els) { if (el.textContent?.trim().includes(text)) { el.click(); return; } }
  }, label);
  await wait(2000);
}

async function main() {
  console.log(`Capturing from ${BASE}\n`);
  const browser = await puppeteer.launch({ headless: 'new', defaultViewport: VP, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // Set operator role first
  await page.goto(BASE, { waitUntil: 'networkidle2' });
  await wait(1000);
  await page.evaluate(() => localStorage.setItem('lecture-analysis-role', 'operator'));

  // 1. Role select
  console.log('[1] Role select');
  await page.evaluate(() => localStorage.removeItem('lecture-analysis-role'));
  await page.goto(BASE, { waitUntil: 'networkidle2' });
  await wait(1000);
  await page.screenshot({ path: path.join(ASSETS, 'ui-role-select.png') });
  console.log('  ✓ ui-role-select.png');
  await page.evaluate(() => localStorage.setItem('lecture-analysis-role', 'operator'));

  // 2. Dashboard — top and scrolled
  console.log('[2] Dashboard');
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle2' });
  await wait(2500);
  await snap(page, 'ui-dashboard.png');
  await snap(page, 'ui-dashboard-scrolled.png', 500);

  // 3. EDA tabs
  console.log('[3] EDA tabs');
  await page.goto(`${BASE}/eda`, { waitUntil: 'networkidle2' });
  await wait(2500);
  await snap(page, 'ui-eda-overview.png');
  await clickTab(page, '화자 구성');
  await snap(page, 'ui-eda-speakers.png');
  await clickTab(page, '소통 빈도');
  await snap(page, 'ui-eda-interaction.png');
  await clickTab(page, '습관 표현');
  await snap(page, 'ui-eda-filler.png');

  // 4. Experiments
  console.log('[4] Experiments');
  await page.goto(`${BASE}/experiments`, { waitUntil: 'networkidle2' });
  await wait(2500);
  await snap(page, 'ui-experiments.png');

  // 5. Validation — scrolled to show charts
  console.log('[5] Validation');
  await page.goto(`${BASE}/validation`, { waitUntil: 'networkidle2' });
  await wait(2500);
  await snap(page, 'ui-validation-icc.png', 350);
  await snap(page, 'ui-validation-icc-detail.png', 750);
  await clickTab(page, '청크');
  await snap(page, 'ui-validation-chunk.png', 300);

  // 6. Trends
  console.log('[6] Trends');
  await page.goto(`${BASE}/trends`, { waitUntil: 'networkidle2' });
  await wait(2500);
  await snap(page, 'ui-trends.png');

  // 7. Integrations
  console.log('[7] Integrations');
  await page.goto(`${BASE}/integrations`, { waitUntil: 'networkidle2' });
  await wait(2500);
  await snap(page, 'ui-integrations.png');

  // 8. Lecture detail
  console.log('[8] Lecture detail');
  await page.goto(`${BASE}/lectures/2026-02-09`, { waitUntil: 'networkidle2' });
  await wait(2500);
  await snap(page, 'ui-lecture-detail.png');

  // 9. Instructor mode
  console.log('[9] Instructor mode');
  await page.evaluate(() => {
    localStorage.setItem('lecture-analysis-role', 'instructor');
    localStorage.setItem('lecture-analysis-instructor', '김영아');
  });
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle2' });
  await wait(2500);
  await snap(page, 'ui-instructor-dashboard.png');

  console.log('\n✅ All done!');
  await browser.close();
}

main();
