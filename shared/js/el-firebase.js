// Firebase project and the accounts it knows, shared by el-cloud.js (every page) and el-deck-points.js (class presentations).
export const CONFIG={apiKey:"AIzaSyCdO9ygUg8GzhfKsmqJKBg7-k_BDE3ZvKE",authDomain:"english-lab-ietm.firebaseapp.com",projectId:"english-lab-ietm",storageBucket:"english-lab-ietm.firebasestorage.app",messagingSenderId:"100211300058",appId:"1:100211300058:web:aff85bd00c3a877e7af7e3"};
// Schools whose Google accounts can sign in as students. Add a new school by adding its domain here AND in firestore.rules.
export const DOMAINS=["ietramuntana.cat"],TEACHERS=["roger.beltranps@gmail.com"],
// Testers sign in as students but can open every page and every LS, including hidden ones and graded activities not enabled yet. Also in firestore.rules.
TESTERS=["roger.beltran@ietramuntana.cat"];
