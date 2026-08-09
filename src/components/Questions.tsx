import { QUESTIONS } from "@/lib/agence";

/**
 * Les questions fréquentes.
 *
 * En `<details>` natifs : ils s’ouvrent sans JavaScript, le clavier les
 * manipule sans une ligne de code, la recherche du navigateur (Ctrl+F)
 * les déplie toute seule dans les navigateurs récents, et l’impression
 * les rend correctement. Un accordéon écrit à la main ferait moins bien
 * pour plus cher.
 *
 * Le nom `question` sur l’attribut `name` rendrait l’accordéon exclusif
 * — une seule question ouverte à la fois. On ne le fait pas : quelqu’un
 * qui compare les délais et les honoraires veut voir les deux réponses
 * en même temps.
 */
export default function Questions() {
  return (
    <div>
      {QUESTIONS.map((q, i) => (
        <details
          key={q.question}
          className={`question ${i < QUESTIONS.length - 1 ? "filet-bas" : ""}`}
        >
          <summary>
            <span className="max-w-[46ch]">{q.question}</span>
            <span aria-hidden="true" className="signe" />
          </summary>
          <p className="mesure pb-6 leading-relaxed text-gris">{q.reponse}</p>
        </details>
      ))}
    </div>
  );
}
