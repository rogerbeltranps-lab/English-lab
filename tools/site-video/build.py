#!/usr/bin/env python3
"""Builds the "How English Lab works" video from the site screenshots (captures/), the voice-over (voice/<id>.mp3,
ElevenLabs, made by voice.mjs) and script.json (English voice, Catalan subtitles) + shots.json (what each line shows).

Usage: python3 tools/site-video/build.py OUT.mp4 [--stills DIR]   (--stills: one picture per shot, to check the framing)
A line without its mp3 gets silence for an estimated time, so the video can be previewed before any audio is paid for.
Needs ffmpeg, Pillow, numpy and the Inter font. 1280x720, 30 fps, light blue cards like the shadowing videos.
"""
import json, math, os, re, subprocess, sys, tempfile
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
CAP = os.path.join(HERE, 'captures')
VOICE = os.path.join(HERE, 'voice')
W, H, FPS = 1280, 720, 30
T = {'accent': '#30578c', 'ink': '#181e2f', 'title': '#253b66', 'muted': '#626f82', 'bg1': '#eef3fd', 'bg2': '#f6f8fd', 'soft': '#e3ebf8'}
HL = (245, 158, 11)                     # highlight frame colour (amber)
FONTS = '/usr/share/fonts/opentype/inter/'
def font(w, s): return ImageFont.truetype(FONTS + {'r': 'Inter-Regular', 'm': 'Inter-Medium', 's': 'Inter-SemiBold', 'b': 'Inter-Bold', 'x': 'Inter-ExtraBold'}[w] + '.otf', s)
def rgb(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))

script = json.load(open(os.path.join(HERE, 'script.json')))
shots = json.load(open(os.path.join(HERE, 'shots.json')))
GAP, CARD, TITLE, END = 0.55, 1.7, 3.2, 1.2
SCENE_CA = {'Sign in': 'Entrar', 'Your board': 'El teu tauler', 'Your route': 'La teva ruta', 'Your week': 'La teva setmana',
            'Learning paths': 'Els learning paths', 'The menu': 'El menú', 'A Learning Situation': 'Una Learning Situation',
            'A learning path': 'Un learning path', 'Checkpoints': 'Checkpoints i activitats tancades', 'Problems': 'Si alguna cosa falla',
            'English Lab': 'Pràctica extra'}

# ---------- backgrounds and cards ----------
def gradient():
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    t = np.clip((x / W + y / H) / 2, 0, 1)[..., None]
    a, b, s = np.array(rgb(T['bg1']), np.float32), np.array(rgb(T['bg2']), np.float32), np.array(rgb(T['soft']), np.float32)
    img = a * (1 - t) + b * t
    r = np.sqrt((x - W * .88) ** 2 + (y - H * .12) ** 2)[..., None]
    k = np.clip(1 - r / (W * .32), 0, 1) * .9
    img = img * (1 - k) + s * k
    return Image.fromarray(img.astype(np.uint8))
BG = gradient()

def centered(d, y, text, f, fill):
    w = d.textlength(text, font=f)
    d.text(((W - w) / 2, y), text, font=f, fill=fill)

def brand(d):
    d.rounded_rectangle((56, 36, 92, 72), 9, fill=rgb(T['accent']))
    d.polygon([(68, 45), (82, 54), (68, 63)], fill='white')
    d.text((106, 41), 'English Lab', font=font('b', 21), fill=rgb(T['title']))
    d.text((W - 56 - d.textlength('How the website works', font=font('s', 16)), 45), 'How the website works', font=font('s', 16), fill=rgb(T['muted']))

def card(lines, sub=None, big=56, chip=None, items=None):
    im = BG.copy(); d = ImageDraw.Draw(im); brand(d)
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ds = ImageDraw.Draw(sh)
    ds.rounded_rectangle((110, 150, W - 110, 590), 28, fill=(30, 50, 90, 26)); sh = sh.filter(ImageFilter.GaussianBlur(18))
    im.paste(sh, (0, 10), sh); d = ImageDraw.Draw(im)
    d.rounded_rectangle((110, 140, W - 110, 580), 28, fill='white', outline=rgb(T['soft']), width=2)
    blocks = []
    if chip: blocks.append(('chip', chip))
    for l in lines: blocks.append(('big', l))
    if sub: blocks.append(('sub', sub))
    if items: blocks += [('item', i) for i in items]
    hs = {'chip': 52, 'big': big * 1.25, 'sub': 46, 'item': 50}
    y = 360 - sum(hs[k] for k, _ in blocks) / 2
    for k, v in blocks:
        if k == 'chip':
            f = font('s', 18); w = d.textlength(v, font=f) + 36
            d.rounded_rectangle(((W - w) / 2, y, (W + w) / 2, y + 36), 18, fill=rgb(T['accent'])); centered(d, y + 7, v, f, 'white')
        elif k == 'big': centered(d, y, v, font('x', big), rgb(T['title']))
        elif k == 'sub': centered(d, y + 10, v, font('m', 24), rgb(T['muted']))
        else:
            f = font('s', 28); w = d.textlength(v, font=f) + 40; x0 = 250
            d.ellipse((x0, y + 12, x0 + 14, y + 26), fill=rgb(T['accent'])); d.text((x0 + 34, y + 2), v, font=f, fill=rgb(T['ink']))
        y += hs[k]
    return im

def phone(img_name):
    """A phone screenshot on the blue background, at about full video height."""
    im = BG.copy(); p = Image.open(os.path.join(CAP, img_name)).convert('RGB')
    h = 640; w = round(p.width * h / p.height); p = p.resize((w, h), Image.LANCZOS)
    x, y = (W - w) // 2, 40
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle((x - 14, y - 14 + 12, x + w + 14, y + h + 14 + 12), 40, fill=(20, 30, 60, 60))
    im.paste(sh.filter(ImageFilter.GaussianBlur(16)), (0, 0), sh.filter(ImageFilter.GaussianBlur(16)))
    d = ImageDraw.Draw(im); d.rounded_rectangle((x - 14, y - 14, x + w + 14, y + h + 14), 40, fill=(24, 30, 47))
    m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, w, h), 28, fill=255); im.paste(p, (x, y), m)
    return im.resize((1920, 1080), Image.LANCZOS)

_img = {}
def source(name):
    if name not in _img:
        if name.startswith('phone:'): _img[name] = phone(name[6:])
        elif name.startswith('card:'): _img[name] = card(**json.loads(name[5:])).resize((1920, 1080), Image.LANCZOS)
        else: _img[name] = Image.open(os.path.join(CAP, name)).convert('RGB')
    return _img[name]

# ---------- camera ----------
def fit(rect, im, margin=0.06):
    """The smallest 16:9 box around rect (x, y, w, h in source pixels) with a margin, inside the image."""
    if not rect: return (0, 0, im.width, im.width * 9 / 16)
    x, y, w, h = rect; cx, cy = x + w / 2, y + h / 2
    w, h = w * (1 + 2 * margin), h * (1 + 2 * margin)
    if w / h > 16 / 9: h = w * 9 / 16
    else: w = h * 16 / 9
    w = min(w, im.width); h = w * 9 / 16
    if h > im.height: h = im.height; w = h * 16 / 9
    x0 = min(max(cx - w / 2, 0), im.width - w); y0 = min(max(cy - h / 2, 0), im.height - h)
    return (x0, y0, w, h)

def ease(t): t = min(max(t, 0), 1); return t * t * (3 - 2 * t)
def lerp(a, b, t): return tuple(p + (q - p) * t for p, q in zip(a, b))

# The screen sits in a panel above a caption band, so the subtitles never cover it (Roger, 31 Oct 2026).
PX, PY, PW, PH = 112, 14, 1056, 594
def _panel_bg():
    im = BG.copy(); sh = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle((PX - 2, PY + 6, PX + PW + 2, PY + PH + 10), 18, fill=(30, 50, 90, 70))
    sh = sh.filter(ImageFilter.GaussianBlur(12)); im.paste(sh, (0, 0), sh)
    return im
PBG = _panel_bg()
PMASK = Image.new('L', (PW, PH), 0); ImageDraw.Draw(PMASK).rounded_rectangle((0, 0, PW - 1, PH - 1), 16, fill=255)

def frame(im, view, hl, hl_a):
    x, y, w, h = view
    f = im.resize((PW, PH), Image.BILINEAR if w > 1.4 * PW else Image.BICUBIC, box=(x, y, x + w, y + h))
    if hl and hl_a > 0:
        s = PW / w; hx, hy, hw, hh = (hl[0] - x) * s, (hl[1] - y) * s, hl[2] * s, hl[3] * s
        pad = 7
        box = (hx - pad, hy - pad, hx + hw + pad, hy + hh + pad)
        dim = Image.new('L', (PW, PH), int(105 * hl_a)); ImageDraw.Draw(dim).rounded_rectangle(box, 12, fill=0)
        f = Image.composite(Image.new('RGB', (PW, PH), (15, 23, 42)), f, dim)
        ov = Image.new('RGBA', (PW, PH), (0, 0, 0, 0)); ImageDraw.Draw(ov).rounded_rectangle(box, 12, outline=HL + (int(255 * hl_a),), width=5)
        f.paste(ov, (0, 0), ov)
    out = PBG.copy(); out.paste(f, (PX, PY), PMASK)
    return out

# ---------- subtitles (Catalan), in the band under the panel ----------
SUBF = font('s', 27)
LH = 35
def wrap(text, maxw=1120):
    d = ImageDraw.Draw(Image.new('RGB', (1, 1))); out, cur = [], ''
    for wd in text.split():
        t = (cur + ' ' + wd).strip()
        if d.textlength(t, font=SUBF) > maxw and cur: out.append(cur); cur = wd
        else: cur = t
    return out + ([cur] if cur else [])

SENT = re.compile(r'(?<=[.?!])\s+')
def chunks(text):
    """Subtitle pieces of at most two lines, cut at sentence ends (or commas): [(text, first sentence index, last)]."""
    sents = [p for p in SENT.split(text) if p]
    out, cur, a = [], '', 0
    for i, p in enumerate(sents):
        t = (cur + ' ' + p).strip()
        if len(wrap(t)) <= 2: cur = t
        else:
            if cur: out.append((cur, a, i - 1))
            cur, a = p, i
    out.append((cur, a, len(sents) - 1))
    res = []
    for c, a, b in out:
        if len(wrap(c)) <= 2: res.append((c, a, b)); continue
        ws = c.split(); half = len(ws) // 2
        k = max([i for i in range(1, len(ws)) if ws[i - 1].endswith(',')] or [half], key=lambda i: -abs(i - half))
        res += [(' '.join(ws[:k]), a, b, 0.0, k / len(ws)), (' '.join(ws[k:]), a, b, k / len(ws), 1.0)]
    return [r if len(r) == 5 else r + (0.0, 1.0) for r in res]

_sub = {}
def subtitle(text):
    if text not in _sub:
        ls = wrap(text); im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dd = ImageDraw.Draw(im)
        y0 = PY + PH + 14 + (2 - len(ls)) * LH / 2 + 6
        for i, l in enumerate(ls):
            lw = dd.textlength(l, font=SUBF); dd.text(((W - lw) / 2, y0 + LH * i), l, font=SUBF, fill=rgb(T['ink']) + (255,))
        _sub[text] = im
    return _sub[text]

# ---------- when each word is said ----------
def silences(path):
    o = subprocess.run(['ffmpeg', '-i', path, '-af', 'silencedetect=n=-35dB:d=0.16', '-f', 'null', '-'], capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', o)]; en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', o)]
    return list(zip(st, en + [None] * (len(st) - len(en))))

class Clock:
    """Time of any character of the English line: sentences pinned to the pauses found in the audio, linear inside a sentence."""
    def __init__(self, text, mp3, adur):
        self.text = text; spans = [m.span() for m in re.finditer(r'[^.?!]+[.?!]*', text) if m.group().strip()]
        self.spans = [(a + len(text[a:b]) - len(text[a:b].lstrip()), b) for a, b in spans]
        n = len(self.spans); sil = silences(mp3) if mp3 else []
        head = sil[0][1] if sil and sil[0][0] < 0.05 and sil[0][1] else 0.0
        tail = next((s for s, e in sil if e is None or e >= adur - 0.05), adur) if sil else adur
        inner = [(s, e) for s, e in sil if e and s > head + 0.2 and e < tail - 0.2]
        L = sum(b - a for a, b in self.spans); acc, exp = 0, []
        for a, b in self.spans[:-1]: acc += b - a; exp.append(head + (tail - head) * acc / L)
        picked = []
        for x in exp:   # each sentence end: the pause nearest to where it would fall at an even pace
            c = [p for p in inner if p not in picked and (not picked or p[0] > picked[-1][0])]
            if not c: break
            best = min(c, key=lambda p: abs((p[0] + p[1]) / 2 - x) - 2.5 * (p[1] - p[0]))
            picked.append(best)
        if len(picked) == n - 1:
            starts = [head] + [e for s, e in picked]; ends = [s for s, e in picked] + [tail]
        else:   # fall back: share the time by length
            acc = head; starts, ends = [], []
            for a, b in self.spans: d = (tail - head) * (b - a) / L; starts.append(acc); ends.append(acc + d); acc += d
        self.t = list(zip(starts, ends))
    def at(self, pos):
        for (a, b), (s, e) in zip(self.spans, self.t):
            if pos <= b: return s + (e - s) * max(0, pos - a) / max(1, b - a)
        return self.t[-1][1]
    def word(self, w):
        i = self.text.lower().find(w.lower())
        if i < 0: raise SystemExit(f'"{w}" is not in: {self.text}')
        return self.at(i)
    def sentence(self, k, f=0.0):
        k = min(k, len(self.t) - 1); s, e = self.t[k]; return s + (e - s) * f

# ---------- timeline ----------
def dur(path):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path]).decode().strip())

segs, t, last_scene = [], 0.0, None      # (start, length, kind, data)
segs.append((t, TITLE, 'card', {'img': 'card:' + json.dumps({'lines': ['How English Lab works'], 'sub': 'Com funciona English Lab', 'big': 58, 'chip': 'English Lab · 2 ESO and 4 ESO'})}))
t += TITLE
scenes = []
for l in script['lines']:
    if l['scene'] != last_scene:
        last_scene = l['scene']; scenes.append(l['scene'])
        if l['id'] != script['lines'][0]['id'] and l['id'] != script['lines'][-1]['id']:
            n = len(scenes) - 1
            segs.append((t, CARD, 'card', {'img': 'card:' + json.dumps({'lines': [l['scene']], 'sub': SCENE_CA.get(l['scene'], ''), 'chip': f'Part {n}', 'big': 60})}))
            t += CARD
    mp3 = os.path.join(VOICE, l['id'] + '.mp3')
    a = dur(mp3) if os.path.exists(mp3) else len(l['en']) / 14.5
    L = a + GAP
    segs.append((t, L, 'line', {'line': l, 'audio': mp3 if os.path.exists(mp3) else None, 'adur': a}))
    t += L
segs.append((t, END, 'hold', {}))
TOTAL = t + END

def line_shots(l):
    sh = shots[l['id']]
    return sh if isinstance(sh, list) else [sh]

def render_line(seg_t, L, l, adur, mp3):
    """Frames for one narration line: its shots one after the other, each starting a moment before the voice says its word
    ("on"), the camera moving there and the highlight fading in as the word is said; Catalan subtitles in the band."""
    clock = Clock(l['en'], mp3, adur)
    ss = line_shots(l); n = len(ss)
    starts = []
    for i, s in enumerate(ss):
        if i == 0: starts.append(0.0)
        elif 'on' in s: starts.append(max(starts[-1] + 0.6, clock.word(s['on']) - 0.45))
        else: starts.append(s.get('at', i / n) * adur)
    subs = chunks(l['ca'])
    ca_n = len([p for p in SENT.split(l['ca']) if p])
    sub_t = [clock.sentence(a, f) if ca_n == len(clock.t) else (a + f) / ca_n * adur for _, a, b, f, g in subs]
    sub_t[0] = 0.0
    states, prev = [], None
    for i, s in enumerate(ss):
        im = source(s['img'])
        same = prev and prev[0] is im
        start = fit(s['from'], im, 0) if s.get('from') else (prev[1] if same else fit(None, im, 0))
        target = fit(s.get('view'), im, s.get('margin', 0.06)) if s.get('view') else start
        states.append((im, start, target, s.get('hl'), 0.9 if (s.get('from') or same or s.get('view')) else 0.0))
        prev = (im, target)
    for k in range(round(L * FPS)):
        tt = k / FPS
        i = max(j for j in range(n) if starts[j] <= tt + 1e-9)
        im, start, target, hl, mv = states[i]
        local = tt - starts[i]
        view = lerp(start, target, ease(local / mv)) if mv else target
        a = ease((local - mv * 0.7) / 0.35) if hl else 0
        f = frame(im, view, hl, a)
        if tt < adur + 0.3:
            j = max(j for j in range(len(subs)) if sub_t[j] <= tt + 1e-9)
            sub = subtitle(subs[j][0]); f.paste(sub, (0, 0), sub)
        yield f

def main():
    out = sys.argv[1] if len(sys.argv) > 1 else 'site-video.mp4'
    if '--stills' in sys.argv:
        d = sys.argv[sys.argv.index('--stills') + 1]; os.makedirs(d, exist_ok=True)
        for l in script['lines']:
            for i, s in enumerate(line_shots(l)):
                im = source(s['img']); f = frame(im, fit(s.get('view'), im, s.get('margin', 0.06)) if s.get('view') else fit(None, im, 0), s.get('hl'), 1)
                sub = subtitle(chunks(l['ca'])[0][0]); f.paste(sub, (0, 0), sub)
                f.save(os.path.join(d, f"{l['id']}-{i}.jpg"), quality=80)
        return
    tmp = tempfile.mkdtemp()
    video = os.path.join(tmp, 'v.mp4')
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                            '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', video], stdin=subprocess.PIPE)
    last = None
    for (st, L, kind, dd) in segs:
        if kind == 'card':
            im = source(dd['img']).resize((W, H), Image.LANCZOS); b = im.tobytes()
            for _ in range(round(L * FPS)): enc.stdin.write(b)
            last = im
        elif kind == 'hold':
            for _ in range(round(L * FPS)): enc.stdin.write(last.tobytes())
        else:
            for f in render_line(st, L, dd['line'], dd['adur'], dd['audio']):
                enc.stdin.write(f.tobytes()); last = f
        print(f'{st:7.1f}s {kind} {dd.get("line", {}).get("id", "")}', flush=True)
    enc.stdin.close(); enc.wait()
    # audio: each line's mp3 at its start time
    ins, flt = [], []
    lines = [(st, dd['audio']) for (st, L, kind, dd) in segs if kind == 'line' and dd['audio']]
    for i, (st, a) in enumerate(lines):
        ins += ['-i', a]; flt.append(f'[{i + 1}:a]aresample=44100,aformat=channel_layouts=mono,adelay={int(st * 1000)}[a{i}]')
    if lines:
        flt.append(''.join(f'[a{i}]' for i in range(len(lines))) + f'amix=inputs={len(lines)}:normalize=0,apad,atrim=0:{TOTAL:.3f}[out]')
        subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-i', video, *ins, '-filter_complex', ';'.join(flt), '-map', '0:v', '-map', '[out]',
                               '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', out])
    else:
        subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-i', video, '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-map', '0:v', '-map', '1:a',
                               '-c:v', 'copy', '-c:a', 'aac', '-shortest', '-movflags', '+faststart', out])
    print('done', out, f'{TOTAL:.1f}s')

main()
