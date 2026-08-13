"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AGENCE } from "@/lib/agence";

/**
 * La demande de rendez-vous.
 *
 * La validation est faite à la main plutôt que laissée au navigateur :
 * les bulles natives disparaissent au premier clic, ne sont pas
 * traduisibles et ne survivent pas au zoom. Ici, chaque erreur est du
 * texte sous son champ, reliée par `aria-describedby`, et le premier
 * champ fautif reçoit le focus à la soumission.
 *
 * Le formulaire n’envoie rien : ce site est une démonstration et il n’y
 * a personne au bout. Le dire est plus honnête que d’afficher un faux
 * « message envoyé », et le message de confirmation redonne les vraies
 * façons de joindre l’agence.
 */

interface Erreurs {
  nom?: string;
  courriel?: string;
  message?: string;
  accord?: string;
}

const NATURES = [
  "Construction neuve",
  "Réhabilitation",
  "Extension ou surélévation",
  "Je ne sais pas encore",
];

/* La valeur par défaut, nommée et non pointée du doigt par son rang.
   `NATURES[3]` désignait la bonne entrée, mais réordonner la liste
   aurait changé le défaut sans que rien ne le signale. C’est aussi le
   choix juste : présélectionner « Construction neuve » ferait répondre
   à la place de la personne. */
const NATURE_PAR_DEFAUT = "Je ne sais pas encore";

export default function Formulaire() {
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const confirmation = useRef<HTMLDivElement>(null);
  const premierChamp = useRef<HTMLInputElement>(null);
  const premierRendu = useRef(true);
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [envoye, setEnvoye] = useState(false);

  /*
   * Emmener le focus avec soi.
   *
   * Envoyer le formulaire remplace tout le bloc par la confirmation, et
   * revenir au formulaire fait l’inverse. Dans les deux cas, l’élément
   * qui avait le focus — le bouton qu’on vient d’actionner — quitte le
   * document. Le focus retombe alors sur `<body>` : la personne au
   * clavier se retrouve au début de la page, et la tabulation suivante
   * repart de la réglette. Elle ne saura même pas que quelque chose a
   * répondu.
   *
   * Deux lignes suffisent, à condition de ne pas les jouer au premier
   * rendu — sans quoi charger la page Contact déplacerait le focus dans
   * le formulaire tout seul, ce qui est le défaut symétrique.
   */
  useEffect(() => {
    if (premierRendu.current) {
      premierRendu.current = false;
      return;
    }
    if (envoye) confirmation.current?.focus();
    else premierChamp.current?.focus();
  }, [envoye]);

  const champId = (nom: string) => `${id}-${nom}`;
  const erreurId = (nom: string) => `${id}-${nom}-erreur`;

  function verifier(donnees: FormData): Erreurs {
    const e: Erreurs = {};
    const nom = String(donnees.get("nom") ?? "").trim();
    const courriel = String(donnees.get("courriel") ?? "").trim();
    const message = String(donnees.get("message") ?? "").trim();

    if (nom.length < 2) e.nom = "Indiquez votre nom, même seulement le prénom.";
    /* Volontairement large : la seule vérification qui vaille est
       l’envoi. On refuse ce qui ne peut pas être une adresse, pas ce qui
       s’écarte d’une grammaire trop stricte. */
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(courriel))
      e.courriel = "Cette adresse ne semble pas complète.";
    if (message.length < 20)
      e.message =
        "Décrivez le projet en une ou deux phrases : la commune, la surface, ce que vous voulez faire.";
    if (!donnees.get("accord"))
      e.accord = "Nous avons besoin de votre accord pour vous répondre.";
    return e;
  }

  function soumettre(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const donnees = new FormData(evenement.currentTarget);
    const trouvees = verifier(donnees);
    setErreurs(trouvees);

    const premiere = Object.keys(trouvees)[0];
    if (premiere) {
      form.current
        ?.querySelector<HTMLElement>(`#${CSS.escape(champId(premiere))}`)
        ?.focus();
      return;
    }
    setEnvoye(true);
  }

  if (envoye) {
    return (
      /*
        Pas de `role="status"` ici. Une région vivante annonce une
        *modification* de son contenu ; celle-ci apparaît en même temps
        que son contenu, ce que beaucoup de lecteurs d’écran n’annoncent
        pas. Le focus, lui, est déplacé plus haut par un effet, et un
        conteneur qui reçoit le focus est lu — c’est le mécanisme fiable,
        et il évite la double annonce.
      */
      <div
        ref={confirmation}
        tabIndex={-1}
        className="border border-encre bg-creme p-8 outline-none md:p-10"
      >
        <p className="mention">Démonstration</p>
        <h3 className="titre titre-3 mt-4 max-w-[24ch] text-balance">
          Ce formulaire n’envoie rien, et c’est voulu.
        </h3>
        <p className="mesure mt-4 leading-relaxed text-gris">
          PASUPA est une agence fictive : il n’y a personne au bout de ce
          formulaire, et vos réponses n’ont été transmises nulle part.
          Elles n’ont même pas quitté cette page. Sur un site en service,
          la demande arriverait ici :
        </p>
        <p className="mt-5">
          <a className="lien font-semibold" href={`mailto:${AGENCE.courriel}`}>
            {AGENCE.courriel}
          </a>
          <br />
          <a className="lien font-semibold" href={`tel:${AGENCE.telephoneE164}`}>
            {AGENCE.telephone}
          </a>
        </p>
        <button
          type="button"
          onClick={() => setEnvoye(false)}
          className="bouton bouton-creux mt-8"
        >
          Revenir au formulaire
        </button>
      </div>
    );
  }

  return (
    <form ref={form} onSubmit={soumettre} noValidate className="grid gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Champ
          ref={premierChamp}
          id={champId("nom")}
          nom="nom"
          libelle="Nom"
          erreur={erreurs.nom}
          erreurId={erreurId("nom")}
          autoComplete="name"
          obligatoire
        />
        <Champ
          id={champId("courriel")}
          nom="courriel"
          libelle="Courriel"
          type="email"
          erreur={erreurs.courriel}
          erreurId={erreurId("courriel")}
          autoComplete="email"
          obligatoire
        />
        <Champ
          id={champId("telephone")}
          nom="telephone"
          libelle="Téléphone"
          type="tel"
          autoComplete="tel"
          aide="Facultatif"
        />
        <div>
          <label htmlFor={champId("nature")} className="mention mention-encre">
            Nature du projet
          </label>
          <select
            id={champId("nature")}
            name="nature"
            className="champ mt-2"
            defaultValue={NATURE_PAR_DEFAUT}
          >
            {NATURES.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor={champId("commune")} className="mention mention-encre">
          Commune
        </label>
        <input
          id={champId("commune")}
          name="commune"
          type="text"
          autoComplete="address-level2"
          className="champ mt-2"
          placeholder="Montreuil, Pantin, Paris 11e…"
        />
      </div>

      <div>
        <label htmlFor={champId("message")} className="mention mention-encre">
          Le projet <span className="text-brun">*</span>
        </label>
        <textarea
          id={champId("message")}
          name="message"
          rows={6}
          required
          aria-invalid={erreurs.message ? true : undefined}
          aria-describedby={erreurs.message ? erreurId("message") : undefined}
          className="champ mt-2 resize-y"
          placeholder="Une maison de 1930 à Montreuil, 110 m², nous voulons ouvrir le rez-de-chaussée et surélever d’un niveau."
        />
        {erreurs.message && (
          <p id={erreurId("message")} className="mt-2 text-sm text-erreur">
            {erreurs.message}
          </p>
        )}
      </div>

      <div>
        <div className="flex items-start gap-3">
          {/*
            `required` comme sur les trois autres champs obligatoires.
            Il manquait ici : `verifier()` refusait pourtant l’envoi sans
            cette case. L’astérisque le disait à l’œil, la validation le
            disait après coup, mais l’arbre d’accessibilité ne le disait
            pas — un lecteur d’écran annonçait « case à cocher » là où il
            annonce « obligatoire » pour les trois autres. Le formulaire
            portant `noValidate`, l’attribut ne change rien au
            comportement : il ne fait que rendre l’exigence annonçable.
          */}
          <input
            id={champId("accord")}
            name="accord"
            type="checkbox"
            required
            aria-invalid={erreurs.accord ? true : undefined}
            aria-describedby={erreurs.accord ? erreurId("accord") : undefined}
            className="mt-0.5 h-6 w-6 shrink-0 accent-encre"
          />
          <label htmlFor={champId("accord")} className="text-sm leading-relaxed">
            J’accepte que ces informations soient utilisées pour répondre
            à ma demande. Elles ne servent à rien d’autre et ne sont
            transmises à personne. <span className="text-brun">*</span>
          </label>
        </div>
        {erreurs.accord && (
          <p id={erreurId("accord")} className="mt-2 text-sm text-erreur">
            {erreurs.accord}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-5 pt-2">
        <button type="submit" className="bouton">
          Envoyer la demande
        </button>
        <p className="text-sm text-gris">
          Réponse sous deux jours ouvrés.{" "}
          <span className="text-brun">*</span> champs obligatoires.
        </p>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */

function Champ({
  ref,
  id,
  nom,
  libelle,
  type = "text",
  erreur,
  erreurId,
  aide,
  autoComplete,
  obligatoire,
}: {
  ref?: React.Ref<HTMLInputElement>;
  id: string;
  nom: string;
  libelle: string;
  type?: string;
  erreur?: string;
  erreurId?: string;
  aide?: string;
  autoComplete?: string;
  obligatoire?: boolean;
}) {
  const aideId = `${id}-aide`;
  const decrit = [erreur ? erreurId : null, aide ? aideId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <label htmlFor={id} className="mention mention-encre">
        {libelle} {obligatoire && <span className="text-brun">*</span>}
      </label>
      <input
        ref={ref}
        id={id}
        name={nom}
        type={type}
        autoComplete={autoComplete}
        required={obligatoire}
        aria-invalid={erreur ? true : undefined}
        aria-describedby={decrit || undefined}
        className="champ mt-2"
      />
      {/*
        L’aide reste affichée quand une erreur survient. Elle disparaissait
        auparavant, alors que `aria-describedby` continuait de la citer :
        l’attribut pointait vers un identifiant qui n’existait plus dans le
        document, et un renvoi mort ne se voit ni à l’écran ni à la
        relecture du code — seulement au lecteur d’écran, qui n’annonce
        alors plus rien du tout. Deux raisons de la garder, donc : celle-là,
        et le fait qu’un champ facultatif le reste même mal rempli.
      */}
      {aide && (
        <p id={aideId} className="mt-2 text-sm text-gris">
          {aide}
        </p>
      )}
      {erreur && (
        <p id={erreurId} className="mt-2 text-sm text-erreur">
          {erreur}
        </p>
      )}
    </div>
  );
}
