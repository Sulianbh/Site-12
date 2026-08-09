import Link from "next/link";
import { AGENCE, DISTINCTIONS, CONCOURS, EQUIPE } from "@/lib/agence";
import { fil } from "@/lib/navigation";
import { metadonnees, graphe } from "@/lib/seo";
import Frise from "@/components/Frise";
import Equipe from "@/components/Equipe";
import Chiffres from "@/components/Chiffres";
import FilDAriane from "@/components/FilDAriane";
import AppelRdv from "@/components/AppelRdv";
import DonneesStructurees from "@/components/DonneesStructurees";

const MAILLONS = fil({ nom: "Agence", url: "/agence" });

export const metadata = metadonnees({
  titre: "Agence",
  description:
    "PASUPA, neuf personnes à Paris depuis 2011 : le parcours année par année, l’équipe, les concours remportés comme perdus, et les distinctions reçues.",
  chemin: "/agence",
});

export default function PageAgence() {
  const gagnes = CONCOURS.filter((c) => c.gagne).length;

  return (
    <>
      <DonneesStructurees json={graphe(MAILLONS)} />

      {/* ------------------------------------------------------ titre */}
      <div className="cadre pb-14 pt-8 md:pb-20">
        <FilDAriane maillons={MAILLONS} />

        <h1 className="titre titre-1 mt-8 max-w-[15ch] text-balance">
          Neuf personnes, une seule adresse
        </h1>

        {/*
          Le texte prend toute la largeur plutôt que de laisser un tiers
          de page vide à droite. Il ne devient pas illisible pour autant :
          au-delà de 1024 px il se divise en deux colonnes, ce qui ramène
          chaque ligne à une soixantaine de caractères.
        */}
        <div className="mt-8 text-gris lg:columns-2 lg:gap-14 [&>p]:mb-5 [&>p]:leading-relaxed">
          <p className="chapo text-encre">
            PASUPA a été fondée en 2011 par Claire Vasseur et Nicolas Berteau,
            rue du Buisson-Saint-Louis, dans le 10<sup>e</sup>{" "}
            arrondissement de Paris. L’agence n’a jamais déménagé.
          </p>
          <p>
            Elle compte neuf personnes : quatre architectes, une économiste de
            la construction, un poste de dessin et de documents
            d’exécution, trois à l’administration des marchés. Ce
            format a été atteint en 2021 et n’a pas bougé depuis. Il
            correspond au nombre de projets que deux associés peuvent suivre
            en tenant une visite de chantier hebdomadaire sur chacun, sans
            déléguer ni le dessin de détail ni la réception.
          </p>
          <p>
            Vingt-sept des quarante-et-un bâtiments livrés sont des
            réhabilitations. Ce n’est pas une préférence de style : c’est
            ce que l’Île-de-France demande, et c’est aussi ce qui
            oblige à relever avant de dessiner. Nos plans distinguent toujours,
            au trait, ce qui existait de ce que nous avons ajouté — la
            convention est la même sur les six planches publiées dans ce site.
          </p>
          <p>
            L’agence est inscrite au tableau de l’Ordre des
            architectes d’Île-de-France sous le n° S 14 782 et intervient
            dans un rayon de soixante kilomètres :{" "}
            {AGENCE.zone.join(", ")}. Au-delà, nous adressons la demande à un
            confrère installé sur place.
          </p>
        </div>
      </div>

      {/* ----------------------------------------------------- frise */}
      <section
        aria-labelledby="parcours"
        className="cadre filet-haut py-14 md:py-20"
      >
        <div className="mb-10 md:mb-14">
          <p className="mention">Parcours</p>
          <h2
            id="parcours"
            className="titre titre-2 mt-4 max-w-[20ch] text-balance"
          >
            De deux personnes à neuf, en quinze ans
          </h2>
        </div>
        <Frise />
      </section>

      {/* --------------------------------------------------- chiffres */}
      <section
        aria-labelledby="agence-chiffres"
        data-observe
        className="cadre filet-haut py-14 md:py-20"
      >
        <h2 id="agence-chiffres" className="mention paraitre">
          En chiffres
        </h2>
        <div className="mt-10">
          <Chiffres />
        </div>
      </section>

      {/* ---------------------------------------------------- équipe */}
      <section
        aria-labelledby="equipe"
        className="cadre filet-haut py-14 md:py-20"
      >
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <p className="mention">Équipe</p>
            <h2
              id="equipe"
              className="titre titre-2 mt-4 max-w-[14ch] text-balance"
            >
              Les neuf
            </h2>
            <p className="mt-5 max-w-[38ch] text-sm leading-relaxed text-gris">
              Les ronds restent blancs : les personnes de cette agence sont
              fictives, et une photographie empruntée ailleurs le serait
              moins qu’un vide assumé.
            </p>
          </div>
          <div className="lg:col-span-8">
            <Equipe />
            <p className="mention mt-8 text-gris">
              {EQUIPE.length} personnes · {AGENCE.ordre}
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- prix */}
      <section
        aria-labelledby="distinctions"
        data-observe
        className="cadre filet-haut py-14 md:py-20"
      >
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="paraitre lg:col-span-4">
            <p className="mention">Distinctions</p>
            <h2
              id="distinctions"
              className="titre titre-2 mt-4 max-w-[14ch] text-balance"
            >
              Cinq prix
            </h2>
          </div>

          <ul
            className="paraitre lg:col-span-8"
            style={{ "--rang": 1 } as React.CSSProperties}
          >
            {DISTINCTIONS.map((d, i) => (
              <li
                key={`${d.annee}-${d.intitule}`}
                className={`grid gap-x-8 gap-y-2 py-5 sm:grid-cols-[5rem_1fr] ${
                  i < DISTINCTIONS.length - 1 ? "filet-bas" : ""
                }`}
              >
                <p className="mention pt-1">{d.annee}</p>
                <div>
                  <p className="titre-4">{d.intitule}</p>
                  <p className="mt-1 text-sm text-brun">{d.rang}</p>
                  {d.projet && d.projetSlug && (
                    <p className="mt-1 text-sm text-gris">
                      <Link
                        href={`/projets/${d.projetSlug}`}
                        className="lien lien-cible"
                      >
                        {d.projet}
                      </Link>
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --------------------------------------------------- concours */}
      <section
        aria-labelledby="concours"
        data-observe
        className="cadre filet-haut py-14 md:py-20"
      >
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="paraitre lg:col-span-4">
            <p className="mention">Concours</p>
            <h2
              id="concours"
              className="titre titre-2 mt-4 max-w-[16ch] text-balance"
            >
              Cinq consultations, {gagnes} remportées
            </h2>
            <p className="mt-5 max-w-[38ch] text-sm leading-relaxed text-gris">
              Les deux que nous avons perdues figurent ici avec les autres,
              et la raison est dite. Une liste de concours dont tous seraient
              gagnés ne renseignerait sur rien.
            </p>
          </div>

          <ul
            className="paraitre lg:col-span-8"
            style={{ "--rang": 1 } as React.CSSProperties}
          >
            {CONCOURS.map((c, i) => (
              <li
                key={`${c.annee}-${c.intitule}`}
                className={`grid gap-x-8 gap-y-2 py-5 sm:grid-cols-[5rem_1fr] ${
                  i < CONCOURS.length - 1 ? "filet-bas" : ""
                }`}
              >
                <p className="mention pt-1">{c.annee}</p>
                <div>
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <p className="titre-4">{c.intitule}</p>
                    <p
                      className={`mention ${
                        c.gagne ? "text-brun" : "text-gris"
                      }`}
                    >
                      {c.issue}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-gris">
                    {c.maitreOuvrage} — {c.programme}
                  </p>
                  <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-gris">
                    {c.note}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <AppelRdv texte="L’un des deux associés vient, et c’est lui qui suivra le chantier s’il y en a un. La façon de travailler décrite sur cette page commence à ce rendez-vous, pas à la signature." />
    </>
  );
}
