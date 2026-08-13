/**
 * Le HTML produit est-il celui qu'on croit avoir écrit ?
 *
 * Les cinq autres scripts regardent ce que la page *fait* : ses couleurs,
 * ses cibles, ses liens, son comportement au clavier. Aucun ne regarde ce
 * qu'elle *est* — la structure du document lui-même. Or JSX ne valide
 * rien : il accepte sans broncher un `<div>` dans un `<p>`, un `<a>` dans
 * un `<a>`, un `aria-labelledby` qui ne désigne personne. Le navigateur
 * répare en silence, la page a l'air juste, et l'arbre d'accessibilité —
 * qui est ce que lit un lecteur d'écran — ne ressemble plus à ce qu'on
 * voit.
 *
 * Sept familles de vérification, toutes sur le document rendu :
 *
 *   1. Imbrications interdites par la spécification HTML.
 *   2. Renvois ARIA morts — un identifiant cité qui n'existe pas.
 *   3. Critère 2.5.3 : le nom accessible doit contenir le texte visible,
 *      sans quoi la commande vocale ne peut pas actionner ce qu'on lit.
 *   4. Ordre de tabulation contre ordre visuel.
 *   5. Commandes vides : lien, bouton ou titre sans texte.
 *   6. Repères en double, `tabindex` positif, rôles redondants.
 *   7. Données structurées : `@id` qui résolvent, types connus,
 *      propriétés requises, dates en ISO 8601.
 *
 *     node scripts/semantique.mjs [http://localhost:3011]
 */

import { chromium } from "playwright";

const BASE = process.argv.find((a) => a.startsWith("http")) ?? "http://localhost:3011";

const constats = {
  imbrication: [], renvois: [], nom: [], tabulation: [],
  vides: [], reperes: [], donnees: [],
};

/* ------------------------------------------------------------------ */
/*  Ce qui est mesuré dans la page                                     */
/* ------------------------------------------------------------------ */

const MESURER = () => {
  const r = {
    imbrication: [], renvois: [], nom: [], tabulation: [],
    vides: [], reperes: [], jsonld: [],
  };

  const ou = (el) => {
    const id = el.id ? `#${el.id}` : "";
    const cl = String(el.className || "").split(" ").filter(Boolean).slice(0, 2).join(".");
    return el.tagName.toLowerCase() + id + (cl ? "." + cl : "");
  };
  const texte = (el) => (el.textContent || "").replace(/\s+/g, " ").trim();

  /* --- 1. imbrications interdites -------------------------------- */

  /* Une liste ne contient que des éléments de liste. Un <div> glissé
     entre <ul> et <li> casse le comptage annoncé par les lecteurs
     d'écran (« liste de 6 éléments ») et parfois la liste entière. */
  for (const liste of document.querySelectorAll("ul, ol")) {
    for (const enfant of liste.children) {
      if (!["LI", "SCRIPT", "TEMPLATE"].includes(enfant.tagName))
        r.imbrication.push(`${ou(liste)} contient un <${enfant.tagName.toLowerCase()}> qui n'est pas un <li>`);
    }
  }

  /* Une liste de définitions n'accepte que dt, dd, et div comme
     regroupement. */
  for (const dl of document.querySelectorAll("dl")) {
    for (const enfant of dl.children) {
      if (!["DT", "DD", "DIV", "SCRIPT", "TEMPLATE"].includes(enfant.tagName))
        r.imbrication.push(`${ou(dl)} contient un <${enfant.tagName.toLowerCase()}>`);
    }
    /* Un <div> de regroupement ne doit contenir que dt et dd. */
    for (const groupe of dl.querySelectorAll(":scope > div")) {
      if (!groupe.querySelector(":scope > dt") || !groupe.querySelector(":scope > dd"))
        r.imbrication.push(`${ou(dl)} — un groupe sans <dt> ou sans <dd>`);
    }
  }

  /* Un paragraphe ne peut pas contenir de bloc : le navigateur ferme le
     <p> avant, et tout ce qui suivait se retrouve hors du paragraphe —
     y compris ce qu'on croyait avoir mis dedans. */
  const BLOCS = "div,p,ul,ol,dl,section,article,aside,nav,header,footer,h1,h2,h3,h4,h5,h6,figure,table,form,address,hr,blockquote";
  for (const p of document.querySelectorAll("p")) {
    for (const bloc of p.querySelectorAll(BLOCS))
      r.imbrication.push(`${ou(p)} contient un <${bloc.tagName.toLowerCase()}> : « ${texte(p).slice(0, 40)} »`);
  }

  /* Commandes imbriquées : ni un lien dans un lien, ni un bouton dans un
     lien. Le clic devient imprévisible et le focus se dédouble. */
  for (const a of document.querySelectorAll("a[href]")) {
    for (const dedans of a.querySelectorAll("a[href], button"))
      r.imbrication.push(`${ou(a)} contient un <${dedans.tagName.toLowerCase()}>`);
  }
  for (const b of document.querySelectorAll("button")) {
    for (const dedans of b.querySelectorAll("a[href], button"))
      r.imbrication.push(`${ou(b)} contient un <${dedans.tagName.toLowerCase()}>`);
  }

  /* Une adresse ne porte ni titre ni section. */
  for (const ad of document.querySelectorAll("address")) {
    for (const dedans of ad.querySelectorAll("h1,h2,h3,h4,h5,h6,section,article,header,footer,address"))
      r.imbrication.push(`${ou(ad)} contient un <${dedans.tagName.toLowerCase()}>`);
  }

  /* La légende d'une figure est son premier ou son dernier enfant. */
  for (const f of document.querySelectorAll("figure")) {
    for (const c of f.querySelectorAll(":scope > figcaption")) {
      if (c !== f.firstElementChild && c !== f.lastElementChild)
        r.imbrication.push(`${ou(f)} — <figcaption> ni en premier ni en dernier`);
    }
  }

  /* --- 2. renvois ARIA morts ------------------------------------- */

  for (const attr of ["aria-labelledby", "aria-describedby", "aria-controls", "aria-owns", "aria-details"]) {
    for (const el of document.querySelectorAll(`[${attr}]`)) {
      for (const id of el.getAttribute(attr).split(/\s+/).filter(Boolean)) {
        if (!document.getElementById(id))
          r.renvois.push(`${ou(el)} — ${attr}="${id}" ne désigne personne`);
      }
    }
  }
  for (const l of document.querySelectorAll("label[for]")) {
    if (!document.getElementById(l.getAttribute("for")))
      r.renvois.push(`<label for="${l.getAttribute("for")}"> ne désigne personne`);
  }

  /* --- 3. critère 2.5.3 : le nom contient le texte visible -------- */

  /*
   * Une commande vocale dit « clique sur Prendre rendez-vous ». Le
   * logiciel cherche ce texte dans le *nom accessible*. Si le nom dit
   * autre chose que ce qui est écrit, la commande ne trouve rien — et
   * la personne lit pourtant le bon mot à l'écran.
   */
  const normaliser = (s) =>
    s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, " ").trim();

  for (const el of document.querySelectorAll("a[aria-label], button[aria-label], [role=button][aria-label]")) {
    /* Le texte réellement affiché : ce qui n'est pas masqué. */
    const visible = [...el.childNodes]
      .map((n) => {
        if (n.nodeType === 3) return n.textContent;
        if (n.nodeType !== 1) return "";
        const s = getComputedStyle(n);
        if (s.display === "none" || s.visibility === "hidden") return "";
        if (n.classList?.contains("sr-only")) return "";
        return n.textContent;
      })
      .join(" ");
    const v = normaliser(visible);
    const n = normaliser(el.getAttribute("aria-label"));
    if (v && !n.includes(v))
      r.nom.push(`${ou(el)} — on lit « ${visible.trim().slice(0, 34)} », le nom dit « ${el.getAttribute("aria-label").slice(0, 44)} »`);
  }

  /* --- 4. ordre de tabulation contre ordre visuel ----------------- */

  /*
   * Un premier jet comparait l'ordre du document à un ordre de lecture
   * global — de haut en bas puis de gauche à droite. Il ne trouvait que
   * des faux positifs, et pour une raison de fond : dans une page à
   * colonnes, l'ordre du document *est* colonne par colonne, alors que
   * l'œil balaie ligne par ligne. Un pied de page à quatre colonnes
   * produisait ainsi une douzaine d'« inversions » qui sont exactement
   * la disposition qu'on veut — chaque colonne étant un titre suivi de
   * sa liste, la parcourir d'un bloc est plus juste que de sauter d'une
   * colonne à l'autre.
   *
   * Le vrai défaut est plus étroit, et c'est celui des critères 1.3.2 et
   * 2.4.3 : à l'intérieur d'un même conteneur, une règle CSS
   * (`order`, `row-reverse`, un placement de grille) déplace les
   * éléments sans toucher au document. Là, et seulement là, ce qu'on lit
   * et ce qu'on tabule divergent sans que rien ne le justifie. C'est ce
   * qu'on cherche ici.
   */
  const visible = (el) => {
    const b = el.getBoundingClientRect();
    return b.width > 0 && b.height > 0 && getComputedStyle(el).visibility !== "hidden";
  };

  for (const conteneur of document.querySelectorAll("*")) {
    const d = getComputedStyle(conteneur).display;
    if (d !== "flex" && d !== "grid" && d !== "inline-flex" && d !== "inline-grid") continue;

    const enfants = [...conteneur.children].filter(visible);
    if (enfants.length < 2) continue;

    /* Ne comparer que ce qui est réellement sur une même ligne, ou
       réellement dans une même colonne : deux boîtes qui ne se
       chevauchent sur aucun axe ne sont pas en concurrence. */
    for (let a = 0; a < enfants.length - 1; a++) {
      const A = enfants[a].getBoundingClientRect();
      const B = enfants[a + 1].getBoundingClientRect();

      const memeLigne = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top)
        > Math.min(A.height, B.height) / 2;

      /* Inversé horizontalement sur une même ligne, ou inversé
         verticalement dans une même colonne. */
      const inverse = memeLigne
        ? B.right <= A.left + 1
        : B.bottom <= A.top + 1;

      if (!inverse) continue;
      /* Un conteneur sans commande à l'intérieur ne pose pas de
         problème d'ordre de tabulation : il n'y a rien à tabuler. */
      const commandes = (el) =>
        el.matches("a[href], button, input, select, textarea, summary")
        || el.querySelector("a[href], button, input, select, textarea, summary");
      if (!commandes(enfants[a]) || !commandes(enfants[a + 1])) continue;

      r.tabulation.push(
        `${ou(conteneur)} — ${ou(enfants[a])} est écrit avant ${ou(enfants[a + 1])} mais s'affiche après`,
      );
    }
  }

  /* --- 5. commandes et titres vides ------------------------------ */

  for (const el of document.querySelectorAll("a[href], button")) {
    const nom = (el.getAttribute("aria-label") || el.textContent || "").trim();
    if (!nom) r.vides.push(`${ou(el)} sans texte ni nom`);
  }
  for (const h of document.querySelectorAll("h1,h2,h3,h4,h5,h6")) {
    if (!texte(h)) r.vides.push(`${ou(h)} vide`);
  }

  /* --- 6. repères, tabindex, rôles ------------------------------- */

  /*
   * Deux repères de même rôle doivent porter des noms différents, sans
   * quoi la liste des repères d'un lecteur d'écran annonce deux fois la
   * même chose sans qu'on puisse les distinguer.
   *
   * Seuls comptent ceux qui sont réellement affichés. Un site à barre
   * latérale écrit légitimement deux fois le même fil d'Ariane — l'un
   * pour la barre du haut, l'autre pour les écrans étroits — et n'en
   * montre jamais qu'un : `display: none` retire l'autre de l'arbre
   * d'accessibilité, il n'existe donc pas pour un lecteur d'écran. Un
   * premier jet comptait les deux et signalait un doublon qui n'a
   * jamais atteint personne.
   */
  const parRole = {};
  for (const el of document.querySelectorAll("nav, main, header, footer, aside, form[aria-label], form[aria-labelledby], [role]")) {
    const role = el.getAttribute("role") || el.tagName.toLowerCase();
    if (!["nav", "main", "header", "footer", "aside", "form", "navigation", "banner", "contentinfo", "complementary", "search", "region"].includes(role))
      continue;
    /* Un <header> ou <footer> imbriqué dans une section n'est pas un
       repère : il ne compte pas. */
    if (["header", "footer"].includes(role) && el.closest("main, article, section, aside")) continue;
    /* Ni affiché, ni dans l'arbre d'accessibilité. */
    const b = el.getBoundingClientRect();
    if (b.width === 0 && b.height === 0) continue;
    if (el.closest("[aria-hidden=true]")) continue;
    const nom = el.getAttribute("aria-label")
      || document.getElementById(el.getAttribute("aria-labelledby") || "")?.textContent?.trim()
      || "";
    const cle = `${role}|${nom}`;
    parRole[cle] = (parRole[cle] || 0) + 1;
  }
  for (const [cle, n] of Object.entries(parRole)) {
    const [role, nom] = cle.split("|");
    if (n > 1) r.reperes.push(`${n} repères « ${role} » nommés « ${nom || "(sans nom)"} »`);
  }

  for (const el of document.querySelectorAll("[tabindex]")) {
    const t = Number(el.getAttribute("tabindex"));
    if (t > 0) r.reperes.push(`${ou(el)} — tabindex="${t}" force un ordre parallèle`);
  }

  /* Un rôle qui répète celui que la balise porte déjà est du bruit, et
     il masque les vraies intentions. */
  const IMPLICITE = {
    NAV: "navigation", MAIN: "main", ASIDE: "complementary", BUTTON: "button",
    UL: "list", OL: "list", LI: "listitem", FORM: "form", ARTICLE: "article",
  };
  for (const el of document.querySelectorAll("[role]")) {
    if (IMPLICITE[el.tagName] === el.getAttribute("role"))
      r.reperes.push(`${ou(el)} — role="${el.getAttribute("role")}" est déjà implicite`);
  }

  /* Un SVG décoratif doit être caché ; un SVG porteur de sens doit être
     nommé. Les deux à la fois, jamais. */
  for (const svg of document.querySelectorAll("svg")) {
    const cache = svg.getAttribute("aria-hidden") === "true";
    const nomme = svg.getAttribute("role") === "img" &&
      (svg.getAttribute("aria-label") || svg.querySelector("title"));
    if (cache && svg.getAttribute("role") === "img")
      r.reperes.push(`${ou(svg)} — à la fois role="img" et aria-hidden`);
    if (!cache && !nomme)
      r.vides.push(`${ou(svg)} — ni caché ni nommé`);
  }

  r.jsonld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent);
  return r;
};

/* ------------------------------------------------------------------ */

const plan = [...(await (await fetch(BASE + "/sitemap.xml")).text())
  .matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

/**
 * Les pages à examiner.
 *
 * Le plan du site est l'amorce naturelle — c'est la liste que le site
 * publie de lui-même. Mais tant que la démonstration n'est pas
 * indexable, ce plan est délibérément vide : un plan qui listerait des
 * pages en « noindex » serait démenti ligne à ligne.
 *
 * Sans repli, ce script examinait alors deux pages sur douze — et
 * concluait « aucun constat ». C'est le pire mode de défaillance d'un
 * vérificateur : ne rien trouver parce qu'on n'a rien regardé. Le repli
 * relève donc les liens internes réellement servis, ce qui redonne la
 * même couverture sans qu'aucune liste ne soit écrite à la main quelque
 * part — une liste écrite à la main finit toujours par oublier la page
 * ajoutée le mois dernier.
 */
async function pagesDuSite() {
  if (plan.length) return plan;

  const liensDe = async (chemin) => {
    await page.goto(BASE + chemin, { waitUntil: "networkidle" });
    return page.evaluate(
      (base) => [
        ...new Set(
          [...document.querySelectorAll("a[href]")]
            .map((a) => a.href)
            .filter((h) => h.startsWith(base))
            .map((h) => new URL(h).pathname),
        ),
      ],
      BASE,
    );
  };

  /* Deux passes, et pas une. L'accueil ne met en avant que quatre des
     six opérations : à une seule passe, deux pages de projet manquaient
     à l'appel sans que rien ne le signale. La seconde passe part de ce
     que la première a trouvé — dont la liste des projets, qui les porte
     toutes. */
  const vues = new Set(await liensDe("/"));
  for (const chemin of [...vues])
    for (const l of await liensDe(chemin)) vues.add(l);

  console.log(
    `  plan du site vide (démonstration non indexable) — ` +
      `${vues.size} pages relevées en suivant les liens`,
  );
  return [...vues];
}

const PAGES = [
  ...new Set([
    ...(await pagesDuSite()),
    "/mentions-legales",
    "/cette-adresse-nexiste-pas",
  ]),
];

const jsonldParPage = [];

for (const p of PAGES) {
  await page.goto(BASE + p, { waitUntil: "networkidle" });
  /* Tout révéler et tout déplier : ce qui est masqué n'a pas de boîte, et
     la moitié des mesures porterait sur des éléments à hauteur nulle. */
  await page.evaluate(() => {
    document.querySelectorAll("[data-observe]").forEach((e) => (e.dataset.vu = "oui"));
    document.querySelectorAll("details").forEach((d) => (d.open = true));
  });
  await page.waitForTimeout(120);
  const r = await page.evaluate(MESURER);

  for (const cle of ["imbrication", "renvois", "nom", "tabulation", "vides", "reperes"])
    r[cle].forEach((x) => constats[cle].push(`${p} — ${x}`));
  r.jsonld.forEach((j) => jsonldParPage.push({ p, j }));
}

await ctx.close();
await nav.close();

/* ------------------------------------------------------------------ */
/*  7. Les données structurées, en profondeur                          */
/* ------------------------------------------------------------------ */

/*
 * `audit.mjs` vérifie que le JSON-LD s'analyse et qu'il porte un type.
 * C'est le minimum. Ce qui casse vraiment un extrait enrichi, c'est un
 * `@id` qui ne résout nulle part, une propriété requise absente, ou une
 * date qui n'est pas au format ISO — trois choses qu'un JSON parfaitement
 * valide peut parfaitement contenir.
 */
const REQUIS = {
  Organization: ["name"],
  ProfessionalService: ["name", "address"],
  WebSite: ["name", "url"],
  WebPage: ["name"],
  BreadcrumbList: ["itemListElement"],
  ListItem: ["position", "name"],
  ItemList: ["itemListElement"],
  FAQPage: ["mainEntity"],
  Question: ["name", "acceptedAnswer"],
  Answer: ["text"],
  CreativeWork: ["name"],
  Service: ["name"],
  PostalAddress: ["addressLocality"],
};
const ISO = /^\d{4}(-\d{2}(-\d{2})?)?$/;

for (const { p, j } of jsonldParPage) {
  let doc;
  try {
    doc = JSON.parse(j);
  } catch (e) {
    constats.donnees.push(`${p} — JSON illisible : ${e.message.slice(0, 50)}`);
    continue;
  }

  const noeuds = doc["@graph"] ?? [doc];
  const definis = new Set(noeuds.map((n) => n["@id"]).filter(Boolean));
  const cites = new Set();

  const parcourir = (v, chemin) => {
    if (Array.isArray(v)) return v.forEach((x, i) => parcourir(x, `${chemin}[${i}]`));
    if (!v || typeof v !== "object") return;

    /* Une référence pure : un objet qui ne porte qu'un `@id`. */
    const cles = Object.keys(v);
    if (cles.length === 1 && cles[0] === "@id") cites.add(v["@id"]);

    const types = [v["@type"]].flat().filter(Boolean);
    for (const t of types) {
      const requis = REQUIS[t];
      if (!requis) continue;
      for (const prop of requis) {
        if (v[prop] === undefined || v[prop] === null || v[prop] === "")
          constats.donnees.push(`${p} — ${t} sans « ${prop} » (${chemin})`);
      }
    }

    for (const [k, x] of Object.entries(v)) {
      if (x === undefined || x === null)
        constats.donnees.push(`${p} — « ${k} » vaut ${x} (${chemin})`);
      if (/^(datePublished|dateModified|dateCreated|foundingDate|startDate|endDate)$/.test(k)
          && typeof x === "string" && !ISO.test(x))
        constats.donnees.push(`${p} — ${k} = « ${x} » n'est pas une date ISO 8601`);
      parcourir(x, `${chemin}.${k}`);
    }
  };
  noeuds.forEach((n, i) => parcourir(n, `@graph[${i}]`));

  for (const id of cites) {
    /* Un `@id` cité doit être défini dans le même graphe, ou pointer
       hors du site — sinon il ne résout nulle part. */
    if (!definis.has(id) && new URL(id, BASE).origin === new URL(BASE).origin)
      constats.donnees.push(`${p} — @id « ${id} » cité mais jamais défini`);
  }
}

/* ------------------------------------------------------------------ */

const bloc = (titre, a) => {
  console.log(`\n${titre}`);
  const u = [...new Set(a)];
  console.log(u.length ? u.slice(0, 12).map((x) => "  ✗ " + x).join("\n") : "  rien à signaler");
  if (u.length > 12) console.log(`  … et ${u.length - 12} autre(s)`);
};

console.log("SÉMANTIQUE DU DOCUMENT");
bloc("IMBRICATIONS INTERDITES", constats.imbrication);
bloc("RENVOIS ARIA MORTS", constats.renvois);
bloc("NOM ACCESSIBLE CONTRE TEXTE VISIBLE (2.5.3)", constats.nom);
bloc("ORDRE DE TABULATION", constats.tabulation);
bloc("COMMANDES ET TITRES VIDES", constats.vides);
bloc("REPÈRES, TABINDEX, RÔLES", constats.reperes);
bloc("DONNÉES STRUCTURÉES", constats.donnees);

const total = Object.values(constats).reduce((n, a) => n + new Set(a).size, 0);
console.log(
  `\n${PAGES.length} pages — ` + (total ? `${total} constat(s)` : "aucun constat"),
);
process.exit(total ? 1 : 0);
