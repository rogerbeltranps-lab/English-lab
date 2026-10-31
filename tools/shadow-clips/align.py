# Forced alignment of each mp3 listening's script (scripts.json) against the mp3 and its -slow copy: the start and end second of every line.
# Usage: python3 tools/shadow-clips/align.py <work dir>   (needs ffmpeg and pip install pocketsphinx). Add names missing from the dictionary to EXTRA, numbers to NUM.
import json, re, subprocess, sys
from pocketsphinx import Decoder
S=sys.argv[1]; sc=json.load(open(S+"/scripts.json"))
EXTRA={'laia':'L AY AH','samhain':'S AW IH N','wampanoag':'W AA M P AH N OW AE G'}
NUM={'1621':'sixteen twenty one','1800s':'eighteen hundreds','1863':'eighteen sixty three','4B':'four b'}
def words(l):
  import unicodedata
  l=re.sub(r'\[[^\]]*\]','',l); l=unicodedata.normalize('NFKD',l.replace('’',"'")).encode('ascii','ignore').decode().replace('’',"'")
  for k,v in NUM.items(): l=l.replace(k,v)
  return [w.lower().strip("'") for w in re.findall(r"[A-Za-z’']+", l.replace('’',"'"))]
res={}
for mp3, lines in sc.items():
  for suf in ['','-slow']:
    f=mp3.replace('.mp3',suf+'.mp3')
    pcm=subprocess.run(['ffmpeg','-v','error','-i',f,'-ac','1','-ar','16000','-f','s16le','-'],capture_output=True).stdout
    dec=Decoder(samprate=16000, bestpath=False)
    for w,p in EXTRA.items(): dec.add_word(w,p,False)
    lw=[words(l) for l in lines]
    dec.set_align_text(' '.join(w for l in lw for w in l))
    dec.start_utt(); dec.process_raw(pcm, full_utt=True); dec.end_utt()
    sg=dec.seg()
    if sg is None: print("FAIL",f); continue
    segs=[(s.word, s.start_frame/100, (s.end_frame+1)/100) for s in sg if s.word not in ('<s>','</s>','<sil>','[NOISE]')]
    n=sum(len(l) for l in lw)
    if len(segs)!=n: print('MISMATCH',f,len(segs),n); continue
    i=0; out=[]
    for l in lw:
      ws=segs[i:i+len(l)]; i+=len(l); out.append([round(ws[0][1],2), round(ws[-1][2],2)])
    res[f]=out; print(f, out[:3], '...', out[-1])
json.dump(res, open(S+"/times.json","w"), indent=1)
