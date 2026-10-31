"""Turns the raw ElevenLabs clips into the site's files: python3 tools/tts/process.py <jobs.json> <raw dir>
For each job: <ls>/audio/tts/<id>.mp3 and <id>-slow.mp3 (atempo 0.75). Listen-and-complete lines: the answer words are found with
forced alignment and covered with an 880 Hz beep (at least 0.45 s), so the student hears the real sentence with the gap.
Mono, 96 kbps, loudnorm I=-16 TP=-1.5 (AGENTS.md audio settings). Then writes each LS's data/tts.js (the list of recorded keys)."""
import json, os, subprocess, sys, tempfile
sys.path.insert(0, os.path.dirname(__file__))
from align import align

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
LS = {'2eso': '2eso/free-time-live', '4eso': '4eso/seasons-and-celebrations'}
BEEP_MIN, PAD = 0.45, 0.04
WPM, MIN_TEMPO = 175, 0.72   # some v3 takes come out at 250-340 words a minute: slow them towards 175 (never below 0.72)

def run(*a): subprocess.run(['ffmpeg', '-v', 'error', '-y', *a], check=True)

def build(job, raw, out):
    tmp = tempfile.mkdtemp()
    al = None   # word timings: for the beep and for the speed
    for t in (job['text'], job['text'].replace('.00', '')):
        try: al = align(raw, t); break
        except ValueError as e: err = e
    if al is None: raise err
    tempo = max(MIN_TEMPO, min(1.0, WPM / (len(al) / max(0.3, al[-1][2] - al[0][1]) * 60)))
    if job['mask']:
        # cut [before][beep][between]…[after]
        cuts, t = [], 0.0
        for a, b in job['mask']:
            t0, t1 = max(0, al[a][1] - PAD), al[b][2] + PAD
            cuts.append(('a', t, t0)); cuts.append(('b', max(BEEP_MIN, t1 - t0))); t = t1
        cuts.append(('a', t, None))
        parts = []
        for i, c in enumerate(cuts):
            p = os.path.join(tmp, '%02d.wav' % i)
            if c[0] == 'a':
                run('-i', raw, '-ss', str(c[1]), *(['-to', str(c[2])] if c[2] else []), '-ac', '1', '-ar', '44100', p)
            else:
                run('-f', 'lavfi', '-i', 'sine=frequency=880:sample_rate=44100:duration=%.2f' % c[1], '-af', 'volume=0.25,afade=t=in:d=0.02,afade=t=out:st=%.2f:d=0.03' % (c[1] - 0.03), '-ac', '1', p)
            parts.append(p)
        lst = os.path.join(tmp, 'l.txt'); open(lst, 'w').write(''.join("file '%s'\n" % p for p in parts))
        src = os.path.join(tmp, 'joined.wav'); run('-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', src)
    else:
        src = raw
    trim = 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse'
    clean = os.path.join(tmp, 'clean.wav'); run('-i', src, '-af', trim + ',apad=pad_dur=0.25', '-ac', '1', '-ar', '44100', clean)
    run('-i', clean, '-af', ('atempo=%.3f,' % tempo if tempo < 0.99 else '') + 'loudnorm=I=-16:TP=-1.5', '-ac', '1', '-b:a', '96k', out + '.mp3')
    run('-i', clean, '-af', 'atempo=%.3f,loudnorm=I=-16:TP=-1.5' % (0.75 * tempo), '-ac', '1', '-b:a', '96k', out + '-slow.mp3')
    return tempo

def write_manifests():
    for c, d in LS.items():
        dd = os.path.join(ROOT, d, 'audio', 'tts')
        keys = sorted(f[:-4] for f in os.listdir(dd) if f.endswith('.mp3') and not f.endswith('-slow.mp3')) if os.path.isdir(dd) else []
        open(os.path.join(ROOT, d, 'data', 'tts.js'), 'w').write(
            '/* Lines recorded with ElevenLabs (tools/tts): the engine plays audio/tts/<key>.mp3 (and -slow) instead of the browser voice. */\n'
            'window.LS2_TTS = new Set(' + json.dumps(keys) + ');\n')

if __name__ == '__main__':
    jobs, rawdir = json.load(open(sys.argv[1])), sys.argv[2]
    bad = []
    for j in jobs:
        raw = os.path.join(rawdir, j['id'] + '.mp3')
        if not os.path.exists(raw): bad.append((j['id'], 'no raw clip')); continue
        od = os.path.join(ROOT, LS[j['course']], 'audio', 'tts'); os.makedirs(od, exist_ok=True)
        try: build(j, raw, os.path.join(od, j['id']))
        except Exception as e: bad.append((j['id'], j['text'], str(e)))
    write_manifests()
    print(len(jobs) - len(bad), 'built;', len(bad), 'problems'); [print(' ', *b) for b in bad]
