import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  Public_Sans,
  Spline_Sans_Mono,
} from "next/font/google";
import "./globals.css";
import { AGENCE, SITE_URL } from "@/lib/agence";
import Entete from "@/components/Entete";
import Pied from "@/components/Pied";
import Anime from "@/components/Anime";

/*
 * Les trois polices du site 3, reprises telles quelles parce que
 * c’étaient elles qu’on voulait : Bricolage Grotesque pour le titrage,
 * Public Sans pour la lecture, Spline Sans Mono pour les cartouches et
 * les légendes de dessin.
 *
 * `next/font` les télécharge à la construction et les sert depuis notre
 * propre domaine : aucune requête vers Google au chargement, ce que la
 * politique de sécurité (`font-src 'self'`) impose de toute façon.
 */
const bricolage = Bricolage_Grotesque({
  variable: "--police-titre",
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
});

const publicSans = Public_Sans({
  variable: "--police-texte",
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
});

const splineMono = Spline_Sans_Mono({
  variable: "--police-cote",
  subsets: ["latin"],
  weight: "500",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PASUPA — Agence d’architecture à Paris",
    /* Le gabarit ajoute neuf caractères : les titres de page sont
       écrits assez courts pour que le total tienne sous soixante. */
    template: "%s — PASUPA",
  },
  description: `${AGENCE.these} ${AGENCE.sousThese}`,
  applicationName: AGENCE.nomLong,
  authors: [{ name: AGENCE.nomLong }],
  creator: AGENCE.nomLong,
  alternates: { canonical: "/" },
  /*
   * Le `noindex` voyage ici, dans le HTML, en plus de l’en-tête
   * `X-Robots-Tag` que pose `next.config.ts`.
   *
   * Ce n’est pas une redondance oisive : sur GitHub Pages, l’en-tête
   * n’existe pas — l’hébergeur ne sert que des fichiers et n’offre
   * aucun moyen d’en ajouter un. Cette page se déclarait `index: true`,
   * ce qui contredisait l’en-tête et devenait la seule consigne servie
   * une fois l’en-tête disparu : le site aurait été indexable sous
   * `sulianbh.github.io`, qui est un domaine réel. Une agence inventée,
   * avec une adresse, un numéro RCS et un numéro d’inscription à
   * l’Ordre tout aussi inventés, n’a rien à faire dans un moteur de
   * recherche — quelqu’un qui cherche un architecte à Paris n’aurait
   * aucun moyen de savoir que c’est une démonstration.
   *
   * `NEXT_PUBLIC_INDEXABLE=oui` lève les deux d’un coup, le jour où ce
   * gabarit portera le nom d’une agence réelle.
   */
  robots:
    process.env.NEXT_PUBLIC_INDEXABLE === "oui"
      ? { index: true, follow: true }
      : { index: false, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#dcc6a8",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${bricolage.variable} ${publicSans.variable} ${splineMono.variable}`}
    >
      <body className="relative flex min-h-screen flex-col bg-blanc">
        {/* Le dégradé, posé une seule fois pour tout le document : marron
            clair sous l’en-tête, blanc franc au bout de neuf cents
            pixels. Le contenu passe au-dessus grâce à son `z-10`. */}
        <div aria-hidden="true" className="degrade" />

        <a href="#contenu" className="saut">
          Aller au contenu
        </a>

        <Entete />

        {/*
          `tabIndex={-1}` n’ajoute rien à l’ordre de tabulation : il rend
          seulement la cible capable de recevoir le focus. Sans lui, le
          lien d’évitement fait bien défiler la page, mais le focus
          retombe sur le corps du document — et la tabulation suivante
          repart de l’en-tête, c’est-à-dire de ce qu’on venait de sauter.
        */}
        <main id="contenu" tabIndex={-1} className="relative z-10 flex-1 outline-none">
          {children}
        </main>

        <div className="relative z-10 flex flex-col">
          <Pied />
        </div>

        <Anime />
      </body>
    </html>
  );
}
