// Third round of captures for the "How English Lab works" video, after the site changes of 31 Oct 2026 (corrections shown
// to students, one-question-at-a-time checkpoints) and Roger's review ("there are things the audio says that the image doesn't
// show properly"). Same rules as capture.mjs: tester account, look only. Nothing is sent, saved, ticked or started.
// Three shots show a state the tester account does not have, drawn in this browser only and never saved:
//   - the "Join the class" box (the board's own markup), - a teacher's correction (the site's own el-corrections.js with a sample
//   text and a save() that does nothing), - a typed reason in "Ask to change route" / the Problem window (never sent).
// Usage: EL_TESTER_PASSWORD=... [EL_PREFIX=r4-] node tools/site-video/capture3.mjs [outdir]   → files named r3-* (or EL_PREFIX*)
// Fourth round (EL_PREFIX=r4-, after Roger's "add the latest features" on 31 Oct): also the level notice (el-level-notice.js with a
// sample level and a save() that does nothing), the homework box and Google Calendar link, self-practice by level, LS2 games.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const BASE = (process.env.EL_BASE || 'https://rogerbeltranps-lab.github.io/English-lab/').replace(/\/?$/, '/');
const PASS = process.env.EL_TESTER_PASSWORD;
if (!PASS) { console.error('Set EL_TESTER_PASSWORD'); process.exit(1); }
const PREFIX = process.env.EL_PREFIX || 'r3-';
const OUT = path.resolve(process.argv[2] || 'tools/site-video/captures');
fs.mkdirSync(OUT, { recursive: true });
const log = [];
const note = (s) => { console.log(s); log.push(s); };

const browser = await chromium.launch(process.env.EL_CHANNEL ? { channel: process.env.EL_CHANNEL } : {});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5, locale: 'en-GB' });
const page = await ctx.newPage();
page.setDefaultTimeout(15000);

async function clean({ keepCards = false } = {}) {
  await page.evaluate((keep) => {
    document.querySelectorAll('#el-banner').forEach((b) => { if (/^Test account/.test(b.textContent)) b.remove(); });
    const bar = document.getElementById('el-cloud-bar');
    if (bar) {
      bar.querySelectorAll('select').forEach((s) => (s.style.display = 'none'));
      for (const n of [...bar.childNodes]) if (n.nodeType === 3 && /Beltran|Roger/.test(n.textContent)) n.textContent = 'Your name ';
    }
    // "Later" on the exam card is only remembered in this tab. "OK"/"D'acord" on the other cards deletes or saves
    // (el-reply.js: OK deletes the reply), so those cards are only taken off the page here.
    if (!keep) {
      [...document.querySelectorAll('#el-exam-notice button')].filter((b) => /^(Més tard|Later)$/.test(b.textContent.trim())).forEach((b) => b.click());
      document.querySelectorAll('#el-level-notice, #el-corrections, #el-reply').forEach((c) => c.remove());
    }
  }, keepCards).catch(() => {});
}
async function settle(ms = 2500, o) { await page.waitForLoadState('networkidle').catch(() => {}); await page.waitForTimeout(ms); await clean(o); }
async function shot(name, { full = false, keepCards = false } = {}) {
  await clean({ keepCards });
  const f = path.join(OUT, PREFIX + name + (full ? '.full.jpg' : '.png'));
  await page.screenshot(full ? { path: f, fullPage: true, type: 'jpeg', quality: 85 } : { path: f });
  note('shot ' + path.basename(f));
}
async function step(label, fn) { try { await fn(); } catch (e) { note('SKIPPED ' + label + ': ' + e.message.split('\n')[0]); } }
async function view(group) {
  await page.evaluate((g) => Storage.prototype.setItem.call(localStorage, 'el_view', g), group);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await settle(4000);
}
const top = (sel, off = 110) => page.locator(sel).first().evaluate((e, o) => window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - o), off);

// Home and sign-in (signed out).
await page.goto(BASE + 'index.html', { waitUntil: 'domcontentloaded' });
await settle();
await shot('00-home');
await page.locator('#el-cloud-bar button', { hasText: 'Sign in' }).click();
await page.waitForSelector('input[name=password]');
await page.fill('input[name=email]', 'name.surname@ietramuntana.cat');
await page.fill('input[name=password]', 'password');   // shown as dots
await shot('01-signin');
await page.fill('input[name=email]', 'roger.beltran@ietramuntana.cat');
await page.fill('input[name=password]', PASS);
await page.locator('button[type=submit]').click();
await page.waitForURL(/today\.html/, { timeout: 30000 }).catch(() => note('no redirect to the board after sign-in'));
await settle(3000);
await view('4ESOA');

// ---- Board ----
await page.goto(BASE + 'today.html', { waitUntil: 'domcontentloaded' });
await settle(4000, { keepCards: true });
await step('exam card', async () => { if (await page.locator('#el-exam-notice').count()) await shot('09-exam-card', { keepCards: true }); else note('no exam card'); });
await clean();
await page.waitForTimeout(500);
await shot('10-board');
await shot('10-board', { full: true });
await step('join the class (drawn here only)', async () => {
  await page.evaluate(() => {
    const live = document.getElementById('live');
    live.innerHTML = '<div class="pend live"><div><b>📺 Your class is on a presentation now</b><div class="muted">LS2 · Celebrations around the world</div></div><a class="go" href="#">Join the class →</a></div>';
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot('11-join-the-class');
  await page.evaluate(() => { document.getElementById('live').innerHTML = ''; });
});
await step('route request with a reason (not sent)', async () => {
  await top('button[data-do="ask"]', 300);
  await shot('12-route-line');
  if (PREFIX !== 'r3-') await step('level notice (drawn here only)', async () => {
    await page.evaluate(async (root) => {
      const { levelNotice } = await import(root + 'shared/js/el-level-notice.js');
      await levelNotice({ course: '4eso', seen: async () => ({}), save: async () => {},
        lv: async () => ({ '4eso-seasons-and-celebrations': { level: 'safe', by: 'teacher', why: 'exam', changed: Date.now() } }) });
    }, BASE);
    await page.waitForSelector('#el-level-notice', { timeout: 8000 });
    await page.waitForTimeout(400);
    await shot('12-level-notice', { keepCards: true });
    await page.evaluate(() => document.getElementById('el-level-notice')?.remove());
  });
  await page.locator('button[data-do="ask"]').first().click();
  await page.waitForSelector('#dlg[open]');
  await page.waitForTimeout(400);
  await shot('13-ask-route');
  await page.locator('button[data-do="want"]', { hasText: 'Plus' }).first().click().catch(() => page.locator('button[data-do="want"]').last().click());
  await page.fill('#why', 'I find Core easy and I want more challenge.');
  await shot('14-ask-route-filled');
  await page.fill('#why', '');
  await page.locator('[data-do="close"]').first().click();
});
await step('week plan', async () => { await top('#main .box:has(h2:text-matches("week plan|pla setmanal","i"))', 40); await shot('15-week-plan'); });
if (PREFIX !== 'r3-') await step('homework box', async () => { await top('#main .hw', 140); await shot('15-homework'); });
await step('whole LS plan', async () => {
  const s = page.locator('#main summary', { hasText: /whole LS plan|Tot el pla/ }).first();
  await s.click();
  await page.waitForTimeout(500);
  await s.evaluate((e) => window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - 60));
  await shot('15-whole-ls-plan');
  await s.click();
});
await step('my week window', async () => {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator('#el-todo-btn').click();
  await page.waitForTimeout(800);
  await shot('16-my-week');
  await page.locator('#el-todo-btn').click();
});
await step('learning paths grid', async () => { await top('.tabs [data-v="lp"]', 40); await shot('17-lp-grid'); });
await step('result window with Submit', async () => {
  const cell = page.locator('[data-do="cell"]').nth(1);
  await cell.scrollIntoViewIfNeeded();
  await cell.click();
  await page.waitForSelector('#dlg[open]');
  await page.waitForTimeout(500);
  await shot('18-result-window');
  await page.keyboard.press('Escape');
  await page.locator('#dlg [data-do="close"]').click().catch(() => {});
});
await step('criteria summary', async () => {
  await page.locator('[data-v="sum"]').click();
  await page.waitForTimeout(800);
  await top('.tabs [data-v="sum"]', 40);
  await shot('19-criteria');
  await page.locator('[data-v="lp"]').click();
});
await step('teacher correction card on the board (drawn here only)', async () => {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(async (root) => {
    const { corrections } = await import(root + 'shared/js/el-corrections.js');
    const a = (window.EL_CATALOG || []).find((x) => /celebrations-around-the-world\.html$/.test(x.path || ''));
    await corrections({ list: async () => [{ activity: a.id, replies: { log: 'Well done! Your notes are clear.\nRemember: "It is celebrated in December", not "It celebrate in December".' }, levels: { log: { '4.1': 3 } } }],
      seen: async () => ({}), save: async () => {}, here: null, root, en: true, name: () => 'Reading log' });
  }, BASE);
  await page.waitForSelector('#el-corrections', { timeout: 8000 });
  await page.waitForTimeout(400);
  await shot('20-correction-card', { keepCards: true });
  await page.evaluate(() => document.getElementById('el-corrections')?.remove());
});

// ---- Menu, course, LS page and its tabs ----
await page.goto(BASE + '4eso/seasons-and-celebrations/index.html', { waitUntil: 'domcontentloaded' });
await settle();
await shot('30-ls');
await step('LS menu', async () => {
  await page.locator('details.nav-menu > summary').first().click();
  await page.waitForTimeout(500);
  await shot('31-ls-menu');
  await page.locator('details.nav-menu > summary').first().click();
});
for (const t of ['overview', 'learning-path', 'language', 'final']) {
  await step('LS tab ' + t, async () => {
    await page.locator(`label[for="tab-${t}"]`).click();
    await page.waitForTimeout(600);
    await page.locator(`label[for="tab-${t}"]`).evaluate((l) => window.scrollTo(0, l.getBoundingClientRect().top + window.scrollY - 120));
    await page.waitForTimeout(300);
    await shot('32-ls-tab-' + t);
  });
}

// ---- A learning path ----
const LP = BASE + '4eso/seasons-and-celebrations/celebrations-around-the-world.html';
await page.goto(LP, { waitUntil: 'domcontentloaded' });
await settle();
await shot('40-lp-top');
await step('LP step tabs', async () => { await top('.tabs .tab', 160); await shot('41-lp-tabs'); });
await step('LP reading step', async () => {
  await page.locator('.tabs .tab', { hasText: 'Reading' }).first().click();
  await page.waitForTimeout(600);
  await top('.tabs .tab', 160);
  await shot('42-lp-reading');
});
await step('LP end of a step', async () => { await top('.section-next', 300); await shot('43-lp-step-end'); });
await step('LP saved note', async () => { await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await page.waitForTimeout(400); await shot('44-lp-bottom'); });
await step('correction inside the step (drawn here only)', async () => {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(async (root) => {
    const { corrections } = await import(root + 'shared/js/el-corrections.js');
    const a = (window.EL_CATALOG || []).find((x) => /celebrations-around-the-world\.html$/.test(x.path || ''));
    await corrections({ list: async () => [{ activity: a.id, replies: { log: 'Well done! Your notes are clear.\nRemember: "It is celebrated in December", not "It celebrate in December".' }, levels: { log: { '4.1': 3 } } }],
      seen: async () => ({ [a.id + '|log']: 'x' }), save: async () => {}, here: a.id, root, en: true, name: () => 'Reading log' });
    document.getElementById('el-corrections')?.remove();
  }, BASE);
  await page.locator('.tabs .tab', { hasText: 'Reading log' }).first().click();
  await page.waitForTimeout(800);
  await top('.el-correction', 200);
  await shot('45-lp-correction');
});
await step('problem window filled (not sent)', async () => {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator('#el-cloud-bar button', { hasText: /Problem/ }).click();
  await page.waitForSelector('dialog[open]');
  await page.waitForTimeout(400);
  await shot('50-problem');
  await page.locator('dialog[open] input[type=radio]').first().check();
  await page.locator('dialog[open] textarea').fill('The audio of the listening does not play.');
  await shot('51-problem-filled');
  await page.locator('dialog[open] [data-x]').click();
});

// ---- Checkpoints ----
await page.goto(BASE + '4eso/seasons-and-celebrations/recall-checkpoint-1.html', { waitUntil: 'domcontentloaded' });
await settle();
await shot('60-not-open');
// The rules screen as the tester sees it in the full view (the checkpoint is open there). Nothing is ticked or started.
await view('');
await page.goto(BASE + '4eso/seasons-and-celebrations/recall-checkpoint-1.html', { waitUntil: 'domcontentloaded' });
await settle(3500);
await step('checkpoint rules', async () => { await top('.cp-box', 140); await shot('61-checkpoint-rules'); });
// All the routes side by side (a student sees only theirs; the full view shows every route card). Nothing is clicked.
await step('route cards', async () => {
  await page.goto(LP, { waitUntil: 'domcontentloaded' });
  await settle(3000);
  await top('.route', 360);
  await shot('26-routes');
  const boxes = await page.locator('.route').evaluateAll((rs) => rs.map((r) => { const b = r.getBoundingClientRect(); return r.querySelector('strong').textContent + ' ' + [b.x, b.y, b.width, b.height].map(Math.round).join(','); }));
  note('routes (x,y,w,h at 1280x720): ' + boxes.join(' | '));
});
await view('4ESOA');

// ---- English Lab ----
await page.goto(BASE + 'lab/index.html', { waitUntil: 'domcontentloaded' });
await settle();
await shot('70-english-lab');
await step('games menu', async () => {
  await page.locator('[data-lab-menu="games"]').click();
  await page.waitForTimeout(700);
  await top('#labGamesMenu', 120);
  await shot('71-games-menu');
});
await page.goto(BASE + '4eso/my-real-routine/vocabulary-games.html', { waitUntil: 'domcontentloaded' });
await settle();
await shot('72-vocabulary-games');
if (PREFIX !== 'r3-') {
  // LS2 games are "not open yet" for 4ESO A today (opened per group like any activity), so this shot uses the full view.
  await step('LS2 vocabulary games', async () => {
    await view('');
    await page.goto(BASE + '4eso/seasons-and-celebrations/vocabulary-games.html', { waitUntil: 'domcontentloaded' });
    await settle();
    await shot('72-vocabulary-games-ls2');
  });
  // On 31 Oct a student is sent back to the board from lab/practice.html (el-cloud.js gate(): only lab/ and lab/index.html
  // count as English Lab), so this shot also uses the full view.
  await step('self-practice by level', async () => {
    await page.goto(BASE + 'lab/practice.html', { waitUntil: 'domcontentloaded' });
    await settle(4000);
    note('practice page url: ' + page.url());
    await shot('73-practice');
    await shot('73-practice', { full: true });
  });
  await view('4ESOA');
}

fs.writeFileSync(path.join(OUT, PREFIX + 'capture-log.txt'), log.join('\n') + '\n');
await browser.close();
note('done');
