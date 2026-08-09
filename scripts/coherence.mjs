/**
 * Le contrôle de cohérence des données.
 *
 * Un site d'architecture est une suite d'affirmations chiffrées, et la
 * seule chose qui le décrédibilise vraiment, c'est que deux d'entre
 * elles se contredisent : une fiche qui annonce quatorze mois de
 * chantier et une livraison qui n'en compte que treize, un concours daté
 * après le début des études du projet qu'il a désigné, une frise qui
 * revendique cinq personnes quand l'équipe n'en compte que trois à cette
 * date. Ces trois-là avaient été écrites, et aucune ne se voit à la
 * relecture — elles se voient au recoupement.
 *
 * Ce fichier fait le recoupement. Il lit les mêmes données que le site,
 * refait les calculs, et sort en erreur si la prose et les nombres ne
 * disent pas la même chose.
 *
 *     node --experimental-strip-types scripts/coherence.mjs
 *     npm run coherence
 */

import { CHIFFRES, CONCOURS, DISTINCTIONS, EQUIPE, FRISE, HONORAIRES, QUESTIONS } from "../src/lib/agence.ts";
import { PROJETS } from "../src/lib/projets.ts";

const MOIS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

/** Un mois nommé devient un rang absolu, pour pouvoir s'additionner. */
function rang(texte) {
  const m = texte.trim().toLowerCase().match(/([a-zà-ÿ]+)\s+(\d{4})/);
  if (!m) return null;
  const i = MOIS.indexOf(m[1]);
  return i === -1 ? null : Number(m[2]) * 12 + i;
}

function nomme(r) {
  return `${MOIS[r % 12]} ${Math.floor(r / 12)}`;
}

function valeur(projet, libelle) {
  return projet.fiche.find((l) => l.libelle === libelle)?.valeur ?? "";
}

const echecs = [];
const faux = (quoi, detail) => echecs.push(`${quoi}\n    ${detail}`);

/* ------------------------------------------------------------------ */
/*  1. Chaque livraison découle de la fin des études et de la durée    */
/* ------------------------------------------------------------------ */

const durees = [];

for (const p of PROJETS) {
  const etudes = valeur(p, "Études");
  const chantier = valeur(p, "Chantier");

  const fin = rang(etudes.split("–")[1] ?? "");
  const duree = Number(chantier.match(/(\d+)\s+mois/)?.[1]);
  const livre = rang(chantier.match(/livré en (.+)$/)?.[1] ?? "");
  if (fin === null || !duree || livre === null) {
    faux(`${p.nom} — fiche illisible`, `études « ${etudes} », chantier « ${chantier} »`);
    continue;
  }
  durees.push(duree);

  /* Le chantier ouvre le mois suivant la fin des études : la livraison
     tombe donc `duree` mois après cette fin. */
  const attendu = fin + duree;
  if (attendu !== livre) {
    faux(
      `${p.nom} — la livraison ne suit pas la durée annoncée`,
      `études finies ${nomme(fin)} + ${duree} mois = ${nomme(attendu)}, or la fiche dit ${nomme(livre)}`,
    );
  }

  /* L'année portée sur la carte et l'index doit être celle de la livraison. */
  const anneeLivraison = Math.floor(livre / 12);
  if (anneeLivraison !== p.annee) {
    faux(
      `${p.nom} — l'année du projet ne suit pas la livraison`,
      `annee: ${p.annee}, livraison ${nomme(livre)}`,
    );
  }

  /* Le coût au mètre carré doit rester dans la fourchette que la FAQ
     publie, sans quoi le site se contredit à une page d'écart. */
  /* Une surface peut être écrite en plusieurs morceaux — « 248 m²
     existants, 28 m² créés » : c'est leur somme qui porte les travaux. */
  const m2 = [...valeur(p, "Surface").matchAll(/([\d\s ]+)\s*m²/g)].reduce(
    (t, m) => t + Number(m[1].replace(/[\s ]/g, "")),
    0,
  );
  const euros = Number(valeur(p, "Travaux").replace(/\D/g, ""));
  if (m2 && euros) {
    const parM2 = Math.round(euros / m2);
    const neuf = p.nature === "Construction neuve" || p.nature === "Surélévation";
    const [bas, haut] = neuf ? [2400, 3200] : [1800, 2800];
    if (parM2 < bas || parM2 > haut) {
      faux(
        `${p.nom} — ${parM2} €/m² hors de la fourchette annoncée`,
        `${p.nature} : la FAQ publie ${bas} à ${haut} € HT/m²`,
      );
    }
  }
}

/* L'ordre du tableau est celui du site : il doit être chronologique. */
for (let i = 1; i < PROJETS.length; i++) {
  if (PROJETS[i].annee < PROJETS[i - 1].annee) {
    faux(
      "Les projets ne sont plus en ordre chronologique",
      `${PROJETS[i - 1].nom} (${PROJETS[i - 1].annee}) précède ${PROJETS[i].nom} (${PROJETS[i].annee})`,
    );
  }
}

/* ------------------------------------------------------------------ */
/*  2. Un concours précède les études du projet qu'il a désigné        */
/* ------------------------------------------------------------------ */

/* Le rapprochement se fait sur la commune citée dans la note ou dans le
   maître d'ouvrage — les intitulés de concours ne reprennent pas le nom
   du projet, et c'est voulu. */
const parCommune = new Map(
  PROJETS.map((p) => [p.commune.replace(/\s*\(\d+\)/, "").toLowerCase(), p]),
);

for (const c of CONCOURS) {
  if (!c.gagne) continue;
  const cible = [...parCommune].find(
    ([ville]) =>
      c.maitreOuvrage.toLowerCase().includes(ville) ||
      c.intitule.toLowerCase().includes(ville) ||
      c.programme.toLowerCase().includes(ville),
  )?.[1];
  if (!cible) continue;
  const debut = rang(valeur(cible, "Études").split("–")[0] ?? "");
  if (debut === null) continue;
  if (Number(c.annee) * 12 > debut) {
    faux(
      `Concours « ${c.intitule} » daté après le début des études`,
      `concours ${c.annee}, études de ${cible.nom} ouvertes en ${nomme(debut)}`,
    );
  }
}

/* ------------------------------------------------------------------ */
/*  3. Les listes datées descendent                                    */
/* ------------------------------------------------------------------ */

for (const [nom, liste] of [["DISTINCTIONS", DISTINCTIONS], ["CONCOURS", CONCOURS]]) {
  for (let i = 1; i < liste.length; i++) {
    if (Number(liste[i].annee) > Number(liste[i - 1].annee)) {
      faux(
        `${nom} n'est plus en ordre décroissant`,
        `${liste[i - 1].annee} précède ${liste[i].annee}`,
      );
    }
  }
}

/* Une distinction ne peut pas précéder la livraison de son projet. */
for (const d of DISTINCTIONS) {
  if (!d.projetSlug) continue;
  const p = PROJETS.find((x) => x.slug === d.projetSlug);
  if (p && Number(d.annee) < p.annee) {
    faux(
      `Distinction « ${d.intitule} » décernée avant la livraison`,
      `prix ${d.annee}, ${p.nom} livré en ${p.annee}`,
    );
  }
}

/* Ce qu'une fiche projet revendique comme distinction doit exister dans
   la liste des distinctions, à la même année. */
for (const p of PROJETS) {
  if (!p.distinction) continue;
  for (const annee of p.distinction.match(/\b20\d{2}\b/g) ?? []) {
    const connue = DISTINCTIONS.some(
      (d) => d.annee === annee && d.projetSlug === p.slug,
    );
    if (!connue) {
      faux(
        `${p.nom} — distinction ${annee} absente de la liste de la page agence`,
        p.distinction,
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/*  4. La frise et l'effectif réel                                     */
/* ------------------------------------------------------------------ */

for (const e of FRISE) {
  const attendu = e.repere?.match(/^(\d+)\s+personnes?$/)?.[1];
  if (!attendu) continue;
  const reel = EQUIPE.filter((m) => m.depuis <= Number(e.annee)).length;
  if (Number(attendu) !== reel) {
    faux(
      `Frise ${e.annee} — l'effectif annoncé ne correspond pas à l'équipe`,
      `la frise dit ${attendu} personnes, ${reel} membres ont rejoint l'agence au plus tard en ${e.annee}`,
    );
  }
}

/* ------------------------------------------------------------------ */
/*  5. Les nombres écrits en toutes lettres dans la prose              */
/* ------------------------------------------------------------------ */

const attendus = [
  ["personnes dans l'équipe", EQUIPE.length, 9],
  ["distinctions", DISTINCTIONS.length, 5],
  ["concours", CONCOURS.length, 5],
  ["concours remportés", CONCOURS.filter((c) => c.gagne).length, 3],
  ["projets publiés", PROJETS.length, 6],
  ["chiffres clés", CHIFFRES.length, 4],
];
for (const [quoi, reel, dit] of attendus) {
  if (reel !== dit) {
    faux(
      `Le nombre de ${quoi} a changé`,
      `${reel} en base, ${dit} annoncés dans les pages — relire agence/page.tsx et README`,
    );
  }
}

/* La FAQ publie la fourchette des durées de chantier : elle doit être
   celle des six fiches. */
/* Toutes les espaces sont écrites `\s` : depuis le passage à la
   typographie française, celles qui séparent un nombre de son unité
   sont insécables, et une espace littérale ne les reconnaît plus. */
const faq = QUESTIONS.find((q) => q.question.includes("Combien de temps"));
const fourchette = faq?.reponse.match(/(\d+)\s+à\s+(\d+)\s+mois de chantier/);
if (fourchette) {
  const [, bas, haut] = fourchette.map(Number);
  const min = Math.min(...durees);
  const max = Math.max(...durees);
  if (bas !== min || haut !== max) {
    faux(
      "La FAQ annonce une fourchette de chantier qui n'est pas celle des fiches",
      `la FAQ dit ${bas} à ${haut} mois, les fiches vont de ${min} à ${max}`,
    );
  }
} else {
  faux("Fourchette de durée de chantier introuvable dans la FAQ", "le libellé a changé");
}

/* Le total revendiqué doit être la somme de ses parts. */
const bilan = FRISE.at(-1)?.texte ?? "";
const parts = { "Vingt-sept": 27, neuf: 9, cinq: 5 };
const somme = Object.entries(parts)
  .filter(([mot]) => bilan.includes(mot))
  .reduce((t, [, n]) => t + n, 0);
if (somme !== 41) {
  faux(
    "Le bilan de la frise ne totalise pas 41 bâtiments",
    `27 + 9 + 5 = ${somme} d'après le texte de l'étape ${FRISE.at(-1)?.annee}`,
  );
}

/* La grille d'honoraires et la FAQ annoncent les mêmes pourcentages, ou
   l'une des deux ment. C'est le chiffre qu'on vient chercher en premier
   sur ce genre de site : il est publié à deux endroits, et rien jusqu'ici
   ne vérifiait qu'ils disent la même chose. */
{
  const taux = (t) => [...t.matchAll(/(\d+)\s*%/g)].map((m) => Number(m[1]));
  const grille = new Set(HONORAIRES.flatMap((h) => taux(h.montant + " " + h.note)));
  const prix = QUESTIONS.find((q) => q.question.includes("Combien coûte"));

  /* Deux sources, et non une seule. La question « combien coûte » porte
     la grille complète, mais un taux peut être annoncé n'importe où
     ailleurs — c'est arrivé : une réponse sur la mission partielle
     promettait 5 % que la grille ne publiait pas, et un contrôle limité
     à la question principale ne l'a pas vu. On relit donc aussi, dans
     toutes les réponses, tout pourcentage explicitement rapporté au
     montant des travaux. Les autres — l'écart de chantier, la précision
     d'un chiffrage — n'ont rien à faire dans la grille. */
  const surTravaux = /(\d+)\s*%(?:\s+du montant)?\s+des travaux/gi;
  const dits = new Set([
    ...taux(prix?.reponse ?? ""),
    ...QUESTIONS.flatMap((q) => [...q.reponse.matchAll(surTravaux)].map((m) => Number(m[1]))),
  ]);
  for (const t of dits) {
    if (!grille.has(t))
      faux(
        `La FAQ annonce ${t} % que la grille d'honoraires ne publie pas`,
        `grille : ${[...grille].sort((a, b) => a - b).join(", ")} %`,
      );
  }
  /* Le montant fixe de l'étude de faisabilité, lui aussi cité deux fois. */
  const fixe = HONORAIRES.find((h) => /faisabilit/i.test(h.intitule))?.montant ?? "";
  const chiffres = (t) => (t.match(/[\d\u202f\u00a0 ]{3,}€/g) ?? []).map((x) => x.replace(/\D/g, ""));
  const [attendu] = chiffres(fixe);
  if (attendu && !chiffres(prix?.reponse ?? "").includes(attendu))
    faux(
      "L'étude de faisabilité n'est pas facturée le même prix dans la FAQ et dans la grille",
      `la grille dit ${fixe}`,
    );
}

/* Les images engendrées — le favicon et la carte de partage — ne
   traversent jamais l'audit du rendu : ce sont des images, pas du HTML.
   Elles peuvent donc garder la palette du site dont elles ont été
   copiées sans que rien ne le dise, et c'est arrivé : un site violet a
   servi pendant une journée un favicon marron et une carte de partage
   annonçant « le dégradé chaud » qu'il n'avait plus. On vérifie donc
   que toute couleur écrite dans ces fichiers est déclarée dans la
   feuille de style. */
{
  const { readFileSync, existsSync } = await import("node:fs");
  const hex = (t) => [...t.matchAll(/#[0-9a-fA-F]{6}\b/g)].map((m) => m[0].toLowerCase());
  const feuille = new Set(hex(readFileSync("src/app/globals.css", "utf8")));

  for (const fichier of ["src/app/icon.svg", "src/app/apple-icon.tsx", "src/app/opengraph-image.tsx"]) {
    if (!existsSync(fichier)) continue;
    const contenu = readFileSync(fichier, "utf8");
    /* Un fichier peut déclarer ses propres exceptions, à condition de
       dire lesquelles et pourquoi : les arrêts intermédiaires d'un
       dégradé n'existent que dans l'image, et n'ont rien à faire dans la
       feuille de style du site. Tout le reste doit en venir. */
    const tolerees = new Set(
      (contenu.match(/palette-hors-feuille\s*:([^*\n]+)/) ?? ["", ""])[1]
        .match(/#[0-9a-fA-F]{6}/g) ?? [],
    );
    for (const c of new Set(hex(contenu))) {
      if (!feuille.has(c) && !tolerees.has(c))
        faux(
          `${fichier} emploie ${c}, qui n'est pas une couleur du site`,
          `la feuille de style déclare ${[...feuille].sort().join(", ")}`,
        );
    }
  }
}

/* Le recensement de l'équipe est publié deux fois — dans la dernière
   étape de la frise qui la dénombre, et dans le texte de la page agence.
   On vérifie ici celui de la frise contre la composition réelle. Une
   agence qui se décrit « quatre architectes et une économiste » alors
   qu'elle en compte trois se disqualifie en une ligne, et c'est
   exactement le genre de phrase qu'on n'a plus relue depuis qu'elle a
   été écrite. */
{
  const etape = FRISE.find((e) => /taille définitive/i.test(e.titre));
  if (!etape) {
    faux("Étape du recensement de l'équipe introuvable dans la frise", "le titre a changé");
  } else {
    const MOTS = { un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9 };
    const compte = (mot) => MOTS[mot.toLowerCase()] ?? Number(mot);
    const familles = [
      [/(\w+) architectes/i, (m) => /^Architecte/i.test(m.role)],
      [/(\w+) économiste/i, (m) => /économiste/i.test(m.role)],
      [/(\w+) (?:poste|postes) de dessin/i, (m) => /dessin/i.test(m.role)],
      [/(\w+) à l’administration/i, (m) => /marchés|comptabilité|accueil/i.test(m.role)],
    ];
    for (const [motif, appartient] of familles) {
      const dit = etape.texte.match(motif);
      if (!dit) continue;
      const annonce = compte(dit[1]);
      const reel = EQUIPE.filter(appartient).length;
      if (annonce !== reel)
        faux(
          `La frise annonce « ${dit[0]} » et l'équipe en compte ${reel}`,
          `étape ${etape.annee}`,
        );
    }
  }
}

/* ------------------------------------------------------------------ */

if (echecs.length) {
  console.error(`\n  ${echecs.length} incohérence(s) :\n`);
  for (const e of echecs) console.error("  ✗ " + e + "\n");
  process.exit(1);
}
console.log(
  `  ✓ cohérence vérifiée — ${PROJETS.length} projets, ${EQUIPE.length} personnes, ` +
    `${DISTINCTIONS.length} prix, ${CONCOURS.length} concours, ${QUESTIONS.length} questions`,
);
