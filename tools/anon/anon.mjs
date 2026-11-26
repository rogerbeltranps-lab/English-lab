// 🕶 Marking never sees who the student is (Roger, 26 Nov 2026: "even if you correct student's work you never read their names so that you
// don't know who they are"; docs/REQUIREMENTS.md § 8 "Anonymous marking"). Every tool that hands students' work to Beltran (Claude) or
// Roig (Gemini) shows students as codes (S-xxxx, ELMark.codes) and runs their own words through mask() first: every first name and surname
// of the school's students (roster + students, so a classmate's name is caught too) becomes [Name 1], [Name 2]… The tool keeps the map and
// puts the real words back with unmask() in what is saved for the student, so the student's text and correction are unchanged.
//   nameWords(people)        people = [{name, first, surname1, surname2}, …] or strings → Set of bare words (accents off, lower case, ≥ 3 letters)
//   mask(text, words, map)   → the text with the names as [Name n]; map = {} shared by all the texts of one student (same name, same n)
//   unmask(text, map)        → [Name n] back to the student's own word
//   maskDeep(value, words, map) / unmaskDeep(value, map): the same on every string of an object or array
// A first name that is also an ordinary word (Will, Mark, Rose, Mar, Pau…) is masked only with a capital letter.
const bare=s=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
const STOP=new Set(["del","las","los","the","van","von","and","dos","san","sant","santa","mas"]);
const COMMON=new Set(["will","mark","may","rose","grace","hope","max","mar","sol","pau","joy","sky","ivy","jade","april","june","lily","faith","art","bill","jack","eve","dawn","summer","angel","rey","luz","cruz","paz","pilar","nil","bruna","blanca","clara","alba","ruby","amber","pearl","august","duke","king","rich","young","long","white","brown","green","black","price","hall","wood","stone","hill","may","star","ona","lluna","neu","gil","mora","rubi","olivia"]);
export function nameWords(people){const out=new Set();
  for(const p of people||[]){const parts=typeof p==="string"?[p]:[p&&p.name,p&&p.first,p&&p.surname1,p&&p.surname2,p&&p.label];
    for(const s of parts)for(const w of bare(s).split(/[^a-z'’-]+/))for(const x of [w,...w.split("-")])if(x.length>=3&&!STOP.has(x))out.add(x)}
  return out}
const TOK=/[\p{L}][\p{L}'’-]*/gu;
export function mask(text,words,map={}){if(text==null||!words||!words.size)return text;
  map.__n=map.__n||0;
  return String(text).replace(TOK,tok=>{const m=/^(.*?)(['’]s)?$/u.exec(tok),core=m[1],tail=m[2]||"",b=bare(core);
    if(!words.has(b)||COMMON.has(b)&&core[0]===core[0].toLowerCase())return tok;
    let e=map[b];if(!e){e=map[b]={n:++map.__n,w:core}}return "[Name "+e.n+"]"+tail})}
export function unmask(text,map){if(text==null||!map)return text;const by={};for(const [k,e] of Object.entries(map))if(k!=="__n")by[e.n]=e.w;
  return String(text).replace(/\[Name (\d+)\]/g,(x,n)=>by[n]||"…")}
export const maskDeep=(v,words,map)=>typeof v==="string"?mask(v,words,map):Array.isArray(v)?v.map(x=>maskDeep(x,words,map)):v&&typeof v==="object"?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,maskDeep(x,words,map)])):v;
export const unmaskDeep=(v,map)=>typeof v==="string"?unmask(v,map):Array.isArray(v)?v.map(x=>unmaskDeep(x,map)):v&&typeof v==="object"?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,unmaskDeep(x,map)])):v;
// a code for a student that says nothing about who they are (as ELMark.codes: S- + the first letters of the uid)
export const codeOf=uid=>"S-"+String(uid||"").slice(0,6);
