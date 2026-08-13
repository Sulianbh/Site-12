import type { Metadata } from "next";
import { AGENCE, SITE_URL, QUESTIONS } from "./agence";
import type { Maillon } from "./navigation";
import { PROJETS } from "./projets";

/**
 * Le référencement, tenu en un seul endroit.
 *
 * Chaque page a un titre et une description qui lui sont propres — deux
 * pages qui partagent la même description se font concurrence dans les
 * résultats. Le gabarit `%s — PASUPA` ajoute neuf caractères : les
 * titres de page sont écrits assez courts pour que le total reste sous
 * la soixantaine, faute de quoi le suffixe se fait couper.
 */

/**
 * La carte de partage, désignée explicitement.
 *
 * Deux raisons de la nommer à la main plutôt que de laisser Next s’en
 * charger.
 *
 * La première tient au segment : `opengraph-image.tsx` ne s’attache qu’à
 * celui où il vit, et dès qu’une page déclare son propre bloc
 * `openGraph`, elle cesse d’en hériter et se partage sans aperçu.
 *
 * La seconde tient à l’hébergeur, et elle a coûté l’aperçu de partage du
 * site en ligne. En export statique, la route `opengraph-image` produit
 * un fichier **sans extension**. GitHub Pages déduit le type MIME de
 * l’extension : n’en trouvant aucune, il servait un PNG parfaitement
 * valide en `application/octet-stream`, et plusieurs réseaux refusent
 * d’afficher une image annoncée ainsi. Le fichier existait, l’aperçu
 * tombait quand même.
 *
 * On sert donc un vrai `.png` depuis `public/`, dont l’extension ne
 * laisse aucune place à la déduction, et on déclare son type. Le préfixe
 * est indispensable : `basePath` ne touche pas à une chaîne écrite à la
 * main.
 *
 * `src/app/opengraph-image.tsx` reste le générateur de ce fichier — c’est
 * de lui que `public/partage.png` a été tiré, et c’est lui qu’il faut
 * modifier puis réexporter pour changer la carte.
 *
 * L’adresse reste **relative à la racine du site**, sans préfixe. C’est
 * l’inverse de la règle qui vaut pour `photos.ts` : là-bas les chemins
 * sont écrits dans du JSX, que `basePath` ne touche pas, et il faut donc
 * les préfixer soi-même. Ici, Next résout l’adresse contre
 * `metadataBase` — laquelle vaut déjà `…/Site-12`. Préfixer une seconde
 * fois donnait `…/Site-12/Site-12/partage.png`, mesuré sur le site
 * publié : le fichier existait, servi avec le bon type, et l’aperçu
 * tombait quand même.
 */
const CARTE = {
  url: "/partage.png",
  type: "image/png",
  width: 1200,
  height: 630,
  alt: `${AGENCE.nomLong} — ${AGENCE.these}`,
};

export function metadonnees({
  titre,
  description,
  chemin,
}: {
  titre: string;
  description: string;
  chemin: string;
}): Metadata {
  const url = chemin === "/" ? "/" : chemin;

  /*
   * `title.template` de la mise en page racine ne s’applique qu’aux
   * segments enfants, jamais à celui où il est déclaré — et l’accueil
   * partage ce segment. Sans ce cas particulier, la page la plus
   * référencée du site est la seule dont le titre ne porte pas le nom
   * de l’agence. On l’écrit donc en absolu, dans l’ordre inverse : la
   * marque d’abord, comme sur la barre du haut.
   */
  const racine = chemin === "/";

  return {
    title: racine ? { absolute: `${AGENCE.nom} — ${titre}` } : titre,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url,
      siteName: AGENCE.nomLong,
      title: `${titre} — ${AGENCE.nom}`,
      description,
      images: [CARTE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${titre} — ${AGENCE.nom}`,
      description,
      images: [CARTE.url],
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Les données structurées                                            */
/* ------------------------------------------------------------------ */

const ID_AGENCE = `${SITE_URL}/#agence`;
const ID_SITE = `${SITE_URL}/#site`;

function organisation() {
  return {
    "@type": ["ProfessionalService", "ArchitecturalService"],
    "@id": ID_AGENCE,
    name: AGENCE.nomLong,
    alternateName: AGENCE.nom,
    url: `${SITE_URL}/`,
    description: `${AGENCE.these} ${AGENCE.sousThese}`,
    foundingDate: String(AGENCE.depuis),
    address: {
      "@type": "PostalAddress",
      streetAddress: AGENCE.adresse.rue,
      postalCode: AGENCE.adresse.codePostal,
      addressLocality: AGENCE.adresse.ville,
      addressCountry: "FR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: AGENCE.geo.latitude,
      longitude: AGENCE.geo.longitude,
    },
    telephone: AGENCE.telephoneE164,
    email: AGENCE.courriel,
    areaServed: AGENCE.zone.map((z) => ({ "@type": "AdministrativeArea", name: z })),
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    knowsLanguage: "fr-FR",
  };
}

function siteWeb() {
  return {
    "@type": "WebSite",
    "@id": ID_SITE,
    url: `${SITE_URL}/`,
    name: AGENCE.nomLong,
    inLanguage: "fr-FR",
    publisher: { "@id": ID_AGENCE },
  };
}

function filDAriane(maillons: Maillon[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: maillons.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: m.nom,
      item: `${SITE_URL}${m.url === "/" ? "/" : m.url}`,
    })),
  };
}

export function grapheProjet(slug: string) {
  const p = PROJETS.find((x) => x.slug === slug);
  if (!p) return null;
  return {
    "@type": "CreativeWork",
    "@id": `${SITE_URL}/projets/${p.slug}#projet`,
    name: p.nom,
    headline: `${p.nom}, ${p.commune}`,
    description: p.accroche,
    dateCreated: String(p.annee),
    locationCreated: { "@type": "Place", name: p.commune },
    creator: { "@id": ID_AGENCE },
    about: p.nature,
    inLanguage: "fr-FR",
  };
}

export function grapheListeProjets() {
  return {
    "@type": "ItemList",
    name: "Projets livrés par PASUPA",
    numberOfItems: PROJETS.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: PROJETS.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${p.nom}, ${p.commune}`,
      url: `${SITE_URL}/projets/${p.slug}`,
    })),
  };
}

export function grapheQuestions() {
  return {
    "@type": "FAQPage",
    "@id": `${SITE_URL}/contact#questions`,
    mainEntity: QUESTIONS.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.reponse },
    })),
  };
}

/**
 * Assemble le graphe d’une page : l’agence et le site sont toujours là,
 * reliés par `@id` plutôt que recopiés, et la page ajoute ce qui la
 * concerne.
 */
export function graphe(
  maillons: Maillon[],
  ...blocs: (object | null)[]
): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      organisation(),
      siteWeb(),
      filDAriane(maillons),
      ...blocs.filter(Boolean),
    ],
  });
}
