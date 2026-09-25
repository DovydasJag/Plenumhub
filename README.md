# Plenum

A daily word puzzle. One pool of 12–15 letter tiles, three categories, one word per category.
Score = tiles left over; lower is better. Plain HTML, CSS and JavaScript modules: the `site/` folder
is the whole website and runs as-is, with no build step.

## Before launch

Edit `site/js/config.js`:

- `name`: the site name
- `launchDate`: the day puzzle No. 1 appears (the player's local date; the puzzle changes at local midnight)
- `siteUrl`: **still `https://example.com`**. Used in share text, canonical and Open Graph tags, sitemap
- `contactEmail`: **still a placeholder**

Then run `npm run apply-config`. It writes those values into the page `<head>` tags, the visible name and
email on each page, `sitemap.xml`, `robots.txt`, and redraws `og.png` and `apple-touch-icon.png`.
A change to `launchDate` needs no command. `npm test` fails if the pages and the config disagree.

## Running it

    npm install          # only needed for the Playwright tests and share-image drawing
    npm run serve        # http://localhost:8090

## Puzzles

`site/data/puzzles.json` holds 400 puzzles (just over a year). Each entry:

    {"id": 12, "categories": ["animal", "country", "fruit"], "pool": "...", "par": 2, "solution": [...], "note": ""}

- **Setter's notes:** fill in `"note"`. It shows after the player presses Done, only when it isn't empty.
- **More puzzles / edited word lists:** `npm run generate`. Existing puzzles are kept as they are (pool,
  categories, notes), and par and the best solution are recalculated against the current word lists.
  New puzzles are added up to `--count` (default 400). It prints a summary: puzzle count, par distribution,
  pool sizes, category use, and every rejected candidate with the reason.
- `npm run generate -- --fresh` starts over. It refuses if any notes are written unless you add `--force`.

Rules the generator enforces: 3 categories (never Animal with Bird), one word from each totalling
10–13 letters, plus 2–3 decoys, making a 12–15 tile pool. It rejects pools with more than 6 vowels,
fewer than 3 vowels, a Q without a U, any letter four times, or more than two of J/Q/X/Z. It also rejects
any puzzle whose par is 0, or where a category has fewer than 3 words that can be spelled from the pool.

## Word lists

One JSON file per category in `site/data/words/`: a label, the phrase used in messages
("Not **an animal** we know."), and the words. Lowercase A–Z, three letters or more, single words, British
and American spellings both. After editing, run `node tools/tidy-words.mjs` (sorts, de-duplicates,
rejects bad entries) and then `npm run generate` so par is recalculated.

## Tests

    npm test             # unit tests: tile accounting, validation, dates and DST, share text, solver, puzzles, config
    npm run e2e          # plays today's puzzle in Chromium on a 390px phone and a desktop; screenshots in e2e/screenshots/

## Deploying

**GitHub Pages (plenumhub.com):** push to `main`. `.github/workflows/deploy.yml` runs the unit tests and,
if they pass, publishes the `site` folder as-is. In the repo, Settings → Pages → Source must be
"GitHub Actions", with the custom domain set there.

**Cloudflare Pages:** Workers & Pages → Create → Pages → Upload assets → upload the **`site`** folder
(or connect the repo with no build command and output directory `site`). `site/_headers` sets cache times.
If you move hosts, update the Hosting paragraph in the privacy policy.

## Ads

- `adsenseClient` in the config puts AdSense's script in every page's `<head>` (not the 404 page), and
  `site/ads.txt` carries the matching publisher line. Google's consent message for EEA/UK/Swiss visitors
  comes through that same script once it's published in AdSense → Privacy & messaging. The "Cookie
  settings" link in every footer reopens it.
- Ad units: put one unit's code (the `<ins class="adsbygoogle">` and its `push({})` line, **not** the loader
  script again) in `site/ads/snippet.html`. It appears in the slot below the game, never between the tiles
  and the buttons. Until that file exists the slot renders nothing.
- **Keep Auto ads off for this site** in AdSense (Ads → By site). Auto ads place themselves anywhere on the
  page, including inside the game.
