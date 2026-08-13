/**
 * L'audit du site rendu.
 *
 * Il ouvre chaque page à chaque largeur et vérifie ce qui ne se voit pas
 * à la relecture du code : le contraste réel après composition des
 * fonds, le débordement horizontal, la taille des cibles, la
 * typographie française telle qu'elle arrive dans le HTML, la structure
 * des titres, l'étiquetage des champs, et les métadonnées.
 *
 * Le site doit tourner (`npm start`) sur le port attendu.
 *
 *     node scripts/audit.mjs [http://localhost:3011]
 */

import { chromium } from "playwright";

const BASE = process.argv.find((a) => a.startsWith("http")) ?? "http://localhost:3011";

/*
 * La page 404 est dans la liste, et elle y est parce qu'elle n'y était
 * pas : elle était la seule page du site qu'aucun script ne regardait,
 * alors qu'elle a un titre, une liste de liens, des cibles au doigt et
 * ses propres métadonnées comme les autres. C'est là qu'a été trouvée
 * la canonique héritée qui la faisait passer pour un doublon de
 * l'accueil.
 */
const P404 = "/cette-adresse-nexiste-pas";
const PAGES = [
  "/", "/projets", "/agence", "/contact", "/mentions-legales", P404,
  "/projets/ateliers-de-la-fonderie-montreuil",
  "/projets/maison-a-cour-montreuil",
  "/projets/brasserie-du-canal-pantin",
  "/projets/maison-de-maitre-nogent",
  "/projets/surelevation-ramponneau-paris",
  "/projets/halle-des-deux-ponts-ivry",
];
const LARGEURS = [320, 360, 390, 768, 1024, 1280, 1440, 1920];

/* ------------------------------------------------------------------ */
/*  Ce qui est mesuré dans la page                                     */
/* ------------------------------------------------------------------ */

const MESURER = () => {
  /* --- contraste ------------------------------------------------- */
  const lum = (c) => {
    const f = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };
  /* `color(srgb …)` apparaît dès qu'une couleur passe par color-mix()
     ou un espace moderne ; un parseur qui n'en tient pas compte le lit
     comme du quasi-noir et invente des centaines d'échecs. */
  const parse = (s) => {
    if (!s) return null;
    let m = s.match(/^rgba?\(([^)]+)\)/);
    if (m) {
      const p = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number);
      return { rgb: [p[0] / 255, p[1] / 255, p[2] / 255], a: p.length > 3 ? p[3] : 1 };
    }
    m = s.match(/^color\(srgb\s+([^)]+)\)/);
    if (m) {
      const p = m[1].split(/[\s\/]+/).filter(Boolean).map(Number);
      return { rgb: [p[0], p[1], p[2]], a: p.length > 3 ? p[3] : 1 };
    }
    return null;
  };
  const melange = (av, ar) => av.rgb.map((c, i) => c * av.a + ar[i] * (1 - av.a));
  const fond = (el) => {
    let n = el;
    const pile = [];
    while (n && n.nodeType === 1) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0) { pile.push(c); if (c.a === 1) break; }
      n = n.parentElement;
    }
    let base = [1, 1, 1];
    for (let i = pile.length - 1; i >= 0; i--) base = melange(pile[i], base);
    return base;
  };
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
    return (x + 0.05) / (y + 0.05);
  };

  const r = {
    contraste: [], debord: null, ids: [], cibles: [], typo: [],
    titres: [], champs: [], reperes: [], images: [],
  };

  /* --- débordement horizontal ------------------------------------ */
  if (document.documentElement.scrollWidth > window.innerWidth + 1) {
    r.debord = {
      large: document.documentElement.scrollWidth,
      vue: window.innerWidth,
      coupables: [...document.querySelectorAll("body *")]
        .filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1)
        .slice(0, 4)
        .map((e) => e.tagName + "." + String(e.className).slice(0, 44)),
    };
  }

  /* --- contraste de tout texte visible --------------------------- */
  for (const el of document.querySelectorAll("body *")) {
    const txt = [...el.childNodes]
      .filter((n) => n.nodeType === 3 && n.textContent.trim())
      .map((n) => n.textContent.trim()).join(" ");
    if (!txt) continue;
    const st = getComputedStyle(el);
    if (st.visibility === "hidden" || st.display === "none" || +st.opacity === 0) continue;
    const b = el.getBoundingClientRect();
    if (!b.width || !b.height) continue;
    const av = parse(st.color);
    if (!av) continue;
    const bg = fond(el);
    const c = ratio(melange(av, bg), bg);
    const px = parseFloat(st.fontSize);
    const large = px >= 24 || (px >= 18.66 && +st.fontWeight >= 700);
    const seuil = large ? 3 : 4.5;
    if (c < seuil) r.contraste.push({ txt: txt.slice(0, 46), c: +c.toFixed(2), seuil, px });
  }

  /* --- identifiants uniques -------------------------------------- */
  const vus = {};
  for (const el of document.querySelectorAll("[id]")) vus[el.id] = (vus[el.id] || 0) + 1;
  r.ids = Object.entries(vus).filter(([, n]) => n > 1).map(([k]) => k);

  /* --- cibles tactiles, seuil 2.5.8 ------------------------------ */
  for (const el of document.querySelectorAll("a[href], button, input, select, textarea, summary")) {
    const st = getComputedStyle(el);
    if (st.display === "none" || st.visibility === "hidden") continue;
    const b = el.getBoundingClientRect();
    if (!b.width || !b.height) continue;
    if (b.height < 24 || b.width < 24) {
      r.cibles.push({ tag: el.tagName, t: (el.textContent || "").trim().slice(0, 26),
        w: Math.round(b.width), h: Math.round(b.height) });
    }
  }

  /* --- typographie française dans le texte rendu ------------------ */
  const prose = document.body.innerText;
  const releve = (motif, quoi) => {
    for (const m of prose.matchAll(motif)) {
      r.typo.push({ quoi, ou: prose.slice(Math.max(0, m.index - 34), m.index + 24).replace(/\n/g, " ").trim() });
    }
  };
  releve(/[\p{L}]'[\p{L}]/gu, "apostrophe droite");
  releve(/\S [:;!?](?=\s|$)/gu, "espace sécable avant une ponctuation double");
  releve(/«(?![  ])|(?<![  ])»/gu, "guillemet mal espacé");
  releve(/\d %/gu, "espace sécable avant le pourcentage");
  releve(/\.\.\./gu, "trois points au lieu des points de suspension");
  releve(/ - /gu, "trait d'union en guise de tiret");

  /* --- plan des titres ------------------------------------------- */
  let precedent = 0;
  for (const h of document.querySelectorAll("h1,h2,h3,h4,h5,h6")) {
    const n = +h.tagName[1];
    const st = getComputedStyle(h);
    if (st.display === "none") continue;
    if (precedent && n > precedent + 1) {
      r.titres.push(`saut de h${precedent} à h${n} — « ${h.textContent.trim().slice(0, 40)} »`);
    }
    precedent = n;
  }
  r.nbH1 = document.querySelectorAll("h1").length;

  /* --- champs de formulaire étiquetés ---------------------------- */
  for (const el of document.querySelectorAll("input, select, textarea")) {
    if (el.type === "hidden") continue;
    const nom =
      el.labels?.length ||
      el.getAttribute("aria-label") ||
      el.getAttribute("aria-labelledby") ||
      el.getAttribute("title");
    if (!nom) r.champs.push(el.name || el.id || el.tagName);
  }

  /* --- repères et régions ---------------------------------------- */
  r.reperes = {
    main: document.querySelectorAll("main").length,
    header: document.querySelectorAll("header").length,
    footer: document.querySelectorAll("footer").length,
    /* Plusieurs <nav> exigent chacun leur nom, sinon on ne peut pas les
       distinguer dans la liste des repères d'un lecteur d'écran. */
    navSansNom: [...document.querySelectorAll("nav")].filter(
      (n) => !n.getAttribute("aria-label") && !n.getAttribute("aria-labelledby"),
    ).length,
    langue: document.documentElement.lang,
  };

  /* --- images et dessins nommés ---------------------------------- */
  for (const el of document.querySelectorAll("img, svg[role='img']")) {
    const nom = el.getAttribute("alt") ?? el.getAttribute("aria-label");
    if (nom === null) r.images.push(el.tagName + " sans nom accessible");
  }

  r.titre = document.title;
  r.desc = document.querySelector("meta[name=description]")?.content ?? "";
  r.canonique = document.querySelector("link[rel=canonical]")?.href ?? "";
  r.jsonld = [...document.querySelectorAll('script[type="application/ld+json"]')]
    .map((s) => s.textContent);
  return r;
};

/* ------------------------------------------------------------------ */

const nav = await chromium.launch();
const bilan = {
  contraste: [], debord: [], ids: [], cibles: [], typo: [], titres: [],
  champs: [], reperes: [], images: [], console: [], meta: {}, jsonld: [],
};
const uniq = (a, k) => [...new Map(a.map((x) => [k(x), x])).values()];

for (const largeur of LARGEURS) {
  const ctx = await nav.newContext({ viewport: { width: largeur, height: 900 } });
  const page = await ctx.newPage();
  /* Sur la page 404, le navigateur journalise lui-même l'échec du
     chargement : le message n'est pas une trace d'erreur du site, c'est
     le compte rendu du 404 qu'on est allé chercher exprès. Il n'y a pas
     d'URL dans ce message-là — il faut donc savoir où l'on se trouve. */
  let ici = "";
  page.on("console", (m) => {
    if (m.type() === "error" && ici !== P404)
      bilan.console.push(`${largeur} ${m.text().slice(0, 110)}`);
  });
  page.on("pageerror", (e) => bilan.console.push(`${largeur} ERREUR JS ${e.message.slice(0, 110)}`));
  page.on("response", (res) => {
    /* La 404 répond 404 : c'est son travail, pas un incident. */
    if (res.status() >= 400 && !res.url().endsWith(P404))
      bilan.console.push(`${largeur} ${res.status()} ${res.url()}`);
  });

  for (const p of PAGES) {
    ici = p;
    await page.goto(BASE + p, { waitUntil: "networkidle" });
    /* Tout révéler : l'observateur ne se déclenche pas pour ce qui est
       sous la ligne de flottaison, et la moitié des mesures seraient
       faites sur des éléments à opacité nulle. */
    await page.evaluate(() => document.querySelectorAll("[data-observe]").forEach((e) => (e.dataset.vu = "oui")));
    await page.waitForTimeout(90);
    const r = await page.evaluate(MESURER);

    if (r.debord) bilan.debord.push({ p, largeur, ...r.debord });
    r.contraste.forEach((c) => bilan.contraste.push({ p, ...c }));
    r.ids.forEach((i) => bilan.ids.push(`${p} — ${i}`));
    r.cibles.forEach((c) => bilan.cibles.push({ p, largeur, ...c }));
    r.titres.forEach((t) => bilan.titres.push(`${p} — ${t}`));
    r.champs.forEach((c) => bilan.champs.push(`${p} — ${c}`));
    r.images.forEach((i) => bilan.images.push(`${p} — ${i}`));
    if (r.nbH1 !== 1) bilan.titres.push(`${p} — ${r.nbH1} h1`);
    if (r.reperes.main !== 1) bilan.reperes.push(`${p} — ${r.reperes.main} <main>`);
    if (r.reperes.navSansNom) bilan.reperes.push(`${p} — ${r.reperes.navSansNom} <nav> sans nom`);
    if (r.reperes.langue !== "fr") bilan.reperes.push(`${p} — lang="${r.reperes.langue}"`);

    if (largeur === 1440) {
      r.typo.forEach((t) => bilan.typo.push({ p, ...t }));
      bilan.meta[p] = { titre: r.titre, desc: r.desc, canonique: r.canonique };
      r.jsonld.forEach((j) => bilan.jsonld.push({ p, j }));
    }
  }
  await ctx.close();
}
await nav.close();

/* --- les métadonnées se valent-elles entre elles ? ----------------- */
const doublons = (champ) =>
  Object.entries(
    Object.entries(bilan.meta).reduce((a, [p, m]) => {
      (a[m[champ]] = a[m[champ]] || []).push(p);
      return a;
    }, {}),
  ).filter(([, v]) => v.length > 1);

/* --- le JSON-LD est-il analysable et cohérent ? -------------------- */
const jsonldKo = [];
for (const { p, j } of bilan.jsonld) {
  try {
    const o = JSON.parse(j);
    if (!o["@context"]) jsonldKo.push(`${p} — @context absent`);
    const types = (o["@graph"] ?? [o]).map((n) => n["@type"]).flat();
    if (!types.length) jsonldKo.push(`${p} — aucun @type`);
  } catch (e) {
    jsonldKo.push(`${p} — JSON invalide : ${e.message.slice(0, 60)}`);
  }
}

/* ------------------------------------------------------------------ */

const bloc = (titre, contenu) => {
  console.log(`\n${titre}`);
  console.log(contenu?.length ? contenu : "  rien à signaler");
};
const liste = (a) => (a.length ? a.map((x) => "  ✗ " + (typeof x === "string" ? x : JSON.stringify(x))).join("\n") : "");

bloc("DÉBORDEMENT HORIZONTAL", liste(bilan.debord));
bloc("CONTRASTE SOUS LE SEUIL AA", liste(uniq(bilan.contraste, (x) => x.txt + x.c).slice(0, 15)));
bloc("IDENTIFIANTS DUPLIQUÉS", liste([...new Set(bilan.ids)]));
bloc("CIBLES SOUS 24 px", liste(uniq(bilan.cibles, (x) => x.p + x.t + x.h).slice(0, 12)));
bloc("TYPOGRAPHIE FRANÇAISE", liste(uniq(bilan.typo, (x) => x.ou).slice(0, 15)));
bloc("PLAN DES TITRES", liste([...new Set(bilan.titres)]));
bloc("CHAMPS SANS ÉTIQUETTE", liste([...new Set(bilan.champs)]));
bloc("REPÈRES ET LANGUE", liste([...new Set(bilan.reperes)]));
bloc("DESSINS SANS NOM ACCESSIBLE", liste([...new Set(bilan.images)]));
bloc("CONSOLE ET RÉSEAU", liste([...new Set(bilan.console)].slice(0, 10)));
bloc("TITRES DUPLIQUÉS", liste(doublons("titre").map(([t, v]) => `${t} → ${v.join(", ")}`)));
bloc("DESCRIPTIONS DUPLIQUÉES", liste(doublons("desc").map(([d, v]) => `${(d || "(vide)").slice(0, 46)} → ${v.join(", ")}`)));
bloc("CANONIQUES DUPLIQUÉES", liste(doublons("canonique").map(([c, v]) => `${c} → ${v.join(", ")}`)));
bloc("DONNÉES STRUCTURÉES", liste(jsonldKo));
bloc(
  "LONGUEUR DES TITRES",
  liste(Object.entries(bilan.meta).filter(([, m]) => m.titre.length > 62)
    .map(([p, m]) => `${p} — ${m.titre.length} caractères`)),
);

const total =
  bilan.debord.length + bilan.contraste.length + bilan.ids.length + bilan.cibles.length +
  bilan.typo.length + bilan.titres.length + bilan.champs.length + bilan.reperes.length +
  bilan.images.length + bilan.console.length + jsonldKo.length +
  doublons("titre").length + doublons("desc").length + doublons("canonique").length;

console.log(
  `\n${PAGES.length} pages × ${LARGEURS.length} largeurs — ` +
    (total ? `${total} constat(s)` : "aucun constat"),
);
process.exit(total ? 1 : 0);
