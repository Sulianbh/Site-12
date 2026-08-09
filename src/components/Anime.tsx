"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Le mouvement, en trente lignes et sans dépendance.
 *
 * Deux principes :
 *
 * — Rien n’est masqué par le CSS tant que ce composant n’a pas posé
 *   `js-anime` sur <html>. Sans JavaScript, la page est simplement
 *   complète et immobile, ce qui est un état parfaitement acceptable.
 * — On n’écrit pas dans un état React depuis un effet : on écrit dans le
 *   DOM. La règle du compilateur React l’exige, et cela évite un rendu
 *   supplémentaire par section qui entre dans le champ.
 *
 * Un IntersectionObserver, pas de ScrollTrigger : les révélations qui ne
 * jouent qu’une fois n’ont pas besoin de recalculer des positions à
 * chaque navigation client, et c’est exactement là que la version à
 * base de ScrollTrigger se trompait dans les sites précédents.
 */
export default function Anime() {
  const chemin = usePathname();

  useEffect(() => {
    const racine = document.documentElement;
    racine.classList.add("js-anime");

    const cibles = document.querySelectorAll<HTMLElement>("[data-observe]");

    if (!("IntersectionObserver" in window)) {
      cibles.forEach((el) => (el.dataset.vu = "oui"));
      return;
    }

    const observateur = new IntersectionObserver(
      (entrees) => {
        for (const entree of entrees) {
          if (!entree.isIntersecting) continue;
          (entree.target as HTMLElement).dataset.vu = "oui";
          observateur.unobserve(entree.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.06 },
    );

    cibles.forEach((el) => {
      /* Ce qui est déjà à l’écran au chargement se montre tout de suite :
         attendre un défilement pour afficher le haut de page serait une
         panne, pas une animation. */
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
        el.dataset.vu = "oui";
        return;
      }
      observateur.observe(el);
    });

    return () => observateur.disconnect();
  }, [chemin]);

  return null;
}
