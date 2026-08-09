/**
 * L’étoile de la page courante.
 *
 * Elle double le trait sous l’entrée active : le trait dit « ici » à
 * l’œil qui balaie, l’étoile le dit à l’œil qui s’arrête. Purement
 * décorative — l’information est portée par `aria-current="page"` sur le
 * lien, que les lecteurs d’écran annoncent déjà.
 *
 * Dessinée plutôt qu’écrite : le caractère ✦ n’existe pas dans toutes
 * les polices et retombe alors sur une fonte de secours dont la taille
 * ne suit pas.
 */
export default function Etoile() {
  return (
    <svg
      viewBox="0 0 10 10"
      aria-hidden="true"
      focusable="false"
      className="etoile"
      fill="currentColor"
      style={{ color: "var(--brun)" }}
    >
      <path d="M5 0 6.1 3.9 10 5 6.1 6.1 5 10 3.9 6.1 0 5 3.9 3.9Z" />
    </svg>
  );
}
