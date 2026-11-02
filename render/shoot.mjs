// QA screenshots: node render/shoot.mjs <url> <outDir> <width> <height> <scrollY,...>
import fs from "node:fs/promises";
import puppeteer from "puppeteer";

const [url, out, w, h, stops] = process.argv.slice(2);
await fs.mkdir(out, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--use-angle=d3d11", "--enable-gpu"],
});
const page = await browser.newPage();
page.on("pageerror", (e) => console.error("[pageerror]", e.message));
page.on("console", (m) => m.type() === "error" && console.error("[console]", m.text()));
await page.setViewport({ width: +w, height: +h, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
await new Promise((r) => setTimeout(r, 1500));
const total = await page.evaluate(() => document.documentElement.scrollHeight);
console.log("scrollHeight", total);
for (const s of stops.split(",")) {
  const y = s.endsWith("%") ? Math.round((parseFloat(s) / 100) * (total - +h)) : +s;
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await new Promise((r) => setTimeout(r, 1800));
  await page.screenshot({ path: `${out}/${String(y).padStart(6, "0")}.png` });
}
await browser.close();
