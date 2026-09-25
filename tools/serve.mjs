// A small static server for local testing: node tools/serve.mjs [port]
// Behaves like Cloudflare Pages for our purposes: folder URLs serve index.html, unknown paths get 404.html.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../site/", import.meta.url));
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

async function resolve(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split("?")[0])).replace(/^([/\\])+/, "");
  const file = join(ROOT, clean);
  if (!file.startsWith(ROOT.replace(/[/\\]$/, "") + sep) && file !== ROOT.replace(/[/\\]$/, "")) return null;
  try {
    const s = await stat(file);
    if (s.isDirectory()) {
      if (!urlPath.endsWith("/")) return { redirect: `${urlPath}/` };
      return { file: join(file, "index.html") };
    }
    return { file };
  } catch {
    return null;
  }
}

export function startServer(port = 8090) {
  const server = createServer(async (req, res) => {
    try {
      const hit = await resolve(req.url);
      if (hit && hit.redirect) {
        res.writeHead(301, { Location: hit.redirect });
        return res.end();
      }
      if (hit) {
        const body = await readFile(hit.file);
        res.writeHead(200, { "Content-Type": TYPES[extname(hit.file)] || "application/octet-stream", "Cache-Control": "no-store" });
        return res.end(body);
      }
      const body = await readFile(join(ROOT, "404.html"));
      res.writeHead(404, { "Content-Type": TYPES[".html"] });
      res.end(body);
    } catch (err) {
      res.writeHead(500);
      res.end(String(err));
    }
  });
  return new Promise((ok) => server.listen(port, () => ok(server)));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const port = Number(process.argv[2] || 8090);
  await startServer(port);
  console.log(`Serving site/ at http://localhost:${port}`);
}
