// Renders the mold scene into WebP frame sequences + per-frame label anchors.
// Usage: node render/render.mjs [open|anatomy|all] [--preview]
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outRoot = path.join(root, "public", "frames");

const SEQUENCES = { open: 180, anatomy: 120, turntable: 72 };
// sequences that only need one square variant
const SQUARE = { turntable: { name: "square", w: 1000, h: 1000, q: 0.85 } };
const VARIANTS = [
  { name: "desktop", w: 1920, h: 1080, q: 0.8 },
  { name: "mobile", w: 900, h: 1400, q: 0.78 },
];

const args = process.argv.slice(2);
const preview = args.includes("--preview");
const which = args.find((a) => !a.startsWith("--")) ?? "all";
const seqs = which === "all" ? Object.keys(SEQUENCES) : [which];

const MIME = { ".html": "text/html", ".js": "text/javascript" };
const server = http.createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  const file = url.startsWith("/node_modules/") ? path.join(root, url) : path.join(root, "render", url === "/" ? "index.html" : url);
  try {
    const body = await fs.readFile(file);
    res.writeHead(200, { "content-type": MIME[path.extname(file)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(5178, r));

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"],
});

const jobs = [];
for (const v of VARIANTS) for (const seq of seqs) if (!SQUARE[seq]) jobs.push([v, seq]);
for (const seq of seqs) if (SQUARE[seq]) jobs.push([SQUARE[seq], seq]);

for (const [v, seq] of jobs) {
  {
    const page = await browser.newPage();
    page.on("console", (m) => m.type() === "error" && console.error("[page]", m.text()));
    page.on("pageerror", (e) => console.error("[pageerror]", e.message));
    await page.setViewport({ width: v.w, height: v.h });
    await page.goto(`http://localhost:5178/?w=${v.w}&h=${v.h}`);
    await page.waitForFunction("window.sceneReady === true", { timeout: 60000 });

    const count = preview ? 6 : SEQUENCES[seq];
    const dir = path.join(preview ? path.join(root, "render", "preview") : outRoot, seq, v.name);
    await fs.mkdir(dir, { recursive: true });
    const labels = [];
    const t0 = Date.now();
    for (let i = 0; i < count; i++) {
      const p = count === 1 ? 0 : i / (count - 1);
      const meta = await page.evaluate((s, p) => window.renderFrame(s, p), seq, p);
      labels.push(meta.labels);
      const data = await page.evaluate((q) => window.grab(q), v.q);
      await fs.writeFile(path.join(dir, `${String(i).padStart(4, "0")}.webp`), Buffer.from(data.split(",")[1], "base64"));
    }
    await fs.writeFile(path.join(dir, "labels.json"), JSON.stringify({ count, w: v.w, h: v.h, labels }));
    console.log(`${seq}/${v.name}: ${count} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    await page.close();
  }
}

await browser.close();
server.close();
