// The footer's "Cookie settings" link reopens Google's consent message, so visitors can change or
// withdraw consent. If that message isn't loaded (no ads, or blocked), the link just goes to the
// consent section of the privacy policy.
document.addEventListener("click", (e) => {
  const link = e.target.closest?.("[data-privacy-settings]");
  const fc = window.googlefc;
  if (!link || !fc || !fc.callbackQueue) return;
  e.preventDefault();
  fc.callbackQueue.push(() => window.googlefc.showRevocationMessage());
});
