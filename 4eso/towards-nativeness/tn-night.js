/* 🌙 Night mode for Towards Nativeness only (Roger, 21 Nov 2026: "Can towards nativeness have dark mode at night?").
   Auto: dark from 21:00 to 7:00 on the device's clock, and any time the phone or computer is in dark mode. The 🌙 / ☀️ button
   in the page's top bar switches it by hand (Auto → Dark → Light → Auto), saved in this browser (localStorage tn_theme).
   How: the whole page is turned dark by inverting its colours (html.tn-dark), and pictures, videos and the voyage/garden art are
   inverted back, so every text keeps the same contrast it has by day (REQUIREMENTS §3: every text easy to read) and no page
   needs its own dark styles. Loaded in <head> so the page is never painted light first. Never on student pages. */
(function(){
  var KEY = "tn_theme", root = document.documentElement;
  function pref(){ try{ return localStorage.getItem(KEY) || "auto"; }catch(e){ return "auto"; } }
  function night(){ var h = new Date().getHours(); return h >= 21 || h < 7; }
  function osDark(){ try{ return matchMedia("(prefers-color-scheme: dark)").matches; }catch(e){ return false; } }
  function isDark(){ var p = pref(); return p === "dark" || (p === "auto" && (night() || osDark())); }

  var css = document.createElement("style");
  css.id = "tn-night-css";
  css.textContent =
    "html.tn-dark{background:#fff;filter:invert(.9) hue-rotate(180deg)}" +
    /* real pictures, videos and drawn art keep their own colours */
    "html.tn-dark :is(img,video,iframe,canvas,picture,[style*='url(']){filter:invert(1) hue-rotate(180deg)}" +
    "html.tn-dark :is(img,video,iframe,canvas,picture,[style*='url(']) :is(img,video,iframe,canvas,picture){filter:none}" +
    ".tn-night-btn{font-size:20px;line-height:1}" +
    /* the button's own emoji keeps its real colours */
    "html.tn-dark .tn-night-btn span{display:inline-block;filter:invert(1) hue-rotate(180deg)}" +
    ".tn-night-btn.tn-inline{float:right;margin:0 0 6px 10px;width:40px;height:40px;border-radius:50%;border:1px solid #dbe5f1;background:#fff;cursor:pointer}" +
    ".tn-night-btn.tn-float{position:fixed;top:10px;right:10px;z-index:9999;width:40px;height:40px;border-radius:50%;border:1px solid #dbe5f1;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.12);cursor:pointer}";
  (document.head || root).appendChild(css);

  var meta;
  function apply(){
    var d = isDark();
    root.classList.toggle("tn-dark", d);
    meta = meta || document.querySelector('meta[name="theme-color"]');
    if(meta){ if(!meta.dataset.day) meta.dataset.day = meta.content; meta.content = d ? "#1b2230" : meta.dataset.day; }
    var b = document.querySelector(".tn-night-btn");
    if(b){
      var p = pref();
      b.innerHTML = "<span aria-hidden=\"true\">" + (d ? "☀️" : "🌙") + "</span>";
      b.title = p === "auto" ? "Night mode: automatic (21:00–7:00)" : (p === "dark" ? "Night mode: always on" : "Night mode: off");
      b.setAttribute("aria-label", b.title + ". Tap to change.");
    }
  }
  apply();

  /* Auto → (the other look, by hand) → back to Auto */
  function toggle(){
    var p = pref(), next;
    if(p === "auto") next = isDark() ? "light" : "dark";
    else next = "auto";
    try{ next === "auto" ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, next); }catch(e){}
    apply();
  }

  /* Where the button goes: the phone's top bar (header.elplh, before ⓘ) when it shows; beside the title on the course home;
     otherwise a round button at the top right (a learning path on a computer, where the phone bar is hidden). */
  function place(){
    var head = document.querySelector("header.elplh");
    if(head && getComputedStyle(head).display !== "none") return { kind: "ib", parent: head, before: head.querySelector(".inf") };
    var home = document.querySelector(".lshead .lsht");
    if(home) return { kind: "tn-inline", parent: home, before: home.firstChild };
    if(document.body && root.classList.contains("elready")) return { kind: "tn-float", parent: document.body, before: null };
    return null;
  }
  function addButton(){
    var w = place(), b = document.querySelector(".tn-night-btn");
    if(!w) return false;
    if(b && b.parentNode === w.parent && b.classList.contains(w.kind)) return true;
    if(b) b.remove();
    b = document.createElement("button");
    b.type = "button"; b.className = "tn-night-btn " + w.kind; b.onclick = toggle;
    w.parent.insertBefore(b, w.before && w.before.parentNode === w.parent ? w.before : null);
    apply();
    return true;
  }
  /* el-app.js draws the top bar after load, sometimes late on a phone (sign-in), and can draw it again: whenever the page
     changes and the button is missing, put it back (Roger, 21 Nov 2026, iPhone: "Don't see it yet"). */
  var queued = false;
  function ensure(){ queued = false; addButton(); }
  try{ new MutationObserver(function(){ if(!queued){ queued = true; setTimeout(ensure, 50); } })
    .observe(root, { childList: true, subtree: true }); }catch(e){}
  setInterval(ensure, 2000);
  addEventListener("resize", function(){ setTimeout(ensure, 100); });

  setInterval(apply, 60000);                       /* 21:00 and 7:00 switch by themselves */
  document.addEventListener("visibilitychange", function(){ if(!document.hidden) apply(); });
  try{ matchMedia("(prefers-color-scheme: dark)").addEventListener("change", apply); }catch(e){}
})();
