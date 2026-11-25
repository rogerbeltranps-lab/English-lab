// 📬 Check of the student's notifications and the 🧑‍🎨 mascot in the bottom-right bar (shared/js/el-notify.js, el-cloud.js nbellStart / mzBar).
// It opens real pages with the real el-cloud.js and a FAKE Firebase (in memory, an invented student "Alex Sample"), so nothing ever reaches
// the real database, and checks that:
//   • the 📬 lists a correction, a step sent back to redo, published exam results, a problem answer and an announcement, newest first;
//   • nothing held shows: exam results waiting for 📣 Publish, an answer waiting for 17:00, a problem answer waiting for 📨 Send it;
//   • the red number counts only what is new, and opening the list takes it away (and it stays away on the next page);
//   • the 📬 makes no Firestore reads of its own (the reads are the same with and without it);
//   • the mascot with the ⚡ streak sits in the bar on every page, the board too, but not on an exam, a recall checkpoint or the sample exam;
//   • the teacher's own bar has the mascot too; the teacher's 👁 student view shows the student's 📬 and writes nothing.
// Usage: node tools/notify/check.mjs          → exit 1 and what broke.   SHOTS=dir also saves pictures (Chromebook and phone).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SHOTS = process.env.SHOTS ? path.resolve(process.env.SHOTS) : '';
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.pdf': 'application/pdf' };

// ---- the fake Firebase (the same names the site imports) ----
const FAKE_APP = `export const initializeApp=()=>({});export const getApps=()=>[{}];export const getApp=()=>({});export const deleteApp=async()=>{};`;
const FAKE_AUTH = `const F=()=>window.__FAKE;
export const getAuth=()=>({get currentUser(){return F().user}});
export const onAuthStateChanged=(a,cb)=>{setTimeout(()=>cb(F().user),0);return()=>{}};
export const onIdTokenChanged=onAuthStateChanged;
export const signOut=async()=>{};export const signInWithPopup=async()=>({user:F().user});export const signInWithEmailAndPassword=async()=>({user:F().user});
export const setPersistence=async()=>{};export const browserLocalPersistence={};export const sendPasswordResetEmail=async()=>{};
export class GoogleAuthProvider{setCustomParameters(){}}`;
const FAKE_FS = `const F=()=>window.__FAKE,clone=o=>o===undefined?undefined:JSON.parse(JSON.stringify(o));
class Ref{constructor(p,k){this.path=p;this.kind=k;this.id=p.split("/").pop();this.ws=[]}}
const S=t=>({__s:t});
export const getFirestore=()=>({});
export function doc(a,...p){if(a instanceof Ref&&a.kind==="col"&&!p.length)return new Ref(a.path+"/new"+Math.random().toString(36).slice(2,9),"doc");return new Ref([a instanceof Ref?a.path:"",...p].filter(Boolean).join("/"),"doc")}
export function collection(a,...p){return new Ref([a instanceof Ref?a.path:"",...p].filter(Boolean).join("/"),"col")}
export const collectionGroup=(db,id)=>new Ref("**/"+id,"col");
export const where=(f,op,v)=>({f,op,v});export const orderBy=()=>null;export const limit=()=>null;export const documentId=()=>"__id";
export function query(c,...ws){const q=new Ref(c.path,"col");q.ws=ws.filter(w=>w&&w.f);return q}
const get=(o,f)=>f.split(".").reduce((x,k)=>x==null?x:x[k],o);
function sdoc(p){const d=F().db[p];return {id:p.split("/").pop(),ref:new Ref(p,"doc"),exists:()=>d!==undefined,data:()=>clone(d),get:f=>get(d,f)}}
function sq(q){const pre=q.path+"/",ds=Object.keys(F().db).filter(k=>k.startsWith(pre)&&!k.slice(pre.length).includes("/")).map(sdoc)
  .filter(s=>q.ws.every(w=>{const v=get(s.data(),w.f);return w.op==="=="?v===w.v:w.op==="array-contains"?Array.isArray(v)&&v.includes(w.v):w.op==="in"?w.v.includes(v):true}));
  return {docs:ds,size:ds.length,empty:!ds.length,forEach:f=>ds.forEach(f),docChanges:()=>ds.map(d=>({type:"added",doc:d}))}}
const R=p=>{F().reads.push(p)};
export async function getDoc(r){R(r.path);return sdoc(r.path)}
export async function getDocs(q){R(q.path+"/*");return sq(q)}
export const getDocFromServer=getDoc,getDocsFromServer=getDocs;
function put(o,k,v){if(v&&v.__s==="del"){delete o[k];return}if(v&&v.__s==="ts"){o[k]=Date.now();return}if(v&&v.__s==="union"){o[k]=[...new Set([...(o[k]||[]),...v.v])];return}
  if(v&&v.__s==="inc"){o[k]=(o[k]||0)+v.v;return}if(v&&typeof v==="object"&&!Array.isArray(v)&&!v.__s){o[k]=o[k]&&typeof o[k]==="object"?o[k]:{};for(const [a,b] of Object.entries(v))put(o[k],a,b);return}o[k]=clone(v)}
function W(kind,r,d){F().writes.push({kind,path:r.path,data:clone(JSON.parse(JSON.stringify(d||null)))})}
export async function setDoc(r,d,o){W("set",r,d);const db=F().db;if(!(o&&o.merge))db[r.path]={};db[r.path]=db[r.path]||{};for(const [k,v] of Object.entries(d||{}))put(db[r.path],k,v)}
export async function updateDoc(r,d){W("update",r,d);const db=F().db;db[r.path]=db[r.path]||{};for(const [k,v] of Object.entries(d||{})){const ks=k.split("."),last=ks.pop();let o=db[r.path];for(const x of ks)o=o[x]=o[x]||{};put(o,last,v)}}
export async function deleteDoc(r){W("delete",r,null);delete F().db[r.path]}
export async function addDoc(c,d){const r=doc(c);await setDoc(r,d);return r}
export function writeBatch(){const ops=[];return {set:(r,d,o)=>ops.push(()=>setDoc(r,d,o)),update:(r,d)=>ops.push(()=>updateDoc(r,d)),delete:r=>ops.push(()=>deleteDoc(r)),commit:async()=>{for(const f of ops)await f()}}}
export async function runTransaction(db,fn){return fn({get:getDoc,set:(r,d,o)=>setDoc(r,d,o),update:updateDoc,delete:deleteDoc})}
export function onSnapshot(r,cb){setTimeout(()=>{R(r.path+"~live");cb(r.kind==="doc"?sdoc(r.path):sq(r))},0);return()=>{}}
export const serverTimestamp=()=>S("ts"),deleteField=()=>S("del"),arrayUnion=(...v)=>({__s:"union",v}),arrayRemove=()=>S("del"),increment=v=>({__s:"inc",v});
export class Timestamp{constructor(s){this.seconds=s}toMillis(){return this.seconds*1e3}toDate(){return new Date(this.toMillis())}static now(){return new Timestamp(Date.now()/1e3)}static fromMillis(m){return new Timestamp(m/1e3)}static fromDate(d){return new Timestamp(+d/1e3)}}
export const enableIndexedDbPersistence=async()=>{},initializeFirestore=()=>({}),persistentLocalCache=()=>({}),persistentMultipleTabManager=()=>({}),getCountFromServer=async q=>({data:()=>({count:sq(q).size})});`;

// ---- the invented student and their data (Wed 25 Nov 2026, 16:30 Madrid time) ----
const NOW = Date.parse('2026-11-25T16:30:00+01:00'), DAY = 864e5, iso = (t) => new Date(t).toISOString();
const UID = 'demo-alex', EMAIL = 'alex.sample@ietramuntana.cat', LS2 = '4eso-seasons-and-celebrations', LS1 = '4eso-my-real-routine';
const res = (a) => 'students/' + UID + '/results/' + a.replace('/', '__');
function data() {
  const db = {
    ['roster/' + EMAIL]: { group: '4ESOA', first: 'Alex', surname1: 'Sample' },
    ['students/' + UID]: { group: '4ESOA', name: 'Alex Sample', email: EMAIL, fbSeen: {}, examSeen: {} },
    ['students/' + UID + '/levels/' + LS2]: { level: 'safe' },
    ['ls/' + LS2]: { status: 'open', groups: ['4ESOA', '4ESOB'] },
    ['ls/' + LS1]: { status: 'open', groups: ['4ESOA', '4ESOB'] },
    // ✏️ a Listening chart corrected yesterday afternoon (shown since 17:00 yesterday)
    [res('4eso/ls2-where-traditions-come-from')]: { ls: LS2, activity: '4eso/ls2-where-traditions-come-from', updated: NOW - DAY,
      replies: { chart: 'Good work on the chart! Next time, write full answers for the last two boxes.' }, fbSig: { chart: 'x1' },
      levels: { chart: { '2.2': 'AN' } }, marked: { chart: iso(NOW - DAY - 3 * 36e5) }, fbAt: { chart: iso(NOW - DAY - 3 * 36e5) }, fbGo: { chart: iso(NOW - DAY + 30 * 6e4) },
      // 🕗 an answer to a comment waiting for 17:00 today: must NOT show
      answers: { log: { t: 'HELD-ANSWER: see you at five', at: iso(NOW + 30 * 6e4) } } },
    // ↺ a research card sent back to redo this morning
    [res('4eso/ls2-research-it-right')]: { ls: LS2, activity: '4eso/ls2-research-it-right', updated: NOW - 6 * 36e5,
      replies: { card: 'Please fill in every box with your own words, then hand it in again.' }, flags: { card: { done: 'redo', reopen: true, back: 'Please fill in every box', at: iso(NOW - 6 * 36e5) } } },
    // 📝 LS1 exam results, out since October
    [res(LS1 + '/assessment').replace('/assessment', '__assessment')]: { ls: LS1, updated: Date.parse('2026-10-20T08:00:00Z'), showFrom: '2026-10-20T08:00:00.000Z',
      sections: { listening: { score: 8 }, reading: { score: 9 }, vocabulary: { score: 22 }, grammar: { score: 25 }, wtask: { score: 6 }, wgrammar: { score: 3 }, wvocab: { score: 3 }, worg: { score: 3 } } },
    // 📝 LS2 exam marked but HELD until 📣 Publish: must NOT show
    ['students/' + UID + '/results/' + LS2 + '__assessment']: { ls: LS2, updated: NOW - 2 * DAY, showFrom: '9999-12-31T00:00:00.000Z',
      sections: { listening: { score: 16 }, reading: { score: 18 }, vocabulary: { score: 30 }, grammar: { score: 12 }, writing: { score: 8 } } },
    // 💬 an answer to a problem report (sent) and ✅ one held until 📨 Send it (must NOT show)
    'problemReplies/p1_m1': { uid: UID, kind: 'message', what: 'display', text: 'The listening does not play', where: 'Where traditions come from', en: true, created: NOW - 2 * 36e5, msgEn: 'It works now: press ▶ again.', msgCa: 'Ja funciona: torna a prémer ▶.' },
    'problemReplies/p2': { uid: UID, kind: 'fixed', what: 'other', text: 'HELD-REPLY', en: true, created: NOW - 36e5, at: Date.parse('9999-12-31T00:00:00Z') },
    // 📣 an announcement to the group
    'announcements/a1': { text: 'Bring your headphones on Friday.', en: 'Bring your headphones on Friday.', ca: 'Porteu auriculars divendres.', groups: ['4ESOA'], uids: [], to: 'group', created: NOW - 3 * 36e5, read: {} },
  };
  return db;
}
const LP = '4eso/seasons-and-celebrations/where-traditions-come-from.html';
const problems = [], ok = (c, m) => { if (!c) problems.push(m); };
const browser = await chromium.launch();

async function open(size, { teacher = false } = {}) {
  const [w, h] = size;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, locale: 'en-GB', timezoneId: 'Europe/Madrid', ...(SHOTS ? { deviceScaleFactor: 2 } : {}), ...(w < 500 ? { isMobile: true, hasTouch: true } : {}) });
  const user = teacher ? { uid: 'teacher', email: 'roger.beltranps@gmail.com', displayName: 'Teacher' } : { uid: UID, email: EMAIL, displayName: 'Alex Sample' };
  await ctx.addInitScript(([db, user, uid]) => {
    if (!window.__FAKE) { let s = null; try { s = JSON.parse(sessionStorage.getItem('__fake') || 'null'); } catch (e) {}
      window.__FAKE = { db: s || db, user: Object.assign({ getIdToken: async () => 'x' }, user), reads: [], writes: [] };
      addEventListener('pagehide', () => { try { sessionStorage.setItem('__fake', JSON.stringify(window.__FAKE.db)); } catch (e) {} }); }
    // five days of flashcards in a row (the ⚡ streak)
    try { const log = {}; for (let i = 0; i < 5; i++) { const d = new Date(Date.now() - i * 864e5); log[d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')] = [12, 0, 0]; }
      localStorage.setItem('el_flash_' + uid, JSON.stringify({ decks: { x: { c: {}, log } } })); localStorage.setItem('el_phone_seen', '1'); } catch (e) {}
  }, [data(), user, UID]);
  const real = [];
  await ctx.route('**/*', (route) => {
    const u = new URL(route.request().url());
    if (u.host === 'www.gstatic.com' && /firebasejs/.test(u.pathname)) {
      const f = /app\.js$/.test(u.pathname) ? FAKE_APP : /auth\.js$/.test(u.pathname) ? FAKE_AUTH : /firestore\.js$/.test(u.pathname) ? FAKE_FS : '';
      return route.fulfill({ status: 200, body: f, contentType: 'text/javascript' });
    }
    if (u.host !== 'el.local') { if (/firestore\.googleapis|identitytoolkit|securetoken|firebaseio|firebasestorage/.test(u.host)) real.push(u.host); return route.abort('blockedbyclient'); }
    const rel = decodeURIComponent(u.pathname).replace(/^\/+/, '').replace(/\/$/, '/index.html') || 'index.html', file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return route.fulfill({ status: 404, body: '' });
    route.fulfill({ status: 200, body: fs.readFileSync(file), contentType: TYPES[path.extname(rel)] || 'application/octet-stream' });
  });
  const page = await ctx.newPage();
  await page.clock.install({ time: NOW });
  await page.clock.resume();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message || e).split('\n')[0]));
  page.on('dialog', (d) => d.dismiss().catch(() => {}));
  if (process.env.DEBUG) page.on('console', (m) => { if (/NTLIVE/.test(m.text())) console.log(page.url(), m.text()); });
  return { ctx, page, errs, real };
}
const settle = (p, ms = 2500) => p.waitForLoadState('load').catch(() => {}).then(() => p.waitForTimeout(ms));
const closeCards = async (p) => { let empty = 0; for (let i = 0; i < 20 && empty < 3; i++) { const b = p.locator('#el-reply button, #el-announce button, #el-exam-notice button:has-text("Later"), #el-corrections button, #el-level-notice button, #el-rem [data-x], #el-rem .ft button').first();
  if (!(await b.count())) { empty++; await p.waitForTimeout(700); continue; } empty = 0; await b.click({ timeout: 1000 }).catch(() => {}); await p.waitForTimeout(400); } };
const shot = async (p, n, clip) => { if (SHOTS) await p.screenshot({ path: path.join(SHOTS, n + '.png'), ...(clip ? { clip } : {}) }); };

for (const [name, size] of [['chromebook', [1366, 768]], ['phone', [390, 844]]]) {
  const { ctx, page, errs, real } = await open(size);
  await page.goto('http://el.local/' + LP);
  await settle(page, 4000);
  await shot(page, name + '-0-cards');
  await page.waitForTimeout(3000);   // the usual cards come first, as before
  await closeCards(page);
  const bell = page.locator('#el-nbell > button');
  ok(await bell.count(), `${name}: no 📬 in the student's bar`);
  const n0 = (await bell.locator('b').textContent().catch(() => '')) || '';
  await page.locator('#el-cloud-bar').scrollIntoViewIfNeeded().catch(() => {});
  await shot(page, name + '-1-bar');
  if (SHOTS) { const r = await page.locator('#el-cloud-bar').boundingBox(); if (r) await shot(page, name + '-1b-bar-closeup', { x: Math.max(0, r.x - 30), y: Math.max(0, r.y - 70), width: Math.min(size[0] - Math.max(0, r.x - 30), r.width + 40), height: r.height + 80 }); }
  await bell.click();
  await page.waitForTimeout(500);
  const list = await page.locator('#el-npanel li').allTextContents();
  const txt = list.join('\n');
  if (process.env.DEBUG) console.log(name, list);
  await shot(page, name + '-2-open');
  ok(/corrected your work/.test(txt) && /Listening chart/.test(txt), `${name}: the corrected Listening chart is missing:\n${txt}`);
  ok(/redo it/.test(txt), `${name}: the ↺ redo is missing`);
  ok(/LS1 exam results are ready/.test(txt), `${name}: the published LS1 exam results are missing`);
  ok(/answered you/.test(txt), `${name}: the problem answer is missing`);
  ok(/Announcement/.test(txt), `${name}: the announcement is missing`);
  ok(!/LS2 exam/.test(txt), `${name}: HELD LS2 exam results show!`);
  ok(!/HELD/.test(txt) && !(await page.content()).includes('HELD-'), `${name}: a held answer or problem answer shows!`);
  const dots = await page.locator('#el-npanel li.nw').count();
  ok(+n0 >= 1 && +n0 === dots, `${name}: the red number (${n0 || 'empty'}) is not the number of new items in the list (${dots})`);
  await page.locator('#el-npanel [data-x]').click();
  ok(!(await bell.locator('b').count()), `${name}: the red number is still there after opening the list`);
  // the mascot with ⚡ 5 in the bar
  const mz = page.locator('#el-cloud-bar .elcb-mz');
  ok(await mz.count(), `${name}: no mascot in the bar`);
  ok(/5/.test(await mz.locator('.elmz-badge').textContent().catch(() => '')), `${name}: the ⚡ streak number is not 5`);
  // next page: the number stays away, the board has the mascot in the bar too, the sample exam has neither
  await page.goto('http://el.local/today.html');
  await settle(page, 3500); await closeCards(page);
  if (await page.locator('#el-nbell > button b').count()) { await page.evaluate(() => document.querySelector('#el-nbell > button').click()); await page.waitForTimeout(300);
    problems.push(`${name}: the red number came back on the next page: ` + (await page.locator('#el-npanel li.nw').allTextContents()).join(' | ')); await page.keyboard.press('Escape'); }
  ok(await page.locator('#el-cloud-bar .elcb-mz').count(), `${name}: the board has no mascot in the bar`);
  if (SHOTS) { await closeCards(page); await page.waitForTimeout(500); await page.locator('#el-cloud-bar').scrollIntoViewIfNeeded().catch(() => {}); const r = await page.locator('#el-cloud-bar').boundingBox(); if (r) await shot(page, name + '-3-board-bar', { x: Math.max(0, r.x - 30), y: Math.max(0, r.y - 70), width: Math.min(size[0] - Math.max(0, r.x - 30), r.width + 40), height: r.height + 80 }); }
  await page.goto('http://el.local/4eso/seasons-and-celebrations/sample-exam.html');
  await settle(page, 2500);
  ok(!(await page.locator('#el-cloud-bar .elcb-mz, #el-nbell').count()), `${name}: the sample exam shows the mascot or the 📬`);
  ok(!errs.length, `${name}: JavaScript errors: ${[...new Set(errs)].join(' | ')}`);
  ok(!real.length, `${name}: tried to reach the real database: ${[...new Set(real)].join(', ')}`);
  await ctx.close();
}

// reads: the same page with and without the 📬 module (blocked) reads the same documents
{
  const reads = [];
  for (const block of [false, true]) {
    const { ctx, page } = await open([1366, 768]);
    if (block) await page.route('**/el-notify.js', (r) => r.fulfill({ status: 200, body: 'export function studentBell(){throw new Error("off")}', contentType: 'text/javascript' }));
    await page.goto('http://el.local/' + LP);
    await settle(page, 4000);
    // the mascot's own read of the account's flashcards (el-cloud.js mzSync, once every 30 minutes) is not the 📬's
    reads.push((await page.evaluate(() => window.__FAKE.reads.filter((p) => !p.endsWith('~live') && !p.endsWith('/flashcards/all')))).sort().join(','));
    await ctx.close();
  }
  ok(reads[0] === reads[1], `the 📬 makes reads of its own:\nwith:    ${reads[0]}\nwithout: ${reads[1]}`);
}

// the teacher's 👁 student view: the student's 📬, nothing written
{
  const { ctx, page, errs } = await open([1366, 768], { teacher: true });
  // the teacher's own bar has the mascot with his ⚡ too (Roger, 25 Nov 2026: "the mascot shoulb always visble here")
  await page.goto('http://el.local/' + LP);
  await settle(page, 4000);
  ok(await page.locator('#el-cloud-bar .elcb-mz').count(), "teacher: no mascot in the teacher's own bar");
  if (SHOTS) { await page.locator('#el-cloud-bar').scrollIntoViewIfNeeded().catch(() => {}); const r = await page.locator('#el-cloud-bar').boundingBox(); if (r) await shot(page, 'teacher-bar', { x: Math.max(0, r.x - 30), y: Math.max(0, r.y - 70), width: r.width + 40, height: r.height + 80 }); }
  await page.goto('http://el.local/today.html?student=' + UID);
  await settle(page, 3000);
  await page.goto('http://el.local/' + LP);
  await settle(page, 4000);
  const before = await page.evaluate(() => window.__FAKE.writes.length);
  const bell = page.locator('#el-nbell > button');
  ok(await bell.count(), '👁 student view: no student 📬');
  ok(!/🔔/.test(await bell.textContent().catch(() => '')), '👁 student view: the student\'s notifications use the teacher\'s 🔔');
  if (SHOTS) { await page.locator('#el-cloud-bar').scrollIntoViewIfNeeded().catch(() => {}); const r = await page.locator('#el-cloud-bar').boundingBox(); if (r) await shot(page, 'student-view-bar', { x: Math.max(0, r.x - 30), y: Math.max(0, r.y - 70), width: r.width + 40, height: r.height + 80 }); }
  if (await bell.count()) { await bell.click(); await page.waitForTimeout(400);
    const txt = (await page.locator('#el-npanel li').allTextContents()).join('\n');
    ok(/corrected your work/.test(txt) && !/LS2 exam/.test(txt), '👁 student view: the list is not what the student sees:\n' + txt);
    await shot(page, 'student-view'); }
  const w = await page.evaluate((b) => window.__FAKE.writes.slice(b).filter((x) => /fbSeen|examSeen|read\./.test(JSON.stringify(x))), before);
  ok(!w.length, '👁 student view wrote: ' + JSON.stringify(w));
  ok(!errs.length, `👁 student view: JavaScript errors: ${[...new Set(errs)].join(' | ')}`);
  await ctx.close();
}

await browser.close();
if (problems.length) { console.log('❌ ' + problems.length + ' problem(s):\n- ' + problems.join('\n- ')); process.exit(1); }
console.log('✅ The students\' 📬 and the mascot in the bar work, nothing held shows, no reads of their own.');
