/**
 * Les six opérations, en ordre chronologique de livraison.
 *
 * L’ordre du tableau EST l’ordre du site : l’index les liste de la plus
 * ancienne à la plus récente, et « projet précédent / projet suivant »
 * ne fait que se déplacer d’un cran dans ce tableau. Il n’y a donc
 * jamais deux ordres à tenir d’accord.
 *
 * Tout est fictif : maîtres d’ouvrage, communes, surfaces et montants.
 */

/* ------------------------------------------------------------------ */
/*  Les matières                                                       */
/* ------------------------------------------------------------------ */

/**
 * Chaque matière porte son petit dessin, tracé par `<Matiere>` à partir
 * de cette clé. La légende du chantier, en somme : on nomme ce qu’on
 * voit sur la coupe.
 */
export type CleMatiere =
  | "meuliere"
  | "brique"
  | "bois"
  | "beton"
  | "acier"
  | "zinc"
  | "chaux"
  | "verre"
  | "terre-cuite"
  | "paille";

export interface Matiere {
  nom: string;
  emploi: string;
}

export const MATIERES: Record<CleMatiere, Matiere> = {
  meuliere: {
    nom: "Pierre meulière",
    emploi: "Maçonnerie existante, conservée et rejointoyée à la chaux",
  },
  brique: {
    nom: "Brique pleine",
    emploi: "Remplissage des allèges et reprise des baies",
  },
  bois: {
    nom: "Bois lamellé-collé",
    emploi: "Structure des planchers et de la charpente, épicéa",
  },
  beton: {
    nom: "Béton banché",
    emploi: "Soubassement, dalle basse et noyau d’escalier",
  },
  acier: {
    nom: "Acier galvanisé",
    emploi: "Poteaux, poutres de reprise et garde-corps",
  },
  zinc: {
    nom: "Zinc à joint debout",
    emploi: "Couverture et habillage des lucarnes",
  },
  chaux: {
    nom: "Enduit à la chaux",
    emploi: "Parement intérieur, teinte laissée nue",
  },
  verre: {
    nom: "Verre clair, menuiserie fine",
    emploi: "Châssis fixes et ouvrants en bois-aluminium",
  },
  "terre-cuite": {
    nom: "Terre cuite",
    emploi: "Sols en tomettes déposées, nettoyées et reposées",
  },
  paille: {
    nom: "Botte de paille",
    emploi: "Remplissage isolant des caissons de façade",
  },
};

/* ------------------------------------------------------------------ */
/*  Les projets                                                        */
/* ------------------------------------------------------------------ */

export type Nature = "Réhabilitation" | "Construction neuve" | "Surélévation";

export interface LigneFiche {
  libelle: string;
  valeur: string;
}

export interface Projet {
  slug: string;
  nom: string;
  commune: string;
  annee: number;
  nature: Nature;
  /** Le mini-texte qui se lit sous le titre, avant la description. */
  accroche: string;
  /** Une phrase pour l’index et les cartes de l’accueil. */
  resume: string;
  description: string[];
  fiche: LigneFiche[];
  matieres: CleMatiere[];
  /** Légende du schéma, placée dessous. */
  legende: string;
  distinction?: string;
}

export const PROJETS: Projet[] = [
  {
    slug: "ateliers-de-la-fonderie-montreuil",
    nom: "Ateliers de la Fonderie",
    commune: "Montreuil (93)",
    annee: 2016,
    nature: "Réhabilitation",
    accroche:
      "Une halle de fonderie de 1928 devenue quatorze ateliers d’artistes, sans qu’on touche à sa charpente.",
    resume:
      "Quatorze ateliers insérés dans une halle industrielle, en n’ajoutant qu’un plancher et des cloisons démontables.",
    description: [
      "La halle appartenait à une fonderie de laiton fermée en 1994. Elle était intacte : douze fermes en acier riveté portant une couverture en sheds orientés au nord, sur un sol de béton lissé taché de sable de moulage. Rien de tout cela n’était protégé, et la commune envisageait la démolition.",
      "Nous avons proposé de n’ajouter qu’une seule chose : un plancher intermédiaire en bois, posé sur une ossature indépendante qui ne prend appui nulle part sur les fermes existantes. Les ateliers sont des boîtes qui se glissent dessous et dessus ; on peut les démonter en une semaine et la halle redeviendrait ce qu’elle était.",
      "Les sheds ont été revitrés à l’identique, en verre clair, ce qui donne aux quatorze ateliers la lumière du nord dont ils avaient besoin sans un seul luminaire allumé avant seize heures. Le sol de béton a été conservé avec ses taches : il a été lavé, pas ragréé.",
    ],
    fiche: [
      { libelle: "Maître d’ouvrage", valeur: "Commune de Montreuil" },
      { libelle: "Programme", valeur: "14 ateliers d’artistes et une halle commune" },
      { libelle: "Surface", valeur: "1 180 m² de surface de plancher" },
      { libelle: "Travaux", valeur: "2 240 000 € HT" },
      { libelle: "Mission", valeur: "Complète, avec diagnostic de structure" },
      { libelle: "Études", valeur: "Février 2014 – juin 2015" },
      { libelle: "Chantier", valeur: "16 mois, livré en octobre 2016" },
      { libelle: "Entreprises", valeur: "9 lots séparés" },
    ],
    matieres: ["acier", "bois", "verre", "beton"],
    legende:
      "Coupe transversale sur la halle. En trait fin, les douze fermes en acier riveté de 1928 et la couverture en sheds, conservées. En trait plein, l’ossature bois indépendante des ateliers, qui ne prend appui sur la structure existante en aucun point.",
    distinction: "Mention spéciale du public, Grand Prix de la réhabilitation de Seine-Saint-Denis, 2019",
  },
  {
    slug: "maison-a-cour-montreuil",
    nom: "Maison à cour",
    commune: "Montreuil (93)",
    annee: 2018,
    nature: "Construction neuve",
    accroche:
      "Une maison de ville sur une parcelle de sept mètres de large, organisée autour d’une cour qu’on traverse pour aller dormir.",
    resume:
      "Sur une parcelle en lanière de sept mètres, une maison qui tire sa lumière d’une cour centrale plutôt que de ses pignons.",
    description: [
      "La parcelle mesure sept mètres de large sur trente-deux de long, coincée entre deux maisons mitoyennes aveugles. Une maison ordinaire y aurait aligné les pièces le long d’un couloir, avec deux façades éclairées et huit mètres de pénombre au milieu.",
      "Nous avons coupé la maison en deux et mis le vide au centre. La cour fait quatre mètres sur cinq ; elle éclaire quatre pièces au lieu d’aucune, et il faut la traverser à couvert pour passer du séjour aux chambres. Ce trajet de six pas est le seul geste un peu insistant du projet.",
      "Le budget imposait la simplicité : murs de brique pleine montés au mortier bâtard, planchers bois, couverture en zinc à joint debout, menuiseries bois-aluminium en série. Aucun matériau de la maison n’est un matériau de commande spéciale.",
    ],
    fiche: [
      { libelle: "Maître d’ouvrage", valeur: "Particuliers" },
      { libelle: "Programme", valeur: "Maison individuelle, 4 chambres" },
      { libelle: "Surface", valeur: "164 m² de surface de plancher" },
      { libelle: "Travaux", valeur: "412 000 € HT" },
      { libelle: "Mission", valeur: "Complète" },
      { libelle: "Études", valeur: "Septembre 2016 – mai 2017" },
      { libelle: "Chantier", valeur: "14 mois, livré en juillet 2018" },
      { libelle: "Entreprises", valeur: "7 lots séparés" },
    ],
    matieres: ["brique", "bois", "zinc", "verre"],
    legende:
      "Plan du rez-de-chaussée. En trait fin, les deux mitoyens aveugles et les limites de la parcelle. En trait plein, la maison : séjour et cuisine au sud, cour au centre, chambres au nord, reliés par la galerie couverte de l’est.",
    distinction: "Lauréat, Prix départemental de la maison individuelle, 2020",
  },
  {
    slug: "brasserie-du-canal-pantin",
    nom: "Brasserie du Canal",
    commune: "Pantin (93)",
    annee: 2020,
    nature: "Réhabilitation",
    accroche:
      "Un garage de mécanique transformé en brasserie, où la salle de dégustation regarde les cuves à travers une seule vitre.",
    resume:
      "Un garage devenu brasserie artisanale : salle de production lavable au jet, salle de dégustation qui la regarde en entier.",
    description: [
      "La coopérative voulait une brasserie qu’on puisse visiter sans s’habiller. Le programme tenait en deux exigences contradictoires : une salle de production traitée comme un atelier alimentaire, lavable au jet et tenue à quatorze degrés, et une salle publique qui ne soit pas une pièce aveugle collée à côté.",
      "Le garage offrait une trame de poteaux béton de six mètres et une hauteur libre de cinq mètres vingt. Nous avons posé la salle de dégustation sur une plateforme d’acier à mi-hauteur, au-dessus des bureaux, et ouvert une seule baie vitrée de neuf mètres de long entre elle et la salle des cuves. On boit en regardant la production ; on ne la traverse jamais.",
      "Le maintien des quatorze degrés sans groupe froid a décidé de la façade : quinze centimètres de bottes de paille en caissons bois, enduits à la chaux à l’intérieur, protégés par un bardage de zinc à l’extérieur. La salle n’a pas dépassé quinze degrés pendant la canicule de 2022.",
    ],
    fiche: [
      { libelle: "Maître d’ouvrage", valeur: "Société coopérative de production" },
      { libelle: "Programme", valeur: "Brasserie artisanale, salle de dégustation, bureaux" },
      { libelle: "Surface", valeur: "640 m² de surface de plancher" },
      { libelle: "Travaux", valeur: "1 180 000 € HT" },
      { libelle: "Mission", valeur: "Complète, avec dossier ICPE" },
      { libelle: "Études", valeur: "Janvier 2019 – octobre 2019" },
      { libelle: "Chantier", valeur: "13 mois, livré en novembre 2020" },
      { libelle: "Entreprises", valeur: "8 lots séparés" },
    ],
    matieres: ["beton", "acier", "paille", "chaux", "zinc"],
    legende:
      "Coupe longitudinale. En trait fin, la trame de poteaux béton du garage et la charpente conservée. En trait plein, la plateforme d’acier de la salle de dégustation, la baie de neuf mètres et les caissons de paille rapportés en façade.",
    distinction: "Finaliste, Palmarès régional de la construction bois, 2021",
  },
  {
    slug: "maison-de-maitre-nogent",
    nom: "Maison de maître",
    commune: "Nogent-sur-Marne (94)",
    annee: 2022,
    nature: "Réhabilitation",
    accroche:
      "Une meulière de 1902 dont on a retiré quatre-vingts ans d’ajouts avant de n’en construire qu’un seul.",
    resume:
      "Une meulière rendue à son plan de 1902, augmentée d’une seule pièce en fond de jardin.",
    description: [
      "La maison avait été découpée en trois logements dans les années soixante, puis recloisonnée deux fois. Le relevé a demandé quatre journées : il fallait distinguer les murs de 1902 des ajouts en carreau de plâtre, et retrouver l’emplacement des trois cheminées disparues à leurs souches encore visibles en couverture.",
      "L’essentiel des travaux a consisté à retirer. Les cloisons rapportées, le faux plafond du hall, le crépi ciment qui empêchait la meulière de respirer et retenait l’humidité dans les pieds de murs depuis 1978. La maison a retrouvé son plan d’origine, et onze mètres carrés de plus qu’au dépôt du permis.",
      "Un seul ajout : une pièce de vingt-huit mètres carrés en fond de jardin, en béton banché brut et verre, reliée à la maison par un passage vitré bas. Elle ne touche pas la meulière ; elle s’en écarte de quatre-vingts centimètres, et l’on voit le mur ancien sur toute sa hauteur depuis l’intérieur du nouveau volume.",
    ],
    fiche: [
      { libelle: "Maître d’ouvrage", valeur: "Particuliers" },
      { libelle: "Programme", valeur: "Remise en un seul logement et extension" },
      { libelle: "Surface", valeur: "248 m² existants, 28 m² créés" },
      { libelle: "Travaux", valeur: "690 000 € HT" },
      { libelle: "Mission", valeur: "Complète, en abords de monument historique" },
      { libelle: "Études", valeur: "Mars 2020 – février 2021" },
      { libelle: "Chantier", valeur: "15 mois, livré en mai 2022" },
      { libelle: "Entreprises", valeur: "11 lots séparés" },
    ],
    matieres: ["meuliere", "chaux", "beton", "verre", "terre-cuite"],
    legende:
      "Plan du rez-de-chaussée après travaux. En trait fin continu et en poché, la maçonnerie de meulière de 1902, conservée. En tireté, les cloisons de carreau de plâtre déposées et le tracé des trois cheminées retrouvées à leurs souches. En trait plein, l’extension en fond de jardin, séparée du mur ancien par un joint creux de 80 cm.",
    distinction:
      "Mention du jury, Prix Pierre & Chaux Île-de-France, 2025 · Sélection, Biennale d’architecture d’Île-de-France, 2023",
  },
  {
    slug: "surelevation-ramponneau-paris",
    nom: "Surélévation Ramponneau",
    commune: "Paris 11e",
    annee: 2024,
    nature: "Surélévation",
    accroche:
      "Douze logements posés sur un immeuble des années trente, montés en bois pour que l’existant puisse les porter.",
    resume:
      "Deux niveaux de logements ajoutés sur un immeuble existant, entièrement préfabriqués en bois pour tenir dans la charge admissible.",
    description: [
      "Le diagnostic de structure donnait la règle du projet en une ligne : les murs de refend pouvaient reprendre trois cent vingt kilos par mètre carré supplémentaires, pas un de plus. Cela excluait le béton, et cela excluait aussi de descendre de nouveaux appuis à travers les logements habités.",
      "Les deux niveaux sont donc en caissons bois préfabriqués, posés sur un chevêtre d’acier qui redistribue les charges directement sur les refends. Chaque caisson est arrivé fini, isolé et vitré, et a été posé à la grue en une matinée. La totalité de la pose a demandé onze jours ouvrés.",
      "L’immeuble est resté habité pendant les vingt-deux mois de chantier. C’est la contrainte qui a le plus pesé sur le dessin : aucune reprise en sous-œuvre, un seul percement de la toiture existante pour la cage d’escalier, et les réseaux montés en façade sur cour dans une gaine de zinc.",
    ],
    fiche: [
      { libelle: "Maître d’ouvrage", valeur: "Bailleur social, Paris" },
      { libelle: "Programme", valeur: "12 logements en surélévation, du T2 au T4" },
      { libelle: "Surface", valeur: "780 m² de surface de plancher créée" },
      { libelle: "Travaux", valeur: "2 420 000 € HT" },
      { libelle: "Mission", valeur: "Complète, site occupé" },
      { libelle: "Études", valeur: "Novembre 2021 – novembre 2022" },
      { libelle: "Chantier", valeur: "22 mois, livré en septembre 2024" },
      { libelle: "Entreprises", valeur: "12 lots séparés" },
    ],
    matieres: ["bois", "acier", "zinc", "verre"],
    legende:
      "Coupe sur la façade rue. En trait fin, l’immeuble de 1936 : six niveaux, murs de refend porteurs, comble à surcroît déposé. En trait plein, le chevêtre d’acier et les deux niveaux de caissons bois préfabriqués, avec le report des charges sur les refends.",
  },
  {
    slug: "halle-des-deux-ponts-ivry",
    nom: "Halle des Deux-Ponts",
    commune: "Ivry-sur-Seine (94)",
    annee: 2026,
    nature: "Réhabilitation",
    accroche:
      "Une halle de marché de 1954 rendue à son volume, avec vingt-deux étals et une salle qui se ferme au rideau.",
    resume:
      "Une halle de marché débarrassée de ses ajouts, vingt-deux étals fixes et une salle associative refermable par un rideau d’acier.",
    description: [
      "La halle avait été peu à peu comblée : un local technique en 1971, une chambre froide en 1986, un bloc sanitaire en 1999, tous construits sous la charpente sans jamais la toucher. On avait fini par ne plus voir les treize portiques de béton qui la portent.",
      "Le projet a d’abord été un projet de dépose. Les trois volumes rapportés ont été démolis, la charpente sablée, la couverture refaite en bac acier isolé avec les mêmes lanterneaux qu’à l’origine. La halle a retrouvé ses quarante-huit mètres de long d’un seul tenant.",
      "Le nouveau programme tient dans une bande de six mètres le long de la façade nord : vingt-deux étals maçonnés, les réserves, et une salle associative de cent-dix mètres carrés qu’un rideau d’acier ferme les soirs de réunion. Le reste de la halle, soit près de mille mètres carrés, est resté vide — c’était l’objet du concours.",
    ],
    fiche: [
      { libelle: "Maître d’ouvrage", valeur: "Ville d’Ivry-sur-Seine" },
      { libelle: "Programme", valeur: "Halle alimentaire, 22 étals, salle associative" },
      { libelle: "Surface", valeur: "1 240 m² de surface utile" },
      { libelle: "Travaux", valeur: "3 180 000 € HT" },
      { libelle: "Mission", valeur: "Complète, concours restreint" },
      { libelle: "Études", valeur: "Juin 2023 – avril 2024" },
      { libelle: "Chantier", valeur: "23 mois, livré en mars 2026" },
      { libelle: "Entreprises", valeur: "14 lots séparés" },
    ],
    matieres: ["beton", "acier", "brique", "verre", "terre-cuite"],
    legende:
      "Plan d’ensemble. En trait fin continu, les treize portiques de béton de 1954, conservés. En tireté, l’emprise des trois volumes déposés : local technique, chambre froide, bloc sanitaire. En trait plein, la bande programmée de six mètres le long de la façade nord — vingt-deux étals, réserves et salle associative.",
  },
];

/* ------------------------------------------------------------------ */
/*  Accès                                                              */
/* ------------------------------------------------------------------ */

/** Les quatre mis en avant sur l’accueil : les plus récents. */
export const PROJETS_ACCUEIL = PROJETS.slice(-4).reverse();

export function projetParSlug(slug: string): Projet | undefined {
  return PROJETS.find((p) => p.slug === slug);
}

/**
 * Le précédent et le suivant dans l’ordre chronologique. Aux deux bouts
 * du tableau, on renvoie `undefined` plutôt que de boucler : une frise
 * qui recommence à zéro ment sur l’ancienneté de l’agence.
 */
export function voisins(slug: string): {
  precedent?: Projet;
  suivant?: Projet;
} {
  const i = PROJETS.findIndex((p) => p.slug === slug);
  if (i === -1) return {};
  return {
    precedent: i > 0 ? PROJETS[i - 1] : undefined,
    suivant: i < PROJETS.length - 1 ? PROJETS[i + 1] : undefined,
  };
}
