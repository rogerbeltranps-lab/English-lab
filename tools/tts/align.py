"""Word timings with pocketsphinx forced alignment (pip install pocketsphinx). Used by process.py and cut-chunks.py."""
import re, subprocess, unicodedata
from pocketsphinx import Decoder

# Words the default dictionary lacks (CMU phones). Add here when align() reports one.
EXTRA = {'vlog': 'V L AO G', 'vlogs': 'V L AO G Z', 'vlogger': 'V L AO G ER', 'mei': 'M EY', 'laia': 'L AY AH', 'kai': 'K AY',
         'castanyada': 'K AE S T AH N Y AA D AH', 'panellets': 'P AH N AH L EH T S', 'samhain': 'S AW IH N', 'diwali': 'D IH W AA L IY',
         'hanukkah': 'HH AA N AH K AH', 'wampanoag': 'W AA M P AH N OW AE G', 'sant': 'S AA N T', 'jordi': 'ZH AO R D IY',
         'marta': 'M AA R T AH', 'pol': 'P AO L', 'omar': 'OW M AA R', 'noah': 'N OW AH', 'ellie': 'EH L IY', 'yuki': 'Y UW K IY'}
NUM = {'0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', '10': 'ten',
       '12': 'twelve', '15': 'fifteen', '20': 'twenty', '30': 'thirty', '100': 'one hundred', '500': 'five hundred'}

SPELL = {'4b': 'four b', '4a': 'four a', '1621': 'sixteen twenty one', '1800s': 'eighteen hundreds', '1863': 'eighteen sixty three',
         '2026': 'twenty twenty six', '31st': 'thirty first', '1st': 'first', '2nd': 'second', '3rd': 'third'}

def words(text):
    """The text's words as (raw word, [dictionary tokens]); audio tags like [excited] are dropped."""
    text = re.sub(r'\[[^\]]*\]', ' ', text).replace('’', "'").replace('‘', "'")
    out = []
    for raw in text.split():
        toks = []
        for w in re.findall(r"[A-Za-zÀ-ÿ0-9']+", raw):
            w = unicodedata.normalize('NFKD', w).encode('ascii', 'ignore').decode().lower().strip("'")
            if not w: continue
            toks += (NUM.get(w) or SPELL.get(w) or w).split()
        if toks: out.append((raw, toks))
    return out

def pcm(path, start=None, end=None):
    cmd = ['ffmpeg', '-v', 'error']
    if start is not None: cmd += ['-ss', str(start)]
    if end is not None: cmd += ['-to', str(end)]
    return subprocess.run(cmd + ['-i', path, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True, check=True).stdout

def align(path, text, start=None, end=None):
    """[(raw word, t0, t1)] in seconds of the file, or raises ValueError."""
    W = words(text); flat = [t for _, ts in W for t in ts]
    dec = Decoder(samprate=16000, bestpath=False)
    missing = [t for t in flat if dec.lookup_word(t) is None and t not in EXTRA]
    if missing: raise ValueError('not in dictionary: ' + ', '.join(sorted(set(missing))))
    for t in set(flat):
        if dec.lookup_word(t) is None: dec.add_word(t, EXTRA[t], False)
    dec.set_align_text(' '.join(flat)); dec.start_utt(); dec.process_raw(pcm(path, start, end), full_utt=True); dec.end_utt()
    sg = dec.seg()
    if sg is None: raise ValueError('alignment failed')
    segs = [(s.start_frame / 100, (s.end_frame + 1) / 100) for s in sg if s.word not in ('<s>', '</s>', '<sil>', '[NOISE]')]
    if len(segs) != len(flat): raise ValueError('alignment mismatch %d/%d' % (len(segs), len(flat)))
    off = start or 0; i = 0; out = []
    for raw, ts in W:
        out.append((raw, off + segs[i][0], off + segs[i + len(ts) - 1][1])); i += len(ts)
    return out
