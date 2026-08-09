/**
 * PASUPA• — architectes.
 *
 * Tout est fictif : le nom, les personnes, l’adresse, les communes, les
 * projets, les concours, les distinctions et les montants. Ce site est
 * une démonstration de conception, pas la vitrine d’une agence réelle.
 */

export const AGENCE = {
  nom: "PASUPA",
  nomLong: "PASUPA architectes",
  metier: "architectes",
  depuis: 2011,
  these: "Neuf personnes, quarante-et-un bâtiments.",
  sousThese:
    "Un architecte associé suit chaque projet, du premier relevé à la levée des réserves.",
  adresse: {
    rue: "12 rue du Buisson-Saint-Louis",
    codePostal: "75010",
    ville: "Paris",
    pays: "France",
  },
  /** Repère fictif, quelque part dans le 10e arrondissement. */
  geo: { latitude: 48.8721, longitude: 2.3714 },
  telephone: "01 99 00 42 18",
  telephoneE164: "+33199004218",
  courriel: "contact@pasupa.fr",
  horaires: "Du lundi au vendredi, 9 h – 18 h",
  visite: "Visite de l’agence sur rendez-vous, le jeudi après-midi",
  ordre:
    "Inscrite au tableau de l’Ordre des architectes d’Île-de-France sous le n° S 14 782",
  zone: [
    "Paris",
    "Seine-Saint-Denis",
    "Val-de-Marne",
    "Hauts-de-Seine",
    "Seine-et-Marne",
  ],
} as const;

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.pasupa.fr"
).replace(/\/$/, "");

/**
 * La date du dernier changement de *contenu*, et non de la dernière
 * construction. C’est elle que le plan du site publie en `lastmod` et
 * elle que le pied de page date : annoncer une modification qui n’a pas
 * eu lieu apprend au moteur à ne plus croire ce champ.
 */
export const DERNIERE_MISE_A_JOUR = "2026-08-09";

/* ------------------------------------------------------------------ */
/*  Chiffres clés — des nombres, pas des adjectifs                     */
/* ------------------------------------------------------------------ */

export interface Chiffre {
  valeur: string;
  libelle: string;
  precision: string;
}

export const CHIFFRES: Chiffre[] = [
  {
    valeur: "41",
    libelle: "bâtiments livrés",
    precision: "Depuis 2011, en Île-de-France. Dont 27 en réhabilitation.",
  },
  {
    valeur: "9",
    libelle: "personnes",
    precision:
      "Dont deux associés. Celui qui reçoit au premier rendez-vous signe le dernier compte rendu.",
  },
  {
    valeur: "48 h",
    libelle: "pour le compte rendu",
    precision:
      "Après chaque réunion hebdomadaire, sur chaque chantier, sans exception.",
  },
  {
    valeur: "60",
    libelle: "kilomètres de rayon",
    precision:
      "C’est la distance qui permet de tenir une visite hebdomadaire.",
  },
];

/* ------------------------------------------------------------------ */
/*  Les trois règles — la façon de faire, sur la page d’accueil        */
/* ------------------------------------------------------------------ */

export interface Regle {
  numero: string;
  titre: string;
  texte: string;
}

export const REGLES: Regle[] = [
  {
    numero: "01",
    titre: "L’associé qui reçoit est celui qui suit",
    texte:
      "Celui des deux associés qui vient au premier rendez-vous signe le dernier compte rendu de chantier. Il n’y a pas de passage de relais en cours de route.",
  },
  {
    numero: "02",
    titre: "L’esquisse est chiffrée avant d’être montrée",
    texte:
      "Deux ou trois hypothèses réellement différentes, chiffrées au lot par notre économiste à ± 10 %. Si aucune ne convient, l’étude s’arrête là.",
  },
  {
    numero: "03",
    titre: "Une visite par semaine, un compte rendu sous 48 h",
    texte:
      "Les situations de travaux sont vérifiées avant paiement : vous ne payez que ce qui est posé. Écart moyen constaté sur les douze derniers chantiers : 3,8 %.",
  },
];

/* ------------------------------------------------------------------ */
/*  La frise — le parcours de l’agence, année par année                */
/* ------------------------------------------------------------------ */

export interface Etape {
  annee: string;
  titre: string;
  texte: string;
  /** Repère chiffré porté en marge de l’étape. */
  repere?: string;
}

export const FRISE: Etape[] = [
  {
    annee: "2011",
    titre: "Deux architectes, une pièce rue du Buisson-Saint-Louis",
    texte:
      "Claire Vasseur et Nicolas Berteau, tous deux sortis de l’agence Havard & Loiseau, s’associent autour d’une règle simple : ne prendre que le nombre de projets qu’ils peuvent suivre eux-mêmes sur le chantier. L’agence est inscrite au tableau de l’Ordre d’Île-de-France la même année.",
    repere: "2 personnes",
  },
  {
    annee: "2013",
    titre: "Première réhabilitation lourde",
    texte:
      "Un plateau de bureaux à Bagnolet, structure bois insérée dans une halle de tôle. C’est ce chantier qui décide de la spécialité de l’agence : travailler sur l’existant plutôt que sur du terrain nu, et dessiner les détails d’assemblage à l’échelle 1.",
    repere: "620 m²",
  },
  {
    annee: "2016",
    titre: "Les Ateliers de la Fonderie ouvrent à Montreuil",
    texte:
      "Premier bâtiment public de l’agence, et première publication. L’équipe passe à cinq personnes : une cheffe de projet architecte et un poste d’accueil et de suivi des dossiers, deux ans après l’arrivée de l’administration des marchés — la consultation des entreprises avait cessé d’être tenable en plus du dessin.",
    repere: "5 personnes",
  },
  {
    annee: "2018",
    titre: "Le protocole de chantier est écrit",
    texte:
      "Une visite par semaine, un compte rendu sous 48 heures, une vérification des situations de travaux avant tout paiement. Les trois chantiers de l’année s’achèvent avec un écart moyen de 3,1 % entre le marché signé et le décompte final.",
    repere: "écart 3,1 %",
  },
  {
    annee: "2021",
    titre: "L’agence atteint sa taille définitive",
    texte:
      "Neuf personnes : quatre architectes, une économiste de la construction, un poste de dessin d’exécution et trois à l’administration des marchés. C’est le format retenu, et l’agence a depuis refusé de croître.",
    repere: "9 personnes",
  },
  {
    annee: "2023",
    titre: "Sélection à la Biennale d’architecture d’Île-de-France",
    texte:
      "La Maison de maître de Nogent y est présentée dans la section « Transformer sans effacer », aux côtés de onze autres opérations franciliennes. L’agence y expose sa convention de dessin : l’existant en trait fin, le projeté en trait plein.",
    repere: "12 projets exposés",
  },
  {
    annee: "2026",
    titre: "Quarante-et-un bâtiments livrés",
    texte:
      "Vingt-sept réhabilitations, neuf constructions neuves, cinq surélévations. Tous dans un rayon de soixante kilomètres autour de l’agence, tous suivis en chantier par l’un des deux associés.",
    repere: "41 bâtiments",
  },
];

/* ------------------------------------------------------------------ */
/*  L’équipe — neuf personnes                                          */
/* ------------------------------------------------------------------ */

export interface Membre {
  nom: string;
  role: string;
  depuis: number;
  /** Les initiales tiennent lieu de portrait tant qu’il n’y a pas de photo. */
  initiales: string;
}

export const EQUIPE: Membre[] = [
  {
    nom: "Claire Vasseur",
    role: "Architecte DE-HMONP, associée",
    depuis: 2011,
    initiales: "CV",
  },
  {
    nom: "Nicolas Berteau",
    role: "Architecte DE-HMONP, associé",
    depuis: 2011,
    initiales: "NB",
  },
  {
    nom: "Inès Rahmani",
    role: "Architecte, cheffe de projet",
    depuis: 2016,
    initiales: "IR",
  },
  {
    nom: "Thomas Lebrun",
    role: "Architecte, suivi de chantier",
    depuis: 2018,
    initiales: "TL",
  },
  {
    nom: "Marion Kessler",
    role: "Économiste de la construction",
    depuis: 2020,
    initiales: "MK",
  },
  {
    nom: "Samuel Ferreira",
    role: "Dessin et documents d’exécution",
    depuis: 2021,
    initiales: "SF",
  },
  {
    nom: "Aurélie Deschamps",
    role: "Administration des marchés",
    depuis: 2014,
    initiales: "AD",
  },
  {
    nom: "Karim Benabdallah",
    role: "Comptabilité et situations de travaux",
    depuis: 2019,
    initiales: "KB",
  },
  {
    nom: "Louise Trémoulet",
    role: "Accueil et suivi des dossiers",
    depuis: 2016,
    initiales: "LT",
  },
];

/* ------------------------------------------------------------------ */
/*  Prix et distinctions                                               */
/* ------------------------------------------------------------------ */

export interface Distinction {
  annee: string;
  intitule: string;
  rang: string;
  projet?: string;
  projetSlug?: string;
}

export const DISTINCTIONS: Distinction[] = [
  {
    annee: "2025",
    intitule: "Prix Pierre & Chaux, Île-de-France",
    rang: "Mention du jury",
    projet: "Maison de maître, Nogent-sur-Marne",
    projetSlug: "maison-de-maitre-nogent",
  },
  {
    annee: "2023",
    intitule: "Biennale d’architecture d’Île-de-France",
    rang: "Sélection, section « Transformer sans effacer »",
    projet: "Maison de maître, Nogent-sur-Marne",
    projetSlug: "maison-de-maitre-nogent",
  },
  {
    annee: "2021",
    intitule: "Palmarès régional de la construction bois",
    rang: "Finaliste",
    projet: "Brasserie du Canal, Pantin",
    projetSlug: "brasserie-du-canal-pantin",
  },
  {
    annee: "2020",
    intitule: "Prix départemental de la maison individuelle",
    rang: "Lauréat",
    projet: "Maison à cour, Montreuil",
    projetSlug: "maison-a-cour-montreuil",
  },
  {
    annee: "2019",
    intitule: "Grand Prix de la réhabilitation, Seine-Saint-Denis",
    rang: "Mention spéciale du public",
    projet: "Ateliers de la Fonderie, Montreuil",
    projetSlug: "ateliers-de-la-fonderie-montreuil",
  },
];

/* ------------------------------------------------------------------ */
/*  Concours — les gagnés comme les perdus                             */
/* ------------------------------------------------------------------ */

export interface Concours {
  annee: string;
  intitule: string;
  maitreOuvrage: string;
  programme: string;
  /** « Lauréat », « Second », « Non retenu »… dit tel quel. */
  issue: string;
  gagne: boolean;
  note: string;
}

/*
 * L’année est celle de la consultation, pas celle de la livraison : elle
 * doit donc toujours précéder le début des études du projet correspondant
 * dans `projets.ts`. C’est la contrainte qui avait sauté à la première
 * écriture — un concours daté de 2025 pour un projet dont les études
 * commençaient en 2023.
 */
export const CONCOURS: Concours[] = [
  {
    annee: "2024",
    intitule: "Groupe scolaire des Guilands",
    maitreOuvrage: "Ville de Bagnolet",
    programme: "Huit classes et restaurant scolaire, 2 100 m²",
    issue: "Second",
    gagne: false,
    note: "Notre proposition conservait le préau de 1953 ; le programme demandait sa dépose.",
  },
  {
    annee: "2023",
    intitule: "Halle des Deux-Ponts",
    maitreOuvrage: "Ville d’Ivry-sur-Seine",
    programme: "Halle alimentaire et salle associative, 1 240 m²",
    issue: "Lauréat",
    gagne: true,
    note: "Concours restreint, quatre équipes. Livré en mars 2026.",
  },
  {
    annee: "2022",
    intitule: "Centre technique municipal",
    maitreOuvrage: "Ville de Rosny-sous-Bois",
    programme: "Ateliers, garages et bureaux, 3 400 m²",
    issue: "Non retenu",
    gagne: false,
    note: "Hors de notre échelle : nous avons candidaté seuls là où il fallait un groupement.",
  },
  {
    annee: "2021",
    intitule: "Surélévation d’un îlot rue Ramponneau",
    maitreOuvrage: "Bailleur social, Paris 11e",
    programme: "Douze logements en surélévation bois, 780 m²",
    issue: "Lauréat",
    gagne: true,
    note: "Consultation sur esquisse, six équipes. Livré en septembre 2024.",
  },
  {
    annee: "2018",
    intitule: "Reconversion de la brasserie du Canal",
    maitreOuvrage: "Société coopérative, Pantin",
    programme: "Brasserie artisanale et salle de dégustation, 640 m²",
    issue: "Lauréat",
    gagne: true,
    note: "Consultation privée, trois équipes. Livré en novembre 2020.",
  },
];

/* ------------------------------------------------------------------ */
/*  Honoraires                                                         */
/* ------------------------------------------------------------------ */

export const HONORAIRES: { intitule: string; montant: string; note: string }[] =
  [
    {
      intitule: "Première visite sur place",
      montant: "Sans frais",
      note: "Deux heures, deux personnes, une note de deux pages sous huit jours.",
    },
    {
      intitule: "Étude de faisabilité",
      montant: "1 800 € HT",
      note: "Déduits intégralement si la mission se poursuit.",
    },
    {
      intitule: "Mission complète — construction neuve",
      montant: "11 % des travaux HT",
      note: "Dégressif à 9 % au-delà de 800 000 € de travaux.",
    },
    {
      intitule: "Mission complète — réhabilitation",
      montant: "13 % des travaux HT",
      note: "L’existant demande deux fois plus de relevés et de dessins de détail.",
    },
    {
      intitule: "Mission partielle — jusqu’au permis",
      montant: "5 % des travaux HT",
      note: "Relevé, esquisse et dossier de permis. Le chantier n’y est pas.",
    },
  ];

/* ------------------------------------------------------------------ */
/*  Les questions réellement posées au téléphone                       */
/*  (elles alimentent aussi les données structurées FAQPage)           */
/* ------------------------------------------------------------------ */

export interface Question {
  question: string;
  reponse: string;
}

export const QUESTIONS: Question[] = [
  {
    question: "Combien coûte un architecte pour une maison ?",
    reponse:
      "La mission complète en construction neuve représente 11 % du montant des travaux hors taxes, dégressifs à 9 % au-delà de 800 000 € de travaux. Une réhabilitation est facturée 13 %, parce qu’elle demande deux fois plus de relevés et de dessins de détail. La première visite sur place est sans frais ; l’étude de faisabilité coûte 1 800 € HT, déduits si la mission se poursuit.",
  },
  {
    question: "Quel budget de travaux faut-il prévoir en Île-de-France ?",
    reponse:
      "En 2026, une construction neuve se situe entre 2 400 et 3 200 € HT le mètre carré de surface de plancher, hors terrain, hors honoraires et hors aménagement extérieur. Une réhabilitation va de 1 800 à 2 800 € HT le mètre carré, selon l’état des maçonneries et de la couverture. Nous donnons une fourchette dès la première visite, puis un chiffrage par lot à ± 10 % à la fin de l’esquisse.",
  },
  {
    question:
      "Combien de temps dure un projet, du premier rendez-vous à la réception ?",
    reponse:
      "De 20 à 30 mois : six semaines d’esquisse, cinq mois de dossier et de consultation des entreprises, puis 13 à 23 mois de chantier selon le programme. L’instruction du permis de construire — deux à trois mois, cinq en secteur ABF — se déroule pendant le dossier. Le calendrier daté est remis à la fin de l’esquisse et mis à jour à chaque réunion de chantier.",
  },
  {
    question: "Le recours à un architecte est-il obligatoire ?",
    reponse:
      "Pour un particulier qui construit ou agrandit, le recours à un architecte est obligatoire dès que la surface de plancher ou l’emprise au sol dépasse 150 m² après travaux. En dessous, il reste facultatif. Pour une société civile immobilière ou toute personne morale, il l’est quelle que soit la surface.",
  },
  {
    question: "Combien de projets suivez-vous en même temps ?",
    reponse:
      "Huit à dix, à des stades différents : deux ou trois en esquisse, autant en dossier, trois ou quatre en chantier. Il en sort trois à quatre par an — quarante-et-un depuis 2011. C’est le nombre que deux associés peuvent suivre sans déléguer ni le dessin de détail ni les réunions de chantier. Quand l’année est complète, nous le disons dès le premier appel plutôt que de faire attendre.",
  },
  {
    question: "Intervenez-vous en dehors de Paris ?",
    reponse:
      "Nous travaillons dans un rayon de 60 kilomètres : Paris, Seine-Saint-Denis, Val-de-Marne, Hauts-de-Seine et Seine-et-Marne. C’est la distance qui permet de tenir une visite de chantier par semaine. Au-delà, nous adressons la demande à un confrère installé sur place.",
  },
  {
    question: "Que se passe-t-il si le budget dérape en cours de chantier ?",
    reponse:
      "Chaque avenant est signé avant d’être exécuté, jamais après. Les situations de travaux sont vérifiées avant paiement : vous ne payez que ce qui est posé. Sur nos douze derniers chantiers, l’écart moyen entre le marché signé et le décompte final est de 3,8 %, dû pour l’essentiel à des modifications demandées en cours de route.",
  },
  {
    question: "Peut-on visiter un de vos chantiers avant de s’engager ?",
    reponse:
      "Oui, et nous le proposons avant la signature du contrat, avec l’accord des maîtres d’ouvrage concernés. Un chantier en cours renseigne mieux qu’un portfolio : propreté, niveau des entreprises, tenue des réunions hebdomadaires.",
  },
  {
    question: "Travaillez-vous sur des bâtiments protégés ?",
    reponse:
      "Oui. Cinq de nos opérations se sont déroulées en abords de monument historique, en lien avec l’architecte des Bâtiments de France. L’instruction du permis passe alors de deux à cinq mois, et ce délai est intégré au calendrier dès l’esquisse — il ne se découvre pas en cours de route.",
  },
  {
    question: "Que devient le dossier une fois le chantier terminé ?",
    reponse:
      "Vous recevez un dossier des ouvrages exécutés, papier et numérique : plans conformes à l’exécution, notices des équipements, procès-verbaux et coordonnées des entreprises. Nous repassons deux fois pendant l’année de parfait achèvement, à six mois et à un an, pour lever ce qui doit l’être.",
  },
];
