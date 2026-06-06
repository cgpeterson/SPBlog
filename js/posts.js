import {
  collection,
  getDocs,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import { marked } from "https://cdn.jsdelivr.net/npm/marked@12/lib/marked.esm.js";
import { db } from "./firebase.js";
import { refreshTabs } from "./tabs.js";

const feed = document.querySelector("main");
let tagSet = new Set();

export async function renderPosts() {
  try {
    const snap = await getDocs(
      query(collection(db, "posts"), orderBy("createdAt", "desc"))
    );

    if (snap.empty) {
      feed.replaceChildren(message("No posts yet."));
      return;
    }

    const posts = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    tagSet = new Set(posts.flatMap((post) => post.tags ?? []));
    feed.replaceChildren(...posts.map(postElement));
    
    refreshTabs();
  } catch (error) {
    console.error(error);
    feed.replaceChildren(message("Could not load posts."));
  }
}

function postElement(post) {
  const details = document.createElement("details");
  
  details.dataset.category = post.category;
  details.append(summaryFor(post));
  details.insertAdjacentHTML("beforeend", marked.parse(post.body ?? ""));
  
  return details;
}

function summaryFor(post) {
  const summary = document.createElement("summary");
  
  summary.append(post.title, " ");
  if (post.authorName) summary.append(bylineFor(post.authorName));
  
  summary.append(dateFor(post.createdAt));
  if (post.tags?.length) summary.append(tagsFor(post.tags));
  
  return summary;
}

function bylineFor(name) {
  const span = document.createElement("span");
  
  span.className = "byline";
  span.textContent = `by ${name} · `;
  
  return span;
}

function dateFor(timestamp) {
  const time = document.createElement("time");
  
  time.textContent = timestamp
    ? timestamp.toDate().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
  
  return time;
}

function tagsFor(tags) {
  const ul = document.createElement("ul");
  ul.className = "tags";
  
  for (const tag of tags) {
    const li = document.createElement("li");
    li.textContent = tag;
    ul.append(li);
  }
  
  return ul;
}

export function usedTags() {
  return [...tagSet].sort();
}

function message(text) {
  const p = document.createElement("p");
  p.textContent = text;
  
  return p;
}

renderPosts();
