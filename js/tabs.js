const tabs = document.querySelectorAll(".tabs a");

function currentCategory() {
  return location.hash.slice(1) || "coding";
}

export function refreshTabs() {
  const category = currentCategory();

  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.hash === `#${category}`);
  });

  document.querySelectorAll("main [data-category]").forEach((post) => {
    post.hidden = post.dataset.category !== category;
  });
}

export function currentCategory() {
  return location.hash.slice(1) || "coding";
}

window.addEventListener("hashchange", refreshTabs);
refreshTabs();
