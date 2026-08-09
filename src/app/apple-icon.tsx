import { ImageResponse } from "next/og";

/**
 * L’icône de l’écran d’accueil iOS.
 *
 * `icon.svg` suffit à l’onglet de tous les navigateurs actuels, mais pas
 * à iOS : « Ajouter à l’écran d’accueil » ignore le SVG et se rabat sur
 * une capture de la page, illisible à cette taille. Il faut un bitmap de
 * 180 × 180, et Next le génère à la construction comme la carte de
 * partage — donc sans fichier binaire à tenir à jour à la main quand la
 * palette change.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function Icone() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#dcc6a8",
          color: "#241d17",
          fontSize: 96,
          fontWeight: 700,
          letterSpacing: -4,
        }}
      >
        <span style={{ display: "flex" }}>P</span>
        <span
          style={{
            display: "flex",
            width: 18,
            height: 18,
            marginLeft: 8,
            marginTop: 44,
            borderRadius: 9,
            background: "#7c5b39",
          }}
        />
      </div>
    ),
    size,
  );
}
