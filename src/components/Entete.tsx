"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AGENCE } from "@/lib/agence";
import { MENU } from "@/lib/navigation";
import Etoile from "./Etoile";

/**
 * L’en-tête : le nom à gauche, les quatre entrées au centre, le rendez-
 * vous à droite.
 *
 * Trois précautions, apprises de la série :
 *
 * 1. La barre est un aplat marron opaque, exactement la couleur du haut
 *    du dégradé. Il n’y a donc aucune couture quand on est en haut de
 *    page, et elle reste lisible quand elle passe sur le blanc du corps.
 *    Pas de `backdrop-filter` : un filtre sur un ancêtre crée un bloc
 *    conteneur pour les descendants en `position: fixed` et casserait le
 *    menu plein écran.
 * 2. Le voile du menu est en `z-40`, la rangée en `z-50` : sans cela le
 *    bouton « Fermer » passe dessous et n’est plus atteignable au doigt,
 *    alors que le clavier, lui, y arrive encore.
 * 3. L’état retient *pour quelle page* le menu a été ouvert plutôt qu’un
 *    booléen : changer d’adresse le referme tout seul, sans effet — et
 *    la règle du compilateur React, qui interdit d’appeler setState dans
 *    le corps d’un effet, reste respectée.
 * 4. Le focus est retenu dans l’en-tête tant que le menu est ouvert.
 *    Sans cela, la tabulation sortait du voile à la sixième frappe et
 *    parcourait, un par un, des liens que l’écran ne montrait plus. Le
 *    défaut ne se voit ni à la souris ni au lecteur d’écran en mode
 *    lecture : il faut tabuler pour le rencontrer.
 */

const FOCUSABLES =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function Entete() {
  const chemin = usePathname();
  const entete = useRef<HTMLElement>(null);
  const bouton = useRef<HTMLButtonElement>(null);

  const [ouvertPour, setOuvertPour] = useState<string | null>(null);
  const ouvert = ouvertPour === chemin;

  useEffect(() => {
    if (!ouvert) return;

    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOuvertPour(null);
        bouton.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !entete.current) return;

      /* La liste est relue à chaque frappe : le bouton bascule entre
         « Ouvrir » et « Fermer », et les entrées du menu n’existent pas
         tant qu’il est replié. */
      const liste = [...entete.current.querySelectorAll<HTMLElement>(FOCUSABLES)].filter(
        (el) => el.offsetWidth > 0 || el.offsetHeight > 0,
      );
      if (!liste.length) return;

      const premier = liste[0];
      const dernier = liste[liste.length - 1];
      const actif = document.activeElement as HTMLElement | null;

      if (!actif || !entete.current.contains(actif)) {
        e.preventDefault();
        premier.focus();
      } else if (e.shiftKey && actif === premier) {
        e.preventDefault();
        dernier.focus();
      } else if (!e.shiftKey && actif === dernier) {
        e.preventDefault();
        premier.focus();
      }
    };

    document.addEventListener("keydown", surTouche);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", surTouche);
      document.body.style.overflow = "";
    };
  }, [ouvert]);

  /*
   * Refermer le menu quand la fenêtre passe en disposition large.
   *
   * `lg:hidden` masque le voile *et* son bouton de fermeture au-delà de
   * 64rem, mais ne touche pas à l’état React : le menu restait donc
   * « ouvert » pour le composant, et l’effet ci-dessus gardait
   * `overflow: hidden` sur le corps du document. Résultat mesuré : à
   * 1440 px, plus rien à cliquer et une page de 4530 px qui refuse de
   * défiler. Seule la touche Échap libérait — c’est-à-dire personne, sur
   * une tablette qu’on fait pivoter du portrait au paysage.
   *
   * On n’écoute que l’événement `change`, jamais l’état initial : le
   * menu ne peut s’ouvrir que sous 64rem, puisque son bouton n’existe
   * pas au-dessus. Lire la valeur au montage n’apprendrait donc rien, et
   * appeler `setState` dans le corps d’un effet est ce que la règle du
   * compilateur React interdit.
   *
   * `min-width` et non la syntaxe d’intervalle : une requête que le
   * navigateur ne sait pas analyser ne correspond jamais, et la panne
   * qu’on corrige ici reviendrait en silence.
   */
  useEffect(() => {
    if (!ouvert) return;
    const large = window.matchMedia("(min-width: 64rem)");
    const surElargissement = () => {
      if (large.matches) setOuvertPour(null);
    };
    large.addEventListener("change", surElargissement);
    return () => large.removeEventListener("change", surElargissement);
  }, [ouvert]);

  /* L’accueil ne doit correspondre qu’à lui-même ; les autres entrées
     couvrent aussi leurs pages filles (/projets/maison-a-cour…). */
  const courant = (href: string) =>
    href === "/" ? chemin === "/" : chemin === href || chemin.startsWith(`${href}/`);

  return (
    <header ref={entete} className="sur-brun sticky top-0 z-50 bg-brun-pale">
      <div className="relative z-50 mx-auto flex h-[4.25rem] max-w-[var(--colonne)] items-center gap-4 bg-brun-pale px-[var(--marge)] md:h-20">
        {/* Colonne de gauche et colonne de droite ont la même base, ce qui
            laisse la navigation optiquement centrée sur la page. */}
        <div className="flex flex-1 justify-start">
          <Link
            href="/"
            className="flex shrink-0 items-baseline gap-2.5 py-2"
            aria-label={`${AGENCE.nomLong}, retour à l'accueil`}
          >
            <span className="titre point text-[1.3rem] tracking-[0.02em] md:text-[1.45rem]">
              {AGENCE.nom}
            </span>
            <span className="mention hidden sm:inline">architectes</span>
          </Link>
        </div>

        <nav
          aria-label="Navigation principale"
          className="hidden lg:block"
        >
          <ul className="flex items-center gap-10">
            {MENU.map((e) => {
              const ici = courant(e.href);
              return (
                <li key={e.href}>
                  <Link
                    href={e.href}
                    title={e.description}
                    aria-current={ici ? "page" : undefined}
                    className={`lien lien-menu lien-cible text-[0.95rem] ${
                      ici ? "text-encre" : "text-gris hover:text-encre"
                    }`}
                  >
                    {ici && <Etoile />}
                    {e.libelle}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex flex-1 items-center justify-end gap-3">
          <Link href="/contact#rendez-vous" className="bouton hidden md:inline-flex">
            Prendre rendez-vous
          </Link>

          <button
            ref={bouton}
            type="button"
            onClick={() => setOuvertPour(ouvert ? null : chemin)}
            aria-expanded={ouvert}
            /*
              `aria-controls` n’est posé que lorsque la cible existe. Le
              voile n’est dans le document que déplié ; l’attribut y
              renvoyait donc en permanence vers un identifiant absent, ce
              qui est un renvoi mort au même titre qu’un
              `aria-labelledby` qui ne désigne personne. Replié, le
              bouton dit déjà tout ce qu’il faut avec
              `aria-expanded="false"` : quelque chose se déplie, sans
              qu’on prétende savoir quoi.
            */
            aria-controls={ouvert ? "menu-mobile" : undefined}
            className="-mr-2 flex h-12 w-12 items-center justify-center text-encre lg:hidden"
          >
            <span className="sr-only">
              {ouvert ? "Fermer le menu" : "Ouvrir le menu"}
            </span>
            <span aria-hidden="true" className="flex flex-col items-end gap-[0.3rem]">
              <span
                className={`block h-px w-6 bg-encre transition-transform duration-200 ${
                  ouvert ? "translate-y-[0.4rem] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-px bg-encre transition-all duration-200 ${
                  ouvert ? "w-0 opacity-0" : "w-6 opacity-100"
                }`}
              />
              <span
                className={`block h-px w-6 bg-encre transition-transform duration-200 ${
                  ouvert ? "-translate-y-[0.4rem] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {ouvert && (
        /*
           `role="dialog"` sans `aria-modal` : la commande de fermeture est
           le bouton de la barre, qui vit *hors* de ce nœud pour rester
           au-dessus du voile. Déclarer la modalité ici masquerait donc
           aux lecteurs d’écran le seul moyen de refermer le menu. Ce que
           `aria-modal` aurait apporté — ne pas atteindre la page derrière
           — est obtenu par la retenue du focus dans l’en-tête.
        */
        <div
          id="menu-mobile"
          role="dialog"
          aria-label="Menu principal"
          className="sur-brun fixed inset-x-0 bottom-0 top-[4.25rem] z-40 flex flex-col justify-between overflow-y-auto bg-brun-pale px-[var(--marge)] pb-10 pt-6 md:top-20 lg:hidden"
        >
          <nav aria-label="Navigation principale, menu déplié">
            <ul className="flex flex-col">
              {MENU.map((e, i) => {
                const ici = courant(e.href);
                return (
                  <li key={e.href} className="border-b border-filet">
                    <Link
                      href={e.href}
                      aria-current={ici ? "page" : undefined}
                      className="flex items-baseline justify-between gap-4 py-5"
                    >
                      <span className="titre titre-3 inline-flex items-baseline">
                        {ici && <Etoile />}
                        {e.libelle}
                      </span>
                      <span className="mention">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-10">
            <Link href="/contact#rendez-vous" className="bouton w-full">
              Prendre rendez-vous
            </Link>
            <p className="mt-6 text-sm leading-relaxed text-gris">
              {AGENCE.adresse.rue}
              <br />
              {AGENCE.adresse.codePostal} {AGENCE.adresse.ville}
              <br />
              <a className="lien text-encre" href={`tel:${AGENCE.telephoneE164}`}>
                {AGENCE.telephone}
              </a>
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
