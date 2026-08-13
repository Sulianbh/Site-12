/**
 * Ce que GitHub va réellement servir.
 *
 * L’intégration continue construit deux fois. Le premier job construit
 * sans `EXPORT_STATIQUE` ni préfixe, sert avec `next start`, et c’est sur
 * ce site-là que tournent les cinq scripts de rendu — l’audit, la
 * sémantique, les liens, le clavier, la robustesse. Le second reconstruit
 * avec le préfixe et l’export statique, et c’est ce second artefact, que
 * personne ne relit, qui part chez GitHub.
 *
 * Entre les deux il y a un interstice, et l’aperçu de partage de ce site
 * y a vécu. `metadataBase` valait déjà `…/Site-12`, et l’adresse de la
 * carte était préfixée une seconde fois à la main : le HTML publié
 * annonçait `…/Site-12/Site-12/partage.png`. Le fichier existait, servi
 * avec le bon type, et l’aperçu tombait quand même. Rien ne pouvait le
 * voir : la construction ordinaire n’a pas de préfixe, donc pas de
 * préfixe à doubler, et le défaut n’est apparu qu’en collant l’adresse du
 * site en ligne dans une messagerie.
 *
 * Ce script relit donc `out/`, le dossier réellement publié, et rien
 * d’autre. Pas de dépendance, pas de navigateur, pas de réseau : il
 * ouvre des fichiers et compare des chaînes, ce qui suffit à voir un
 * préfixe doublé, un préfixe oublié, et une ressource désignée que la
 * construction n’a pas écrite.
 *
 * Une chose à savoir avant de lire la résolution des chemins : l’export
 * écrit `agence.html`, et non `agence/index.html`. Le dossier `agence/`
 * existe bel et bien à côté, mais il ne porte que les charges utiles
 * RSC ; le prendre pour la page ferait passer pour présente une page
 * absente.
 *
 *     npm run export
 *     NEXT_PUBLIC_BASE_PATH=/Site-12 node scripts/export.mjs
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const RACINE = "out";

/* Les deux variables que l’intégration continue pose sur la
   construction. Elles restent facultatives ici : sans elles le script
   tourne encore et le dit — il ne peut simplement plus rien affirmer sur
   le préfixe. */
const BASE = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "");
const ORIGINE = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");

const constats = [];
const faux = (quoi, detail) => constats.push(`${quoi}\n    ${detail}`);

/* ------------------------------------------------------------------ */
/*  Lire les pages                                                     */
/* ------------------------------------------------------------------ */

function pages(racine, sortie = []) {
  for (const nom of readdirSync(racine)) {
    const chemin = join(racine, nom);
    if (statSync(chemin).isDirectory()) pages(chemin, sortie);
    else if (nom.endsWith(".html")) sortie.push(chemin);
  }
  return sortie;
}

/*
 * Le contenu des `<script>` est retiré avant l’analyse. Next y inscrit la
 * charge utile RSC de la page, qui reprend les mêmes chemins sous forme
 * de chaînes JSON échappées : on les relèverait deux fois, et coupés par
 * l’échappement. La balise ouvrante reste, elle, avec son `src`.
 */
const sansScripts = (html) =>
  html.replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi, "$1</script>");

const ATTRIBUTS = /\b(src|srcset|href|content)\s*=\s*"([^"]*)"/gi;

const desechapper = (t) =>
  t
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

/*
 * `content` porte indifféremment une adresse, un nombre, une langue ou
 * une couleur : `content="1200"`, `content="fr_FR"`, `content="#241d17"`.
 * On n’en retient que ce qui a la forme d’une adresse, sans quoi le
 * contrôle d’existence irait chercher un fichier nommé « 630 ».
 */
const formeDAdresse = (v) => /^(\/|https?:)/i.test(v);

/** Un `srcset` est une liste : chaque candidat porte une adresse et un calibre. */
function adressesDe(nom, valeur) {
  const brutes =
    nom === "srcset"
      ? valeur.split(",").map((c) => c.trim().split(/\s+/)[0])
      : [valeur.trim()];
  return brutes
    .filter(Boolean)
    .filter((v) => (nom === "content" ? formeDAdresse(v) : true));
}

/* ------------------------------------------------------------------ */
/*  Classer une adresse                                                */
/* ------------------------------------------------------------------ */

const origineDuSite = ORIGINE ? new URL(ORIGINE).origin : null;

const sansQueue = (c) => c.split(/[?#]/)[0];

const decoder = (c) => {
  try {
    return decodeURIComponent(c);
  } catch {
    return c;
  }
};

/*
 * Ce qu’on ne suit pas, et pourquoi : une adresse sortante ne nous
 * regarde pas, `mailto:` et `tel:` ne désignent aucun fichier, `data:`
 * porte sa ressource avec elle, et une ancre seule reste dans la page
 * courante. Tout le reste est du même site et doit exister dans `out/`.
 *
 * Une adresse absolue n’est reconnue comme interne que si
 * `NEXT_PUBLIC_SITE_URL` a été posée : sans elle, on ne sait pas quelle
 * origine est la nôtre, et il vaut mieux ne rien affirmer que se
 * tromper de site.
 */
function classer(adresse) {
  if (!adresse) return { sorte: "vide" };
  if (/^(mailto:|tel:|data:|javascript:)/i.test(adresse)) return { sorte: "hors-site" };
  if (adresse.startsWith("#")) return { sorte: "ancre" };
  if (adresse.startsWith("//")) return { sorte: "sortante" };
  if (/^https?:\/\//i.test(adresse)) {
    if (!origineDuSite) return { sorte: "sortante" };
    let u;
    try {
      u = new URL(adresse);
    } catch {
      return { sorte: "sortante" };
    }
    if (u.origin !== origineDuSite) return { sorte: "sortante" };
    return { sorte: "interne", chemin: decoder(u.pathname) };
  }
  if (adresse.startsWith("/")) return { sorte: "interne", chemin: decoder(sansQueue(adresse)) };
  return { sorte: "relative", chemin: decoder(sansQueue(adresse)) };
}

/* ------------------------------------------------------------------ */
/*  Résoudre un chemin interne dans `out/`                             */
/* ------------------------------------------------------------------ */

const estUnFichier = (chemin) => {
  try {
    return statSync(chemin).isFile();
  } catch {
    return false;
  }
};

/*
 * Trois formes pour un même chemin, et il faut les essayer toutes :
 * `/partage.png` est un fichier tel quel, `/agence` est écrit
 * `agence.html`, et une page d’index vivrait dans `.../index.html`.
 * Le `isFile()` n’est pas une précaution de style : `out/agence` existe
 * comme *dossier* — il porte les charges utiles RSC — et un simple
 * `existsSync` déclarerait la page présente sans que le moindre HTML ait
 * été écrit.
 */
function resoudre(cheminInterne) {
  const relatif = cheminInterne.replace(/^\/+/, "").replace(/\/+$/, "");
  const essais =
    relatif === ""
      ? ["index.html"]
      : [relatif, `${relatif}.html`, `${relatif}/index.html`];
  return essais.find((e) => estUnFichier(join(RACINE, e))) ?? null;
}

/* ------------------------------------------------------------------ */
/*  Relever                                                            */
/* ------------------------------------------------------------------ */

if (!existsSync(RACINE)) {
  console.error(
    `\n  ✗ pas de dossier « ${RACINE} » à relire.` +
      "\n    Construire d’abord avec EXPORT_STATIQUE=oui, puis relancer.\n",
  );
  process.exit(1);
}

const fichiers = pages(RACINE);
const vues = new Map();
const compte = { interne: 0, sortante: 0, ancre: 0, "hors-site": 0, relative: 0 };

for (const fichier of fichiers) {
  const html = sansScripts(readFileSync(fichier, "utf8"));
  for (const [, nom, valeur] of html.matchAll(ATTRIBUTS)) {
    for (const brute of adressesDe(nom.toLowerCase(), desechapper(valeur))) {
      const classe = classer(brute);
      if (classe.sorte === "vide") continue;
      compte[classe.sorte] += 1;
      if (classe.sorte !== "interne" && classe.sorte !== "relative") continue;
      if (!vues.has(brute)) vues.set(brute, { classe, ou: new Set() });
      vues.get(brute).ou.add(fichier.slice(RACINE.length + 1));
    }
  }
}

/* Où l’adresse a été relevée. Trois pages suffisent à situer le défaut ;
   au-delà, c’est le gabarit qui est en cause et non une page. */
const situer = (ou) => {
  const liste = [...ou].sort();
  return liste.length > 3
    ? `${liste.slice(0, 3).join(", ")} et ${liste.length - 3} autre(s)`
    : liste.join(", ");
};

const DOUBLE = BASE ? BASE + BASE : "";
let verifiees = 0;
let absentes = 0;

for (const [adresse, { classe, ou }] of vues) {
  if (classe.sorte === "relative") {
    /* L’export n’en engendre aucune aujourd’hui. Le jour où il en paraît
       une, on veut le savoir : une adresse relative se résout contre le
       chemin de la page, et `agence.html` servi en `/agence` ne donne pas
       la même base que `/agence/`. */
    faux(
      "Adresse relative, dont la résolution dépend de la page qui la porte",
      `« ${adresse} » — ${situer(ou)}`,
    );
    continue;
  }

  const chemin = classe.chemin;

  /* 1. Le préfixe doublé — la raison d’être de ce fichier. */
  if (DOUBLE && (chemin === DOUBLE || chemin.startsWith(`${DOUBLE}/`))) {
    faux("Préfixe doublé", `« ${adresse} » porte deux fois ${BASE} — ${situer(ou)}`);
    continue;
  }

  /* 2. Le préfixe oublié. Le site vit sous le nom du dépôt et non à la
        racine du domaine : une adresse racine-relative qui ne le porte
        pas sort du site, et personne ne s’en aperçoit avant la mise en
        ligne. */
  if (BASE && !(chemin === BASE || chemin.startsWith(`${BASE}/`))) {
    faux(
      "Préfixe absent",
      `« ${adresse} » vise la racine du domaine et non ${BASE} — ${situer(ou)}`,
    );
    continue;
  }

  /* 3. La ressource désignée doit avoir été écrite. */
  const interne = BASE && chemin.startsWith(BASE) ? chemin.slice(BASE.length) : chemin;
  verifiees += 1;
  if (!resoudre(interne)) {
    absentes += 1;
    faux(
      `Ressource absente de ${RACINE}/`,
      `« ${adresse} » ne correspond à aucun fichier — ${situer(ou)}`,
    );
  }
}

/*
 * Lancé sans `NEXT_PUBLIC_BASE_PATH` sur un export qui, lui, a été
 * construit avec un préfixe, le contrôle d’existence échoue sur presque
 * tout : ce n’est pas un site cassé, c’est une variable oubliée à
 * l’appel. On le dit une fois, plutôt que cent trente fois.
 */
if (!BASE && verifiees && absentes > verifiees / 2) {
  constats.length = 0;
  faux(
    "L’export porte un préfixe que l’appel ne déclare pas",
    `${absentes} adresses sur ${verifiees} ne se résolvent pas dans ${RACINE}/ —` +
      " relancer avec NEXT_PUBLIC_BASE_PATH",
  );
}

/* ------------------------------------------------------------------ */

console.log("\nEXPORT");
console.log(`  préfixe   ${BASE || "aucun — NEXT_PUBLIC_BASE_PATH n’est pas posée"}`);
console.log(`  origine   ${ORIGINE || "aucune — NEXT_PUBLIC_SITE_URL n’est pas posée"}`);
console.log(
  `  ${fichiers.length} page(s) HTML relue(s), ${vues.size} adresse(s) du site distincte(s), ` +
    `${verifiees} ressource(s) cherchée(s) dans ${RACINE}/`,
);
console.log(
  `  ${compte.interne} adresse(s) du site · ${compte.sortante} sortante(s) · ` +
    `${compte.ancre} ancre(s) · ${compte["hors-site"]} mailto/tel/data`,
);

if (constats.length) {
  /* Au-delà d’une vingtaine, la liste ne se lit plus ; et une liste qu’on
     ne lit pas est une vérification qui ne sert à rien. */
  console.error(`\n  ${constats.length} constat(s) :\n`);
  for (const c of constats.slice(0, 20)) console.error("  ✗ " + c + "\n");
  if (constats.length > 20) console.error(`  … et ${constats.length - 20} autre(s)\n`);
  process.exit(1);
}

console.log(
  BASE
    ? `  ✓ aucun ${BASE} doublé, aucun oublié, aucune ressource manquante`
    : "  ✓ toutes les ressources désignées existent" +
        "\n    (faute de NEXT_PUBLIC_BASE_PATH, le contrôle du préfixe est resté inerte)",
);
