import Link from "next/link";
import type { Maillon } from "@/lib/navigation";

/**
 * Le fil d’Ariane, au format d’un chemin de fichier :
 *
 *     Accueil / Projets / Maison de maître
 *
 * Visible parce qu’il dit où l’on est en un coup d’œil ; balisé — le
 * `BreadcrumbList` est émis avec les données structurées de la page —
 * parce que les moteurs l’affichent à la place de l’adresse. Le dernier
 * maillon n’est pas un lien : on y est déjà.
 */
export default function FilDAriane({ maillons }: { maillons: Maillon[] }) {
  return (
    <nav aria-label="Fil d’Ariane">
      <ol className="mention flex flex-wrap items-center gap-x-2 gap-y-1">
        {maillons.map((m, i) => {
          const dernier = i === maillons.length - 1;
          return (
            <li key={m.url} className="flex items-center gap-2">
              {dernier ? (
                <span aria-current="page" className="text-encre">
                  {m.nom}
                </span>
              ) : (
                <Link href={m.url} className="lien lien-cible hover:text-encre">
                  {m.nom}
                </Link>
              )}
              {!dernier && (
                <span aria-hidden="true" className="text-gris">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
