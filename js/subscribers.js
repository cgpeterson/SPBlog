import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { db } from "./firebase.js";

export function subscribe(uid, email) {
  return setDoc(doc(db, "subscribers", uid), {
    email,
    notify: true,
    createdAt: serverTimestamp(),
  });
}
