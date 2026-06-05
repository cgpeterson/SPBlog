/ Import SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCXO7ujz0URmunJPEYu53nyBz_eX1-8smo",
  authDomain: "spblog-57fd2.firebaseapp.com",
  projectId: "spblog-57fd2",
  storageBucket: "spblog-57fd2.firebasestorage.app",
  messagingSenderId: "956579274006",
  appId: "1:956579274006:web:e8ae822f50a63089198437",
  measurementId: "G-R83T6MW9CE"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
