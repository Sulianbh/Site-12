import { FRISE } from "@/lib/agence";

/**
 * La frise du parcours.
 *
 * Une vraie frise, pas une liste datée : un trait continu court d’une
 * étape à l’autre, chacune y pose son point, et l’espace entre deux
 * points est proportionné au texte, pas au temps écoulé — la frise
 * raconte un ordre, elle ne mesure pas des années.
 *
 * Le trait est découpé en segments portés par chaque étape sauf la
 * dernière : il s’arrête donc exactement au dernier point, sans jamais
 * dépendre de la hauteur totale du bloc, qui change avec la longueur des
 * textes et la largeur de la fenêtre.
 *
 * Les dates sont dans la colonne de gauche, en grand corps tabulaire :
 * 2011 et 2026 s’alignent alors au chiffre près. Sous 768 px la date
 * repasse au-dessus du texte — une colonne de dates de cette taille ne
 * laisserait plus que dix caractères par ligne au récit.
 */
export default function Frise() {
  const dernier = FRISE.length - 1;

  return (
    <ol>
      {FRISE.map((e, i) => (
        <li
          key={e.annee}
          data-observe
          className="relative grid gap-x-8 gap-y-3 py-9 pl-8 md:grid-cols-[7.5rem_1fr] md:pl-0 lg:grid-cols-[9.5rem_1fr] lg:gap-x-12"
        >
          {/* Le point de l’étape, et le segment de trait qui descend vers
              la suivante. Les deux sont calés sur la même origine. */}
          <span
            aria-hidden="true"
            className="absolute left-0 top-[2.5rem] h-[7px] w-[7px] rounded-full bg-brun md:left-[7.5rem] lg:left-[9.5rem]"
          />
          {i < dernier && (
            <span
              aria-hidden="true"
              className="absolute bottom-0 left-[3px] top-[calc(2.5rem+7px)] w-px bg-filet-fort md:left-[calc(7.5rem+3px)] lg:left-[calc(9.5rem+3px)]"
            />
          )}

          <div className="md:pr-9 md:text-right">
            <p className="date-frise paraitre">{e.annee}</p>
            {e.repere && (
              <p
                className="mention paraitre mt-2"
                style={{ "--rang": 1 } as React.CSSProperties}
              >
                {e.repere}
              </p>
            )}
          </div>

          <div className="md:pl-9">
            <h3
              className="titre titre-4 paraitre max-w-[34ch] text-balance"
              style={{ "--rang": 1 } as React.CSSProperties}
            >
              {e.titre}
            </h3>
            <p
              className="paraitre mesure mt-3 leading-relaxed text-gris"
              style={{ "--rang": 2 } as React.CSSProperties}
            >
              {e.texte}
            </p>
          </div>

          {i < dernier && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 border-b border-filet md:left-[7.5rem] lg:left-[9.5rem]"
            />
          )}
        </li>
      ))}
    </ol>
  );
}
