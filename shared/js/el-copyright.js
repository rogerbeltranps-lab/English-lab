// Copyright line on everything students can print or save as PDF (Roger, 25 Oct 2026). The wording lives only here
// (window.EL_COPYRIGHT) and in tools/stamp-copyright.py for the downloadable PDFs: change both together.
// Chromium prints it at the foot of every page (@page margin box); other browsers print it once, at the end of the page.
// Loaded by el-cloud.js; pages without el-cloud.js load it with a plain <script>.
(function(){
  if(window.EL_COPYRIGHT)return;
  const text=window.EL_COPYRIGHT="© "+new Date().getFullYear()+" Roger Beltran · English Lab · All rights reserved";
  const brand=((navigator.userAgentData||{}).brands||[]).find(b=>b.brand==="Chromium");
  const chromium=+(brand?brand.version:(navigator.userAgent.match(/Chrom(?:e|ium)\/(\d+)/)||[])[1]||0);
  const css=chromium>=131
    ?`@page{margin-bottom:12mm;@bottom-center{content:${JSON.stringify(text)};font:8pt Arial,sans-serif;color:#5f6b73}}.el-copyright{display:none!important}`
    :`.el-copyright{display:none}@media print{.el-copyright{display:block!important;margin:14px 0 0;text-align:center;font:8pt Arial,sans-serif;color:#5f6b73}}`;
  const style=document.createElement("style");style.id="el-copyright-css";style.textContent=css;
  const add=()=>{document.head.appendChild(style);const p=document.createElement("p");p.className="el-copyright";p.textContent=text;document.body.appendChild(p)};
  document.body?add():document.addEventListener("DOMContentLoaded",add);
})();
