import Link from "next/link";
import type { Projet } from "@/lib/projets";
import { couvertureDe } from "@/lib/photos";
import Photographie from "./Photo";
import Schema from "./Schema";

/**
 * La carte d’un projet : la photographie, le titre, le mini-texte.
 *
 * Toute la carte est cliquable, mais le lien ne porte que le nom du
 * projet : sa zone sensible est étendue à la carte entière par
 * `.couvre`. Le lecteur d’écran annonce donc « Maison à cour, Montreuil,
 * livré en 2018 » et non le dessin, le titre, la commune et le résumé
 * d’une seule traite.
 *
 * Le nom vit dans un <span> à l’intérieur de l’ancre, et c’est lui qui
 * porte `.lien`. Les deux classes sur l’ancre elle-même se
 * contrariaient : `.lien` la rendait positionnée, le voile de `.couvre`
 * prenait donc l’ancre pour bloc conteneur et se repliait sur les
 * quelques mots du titre. La carte n’était cliquable que sur son nom.
 *
 * Les deux effets de survol demandés se règlent en CSS, dans `.carte` :
 * l’image change de couleur, et le titre voit son trait arriver. Le
 * `:focus-within` déclenche exactement les mêmes — ce que fait la
 * souris, le clavier le fait aussi.
 *
 * La photographie a remplacé la planche dessinée. Le repli sur `Schema`
 * n’est pas décoratif : le jour où l’on ajoute une septième opération
 * sans lui donner de photos, la carte montre son plan plutôt qu’un trou.
 */
export default function CarteProjet({
  projet,
  rang,
}: {
  projet: Projet;
  rang?: number;
}) {
  const couverture = couvertureDe(projet.slug);

  return (
    <article
      className="carte paraitre relative"
      style={
        rang !== undefined
          ? ({ "--rang": rang } as React.CSSProperties)
          : undefined
      }
    >
      {couverture ? (
        <Photographie
          slug={projet.slug}
          photo={couverture}
          /* Deux cartes par ligne au-delà de 48rem, une seule en
             dessous. La colonne de ce site-ci n’a pas de réglette : la
             vignette atteint 550 px là où elle en fait 472 sur le site
             13, et un `30rem` recopié tel quel faisait descendre le
             navigateur d’un cran de trop. */
          sizes="(width >= 78rem) 35rem, (width >= 48rem) 45vw, 92vw"
          classe="cadre-photo-vignette"
        />
      ) : (
        <div className="carte-dessin">
          <Schema slug={projet.slug} />
        </div>
      )}

      <div className="mt-5 flex flex-1 flex-col">
        <p className="mention">
          {projet.annee} · {projet.nature}
        </p>
        <h3 className="titre titre-3 mt-2">
          <Link
            href={`/projets/${projet.slug}`}
            aria-label={`${projet.nom}, ${projet.commune}, livré en ${projet.annee}`}
            className="couvre"
          >
            <span className="carte-titre lien">{projet.nom}</span>
          </Link>
        </h3>
        <p className="mt-1 text-sm text-gris">{projet.commune}</p>
        <p className="mt-3 max-w-[38ch] text-[0.95rem] leading-relaxed text-gris">
          {projet.resume}
        </p>
      </div>
    </article>
  );
}
