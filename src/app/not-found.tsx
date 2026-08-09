import Link from "next/link";
import { MENU } from "@/lib/navigation";

/**
 * `alternates: { canonical: null }` annule la canonique héritée de la
 * mise en page racine, qui vaut « / ». Sans cette ligne, toute adresse
 * inexistante du domaine déclare que sa version canonique est la page
 * d’accueil : le moteur cesse alors de la traiter comme une erreur et
 * la range parmi les doublons de l’accueil, ce qui contredit
 * frontalement le `noindex` posé juste en dessous. Deux consignes qui
 * se contredisent, c’est le moteur qui tranche — et jamais dans le sens
 * qu’on voulait. Trouvé en ajoutant la 404 à `scripts/audit.mjs`, qui
 * ne la regardait pas.
 */
export const metadata = {
  title: "Page introuvable",
  alternates: { canonical: null },
  /* Sans description propre, la page hériterait de celle de l’accueil et
     deux adresses porteraient le même résumé. */
  description:
    "L’adresse demandée n’existe pas sur le site de PASUPA. Les quatre pages du site sont listées ici.",
  robots: { index: false, follow: false },
};

export default function Introuvable() {
  return (
    <div className="cadre py-24 md:py-36">
      <p className="mention">Erreur 404</p>
      <h1 className="titre titre-1 mt-6 max-w-[18ch] text-balance">
        Cette page n’existe pas
      </h1>
      <p className="chapo mt-6 max-w-[44ch] text-gris">
        L’adresse demandée ne correspond à rien sur ce site. Voici les
        quatre pages qui existent.
      </p>

      <ul className="mt-12 max-w-[38rem]">
        {MENU.map((e, i) => (
          <li key={e.href} className={i > 0 ? "filet-haut" : ""}>
            <Link
              href={e.href}
              className="flex items-baseline justify-between gap-6 py-5"
            >
              <span className="titre titre-3 lien">{e.libelle}</span>
              <span className="mention max-w-[22ch] text-right">
                {e.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
