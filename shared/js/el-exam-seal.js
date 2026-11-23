/* 🔐 Sealed exam code (Roger, 23 Nov 2026: "can we send the mail with the text encripted?").
   When a web exam can't be turned in, the student emails it to the teacher from their own Gmail (el-web-exam.js stuckBox). The email
   carries the answers as one sealed code, not as text the student can read or edit before pressing Send: the answers are packed (JSON,
   deflate when the browser has it) and encrypted with AES-GCM, which also seals them, so changing a single letter makes the code fail to
   open. The teacher pastes the code in 📥 Open an emailed exam on the dashboard (teacher.html wxMailDlg), which opens it here.
   The site is public, so the passphrase is not a secret: this stops reading and editing in the email, not a skilled programmer.
   ELExamSeal.seal(obj) → Promise<text block> · ELExamSeal.open(text) → Promise<obj> (throws 'nocode' / 'broken') · ELExamSeal.ok */
(function () {
  const PASS = 'English Lab · web exam seal · v1';
  const HEAD = '-----BEGIN ENGLISH LAB EXAM-----', FOOT = '-----END ENGLISH LAB EXAM-----';
  const cs = globalThis.crypto && crypto.subtle, enc = new TextEncoder(), dec = new TextDecoder();
  let kp = null;
  const key = () => kp || (kp = cs.digest('SHA-256', enc.encode(PASS)).then(h => cs.importKey('raw', h, 'AES-GCM', false, ['encrypt', 'decrypt'])));
  const pipe = async (bytes, S) => new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new S('deflate-raw'))).arrayBuffer());
  const zip = typeof CompressionStream === 'function', unzip = typeof DecompressionStream === 'function';
  const b64 = u => { let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const unb64 = s => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
  async function seal(obj) {
    let body = enc.encode(JSON.stringify(obj)), z = 0;
    if (zip) { try { body = await pipe(body, CompressionStream); z = 1; } catch (e) { body = enc.encode(JSON.stringify(obj)); } }
    const iv = crypto.getRandomValues(new Uint8Array(12)), ct = new Uint8Array(await cs.encrypt({ name: 'AES-GCM', iv }, await key(), body));
    const all = new Uint8Array(2 + 12 + ct.length); all[0] = 1; all[1] = z; all.set(iv, 2); all.set(ct, 14);
    return HEAD + '\n' + b64(all).match(/.{1,60}/g).join('\n') + '\n' + FOOT;
  }
  async function open(text) {
    const t = String(text || ''), a = t.indexOf(HEAD), b = t.indexOf(FOOT, a + 1);
    const raw = (a >= 0 && b > a ? t.slice(a + HEAD.length, b) : t).replace(/[^A-Za-z0-9_-]/g, '');   // Gmail may break lines or add '>' when quoting
    if (raw.length < 40) throw new Error('nocode');
    let all; try { all = unb64(raw); } catch (e) { throw new Error('broken'); }
    if (all[0] !== 1) throw new Error('broken');
    let body; try { body = new Uint8Array(await cs.decrypt({ name: 'AES-GCM', iv: all.slice(2, 14) }, await key(), all.slice(14))); } catch (e) { throw new Error('broken'); }   // a changed letter fails here
    if (all[1] === 1) { if (!unzip) throw new Error('browser'); body = await pipe(body, DecompressionStream); }
    return JSON.parse(dec.decode(body));
  }
  window.ELExamSeal = { seal, open, ok: !!cs };
})();
