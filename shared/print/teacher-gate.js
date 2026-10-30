// The paper worksheets and their answer keys open only for the teacher's account (Roger, 30 Oct 2026). Until the teacher is signed in,
// body.locked hides the page and shows a sign-in box (tools/lp-worksheets/build.mjs removes it to print the PDFs).
// The site is static and public, so this keeps students out of the pages, not out of the data files behind them.
import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import * as A from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {CONFIG,TEACHERS} from "../js/el-firebase.js";
const open=()=>document.body.classList.remove("locked");
const auth=A.getAuth(getApps()[0]||initializeApp(CONFIG)),box=document.getElementById("gate");
A.onAuthStateChanged(auth,u=>{
  if(u&&TEACHERS.includes((u.email||"").toLowerCase())){open();return}
  document.body.classList.add("locked");
  box.innerHTML="<h1>Teacher only</h1><p>"+(u?"This account ("+u.email+") cannot open the paper worksheets.":"Sign in with the teacher’s Google account to open the paper worksheets.")+"</p><button type=\"button\">Sign in with Google</button>";
  box.querySelector("button").onclick=()=>{const p=new A.GoogleAuthProvider();p.setCustomParameters({prompt:"select_account"});A.signInWithPopup(auth,p).catch(x=>console.warn("sign in",x))};
});
