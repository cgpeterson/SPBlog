import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { db, auth } from "./firebase.js";
import { isAuthor } from "./auth.js";
import { currentCategory } from "./tabs.js";
import { renderPosts, usedTags, getPost } from "./posts.js";

const TEMPLATE = `#### Purpose

#### Actions taken

#### What worked well

#### What didn't work
`;

let editingId = null;

// Elements
const newPostBtn     = document.getElementById("new-post");
const modal          = document.getElementById("post-modal");
const modalTitle     = document.getElementById("post-modal-title");
const submitBtn      = document.getElementById("btn-post-submit");
const form           = document.getElementById("post-form");
const titleInput     = document.getElementById("post-title");
const categorySelect = document.getElementById("post-category");
const bodyInput      = document.getElementById("post-body");
const tagsInput      = document.getElementById("post-tags");
const message        = document.getElementById("post-message");
const suggestions    = document.getElementById("tag-suggestions");
const feed           = document.querySelector("main");

// Modal
function openPostModal() {
  editingId = null;
  form.reset();
  categorySelect.value = currentCategory();
  bodyInput.value = TEMPLATE;
  modalTitle.textContent = "New post";
  submitBtn.textContent = "Publish";
  message.hidden = true;
  suggestions.hidden = true;
  modal.showModal();
}

function openEditModal(post) {
  editingId = post.id;
  titleInput.value = post.title;
  categorySelect.value = post.category;
  bodyInput.value = post.body;
  tagsInput.value = (post.tags ?? []).join(", ");
  modalTitle.textContent = "Edit post";
  submitBtn.textContent = "Save";
  message.hidden = true;
  suggestions.hidden = true;
  modal.showModal();
}

function showMessage(text, { success = false } = {}) {
  message.className = success ? "auth-success" : "";
  message.textContent = text;
  message.hidden = false;
}

// Create and update
async function savePost(event) {
  event.preventDefault();
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title || !body) {
    showMessage("Title and content are required.");
    return;
  }

  const fields = {
    title,
    category: categorySelect.value,
    body,
    tags: parseTags(tagsInput.value),
  };

  try {
    if (editingId) {
      await updateDoc(doc(db, "posts", editingId), fields);
    } else {
      const user = auth.currentUser;
      await addDoc(collection(db, "posts"), {
        ...fields,
        authorUid: user.uid,
        authorName: user.displayName || user.email,
        createdAt: serverTimestamp(),
      });
    }
    modal.close();
    renderPosts();
  } catch (error) {
    console.error(error);
    showMessage("Could not save. Try again.");
  }
}

async function deletePost(id) {
  if (!confirm("Delete this post? This can't be undone.")) return;

  try {
    await deleteDoc(doc(db, "posts", id));
    renderPosts();
  } catch (error) {
    console.error(error);
    alert("Could not delete the post.");
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
  const author = isAuthor();
  newPostBtn.hidden = !author;
  document.body.classList.toggle("is-author", author);
});

newPostBtn.addEventListener("click", openPostModal);
form.addEventListener("submit", savePost);
document.getElementById("btn-post-close").addEventListener("click", () => modal.close());
modal.addEventListener("click", (event) => {
  if (event.target === modal) modal.close();
});

feed.addEventListener("click", (event) => {
  const editBtn = event.target.closest(".post-edit");
  if (editBtn) {
    const post = getPost(editBtn.dataset.id);
    if (post) openEditModal(post);
    return;
  }

  const deleteBtn = event.target.closest(".post-delete");
  if (deleteBtn) deletePost(deleteBtn.dataset.id);
});

tagsInput.addEventListener("input", showSuggestions);
tagsInput.addEventListener("blur", () => { suggestions.hidden = true; });
tagsInput.addEventListener("keydown", (event) => {
  if ((event.key === "Tab" || event.key === "Enter") && !suggestions.hidden) {
    event.preventDefault();
    applyTag(suggestions.querySelector("li").textContent);
  }
});
