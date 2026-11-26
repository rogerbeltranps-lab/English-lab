// 🤖 Real-use tests (Roger, 25 Nov 2026: yes to "a robot uses the site like a student"): the shared part.
// The pages run as they are, with the real Firebase code, but against a FREE TEST COPY of the database on this computer (the Firebase
// emulator, started by check.mjs) under the project id demo-english-lab, which Google never connects to anything real. The real
// firestore.rules are loaded into it, so a save the rules would refuse fails here too. Every user is invented (Alex Sample…).
// How the pages are pointed at the test copy: the three Firebase files they import from www.gstatic.com are answered with a small
// wrapper around the same files (the npm package firebase@10.14.1, the very same build) that connects them to the emulator and signs in
// the invented user before the page asks who is signed in. Any try to reach the real database or sign-in is blocked and is a failure.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { CHROMEBOOK, CHROMEBOOK_FULL, PHONE, contextOptions } from '../devices.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const PROJECT = 'demo-english-lab';
export const FS_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
export const AUTH_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
const SDK = path.dirname(require.resolve('firebase/package.json'));
const FB = 'https://www.gstatic.com/firebasejs/10.14.1/';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.pdf': 'application/pdf', '.vtt': 'text/vtt' };
// the real database and sign-in: a test page must never even try them
const REAL = /(^|\.)(firestore\.googleapis\.com|firebaseio\.com|identitytoolkit\.googleapis\.com|securetoken\.googleapis\.com|firebasestorage\.googleapis\.com|firebaseinstallations\.googleapis\.com)$/;
const SCRIPT = /^script\.google(usercontent)?\.com$/;   // the school Apps Script (emails, Beltran's runs): never called, only counted
export const SITE_HOST = '127.0.0.1:4173', SITE = 'http://' + SITE_HOST + '/';
// the site's files, served from this repo by a small server on this computer (a page answered by the browser's own interception would
// not be allowed to talk to the emulator on 127.0.0.1: Chrome keeps pages from the outside away from this computer's own addresses)
const missingNow = new Set();
let server = null;
async function serve() {
  if (server) return;
  const http = await import('node:http');
  server = http.createServer((q, r) => {
    const rel = decodeURIComponent(new URL(q.url, SITE).pathname).replace(/^\/+(English-lab\/)?/, '').replace(/(^|\/)$/, '$1index.html');
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      if (!/\.map$|my-real-routine\/data\/[\w-]+\.js$|favicon\.ico$/.test(rel)) missingNow.add(rel);
      r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'Content-Type': TYPES[path.extname(rel).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(file).pipe(r);
  });
  await new Promise((ok) => server.listen(+SITE_HOST.split(':')[1], SITE_HOST.split(':')[0], ok));
}
const mine = (u) => u.host === FS_HOST || u.host === AUTH_HOST || u.host === SITE_HOST;

// ---- the wrappers the pages get instead of the three Firebase files ----
const SHIM = {
  'firebase-app.js': `import * as R from "${FB}real/firebase-app.js";export * from "${FB}real/firebase-app.js";
export function initializeApp(c,...r){return R.initializeApp(Object.assign({},c,{apiKey:"demo-key",projectId:"${PROJECT}",authDomain:"${PROJECT}.firebaseapp.com",storageBucket:"${PROJECT}.appspot.com",appId:"demo"}),...r)}`,
  'firebase-firestore.js': `import * as R from "${FB}real/firebase-firestore.js";export * from "${FB}real/firebase-firestore.js";
const seen=new WeakSet();function hook(d){if(!seen.has(d)){seen.add(d);try{R.connectFirestoreEmulator(d,"${FS_HOST.split(':')[0]}",${FS_HOST.split(':')[1]})}catch(e){}}return d}
export function getFirestore(...a){return hook(R.getFirestore(...a))}
export function initializeFirestore(...a){return hook(R.initializeFirestore(...a))}`,
  // window.__RU = {email, password}: the invented user this browser signs in as (set by the test before the page opens); no __RU = nobody
  'firebase-auth.js': `import * as R from "${FB}real/firebase-auth.js";export * from "${FB}real/firebase-auth.js";
const seen=new WeakMap();
export function getAuth(...a){const x=R.getAuth(...a);if(!seen.has(x)){R.connectAuthEmulator(x,"http://${AUTH_HOST}",{disableWarnings:true});
  const L=window.__RU;seen.set(x,x.authStateReady().then(async()=>{if(L&&L.email&&(!x.currentUser||x.currentUser.email!==L.email)){await R.signInWithEmailAndPassword(x,L.email,L.password)}
    else if(L&&L.out&&x.currentUser)await R.signOut(x)}).catch(e=>console.warn("real-use sign-in",e)))}return x}
const later=(x,f)=>{let un=null,off=false;(seen.get(x)||Promise.resolve()).then(()=>{if(!off)un=f()});return()=>{off=true;if(un)un()}};
export function onAuthStateChanged(x,...r){getAuth(x.app);return later(x,()=>R.onAuthStateChanged(x,...r))}
export function onIdTokenChanged(x,...r){getAuth(x.app);return later(x,()=>R.onIdTokenChanged(x,...r))}`,
};

// ---- the test copy of the database: reset, fill, read (as the service account would, past the rules) ----
let admin = null;
export async function adminApp() {
  if (admin) return admin;
  process.env.FIRESTORE_EMULATOR_HOST = FS_HOST; process.env.FIREBASE_AUTH_EMULATOR_HOST = AUTH_HOST;
  const A = require('firebase-admin');
  const app = A.apps.length ? A.app() : A.initializeApp({ projectId: PROJECT });
  admin = { A, app, db: app.firestore(), auth: app.auth() };
  return admin;
}
export async function reset() {
  await fetch(`http://${FS_HOST}/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' });
  await fetch(`http://${AUTH_HOST}/emulator/v1/projects/${PROJECT}/accounts`, { method: 'DELETE' });
}
// docs = {path: data}; numbers stay numbers, {__ts: ms} becomes a Firestore Timestamp
export async function seed(docs) {
  const { A, db } = await adminApp();
  const conv = (v) => v && typeof v === 'object' && !Array.isArray(v) ? (v.__ts != null ? A.firestore.Timestamp.fromMillis(v.__ts) : Object.fromEntries(Object.entries(v).map(([k, x]) => [k, conv(x)]))) : v;
  for (const [p, d] of Object.entries(docs)) await db.doc(p).set(conv(d));
}
export async function read(p) {
  const { db } = await adminApp();
  const s = await db.doc(p).get();
  return s.exists ? JSON.parse(JSON.stringify(s.data(), (k, v) => (v && typeof v._seconds === 'number' ? v._seconds * 1e3 + Math.round((v._nanoseconds || 0) / 1e6) : v))) : null;
}
export async function list(p) {
  const { db } = await adminApp();
  const q = await db.collection(p).get();
  return Object.fromEntries(q.docs.map((d) => [d.id, d.data()]));
}
export async function user({ uid, email, password = 'test-pass-123', name = '' }) {
  const { auth } = await adminApp();
  await auth.createUser({ uid, email, password, emailVerified: true, displayName: name });
  return { uid, email, password, name };
}

// ---- a browser like a student's (Chromebook) or a phone ----
// the students' real screens (tools/devices.mjs): Chromebook normal mode 1366 × 640 (the default), full screen 1366 × 768, ChromeOS
export { CHROMEBOOK, CHROMEBOOK_FULL, PHONE };
let browser = null;
// RU_CHROME=path: another Chrome (to try a run with an older or newer browser than the one Playwright brings)
export async function launch() { browser = browser || (await chromium.launch(process.env.RU_CHROME ? { executablePath: process.env.RU_CHROME } : {})); return browser; }
export async function close() { if (browser) await browser.close(); browser = null; if (server) server.close(); server = null; if (admin) await admin.app.delete().catch(() => {}); admin = null; }
// the site's files a page asked for and this repo does not have, since the last call
export function missing() { const m = [...missingNow]; missingNow.clear(); return m; }
// opens a new browser (a new device: nothing in it yet) signed in as `who` ({email, password}, or null for nobody).
// now: the time the page believes it is (ms); the database keeps its own real time.
export async function device(who, { size = CHROMEBOOK, now, lang = 'en-GB', local = {} } = {}) {
  const b = await launch();
  await serve();
  const ctx = await b.newContext({ ...contextOptions(size, b, { scale: process.env.SHOTS ? 2 : 1 }), locale: lang, timezoneId: 'Europe/Madrid' });
  const D = { ctx, errors: [], real: [], script: [], missing: [], pages: [] };
  await ctx.addInitScript(([who, local]) => {
    window.__RU = who;
    // what this device had in it before (once, on its first page)
    try { if (!localStorage.getItem('el_ru_local')) { for (const k in local) localStorage.setItem(k, local[k]); localStorage.setItem('el_ru_local', '1'); } } catch (e) {}
  }, [who ? { email: who.email, password: who.password } : { out: true }, Object.assign({ el_phone_seen: '1' }, local)]);
  await ctx.route((u) => !mine(u), (route) => {
    const u = new URL(route.request().url());
    if (u.host === 'www.gstatic.com' && u.pathname.startsWith('/firebasejs/10.14.1/')) {
      const f = u.pathname.split('/').pop();
      if (u.pathname.includes('/real/')) { const file = path.join(SDK, f); return fs.existsSync(file) ? route.fulfill({ status: 200, body: fs.readFileSync(file), contentType: 'text/javascript' }) : route.fulfill({ status: 404, body: '' }); }
      if (SHIM[f]) return route.fulfill({ status: 200, body: SHIM[f], contentType: 'text/javascript' });
      D.missing.push(u.href); return route.fulfill({ status: 404, body: '' });
    }
    if (REAL.test(u.host)) D.real.push(u.host + u.pathname);
    else if (SCRIPT.test(u.host)) D.script.push(u.href);
    return route.abort('blockedbyclient');
  });
  D.open = async (url, { wait = 'cloud' } = {}) => {
    const page = await ctx.newPage();
    if (now) await page.clock.setFixedTime(new Date(now));
    page.on('dialog', (d) => d.accept().catch(() => {}));
    const keep = (m) => { m = String(m); if (!/Failed to fetch dynamically imported module: https?:\/\/(?!127\\.0\\.0\\.1)|ERR_BLOCKED|net::ERR_FAILED|Load failed/.test(m)) D.errors.push(url + ': ' + m.split('\n')[0].slice(0, 240)); };
    page.on('pageerror', (e) => keep(e.message || e));
    page.on('console', (m) => { if (m.type() === 'error' && /^(Uncaught )?(\w*Error|TypeError|ReferenceError|SyntaxError)\b/.test(m.text())) keep(m.text());
      if (/real-use sign-in/.test(m.text())) keep(m.text()); });
    // the robot's mouse rests at the right edge, as a student's hand would be off the menu: Chrome starts a new page with the mouse at the
    // top left, over the LS's icon strip (.elrail), which opens on hover and then covers the learning path's tabs (seen on GitHub only)
    const rest = () => (size.phone ? Promise.resolve() : page.mouse.move(size.width - 20, Math.round(size.height / 2))).catch(() => {});
    page.on('load', rest);
    await page.goto(SITE + url, { waitUntil: 'load' });
    await rest();
    if (wait === 'cloud') await signedIn(page);
    D.pages.push(page);
    return page;
  };
  return D;
}
// waits until the page knows who is signed in (el-cloud.js ELCloud.onUser) and has read their saved work. The page may reload once by
// itself on the way (a first sign-in on a device brings the student's work from the database: el-cloud.js reloadIfStale), so it tries again.
export async function signedIn(page, timeout = 25000) {
  const t0 = Date.now();
  for (;;) {
    try {
      await page.waitForLoadState('load');
      await page.waitForFunction(() => window.ELCloud && typeof ELCloud.onUser === 'function', null, { timeout: Math.max(1000, timeout - (Date.now() - t0)) });
      await page.evaluate(() => new Promise((ok) => ELCloud.onUser(() => ok())));
      await page.waitForTimeout(700);
      if (await page.evaluate(() => !!(window.ELCloud && ELCloud.user))) return;
    } catch (e) { if (!/context was destroyed|navigation|Target closed/i.test(e.message) || Date.now() - t0 > timeout) throw e; }
    await page.waitForTimeout(300);
  }
}
// waits until the database holds what `test` wants (the page saves 1.5 s after a change)
export async function until(what, test, timeout = 12000) {
  const t0 = Date.now(); let last;
  while (Date.now() - t0 < timeout) { last = await what(); if (test(last)) return last; await new Promise((r) => setTimeout(r, 300)); }
  return last;
}
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
