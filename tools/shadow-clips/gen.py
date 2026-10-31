# Builds the shadowing clips (data for type: 'shadow' panels) from times.json (mp3) or the .vtt cues (video): PLAN = (LS folder, page, panel
# to insert before, recording, first line, last line). LS2 used the PLAN below (30 Oct 2026). Usage: python3 tools/shadow-clips/gen.py <work dir>
import json, re, sys
S=sys.argv[1]
T=json.load(open(S+"/times.json"))
def vtt(f):
  out=[]
  for c in open(f).read().strip().split("\n\n")[1:]:
    L=c.split("\n"); a,z=L[1].split(" --> ")
    s=lambda x: sum(float(p)*m for p,m in zip(x.split(":"),[3600,60,1]))
    txt=" ".join(L[2:]); sp,_,rest=txt.partition(": ")
    out.append((s(a),s(z),[sp,rest] if rest else [txt]))
  return out
def script(datafile, audio):
  import subprocess
  js="global.window={};eval(require('fs').readFileSync(%r,'utf8'));const p=window.LP.panels.find(p=>p.media&&p.media.audio===%r);console.log(JSON.stringify(p.media))"%(datafile,audio)
  m=json.loads(subprocess.run(["node","-e",js],capture_output=True,text=True).stdout); return m
clean=lambda s: re.sub(r"\s+"," ",re.sub(r"\[[^\]]*\]","",s)).strip()
# course dir, data file, insert before panel, source, line range (inclusive)
PLAN=[
 ("4eso/seasons-and-celebrations","celebrations-around-the-world","grammar","video/halloween-castanyada",9,12),
 ("4eso/seasons-and-celebrations","where-traditions-come-from","grammar","audio/culture-bites-origins",6,9),
 ("4eso/seasons-and-celebrations","research-it-right","talk","audio/culture-bites-origins",0,3),
 ("4eso/seasons-and-celebrations","plan-the-day","grammar","audio/student-council-meeting",0,7),
 ("4eso/seasons-and-celebrations","write-to-the-head-teacher","grammar","audio/student-council-meeting",8,16),
 ("2eso/free-time-live","what-are-they-doing","grammar","audio/live-from-the-sports-hall",0,2),
 ("2eso/free-time-live","now-or-usually","grammar","video/mei-ice-rink",0,5),
 ("2eso/free-time-live","check-the-source","talk","audio/live-from-the-sports-hall",3,5),
 ("2eso/free-time-live","likes-and-screen-tips","grammar","audio/screen-smart",2,4),
 ("2eso/free-time-live","write-your-vlog-script","grammar","video/noah-bike-park",0,6),
]
TITLES={}
res=[]
for d,page,before,src,a,b in PLAN:
  if src.startswith("video/"):
    n=vtt(f"{d}/{src}.vtt"); sl=vtt(f"{d}/{src}-slow.vtt")
    lines=[x[2] for x in n[a:b+1]]; t=[n[a][0],n[b][1]]; ts=[sl[a][0],sl[b][1]]
    title={"halloween-castanyada":"Culture Bites: Halloween and the Castanyada","mei-ice-rink":"Mei: Saturday at the ice rink","noah-bike-park":"Noah: Saturday at the bike park"}[src.split("/")[1]]
    clip=dict(title=title,video=True,src=src+".mp4",slow=src+"-slow.mp4",poster=src+"-poster.jpg")
  else:
    m=script(f"{d}/data/{page}.js" if page not in ("research-it-right","write-to-the-head-teacher","check-the-source") else f"{d}/data/{page}.js", src+".mp3")
    n=T[f"{d}/{src}.mp3"]; sl=T[f"{d}/{src}-slow.mp3"]
    lines=m["script"][a:b+1]; t=[n[a][0],n[b][1]]; ts=[sl[a][0],sl[b][1]]
    nxt=n[b+1][0] if b+1<len(n) else None; nxts=sl[b+1][0] if b+1<len(sl) else None
    clip=dict(title=m.get("title"),src=src+".mp3",slow=src+"-slow.mp3")
  pad=lambda r,nx: [round(max(0,r[0]-0.25),2), round(min(r[1]+0.45, (nx-0.1) if nx else r[1]+0.45),2)]
  if src.startswith("audio/"): t=pad(t,nxt); ts=pad(ts,nxts)
  else: t=[round(max(0,t[0]-0.1),2),round(t[1]+0.15,2)]; ts=[round(max(0,ts[0]-0.1),2),round(ts[1]+0.15,2)]
  clip["t"]=t; clip["ts"]=ts
  clip["lines"]=[[clean(x) for x in l] if isinstance(l,list) else clean(l) for l in lines]
  res.append(dict(dir=d,page=page,before=before,clip=clip,len=round(t[1]-t[0],1),lens=round(ts[1]-ts[0],1)))
json.dump(res,open(S+"/clips.json","w"),indent=1,ensure_ascii=False)
for r in res: print(r["page"],r["clip"]["src"],r["clip"]["t"],r["len"],"s / slow",r["lens"],"s",len(r["clip"]["lines"]),"lines")
