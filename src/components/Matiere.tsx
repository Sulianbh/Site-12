import { MATIERES, type CleMatiere } from "@/lib/projets";

/**
 * Les matières, avec leur petit dessin.
 *
 * C’est la légende d’une planche : chaque matériau porte le signe par
 * lequel les architectes le représentent en coupe — l’appareil pour la
 * brique, le grain pour le béton, le profil pour l’acier. Le dessin
 * n’illustre pas le mot, il le désigne.
 *
 * Chaque signe tient dans un carré de 32, en trait seul, pour rester
 * lisible à seize pixels comme à quarante.
 */

const SIGNES: Record<CleMatiere, React.ReactNode> = {
  meuliere: (
    <>
      <path d="M3 9 h8 l3 5 -4 5 h-7 l-2 -5Z M14 5 h9 l4 6 -3 5 h-9 l-3 -6Z M4 21 h9 l3 6 -2 4 H5 l-3 -5Z M18 18 h10 l2 6 -3 6 h-8 l-3 -5Z" />
    </>
  ),
  brique: (
    <>
      <path d="M2 7 h28 M2 13 h28 M2 19 h28 M2 25 h28" />
      <path d="M11 7 v6 M21 7 v6 M6 13 v6 M16 13 v6 M26 13 v6 M11 19 v6 M21 19 v6" />
    </>
  ),
  bois: (
    <>
      <rect x="3" y="6" width="26" height="20" />
      <path d="M16 16 m-3 0 a3 4 0 1 0 6 0 a3 4 0 1 0 -6 0" />
      <path d="M16 16 m-7 0 a7 8.5 0 1 0 14 0 a7 8.5 0 1 0 -14 0" />
      <path d="M16 16 m-11 0 a11 13 0 1 0 22 0 a11 13 0 1 0 -22 0" />
    </>
  ),
  beton: (
    <>
      <rect x="3" y="6" width="26" height="20" />
      <path d="M8 11 l2 2 -2 2 -2 -2Z M20 10 l2 2 -2 2 -2 -2Z M14 19 l2 2 -2 2 -2 -2Z M24 19 l2 2 -2 2 -2 -2Z" />
      <path d="M13 12 h.6 M17 15 h.6 M9 20 h.6 M22 16 h.6 M19 22 h.6" />
    </>
  ),
  acier: (
    <>
      <path d="M6 5 h20 M6 27 h20 M16 5 v22" />
      <path d="M6 5 v3 M26 5 v3 M6 27 v-3 M26 27 v-3" />
    </>
  ),
  zinc: (
    <>
      <path d="M2 22 h4 v-9 h3 v9 h8 v-9 h3 v9 h8 v-9 h3 v9 h1" />
      <path d="M2 26 h28" />
    </>
  ),
  chaux: (
    <>
      <path d="M3 9 q4 -3 8 0 t8 0 t8 0" />
      <path d="M3 16 q4 -3 8 0 t8 0 t8 0" />
      <path d="M3 23 q4 -3 8 0 t8 0 t8 0" />
    </>
  ),
  verre: (
    <>
      <path d="M8 4 v24 M14 4 v24" />
      <path d="M8 4 h6 M8 28 h6" />
      <path d="M19 8 l8 6 M19 16 l8 6" />
    </>
  ),
  "terre-cuite": (
    <>
      <path d="M9 4 l6 3.5 v7 L9 18 l-6 -3.5 v-7Z" />
      <path d="M23 4 l6 3.5 v7 L23 18 l-6 -3.5 v-7Z" />
      <path d="M16 16.5 l6 3.5 v7 L16 30.5 l-6 -3.5 v-7Z" />
    </>
  ),
  paille: (
    <>
      <rect x="3" y="8" width="26" height="16" rx="1.5" />
      <path d="M3 13 h26 M3 19 h26" />
      <path d="M10 8 v16 M22 8 v16" />
    </>
  ),
};

export function Signe({ cle }: { cle: CleMatiere }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className="h-8 w-8 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {SIGNES[cle]}
    </svg>
  );
}

/**
 * La liste des matières d’un projet. Le nom est en gras, l’emploi juste
 * dessous : on lit d’abord de quoi c’est fait, ensuite où ça se trouve.
 */
export default function Matieres({ cles }: { cles: CleMatiere[] }) {
  return (
    <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
      {cles.map((cle) => {
        const m = MATIERES[cle];
        return (
          <li key={cle} className="flex items-start gap-4">
            <span className="mt-0.5 text-brun">
              <Signe cle={cle} />
            </span>
            <span>
              <span className="titre-4 block">{m.nom}</span>
              <span className="mt-1 block text-sm leading-snug text-gris">
                {m.emploi}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
