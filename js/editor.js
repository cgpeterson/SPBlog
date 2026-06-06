import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { db, auth } from "./firebase.js";
import { isAuthor } from "./auth.js";
import { currentCategory } from "./tabs.js";
import { renderPosts } from "./posts.js";

const TEMPLATE = `#### Purpose

#### Actions taken

#### What worked well

#### What didn't work
`;

// Elements
const newPostBtn     = document.getElementById("new-post");
const modal          = document.getElementById("post-modal");
const form           = document.getElementById("post-form");
const titleInput     = document.getElementById("post-title");
const categorySelect = document.getElementById("post-category");
const bodyInput      = document.getElementById("post-body");
const tagsInput      = document.getElementById("post-tags");
const message        = document.getElementById("post-message");

// Modal
function openPostModal() {
  form.reset();
  categorySelect.value = currentCategory();
  bodyInput.value = TEMPLATE;
  message.hidden = true;
  modal.showModal();
}

function showMessage(text, { success = false } = {}) {
  message.className = success ? "auth-success" : "";
  message.textContent = text;
  message.hidden = false;
}

// Create
async function publish(event) {
  event.preventDefault();
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();
  
  if (!title || !body) {
    showMessage("Title and content are required.");
    return;
  }
  
  const user = auth.currentUser;
  try {
    await addDoc(collection(db, "posts"), {
      title,
      category: categorySelect.value,
      body,
      tags: parseTags(tagsInput.value),
      authorUid: user.uid,
      authorName: user.displayName || user.email,
      createdAt: serverTimestamp(),
    });
    modal.close();
    renderPosts();
  } catch (error) {
    console.error(error);
    showMessage("Could not publish. Try again.");
  }
}

function parseTags(value) {
  return [...new Set(
    value.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean)
  )];
}

// Wiring
onAuthStateChanged(auth, () => {
  newPostBtn.hidden = !isAuthor();
});

newPostBtn.addEventListener("click", openPostModal);
form.addEventListener("submit", publish);
document.getElementById("btn-post-close").addEventListener("click", () => modal.close());
modal.addEventListener("click", (event) => {
  if (event.target === modal) modal.close();
});
