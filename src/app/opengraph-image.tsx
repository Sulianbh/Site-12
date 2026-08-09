import { ImageResponse } from "next/og";
import { AGENCE } from "@/lib/agence";

/**
 * L’image de partage.
 *
 * Une adresse collée dans une messagerie n’affiche que ce qu’on lui a
 * préparé. Sans cette image, le site le mieux composé se réduit à un
 * rectangle gris — ce qui, pour une agence d’architecture, est une
 * contre-publicité.
 *
 * Elle reprend les trois éléments qui font le site : le dégradé chaud,
 * le nom suivi de son gros point, et le trait de la convention de
 * dessin. Pas de photographie, ici non plus.
 *
 * Ce fichier vaut pour toutes les routes situées dessous : une seule
 * carte pour tout le site, générée une fois à la construction.
 */

/* palette-hors-feuille : #e8d7bf, #f5efe5 — arrêts intermédiaires du
   dégradé de la carte. Ils n’existent que dans cette image : le site,
   lui, n’a aucun dégradé de fond à reproduire. */

export const alt = `${AGENCE.nomLong} — ${AGENCE.these}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  /* Le composant doit retourner l’ImageResponse : une route qui se
     contente de construire du JSX échoue à la construction avec
     « No response is returned from route handler ». */
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          color: "#241d17",
          backgroundImage:
            "linear-gradient(160deg, #dcc6a8 0%, #e8d7bf 34%, #f5efe5 66%, #ffffff 100%)",
        }}
      >
        {/* Le point appartient au nom : il se colle à la dernière lettre,
            et c’est « architectes » qui prend le large. Un écart égal
            entre les trois en ferait une puce de séparation. */}
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span style={{ fontSize: 40, letterSpacing: 4, fontWeight: 600 }}>
            {AGENCE.nom}
          </span>
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: 12,
              background: "#7c5b39",
              marginLeft: 2,
            }}
          />
          <span
            style={{
              fontSize: 21,
              letterSpacing: 5,
              textTransform: "uppercase",
              color: "#6a5f53",
              marginLeft: 30,
            }}
          >
            architectes
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 78, lineHeight: 1.06, letterSpacing: -2, maxWidth: 900 }}>
            {AGENCE.these}
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.4,
              color: "#6a5f53",
              maxWidth: 820,
              marginTop: 26,
            }}
          >
            {AGENCE.sousThese}
          </div>
        </div>

        {/* La convention de dessin, en trois traits : c’est la signature
            du site, et elle tient dans une ligne. */}
        <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 46, height: 2, background: "#8f7e64" }} />
            <span style={{ fontSize: 18, letterSpacing: 3, color: "#6a5f53" }}>
              EXISTANT
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", gap: 5 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} style={{ width: 6, height: 2, background: "#8f7e64" }} />
              ))}
            </div>
            <span style={{ fontSize: 18, letterSpacing: 3, color: "#6a5f53" }}>
              DÉPOSÉ
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 46, height: 4, background: "#241d17" }} />
            <span style={{ fontSize: 18, letterSpacing: 3, color: "#6a5f53" }}>
              PROJETÉ
            </span>
          </div>
          {/* Un seul nœud enfant : Satori refuse tout `div` à plusieurs
              enfants qui ne déclare pas explicitement son `display`, et
              « texte {expr} texte » en fait trois. */}
          <div
            style={{
              marginLeft: "auto",
              fontSize: 18,
              letterSpacing: 3,
              color: "#6a5f53",
              whiteSpace: "nowrap",
            }}
          >
            {`${AGENCE.adresse.ville.toUpperCase()} — DEPUIS ${AGENCE.depuis}`}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
