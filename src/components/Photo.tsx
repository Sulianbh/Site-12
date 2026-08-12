import {
  type Photo,
  jeuDeSources,
  source,
  rapport,
  estPortrait,
} from "@/lib/photos";

/**
 * Une photographie d’opération, dans son cadre.
 *
 * Le cadre fait partie du composant, et ce n’est pas un détail
 * d’organisation. Tant qu’il vivait chez l’appelant, chaque page devait
 * penser à lui donner le rapport du fichier — et la page qui l’oubliait
 * n’affichait rien de cassé : elle affichait une photographie rognée,
 * ce qui ne se remarque qu’en connaissant l’original. Le cadre est donc
 * ici, avec la seule mesure qui empêche le rognage.
 *
 * Un `<img>` simple, pas `next/image` : les fichiers sont déjà produits
 * aux trois largeurs utiles par `magick`, et le site n’a aucune
 * dépendance d’exécution en dehors de next, react et react-dom — on ne
 * va pas introduire un service d’optimisation d’images pour vingt-huit
 * fichiers qui ne changeront plus.
 *
 * Trois largeurs sont proposées — 500, 900 et 1600 px — et c’est
 * `sizes` qui décide laquelle est prise.
 *
 * `sizes` n’est pas décoratif. Sans lui, le navigateur suppose que
 * l’image occupe toute la largeur de la fenêtre et choisit
 * systématiquement le fichier de 1600 px, y compris pour une vignette
 * de carte qui n’en fait que 300. La valeur passée décrit la place
 * réelle, et c’est elle qui décide du fichier téléchargé.
 *
 * Le décalage cumulé reste nul : le cadre porte le rapport, donc la
 * place est réservée avant que le fichier n’arrive. Ce qui change, par
 * rapport au 4/3 imposé, c’est que la place réservée est la bonne.
 */
export default function Photographie({
  slug,
  photo,
  sizes,
  prioritaire = false,
  classe,
  rang,
}: {
  slug: string;
  photo: Photo;
  /** La largeur d’affichage réelle, en syntaxe `sizes`. */
  sizes: string;
  /** Vrai pour la seule image visible d’emblée : elle n’est pas différée. */
  prioritaire?: boolean;
  /** Classes ajoutées au cadre — c’est lui, l’élément de mise en page. */
  classe?: string;
  /** Le cran de décalage de l’apparition, quand le cadre porte `paraitre`. */
  rang?: number;
}) {
  return (
    <div
      className={[
        "cadre-photo",
        estPortrait(photo) ? "cadre-photo-portrait" : "",
        classe ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          "--rapport": rapport(photo),
          ...(rang !== undefined ? { "--rang": rang } : {}),
        } as React.CSSProperties
      }
    >
      {/* La règle `no-img-element` pousse vers `next/image`. On la lève ici
          en connaissance de cause : `next/image` optimise à la demande, ce
          qui suppose un service d’images à l’exécution. Les vingt-huit
          fichiers de ce site sont produits une fois pour toutes aux trois
          largeurs utiles, ne changeront plus, et le `srcSet` ci-dessous
          fait exactement le travail que la règle réclame. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={source(slug, photo)}
        srcSet={jeuDeSources(slug, photo)}
        sizes={sizes}
        alt={photo.texte}
        width={photo.largeur}
        height={photo.hauteur}
        /* Différé partout sauf sur la première image de la page : une
           image différée qui est déjà à l’écran arrive plus tard que si on
           ne l’avait pas différée, et c’est elle qui porte le LCP. */
        loading={prioritaire ? "eager" : "lazy"}
        fetchPriority={prioritaire ? "high" : undefined}
        decoding="async"
      />
    </div>
  );
}
