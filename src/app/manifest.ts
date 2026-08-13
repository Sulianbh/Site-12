import type { MetadataRoute } from "next";
import { AGENCE } from "@/lib/agence";

/*
 * `output: "export"` exige que toute route se déclare calculable une
 * fois pour toutes : sans cette ligne, la construction s’arrête ici.
 */
export const dynamic = "force-static";

/**
 * Le manifeste de l’application web.
 *
 * Il manquait, et son absence n’était écrite nulle part — c’est la
 * raison de ce fichier autant que le manifeste lui-même. Sans lui, un
 * visiteur qui ajoute le site à son écran d’accueil obtient une vignette
 * au nom tronqué, sans couleur de barre et sans mode d’affichage
 * déclaré.
 *
 * `display: "browser"` et non `"standalone"`, délibérément. Un site
 * d’agence n’est pas une application : lui retirer la barre d’adresse
 * priverait le visiteur du bouton « précédent », du partage et de
 * l’adresse elle-même, sans rien lui rendre en échange. Le manifeste
 * sert ici à nommer et à colorer, pas à déguiser.
 *
 * Les icônes sont celles que Next produit déjà — `icon.svg` pour le
 * navigateur, `apple-icon` pour iOS. Le chemin est préfixé à la main :
 * `basePath` ne touche pas aux chaînes qu’on écrit soi-même, et un
 * manifeste qui désigne des icônes absentes est pire qu’un manifeste
 * sans icône, parce qu’il se croit complet.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: AGENCE.nomLong,
    short_name: AGENCE.nom,
    description: `${AGENCE.these} ${AGENCE.sousThese}`,
    lang: "fr-FR",
    dir: "ltr",
    start_url: `${BASE}/`,
    scope: `${BASE}/`,
    display: "browser",
    background_color: "#ffffff",
    /* La même valeur que `viewport.themeColor` de la mise en page
       racine : deux déclarations de la couleur de barre qui divergent
       donneraient deux barres différentes selon le point d’entrée. */
    theme_color: "#dcc6a8",
    icons: [
      {
        src: `${BASE}/icon.svg`,
        type: "image/svg+xml",
        sizes: "any",
        purpose: "any",
      },
    ],
  };
}
