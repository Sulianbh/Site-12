/**
 * Est-ce que les liens mènent quelque part ?
 *
 * Un lien mort ne se voit pas en relisant le code : l'ancre `#questions`
 * existait au moment où on a écrit le lien du pied de page, et c'est
 * trois semaines plus tard, en renommant une section, qu'elle cesse
 * d'exister. Personne ne reteste le pied de page en renommant une
 * section. Ce script le fait.
 *
 * Il part du plan du site — donc de la vérité que le site publie
 * lui-même — puis suit chaque lien de chaque page :
 *
 *   — une route interne doit répondre 200, et être une route connue ;
 *   — une ancre `#…` doit exister dans la page visée, pas seulement
 *     dans celle d'où l'on part ;
 *   — `tel:` doit être au format E.164, `mailto:` doit correspondre à
 *     l'adresse déclarée dans le canon de l'agence ;
 *   — un lien doit avoir un nom accessible, et deux liens qui portent
 *     le même nom ne doivent pas mener à deux endroits différents ;
 *   — toute page du plan doit être atteignable depuis une autre page ;
 *   — une page indexable atteignable doit être au plan, une page en
 *     `noindex` ne doit pas y être, et surtout : `robots.txt` ne doit
 *     rien interdire qui porte un `noindex`. Ces deux-là s'annulent —
 *     un robot qui respecte l'interdiction ne charge jamais la page,
 *     donc ne lit jamais le `noindex` qu'elle porte, et l'adresse finit
 *     indexée sans résumé. C'est le défaut que ce script a trouvé la
 *     première fois qu'il a tourné.
 *
 *     node scripts/liens.mjs [http://localhost:3011]
 */

import { chromium } from "playwright";

const BASE = process.argv.find((a) => a.startsWith("http")) ?? "http://localhost:3011";
const constats = {
  morts: [], ancres: [], protocoles: [], noms: [], ambigus: [], plan: [], robots: [],
};

/* Ce que l'agence déclare, pour comparer aux liens réellement écrits. */
const { AGENCE } = await import("../src/lib/agence.ts");

/* Les tournures qui ne disent rien hors de leur contexte visuel. */
const VIDES = /^(ici|cliquez|cliquer|en savoir plus|lire la suite|voir|plus|→|↗|›)$/i;

/* ------------------------------------------------------------------ */
/*  Le plan du site, tel que le site le publie                         */
/* ------------------------------------------------------------------ */

const plan = [...(await (await fetch(BASE + "/sitemap.xml")).text())
  .matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => new URL(m[1]).pathname);

/*
 * Le plan du site n'est pas toujours la bonne amorce.
 *
 * Tant que la démonstration n'est pas indexable, le plan est
 * délibérément vide : un plan qui listerait des pages en « noindex »
 * serait démenti ligne à ligne. Ce script partait pourtant de lui, et
 * s'arrêtait alors sur « rien à vérifier » — après avoir vérifié 297
 * liens sur 13 pages la veille. Le pire des cas est celui-là : un
 * vérificateur qui ne trouve rien parce qu'il n'a rien regardé.
 *
 * On repart donc de la racine quand le plan est vide. Les deux amorces
 * convergent : le script suit ensuite chaque lien de chaque page, et la
 * fermeture transitive est la même.
 */
const amorce = plan.length ? plan : ["/"];

if (!plan.length)
  console.log(
    "  plan du site vide (démonstration non indexable) — " +
      "amorce prise sur la racine",
  );

/* La 404 n'est pas au plan, et c'est normal : elle est en noindex. On
   la visite quand même, ses liens comptent autant que les autres. */
const AVISITER = [...amorce, "/cette-adresse-nexiste-pas"];

/* ------------------------------------------------------------------ */
/*  Récolte                                                            */
/* ------------------------------------------------------------------ */

const RECOLTER = () =>
  [...document.querySelectorAll("a[href]")].map((a) => ({
    href: a.getAttribute("href"),
    resolu: a.href,
    /* Le nom accessible d'abord ; à défaut le texte visible. Un lien
       qui enveloppe une carte entière porte souvent son nom dans un
       `aria-label`, et son texte visible fait trois lignes. */
    nom: (a.getAttribute("aria-label") || a.textContent || "")
      .replace(/\s+/g, " ")
      .trim(),
    cible: a.getAttribute("target"),
    rel: a.getAttribute("rel"),
    /* Un lien dont la boîte est nulle et qui n'est pas simplement
       replié dans un menu fermé : personne ne peut le suivre. */
    invisible: a.offsetWidth === 0 && a.offsetHeight === 0,
  }));

const ANCRES = () => [...document.querySelectorAll("[id]")].map((e) => e.id);

const ROBOTS = () =>
  document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? "";

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.setDefaultTimeout(15000);

/** page → ancres qu'elle contient */
const ancresDe = new Map();
/** page → liens qu'elle porte */
const liensDe = new Map();
/** page → contenu de sa balise meta robots */
const robotsDe = new Map();

async function visiter(p, statutAttendu = 200) {
  const rep = await page.goto(BASE + p, { waitUntil: "networkidle" });
  if (rep.status() !== statutAttendu) {
    constats.morts.push(`${p} — répond ${rep.status()}, attendu ${statutAttendu}`);
    return false;
  }
  /* Déplier ce qui est replié : les réponses des questions portent des
     identifiants et sont des cibles d'ancre légitimes. */
  await page.evaluate(() => {
    document.querySelectorAll("details").forEach((d) => (d.open = true));
    document.querySelectorAll("[data-observe]").forEach((e) => (e.dataset.vu = "oui"));
  });
  ancresDe.set(p, new Set(await page.evaluate(ANCRES)));
  liensDe.set(p, await page.evaluate(RECOLTER));
  robotsDe.set(p, await page.evaluate(ROBOTS));
  return true;
}

for (const p of AVISITER) await visiter(p, p.startsWith("/cette-adresse") ? 404 : 200);

/* Suivre ce qu'on vient de découvrir. Le plan du site ne contient que
   ce qui doit être indexé ; les mentions légales, elles, sont liées
   depuis toutes les pages sans y figurer. Sans ce second tour, leurs
   propres liens ne seraient jamais vérifiés. */
for (let tour = 0; tour < 3; tour++) {
  const nouvelles = new Set();
  for (const liens of liensDe.values())
    for (const l of liens) {
      if (l.href.startsWith("#")) continue;
      const u = new URL(l.resolu);
      if (u.origin !== new URL(BASE).origin) continue;
      if (!liensDe.has(u.pathname)) nouvelles.add(u.pathname);
    }
  if (!nouvelles.size) break;
  for (const p of nouvelles) await visiter(p);
}

/* Le menu du téléphone n'existe pas tant qu'on ne l'ouvre pas : ses
   liens ne sont dans aucune récolte ci-dessus. */
{
  const tel = await nav.newContext({ viewport: { width: 390, height: 780 }, hasTouch: true });
  const pt = await tel.newPage();
  await pt.goto(BASE + "/", { waitUntil: "networkidle" });
  await pt.getByRole("button", { name: /Ouvrir le menu/ }).click();
  await pt.waitForTimeout(220);
  liensDe.set("/ (menu du téléphone)", await pt.evaluate(RECOLTER));
  await tel.close();
}

await ctx.close();
await nav.close();

/* ------------------------------------------------------------------ */
/*  Vérifications                                                      */
/* ------------------------------------------------------------------ */

const connues = new Set(plan);
const atteintes = new Set();
/** nom de lien → ensemble des destinations portant ce nom */
const parNom = new Map();

/** La page d'où part le lien, débarrassée du libellé du menu replié. */
const depuis = (p) => p.replace(/ \(.*\)$/, "");

for (const [p, liens] of liensDe) {
  for (const l of liens) {
    const url = new URL(l.resolu);

    /* --- ancre de la page courante -------------------------------- */
    /* `href="#contenu"` ne désigne pas une route : le comparer au plan
       du site ferait passer le lien d'évitement pour un lien mort, et
       le compter parmi les destinations ferait de « Aller au contenu »
       un nom ambigu sur les douze pages à la fois. */
    if (l.href.startsWith("#")) {
      const id = decodeURIComponent(l.href.slice(1));
      const ancres = ancresDe.get(depuis(p));
      if (id && ancres && !ancres.has(id))
        constats.ancres.push(`${p} — « ${l.nom || l.href} » vise #${id}, absent de la page elle-même`);
      continue;
    }

    /* --- protocoles particuliers --------------------------------- */
    if (url.protocol === "mailto:") {
      const adresse = decodeURIComponent(url.pathname);
      if (adresse !== AGENCE.courriel)
        constats.protocoles.push(`${p} — mailto vers « ${adresse} », le canon dit « ${AGENCE.courriel} »`);
      continue;
    }
    if (url.protocol === "tel:") {
      const numero = decodeURIComponent(url.pathname);
      if (!/^\+[1-9]\d{6,14}$/.test(numero))
        constats.protocoles.push(`${p} — tel « ${numero} » n'est pas au format E.164`);
      else if (numero !== AGENCE.telephoneE164)
        constats.protocoles.push(`${p} — tel vers « ${numero} », le canon dit « ${AGENCE.telephoneE164} »`);
      continue;
    }

    /* --- lien sortant -------------------------------------------- */
    if (url.origin !== new URL(BASE).origin) {
      if (l.cible === "_blank" && !/noopener/.test(l.rel ?? ""))
        constats.protocoles.push(`${p} — ${url.href} s'ouvre en nouvel onglet sans rel="noopener"`);
      continue;
    }

    /* --- nom accessible ------------------------------------------ */
    if (!l.nom) constats.noms.push(`${p} — lien sans nom vers ${url.pathname}`);
    else if (VIDES.test(l.nom))
      constats.noms.push(`${p} — « ${l.nom} » ne dit pas où il mène`);
    else {
      const cle = l.nom.toLowerCase();
      if (!parNom.has(cle)) parNom.set(cle, new Map());
      parNom.get(cle).set(url.pathname + url.hash, p);
    }

    /* --- la route existe-t-elle ? -------------------------------- */
    const chemin = url.pathname;
    atteintes.add(chemin);
    if (!liensDe.has(chemin))
      constats.morts.push(`${p} — « ${l.nom || l.href} » mène à ${chemin}, qui ne répond pas`);

    /* --- l'ancre existe-t-elle dans la page visée ? --------------- */
    if (url.hash && url.hash.length > 1) {
      const id = decodeURIComponent(url.hash.slice(1));
      const cible = ancresDe.get(chemin);
      if (!cible) continue; // page non visitée, déjà signalée comme morte
      if (!cible.has(id))
        constats.ancres.push(`${p} — « ${l.nom || l.href} » vise #${id}, qui n'existe pas dans ${chemin}`);
    }
  }
}

/* --- deux liens de même nom qui ne mènent pas au même endroit ------ */
for (const [nom, destinations] of parNom) {
  if (destinations.size > 1)
    constats.ambigus.push(
      `« ${nom} » mène à ${[...destinations.keys()].join(" et à ")}`,
    );
}

/* --- page orpheline ------------------------------------------------ */
for (const p of plan)
  if (!atteintes.has(p)) constats.plan.push(`${p} est au plan mais aucun lien n'y mène`);

/* --- le plan et les `noindex` disent-ils la même chose ? ------------ */
for (const [p, robots] of robotsDe) {
  if (p.startsWith("/cette-adresse")) continue; // la 404 n'a rien à faire au plan
  const noindex = /noindex/.test(robots);
  if (noindex && connues.has(p))
    constats.plan.push(`${p} porte « ${robots} » et figure pourtant au plan du site`);
  if (!noindex && !connues.has(p) && atteintes.has(p))
    constats.plan.push(`${p} est indexable et liée depuis le site, mais absente du plan`);
}

/* --- robots.txt contredit-il un `noindex` ? ------------------------- */
{
  const txt = await (await fetch(BASE + "/robots.txt")).text();
  const interdits = [...txt.matchAll(/^\s*Disallow:\s*(\S+)\s*$/gim)].map((m) => m[1]);
  for (const chemin of interdits) {
    if (chemin === "/") continue;
    const robots = robotsDe.get(chemin);
    if (robots === undefined) continue;
    if (/noindex/.test(robots))
      constats.robots.push(
        `robots.txt interdit ${chemin}, qui porte « ${robots} » — ` +
          `le robot ne chargera pas la page, ne lira donc jamais le noindex, ` +
          `et l'adresse pourra être indexée sans résumé. Les deux s'annulent : ` +
          `garder le noindex, retirer le Disallow.`,
      );
    if (/\bfollow\b/.test(robots) && !/nofollow/.test(robots))
      constats.robots.push(
        `robots.txt interdit ${chemin}, qui demande « follow » — ` +
          `une page qu'on ne charge pas est une page dont on ne suit aucun lien.`,
      );
  }
  if (!/^\s*Sitemap:\s*http/im.test(txt))
    constats.robots.push("robots.txt ne déclare pas de plan du site");
}

/* ------------------------------------------------------------------ */

const bloc = (titre, a) => {
  console.log(`\n${titre}`);
  console.log(a.length ? a.map((x) => "  ✗ " + x).join("\n") : "  rien à signaler");
};

console.log("LIENS ET ANCRES");
bloc("ROUTES MORTES", constats.morts);
bloc("ANCRES INEXISTANTES", constats.ancres);
bloc("TÉLÉPHONE, COURRIEL, LIENS SORTANTS", constats.protocoles);
bloc("LIENS SANS NOM OU AU NOM MUET", constats.noms);
bloc("MÊME NOM, DESTINATIONS DIFFÉRENTES", constats.ambigus);
bloc("PLAN DU SITE", constats.plan);
bloc("ROBOTS.TXT", constats.robots);

const total = Object.values(constats).reduce((n, a) => n + a.length, 0);
const nbLiens = [...liensDe.values()].reduce((n, a) => n + a.length, 0);
console.log(
  `\n${nbLiens} liens sur ${liensDe.size} pages — ` +
    (total ? `${total} constat(s)` : "aucun constat"),
);
process.exit(total ? 1 : 0);
