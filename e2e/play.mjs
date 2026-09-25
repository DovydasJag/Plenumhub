// Plays today's puzzle end to end in a real browser, on a phone and on a desktop.
// Run: npm run e2e      Screenshots land in e2e/screenshots/.
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { startServer } from "../tools/serve.mjs";
import { CONFIG } from "../site/js/config.js";
import { dayIndex, pickPuzzle } from "../site/js/dates.js";
import { shareText, resultLine } from "../site/js/share.js";

const PORT = 8123;
const BASE = `http://localhost:${PORT}/`;
const SHOTS = fileURLToPath(new URL("./screenshots/", import.meta.url));
mkdirSync(SHOTS, { recursive: true });

const readJSON = (rel) => JSON.parse(readFileSync(new URL(rel, import.meta.url), "utf8"));
const puzzles = readJSON("../site/data/puzzles.json");
const { number, puzzle } = pickPuzzle(puzzles, dayIndex(CONFIG.launchDate, new Date()));
const cats = puzzle.categories.map((id) => readJSON(`../site/data/words/${id}.json`));
const expectedShare = shareText({
  name: CONFIG.name, number, lengths: puzzle.solution.map((w) => w.length), left: puzzle.par, par: puzzle.par, url: CONFIG.siteUrl,
});

let failures = 0;
async function step(name, fn) {
  try {
    await fn();
    console.log(`  ok   ${name}`);
  } catch (err) {
    failures++;
    console.log(`  FAIL ${name}\n       ${String(err.message).split("\n").join("\n       ")}`);
  }
}

// A three-letter string from the pool that isn't a word in the first category.
function nonWord(pool, words) {
  const set = new Set(words);
  for (let a = 0; a < pool.length; a++) for (let b = 0; b < pool.length; b++) for (let c = 0; c < pool.length; c++) {
    if (a === b || b === c || a === c) continue;
    const w = pool[a] + pool[b] + pool[c];
    if (!set.has(w)) return w;
  }
  throw new Error("every three-letter string is a word?");
}

function watchErrors(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(`page error: ${e.message}`));
  page.on("response", (r) => {
    if (r.status() >= 400 && !r.url().endsWith("/ads/snippet.html")) errors.push(`${r.status()} ${r.url()}`);
  });
  return errors;
}

const rowWord = (page, r) => page.locator(`.row[data-row="${r}"] .tile`).allTextContents().then((t) => t.join("").toLowerCase());
const isActive = (page, r) => page.locator(`.row[data-row="${r}"]`).evaluate((el) => el.classList.contains("is-active"));
const rowStatus = (page, r) => page.locator(`#row${r}-status`).innerText();
const poolTile = (page, letter) => page.locator(`#pool .tile[data-letter="${letter}"]`).first();

async function checkLayout(page, label) {
  const { scrollWidth, width } = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, width: innerWidth }));
  assert.ok(scrollWidth <= width, `${label}: page scrolls sideways (${scrollWidth} > ${width})`);
  const small = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll("button, a")) {
      if (!el.offsetParent || el.closest("dialog:not([open])") || el.classList.contains("skip")) continue;
      // Row buttons stretch over their whole row, so measure the row.
      const box = (el.classList.contains("row-label") ? el.closest(".row") : el).getBoundingClientRect();
      if (box.width < 44 || box.height < 44) out.push(`${el.textContent.trim() || el.getAttribute("aria-label")} ${Math.round(box.width)}x${Math.round(box.height)}`);
    }
    return out;
  });
  assert.deepEqual(small, [], `${label}: tap targets under 44px`);
}

async function phone(browser) {
  console.log("\nPhone, 390px, tapping");
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: "light" });
  await context.addInitScript(() => {
    window.__shared = [];
    Object.defineProperty(navigator, "share", { configurable: true, value: async (data) => { window.__shared.push(data); } });
  });
  const page = await context.newPage();
  const errors = watchErrors(page);
  await page.goto(BASE);
  await page.evaluate(() => document.fonts.ready);

  await step("first visit opens How to play, under 80 words", async () => {
    await page.locator("#help").waitFor({ state: "visible" });
    const words = await page.locator("#help").evaluate((d) => {
      const clone = d.cloneNode(true);
      clone.querySelectorAll("button, .mini-tiles").forEach((n) => n.remove());
      return clone.innerText.split(/\s+/).filter(Boolean).length;
    });
    assert.ok(words < 80, `${words} words`);
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${SHOTS}01-first-visit-phone.png` });
  });

  await step("Play closes it; header shows the number and date", async () => {
    await page.getByRole("button", { name: "Play", exact: true }).tap();
    await page.locator("#help").waitFor({ state: "hidden" });
    assert.equal(await page.locator("#puzzle-no").textContent(), `No. ${number}`);
    assert.ok((await page.locator("#puzzle-date").innerText()).length > 5);
    assert.equal(await page.locator("#left-count").innerText(), `${puzzle.pool.length} left`);
  });

  await step("no sideways scroll, tap targets at least 44px", () => checkLayout(page, "390px"));

  await step("two letters then Check: too short", async () => {
    await poolTile(page, puzzle.pool[0]).tap();
    await poolTile(page, puzzle.pool[1]).tap();
    await page.getByRole("button", { name: "Check" }).tap();
    assert.equal(await rowStatus(page, 0), "Too short.");
    assert.ok(await isActive(page, 0));
    assert.ok(await page.locator(".row[data-row='0']").evaluate((el) => el.classList.contains("is-bad")));
  });

  await step("a made-up word: not in the list, said in plain words", async () => {
    while (await page.locator(".row[data-row='0'] .tile").count()) await page.locator(".row[data-row='0'] .tile").first().tap();
    const junk = nonWord(puzzle.pool, cats[0].words);
    for (const ch of junk) await poolTile(page, ch).tap();
    await page.getByRole("button", { name: "Check" }).tap();
    assert.equal(await rowStatus(page, 0), `Not ${cats[0].noun} we know.`);
    await page.waitForFunction((t) => document.getElementById("live").textContent.includes(t), `${cats[0].noun} we know`);
  });

  await step("tapping placed tiles sends them back and restores the pool", async () => {
    while (await page.locator(".row[data-row='0'] .tile").count()) await page.locator(".row[data-row='0'] .tile").first().tap();
    assert.equal(await page.locator("#pool .tile").count(), puzzle.pool.length);
    assert.equal(await page.locator("#left-count").innerText(), `${puzzle.pool.length} left`);
  });

  await step("build the best solution by tapping rows and tiles", async () => {
    for (let r = 0; r < 3; r++) {
      await page.locator(`.row[data-row="${r}"] .row-label`).tap();
      assert.ok(await isActive(page, r));
      for (const ch of puzzle.solution[r]) await poolTile(page, ch).tap();
      assert.equal(await rowWord(page, r), puzzle.solution[r]);
      if (r === 1) {
        await page.waitForTimeout(300);
        await page.screenshot({ path: `${SHOTS}02-mid-game-phone.png` });
      }
    }
    assert.equal(await page.locator("#left-count").innerText(), `${puzzle.par} left`);
  });

  await step("Check marks all three good", async () => {
    await page.getByRole("button", { name: "Check" }).tap();
    for (let r = 0; r < 3; r++) assert.equal(await rowStatus(page, r), "Good.");
  });

  await step("Done shows the result, par, best solution and the stamp", async () => {
    await page.getByRole("button", { name: "Done" }).tap();
    await page.locator("#result").waitFor({ state: "visible" });
    assert.equal(await page.locator("#result-title").innerText(), resultLine(puzzle.par, puzzle.par));
    assert.ok(await page.locator(".stamp").isVisible());
    assert.ok(!(await page.locator("#actions").isVisible()), "Check and Done are gone");
    assert.equal((await page.locator("#best-list dd").allInnerTexts()).length, 3);
    assert.match(await page.locator("#countdown").innerText(), /^\d\d:\d\d:\d\d$/);
    assert.equal(await page.locator("#note").isVisible(), Boolean(puzzle.note && puzzle.note.trim()));
  });

  await step("Share uses the phone's share sheet with the spoiler-free text", async () => {
    await page.getByRole("button", { name: "Share" }).tap();
    await page.waitForFunction(() => window.__shared.length > 0);
    const shared = await page.evaluate(() => window.__shared);
    assert.equal(shared.length, 1);
    assert.equal(shared[0].text, expectedShare);
    for (const w of puzzle.solution) assert.ok(!shared[0].text.includes(w), `share text reveals ${w}`);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${SHOTS}03-finished-phone.png`, fullPage: true });
  });

  await step("reload keeps the finished board and the stats", async () => {
    await page.reload();
    await page.locator("#result").waitFor({ state: "visible" });
    assert.equal(await page.locator("#help").isVisible(), false, "How to play only on the first visit");
    for (let r = 0; r < 3; r++) assert.equal(await rowWord(page, r), puzzle.solution[r]);
    await page.getByRole("button", { name: "Stats" }).tap();
    assert.equal(await page.locator("#st-played").innerText(), "1");
    assert.equal(await page.locator("#st-current").innerText(), "1");
    assert.equal(await page.locator("#st-best").innerText(), "1");
    assert.equal(await page.locator("#st-dist tr").first().locator(".bar").innerText(), "1");
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${SHOTS}07-stats-phone.png` });
    await page.getByRole("button", { name: "Close" }).tap();
  });

  await step("no failed requests or script errors", () => assert.deepEqual(errors, []));
  await context.close();
}

async function desktop(browser) {
  console.log("\nDesktop, 1280px, keyboard");
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: "light" });
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE.slice(0, -1) });
  const page = await context.newPage();
  const errors = watchErrors(page);
  await page.goto(BASE);
  await page.evaluate(() => document.fonts.ready);
  await page.locator("#help").waitFor({ state: "visible" });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${SHOTS}01-first-visit-desktop.png` });

  await step("Escape closes How to play", async () => {
    await page.keyboard.press("Escape");
    await page.locator("#help").waitFor({ state: "hidden" });
  });

  const [w1, w2, w3] = puzzle.solution;
  const missing = "zqxjvkwyfbhmpgdcul".split("").find((l) => !puzzle.pool.includes(l));

  await step("typing takes tiles; a letter that isn't there says so", async () => {
    await page.keyboard.type(w1);
    assert.equal(await rowWord(page, 0), w1);
    await page.keyboard.press(missing);
    assert.equal(await page.locator("#message").innerText(), `No ${missing.toUpperCase()} left.`);
  });

  await step("Backspace returns the last tile", async () => {
    const spare = [...puzzle.pool].find((l, i, all) => all.filter((x) => x === l).length > [...(w1 + w2 + w3)].filter((x) => x === l).length);
    await page.keyboard.press(spare);
    assert.equal(await rowWord(page, 0), w1 + spare);
    await page.keyboard.press("Backspace");
    assert.equal(await rowWord(page, 0), w1);
  });

  await step("Tab moves to the next row; Enter checks; a short word is caught", async () => {
    await page.keyboard.press("Tab");
    assert.ok(await isActive(page, 1), "row 2 active");
    await page.keyboard.type(w2.slice(0, 2));
    await page.keyboard.press("Enter");
    assert.equal(await rowStatus(page, 0), "Good.");
    assert.equal(await rowStatus(page, 1), "Too short.");
    await page.keyboard.type(w2.slice(2));
    assert.equal(await rowStatus(page, 1), "", "changing the row clears its old verdict");
  });

  await step("Down arrow moves to row three; Up goes back", async () => {
    await page.keyboard.press("ArrowDown");
    assert.ok(await isActive(page, 2), "row 3 active");
    await page.keyboard.press("ArrowUp");
    assert.ok(await isActive(page, 1), "row 2 active");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.type(w3);
    await page.keyboard.press("Enter");
    for (let r = 0; r < 3; r++) assert.equal(await rowStatus(page, r), "Good.");
    await page.waitForFunction(() => document.getElementById("live").textContent.includes("All three count"));
  });

  await step("Shuffle reorders the pool without losing tiles", async () => {
    const before = await page.locator("#pool .tile").allTextContents();
    await page.getByRole("button", { name: "Shuffle" }).click();
    const after = await page.locator("#pool .tile").allTextContents();
    assert.deepEqual([...after].sort(), [...before].sort());
  });

  await step("desktop keeps a narrow centred column", async () => {
    const box = await page.locator("#game").boundingBox();
    assert.ok(box.width <= 560, `game is ${box.width}px wide`);
    assert.ok(Math.abs(box.x + box.width / 2 - 640) < 20, "centred");
    await checkLayout(page, "desktop");
  });

  await step("Done, then Share copies the result and says Copied", async () => {
    await page.getByRole("button", { name: "Done" }).click();
    await page.locator("#result").waitFor({ state: "visible" });
    await page.getByRole("button", { name: "Share" }).click();
    await page.locator("#copied", { hasText: "Copied." }).waitFor();
    // Windows stores \n as \r\n on the clipboard; pasting gives the same lines.
    assert.equal((await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, "\n"), expectedShare);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${SHOTS}04-finished-desktop.png`, fullPage: true });
  });

  await step("reload keeps everything", async () => {
    await page.reload();
    await page.locator("#result").waitFor({ state: "visible" });
    assert.equal(await page.locator("#result-title").innerText(), resultLine(puzzle.par, puzzle.par));
    await page.getByRole("button", { name: "Stats" }).click();
    assert.equal(await page.locator("#st-played").innerText(), "1");
    await page.keyboard.press("Escape");
  });

  await step("no failed requests or script errors", () => assert.deepEqual(errors, []));
  await context.close();
}

async function extras(browser) {
  console.log("\nDark mode, narrow phone, blocked storage, text pages");
  const seen = () => localStorage.setItem("leftovers:v1:seen-help", "true");

  await step("dark mode mid-game", async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: "dark" });
    await context.addInitScript(seen);
    const page = await context.newPage();
    await page.goto(BASE);
    await page.evaluate(() => document.fonts.ready);
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    assert.equal(bg, "rgb(35, 32, 28)", "dark warm grey, not black");
    await page.keyboard.type(puzzle.solution[0]);
    await page.keyboard.press("Tab");
    await page.keyboard.type(puzzle.solution[1].slice(0, 2));
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${SHOTS}05-dark-mode-phone.png` });
    await context.close();
  });

  await step("360px wide: no sideways scroll, 44px targets", async () => {
    const context = await browser.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true });
    await context.addInitScript(seen);
    const page = await context.newPage();
    await page.goto(BASE);
    await page.locator("#pool .tile").first().waitFor();
    await page.keyboard.type(puzzle.solution[0] + puzzle.solution[1]);
    await checkLayout(page, "360px");
    await context.close();
  });

  await step("the game still works when storage is blocked", async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.addInitScript(() => {
      Object.defineProperty(window, "localStorage", { get() { throw new DOMException("blocked", "SecurityError"); } });
    });
    const page = await context.newPage();
    const errors = watchErrors(page);
    await page.goto(BASE);
    await page.locator("#help").waitFor({ state: "visible" });
    await page.keyboard.press("Escape");
    await page.keyboard.type(puzzle.solution[0]);
    assert.equal(await rowWord(page, 0), puzzle.solution[0]);
    assert.deepEqual(errors, []);
    await context.close();
  });

  await step("reduced motion: tiles move without animating", async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    await context.addInitScript(seen);
    const page = await context.newPage();
    await page.goto(BASE);
    await page.locator("#pool .tile").first().waitFor();
    await page.keyboard.type(puzzle.solution[0].slice(0, 1));
    const running = await page.evaluate(() => document.getAnimations().length);
    assert.equal(running, 0);
    await context.close();
  });

  await step("About page (phone and desktop)", async () => {
    for (const [name, opts] of [["phone", { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }], ["desktop", { viewport: { width: 1280, height: 900 } }]]) {
      const context = await browser.newContext({ ...opts, colorScheme: "light" });
      const page = await context.newPage();
      const errors = watchErrors(page);
      await page.goto(`${BASE}about/`);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator("h1").innerText(), "About");
      await page.screenshot({ path: `${SHOTS}06-about-${name}.png`, fullPage: true });
      for (const path of ["privacy/", "contact/"]) {
        await page.goto(BASE + path);
        assert.ok((await page.locator("h1").innerText()).length > 0);
      }
      assert.deepEqual(errors, []);
      await context.close();
    }
  });

  await step("unknown pages get the 404 page", async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const res = await page.goto(`${BASE}nope/`);
    assert.equal(res.status(), 404);
    assert.equal(await page.locator("h1").innerText(), "Nothing here.");
    await context.close();
  });
}

const server = await startServer(PORT);
const chrome = await chromium.launch();
// Keep the tests off Google's real ad servers.
const browser = {
  async newContext(opts) {
    const context = await chrome.newContext(opts);
    await context.route(/googlesyndication|doubleclick|adservice|fundingchoicesmessages/, (route) => route.abort());
    return context;
  },
  close: () => chrome.close(),
};
console.log(`Puzzle No. ${number}: ${puzzle.categories.join(", ")} / pool ${puzzle.pool.toUpperCase()} / par ${puzzle.par} (${puzzle.solution.join(", ")})`);
try {
  await phone(browser);
  await desktop(browser);
  await extras(browser);
} finally {
  await browser.close();
  server.close();
}
console.log(failures ? `\n${failures} check(s) failed.` : `\nAll checks passed. Screenshots in e2e/screenshots/.`);
process.exit(failures ? 1 : 0);
