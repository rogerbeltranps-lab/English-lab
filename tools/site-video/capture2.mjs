// Second round of screen captures for the "How English Lab works" video (see capture.mjs for the rules: tester account,
// a group's student view, look only: nothing is sent, saved, checked or submitted).
// Usage: EL_TESTER_PASSWORD=... node tools/site-video/capture2.mjs [outdir]
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const BASE = (process.env.EL_BASE || 'https://rogerbeltranps-lab.github.io/English-lab/').replace(/\/?$/, '/');
const PASS = process.env.EL_TESTER_PASSWORD;
if (!PASS) { console.error('Set EL_TESTER_PASSWORD'); process.exit(1); }
const OUT = path.resolve(process.argv[2] || 'tools/site-video/captures');
fs.mkdirSync(OUT, { recursive: true });
const log = [];
const note = (s) => { console.log(s); log.push(s); };

const browser = await chromium.launch(process.env.EL_CHANNEL ? { channel: process.env.EL_CHANNEL } : {});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5, locale: 'en-GB' });
const page = await ctx.newPage();
page.setDefaultTimeout(15000);

async function clean() {
  await page.evaluate(() => {
    document.querySelectorAll('#el-banner').forEach((b) => { if (/^Test account/.test(b.textContent)) b.remove(); });
    const bar = document.getElementById('el-cloud-bar');
    if (bar) {
      bar.querySelectorAll('select').forEach((s) => (s.style.display = 'none'));
      for (const n of [...bar.childNodes]) if (n.nodeType === 3 && /Beltran|Roger/.test(n.textContent)) n.textContent = 'Your name ';
    }
    // the LS1 exam-results card: "Later" (remembered in this tab only)
    [...document.querySelectorAll('button')].filter((b) => /^(Més tard|Later)$/.test(b.textContent.trim())).forEach((b) => b.click());
  }).catch(() => {});
}
async function settle(ms = 2500) { await page.waitForLoadState('networkidle').catch(() => {}); await page.waitForTimeout(ms); await clean(); }
async function shot(name, full = false) {
  await clean();
  const f = path.join(OUT, name + (full ? '.full.jpg' : '.png'));
  await page.screenshot(full ? { path: f, fullPage: true, type: 'jpeg', quality: 85 } : { path: f });
  note('shot ' + path.basename(f));
}
async function step(label, fn) { try { await fn(); } catch (e) { note('SKIPPED ' + label + ': ' + e.message.split('\n')[0]); } }
async function view(group) {
  await page.evaluate((g) => Storage.prototype.setItem.call(localStorage, 'el_view', g), group);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await settle(4000);
}

// Sign in from the home page.
await page.goto(BASE + 'index.html', { waitUntil: 'domcontentloaded' });
await settle();
await page.locator('#el-cloud-bar button', { hasText: 'Sign in' }).click();
await page.fill('input[name=email]', 'roger.beltran@ietramuntana.cat');
await page.fill('input[name=password]', PASS);
await page.locator('button[type=submit]').click();
await page.waitForURL(/today\.html/, { timeout: 30000 }).catch(() => note('no redirect to the board after sign-in'));
await settle(3000);
await view('4ESOA');

// Board: the criteria summary tab, then the My week window.
await page.goto(BASE + 'today.html', { waitUntil: 'domcontentloaded' });
await settle(4000);
await step('criteria summary', async () => {
  await page.locator('[data-v="sum"]').click();
  await page.waitForTimeout(800);
  await page.locator('[data-v="sum"]').scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -120));
  await shot('4eso-15-board-criteria-summary');
  await shot('4eso-15-board-criteria-summary', true);
  await page.locator('[data-v="lp"]').click();
});
await step('my week window on the board', async () => {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator('#el-todo-btn').click();
  await page.waitForTimeout(800);
  await shot('4eso-16-my-week-window');
  await page.locator('#el-todo-btn').click();
});

// LS page tabs (Overview, Learning Path, Language & Knowledge, Final Product).
await page.goto(BASE + '4eso/seasons-and-celebrations/index.html', { waitUntil: 'domcontentloaded' });
await settle();
for (const [i, t] of ['learning-path', 'language', 'final'].entries()) {
  await step('LS tab ' + t, async () => {
    await page.locator(`label[for="tab-${t}"]`).click();
    await page.waitForTimeout(600);
    await page.locator(`label[for="tab-${t}"]`).scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -80));
    await shot(`4eso-3${i + 3}-ls-tab-${t}`);
    await shot(`4eso-3${i + 3}-ls-tab-${t}`, true);
  });
}

// A learning path: the step tabs, a step's instruction and "80 % to complete", the end of a step, and the My week window.
await page.goto(BASE + '4eso/seasons-and-celebrations/celebrations-around-the-world.html', { waitUntil: 'domcontentloaded' });
await settle();
await step('LP step tabs', async () => {
  const tabs = page.locator('.tabs .tab');
  await tabs.first().scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -160));
  await shot('4eso-48-lp-step-tabs');
});
await step('LP end of a step', async () => {
  const card = page.locator('.section-next').first();
  await card.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 200));
  await shot('4eso-49-lp-section-next');
});
await step('LP my week window', async () => {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator('#el-todo-btn').click();
  await page.waitForTimeout(800);
  await shot('4eso-49-lp-my-week-window');
  await page.locator('#el-todo-btn').click();
});

// English Lab tools: one look at each page linked from the English Lab home.
await page.goto(BASE + 'lab/index.html', { waitUntil: 'domcontentloaded' });
await settle();
await step('English Lab links', async () => {
  const hrefs = await page.$$eval('main a[href]', (as) => [...new Set(as.map((a) => a.href))].filter((h) => /\/lab\//.test(h)).slice(0, 6));
  for (const [i, h] of hrefs.entries()) {
    await page.goto(h, { waitUntil: 'domcontentloaded' });
    await settle(2000);
    await shot(`61-english-lab-${i}`);
  }
});

fs.writeFileSync(path.join(OUT, 'capture2-log.txt'), log.join('\n') + '\n');
await browser.close();
note('done');
