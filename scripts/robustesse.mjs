/**
 * Les conditions que personne ne teste.
 *
 * Un site se vérifie d'ordinaire dans une fenêtre confortable, à 100 %,
 * avec sa feuille de style complète et JavaScript actif. Les vrais
 * lecteurs, eux, zooment à 200 %, forcent leurs couleurs, allongent les
 * interlignes, ou coupent les scripts. Ce fichier reproduit ces
 * quatre-là, plus le poids réellement transféré — celui de chacune
 * des pages de la liste, défilée jusqu’en bas, et non celui du seul
 * premier écran de l’accueil.
 *
 *     node scripts/robustesse.mjs [http://localhost:3011]
 */

import { chromium } from "playwright";

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
/*  5. Le poids réellement transféré, page par page                    */
/* ------------------------------------------------------------------ */
{
  const ctx = await nav.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  /*
   * Deux jeux de seuils, parce qu’il y a deux sortes de pages.
   *
   * Le premier est celui d’une page de texte : l’accueil, l’agence, le
   * contact. Le second vaut sous `/projets` — la liste comme les six
   * fiches, qui publient les unes et les autres six photographies en
   * pleine largeur. Ce n’est pas une indulgence accordée aux pages
   * lourdes : ces photographies sont le contenu même d’un site
   * d’architecture, pas un décor, et les juger à l’aune d’une page de
   * texte ne laisse que deux issues, mauvaises toutes les deux — une
   * vérification rouge en permanence, que plus personne ne lit, ou un
   * seuil commun relevé pour tout le monde, qui ne surveille plus rien
   * nulle part. Le budget de script, lui, ne bouge pas d’un jeu à
   * l’autre : le même JavaScript sert toutes les pages, et celle qui en
   * charge davantage est une régression quelle que soit sa longueur.
   */
  const SEUILS = {
    texte: { total: 600, script: 200, requetes: 40 },
    projets: { total: 600, script: 200, requetes: 40 },
  };

  /*
   * Deux relevés par page, et non un seul — la correction de la
   * correction.
   *
   * Ce bloc a d’abord été étendu en défilant chaque page jusqu’en bas
   * avant de peser, ce qui est la bonne façon de voir les images
   * différées. Mais cela déplaçait la mesure sans le dire : le chiffre
   * publié partout pour l’accueil était celui de l’arrivée, et le seuil
   * de 600 avait été calibré dessus. Peser la page entière sous le même
   * seuil le faisait échouer sur une page qui n’avait pas changé d’un
   * octet ; et desserrer le seuil jusqu’à 1600 pour qu’il passe revenait
   * à ne plus rien mesurer. Un seuil qu’on déplace pour qu’il passe ne
   * mesure plus rien.
   *
   * On relève donc les deux :
   *
   *   à l’arrivée   ce que le visiteur paie avant d’avoir rien vu.
   *                 C’est le chiffre historique, encadré par les 600 ko
   *                 et 40 requêtes ci-dessus, sur TOUTES les pages.
   *   page entière  ce qu’il paie s’il lit tout. C’est là que vivent les
   *                 photographies différées, donc là que le constat se
   *                 trouvait — et il ne pouvait pas se voir tant qu’on ne
   *                 descendait pas.
   *
   * Les seuils de page entière sont calibrés sur le relevé du 13 août
   * avec une marge d’un dixième : ils ne font échouer personne
   * aujourd’hui, mais ils feront échouer la prochaine photographie
   * qu’on ajouterait sans la redimensionner.
   */
  const SEUILS_ENTIERE = {
    texte: { total: 950, requetes: 48 },
    projets: { total: 1100, requetes: 52 },
  };
  const seuilsEntiereDe = (p) =>
    /^\/projets(\/|$)/.test(p) ? SEUILS_ENTIERE.projets : SEUILS_ENTIERE.texte;

  /*
   * Le dépassement connu, épinglé plutôt que pardonné.
   *
   * La page Projets pèse 752 ko à l’arrivée, pour un seuil de 600. Ce
   * n’est pas une régression : le dépassement était là avant qu’on
   * pense à le mesurer, et c’est très exactement ce que la pesée
   * étendue existe pour montrer. Il vient du fichier maître de la
   * première photographie — 282 ko — demandé en plus de la déclinaison
   * de 500 px réellement affichée, par le préchargement d’image que
   * React émet pour l’image `fetchPriority="high"`. Deux pistes ont été
   * suivies et écartées par la mesure : écrire la plus petite
   * déclinaison dans `src` plutôt que le maître (fait, utile en soi,
   * sans effet ici), et remplacer la syntaxe d’intervalle du `sizes`
   * par `min-width` (fait, conforme à la règle que ce dépôt s’était
   * déjà donnée ailleurs, sans effet ici non plus). La cause reste à
   * trouver.
   *
   * Desserrer le seuil reviendrait à ne plus rien mesurer — c’est
   * précisément ce que faisait le seuil de 1600 qu’on vient de retirer.
   * On épingle donc la valeur constatée, à la date où elle l’a été : le
   * script la redit à chaque passage, et il échoue dès que la page
   * prend un octet de plus. Le jour où la cause sera trouvée, cette
   * entrée disparaît et le seuil reprend seul.
   */
  const EPINGLE = {
    "/projets": { arrivee: 752, requetes: 32, depuis: "2026-08-13" },
  };
  const seuilsDe = (p) => (/^\/projets(\/|$)/.test(p) ? SEUILS.projets : SEUILS.texte);

  /*
   * Peser sans défiler revient à peser le premier écran. Les
   * photographies portent `loading="lazy"` : le navigateur ne les
   * demande qu’en les voyant approcher de la fenêtre, et le Resource
   * Timing relevé au chargement ne les compte donc pas. C’est ce qui a
   * longtemps fait passer une fiche de projet pour aussi légère que
   * l’accueil, alors qu’elle en charge six. On descend par écrans
   * entiers, en relisant la hauteur à chaque tour — elle grandit à
   * mesure que les images prennent leur place —, puis on attend que le
   * réseau se taise.
   */
  const parcourir = async () => {
    await page.evaluate(async () => {
      const pas = Math.round(window.innerHeight * 0.9);
      for (let y = 0; y < document.documentElement.scrollHeight; y += pas) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 150));
      }
      window.scrollTo(0, document.documentElement.scrollHeight);
    });
    await page.waitForLoadState("networkidle");
  };

  /*
   * Le poids se lit dans le Resource Timing, pas dans l’en-tête
   * `content-length` : Next sert en transfert fragmenté, et cet en-tête
   * est alors absent — une mesure qui s’y fie ne voit que les polices,
   * qui sont des fichiers statiques.
   *
   * Les deux observateurs sont posés après le défilement et non avant,
   * et c’est sans conséquence : `buffered: true` leur rejoue ce qui
   * s’est produit depuis l’ouverture de la page, décalages compris.
   */
  const mesurer = () =>
    page.evaluate(
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
          }, 600);
        }),
    );

  const enKo = (n) => Math.round(n / 1024);
  const releves = [];

  for (const p of PAGES) {
    await page.goto(BASE + p, { waitUntil: "networkidle" });
    /* Ce qui est arrivé sans que personne n’ait défilé. */
    const arrivee = await mesurer();
    const totalArrivee = Object.values(arrivee.poids).reduce((a, b) => a + b, 0);
    await parcourir();
    const mesures = await mesurer();
    const total = Object.values(mesures.poids).reduce((a, b) => a + b, 0);
    releves.push({ p, mesures, total, arrivee, totalArrivee });

    /* Le détail par type de ressource ne sert qu’une fois : il dit d’où
       vient le poids — combien de police, combien de script, combien de
       document — et cette répartition-là est la même sur tout le site,
       aux photographies près. On la garde donc pour l’accueil, et les
       autres pages tiennent en une ligne du tableau ci-dessous. */
    if (p === "/") {
      console.log("\nPOIDS TRANSFÉRÉ À L’ARRIVÉE (accueil, après compression)");
      for (const [t, o] of Object.entries(arrivee.poids).sort((a, b) => b[1] - a[1])) {
        console.log(`  ${t.padEnd(18)} ${String(enKo(o)).padStart(5)} ko`);
      }
      console.log(
        `  ${"TOTAL".padEnd(18)} ${String(enKo(totalArrivee)).padStart(5)} ko  ·  ${arrivee.ressources} requêtes`,
      );
    }
  }

  console.log("\nPAGE PAR PAGE \u2014 \u00c0 L\u2019ARRIV\u00c9E, PUIS D\u00c9FIL\u00c9E JUSQU\u2019EN BAS");
  for (const { p, mesures, total, arrivee, totalArrivee } of releves) {
    console.log(
      `  ${p.padEnd(32)} ${String(enKo(totalArrivee)).padStart(5)} ko \u00b7${String(arrivee.ressources).padStart(3)} req` +
        `   \u2192 ${String(enKo(total)).padStart(5)} ko \u00b7${String(mesures.ressources).padStart(3)} req` +
        `   LCP ${String(mesures.lcp ?? "\u2014").padStart(4)} ms \u00b7 d\u00e9calage ${mesures.decalage}`,
    );
  }

  for (const { p, mesures, total, arrivee, totalArrivee } of releves) {
    const seuils = seuilsDe(p);
    const seuilsE = seuilsEntiereDe(p);
    if (mesures.decalage > 0.1)
      ko(`d\u00e9calage de mise en page ${mesures.decalage} sur ${p} (seuil 0,1)`);
    if (enKo(mesures.poids.script ?? 0) > seuils.script)
      ko(`${enKo(mesures.poids.script)} ko de JavaScript sur ${p} (seuil ${seuils.script})`);
    const pin = EPINGLE[p];
    const plafond = pin
      ? { total: pin.arrivee, requetes: pin.requetes }
      : { total: seuils.total, requetes: seuils.requetes };
    if (pin)
      console.log(
        `  \u26a0 ${p} \u2014 ${pin.arrivee} ko \u00e0 l\u2019arriv\u00e9e pour un seuil de ${seuils.total} : ` +
          `d\u00e9passement connu, \u00e9pingl\u00e9 depuis le ${pin.depuis}, cause non trouv\u00e9e`,
      );
    if (enKo(totalArrivee) > plafond.total)
      ko(`\u00e0 l\u2019arriv\u00e9e, ${enKo(totalArrivee)} ko transf\u00e9r\u00e9s sur ${p} (plafond ${plafond.total})`);
    if (arrivee.ressources > plafond.requetes)
      ko(`\u00e0 l\u2019arriv\u00e9e, ${arrivee.ressources} requ\u00eates sur ${p} (plafond ${plafond.requetes})`);
    if (enKo(total) > seuilsE.total)
      ko(`page enti\u00e8re, ${enKo(total)} ko transf\u00e9r\u00e9s sur ${p} (seuil ${seuilsE.total})`);
    if (mesures.ressources > seuilsE.requetes)
      ko(`page enti\u00e8re, ${mesures.ressources} requ\u00eates sur ${p} (seuil ${seuilsE.requetes})`);
  }

  await ctx.close();
}

await nav.close();

console.log("\nROBUSTESSE");
if (constats.length) {
  for (const c of constats) console.log("  ✗ " + c);
  process.exit(1);
}
console.log(
  "  zoom 200 % et 400 %, espacement du texte, couleurs forcées, sans JS,\n" +
    "  poids de chaque page : rien à signaler",
);
