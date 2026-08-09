import { AGENCE, DERNIERE_MISE_A_JOUR } from "@/lib/agence";
import { fil } from "@/lib/navigation";
import { metadonnees, graphe } from "@/lib/seo";
import FilDAriane from "@/components/FilDAriane";
import DonneesStructurees from "@/components/DonneesStructurees";

const MAILLONS = fil({ nom: "Mentions légales", url: "/mentions-legales" });

export const metadata = {
  ...metadonnees({
    titre: "Mentions légales",
    description:
      "Éditeur, hébergeur, propriété intellectuelle et données personnelles du site de démonstration PASUPA.",
    chemin: "/mentions-legales",
  }),
  robots: { index: false, follow: true },
};

export default function PageMentions() {
  return (
    <>
      <DonneesStructurees json={graphe(MAILLONS)} />

      <div className="cadre pb-16 pt-8 md:pb-24">
        <FilDAriane maillons={MAILLONS} />

        <h1 className="titre titre-1 mt-8 max-w-[16ch] text-balance">
          Mentions légales
        </h1>

        <div className="mt-12 max-w-[62ch] space-y-10">
          <section>
            <h2 className="mention mention-encre">Avertissement</h2>
            <p className="mt-3 leading-relaxed text-gris">
              Ce site est une démonstration de conception. L’agence
              PASUPA, ses associés, son équipe, ses projets, ses concours, ses
              distinctions, son adresse, ses numéros et ses montants sont
              entièrement fictifs et ne renvoient à aucune agence, personne ou
              opération réelle. Toute ressemblance serait fortuite.
            </p>
          </section>

          <section>
            <h2 className="mention mention-encre">Éditeur</h2>
            <p className="mt-3 leading-relaxed text-gris">
              {AGENCE.nomLong} (fictif) — {AGENCE.adresse.rue},{" "}
              {AGENCE.adresse.codePostal} {AGENCE.adresse.ville}. Téléphone :{" "}
              {AGENCE.telephone}. Courriel : {AGENCE.courriel}. {AGENCE.ordre}.
              Directrice de la publication : Claire Vasseur.
            </p>
          </section>

          <section>
            <h2 className="mention mention-encre">Hébergement</h2>
            <p className="mt-3 leading-relaxed text-gris">
              Le site est destiné à être hébergé sur une plateforme
              d’hébergement statique. L’identité et les coordonnées
              de l’hébergeur sont à compléter à la mise en ligne.
            </p>
          </section>

          <section>
            <h2 className="mention mention-encre">Données personnelles</h2>
            <p className="mt-3 leading-relaxed text-gris">
              Le formulaire de demande de rendez-vous n’envoie rien et ne
              conserve rien : les informations saisies restent dans le
              navigateur et disparaissent au rechargement de la page. Le site
              ne dépose aucun cookie, n’utilise aucun outil de mesure
              d’audience et ne charge aucune ressource extérieure — les
              polices de caractères sont servies depuis ce domaine.
            </p>
          </section>

          <section>
            <h2 className="mention mention-encre">Propriété intellectuelle</h2>
            <p className="mt-3 leading-relaxed text-gris">
              Les six planches — plans et coupes — sont dessinées pour ce site.
              Les polices de caractères Bricolage Grotesque, Public Sans et
              Spline Sans Mono sont distribuées sous licence SIL Open Font
              License.
            </p>
          </section>

          <section>
            <h2 className="mention mention-encre">Accessibilité</h2>
            <p className="mt-3 leading-relaxed text-gris">
              Le site vise le niveau AA des règles pour l’accessibilité
              des contenus web. Tous les couples de couleurs texte / fond
              utilisés atteignent au moins 4,5:1, la navigation est complète au
              clavier, les animations sont désactivées si le système le
              demande, et l’ensemble du contenu reste lisible sans
              JavaScript.
            </p>
          </section>

          <p className="mention pt-4 text-gris">
            Dernière mise à jour : {DERNIERE_MISE_A_JOUR}
          </p>
        </div>
      </div>
    </>
  );
}
