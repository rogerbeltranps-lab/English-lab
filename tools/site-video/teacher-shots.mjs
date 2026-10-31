// Screens of the teacher dashboard in demo mode (teacher-demo.mjs: invented students, nothing saved) for the teacher video.
import path from 'node:path';
export async function shots(page, OUT) {
  const note = (s) => console.log(s);
  const shot = async (name) => { await page.waitForTimeout(450); await page.screenshot({ path: path.join(OUT, 't-' + name + '.png') }); note('shot t-' + name); };
  const step = async (label, fn) => { try { await fn(); } catch (e) { note('SKIPPED ' + label + ': ' + e.message.split('\n')[0]); } };
  const clean = () => page.evaluate(() => { const m = document.getElementById('msg'); if (m) m.textContent = 'Signed in as the teacher.'; });
  const tab = async (g) => { await page.locator(`#tabs [data-g="${g}"]`).first().click(); await page.waitForTimeout(700); await clean(); };
  const top = (sel, off = 20) => page.locator(sel).first().evaluate((e, o) => window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - o), off);
  const open = async (k) => { const d = page.locator(`details[data-k="${k}"]`).first(); if (!(await d.evaluate((e) => e.open))) await d.locator('summary').first().click(); await page.waitForTimeout(500); };
  const box = (txt) => `#main .box:has(> details > summary:text-matches("${txt}"))`;

  await clean();
  await tab('4ESOA');
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot('00-top');
  await step('time plan box', async () => { await top('#main .box:has(h2:text-matches("Time plan"))', 10); await shot('10-time-plan'); });
  await step('learning paths open', async () => { await open('lpopen'); await top('details[data-k="lpopen"]', 10); await shot('11-lp-open'); });
  await step('checkpoints', async () => { await open('cpbox'); await top('details[data-k="cpbox"]', 10); await shot('12-checkpoints'); });
  await step('to do', async () => { await top('#main .box:has(h2:text("To do"))', 10); await shot('13-todo'); });
  await step('problems', async () => { await open('probs'); await top('#probs', 10); await shot('14-problems'); });
  await step('suggestions', async () => { await open('sugg'); await top('#sugg', 10); await shot('15-suggestions'); });
  await step('routes', async () => { await open('routes'); await top('details[data-k="routes"]', 10); await shot('16-routes'); });
  await step('grid', async () => { await top('#main .box:has(h2:text("Learning paths and activities"))', 10); await shot('17-grid'); });
  await step('cell dialog', async () => {
    const c = page.locator('td.sc.sub[data-do="cell"]').first();
    await c.scrollIntoViewIfNeeded(); await c.click(); await page.waitForSelector('#dlg[open]'); await page.waitForTimeout(500); await shot('18-cell');
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  });
  await step('LS grade', async () => { await top('#main .box:has(h2:text("LS grade"))', 10); await shot('19-grade'); });
  await step('exam marks', async () => { await open('exam'); await top('details[data-k="exam"]', 10); await shot('20-exam'); });
  await step('points', async () => { await open('points'); await top('details[data-k="points"]', 10); await shot('21-points'); });
  await step('year view', async () => {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator('#main select[data-do="ls"]').selectOption('__year'); await page.waitForTimeout(900); await clean(); await shot('22-year');
    await page.evaluate(() => window.scrollTo(0, 420)); await shot('23-year-cards');
    await page.locator('#main select[data-do="ls"]').selectOption('4eso-seasons-and-celebrations'); await page.waitForTimeout(700);
  });
  await step('marking pdf', async () => { await page.evaluate(() => window.scrollTo(0, 0)); await shot('24-bar'); });
  await step('plan tab', async () => { await tab('plan'); await page.evaluate(() => window.scrollTo(0, 0)); await shot('30-plan'); });
  await step('questions tab', async () => { await tab('qa'); await page.evaluate(() => window.scrollTo(0, 0)); await shot('31-questions'); });
  await step('materials tab', async () => { await tab('mat'); await page.evaluate(() => window.scrollTo(0, 0)); await shot('32-materials'); await page.evaluate(() => window.scrollTo(0, 560)); await shot('33-materials-games'); });
}
