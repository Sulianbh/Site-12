import { AGENCE, HONORAIRES, QUESTIONS } from "@/lib/agence";
import { fil } from "@/lib/navigation";
import { metadonnees, graphe, grapheQuestions } from "@/lib/seo";
import Formulaire from "@/components/Formulaire";
import Questions from "@/components/Questions";
import FilDAriane from "@/components/FilDAriane";
import DonneesStructurees from "@/components/DonneesStructurees";

const MAILLONS = fil({ nom: "Contact", url: "/contact" });

export const metadata = metadonnees({
  titre: "Contact",
  description:
    "Prendre rendez-vous avec PASUPA, architectes à Paris 10e. Honoraires publiés, première visite sur place sans frais, et les dix questions qu’on nous pose au téléphone.",
  chemin: "/contact",
});

export default function PageContact() {
  return (
    <>
      <DonneesStructurees json={graphe(MAILLONS, grapheQuestions())} />

      {/* ------------------------------------------------------ titre */}
      <div className="cadre pb-12 pt-8 md:pb-16">
        <FilDAriane maillons={MAILLONS} />

        <h1 className="titre titre-1 mt-8 max-w-[16ch] text-balance">
          Parlons-en sur place
        </h1>
        <p className="chapo mt-6 max-w-[50ch] text-gris">
          Le premier rendez-vous se tient sur le terrain, pas au bureau. Deux
          heures, deux personnes, sans frais — et une note de deux pages sous
          huit jours, que la suite se fasse avec nous ou non.
        </p>
      </div>

      {/* ------------------------------------------- formulaire + infos */}
      <section
        id="rendez-vous"
        aria-labelledby="demande"
        data-observe
        className="cadre filet-haut py-14 md:py-16"
      >
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="paraitre lg:col-span-7">
            <h2 id="demande" className="mention">
              Demander un rendez-vous
            </h2>
            <div className="mt-8">
              <Formulaire />
            </div>
          </div>

          <div
            className="paraitre lg:col-span-4 lg:col-start-9"
            style={{ "--rang": 1 } as React.CSSProperties}
          >
            {/*
              Pas de `h-full` ici, contrairement à la fiche technique d’un
              projet : le cartouche porte deux fois moins de contenu que le
              formulaire, et l’étirer ouvrait cent pixels de vide encadré
              sous la dernière ligne. Un blanc dans la page se lit comme de
              la respiration ; le même blanc dans un cadre se lit comme un
              oubli.
            */}
            <div className="flex flex-col border border-filet-fort bg-creme p-6 md:p-8">
              <h2 className="mention mention-encre">Coordonnées</h2>

              <dl className="mt-6 space-y-5 text-[0.95rem] leading-relaxed">
                <div>
                  <dt className="mention">Adresse</dt>
                  <dd className="mt-1.5">
                    <address className="not-italic">
                      {AGENCE.adresse.rue}
                      <br />
                      {AGENCE.adresse.codePostal} {AGENCE.adresse.ville}
                    </address>
                  </dd>
                </div>
                <div>
                  <dt className="mention">Téléphone</dt>
                  <dd className="mt-0.5">
                    <a
                      className="lien lien-cible"
                      href={`tel:${AGENCE.telephoneE164}`}
                    >
                      {AGENCE.telephone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="mention">Courriel</dt>
                  <dd className="mt-0.5">
                    <a
                      className="lien lien-cible"
                      href={`mailto:${AGENCE.courriel}`}
                    >
                      {AGENCE.courriel}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="mention">Horaires</dt>
                  <dd className="mt-1.5">
                    {AGENCE.horaires}
                    <br />
                    <span className="text-gris">{AGENCE.visite}</span>
                  </dd>
                </div>
                <div>
                  <dt className="mention">Secteur d’intervention</dt>
                  <dd className="mt-1.5 text-gris">
                    {AGENCE.zone.join(", ")} — 60 km autour de l’agence.
                  </dd>
                </div>
              </dl>

              <p className="mt-6 border-t border-filet-fort pt-5 text-sm leading-relaxed text-gris">
                {AGENCE.ordre}.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- honoraires */}
      <section
        aria-labelledby="honoraires"
        data-observe
        className="cadre filet-haut py-14 md:py-16"
      >
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="paraitre lg:col-span-4">
            <p className="mention">Honoraires</p>
            <h2
              id="honoraires"
              className="titre titre-2 mt-4 max-w-[16ch] text-balance"
            >
              Nos prix sont écrits
            </h2>
            <p className="mt-5 max-w-[38ch] text-sm leading-relaxed text-gris">
              C’est la première question qu’on nous pose au
              téléphone. Elle mérite mieux qu’un « cela dépend ».
            </p>
          </div>

          <div
            className="paraitre lg:col-span-8"
            style={{ "--rang": 1 } as React.CSSProperties}
          >
            <dl>
              {HONORAIRES.map((h, i) => (
                <div
                  key={h.intitule}
                  className={`grid gap-x-8 gap-y-1 py-5 sm:grid-cols-[1fr_auto] ${
                    i < HONORAIRES.length - 1 ? "filet-bas" : ""
                  }`}
                >
                  <dt>
                    <span className="titre-4 block">{h.intitule}</span>
                    <span className="mt-1 block text-sm text-gris">
                      {h.note}
                    </span>
                  </dt>
                  <dd className="titre-4 text-brun sm:text-right">
                    {h.montant}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mention mt-6 text-gris">
              Montants hors taxes · aucune commission perçue sur les
              entreprises
            </p>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- questions */}
      <section
        id="questions"
        aria-labelledby="titre-questions"
        data-observe
        className="cadre filet-haut py-14 md:py-16"
      >
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="paraitre lg:col-span-4">
            <p className="mention">Questions fréquentes</p>
            <h2
              id="titre-questions"
              className="titre titre-2 mt-4 max-w-[16ch] text-balance"
            >
              Les {QUESTIONS.length} questions du téléphone
            </h2>
            <p className="mt-5 max-w-[38ch] text-sm leading-relaxed text-gris">
              Dans l’ordre où on nous les pose. Si la vôtre n’y est
              pas, appelez : nous répondons nous-mêmes.
            </p>
          </div>

          <div
            className="paraitre lg:col-span-8"
            style={{ "--rang": 1 } as React.CSSProperties}
          >
            <Questions />
          </div>
        </div>
      </section>
    </>
  );
}
