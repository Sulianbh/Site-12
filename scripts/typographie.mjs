/**
 * La typographie française, appliquée aux sources.
 *
 * Le français impose une espace avant les ponctuations doubles, et cette
 * espace doit être insécable : sans elle, un « : » ou un « ? » se
 * retrouve seul en début de ligne dès que la colonne se resserre — ce
 * qui arrive sur téléphone à peu près partout. De même, une apostrophe
 * droite (') est un signe de machine à écrire ; le français écrit ’.
 *
 * Le sous-ensemble « latin » des trois polices chargées couvre
 * U+2000-206F : l'espace fine insécable (U+202F) et l'apostrophe
 * typographique (U+2019) sont donc dessinées dans les fichiers servis,
 * et non remplacées par un caractère de secours.
 *
 * ─── Pourquoi ce script est aussi prudent ───────────────────────────
 *
 * Une première version appliquait les règles à toute chaîne entre
 * guillemets. Elle a produit exactement deux dégâts, tous deux
 * invisibles à la relecture et graves :
 *
 *   className="mt-0.5 h-6 w-6"  →  le « h » de « h-6 » a été pris pour
 *   l'unité heure, une insécable s'est glissée après le 5, et comme le
 *   navigateur ne sépare les classes que sur les espaces ASCII, deux
 *   classes ont fusionné en une seule, inexistante.
 *
 *   d="M3 9 h8 l3 5 -4 5"  →  même cause ; or l'insécable n'est pas une
 *   espace valide dans la grammaire des chemins SVG, et le dessin cesse
 *   d'être analysable.
 *
 * D'où la règle tenue ici : on ne corrige QUE de la prose, jamais du
 * code. Concrètement — toutes les chaînes des fichiers de données (qui
 * n'en contiennent pas d'autre), le texte JSX entre deux balises, les
 * commentaires, et une liste fermée d'attributs qui portent de la prose.
 *
 *     node scripts/typographie.mjs           vérifie et liste
 *     node scripts/typographie.mjs --ecrire  applique
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const INSEC = " "; // espace insécable
const FINE = " "; // espace fine insécable
const APOS = "’"; // apostrophe typographique

/** Les seuls attributs dont la valeur est lue par un humain. */
const ATTRIBUTS_PROSE =
  /\b(aria-label|aria-description|alt|placeholder|title|titre|libelle|description|texte|resume|accroche|legende)=\{?"((?:[^"\\]|\\.)*)"/g;

/**
 * Les métadonnées s'écrivent en propriétés d'objet, pas en attributs :
 * `description: "…"`. Elles finissent pourtant dans un onglet de
 * navigateur et dans une page de résultats, donc sous les yeux de
 * quelqu'un. La liste reste fermée pour ne jamais toucher à `type:`,
 * `name:` ou `href:`.
 */
const PROPRIETES_PROSE =
  /\b(description|default|template|titre)\s*:\s*\n?\s*"((?:[^"\\]|\\.)*)"/g;

/** Applique les règles à un fragment de prose française. */
export function corriger(t) {
  return (
    t
      // l'apostrophe de machine à écrire
      .replace(/([\p{L}])'([\p{L}])/gu, `$1${APOS}$2`)
      // deux-points : espace insécable pleine
      .replace(/ +:(?= |$)/g, `${INSEC}:`)
      // point-virgule, exclamation, interrogation : espace fine
      .replace(/ +([;!?])/g, `${FINE}$1`)
      // guillemets français : ils enferment leur texte sans le lâcher
      .replace(/«[  ]+/g, `«${INSEC}`)
      .replace(/[  ]+»/g, `${INSEC}»`)
      // pourcentage et unités : le nombre ne se sépare pas de sa mesure
      .replace(/(\d) +%/g, `$1${FINE}%`)
      .replace(/(\d) +(€|km|m²|h|mois|ans?)(?![\p{L}\d-])/gu, `$1${INSEC}$2`)
      // séparateur de milliers : 2 240 000 reste d'un seul tenant
      .replace(/(\d) (?=\d{3}(?!\d))/g, `$1${FINE}`)
  );
}

/* ------------------------------------------------------------------ */

const estProse = (s) => /[\p{L}]{2}/u.test(s);

/** Fichiers de données : toute chaîne y est de la prose. */
function toutesLesChaines(source) {
  return source.replace(/"((?:[^"\\\n]|\\.)*)"/g, (tout, contenu) =>
    estProse(contenu) ? `"${corriger(contenu)}"` : tout,
  );
}

/** Texte JSX : ce qui se trouve entre deux balises, sans accolade. */
function texteJsx(source) {
  return source
    .replace(/&rsquo;/g, APOS)
    .replace(/>([^<>{}]+)</g, (tout, texte) =>
      estProse(texte) ? `>${corriger(texte)}<` : tout,
    );
}

/** Attributs et propriétés de prose, et eux seuls. */
function attributsProse(source) {
  const remplacer = (tout, _nom, valeur) =>
    estProse(valeur) ? tout.replace(`"${valeur}"`, `"${corriger(valeur)}"`) : tout;
  return source
    .replace(ATTRIBUTS_PROSE, remplacer)
    .replace(PROPRIETES_PROSE, remplacer);
}

/** Commentaires : la source se lit comme le site. */
function commentaires(source) {
  return source.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, (bloc) =>
    bloc.replace(/([\p{L}])'([\p{L}])/gu, `$1${APOS}$2`),
  );
}

function fichiers(racine, sortie = []) {
  for (const nom of readdirSync(racine)) {
    const chemin = join(racine, nom);
    if (statSync(chemin).isDirectory()) fichiers(chemin, sortie);
    else if (/\.tsx?$/.test(nom)) sortie.push(chemin);
  }
  return sortie;
}

/* ------------------------------------------------------------------ */
/*  Garde-fou : rien de tout cela ne doit atteindre du code            */
/* ------------------------------------------------------------------ */

const INTERDIT = [
  [/className="[^"]*[  ]/, "une insécable dans un className"],
  [/\sd="[^"]*[  ]/, "une insécable dans un chemin SVG"],
  [/\b(href|id|key|viewBox|slug|name|type|htmlFor|aria-controls|aria-labelledby)="[^"]*[  ]/,
   "une insécable dans un attribut technique"],
];

function verifierGarde(chemin, source) {
  for (const [motif, quoi] of INTERDIT) {
    const m = source.match(motif);
    if (m) {
      console.error(`\n  ✗ ${chemin} : ${quoi}\n    ${m[0].slice(0, 90)}`);
      process.exit(1);
    }
  }
}

/* ------------------------------------------------------------------ */

const ecrire = process.argv.includes("--ecrire");
const touches = [];

for (const chemin of fichiers("src")) {
  const avant = readFileSync(chemin, "utf8");

  /* Les fichiers de données ne contiennent ni classe ni chemin SVG :
     on peut y traiter toutes les chaînes. Partout ailleurs, seulement
     le texte JSX et une liste fermée d'attributs. */
  const donnees = chemin.startsWith(join("src", "lib"));
  let apres = commentaires(avant);
  apres = donnees ? toutesLesChaines(apres) : attributsProse(apres);
  if (chemin.endsWith(".tsx")) apres = texteJsx(apres);

  verifierGarde(chemin, apres);
  if (apres === avant) continue;

  touches.push(chemin);
  if (ecrire) writeFileSync(chemin, apres);
}

if (!touches.length) {
  console.log("  ✓ typographie française conforme");
} else if (ecrire) {
  console.log(`  ${touches.length} fichier(s) corrigé(s) :`);
  for (const t of touches) console.log("    " + t);
} else {
  console.error(`  ${touches.length} fichier(s) à corriger :`);
  for (const t of touches) console.error("    " + t);
  console.error("\n  relancer avec --ecrire");
  process.exit(1);
}
