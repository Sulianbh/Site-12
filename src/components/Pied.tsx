import Link from "next/link";
import { AGENCE, DERNIERE_MISE_A_JOUR } from "@/lib/agence";
import { MENU, PIED } from "@/lib/navigation";

/**
 * Le pied de page, identique sur les six pages : l’adresse, le
 * téléphone, le courriel, les horaires de visite, et la navigation en
 * entier.
 *
 * C’est le contrepoids de l’en-tête : puisque la barre du haut ne porte
 * que quatre entrées et un bouton, tout ce qu’on peut vouloir chercher
 * en fin de lecture se trouve ici, sans avoir à remonter.
 */
export default function Pied() {
  const annee = DERNIERE_MISE_A_JOUR.slice(0, 4);

  return (
    <footer className="sur-brun mt-auto bg-brun-pied">
      <div className="cadre py-14 md:py-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* ------------------------------------------------ l’agence */}
          <div className="lg:col-span-1">
            <p className="titre point text-[1.3rem] tracking-[0.02em]">
              {AGENCE.nom}
            </p>
            <p className="mention mt-1">architectes</p>
            <p className="mt-5 max-w-[22ch] text-sm leading-relaxed text-gris">
              {AGENCE.these} {AGENCE.sousThese}
            </p>
          </div>

          {/* ------------------------------------------------- adresse */}
          <div>
            <h2 className="mention mention-encre">Adresse</h2>
            <address className="mt-4 text-sm not-italic leading-relaxed">
              {AGENCE.adresse.rue}
              <br />
              {AGENCE.adresse.codePostal} {AGENCE.adresse.ville}
              <br />
              {AGENCE.adresse.pays}
            </address>
            <p className="mt-3 text-sm leading-relaxed">
              <a className="lien lien-cible" href={`tel:${AGENCE.telephoneE164}`}>
                {AGENCE.telephone}
              </a>
              <br />
              <a className="lien lien-cible" href={`mailto:${AGENCE.courriel}`}>
                {AGENCE.courriel}
              </a>
            </p>
          </div>

          {/* ------------------------------------------------ horaires */}
          <div>
            <h2 className="mention mention-encre">Horaires</h2>
            <p className="mt-4 text-sm leading-relaxed">{AGENCE.horaires}</p>
            <p className="mt-3 text-sm leading-relaxed text-gris">
              {AGENCE.visite}
            </p>
            <Link
              href="/contact#rendez-vous"
              className="lien lien-cible mt-3 text-sm font-semibold"
            >
              Prendre rendez-vous
            </Link>
          </div>

          {/* ---------------------------------------------- navigation */}
          <nav aria-label="Navigation de pied de page">
            <h2 className="mention mention-encre">Navigation</h2>
            <ul className="mt-3 text-sm">
              {MENU.map((e) => (
                <li key={e.href}>
                  <Link href={e.href} className="lien lien-cible">
                    {e.libelle}
                  </Link>
                </li>
              ))}
              {PIED.map((e) => (
                <li key={e.href}>
                  <Link href={e.href} className="lien lien-cible text-gris">
                    {e.libelle}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-filet-fort pt-6 text-xs leading-relaxed text-gris md:flex-row md:items-baseline md:justify-between">
          <p>
            © {annee} {AGENCE.nomLong}. {AGENCE.ordre}.
          </p>
          {/* Sur une feuille posée sur une table, plus rien ne dit d’où
              elle vient : cette ligne ne s’imprime que là. */}
          <p className="impression-seule">
            www.pasupa.fr · {AGENCE.telephone} · {AGENCE.courriel}
          </p>
          <p>
            Site de démonstration — agence, projets et personnes entièrement
            fictifs.
          </p>
        </div>
      </div>
    </footer>
  );
}
