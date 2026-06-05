import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { auth } from "./firebase.js";
import { subscribe } from "./subscribers.js";

const AUTHOR_UIDS = ["YOUR_UID", "CLIENT_UID"];

export const isAuthor = () =>
  auth.currentUser && AUTHOR_UIDS.includes(auth.currentUser.uid);

// Elements
const modal       = document.getElementById("auth-modal");
const form        = document.getElementById("email-form");
const emailInput  = document.getElementById("auth-email");
const passInput   = document.getElementById("auth-password");
const message     = document.getElementById("auth-error");
const loginBtn    = document.getElementById("login");
const notifyInput = document.getElementById("auth-notify");
const notifyRow   = document.getElementById("notify-row");
const submitBtn   = document.getElementById("btn-submit");
const toggleLink  = document.getElementById("btn-toggle-mode");
const forgotLink  = document.getElementById("btn-forgot");
const showPwBtn   = document.getElementById("btn-show-pw");

// Modal and feedback
function openModal() {
  setMode(false);
  passInput.type = "password";
  showPwBtn.textContent = "Show";
  modal.showModal();
}

function closeModal() {
  form.reset();
  modal.close();
}

function showMessage(text, { success = false } = {}) {
  message.className = success ? "auth-success" : "";
  message.textContent = text;
  message.hidden = false;
}

function friendlyError(code) {
  const messages = {
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/invalid-email": "Enter a valid email.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
    "auth/email-already-in-use": "That email already has an account.",
    "auth/weak-password": "Password must be at least 6 characters.",
  };
  return messages[code] ?? "Something went wrong. Check your details.";
}

// Modal mode
let signUpMode = false;

function setMode(toSignUp) {
  signUpMode = toSignUp;
  submitBtn.textContent  = toSignUp ? "Create account" : "Sign in";
  toggleLink.textContent = toSignUp ? "Have an account? Sign in" : "Need an account? Sign up";
  notifyRow.hidden  = !toSignUp;
  forgotLink.hidden = toSignUp;
  message.hidden    = true;
}

// Sign-in actions
async function signInWithGoogle() {
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
    closeModal();
  } catch (error) {
    console.error(error);
    showMessage("Google sign-in failed. Try again.");
  }
}

async function signInWithEmail(event) {
  event.preventDefault();
  try {
    await signInWithEmailAndPassword(auth, emailInput.value.trim(), passInput.value);
    closeModal();
  } catch (error) {
    console.error(error);
    showMessage(friendlyError(error.code));
  }
}

async function sendReset() {
  const email = emailInput.value.trim();
  if (!email) {
    emailInput.focus();
    showMessage("Enter your email above first.");
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    showMessage("Reset email sent. Check your inbox.", { success: true });
  } catch (error) {
    console.error(error);
    showMessage("Could not send reset email.");
  }
}

function togglePassword() {
  const hidden = passInput.type === "password";
  passInput.type = hidden ? "text" : "password";
  showPwBtn.textContent = hidden ? "Hide" : "Show";
}

// Sign-up actions
async function signUp(event) {
  event.preventDefault();
  try {
    const { user } = await createUserWithEmailAndPassword(
      auth,
      emailInput.value.trim(),
      passInput.value
    );
    if (notifyInput.checked) {
      await subscribe(user.uid, user.email);
    }
    closeModal();
  } catch (error) {
    console.error(error);
    showMessage(friendlyError(error.code));
  }
}

// Wiring
onAuthStateChanged(auth, (user) => {
  loginBtn.textContent = user ? "Sign out" : "Log in";
  loginBtn.onclick = user ? () => signOut(auth) : openModal;
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

document.getElementById("btn-modal-close").addEventListener("click", closeModal);
document.getElementById("btn-google").addEventListener("click", signInWithGoogle);
showPwBtn.addEventListener("click", togglePassword);
toggleLink.addEventListener("click", () => setMode(!signUpMode));
forgotLink.addEventListener("click", sendReset);

form.addEventListener("submit", (event) => {
  (signUpMode ? signUp : signInWithEmail)(event);
});
