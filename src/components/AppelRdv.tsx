import Link from "next/link";
import { AGENCE } from "@/lib/agence";

/**
 * Le grand appel au rendez-vous, en fin de page.
 *
 * Il dit ce qui se passe si l’on clique — deux heures, sur place, sans
 * frais, une note sous huit jours — parce qu’un bouton qui ne promet
 * rien de précis ne se clique pas. C’est le seul endroit du site où la
 * typographie monte aussi haut : la dernière chose lue doit être la
 * seule chose à faire.
 */
export default function AppelRdv({
  titre = "Le premier rendez-vous se tient sur place.",
  texte,
}: {
  titre?: string;
  /**
   * Le corps de l’appel. Il varie d’une page à l’autre, et c’est le
   * seul endroit du site où il le fallait : ce bloc apparaît sur neuf
   * routes, et le même paragraphe de quarante mots répété neuf fois se
   * lit comme un encart publicitaire — exactement ce qu’on ne veut pas
   * sur un site dont l’argument est que tout y est écrit pour l’endroit
   * où il se trouve. Seule la phrase du milieu change ; les deux
   * promesses qui l’encadrent, elles, sont les mêmes partout, parce que
   * ce sont des engagements et non de la rédaction.
   */
  texte?: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby="appel-rdv"
      data-observe
      className="filet-haut bg-creme"
    >
      <div className="cadre py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <p className="mention paraitre">Prendre rendez-vous</p>
            <h2
              id="appel-rdv"
              className="titre titre-2 paraitre mt-5 max-w-[16ch] text-balance"
              style={{ "--rang": 1 } as React.CSSProperties}
            >
              {titre}
            </h2>
            <p
              className="chapo paraitre mesure mt-6 text-gris"
              style={{ "--rang": 2 } as React.CSSProperties}
            >
              Deux heures, deux personnes, sans frais.{" "}
              {texte ?? (
                <>
                  Nous relevons l’orientation, les vues, les accès et les
                  servitudes visibles, nous lisons le règlement d’urbanisme,
                  et nous donnons le jour même un ordre de grandeur du budget
                  de travaux.
                </>
              )}{" "}
              Vous recevez une note de deux pages sous huit jours.
            </p>
            <div
              className="paraitre mt-9 flex flex-wrap items-center gap-4"
              style={{ "--rang": 3 } as React.CSSProperties}
            >
              <Link href="/contact#rendez-vous" className="bouton">
                Demander un rendez-vous
              </Link>
              <a
                href={`tel:${AGENCE.telephoneE164}`}
                className="bouton bouton-creux"
              >
                {AGENCE.telephone}
              </a>
            </div>
          </div>

          <div
            className="paraitre lg:col-span-4 lg:col-start-9"
            style={{ "--rang": 2 } as React.CSSProperties}
          >
            <dl className="space-y-6 text-sm leading-relaxed">
              <div>
                <dt className="mention">L’agence</dt>
                <dd className="mt-2">
                  {AGENCE.adresse.rue}
                  <br />
                  {AGENCE.adresse.codePostal} {AGENCE.adresse.ville}
                </dd>
              </div>
              <div>
                <dt className="mention">Horaires</dt>
                <dd className="mt-2">
                  {AGENCE.horaires}
                  <br />
                  <span className="text-gris">{AGENCE.visite}</span>
                </dd>
              </div>
              <div>
                <dt className="mention">Secteur</dt>
                <dd className="mt-2 text-gris">
                  {AGENCE.zone.join(", ")} — 60 km autour de l’agence.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
