import { chromium } from "playwright";
const nav = await chromium.launch();
const c = await nav.newContext({ viewport: { width: 1280, height: 900 } });
const p = await c.newPage();
const vus = [];
p.on("request", (r) => { if (/\.webp/.test(r.url())) vus.push(`${r.url().split("/").slice(-2).join("/")}  ← ${r.resourceType()}`); });
await p.goto("http://127.0.0.1:3011/projets", { waitUntil: "networkidle" });
console.log("images demandées :"); for (const v of vus) console.log("   " + v);
