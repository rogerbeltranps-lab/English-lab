// Screen captures of the live site as a student sees it, for the "How English Lab works" video.
// Signs in with the tester account and uses "View as <group>", so no real student's name or marks appear.
// It only looks: it opens dialogs and menus and closes them again, and never sends, saves or submits anything.
// Usage: EL_TESTER_PASSWORD=... node tools/site-video/capture.mjs [outdir]
//   EL_BASE (optional) = site root, default the GitHub Pages site. Needs the playwright package (Chromium, or Chrome with EL_CHANNEL=chrome).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const BASE = (process.env.EL_BASE || 'https://rogerbeltranps-lab.github.io/English-lab/').replace(/\/?$/, '/');
const EMAIL = 'roger.beltran@ietramuntana.cat';
const PASS = process.env.EL_TESTER_PASSWORD;
if (!PASS) { console.error('Set EL_TESTER_PASSWORD'); process.exit(1); }
const OUT = path.resolve(process.argv[2] || 'tools/site-video/captures');
fs.mkdirSync(OUT, { recursive: true });
const log = [];
const note = (s) => { console.log(s); log.push(s); };

const browser = await chromium.launch(process.env.EL_CHANNEL ? { channel: process.env.EL_CHANNEL } : {});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5, locale: 'en-GB' });
const page = await ctx.newPage();
page.setDefaultTimeout(20000);

// Hide what only the tester sees (purple banner, "View as" select) and show a neutral name in the bottom bar.
async function clean(p = page) {
  await p.evaluate(() => {
    document.querySelectorAll('#el-banner').forEach((b) => { if (/^Test account/.test(b.textContent)) b.remove(); });
    const bar = document.getElementById('el-cloud-bar');
    if (bar) {
      bar.querySelectorAll('select').forEach((s) => s.remove());
      for (const n of [...bar.childNodes]) if (n.nodeType === 3 && /Beltran|Roger/.test(n.textContent)) n.textContent = 'Your name ';
    }
    document.querySelectorAll('body *').forEach((e) => {
      if (e.children.length === 0 && /Beltran Porres, Roger/.test(e.textContent)) e.textContent = e.textContent.replace(/Beltran Porres, Roger/g, 'Your name');
    });
  }).catch(() => {});
}
async function settle(p = page, ms = 2500) {
  await p.waitForLoadState('networkidle').catch(() => {});
  await p.waitForTimeout(ms);
  await clean(p);
}
async function shot(name, { full = false, p = page } = {}) {
  await clean(p);
  const f = path.join(OUT, name + (full ? '.full.jpg' : '.png'));
  await p.screenshot(full ? { path: f, fullPage: true, type: 'jpeg', quality: 85 } : { path: f });
  note('shot ' + path.basename(f));
}
async function go(rel, name) {
  await page.goto(BASE + rel, { waitUntil: 'domcontentloaded' });
  await settle();
  await shot(name);
  await shot(name, { full: true });
}
async function tryStep(label, fn) {
  try { await fn(); } catch (e) { note('SKIPPED ' + label + ': ' + e.message.split('\n')[0]); }
}

// 1. Home page and the sign-in window, signed out.
await page.goto(BASE + 'index.html', { waitUntil: 'domcontentloaded' });
await settle();
await shot('00-home-signed-out');
await shot('00-home-signed-out', { full: true });
await page.locator('#el-cloud-bar button', { hasText: 'Sign in' }).click();
await page.waitForSelector('input[name=password]');
await page.waitForTimeout(500);
await shot('01-signin-window');
await page.fill('input[name=email]', 'name.surname@ietramuntana.cat');
await shot('01-signin-window-filled');
await page.fill('input[name=email]', EMAIL);
await page.fill('input[name=password]', PASS);
await page.locator('button[type=submit]').click();
await page.waitForURL(/today\.html/, { timeout: 30000 }).catch(() => note('no redirect to the board after sign-in'));
await settle(page, 3000);

const pages = {
  '4eso': { group: '4ESOA', ls: '4eso/seasons-and-celebrations/', lps: ['getting-started', 'celebrations-around-the-world', 'recall-checkpoint-1', 'where-traditions-come-from', 'write-to-the-head-teacher', 'celebration-day-proposal', 'sample-exam', 'reflect'] },
  '2eso': { group: '2ESOA', ls: '2eso/free-time-live/', lps: ['getting-started', 'now-or-usually', 'recall-checkpoint-1', 'write-your-vlog-script', 'free-time-vlog'] },
};

for (const [course, c] of Object.entries(pages)) {
  const P = course + '-';
  // Student view of one group (the tester's own switch in the bottom bar; kept in this browser only).
  await page.goto(BASE + 'today.html', { waitUntil: 'domcontentloaded' });
  await settle();
  await page.locator('#el-cloud-bar select').selectOption(c.group).catch(() => note('could not pick ' + c.group));
  await page.waitForLoadState('domcontentloaded');
  await settle(page, 4000);

  // 2. The board (My activities).
  await shot(P + '10-board');
  await shot(P + '10-board', { full: true });
  await tryStep('board side menu', () => page.locator('aside.side').screenshot({ path: path.join(OUT, P + '11-board-menu.png') }).then(() => note('shot ' + P + '11-board-menu.png')));
  await tryStep('board boxes', async () => {
    const boxes = page.locator('#main .box');
    const n = await boxes.count();
    for (let i = 0; i < n; i++) {
      const b = boxes.nth(i);
      const h = ((await b.locator('h2').first().textContent().catch(() => '')) || 'box').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 30);
      await b.scrollIntoViewIfNeeded();
      await b.screenshot({ path: path.join(OUT, `${P}12-board-box-${String(i).padStart(2, '0')}-${h}.png`) });
      note(`shot ${P}12-board-box-${i}-${h}`);
    }
  });
  await tryStep('ask to change route', async () => {
    await page.locator('button[data-do="ask"]').first().click();
    await page.waitForSelector('#dlg[open]');
    await page.waitForTimeout(400);
    await shot(P + '13-ask-route');
    await page.locator('button[data-do="want"]').first().click();   // only highlights a choice; nothing is sent
    await shot(P + '13-ask-route-picked');
    await page.locator('[data-do="close"]').click();
  });
  // Every "Open"/details item on the board that opens a window (criteria, grade): first one only, then close.
  await tryStep('board detail', async () => {
    const pill = page.locator('#main [data-do="crit"]').first();
    await pill.scrollIntoViewIfNeeded();
    await pill.click();
    await page.waitForSelector('#dlg[open]');
    await page.waitForTimeout(400);
    await shot(P + '14-criterion-window');
    await page.keyboard.press('Escape');
  });

  // 3. Course page and LS page, with the Learning Situations menu open.
  await go(course + '/index.html', P + '20-course');
  await go(c.ls + 'index.html', P + '30-ls');
  await tryStep('LS menu', async () => {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator('details.nav-menu > summary').first().click();
    await page.waitForTimeout(500);
    await shot(P + '31-ls-menu-open');
    await page.locator('details.nav-menu > summary').first().click();
  });
  // Learning path cards on the LS page, one by one.
  await tryStep('LS cards', async () => {
    const hs = page.locator('main h3');
    const n = Math.min(await hs.count(), 16);
    for (let i = 0; i < n; i++) {
      const card = hs.nth(i).locator('xpath=ancestor::*[self::article or self::a or contains(@class,"card")][1]');
      if (!(await card.count())) continue;
      await card.scrollIntoViewIfNeeded();
      await card.screenshot({ path: path.join(OUT, `${P}32-ls-card-${String(i).padStart(2, '0')}.png`) });
    }
    note(P + 'LS cards done');
  });

  // 4. Learning paths, checkpoints, exam, final product, reflect.
  for (const [i, lp] of c.lps.entries()) {
    const name = `${P}4${i}-${lp}`;
    await go(c.ls + lp + '.html', name);
    await tryStep(lp + ' tabs', async () => {
      const tabs = page.locator('.tabs .tab');
      const n = Math.min(await tabs.count(), 6);
      for (let k = 1; k < n; k++) {
        await tabs.nth(k).click();
        await page.waitForTimeout(600);
        await page.evaluate(() => window.scrollTo(0, 0));
        await shot(`${name}-tab${k}`);
      }
      if (n) await tabs.nth(0).click();
    });
  }

  // 5. Problem button (bottom bar): open the window, then cancel. Nothing is sent.
  await page.goto(BASE + c.ls + c.lps[0] + '.html', { waitUntil: 'domcontentloaded' });
  await settle();
  await tryStep('problem window', async () => {
    await page.locator('#el-cloud-bar button', { hasText: /Problem/ }).click();
    await page.waitForSelector('dialog[open]');
    await page.waitForTimeout(500);
    await shot(P + '50-problem-window');
    await page.locator('dialog[open] [data-x]').click();
  });

  // 6. English Lab.
  await go('lab/index.html', P + '60-english-lab');
}

// 7. Phone: board and LS page with the menu open.
// Same signed-in browser, phone-sized window (2 ESO view is still set).
const pp = await ctx.newPage();
await pp.setViewportSize({ width: 390, height: 844 });
await pp.goto(BASE + 'today.html', { waitUntil: 'domcontentloaded' });
await settle(pp, 4000);
await shot('70-phone-board', { p: pp });
await pp.goto(BASE + pages['2eso'].ls + 'index.html', { waitUntil: 'domcontentloaded' });
await settle(pp, 3000);
await shot('71-phone-ls', { p: pp });
await tryStep('phone menu', async () => {
  await pp.locator('.menu-toggle').first().click();
  await pp.waitForTimeout(500);
  await shot('72-phone-ls-menu', { p: pp });
});

fs.writeFileSync(path.join(OUT, 'capture-log.txt'), log.join('\n') + '\n');
await browser.close();
note('done: ' + OUT);
