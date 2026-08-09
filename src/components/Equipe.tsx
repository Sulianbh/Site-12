import { EQUIPE } from "@/lib/agence";

/**
 * L’équipe : neuf lignes, un nom, un rôle, et un rond blanc à droite.
 *
 * Le rond est la place de la photographie, laissée vide et assumée
 * comme telle — les personnes de cette agence n’existent pas, et un
 * portrait pris ailleurs serait un mensonge de plus qu’un dessin. Les
 * initiales à l’intérieur évitent que le vide passe pour une image qui
 * n’a pas chargé.
 */
export default function Equipe() {
  return (
    <ul>
      {EQUIPE.map((m, i) => (
        <li
          key={m.nom}
          data-observe
          className={`flex items-center justify-between gap-6 py-5 ${
            i < EQUIPE.length - 1 ? "filet-bas" : ""
          }`}
        >
          <div className="paraitre">
            <p className="titre-4">{m.nom}</p>
            <p className="mt-1 text-sm text-gris">{m.role}</p>
          </div>

          <div className="paraitre flex shrink-0 items-center gap-5">
            <span className="mention hidden sm:inline">depuis {m.depuis}</span>
            <span
              aria-hidden="true"
              className="flex h-14 w-14 items-center justify-center rounded-full border border-filet-fort bg-blanc text-[0.7rem] font-semibold tracking-[0.1em] text-gris md:h-16 md:w-16"
            >
              {m.initiales}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
