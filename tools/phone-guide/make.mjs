// The pictures of the "Study on your phone / Estudia amb el mòbil" place of the student board (phoneBox in today.html):
// real phone-size screens of the current site (board.mjs, lp.mjs, invented sample students) inside drawn phones with the
// browser's own bars, menus and dialogs (Chrome on Android, Safari on iPhone with iOS 26: ⋯ → Share → Add to Home Screen).
// Usage: node tools/phone-guide/board.mjs C && node tools/phone-guide/lp.mjs C && node tools/phone-guide/make.mjs C
//        → shared/img/phone/{hero,android-1..3,iphone-1..4}-{en,ca}.webp (home.webp, the home screen with the icon, is kept)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const CAP = path.resolve(process.argv[2] || path.join(HERE, 'captures'));
const OUT = path.join(ROOT, 'shared/img/phone');
const only = process.argv[3] ? process.argv[3].split(',') : null;
const b64 = (f) => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
const ICON = 'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, 'favicon-192.png')).toString('base64');
const HOST = 'rogerbeltranps-lab.github.io';

const L = {
  en: {
    chrome: ['New tab', 'New Incognito tab', 'History', 'Downloads', 'Share…', 'Add to Home screen', 'Desktop site', 'Settings'],
    aTitle: 'Add to Home screen', cancel: 'Cancel', add: 'Add', install: 'Install',
    more: ['Share', 'Add to Bookmarks', 'Add to Reading List', 'Find on Page', 'New Tab', 'New Private Tab'],
    sheet: ['Copy', 'Add to Reading List', 'Add Bookmark', 'Add to Favourites', 'Add to Home Screen', 'Find on Page'],
    iTitle: 'Add to Home Screen', webApp: 'Open as Web App',
  },
  ca: {
    chrome: ['Pestanya nova', 'Pestanya d\'incògnit nova', 'Historial', 'Baixades', 'Comparteix…', 'Afegeix a la pantalla d\'inici', 'Lloc per a ordinadors', 'Configuració'],
    aTitle: 'Afegeix a la pantalla d\'inici', cancel: 'Cancel·la', add: 'Afegeix', install: 'Instal·la',
    more: ['Comparteix', 'Afegeix als preferits', 'Afegeix a la llista de lectura', 'Cerca a la pàgina', 'Pestanya nova', 'Pestanya privada nova'],
    sheet: ['Copia', 'Afegeix a la llista de lectura', 'Afegeix un preferit', 'Afegeix a Favorits', 'Afegeix a la pantalla d\'inici', 'Cerca a la pàgina'],
    iTitle: 'Afegeix a la pantalla d\'inici', webApp: 'Obre com a app web',
  },
};

const CSS = `*{box-sizing:border-box;margin:0}html,body{background:transparent}body{font:15px Inter,system-ui,sans-serif;color:#0f172a}
.ph{position:absolute;border-radius:46px;background:#0f172a;padding:11px;box-shadow:0 10px 30px rgba(15,23,42,.18)}
.sc{position:relative;width:100%;height:100%;border-radius:36px;overflow:hidden;background:#f8fafc;display:flex;flex-direction:column}
.sb{height:34px;flex:none;display:flex;align-items:center;justify-content:space-between;padding:0 26px;font-weight:700;font-size:14px;background:#fff}
.sb i{font-style:normal;letter-spacing:2px;font-size:12px}
.pg{flex:1;min-height:0;overflow:hidden;position:relative}.pg img{width:100%;display:block}
.cbar{height:58px;flex:none;background:#fff;display:flex;align-items:center;gap:8px;padding:0 10px 0 12px;border-bottom:1px solid #e2e8f0}
.cbar .u{flex:1;height:40px;border-radius:20px;background:#f1f5f9;display:flex;align-items:center;gap:8px;padding:0 14px;font-size:15px;color:#334155;white-space:nowrap;overflow:hidden}
.dots{width:40px;height:40px;display:grid;place-items:center;font-size:24px;font-weight:900;color:#334155;border-radius:50%}
.gest{height:18px;flex:none;background:#fff;display:grid;place-items:center}.gest b{width:120px;height:4px;border-radius:2px;background:#0f172a}
.ibar{position:absolute;left:12px;right:12px;bottom:24px;height:52px;display:flex;align-items:center;gap:8px}
.ibar .bk,.ibar .mo{width:52px;height:52px;border-radius:26px;background:rgba(255,255,255,.92);box-shadow:0 4px 18px rgba(15,23,42,.18);display:grid;place-items:center;font-size:26px;color:#0f172a;font-weight:700;flex:none}
.ibar .u{flex:1;height:52px;border-radius:26px;background:rgba(255,255,255,.92);box-shadow:0 4px 18px rgba(15,23,42,.18);display:flex;align-items:center;justify-content:center;font-size:15px;color:#0f172a;white-space:nowrap;overflow:hidden;padding:0 10px}
.ibar .mo{font-size:22px;letter-spacing:1px}
.izone{height:96px;flex:none;background:#f8fafc;border-top:1px solid #e2e8f0}
.home{position:absolute;bottom:7px;left:50%;margin-left:-66px;width:132px;height:5px;border-radius:3px;background:#0f172a}
.dim{position:absolute;inset:0;background:rgba(15,23,42,.38)}
.ring{outline:4px solid #f97316;outline-offset:2px;box-shadow:0 0 0 10px rgba(249,115,22,.22)}
.hand{position:absolute;font-size:46px;line-height:1;filter:drop-shadow(0 3px 4px rgba(0,0,0,.3));z-index:9}
.amenu{position:absolute;top:40px;right:8px;width:270px;background:#fff;border-radius:14px;box-shadow:0 10px 30px rgba(15,23,42,.3);padding:8px 0}
.amenu div{padding:12px 18px;font-size:16px}.amenu .hi{margin:2px 8px;border-radius:10px;font-weight:700;background:#fff7ed}
.adlg{position:absolute;left:24px;right:24px;top:220px;background:#fff;border-radius:26px;padding:24px 22px 16px;box-shadow:0 20px 40px rgba(15,23,42,.35)}
.adlg h3{font-size:21px;font-weight:600;margin-bottom:22px}.app{display:flex;align-items:center;gap:14px;border-bottom:2px solid #2563eb;padding-bottom:10px}
.app img{width:46px;height:46px;border-radius:50%}.app span{font-size:18px}
.btns{display:flex;justify-content:flex-end;gap:10px;margin-top:22px}.btns span{padding:10px 16px;border-radius:20px;font-weight:700;color:#1d4ed8;font-size:16px}
.imenu{position:absolute;right:14px;bottom:88px;width:290px;background:rgba(255,255,255,.97);border-radius:26px;box-shadow:0 12px 34px rgba(15,23,42,.3);padding:8px}
.imenu div{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;font-size:16px;border-radius:16px}.imenu div em{font-style:normal;color:#475569}
.imenu .hi{font-weight:700;background:#fff7ed}
.sheet{position:absolute;left:0;right:0;bottom:0;background:#f1f5f9;border-radius:30px 30px 0 0;padding:18px 16px 40px;box-shadow:0 -10px 30px rgba(15,23,42,.2)}
.sh-app{display:flex;align-items:center;gap:12px;background:#fff;border-radius:16px;padding:12px 14px;margin-bottom:14px}.sh-app img{width:44px;height:44px;border-radius:50%}
.sh-app b{display:block;font-size:16px}.sh-app small{color:#64748b;font-size:13px}
.sh-list{background:#fff;border-radius:16px;overflow:hidden}.sh-list div{display:flex;justify-content:space-between;align-items:center;padding:13px 16px;font-size:16px;border-top:1px solid #e2e8f0}
.sh-list div:first-child{border-top:0}.sh-list div em{font-style:normal;color:#475569;font-size:17px}.sh-list .hi{font-weight:700;background:#fff7ed;border-radius:12px;margin:3px}
.ia{position:absolute;inset:0;background:#f1f5f9;padding:16px}
.ia .top{display:flex;align-items:center;justify-content:space-between;margin:6px 0 24px}.ia .top span{font-size:16px;color:#1d4ed8;padding:8px 12px;border-radius:18px}.ia .top b{font-size:16px}
.ia .card{background:#fff;border-radius:16px;padding:14px;display:flex;gap:14px;align-items:center}.ia .card img{width:62px;height:62px;border-radius:14px}
.ia .card b{display:block;font-size:18px;font-weight:600;border-bottom:1px solid #e2e8f0;padding-bottom:8px;margin-bottom:6px}.ia .card small{color:#64748b;font-size:13px}
.ia .tog{background:#fff;border-radius:16px;padding:12px 14px;margin-top:16px;display:flex;justify-content:space-between;align-items:center;font-size:16px}
.sw{width:52px;height:32px;border-radius:16px;background:#22c55e;position:relative}.sw:after{content:"";position:absolute;right:3px;top:3px;width:26px;height:26px;border-radius:50%;background:#fff}
.addb{font-weight:700!important}`;

// one phone: 480×914 picture (CSS px), the page image under the browser bars
function phone(kind, img, extra, ring) {
  const sb = `<div class="sb"><span>17:30</span><i>▮▮▮ ◔ ▮</i></div>`;
  if (kind === 'android') return `<div class="ph" style="left:0;top:0;width:480px;height:914px"><div class="sc">${sb}
    <div class="cbar"><div class="u">🔒 ${HOST}</div><div class="dots ${ring === 'dots' ? 'ring' : ''}">⋮</div></div>
    <div class="pg"><img src="${img}"></div><div class="gest"><b></b></div>${extra || ''}</div></div>`;
  return `<div class="ph" style="left:0;top:0;width:480px;height:914px"><div class="sc">${sb}
    <div class="pg"><img src="${img}"></div><div class="izone"></div>
    <div class="ibar"><div class="bk">‹</div><div class="u">${HOST}</div><div class="mo ${ring === 'more' ? 'ring' : ''}">•••</div></div><div class="home"></div>${extra || ''}</div></div>`;
}
const hand = (x, y) => `<div class="hand" style="left:${x}px;top:${y}px">👆</div>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 480, height: 914 }, deviceScaleFactor: 1.5 });
async function shot(name, html, w = 480, h = 914) {
  if (only && !only.includes(name)) return;
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${html}</body></html>`);
  await page.waitForTimeout(150);
  const png = await page.screenshot({ omitBackground: true });
  // PNG → WebP in the browser (canvas), no other tool needed
  const webp = await page.evaluate(async (src) => {
    const im = new Image(); im.src = src; await im.decode();
    const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0);
    return c.toDataURL('image/webp', 0.86);
  }, 'data:image/png;base64,' + png.toString('base64'));
  fs.writeFileSync(path.join(OUT, name + '.webp'), Buffer.from(webp.split(',')[1], 'base64'));
  console.log('made', name);
}

for (const lang of ['en', 'ca']) {
  const T = L[lang], bA = b64(path.join(CAP, `board-${lang}-666.png`)), bI = b64(path.join(CAP, `board-${lang}-649.png`)), bH = b64(path.join(CAP, `board-${lang}-803.png`)), lp = b64(path.join(CAP, `lp-${lang}.png`));
  // hero: the board and a learning path
  await shot('hero-' + lang, `<div class="ph" style="left:0;top:0;width:320px;height:640px;padding:9px;border-radius:40px"><div class="sc" style="border-radius:32px"><div class="pg"><img src="${bH}"></div></div></div>
    <div class="ph" style="left:330px;top:90px;width:300px;height:560px;padding:9px;border-radius:40px"><div class="sc" style="border-radius:32px"><div class="pg"><img src="${lp}"></div></div></div>`, 640, 656);
  // Android · Chrome
  await shot('android-1-' + lang, phone('android', bA, hand(412, 92), 'dots'));
  await shot('android-2-' + lang, phone('android', bA, `<div class="dim"></div><div class="amenu">${T.chrome.map((x, i) => `<div class="${i === 5 ? 'hi ring' : ''}">${i === 5 ? '📲 ' : ''}${x}</div>`).join('')}</div>${hand(400, 312)}`));
  await shot('android-3-' + lang, phone('android', bA, `<div class="dim"></div><div class="adlg"><h3>${T.aTitle}</h3><div class="app"><img src="${ICON}"><span>English Lab</span></div>
    <div class="btns"><span>${T.cancel}</span><span class="ring">${T.add}</span></div></div>${hand(360, 395)}`));
  // iPhone · Safari (iOS 26)
  await shot('iphone-1-' + lang, phone('iphone', bI, hand(398, 820), 'more'));
  await shot('iphone-2-' + lang, phone('iphone', bI, `<div class="dim"></div><div class="imenu">${T.more.map((x, i) => `<div class="${i === 0 ? 'hi ring' : ''}"><span>${x}</span><em>${['⬆︎', '📖', '👓', '🔍', '＋', '✋'][i]}</em></div>`).join('')}</div>${hand(362, 574)}`));
  await shot('iphone-3-' + lang, phone('iphone', bI, `<div class="dim"></div><div class="sheet"><div class="sh-app"><img src="${ICON}"><span><b>English Lab</b><small>${HOST}</small></span></div>
    <div class="sh-list">${T.sheet.map((x, i) => `<div class="${i === 4 ? 'hi ring' : ''}"><span>${x}</span><em>${['⧉', '👓', '📖', '☆', '⊞', '🔍'][i]}</em></div>`).join('')}</div></div>${hand(395, 800)}`));
  await shot('iphone-4-' + lang, phone('iphone', bI, `<div class="ia"><div class="top"><span>${T.cancel}</span><b>${T.iTitle}</b><span class="addb ring">${T.add}</span></div>
    <div class="card"><img src="${ICON}"><div style="flex:1"><b>English Lab</b><small>https://${HOST}/…</small></div></div>
    <div class="tog"><span>${T.webApp}</span><span class="sw"></span></div></div>${hand(402, 66)}`));
}
await browser.close();
