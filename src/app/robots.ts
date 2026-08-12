import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/agence";

/*
 * `output: "export"` exige que toute route se déclare calculable une
 * fois pour toutes : sans cette ligne, la construction s’arrête ici.
 */
export const dynamic = "force-static";

/**
 * Rien n’est interdit ici, et c’est délibéré.
 *
 * Les mentions légales portent `noindex, follow` et sont volontairement
 * absentes du plan du site. La tentation est d’ajouter par-dessus un
 * `Disallow: /mentions-legales`, pour faire bonne mesure. Ce serait
 * l’inverse de ce qu’on cherche : un robot qui respecte l’interdiction
 * ne charge jamais la page, ne lit donc jamais le `noindex` qu’elle
 * porte, et peut parfaitement indexer l’adresse sur la foi des liens
 * qui pointent vers elle — sans résumé, puisqu’il n’a rien pu lire.
 * Le `follow` subirait le même sort : on ne suit pas les liens d’une
 * page qu’on n’a pas chargée.
 *
 * Une seule des deux consignes peut s’appliquer. On garde celle qui
 * fait ce qu’on veut : le `noindex` de la page. `scripts/liens.mjs`
 * refuse désormais tout `Disallow` posé sur une page en `noindex`.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
