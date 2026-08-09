import Link from "next/link";
import { notFound } from "next/navigation";
import { PROJETS, projetParSlug, voisins } from "@/lib/projets";
import { fil } from "@/lib/navigation";
import { metadonnees, graphe, grapheProjet } from "@/lib/seo";
import Schema from "@/components/Schema";
import Matieres from "@/components/Matiere";
import LegendeTrait from "@/components/LegendeTrait";
import FilDAriane from "@/components/FilDAriane";
import AppelRdv from "@/components/AppelRdv";
import DonneesStructurees from "@/components/DonneesStructurees";

export function generateStaticParams() {
  return PROJETS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = projetParSlug(slug);
  if (!p) return {};
  return metadonnees({
    titre: `${p.nom}, ${p.commune}`,
    description: p.accroche,
    chemin: `/projets/${p.slug}`,
  });
}

export default async function PageProjet({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const projet = projetParSlug(slug);
  if (!projet) notFound();

  const { precedent, suivant } = voisins(slug);
  const maillons = fil(
    { nom: "Projets", url: "/projets" },
    { nom: projet.nom, url: `/projets/${projet.slug}` },
  );

  return (
    <>
      <DonneesStructurees json={graphe(maillons, grapheProjet(slug))} />

      {/* ------------------------------------------------------ titre */}
      <div className="cadre pb-12 pt-8">
        <FilDAriane maillons={maillons} />

        <p className="mention mt-8">
          {projet.annee} · {projet.nature} · {projet.commune}
        </p>
        <h1 className="titre titre-1 mt-5 max-w-[16ch] text-balance">
          {projet.nom}
        </h1>

        {/* Le mini-texte explicatif : il vient sous le titre, avant la
            description longue, et doit se suffire à lui-même. */}
        <p className="chapo mt-6 max-w-[52ch] text-balance">
          {projet.accroche}
        </p>
      </div>

      {/* ----------------------------------------------- le document */}
      <div className="cadre" data-observe>
        <figure className="paraitre">
          <div className="plan-net border border-filet-fort bg-creme px-4 py-6 md:px-10 md:py-10">
            <Schema slug={projet.slug} />
          </div>
          <figcaption className="mt-5 max-w-[62ch]">
            <LegendeTrait classe="mb-4" />
            <span className="legende block">{projet.legende}</span>
          </figcaption>
        </figure>
      </div>

      {/*
        La description à gauche, la fiche à droite.

        Les deux colonnes sont deux cellules d’une même ligne de grille :
        l’étirement par défaut leur donne exactement la même hauteur, et
        le cadre de la fiche descend donc jusqu’au bas du récit. C’est ce
        qui les fait s’aligner en haut ET en bas, quelle que soit la
        longueur du texte.

        Reste à savoir laquelle des deux commande cette hauteur. C’était
        la fiche : huit lignes largement espacées faisaient 570 px quand
        le récit en faisait 370, et la colonne de gauche finissait sur
        deux cents pixels de blanc. Or la fiche n’est qu’une liste de
        valeurs, et elle est déjà la plus visible des deux — un cadre
        plein et bordé face à du texte gris. Les lignes ont donc été
        resserrées et le récit monté d’un corps (`.recit`) : la hauteur
        est maintenant commandée par le texte, ce qui est l’ordre juste.
      */}
      <section
        aria-labelledby="le-projet"
        data-observe
        className="cadre filet-haut mt-16 py-14 md:mt-20 md:py-16"
      >
        <div className="grille-fiche grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="paraitre lg:col-span-7">
            <h2 id="le-projet" className="mention">
              Le projet
            </h2>
            <div className="mt-6 space-y-6">
              {projet.description.map((paragraphe) => (
                <p key={paragraphe} className="recit text-gris">
                  {paragraphe}
                </p>
              ))}
            </div>
          </div>

          <div
            className="paraitre lg:col-span-5 lg:col-start-8"
            style={{ "--rang": 1 } as React.CSSProperties}
          >
            <div className="flex h-full flex-col border border-filet-fort bg-creme p-6 md:p-7">
              <h2 className="mention mention-encre">Fiche technique</h2>
              <dl className="mt-5 space-y-0">
                {projet.fiche.map((l, i) => (
                  <div
                    key={l.libelle}
                    className={`ligne-fiche flex flex-wrap justify-between gap-x-6 gap-y-1 py-2.5 ${
                      i > 0 ? "filet-haut" : ""
                    }`}
                  >
                    <dt className="mention">{l.libelle}</dt>
                    <dd className="text-right text-[0.95rem] font-medium">
                      {l.valeur}
                    </dd>
                  </div>
                ))}
              </dl>

              {projet.distinction && (
                <p className="mt-auto border-t border-filet-fort pt-4 text-sm leading-relaxed text-gris">
                  <span className="mention mention-encre block">Distinction</span>
                  <span className="mt-2 block">{projet.distinction}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- matières */}
      <section
        aria-labelledby="matieres"
        data-observe
        className="cadre filet-haut py-14 md:py-16"
      >
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="paraitre lg:col-span-3">
            <h2 id="matieres" className="mention">
              Matières
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-gris">
              Le signe est celui par lequel la matière se représente en
              coupe.
            </p>
          </div>
          <div
            className="paraitre lg:col-span-8 lg:col-start-5"
            style={{ "--rang": 1 } as React.CSSProperties}
          >
            <Matieres cles={projet.matieres} />
          </div>
        </div>
      </section>

      {/* ------------------------------------------- projets voisins */}
      <nav
        aria-label="Navigation entre les projets"
        className="cadre filet-haut py-12 md:py-14"
      >
        {/*
          Chaque bloc est une pile — mention, nom, commune — et chacun
          de ses étages est déclaré `block`. Ils ne l’étaient pas : trois
          <span> dont deux en ligne se rangeaient sur la même ligne, si
          bien que l’année et le nom se touchaient (« · 2016Ateliers de
          la Fonderie ») et que la marge du nom ne s’appliquait pas.
        */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            {precedent ? (
              <Link href={`/projets/${precedent.slug}`} className="voisin">
                <span className="mention mention-encre block">
                  <span aria-hidden="true" className="fleche fleche-precedent">
                    ←
                  </span>{" "}
                  Projet précédent · {precedent.annee}
                </span>
                <span className="titre titre-3 block">{precedent.nom}</span>
                <span className="block text-sm text-gris">
                  {precedent.commune}
                </span>
              </Link>
            ) : (
              <p className="voisin-vide mention text-gris">
                Première opération publiée
              </p>
            )}
          </div>

          <div>
            {suivant ? (
              <Link
                href={`/projets/${suivant.slug}`}
                className="voisin voisin-suivant"
              >
                <span className="mention mention-encre block">
                  Projet suivant · {suivant.annee}{" "}
                  <span aria-hidden="true" className="fleche fleche-suivant">
                    →
                  </span>
                </span>
                <span className="titre titre-3 block">{suivant.nom}</span>
                <span className="block text-sm text-gris">
                  {suivant.commune}
                </span>
              </Link>
            ) : (
              <p className="voisin-vide voisin-suivant mention text-gris">
                Dernière opération livrée
              </p>
            )}
          </div>
        </div>

        <div className="filet-haut mt-12 pt-8">
          <Link href="/projets" className="bouton bouton-creux">
            <span aria-hidden="true">←</span> Revenir à tous les projets
          </Link>
        </div>
      </nav>

      <AppelRdv
        titre="Votre projet ressemble-t-il à celui-là ?"
        texte="C’est là qu’on établit si ce qui a fonctionné sur cette opération peut fonctionner chez vous. L’état de l’existant décide de presque tout, et il ne se lit sur aucun plan : il se relève."
      />
    </>
  );
}
