import Link from "next/link";
import { PROJETS } from "@/lib/projets";
import { fil } from "@/lib/navigation";
import { metadonnees, graphe, grapheListeProjets } from "@/lib/seo";
import { couvertureDe } from "@/lib/photos";
import Photographie from "@/components/Photo";
import Schema from "@/components/Schema";
import FilDAriane from "@/components/FilDAriane";
import AppelRdv from "@/components/AppelRdv";
import DonneesStructurees from "@/components/DonneesStructurees";

const MAILLONS = fil({ nom: "Projets", url: "/projets" });

export const metadata = metadonnees({
  titre: "Projets",
  description:
    "Six bâtiments livrés en Île-de-France entre 2016 et 2026 : réhabilitations, construction neuve et surélévation. Surfaces, budgets et calendriers réels de chaque opération.",
  chemin: "/projets",
});

export default function PageProjets() {
  return (
    <>
      <DonneesStructurees json={graphe(MAILLONS, grapheListeProjets())} />

      <div className="cadre pb-14 pt-8 md:pb-20">
        <FilDAriane maillons={MAILLONS} />

        <h1 className="titre titre-1 mt-8 max-w-[14ch] text-balance">
          Six bâtiments, dans l’ordre
        </h1>
        <p className="chapo mt-6 max-w-[52ch] text-gris">
          De la première halle réhabilitée en 2016 à la halle de marché livrée
          en mars 2026. Chaque opération est montrée en photographies, et par
          le plan ou la coupe qui la décrit le mieux — plus les chiffres qu’on
          nous demande toujours : la surface, le montant des travaux, la durée
          du chantier.
        </p>
      </div>

      <ul className="cadre">
        {PROJETS.map((p, i) => (
          <li key={p.slug} data-observe className="filet-haut py-16 md:py-24">
            <article className="carte relative grid gap-8 lg:grid-cols-12 lg:gap-12">
              {/* La couverture de l’opération. La première de la page
                  n’est pas différée : c’est elle que le navigateur
                  mesure comme plus grand élément affiché, et la différer
                  la ferait arriver après tout le reste. */}
              {(() => {
                const couverture = couvertureDe(p.slug);
                return couverture ? (
                  <Photographie
                    slug={p.slug}
                    photo={couverture}
                    sizes="(width >= 64rem) 30rem, 92vw"
                    prioritaire={i === 0}
                    classe="paraitre lg:col-span-5"
                    rang={0}
                  />
                ) : (
                  <div
                    className="carte-dessin paraitre lg:col-span-5"
                    style={{ "--rang": 0 } as React.CSSProperties}
                  >
                    <Schema slug={p.slug} />
                  </div>
                );
              })()}

              <div
                className="paraitre flex flex-col lg:col-span-6 lg:col-start-7"
                style={{ "--rang": 1 } as React.CSSProperties}
              >
                <p className="mention">
                  {String(i + 1).padStart(2, "0")} — {p.annee} · {p.nature}
                </p>

                <h2 className="titre titre-2 mt-4">
                  {/* Le nom porte `.lien`, l’ancre porte `.couvre` — et
                      jamais les deux ensemble : `.lien` positionne
                      l’élément, et le voile de `.couvre` prendrait alors
                      l’ancre pour bloc conteneur au lieu de la carte.
                      C’est ce qui rendait « Lire le projet » inerte. */}
                  <Link
                    href={`/projets/${p.slug}`}
                    aria-label={`Lire le projet : ${p.nom}, ${p.commune}, livré en ${p.annee}`}
                    className="couvre"
                  >
                    <span className="carte-titre lien">{p.nom}</span>
                  </Link>
                </h2>
                <p className="mt-2 text-gris">{p.commune}</p>

                {/* Le mini-texte, entre le titre et le reste. */}
                <p className="chapo mt-5 max-w-[46ch] text-balance">
                  {p.accroche}
                </p>

                <dl className="mention mt-8 flex flex-wrap gap-x-8 gap-y-3">
                  {p.fiche
                    .filter((l) =>
                      ["Surface", "Travaux", "Chantier"].includes(l.libelle),
                    )
                    .map((l) => (
                      <div key={l.libelle}>
                        <dt className="text-gris">{l.libelle}</dt>
                        <dd className="mt-1 text-encre">{l.valeur}</dd>
                      </div>
                    ))}
                </dl>

                <p className="mt-9">
                  <span className="mention mention-encre lire">
                    Lire le projet{" "}
                    <span aria-hidden="true" className="fleche fleche-suivant">
                      →
                    </span>
                  </span>
                </p>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <div className="cadre pb-16 pt-4 md:pb-24">
        <p className="mention text-gris">
          Les quarante-et-un bâtiments livrés depuis 2011 ne sont pas tous
          publiés. Nous montrons volontiers les autres, et un chantier en
          cours, au premier rendez-vous.
        </p>
      </div>

      <AppelRdv
        titre="Un projet à nous soumettre ?"
        texte="Les six opérations de cette page ont toutes commencé par cette visite-là. Toutes les visites n’y mènent pas : c’est aussi le moment où nous disons qu’un terrain ne portera pas ce qu’on veut y mettre, ou qu’un budget ne suivra pas."
      />
    </>
  );
}
