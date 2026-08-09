import type { MetadataRoute } from "next";
import { SITE_URL, DERNIERE_MISE_A_JOUR } from "@/lib/agence";
import { MENU } from "@/lib/navigation";
import { PROJETS } from "@/lib/projets";

/**
 * Le plan du site est déduit de la navigation et du tableau des projets :
 * ajouter une page ou une opération suffit à l’y faire figurer, et il ne
 * peut donc pas se désynchroniser. Les mentions légales n’y sont pas —
 * elles portent `noindex`.
 */
export default function sitemap(): MetadataRoute.Sitemap {
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
