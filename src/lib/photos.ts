/**
 * Les photographies des six opérations.
 *
 * Ce fichier est délibérément séparé de `projets.ts`. Celui-là porte le
 * contenu partagé, mot pour mot identique à celui des trois autres
 * sites de la démonstration — le modifier ferait diverger quatre
 * fichiers qui doivent rester comparables. Les photographies n’existent
 * que sur ce site-ci : elles vivent donc ici, et `projets.ts` n’a pas
 * bougé d’un octet.
 *
 * Chaque fichier est décliné en deux largeurs par `magick` :
 *
 *   NN.webp     1600 px — la vue en grand, sur la page d’un projet
 *   NN-s.webp    900 px — écrans à forte densité, et cadres intermédiaires
 *   NN-xs.webp   500 px — les vignettes des cartes et de la liste
 *
 * La troisième largeur n’était pas là au départ, et son absence coûtait
 * cher : les cartes de l’accueil s’affichent sur 470 px, mais le plus
 * petit candidat du `srcSet` faisait 900 px, alors le navigateur le
 * prenait faute de mieux — deux fois trop de pixels, quatre fois sur une
 * page. La page d’accueil pesait 711 ko pour un seuil de 600.
 *
 * WebP à qualité 72 : le lot complet pèse 5,4 Mo, mais une page n’en
 * charge jamais plus de quelques-unes, et tout ce qui n’est pas la
 * première image est en chargement différé.
 *
 * L’ordre du tableau EST l’ordre d’affichage, et la première photo est
 * la couverture — celle qui représente le projet sur les cartes et dans
 * la liste. Elle a été choisie une par une, et c’est presque toujours
 * l’ouvrage fini plutôt que l’existant : une carte doit montrer ce que
 * l’agence a fait, pas ce qu’elle a trouvé.
 *
 * Le texte de remplacement décrit ce qu’on voit, pas ce que c’est. Un
 * lecteur d’écran qui annonce « photographie du projet » n’apprend rien
 * à personne ; « la halle réhabilitée, sa verrière et ses longues
 * tables » se visualise.
 */

export interface Photo {
  /** Le nom du fichier, sans extension ni suffixe de largeur. */
  fichier: string;
  /** Les dimensions réelles du fichier de 1600 px, en pixels. */
  largeur: number;
  hauteur: number;
  /** Ce qu’on voit. Sert de texte de remplacement. */
  texte: string;
}

/* Non exporté : deux accesseurs suffisent au reste du site, et laisser
   la table nue à disposition invite à la parcourir ailleurs qu’ici —
   c’est ainsi qu’une seconde façon de lire les mêmes données finit par
   diverger de la première. */
const PHOTOS: Record<string, Photo[]> = {
  "ateliers-de-la-fonderie-montreuil": [
    {
      fichier: "05",
      largeur: 1448,
      hauteur: 1086,
      texte:
        "La halle réhabilitée sous sa verrière : longues tables, bibliothèque contre le mur de brique, cuisine commune au fond",
    },
    {
      fichier: "06",
      largeur: 1448,
      hauteur: 1086,
      texte:
        "Un atelier de la halle : lit bas, mur de brique conservé, fenêtre d’atelier à petits carreaux",
    },
    {
      fichier: "01",
      largeur: 900,
      hauteur: 1600,
      texte:
        "La charpente d’acier riveté avant travaux, rouillée et ouverte au ciel, la cheminée de brique en fond",
    },
    {
      fichier: "03",
      largeur: 900,
      hauteur: 1600,
      texte:
        "La halle et sa cheminée vues du terrain en friche, avant l’opération",
    },
    {
      fichier: "02",
      largeur: 900,
      hauteur: 1600,
      texte:
        "Les arches de la charpente vues du sol, la végétation ayant repris le terre-plein",
    },
    {
      fichier: "04",
      largeur: 900,
      hauteur: 1600,
      texte: "Les sheds vus de dessous, le ciel au travers des pannes nues",
    },
  ],

  "maison-a-cour-montreuil": [
    {
      fichier: "01",
      largeur: 771,
      hauteur: 1143,
      texte:
        "La maison vue depuis la cour : brique, couverture de zinc, grande baie vitrée au rez-de-chaussée",
    },
    {
      fichier: "03",
      largeur: 843,
      hauteur: 1199,
      texte:
        "La façade sur rue, brique rouge d’origine et surélévation de zinc",
    },
    {
      fichier: "02",
      largeur: 864,
      hauteur: 1148,
      texte:
        "Le séjour ouvert sur la cour par une baie toute hauteur, bibliothèque à gauche",
    },
    {
      fichier: "04",
      largeur: 1448,
      hauteur: 1086,
      texte:
        "Le séjour depuis l’angle, la baie ouverte, la cour et la seconde aile au-delà",
    },
    {
      fichier: "05",
      largeur: 1448,
      hauteur: 1086,
      texte:
        "Une chambre à l’étage, fenêtre à deux vantaux donnant sur la cour",
    },
  ],

  "brasserie-du-canal-pantin": [
    {
      fichier: "03",
      largeur: 1448,
      hauteur: 1086,
      texte:
        "La façade ouverte sur la rue : le rideau relevé laisse voir les cuves de brassage depuis le trottoir",
    },
    {
      fichier: "01",
      largeur: 1448,
      hauteur: 1086,
      texte:
        "La salle de brassage et ses cuves d’inox, la salle de dégustation en mezzanine derrière une vitre",
    },
    {
      fichier: "04",
      largeur: 1536,
      hauteur: 1024,
      texte:
        "Le couloir : les cuves à gauche derrière la vitre, la salle de dégustation à droite en contrebas",
    },
    {
      fichier: "02",
      largeur: 1448,
      hauteur: 1086,
      texte:
        "La façade fermée, rideau métallique baissé, lierre sur le mur de béton",
    },
  ],

  "maison-de-maitre-nogent": [
    {
      fichier: "01",
      largeur: 843,
      hauteur: 1181,
      texte:
        "La maison depuis le chemin : façade enduite claire, volets bleus, toiture d’ardoise à deux souches de cheminée",
    },
    {
      fichier: "03",
      largeur: 1066,
      hauteur: 1600,
      texte:
        "Le chemin bordé d’un muret de pierre sèche, la maison au bout sous les arbres",
    },
    {
      fichier: "02",
      largeur: 1066,
      hauteur: 1600,
      texte: "La maison aperçue depuis la prairie, à travers les frondaisons",
    },
    {
      fichier: "04",
      largeur: 1341,
      hauteur: 707,
      texte:
        "Le salon : cheminée de pierre, bibliothèque, deux fenêtres sur le parc",
    },
    {
      fichier: "05",
      largeur: 1152,
      hauteur: 856,
      texte:
        "La cuisine : évier de pierre sous la fenêtre, plan de travail en bois, tomettes au sol",
    },
  ],

  "surelevation-ramponneau-paris": [
    {
      fichier: "01",
      largeur: 1122,
      hauteur: 1402,
      texte:
        "L’immeuble depuis la rue : deux niveaux de bois posés sur cinq niveaux de pierre existants",
    },
    {
      fichier: "02",
      largeur: 1448,
      hauteur: 1086,
      texte:
        "Le séjour d’un logement de la surélévation : poutres de bois apparentes, vue sur les toits de zinc",
    },
    {
      fichier: "04",
      largeur: 1448,
      hauteur: 1086,
      texte:
        "Une cuisine ouverte en bois clair, la table devant la fenêtre sur rue",
    },
    {
      fichier: "03",
      largeur: 1402,
      hauteur: 1122,
      texte:
        "L’ossature de bois lamellé-collé en cours de montage, étayée, au-dessus des toits",
    },
  ],

  "halle-des-deux-ponts-ivry": [
    {
      fichier: "01",
      largeur: 1402,
      hauteur: 557,
      texte:
        "La halle depuis la place : pignon de béton et grande baie vitrée occupant toute la travée centrale",
    },
    {
      fichier: "03",
      largeur: 758,
      hauteur: 390,
      texte:
        "L’intérieur : voûtes de béton, lanterneaux en bandeau, étals de brique le long du mur",
    },
    {
      fichier: "04",
      largeur: 768,
      hauteur: 390,
      texte:
        "La nef dans son axe, la baie du pignon au fond, le sol de béton lissé",
    },
    {
      fichier: "02",
      largeur: 1402,
      hauteur: 557,
      texte: "Le long mur aveugle de la halle vu depuis la rue, avant travaux",
    },
  ],
};

/** Les photos d’une opération, couverture en tête. */
export function photosDe(slug: string): Photo[] {
  return PHOTOS[slug] ?? [];
}

/** La photo qui représente l’opération sur les cartes et dans la liste. */
export function couvertureDe(slug: string): Photo | undefined {
  return PHOTOS[slug]?.[0];
}

/**
 * Le rapport de la photographie, sous la forme attendue par
 * `aspect-ratio`.
 *
 * C’est lui qui remplace le 4/3 imposé à tout le monde. Le lot va de
 * 2,517 (la halle d’Ivry, un panoramique de 1402 × 557) à 0,562 (la
 * charpente de la Fonderie, un portrait de 900 × 1600) : aucun cadre
 * unique ne peut accueillir cet écart sans couper. Un 4/3 montrait 42 %
 * de la hauteur du portrait et 53 % de la largeur du panoramique — et
 * sur la surélévation Ramponneau, dont la couverture est un portrait,
 * il ne restait de l’immeuble qu’une tranche horizontale.
 *
 * Le cadre prend donc le rapport du fichier. `object-fit: cover` reste
 * en place et devient sans effet : quand le cadre a exactement le
 * rapport de l’image, couvrir et contenir sont la même chose. Rien
 * n’est rogné, rien n’est déformé, et la place reste réservée avant
 * l’arrivée du fichier — le décalage cumulé ne bouge pas.
 */
export function rapport(photo: Photo): string {
  return `${photo.largeur} / ${photo.hauteur}`;
}

/** Vrai quand la photographie est plus haute que large. */
export function estPortrait(photo: Photo): boolean {
  return photo.hauteur > photo.largeur;
}

/**
 * Les déclinaisons produites, du plus petit au plus grand.
 *
 * Le suffixe dit la largeur : `01-700.webp` fait 700 px. Les anciens
 * `-xs` et `-s` ne la disaient pas, et il en manquait une entre 500 et
 * 900 — exactement la plage où tombe la vignette du site 12, qui
 * s’affiche sur 560 px. Le navigateur y prenait donc le fichier de
 * 900 px faute de mieux, et l’accueil pesait 616 ko pour un seuil de
 * 600.
 *
 * Le fichier maître, sans suffixe, n’est pas dans cette liste : sa
 * largeur varie d’une photographie à l’autre et c’est
 * `photo.largeur` qui la donne.
 */
export const LARGEURS = [500, 700, 900] as const;

/**
 * Le préfixe d’URL, quand le site n’est pas servi à la racine.
 *
 * `basePath` dans `next.config.ts` préfixe ce que Next fabrique
 * lui-même : les `href` de `next/link`, les scripts, les feuilles de
 * style, les polices. Il ne touche pas à une chaîne qu’on écrit soi-même
 * — et les chemins ci-dessous en sont.
 *
 * Sans cette variable, les quatre-vingt-quatre fichiers d’images
 * partaient chercher `/projets/…` à la racine de `sulianbh.github.io`,
 * où il n’y a rien. Le site se serait affiché entier, mis en page,
 * navigable, et sans une seule photographie. C’est le genre de panne
 * qu’on ne voit qu’en regardant la page publiée.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Le chemin d’un fichier, à une largeur donnée — sans elle, le maître. */
export function source(slug: string, photo: Photo, largeur?: number): string {
  const suffixe = largeur === undefined ? "" : `-${largeur}`;
  return `${BASE}/projets/${slug}/${photo.fichier}${suffixe}.webp`;
}

/**
 * Le jeu de candidats, à donner tel quel à `srcSet`.
 *
 * Une déclinaison n’y figure que si elle est plus petite que le
 * maître, parce qu’elle n’existe sur le disque qu’à cette condition :
 * on n’agrandit pas un fichier pour remplir une case. La halle d’Ivry
 * a deux vues de 758 et 768 px de large, qui n’ont donc pas de
 * déclinaison à 900.
 *
 * L’annoncer quand même serait pire que de l’omettre : le `srcset`
 * dirait `900w` pour un fichier de 758, et le navigateur choisirait
 * plus petit que ce qu’il croit prendre. C’est ce que faisait
 * l’ancienne échelle, où `03-s.webp` était l’octet pour octet la copie
 * de `03.webp`.
 */
export function jeuDeSources(slug: string, photo: Photo): string {
  const candidats = LARGEURS.filter((l) => l < photo.largeur).map(
    (l) => `${source(slug, photo, l)} ${l}w`,
  );
  candidats.push(`${source(slug, photo)} ${photo.largeur}w`);
  return candidats.join(", ");
}
