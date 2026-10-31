#!/usr/bin/env python3
"""Builds the "How English Lab works" video from the site screenshots (captures/), the voice-over (voice/<id>.mp3,
ElevenLabs, made by voice.mjs) and script.json (English voice, Catalan subtitles) + shots.json (what each line shows).

Usage: python3 tools/site-video/build.py OUT.mp4 [--stills DIR]   (--stills: one picture per shot, to check the framing)
A line without its mp3 gets silence for an estimated time, so the video can be previewed before any audio is paid for.
Needs ffmpeg, Pillow, numpy and the Inter font. 1280x720, 30 fps, light blue cards like the shadowing videos.
"""
import json, math, os, subprocess, sys, tempfile
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

def frame(im, view, hl, hl_a):
    x, y, w, h = view
    f = im.resize((W, H), Image.BILINEAR if w > 1.4 * W else Image.BICUBIC, box=(x, y, x + w, y + h))
    if hl and hl_a > 0:
        s = W / w; hx, hy, hw, hh = (hl[0] - x) * s, (hl[1] - y) * s, hl[2] * s, hl[3] * s
        pad = 8
        box = (hx - pad, hy - pad, hx + hw + pad, hy + hh + pad)
        dim = Image.new('L', (W, H), int(100 * hl_a)); ImageDraw.Draw(dim).rounded_rectangle(box, 14, fill=0)
        f = Image.composite(Image.new('RGB', (W, H), (15, 23, 42)), f, dim)
        ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(ov).rounded_rectangle(box, 14, outline=HL + (int(255 * hl_a),), width=5)
        f.paste(ov, (0, 0), ov)
    return f

# ---------- subtitles ----------
SUBF = font('s', 29)
def wrap(text, maxw=1060):
    d = ImageDraw.Draw(Image.new('RGB', (1, 1))); out, cur = [], ''
    for wd in text.split():
        t = (cur + ' ' + wd).strip()
        if d.textlength(t, font=SUBF) > maxw and cur: out.append(cur); cur = wd
        else: cur = t
    return out + ([cur] if cur else [])

def chunks(text):
    """Subtitle pieces of at most two lines, cut at sentence ends (or commas) when the text is longer."""
    if len(wrap(text)) <= 2: return [text]
    import re
    parts = [p for p in re.split(r'(?<=[.?!:])\s+', text) if p]
    out, cur = [], ''
    for p in parts:
        t = (cur + ' ' + p).strip()
        if len(wrap(t)) <= 2: cur = t
        else:
            if cur: out.append(cur)
            cur = p
    out.append(cur)
    res = []
    for c in out:
        if len(wrap(c)) <= 2: res.append(c); continue
        ws = c.split(); half = len(ws) // 2
        k = max([i for i in range(1, len(ws)) if ws[i - 1].endswith(',')] or [half], key=lambda i: -abs(i - half))
        res += [' '.join(ws[:k]), ' '.join(ws[k:])]
    return res

_sub = {}
def subtitle(text):
    if text not in _sub:
        ls = wrap(text); d = ImageDraw.Draw(Image.new('RGB', (1, 1)))
        w = max(d.textlength(l, font=SUBF) for l in ls) + 44; h = 42 * len(ls) + 22
        im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dd = ImageDraw.Draw(im)
        x0, y0 = (W - w) / 2, H - 26 - h
        dd.rounded_rectangle((x0, y0, x0 + w, y0 + h), 14, fill=(15, 23, 42, 205))
        for i, l in enumerate(ls):
            lw = dd.textlength(l, font=SUBF); dd.text(((W - lw) / 2, y0 + 11 + 42 * i), l, font=SUBF, fill=(255, 255, 255, 255))
        _sub[text] = im
    return _sub[text]

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

def render_line(seg_t, L, l, adur):
    """Yields frames for one narration line: its shots one after the other (camera move + highlight), Catalan subtitles."""
    ss = line_shots(l); n = len(ss)
    cuts = [s.get('at', i / n) for i, s in enumerate(ss)] + [1.0]
    subs = chunks(l['ca']); w = [len(s) for s in subs]; sb = np.cumsum([0] + w) / sum(w) * adur
    nf = round(L * FPS)
    prev_view = None
    states = []
    for i, s in enumerate(ss):
        im = source(s['img'])
        start = fit(s['from'], im, 0) if s.get('from') else (prev_view if prev_view and s.get('continue') else fit(None, im, 0))
        target = fit(s.get('view'), im, s.get('margin', 0.06)) if s.get('view') else start
        states.append((im, start, target, s.get('hl')))
        prev_view = target
    for k in range(nf):
        tt = k / FPS; p = tt / L
        i = max(j for j in range(n) if cuts[j] <= p + 1e-9)
        im, start, target, hl = states[i]
        t0 = cuts[i] * L; local = tt - t0
        view = lerp(start, target, ease(local / 1.1))
        a = ease((local - 1.0) / 0.4) if hl else 0
        f = frame(im, view, hl, a)
        j = min(int(np.searchsorted(sb, tt, side='right')) - 1, len(subs) - 1)
        if tt < adur + 0.25:
            sub = subtitle(subs[max(j, 0)]); f.paste(sub, (0, 0), sub)
        yield f

def main():
    out = sys.argv[1] if len(sys.argv) > 1 else 'site-video.mp4'
    if '--stills' in sys.argv:
        d = sys.argv[sys.argv.index('--stills') + 1]; os.makedirs(d, exist_ok=True)
        for l in script['lines']:
            for i, s in enumerate(line_shots(l)):
                im = source(s['img']); f = frame(im, fit(s.get('view'), im, s.get('margin', 0.06)) if s.get('view') else fit(None, im, 0), s.get('hl'), 1)
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
            for f in render_line(st, L, dd['line'], dd['adur']):
                enc.stdin.write(f.tobytes()); last = f
        print(f'{st:7.1f}s {kind} {dd.get("line", {}).get("id", "")}', flush=True)
    enc.stdin.close(); enc.wait()
    # audio: each line's mp3 at its start time
    ins, flt = [], []
    lines = [(st, dd['audio']) for (st, L, kind, dd) in segs if kind == 'line' and dd['audio']]
    for i, (st, a) in enumerate(lines):
        ins += ['-i', a]; flt.append(f'[{i}:a]aresample=44100,aformat=channel_layouts=mono,adelay={int(st * 1000)}[a{i}]')
    if lines:
        flt.append(''.join(f'[a{i}]' for i in range(len(lines))) + f'amix=inputs={len(lines)}:normalize=0,apad,atrim=0:{TOTAL:.3f}[out]')
        subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-i', video, *ins, '-filter_complex', ';'.join(flt), '-map', '0:v', '-map', '[out]',
                               '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', out])
    else:
        subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-i', video, '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-map', '0:v', '-map', '1:a',
                               '-c:v', 'copy', '-c:a', 'aac', '-shortest', '-movflags', '+faststart', out])
    print('done', out, f'{TOTAL:.1f}s')

main()
