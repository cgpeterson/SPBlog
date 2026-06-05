export function openAuthModal() {
  setMode(false);
  passInput.type = "password";
  showPwBtn.textContent = "Show";
  modal.showModal();
}
