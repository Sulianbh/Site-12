/**
 * L’arborescence, en entier.
 *
 * Quatre entrées, un seul niveau de profondeur. Rien n’est à plus de
 * deux clics de l’accueil : les projets sont à deux, tout le reste à un.
 * Les questions vivent au bas de la page Contact, où elles sont posées ;
 * les mentions légales au pied de page, où on les cherche.
 */

interface Entree {
  libelle: string;
  href: string;
  /** Sert à l’attribut `title` du lien et aux données structurées. */
  description: string;
}

export const MENU: Entree[] = [
  {
    libelle: "Accueil",
    href: "/",
    description: "PASUPA, agence d’architecture à Paris depuis 2011",
  },
  {
    libelle: "Projets",
    href: "/projets",
    description: "Six bâtiments livrés, en plan, en coupe et en chiffres",
  },
  {
    libelle: "Agence",
    href: "/agence",
    description: "Le parcours, l’équipe, les concours et les distinctions",
  },
  {
    libelle: "Contact",
    href: "/contact",
    description: "Prendre le premier rendez-vous, et les questions courantes",
  },
];

export const PIED: Entree[] = [
  {
    libelle: "Questions fréquentes",
    href: "/contact#questions",
    description: "Prix, délais, obligations : les réponses en clair",
  },
  {
    libelle: "Mentions légales",
    href: "/mentions-legales",
    description: "Éditeur, hébergeur, données personnelles",
  },
];

/* ------------------------------------------------------------------ */
/*  Le fil d’Ariane                                                    */
/* ------------------------------------------------------------------ */

export interface Maillon {
  nom: string;
  url: string;
}

/**
 * Construit le fil au format chemin de fichier — « Accueil / Projets /
 * Maison de maître ». Le premier maillon est toujours l’accueil, le
 * dernier n’est jamais un lien : on y est déjà.
 */
export function fil(...maillons: Maillon[]): Maillon[] {
  return [{ nom: "Accueil", url: "/" }, ...maillons];
}
