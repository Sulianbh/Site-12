/**
 * Le bloc JSON-LD d’une page.
 *
 * Le contenu est un objet sérialisé par nos soins, jamais une saisie
 * utilisateur : il n’y a pas de surface d’injection ici. Les `<` sont
 * malgré tout échappés, parce qu’une chaîne contenant « </script> »
 * refermerait la balise — c’est le seul caractère qui compte dans ce
 * contexte.
 */
export default function DonneesStructurees({ json }: { json: string }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json.replace(/</g, "\\u003c") }}
    />
  );
}
