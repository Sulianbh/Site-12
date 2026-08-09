/**
 * La légende de la convention de dessin.
 *
 * Sans elle, les six planches ne sont que des traits. Elle est répétée
 * partout où un dessin apparaît, parce qu’on n’arrive pas toujours sur
 * un site par sa page d’accueil.
 *
 * Les échantillons sont tracés dans une boîte de 8 de haut pour une
 * ligne posée au milieu : dans une boîte à la hauteur exacte du trait,
 * l’épaisseur déborde d’un demi-pixel de chaque côté et se fait rogner.
 */

function Echantillon({
  couleur,
  epaisseur,
  tirets,
}: {
  couleur: string;
  epaisseur: number;
  tirets?: string;
}) {
  return (
    <svg
      viewBox="0 0 28 8"
      aria-hidden="true"
      focusable="false"
      className="h-2 w-7 shrink-0"
    >
      <path
        d="M0 4 H28"
        stroke={couleur}
        strokeWidth={epaisseur}
        strokeDasharray={tirets}
      />
    </svg>
  );
}

export default function LegendeTrait({ classe = "" }: { classe?: string }) {
  return (
    <p className={`mention flex flex-wrap items-center gap-x-7 gap-y-3 ${classe}`}>
      <span className="flex items-center gap-2.5">
        <Echantillon couleur="var(--trait-existant)" epaisseur={1.6} />
        existant conservé
      </span>
      <span className="flex items-center gap-2.5">
        <Echantillon couleur="var(--trait-existant)" epaisseur={1.6} tirets="4 3" />
        déposé
      </span>
      <span className="flex items-center gap-2.5">
        <Echantillon couleur="var(--trait-projete)" epaisseur={3} />
        projeté
      </span>
    </p>
  );
}
