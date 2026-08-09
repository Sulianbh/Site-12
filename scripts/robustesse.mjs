/**
 * Les conditions que personne ne teste.
 *
 * Un site se vérifie d'ordinaire dans une fenêtre confortable, à 100 %,
 * avec sa feuille de style complète et JavaScript actif. Les vrais
 * lecteurs, eux, zooment à 200 %, forcent leurs couleurs, allongent les
 * interlignes, ou coupent les scripts. Ce fichier reproduit ces
 * quatre-là, plus le poids réellement transféré.
 *
 *     node scripts/robustesse.mjs [http://localhost:3011]
 */

import { chromium } from "/Users/sulianbrouard-heulluy/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs";

const BASE = process.argv.find((a) => a.startsWith("http")) ?? "http://localhost:3011";
const PAGES = ["/", "/projets", "/agence", "/contact", "/projets/maison-de-maitre-nogent"];
const constats = [];
const ko = (quoi) => constats.push(quoi);

const debordement = () =>
  document.documentElement.scrollWidth > window.innerWidth + 1
    ? [...document.querySelectorAll("body *")]
        .filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1)
        .slice(0, 3)
        .map((e) => e.tagName + "." + String(e.className).slice(0, 40))
    : null;

const nav = await chromium.launch();

/* ------------------------------------------------------------------ */
/*  1. Zoom 200 % — critère 1.4.4                                      */
/*  Le zoom se simule en divisant la fenêtre par deux : à 1280 × 900   */
/*  zoomé deux fois, la mise en page reçoit 640 × 450 CSS.             */
/* ------------------------------------------------------------------ */
{
  const ctx = await nav.newContext({ viewport: { width: 640, height: 450 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  for (const p of PAGES) {
    await page.goto(BASE + p, { waitUntil: "networkidle" });
    const d = await page.evaluate(debordement);
    if (d) ko(`zoom 200 % — débordement horizontal sur ${p} : ${d.join(", ")}`);
  }
  await ctx.close();
}

/* ------------------------------------------------------------------ */
/*  1 bis. Redimensionnement à 400 % — critère 1.4.10                  */
/*                                                                     */
/*  Le 1.4.4 ne demande que de pouvoir zoomer deux fois. Le 1.4.10 va  */
/*  plus loin : à 400 % sur un écran de 1280 × 1024, la mise en page   */
/*  reçoit 320 × 256 CSS et ne doit toujours réclamer *aucun* second   */
/*  axe de défilement. C'est le pire cas réel — et le seul qui teste   */
/*  la hauteur en même temps que la largeur : une barre collante qui   */
/*  passe encore à 320 × 900 peut manger le tiers d'une fenêtre de     */
/*  256 pixels de haut et ne plus rien laisser à lire.                 */
/* ------------------------------------------------------------------ */
{
  const ctx = await nav.newContext({ viewport: { width: 320, height: 256 }, deviceScaleFactor: 4 });
  const page = await ctx.newPage();
  for (const p of PAGES) {
    await page.goto(BASE + p, { waitUntil: "networkidle" });
    const d = await page.evaluate(debordement);
    if (d) ko(`zoom 400 % — débordement horizontal sur ${p} : ${d.join(", ")}`);

    /* Ce que la fenêtre garde pour elle : bandeaux collants et fils
       d'Ariane figés. Au-delà de la moitié des 256 pixels, il ne reste
       plus de fenêtre de lecture du tout. */
    const pris = await page.evaluate(() =>
      [...document.querySelectorAll("body *")]
        .filter((e) => {
          const s = getComputedStyle(e);
          return s.position === "sticky" || s.position === "fixed";
        })
        .filter((e) => {
          const b = e.getBoundingClientRect();
          return b.height > 0 && b.top < window.innerHeight && b.width > window.innerWidth * 0.5;
        })
        .reduce((n, e) => n + e.getBoundingClientRect().height, 0),
    );
    if (pris > 128)
      ko(`zoom 400 % — ${Math.round(pris)} px de barres figées sur 256 sur ${p}`);
  }
  await ctx.close();
}

/* ------------------------------------------------------------------ */
/*  2. Espacement du texte — critère 1.4.12                            */
/*  Interligne 1,5 ; espacement des lettres 0,12 em ; des mots 0,16 em ;*/
/*  entre paragraphes 2 em. Rien ne doit être tronqué ni recouvert.    */
/* ------------------------------------------------------------------ */
{
  const ctx = await nav.newContext({ viewport: { width: 390, height: 780 } });
  const page = await ctx.newPage();
  await page.addStyleTag({
    content: `* { line-height: 1.5 !important; letter-spacing: 0.12em !important;
                  word-spacing: 0.16em !important; }
              p { margin-bottom: 2em !important; }`,
  });
  for (const p of PAGES) {
    await page.goto(BASE + p, { waitUntil: "networkidle" });
    await page.addStyleTag({
      content: `* { line-height: 1.5 !important; letter-spacing: 0.12em !important;
                    word-spacing: 0.16em !important; }
                p { margin-bottom: 2em !important; }`,
    });
    await page.waitForTimeout(120);
    const r = await page.evaluate(() => {
      const coupes = [];
      for (const el of document.querySelectorAll("h1,h2,h3,p,li,dt,dd,summary,button,a")) {
        const s = getComputedStyle(el);
        if (s.display === "none" || s.overflow === "visible") continue;
        /* Un texte tronqué se reconnaît à un contenu plus haut que sa
           boîte alors que le débordement est masqué. */
        if (el.scrollHeight > el.clientHeight + 2 && s.overflowY !== "visible") {
          coupes.push(el.tagName + " — " + el.textContent.trim().slice(0, 34));
        }
      }
      return {
        coupes: coupes.slice(0, 4),
        debord: document.documentElement.scrollWidth > window.innerWidth + 1,
      };
    });
    if (r.debord) ko(`espacement du texte — débordement sur ${p}`);
    r.coupes.forEach((c) => ko(`espacement du texte — contenu tronqué sur ${p} : ${c}`));
  }
  await ctx.close();
}

/* ------------------------------------------------------------------ */
/*  3. Couleurs forcées — le mode contraste élevé de Windows           */
/*  Tout ce qui porte du sens par la seule couleur disparaît alors :   */
/*  les fonds sont écrasés, les bordures gardées.                      */
/* ------------------------------------------------------------------ */
{
  const ctx = await nav.newContext({ viewport: { width: 1280, height: 900 }, forcedColors: "active" });
  const page = await ctx.newPage();
  for (const p of PAGES) {
    await page.goto(BASE + p, { waitUntil: "networkidle" });
    const r = await page.evaluate(() => {
      const invisibles = [];
      /* Un bouton dont le fond est écrasé et qui n'a pas de bordure
         devient un mot posé sur la page. */
      for (const b of document.querySelectorAll(".bouton, .champ, .carte-dessin")) {
        const s = getComputedStyle(b);
        if (s.borderTopWidth === "0px" && s.outlineWidth === "0px") {
          invisibles.push((b.className || b.tagName).slice(0, 40));
        }
      }
      /* Les dessins sont tracés en `currentColor` ou en variables : ils
         doivent rester visibles quand le système impose ses couleurs. */
      const traits = [...document.querySelectorAll(".projete, .existant")].map(
        (e) => getComputedStyle(e).stroke,
      );
      return { invisibles: [...new Set(invisibles)].slice(0, 4), traits: [...new Set(traits)].slice(0, 4) };
    });
    r.invisibles.forEach((i) => ko(`couleurs forcées — plus de contour sur ${p} : ${i}`));
    if (r.traits.some((t) => t === "none")) ko(`couleurs forcées — trait de dessin perdu sur ${p}`);
  }
  await ctx.close();
}

/* ------------------------------------------------------------------ */
/*  4. Sans JavaScript                                                 */
/* ------------------------------------------------------------------ */
{
  const ctx = await nav.newContext({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  for (const p of PAGES) {
    await page.goto(BASE + p, { waitUntil: "load" });
    const r = await page.evaluate(() => ({
      masques: [...document.querySelectorAll(".paraitre")].filter(
        (e) => getComputedStyle(e).opacity === "0",
      ).length,
      texte: document.body.innerText.length,
      liens: document.querySelectorAll("a[href]").length,
    }));
    if (r.masques) ko(`sans JS — ${r.masques} élément(s) invisibles sur ${p}`);
    if (r.texte < 900) ko(`sans JS — page presque vide sur ${p} (${r.texte} caractères)`);
    if (r.liens < 10) ko(`sans JS — navigation absente sur ${p}`);
  }
  await ctx.close();
}

/* ------------------------------------------------------------------ */
/*  5. Le poids réellement transféré                                   */
/* ------------------------------------------------------------------ */
{
  const ctx = await nav.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });

  /*
   * Le poids se lit dans le Resource Timing, pas dans l'en-tête
   * `content-length` : Next sert en transfert fragmenté, et cet en-tête
   * est alors absent — une mesure qui s'y fie ne voit que les polices,
   * qui sont des fichiers statiques.
   */
  const mesures = await page.evaluate(
    () =>
      new Promise((resolve) => {
        let decalage = 0;
        let lcp = null;
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) if (!e.hadRecentInput) decalage += e.value;
        }).observe({ type: "layout-shift", buffered: true });
        new PerformanceObserver((l) => {
          lcp = l.getEntries().at(-1)?.startTime ?? lcp;
        }).observe({ type: "largest-contentful-paint", buffered: true });

        setTimeout(() => {
          const nav = performance.getEntriesByType("navigation")[0];
          const poids = {};
          const compter = (type, octets) => (poids[type] = (poids[type] ?? 0) + octets);
          compter("document", nav.transferSize || nav.encodedBodySize);
          for (const e of performance.getEntriesByType("resource")) {
            const type =
              e.initiatorType === "css" || /\.css/.test(e.name) ? "feuille de style"
              : /\.woff2?/.test(e.name) ? "police"
              : /\.js/.test(e.name) ? "script"
              : e.initiatorType;
            compter(type, e.transferSize || e.encodedBodySize);
          }
          resolve({
            decalage: +decalage.toFixed(4),
            lcp: lcp === null ? null : Math.round(lcp),
            dom: Math.round(nav.domContentLoadedEventEnd),
            ressources: performance.getEntriesByType("resource").length + 1,
            poids,
          });
        }, 1800);
      }),
  );

  const enKo = (n) => Math.round(n / 1024);
  console.log("\nPOIDS TRANSFÉRÉ (accueil, après compression)");
  for (const [t, o] of Object.entries(mesures.poids).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${t.padEnd(18)} ${String(enKo(o)).padStart(5)} ko`);
  }
  const total = Object.values(mesures.poids).reduce((a, b) => a + b, 0);
  console.log(`  ${"TOTAL".padEnd(18)} ${String(enKo(total)).padStart(5)} ko  ·  ${mesures.ressources} requêtes`);
  console.log(
    `\nMESURES : LCP ${mesures.lcp} ms · DOM prêt ${mesures.dom} ms · décalage cumulé ${mesures.decalage}`,
  );

  if (mesures.decalage > 0.1) ko(`décalage de mise en page ${mesures.decalage} (seuil 0,1)`);
  if (enKo(mesures.poids.script ?? 0) > 200) ko(`${enKo(mesures.poids.script)} ko de JavaScript (seuil 200)`);
  if (enKo(total) > 600) ko(`${enKo(total)} ko transférés (seuil 600)`);
  if (mesures.ressources > 40) ko(`${mesures.ressources} requêtes pour une page (seuil 40)`);

  await ctx.close();
}

await nav.close();

console.log("\nROBUSTESSE");
if (constats.length) {
  for (const c of constats) console.log("  ✗ " + c);
  process.exit(1);
}
console.log("  zoom 200 % et 400 %, espacement du texte, couleurs forcées, sans JS : rien à signaler");
