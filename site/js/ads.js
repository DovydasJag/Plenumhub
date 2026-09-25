// The ad slot below the game stays empty and hidden unless site/ads/snippet.html exists.
// Paste your ad network's code (loader script and one ad unit) into that file to switch ads on.
export async function mountAd(slot) {
  if (!slot) return;
  try {
    const res = await fetch(new URL("../ads/snippet.html", import.meta.url), { cache: "no-cache" });
    if (!res.ok) return;
    const html = (await res.text()).trim();
    // Some hosts answer a missing file with the home page; that isn't a snippet.
    if (!html || /<!doctype|<html/i.test(html)) return;
    slot.innerHTML = html;
    // Scripts added with innerHTML don't run, so swap in fresh copies.
    for (const old of slot.querySelectorAll("script")) {
      const s = document.createElement("script");
      for (const a of old.attributes) s.setAttribute(a.name, a.value);
      s.textContent = old.textContent;
      old.replaceWith(s);
    }
    slot.hidden = false;
  } catch {
    /* no ad is fine */
  }
}
