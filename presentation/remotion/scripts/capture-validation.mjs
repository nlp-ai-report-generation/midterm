import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.resolve(__dirname, '../public/assets');
const BASE = 'http://localhost:3004';
const VP = { width: 1920, height: 1080 };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const browser = await puppeteer.launch({ headless: 'new', defaultViewport: VP, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // Navigate first, then set localStorage
  await page.goto(BASE, { waitUntil: 'networkidle2' });
  await wait(1000);
  await page.evaluate(() => localStorage.setItem('lecture-analysis-role', 'operator'));

  // 1. Validation ICC — scroll down to show ICC distribution + metric comparison
  console.log('[1] Validation ICC (scrolled)');
  await page.goto(`${BASE}/validation`, { waitUntil: 'networkidle2' });
  await wait(2500);
  await page.evaluate(() => window.scrollBy(0, 350));
  await wait(1000);
  await page.screenshot({ path: path.join(ASSETS, 'ui-validation-icc.png') });
  console.log('  ✓ ui-validation-icc.png');

  // 2. Validation ICC — further down for distribution
  await page.evaluate(() => window.scrollBy(0, 400));
  await wait(1000);
  await page.screenshot({ path: path.join(ASSETS, 'ui-validation-icc-detail.png') });
  console.log('  ✓ ui-validation-icc-detail.png');

  // 3. Validation Chunk tab
  console.log('[2] Validation Chunk');
  await page.goto(`${BASE}/validation`, { waitUntil: 'networkidle2' });
  await wait(2000);
  await page.evaluate((text) => {
    const els = document.querySelectorAll('button, [role="tab"], .tab-item');
    for (const el of els) { if (el.textContent?.trim().includes(text)) { el.click(); return; } }
  }, '청크');
  await wait(2000);
  await page.evaluate(() => window.scrollBy(0, 300));
  await wait(1000);
  await page.screenshot({ path: path.join(ASSETS, 'ui-validation-chunk.png') });
  console.log('  ✓ ui-validation-chunk.png');

  // 4. Trends page (시계열)
  console.log('[3] Trends (시계열)');
  await page.goto(`${BASE}/trends`, { waitUntil: 'networkidle2' });
  await wait(2500);
  await page.screenshot({ path: path.join(ASSETS, 'ui-trends.png') });
  console.log('  ✓ ui-trends.png');

  // 5. Dashboard scrolled further
  console.log('[4] Dashboard (scrolled)');
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle2' });
  await wait(2500);
  await page.evaluate(() => window.scrollBy(0, 500));
  await wait(1000);
  await page.screenshot({ path: path.join(ASSETS, 'ui-dashboard-scrolled.png') });
  console.log('  ✓ ui-dashboard-scrolled.png');

  console.log('\n✅ 완료');
  await browser.close();
}

main();
