// Print the reading-story HTML pages to PDF (tools/reading-story/build.py writes the job list). Run: node print.mjs jobs.json
import { readFileSync } from "fs";
import { createRequire } from "module";
const { chromium } = createRequire(import.meta.url)("playwright");
const jobs = JSON.parse(readFileSync(process.argv[2], "utf8"));
const browser = await chromium.launch();
const page = await browser.newPage();
const font = "font-family:Inter,'DejaVu Sans',sans-serif;font-size:6.5px;color:#5f6b73;width:100%;padding:0 15mm;display:flex;justify-content:space-between";
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
for (const j of jobs) {
  await page.goto("file://" + j.html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf(j.footer ? {
    path: j.pdf, format: "A5", printBackground: true, displayHeaderFooter: true,
    margin: { top: "15mm", bottom: "15mm", left: "15mm", right: "15mm" },
    headerTemplate: `<div style="${font};letter-spacing:.08em;text-transform:uppercase"><span>${esc(j.head)}</span><span>English Lab · Reading corner</span></div>`,
    footerTemplate: `<div style="${font}"><span>${esc(j.copy)}</span><span class="pageNumber"></span></div>`,
  } : { path: j.pdf, format: "A5", printBackground: true, margin: { top: "0", bottom: "0", left: "0", right: "0" } });
}
await browser.close();
