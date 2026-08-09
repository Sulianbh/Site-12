import { CHIFFRES } from "@/lib/agence";

/**
 * Les chiffres clés.
 *
 * Chaque nombre est suivi de sa précision : « 41 bâtiments livrés » ne
 * vaut rien sans « depuis 2011, dont 27 en réhabilitation ». Un chiffre
 * sans son unité de mesure est un argument publicitaire ; avec elle,
 * c’est une donnée que le lecteur peut discuter.
 */
export default function Chiffres() {
  return (
    <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
      {CHIFFRES.map((c, i) => (
        <li
          key={c.libelle}
          className="paraitre filet-haut pt-6"
          style={{ "--rang": i } as React.CSSProperties}
        >
          <p className="chiffre">{c.valeur}</p>
          <p className="titre-4 mt-3">{c.libelle}</p>
          <p className="mt-2 text-sm leading-relaxed text-gris">{c.precision}</p>
        </li>
      ))}
    </ul>
  );
}
