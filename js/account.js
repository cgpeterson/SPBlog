import {
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { auth } from "./firebase.js";
import { openAuthModal } from "./auth.js";
import { getSubscription, setNotify } from "./subscribers.js";

// Elements
const loginBtn      = document.getElementById("login");
const accountMenu   = document.getElementById("account-menu");
const avatarBtn     = document.getElementById("avatar-btn");
const avatarImg     = document.getElementById("avatar-img");
const avatarInitial = document.getElementById("avatar-initial");
const dropdown      = document.getElementById("account-dropdown");
const settingsModal = document.getElementById("settings-modal");
const settingsForm  = document.getElementById("settings-form");
const nameInput     = document.getElementById("settings-name");
const notifyToggle  = document.getElementById("settings-notify");
const settingsMsg   = document.getElementById("settings-message");

// Header avatar
function showAvatar(user) {
  if (user.photoURL) {
    avatarImg.src = user.photoURL;
    avatarImg.hidden = false;
    avatarInitial.textContent = "";
  } else {
    avatarImg.hidden = true;
    avatarInitial.textContent = initialFor(user);
  }
}

function initialFor(user) {
  const source = user.displayName || user.email || "?";
  return source.trim().charAt(0).toUpperCase();
}

// Dropdown
function toggleDropdown() {
  const willOpen = dropdown.hidden;
  dropdown.hidden = !willOpen;
  avatarBtn.setAttribute("aria-expanded", String(willOpen));
}

function closeDropdown() {
  dropdown.hidden = true;
  avatarBtn.setAttribute("aria-expanded", "false");
}

// Settings modal
async function openSettings() {
  const user = auth.currentUser;
  nameInput.value = user.displayName ?? "";
  const sub = await getSubscription(user.uid);
  notifyToggle.checked = Boolean(sub?.notify);
  settingsMsg.hidden = true;
  settingsModal.showModal();
}

async function saveSettings(event) {
  event.preventDefault();
  const user = auth.currentUser;
  try {
    await updateProfile(user, { displayName: nameInput.value.trim() });
    await setNotify(user.uid, user.email, notifyToggle.checked);
    showAvatar(user);
    showSettingsMessage("Saved.", { success: true });
  } catch (error) {
    console.error(error);
    showSettingsMessage("Could not save. Try again.");
  }
}

function showSettingsMessage(text, { success = false } = {}) {
  settingsMsg.className = success ? "auth-success" : "";
  settingsMsg.textContent = text;
  settingsMsg.hidden = false;
}

// Wiring
onAuthStateChanged(auth, (user) => {
  loginBtn.hidden = Boolean(user);
  accountMenu.hidden = !user;
  if (user) showAvatar(user);
  closeDropdown();
});

loginBtn.addEventListener("click", openAuthModal);
avatarBtn.addEventListener("click", toggleDropdown);
settingsForm.addEventListener("submit", saveSettings);

document.getElementById("menu-settings").addEventListener("click", () => {
  closeDropdown();
  openSettings();
});
document.getElementById("menu-signout").addEventListener("click", () => signOut(auth));
document.getElementById("btn-settings-close").addEventListener("click", () => settingsModal.close());

settingsModal.addEventListener("click", (event) => {
  if (event.target === settingsModal) settingsModal.close();
});

document.addEventListener("click", (event) => {
  if (!accountMenu.contains(event.target)) closeDropdown();
});
