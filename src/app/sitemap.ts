import type { MetadataRoute } from "next";
import { SITE_URL, DERNIERE_MISE_A_JOUR } from "@/lib/agence";
import { MENU } from "@/lib/navigation";
import { PROJETS } from "@/lib/projets";

/*
 * `output: "export"` exige que toute route se déclare calculable une
 * fois pour toutes. Ce plan du site l’est — il se déduit de la
 * navigation, du tableau des projets et d’une date écrite en dur.
 */
export const dynamic = "force-static";

/**
 * Le plan du site est déduit de la navigation et du tableau des projets :
 * ajouter une page ou une opération suffit à l’y faire figurer, et il ne
 * peut donc pas se désynchroniser. Les mentions légales n’y sont pas —
 * elles portent `noindex`.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  /*
   * Un plan du site qui liste des pages en « noindex » est une
   * contradiction : le fichier dit « voici ce qu’il faut indexer », les
   * pages disent « ne m’indexez pas ». Un moteur tranche en faveur de
   * la page, et l’on aura publié un fichier dont chaque ligne est
   * démentie.
   *
   * Tant que la démonstration n’est pas indexable, le plan est donc
   * vide. Il reste émis et reste valide : c’est un plan de site qui dit
   * qu’il n’y a rien à moissonner, ce qui est exactement le cas.
   */
  if (process.env.NEXT_PUBLIC_INDEXABLE !== "oui") return [];

  const date = new Date(DERNIERE_MISE_A_JOUR);

  return [
    ...MENU.map((e) => ({
      url: `${SITE_URL}${e.href === "/" ? "/" : e.href}`,
      lastModified: date,
      changeFrequency: "monthly" as const,
      priority: e.href === "/" ? 1 : 0.8,
    })),
    ...PROJETS.map((p) => ({
      url: `${SITE_URL}/projets/${p.slug}`,
      lastModified: date,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
