// The static pages must match site/js/config.js. If this fails, run: npm run apply-config
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CONFIG } from "../site/js/config.js";
import { PAGES, applyToHtml, sitemapXml, robotsTxt } from "../tools/apply-config.mjs";

const SITE = new URL("../site/", import.meta.url);
const read = (f) => readFileSync(new URL(f, SITE), "utf8");

test("config values are well formed", () => {
  assert.match(CONFIG.launchDate, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(!Number.isNaN(Date.parse(CONFIG.launchDate)));
  assert.match(CONFIG.siteUrl, /^https?:\/\//);
  assert.match(CONFIG.contactEmail, /@/);
  assert.ok(CONFIG.name.trim());
});

test("pages, sitemap and robots.txt are in step with the config", () => {
  for (const page of PAGES) {
    const html = read(page.file);
    assert.equal(applyToHtml(html, page), html, `${page.file} is out of date: run npm run apply-config`);
    assert.ok(html.includes(`<title>`), page.file);
  }
  assert.equal(read("sitemap.xml"), sitemapXml());
  assert.equal(read("robots.txt"), robotsTxt());
});

test("every page has a description, Open Graph tags and the tile favicon", () => {
  for (const page of PAGES) {
    const html = read(page.file);
    assert.match(html, /<meta name="description" content="[^"]+">/, page.file);
    assert.match(html, /<meta property="og:image" content="https?:\/\/[^"]+\/og\.png">/, page.file);
    assert.match(html, /<link rel="icon" href="data:image\/svg\+xml,/, page.file);
  }
});

test("AdSense: loader on every content page, never on the 404 page, and ads.txt matches", () => {
  if (!CONFIG.adsenseClient) return;
  const loader = `adsbygoogle.js?client=${CONFIG.adsenseClient}`;
  for (const page of PAGES) {
    const html = read(page.file);
    assert.equal(html.includes(loader), !page.noAds, page.file);
    if (!page.noAds) assert.match(html, /data-privacy-settings/, `${page.file} has a cookie settings link`);
  }
  assert.ok(read("ads.txt").includes(CONFIG.adsenseClient.replace(/^ca-/, "")), "ads.txt has the same publisher ID");
});

test("the privacy policy covers local storage and Google's advertising disclosures", () => {
  const html = read("privacy/index.html");
  assert.match(html, /local storage/);
  assert.match(html, /Google AdSense/);
  assert.match(html, /Third-party vendors, including Google, use cookies/);
  assert.match(html, /google\.com\/settings\/ads/);
  assert.match(html, /aboutads\.info/);
});
