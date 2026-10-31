"""Micro-dictation bits cut from the LS's own ElevenLabs recordings (no credits): python3 tools/tts/cut-chunks.py [course] [lp]
For each chunk of a listening panel: find it in the recording's script (media.script of any panel with the same audio) or in the video's
.vtt, align that line, cut the chunk with a little air and write <ls>/audio/tts/<key>.mp3 and -slow.mp3 (atempo 0.75)."""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(__file__))
from align import align, words
from process import ROOT, LS, run, write_manifests

FROZEN = {'2eso': [1], '4eso': [1, 2]}
def node_json(js):
    return json.loads(subprocess.run(['node', '-e', js], capture_output=True, text=True, check=True).stdout)

def lps(d):
    return node_json(r'''const fs=require('fs'),path=require('path'),vm=require('vm');const d=%s;const out=[];
for(const f of fs.readdirSync(path.join(d,'data')).filter(f=>f.endsWith('.js')&&f!=='tts.js')){const ctx={window:{}};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(d,'data',f),'utf8'),ctx);if(ctx.window.LP)out.push(ctx.window.LP)}console.log(JSON.stringify(out))''' % json.dumps(d))

def norm(s): return [t for _, ts in words(s) for t in ts]
key = lambda s: subprocess.run(['node', '-e', 'process.stdout.write(require(%s)(%s))' % (json.dumps(os.path.join(os.path.dirname(__file__), 'tts-key.js')), json.dumps(s))], capture_output=True, text=True).stdout

def vtt(f):
    out = []
    for c in open(f, encoding='utf8').read().strip().split('\n\n')[1:]:
        L = c.split('\n'); t0, t1 = [sum(float(x) * 60 ** i for i, x in enumerate(reversed(t.strip().split(':')))) for t in L[1].split('-->')]
        txt = ' '.join(L[2:]); out.append((txt.split(': ', 1)[1] if re.match(r'^[A-Z][\w .]*: ', txt) else txt, t0, t1))
    return out

def find(chunk, line):
    c, l = norm(chunk), norm(line)
    for i in range(len(l) - len(c) + 1):
        if l[i:i + len(c)] == c: return i
    return None

if __name__ == '__main__':
    onlyC, onlyN = (sys.argv[1:] + [None, None])[:2]
    bad = []; n = 0
    for c, d in LS.items():
        if onlyC and c != onlyC: continue
        base = os.path.join(ROOT, d); all_lp = lps(base)
        scripts = {p['media']['audio']: p['media']['script'] for lp in all_lp for p in lp.get('panels', []) if p.get('media', {}).get('script') and p['media'].get('audio')}
        for lp in all_lp:
            if not lp.get('n') or lp['n'] in FROZEN[c] or (onlyN and lp['n'] != int(onlyN)): continue
            for p in lp.get('panels', []):
                m = p.get('media') or {}
                for ch in p.get('chunks') or []:
                    srcs = []
                    if m.get('audio') in scripts: srcs.append((m['audio'], [(l[1], None, None) for l in scripts[m['audio']]]))
                    vids = m.get('videos') or []; vids = vids if isinstance(vids, list) else [vids]
                    for v in vids: srcs.append((v['base'] + '.mp4', vtt(os.path.join(base, v['base'] + '.vtt'))))
                    hit = None
                    for f, lines in srcs:
                        for i, (line, t0, t1) in enumerate(lines):
                            k = find(ch, line)
                            if k is not None: hit = (f, lines, i, k); break
                        if hit: break
                    if not hit: bad.append((c, lp['n'], ch, 'not found in the recording')); continue
                    f, lines, i, k = hit
                    try:
                        if lines[i][1] is not None: al = align(os.path.join(base, f), lines[i][0], lines[i][1], lines[i][2] + 0.3)
                        else:
                            full = align(os.path.join(base, f), ' '.join(l[0] for l in lines))
                            off = sum(len(words(l[0])) for l in lines[:i]); al = full[off:off + len(words(lines[i][0]))]
                        # word k counts dictionary tokens; map to raw words
                        toks = 0; wi = 0
                        while toks < k: toks += len(words(al[wi][0])[0][1]); wi += 1
                        we = wi; got = 0; need = len(norm(ch))
                        while got < need: got += len(words(al[we][0])[0][1]); we += 1
                        t0, t1 = al[wi][1] - 0.08, al[we - 1][2] + 0.12
                        out = os.path.join(base, 'audio', 'tts', key(ch)); os.makedirs(os.path.dirname(out), exist_ok=True)
                        af = 'afade=t=in:d=0.03,afade=t=out:st=%.2f:d=0.06,apad=pad_dur=0.25' % (t1 - t0 - 0.06)
                        run('-ss', '%.3f' % t0, '-to', '%.3f' % t1, '-i', os.path.join(base, f), '-vn', '-af', af + ',loudnorm=I=-16:TP=-1.5', '-ac', '1', '-b:a', '96k', out + '.mp3')
                        run('-ss', '%.3f' % t0, '-to', '%.3f' % t1, '-i', os.path.join(base, f), '-vn', '-af', af + ',atempo=0.75,loudnorm=I=-16:TP=-1.5', '-ac', '1', '-b:a', '96k', out + '-slow.mp3')
                        n += 1
                    except Exception as e: bad.append((c, lp['n'], ch, str(e)))
    write_manifests()
    print(n, 'chunks cut;', len(bad), 'problems'); [print(' ', *b) for b in bad]
