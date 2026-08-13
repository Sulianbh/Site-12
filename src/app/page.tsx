import Link from "next/link";
import { AGENCE, REGLES } from "@/lib/agence";
import { PROJETS, PROJETS_ACCUEIL } from "@/lib/projets";
import { fil } from "@/lib/navigation";
import { metadonnees, graphe, grapheListeProjets } from "@/lib/seo";
import CarteProjet from "@/components/CarteProjet";
import Chiffres from "@/components/Chiffres";
import AppelRdv from "@/components/AppelRdv";
import DonneesStructurees from "@/components/DonneesStructurees";

/*
 * L’accueil déclare ses propres métadonnées comme les autres pages.
 * Sans cela il héritait de la mise en page racine, qui ne porte ni
 * Open Graph ni carte Twitter : l’adresse la plus partagée du site était
 * la seule à n’avoir aucun aperçu.
 */
export const metadata = metadonnees({
  titre: "Agence d’architecture à Paris",
  description: `${AGENCE.these} ${AGENCE.sousThese} Réhabilitation, construction neuve et surélévation en Île-de-France, dans un rayon de 60 km.`,
  chemin: "/",
});

export default function Accueil() {
  return (
    <>
      <DonneesStructurees json={graphe(fil(), grapheListeProjets())} />

      {/*
        Le hero tient sur deux colonnes à partir de 1024 px : le titre à
        gauche, la phrase et les boutons à droite, calés sur la même ligne
        de pied. En une seule colonne, le titre — qui ne peut pas dépasser
        seize signes par ligne sans devenir illisible — laissait la moitié
        droite de la page vide sur toute sa hauteur.
      */}
      <section className="cadre pb-20 pt-16 md:pb-28 md:pt-24">
        <p className="mention">
          {AGENCE.metier} à {AGENCE.adresse.ville} — depuis {AGENCE.depuis}
        </p>

        <div className="mt-6 grid gap-y-8 lg:grid-cols-12 lg:items-end lg:gap-x-14">
          <h1 className="titre titre-1 text-balance lg:col-span-7">
            {AGENCE.these}
          </h1>

          <div className="lg:col-span-5 lg:pb-2">
            {/* L’espace après une accolade est mangé dès que le texte qui
                suit passe à la ligne : il faut l’écrire. */}
            <p className="chapo text-gris">
              {AGENCE.sousThese}{" "}
              Nous travaillons dans un rayon de soixante kilomètres, sur
              l’existant le plus souvent, et nous ne prenons pas plus de
              projets que nous ne pouvons en visiter chaque semaine.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/contact#rendez-vous" className="bouton">
                Prendre rendez-vous
              </Link>
              <Link href="/projets" className="bouton bouton-creux">
                Voir les projets
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- projets */}
      <section
        aria-labelledby="projets-recents"
        data-observe
        className="cadre filet-haut py-16 md:py-24"
      >
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <p className="mention paraitre">Projets</p>
            <h2
              id="projets-recents"
              className="titre titre-2 paraitre mt-4 max-w-[18ch] text-balance"
              style={{ "--rang": 1 } as React.CSSProperties}
            >
              Les quatre derniers bâtiments livrés
            </h2>
          </div>
          <Link
            href="/projets"
            className="lien lien-cible paraitre mention mention-encre"
            style={{ "--rang": 2 } as React.CSSProperties}
          >
            Voir tous les projets ({PROJETS.length})
          </Link>
        </div>

        <ul className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2">
          {PROJETS_ACCUEIL.map((p, i) => (
            <li key={p.slug}>
              <CarteProjet projet={p} rang={i % 2} />
            </li>
          ))}
        </ul>

        {/* La légende de la convention de trait a été retirée d’ici.
            Elle explique comment lire une planche — existant conservé,
            déposé, projeté — et il n’y a plus une seule planche sur
            cette page depuis que les cartes portent des photographies :
            quatre photographies, zéro dessin. Une légende sans son objet
            ne se lit pas comme une explication, elle se lit comme une
            erreur. Elle reste sur la page d’un projet, où le dessin est
            toujours là. */}
      </section>

      {/* --------------------------------------------------- chiffres */}
      <section
        aria-labelledby="chiffres"
        data-observe
        className="cadre filet-haut py-16 md:py-24"
      >
        <p className="mention paraitre">En chiffres</p>
        <h2
          id="chiffres"
          className="titre titre-2 paraitre mt-4 max-w-[20ch] text-balance"
          style={{ "--rang": 1 } as React.CSSProperties}
        >
          Ce qu’il y a derrière la signature
        </h2>
        <div className="mt-12">
          <Chiffres />
        </div>
      </section>

      {/* --------------------------------------------------- la façon */}
      <section
        aria-labelledby="facon"
        data-observe
        className="cadre filet-haut py-16 md:py-24"
      >
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="mention paraitre">La façon de faire</p>
            <h2
              id="facon"
              className="titre titre-2 paraitre mt-4 text-balance"
              style={{ "--rang": 1 } as React.CSSProperties}
            >
              Trois règles, tenues depuis 2011
            </h2>
          </div>
          {/* Trois colonnes seulement quand elles ont de quoi respirer :
              entre 640 et 1024 px, elles tombaient à 220 px et le titre
              d’une règle prenait quatre lignes. */}
          <ol className="grid gap-10 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3">
            {REGLES.map((r, i) => (
              <li
                key={r.numero}
                className="paraitre filet-haut pt-5"
                style={{ "--rang": i } as React.CSSProperties}
              >
                <p className="mention">{r.numero}</p>
                <h3 className="titre-4 mt-3 text-balance">{r.titre}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gris">
                  {r.texte}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <AppelRdv />
    </>
  );
}
