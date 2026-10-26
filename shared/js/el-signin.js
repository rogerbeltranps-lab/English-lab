// Sign-in window (Roger, 26 Oct 2026): students sign in with their school email and the password the teacher gave them
// (Firebase Email/Password accounts created by tools/student-accounts/); the teacher keeps "Sign in with Google".
// Used by el-cloud.js (every page) and el-deck-points.js (students following a class presentation).
// signIn({auth, A, domain}) → the signed-in user, or null if the window was closed. A = the firebase-auth module.
export function signIn({auth,A,domain}){
  return new Promise(done=>{
    const o=document.createElement("div");
    o.style.cssText="position:fixed;inset:0;z-index:10003;background:#0f172a99;display:grid;place-items:center;padding:16px;font:16px system-ui,sans-serif";
    o.innerHTML='<form style="background:#fff;color:#0f172a;border-radius:16px;padding:22px 22px 16px;width:100%;max-width:380px;box-shadow:0 10px 40px #0004;text-align:left">'
      +'<h2 style="margin:0 0 2px;font-size:22px">Sign in</h2><p style="margin:0 0 14px;color:#64748b;font-size:14px">Entra amb el teu correu de l\'institut i la contrasenya que t\'ha donat el professor.</p>'
      +'<label style="display:block;font-weight:600;font-size:14px">School email · Correu de l\'institut'
      +'<input name="email" type="text" inputmode="email" autocapitalize="none" spellcheck="false" autocomplete="username" required placeholder="name.surname@'+domain+'" style="display:block;width:100%;box-sizing:border-box;margin:4px 0 12px;padding:10px 12px;border:1px solid #cbd5e1;border-radius:10px;font:inherit"></label>'
      +'<label style="display:block;font-weight:600;font-size:14px">Password · Contrasenya'
      +'<input name="password" type="password" autocomplete="current-password" required style="display:block;width:100%;box-sizing:border-box;margin:4px 0 6px;padding:10px 12px;border:1px solid #cbd5e1;border-radius:10px;font:inherit"></label>'
      +'<label style="font-size:13px;color:#475569;cursor:pointer"><input name="show" type="checkbox"> Show password · Mostra la contrasenya</label>'
      +'<p data-err role="alert" style="min-height:1.2em;margin:8px 0;color:#b91c1c;font-size:14px"></p>'
      +'<button type="submit" style="width:100%;border:0;background:#0f766e;color:#fff;border-radius:999px;padding:11px 16px;cursor:pointer;font:inherit;font-weight:700">Sign in · Entra</button>'
      +'<p style="margin:12px 0 0;font-size:13px;color:#64748b">Forgot your password? Ask your teacher. · Has oblidat la contrasenya? Demana-la al professor.</p>'
      +'<p style="margin:10px 0 0;display:flex;justify-content:space-between;gap:8px;font-size:13px"><button type="button" data-google style="border:0;background:none;color:#0f766e;cursor:pointer;padding:0;font:inherit;text-decoration:underline">Teacher: sign in with Google</button>'
      +'<button type="button" data-close style="border:0;background:none;color:#64748b;cursor:pointer;padding:0;font:inherit">Cancel · Tanca</button></p></form>';
    const f=o.querySelector("form"),err=o.querySelector("[data-err]"),go=f.querySelector("[type=submit]");
    const end=u=>{o.remove();done(u)};
    f.show.onchange=()=>{f.password.type=f.show.checked?"text":"password"};
    // only the part before @ is enough: the school domain is added
    f.email.addEventListener("blur",()=>{const v=f.email.value.trim();if(v&&!v.includes("@"))f.email.value=v+"@"+domain});
    f.onsubmit=async e=>{
      e.preventDefault();let em=f.email.value.trim().toLowerCase();if(em&&!em.includes("@"))em+="@"+domain;
      err.textContent="";go.disabled=true;go.style.opacity=.6;
      try{const r=await A.signInWithEmailAndPassword(auth,em,f.password.value);end(r.user)}
      catch(x){
        const c=x&&x.code||"";
        err.textContent=c==="auth/too-many-requests"?"Too many tries. Wait a few minutes. · Massa intents: espera uns minuts."
          :c==="auth/network-request-failed"?"No connection. Try again. · No hi ha connexió: torna-ho a provar."
          :/invalid-credential|wrong-password|user-not-found|invalid-email|invalid-login/.test(c)?"Wrong email or password. · El correu o la contrasenya no són correctes."
          :"Could not sign in ("+c+"). · No s'ha pogut entrar.";
        go.disabled=false;go.style.opacity=1;f.password.select();
      }
    };
    o.querySelector("[data-google]").onclick=async()=>{
      try{const p=new A.GoogleAuthProvider();p.setCustomParameters({prompt:"select_account"});const r=await A.signInWithPopup(auth,p);end(r.user)}
      catch(x){console.warn("sign in",x);if(x&&x.code!=="auth/popup-closed-by-user")err.textContent="Google sign-in failed. · No s'ha pogut entrar amb Google."}
    };
    o.querySelector("[data-close]").onclick=()=>end(null);
    o.addEventListener("click",e=>{if(e.target===o)end(null)});
    document.body.append(o);f.email.focus();
  });
}
