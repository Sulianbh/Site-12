import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Deux en-têtes ci-dessous n'ont de sens qu'une fois le site réellement
 * servi en HTTPS, et le cassent activement sinon. Ils sont donc liés à
 * une origine `https://` explicitement déclarée, et non au mode de
 * construction — `next start` tourne en mode production sur du simple
 * http en local.
 *
 * `upgrade-insecure-requests` est le dangereux : la spécification CSP
 * exempte `localhost` de la réécriture, Chromium respecte l'exemption,
 * WebKit non. Safari réécrirait donc `http://localhost:PORT` en `https`
 * et tomberait sur un port mort. La même chose se produirait sur
 * n'importe quel hébergement de préproduction en http simple. HSTS,
 * lui, est seulement sans effet en http — les navigateurs l'ignorent —
 * mais il relève de la même condition.
 */
const httpsOrigin = (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith(
  "https://",
);

/**
 * Le site est une démonstration : l'agence, ses associés, ses six
 * opérations, son adresse, son numéro d'ordre et son numéro RCS sont
 * inventés de bout en bout. Une page pareille n'a rien à faire dans un
 * index de recherche — personne ne doit tomber dessus en cherchant un
 * architecte en Île-de-France.
 *
 * L'interdiction passe par un en-tête et non par un `Disallow` de
 * `robots.txt`, pour la raison déjà exposée dans `src/app/robots.ts` :
 * un robot qui respecte l'interdiction ne charge jamais la page, ne lit
 * donc jamais la consigne qu'elle porte, et peut parfaitement indexer
 * l'adresse sur la foi des liens qui la désignent. Des deux, seule
 * celle que le robot peut lire fait ce qu'on attend d'elle.
 *
 * Poser `NEXT_PUBLIC_INDEXABLE=oui` à la construction lève
 * l'interdiction. C'est ce qu'il faudra faire le jour où ce gabarit
 * portera le nom d'une agence réelle — et ce jour-là seulement.
 */
const indexable = process.env.NEXT_PUBLIC_INDEXABLE === "oui";

/**
 * Le site ne charge aucun script, style, police, cadre ni requête
 * tiers : toutes les ressources sont de même origine, et la seule
 * imagerie est du SVG écrit dans la page. La politique dit exactement
 * cela, si bien que toute ressource externe injectée est refusée.
 *
 * `'unsafe-inline'` sur les styles est exigé par le CSS critique que
 * Next place dans la page et par les attributs `style` de React. En
 * développement, `'unsafe-eval'` est en plus exigé par React Refresh ;
 * il n'est pas accordé aux constructions de production.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'" + (isDev ? " ws: wss:" : ""),
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(httpsOrigin ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,

  // Appliqués par `next start` et par tout hébergeur Node. Un export
  // purement statique les ignore : il faut alors poser les mêmes valeurs
  // sur le CDN (le fichier `_headers` de Netlify, par exemple). Évalués
  // à la construction : NEXT_PUBLIC_SITE_URL doit être définie pour
  // `next build`, pas pour `next start`.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // `frame-ancestors` ci-dessus le supplante pour les navigateurs
          // récents ; gardé pour les anciens, qui ne comprennent que
          // X-Frame-Options.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          ...(indexable
            ? []
            : [{ key: "X-Robots-Tag", value: "noindex, follow" }]),
          ...(httpsOrigin
            ? [
                {
                  key: "Strict-Transport-Security",
                  // Un an, et sans `preload`. Le `preload` inscrit le
                  // domaine dans une liste compilée à l'intérieur des
                  // navigateurs, dont on ne ressort qu'au bout de
                  // plusieurs mois et plusieurs versions : c'est une
                  // décision qui se prend pour un domaine qu'on possède
                  // et qu'on gardera, pas un réglage par défaut sur une
                  // démonstration. Sur un `*.netlify.app` il est de
                  // toute façon sans objet — on ne préinscrit pas un
                  // sous-domaine, et `netlify.app` l'est déjà.
                  value: "max-age=31536000; includeSubDomains",
                },
              ]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
