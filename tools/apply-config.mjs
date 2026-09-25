// Copies the values in site/js/config.js into the static files that can't read JavaScript:
// page <head> tags, the name and email in the HTML, sitemap.xml, robots.txt, and the share images.
// Run after changing the name, siteUrl or contactEmail:  npm run apply-config
// Add --no-images to skip redrawing og.png and apple-touch-icon.png.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { CONFIG } from "../site/js/config.js";

const SITE = new URL("../site/", import.meta.url);
const base = CONFIG.siteUrl.replace(/\/+$/, "");

export const PAGES = [
  { file: "index.html", path: "/", title: `${CONFIG.name}: a daily word puzzle`, description: CONFIG.description, rel: "" },
  { file: "about/index.html", path: "/about/", title: `About – ${CONFIG.name}`, description: `What ${CONFIG.name} is, who makes it, and how par is worked out.`, rel: "../" },
  { file: "privacy/index.html", path: "/privacy/", title: `Privacy policy – ${CONFIG.name}`, description: `What ${CONFIG.name} stores, and how the advertising works.`, rel: "../" },
  { file: "contact/index.html", path: "/contact/", title: `Contact – ${CONFIG.name}`, description: `How to get in touch about ${CONFIG.name}.`, rel: "../" },
  { file: "404.html", path: null, title: `Page not found – ${CONFIG.name}`, description: "Page not found.", rel: "/", noAds: true },
];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function faviconSvg(letter) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="1.5" y="1.5" width="29" height="29" rx="3" fill="#e6d3a8" stroke="#7a6442"/><path d="M2 26h28v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" fill="#b39463"/><text x="16" y="21.5" text-anchor="middle" font-family="IBM Plex Mono,Menlo,Consolas,monospace" font-weight="700" font-size="18" fill="#1d1b18">${esc(letter.toUpperCase())}</text></svg>`;
}

export function headBlock(page) {
  const url = page.path ? `${base}${page.path}` : null;
  const lines = [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}">`,
    url ? `<link rel="canonical" href="${esc(url)}">` : `<meta name="robots" content="noindex">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${esc(CONFIG.name)}">`,
    `<meta property="og:title" content="${esc(page.title)}">`,
    `<meta property="og:description" content="${esc(page.description)}">`,
    url ? `<meta property="og:url" content="${esc(url)}">` : null,
    `<meta property="og:image" content="${esc(base)}/og.png">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${esc(CONFIG.name)}, spelled out in wooden letter tiles">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="theme-color" content="#f3eee3" media="(prefers-color-scheme: light)">`,
    `<meta name="theme-color" content="#23201c" media="(prefers-color-scheme: dark)">`,
    `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(faviconSvg(CONFIG.name[0]))}">`,
    `<link rel="apple-touch-icon" href="${page.rel}apple-touch-icon.png">`,
    `<link rel="preconnect" href="https://fonts.googleapis.com">`,
    `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`,
    `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600;700&amp;family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400;1,6..72,600&amp;display=swap">`,
    CONFIG.adsenseClient && !page.noAds
      ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${esc(CONFIG.adsenseClient)}" crossorigin="anonymous"></script>`
      : null,
    `<script type="module" src="${page.rel}js/consent.js"></script>`,
  ].filter(Boolean);
  return `<!-- cfg:head -->\n${lines.join("\n")}\n<!-- /cfg:head -->`;
}

export function applyToHtml(html, page) {
  let out = html.replace(/<!-- cfg:head -->[\s\S]*?<!-- \/cfg:head -->/, headBlock(page));
  out = out.replace(/(<(\w+)[^>]*\bdata-cfg="name"[^>]*>)[^<]*(<\/\2>)/g, `$1${esc(CONFIG.name)}$3`);
  const email = esc(CONFIG.contactEmail);
  out = out.replace(/<a\b[^>]*\bdata-cfg="email"[^>]*>[^<]*<\/a>/g, `<a data-cfg="email" href="mailto:${email}">${email}</a>`);
  return out;
}

export function sitemapXml() {
  const urls = PAGES.filter((p) => p.path).map((p) => `  <url><loc>${esc(base + p.path)}</loc></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

export function robotsTxt() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`;
}

function tileHtml(letters, size, rotate) {
  return letters
    .map((l, i) => {
      const r = rotate ? ((i * 37) % 7) * 0.45 - 1.35 : 0;
      return `<span class="t" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.5)}px;transform:rotate(${r.toFixed(2)}deg)">${esc(l.toUpperCase())}</span>`;
    })
    .join("");
}

const IMAGE_CSS = `
  *{box-sizing:border-box;margin:0}
  body{background:#f3eee3;color:#1d1b18;font-family:Newsreader,Georgia,serif}
  .t{display:inline-grid;place-items:center;padding-bottom:6px;background:#e6d3a8;border:2px solid #7a6442;border-radius:6px;
     box-shadow:inset 0 -7px 0 #b39463,inset 0 2px 0 rgba(255,255,255,.35);font-family:'IBM Plex Mono',monospace;font-weight:700}`;

async function drawImages() {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    console.log("Playwright isn't installed, so og.png and apple-touch-icon.png were not redrawn (npm install).");
    return;
  }
  const fonts = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@700&family=Newsreader:ital,opsz,wght@1,6..72,400;1,6..72,600&display=swap">`;
  const letters = CONFIG.name.replace(/[^a-z]/gi, "").split("");
  const size = Math.min(104, Math.floor(1000 / letters.length) - 12);
  const og = `<!doctype html><html><head>${fonts}<style>${IMAGE_CSS}
    .wrap{width:1200px;height:630px;display:flex;flex-direction:column;justify-content:center;padding:0 90px}
    .rule{border-top:4px double #1d1b18}
    .row{display:flex;gap:12px;justify-content:center;padding:64px 0 56px}
    .sub{display:flex;justify-content:space-between;padding-top:14px;border-top:1px solid #1d1b18;font-size:34px;font-style:italic}
    .sub span:last-child{font-family:'IBM Plex Mono',monospace;font-style:normal;font-size:22px;letter-spacing:.12em;text-transform:uppercase;align-self:center}
  </style></head><body><div class="wrap"><div class="rule"></div><div class="row">${tileHtml(letters, size, true)}</div>
  <div class="sub"><span>A daily word puzzle.</span><span>Three categories. One pool.</span></div></div></body></html>`;
  const icon = `<!doctype html><html><head>${fonts}<style>${IMAGE_CSS}
    body{width:180px;height:180px;display:grid;place-items:center}</style></head>
    <body>${tileHtml([letters[0]], 140, false)}</body></html>`;

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
    await page.setContent(og, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: fileURLToPath(new URL("og.png", SITE)) });
    await page.setViewportSize({ width: 180, height: 180 });
    await page.setContent(icon, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: fileURLToPath(new URL("apple-touch-icon.png", SITE)) });
    console.log("Drew og.png (1200x630) and apple-touch-icon.png (180x180).");
  } finally {
    await browser.close();
  }
}

async function main() {
  for (const page of PAGES) {
    const url = new URL(page.file, SITE);
    const html = readFileSync(url, "utf8");
    writeFileSync(url, applyToHtml(html, page));
  }
  writeFileSync(new URL("sitemap.xml", SITE), sitemapXml());
  writeFileSync(new URL("robots.txt", SITE), robotsTxt());
  console.log(`Applied config to ${PAGES.length} pages, sitemap.xml and robots.txt (name "${CONFIG.name}", ${base}).`);
  if (!process.argv.includes("--no-images")) await drawImages();
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await main();
}
