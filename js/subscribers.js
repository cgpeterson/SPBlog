import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { db } from "./firebase.js";

export async function getSubscription(uid) {
  const snap = await getDoc(doc(db, "subscribers", uid));
  return snap.exists() ? snap.data() : null;
}

export function setNotify(uid, email, notify) {
  return setDoc(doc(db, "subscribers", uid), { email, notify }, { merge: true });
}
