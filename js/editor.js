import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { db, auth } from "./firebase.js";
import { isAuthor } from "./auth.js";
import { currentCategory } from "./tabs.js";
import { renderPosts, usedTags } from "./posts.js";

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
const suggestions    = document.getElementById("tag-suggestions");

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

// Tag suggestions
function tagTokens(value) {
  return value.split(",").map((token) => token.trim());
}

function showSuggestions() {
  const tokens = tagTokens(tagsInput.value);
  const typing = tokens[tokens.length - 1].toLowerCase();
  const chosen = new Set(tokens.slice(0, -1).map((t) => t.toLowerCase()));

  const matches = typing
    ? usedTags().filter((tag) => tag.startsWith(typing) && !chosen.has(tag))
    : [];

  if (matches.length === 0) {
    suggestions.hidden = true;
    return;
  }

  suggestions.replaceChildren(...matches.slice(0, 8).map(suggestionItem));
  suggestions.hidden = false;
}

function suggestionItem(tag) {
  const li = document.createElement("li");
  li.textContent = tag;
  li.addEventListener("mousedown", (event) => {
    event.preventDefault(); // keep focus in the input
    applyTag(tag);
  });
  return li;
}

function applyTag(tag) {
  const tokens = tagTokens(tagsInput.value);
  tokens[tokens.length - 1] = tag;
  tagsInput.value = tokens.join(", ") + ", ";
  suggestions.hidden = true;
  tagsInput.focus();
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

tagsInput.addEventListener("input", showSuggestions);
tagsInput.addEventListener("blur", () => { suggestions.hidden = true; });
tagsInput.addEventListener("keydown", (event) => {
  if ((event.key === "Tab" || event.key === "Enter") && !suggestions.hidden) {
    event.preventDefault();
    applyTag(suggestions.querySelector("li").textContent);
  }
});
