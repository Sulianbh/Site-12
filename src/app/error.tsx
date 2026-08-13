"use client";

import Link from "next/link";
import { AGENCE } from "@/lib/agence";
import { MENU } from "@/lib/navigation";

/**
 * Ce qui s’affiche quand une page casse en cours d’exécution.
 *
 * Sans ce fichier, Next sert son écran d’erreur par défaut : anglais,
 * sans police, sans réglette, sans pied de page, et sans autre issue
 * que le bouton « précédent ». Sur un site par ailleurs fini, c’est la
 * seule page qui ne ressemble pas au site — et c’est celle qu’on voit
 * au pire moment.
 *
 * Elle vit *dans* la mise en page : la réglette, le bandeau et le pied
 * de page restent en place, donc la navigation reste disponible. C’est
 * la différence entre une panne et une impasse.
 *
 * Il n’y a délibérément pas de `global-error.tsx`. Celui-là ne sert que
 * si la mise en page racine elle-même échoue, et il doit alors réémettre
 * ses propres `<html>` et `<body>` — donc sans les polices, sans la
 * feuille de style, sans rien. Pour dix-neuf routes statiques dont la
 * racine ne fait que composer trois composants, le cas ne se présente
 * pas ; et un écran de secours qu’on ne peut pas éprouver est un écran
 * dont on ne sait rien.
 */
export default function Erreur({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="cadre py-24 md:py-32">
      <p className="mention">Erreur</p>
      <h1 className="titre titre-1 mt-6 max-w-[18ch] text-balance">
        Cette page n’a pas pu s’afficher
      </h1>
      <p className="chapo mt-6 max-w-[46ch] text-gris">
        Quelque chose a échoué de notre côté, pas du vôtre. Réessayer suffit
        le plus souvent ; sinon, le reste du site fonctionne.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <button type="button" onClick={reset} className="bouton">
          Réessayer
        </button>
        <Link href="/" className="bouton bouton-creux">
          Revenir à l’accueil
        </Link>
      </div>

      {/* Le condensé est le seul identifiant qui relie ce qu’a vu le
          visiteur à ce qu’a journalisé le serveur. Il n’a de sens que
          s’il est affiché ; le message d’erreur, lui, ne regarde
          personne d’autre que nous. */}
      {error.digest && (
        <p className="mention mt-8 text-gris">
          Référence de l’incident : {error.digest}
        </p>
      )}

      <div className="mt-16 border-t border-filet pt-10">
        <h2 className="mention mention-encre">Les pages du site</h2>
        <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-1">
          {MENU.map((e) => (
            <li key={e.href}>
              <Link href={e.href} className="lien lien-cible">
                {e.libelle}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm leading-relaxed text-gris">
          Si cela se reproduit, le téléphone reste le moyen le plus court :{" "}
          <a className="lien text-encre" href={`tel:${AGENCE.telephoneE164}`}>
            {AGENCE.telephone}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
