#!/usr/bin/env python3
"""Pictures of the new board (board/captures, demo mode) with the parts the demo board cannot draw: the bottom bar and the purple My week
button (el-cloud.js on every page), the My week panel and the notice cards (exam results, level, correction). Those are cut from the
real screenshots of the first video (../captures, 1920 x 1080 viewport) and laid on the top of the new board at the same place, with
their rounded corners and shadow. Writes board/captures/<lang>-n*.png and adds their boxes to <lang>-boxes.json.
Run after board/capture.mjs:  python3 tools/site-video/board/compose.py
"""
import json, os
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
CAP, OLD = os.path.join(HERE, 'captures'), os.path.join(HERE, '..', 'captures')
VW, VH = 1920, 1080
# [x, y, w, h, corner radius] in the old screenshots (same viewport, same place on screen)
PIECES = {
    'pill': ('r4-10-board.png', [1648, 944, 243, 53, 26]),          # purple My week button
    'bar': ('r4-10-board.png', [1158, 1003, 752, 61, 30]),          # Your name · My activities · English Lab · Problem · Idea · Sign out
    'exam': ('4eso-09-exam-notice.png', [632, 24, 658, 300, 22]),   # "Ja tens els resultats de l'examen de la LS1!"
    'level': ('r4-12-level-notice.png', [631, 24, 659, 330, 22]),   # "Your level: 4ESO Core (B1)"
    'corr': ('r4-20-correction-card.png', [616, 24, 688, 278, 22]), # "Your teacher has corrected your work"
    'panel': ('r4-16-my-week.png', [1364, 248, 540, 682, 22]),     # the My week panel
}
EXTRA = {   # boxes inside the pieces, as the first video's shots had them
    'pill': [1648, 944, 243, 53], 'bar': [1158, 1003, 752, 61], 'idea': [1662, 1012, 104, 48], 'problem': [1522, 1013, 142, 44],
    'exam': [632, 24, 658, 300], 'exambtn': [650, 240, 270, 60], 'level': [631, 24, 659, 330], 'corr': [616, 24, 688, 278],
    'corrlink': [668, 132, 484, 40], 'panel': [1364, 248, 540, 682],
}
OUT = {   # picture: base state of the new board, pieces laid on it
    'nboard': ('top', ['pill', 'bar']), 'nlive': ('live', ['pill', 'bar']), 'nexam': ('top', ['pill', 'bar', 'exam']),
    'nlevel': ('top', ['pill', 'bar', 'level']), 'ncorr': ('top', ['pill', 'bar', 'corr']), 'nweek': ('top', ['bar', 'pill', 'panel']),
}

def lay(base, name):
    f, (x, y, w, h, r) = PIECES[name]
    piece = Image.open(os.path.join(OLD, f)).convert('RGB').crop((x, y, x + w, y + h))
    sh = Image.new('RGBA', base.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle((x, y + 6, x + w, y + h + 6), r, fill=(15, 23, 42, 60))
    sh = sh.filter(ImageFilter.GaussianBlur(10)); base.paste(sh, (0, 0), sh)
    m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), r, fill=255)
    base.paste(piece, (x, y), m)

for lang in ('en', 'ca'):
    bf = os.path.join(CAP, f'{lang}-boxes.json'); BOX = json.load(open(bf))
    for out, (state, pieces) in OUT.items():
        base = Image.open(os.path.join(CAP, f'{lang}-{state}.png')).convert('RGB').crop((0, 0, VW, VH))
        for p in pieces: lay(base, p)
        base.save(os.path.join(CAP, f'{lang}-{out}.png'))
        b = {k: v for k, v in BOX[state].items() if k != '_page' and v[1] < VH}
        b.update(EXTRA); b['_page'] = [VW, VH]; BOX[out] = b
        print('made', f'{lang}-{out}.png')
    json.dump(BOX, open(bf, 'w'), indent=1)
