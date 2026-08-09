/**
 * Les six planches.
 *
 * Aucune photographie sur ce site : les projets sont fictifs, et une
 * image trouvée ailleurs le serait moins. Chaque opération est donc
 * représentée par le document qui la décrit le mieux — un plan ou une
 * coupe — tracé à la main dans le même cadre de 400 × 250, avec la même
 * convention partout :
 *
 *   .existant  trait fin continu  ce qui était là et qu’on garde
 *   .depose    trait tireté       ce qui a été retiré
 *   .projete   trait plein sombre ce que l’agence a construit
 *
 * Les annotations sont du vrai texte : elles se cherchent, se traduisent
 * et se lisent à la loupe. Elles disparaissent sur les vignettes, où
 * elles ne feraient plus que du bruit (voir `.carte-dessin` dans la
 * feuille de style).
 *
 * Deux règles tenues sur les six planches, apprises en les relisant
 * côte à côte : une annotation ne doit jamais croiser un trait — elle
 * sort du dessin et tire un renvoi — et deux traits projetés parallèles
 * distants de moins de six unités fusionnent en un pavé noir à la taille
 * d’affichage réelle. C’est ce qui avait transformé la baie vitrée de la
 * brasserie en poteau.
 */

const CADRE = "0 0 400 250";

function Planche({
  titre,
  children,
}: {
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      viewBox={CADRE}
      role="img"
      aria-label={titre}
      className="plan"
      preserveAspectRatio="xMidYMid meet"
    >
      {children}
    </svg>
  );
}

/** Une ligne de cote avec ses deux pattes et son texte au-dessus. */
function Cote({
  x1,
  x2,
  y,
  texte,
}: {
  x1: number;
  x2: number;
  y: number;
  texte: string;
}) {
  return (
    <g>
      <path
        className="cote-dessin"
        d={`M${x1},${y - 4} V${y + 4} M${x1},${y} H${x2} M${x2},${y - 4} V${y + 4}`}
      />
      <text
        className="texte-dessin"
        x={(x1 + x2) / 2}
        y={y - 6}
        textAnchor="middle"
      >
        {texte}
      </text>
    </g>
  );
}

/** Le renvoi : un trait fin qui va de l’annotation à ce qu’elle nomme. */
function Renvoi({ d, fleche }: { d: string; fleche?: [number, number, number] }) {
  return (
    <g>
      <path className="cote-dessin" d={d} />
      {fleche && (
        <path
          className="cote-dessin"
          d={`M${fleche[0]},${fleche[1]} l${fleche[2]},-3 M${fleche[0]},${fleche[1]} l${fleche[2]},3`}
        />
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  1 — Ateliers de la Fonderie : coupe transversale                   */
/* ------------------------------------------------------------------ */

function Fonderie() {
  const dents = [0, 1, 2, 3];
  return (
    <Planche titre="Coupe transversale sur la halle de la Fonderie : les sheds de 1928 conservés, l’ossature bois des ateliers posée dessous sans appui sur l’existant.">
      {/* ---- existant : la halle de 1928 ---- */}
      <path className="existant" d="M20,213 H380" />
      <path className="existant" d="M48,213 V98 M352,213 V98" />
      <path
        className="existant"
        d="M48,98 V62 L124,98 V62 L200,98 V62 L276,98 V62 L352,98"
      />
      {/* la face vitrée de chaque shed, au nord */}
      {dents.map((i) => (
        <path
          key={i}
          className="existant"
          d={`M${51 + i * 76},96 V65`}
          opacity={0.65}
        />
      ))}
      {/* les fermes en acier riveté : membrure basse et treillis */}
      <path className="existant" d="M48,106 H352" />
      <path
        className="existant"
        d="M48,98 L86,106 L124,98 L162,106 L200,98 L238,106 L276,98 L314,106 L352,98"
        opacity={0.5}
      />

      {/* ---- projeté : deux boîtes d’ateliers, indépendantes ---- */}
      <path className="projete" d="M80,114 H190 V213 M80,114 V213" />
      <path className="projete" d="M210,114 H320 V213 M210,114 V213" />
      {/* le plancher intermédiaire en bois */}
      <path className="projete" d="M80,152 H190 M210,152 H320" />
      {/* les refends des ateliers */}
      <path className="existant" d="M135,152 V213 M265,152 V213" opacity={0.75} />

      {/*
        Le jeu entre le haut des boîtes et la membrure basse des fermes :
        c’est tout l’argument du projet. On ne le cote pas — l’espace
        disponible entre les deux boîtes ne laisse pas la place d’une
        annotation lisible — mais on le laisse voir, et la légende sous
        le dessin le dit en toutes lettres.
      */}

      <text className="texte-dessin" x="200" y="50" textAnchor="middle">
        sheds 1928 — conservés
      </text>
      <text className="texte-dessin" x="200" y="235" textAnchor="middle">
        ossature bois rapportée — 14 ateliers
      </text>
    </Planche>
  );
}

/* ------------------------------------------------------------------ */
/*  2 — Maison à cour : plan du rez-de-chaussée                        */
/* ------------------------------------------------------------------ */

function MaisonACour() {
  return (
    <Planche titre="Plan du rez-de-chaussée de la maison à cour : séjour côté rue, cour au centre, chambres au fond, reliés par une galerie couverte.">
      {/* ---- existant : la parcelle et ses deux mitoyens aveugles ---- */}
      <rect className="existant-plein" x="30" y="88" width="340" height="12" />
      <rect className="existant-plein" x="30" y="176" width="340" height="12" />
      <path className="existant" d="M30,100 H370 M30,176 H370" />
      <path className="existant" d="M30,88 V188 M370,88 V188" />
      {/* la rue */}
      <path className="existant" d="M18,74 V204" opacity={0.7} />
      <text
        className="texte-dessin"
        x="12"
        y="139"
        textAnchor="middle"
        transform="rotate(-90 12 139)"
      >
        rue
      </text>

      {/* ---- projeté : la maison en deux corps ---- */}
      <path className="projete" d="M30,100 H146 V176 H30" />
      <path className="existant" d="M108,100 V176" opacity={0.75} />
      <path className="projete" d="M200,100 H370 V176 H200" />
      <path className="existant" d="M256,100 V176 M312,100 V176" opacity={0.75} />
      {/* la galerie couverte, qui traverse la cour au nord */}
      <path className="projete" d="M146,100 H200 M146,116 H200" />

      {/* L’annotation de la galerie sort du dessin : la bande ne fait que
          seize unités de haut, un texte de sept y serait à l’étroit. */}
      <text className="texte-dessin" x="173" y="80" textAnchor="middle">
        galerie
      </text>
      <Renvoi d="M173,82 V100" />

      <text className="texte-dessin" x="173" y="150" textAnchor="middle">
        cour
      </text>
      <text className="texte-dessin" x="88" y="142" textAnchor="middle">
        séjour
      </text>
      <text className="texte-dessin" x="285" y="142" textAnchor="middle">
        chambres
      </text>

      <Cote x1={30} x2={370} y={62} texte="32,00 m" />
      <Cote x1={146} x2={200} y={210} texte="cour 5,00" />
    </Planche>
  );
}

/* ------------------------------------------------------------------ */
/*  3 — Brasserie du Canal : coupe longitudinale                       */
/* ------------------------------------------------------------------ */

function Brasserie() {
  const poteaux = [42, 106, 170, 234, 298, 362];
  const cuves = [72, 112, 152];
  return (
    <Planche titre="Coupe longitudinale sur la brasserie : la trame de béton du garage conservée, la salle de dégustation posée sur une plateforme d’acier à mi-hauteur, séparée de la salle des cuves par une baie vitrée.">
      {/* ---- existant : le garage et sa trame de six mètres ---- */}
      <path className="existant" d="M18,222 H382" />
      <path className="existant" d="M42,222 V56 M362,222 V56 M42,56 H362" />
      {poteaux.map((x) => (
        <g key={x}>
          <rect
            className="existant-plein"
            x={x - 3}
            y="56"
            width="6"
            height="166"
          />
          <path className="existant" d={`M${x - 3},56 V222 M${x + 3},56 V222`} opacity={0.7} />
        </g>
      ))}

      {/* ---- projeté : la façade en caissons de paille ---- */}
      <rect className="projete-plein" x="28" y="56" width="12" height="166" opacity={0.12} />
      <path className="projete" d="M28,56 V222 M40,56 V222 M28,56 H40 M28,222 H40" />
      <path className="existant" d="M28,100 H40 M28,144 H40 M28,188 H40" opacity={0.6} />
      <text className="texte-dessin" x="34" y="46" textAnchor="middle">
        paille
      </text>
      <Renvoi d="M34,48 V56" />

      {/* ---- projeté : la plateforme d’acier ---- */}
      <rect className="projete-plein" x="192" y="138" width="170" height="5" />
      <path className="projete" d="M192,143 V222" />
      {/* les bureaux, dessous */}
      <path className="existant" d="M254,143 V222 M310,143 V222" opacity={0.75} />

      {/*
        La baie vitrée : deux traits distants de six unités. À trois, ils
        se rejoignaient à l’affichage et la baie devenait un poteau noir.
      */}
      <path className="projete" d="M189,138 V62 M195,138 V62" />
      <path className="existant" d="M189,100 H195" opacity={0.6} />

      {/*
        Les cuves. Un socle les décolle du sol : posées à même la ligne
        de terre, un fût à toit bombé se lit comme une arcade et non
        comme une cuve.
      */}
      {cuves.map((x) => (
        <g key={x}>
          <path
            className="projete"
            d={`M${x - 10},216 V178 q0,-9 10,-9 q10,0 10,9 V216 Z`}
          />
          <path className="existant" d={`M${x - 13},216 H${x + 13} V222 H${x - 13} Z`} />
          <path className="existant" d={`M${x - 10},194 H${x + 10}`} opacity={0.6} />
        </g>
      ))}

      <text className="texte-dessin" x="112" y="240" textAnchor="middle">
        salle des cuves — 14 °c
      </text>
      <text className="texte-dessin" x="278" y="86" textAnchor="middle">
        dégustation
      </text>
      <text className="texte-dessin" x="278" y="190" textAnchor="middle">
        bureaux
      </text>

      {/* La cote reste dans le vide de la salle haute. Il lui faut de
          l’air des deux côtés : à douze unités de la plateforme, sa
          ligne et le nez de dalle se lisaient comme un trait double. */}
      <Cote x1={192} x2={362} y={112} texte="plateforme 16,00 m" />
    </Planche>
  );
}

/* ------------------------------------------------------------------ */
/*  4 — Maison de maître : plan du rez-de-chaussée                     */
/* ------------------------------------------------------------------ */

function MaisonDeMaitre() {
  /* Les trois souches retrouvées en couverture, reportées au plan. */
  const cheminees: [number, number][] = [
    [61, 58],
    [214, 27],
    [292, 106],
  ];
  return (
    <Planche titre="Plan du rez-de-chaussée de la maison de maître : la maçonnerie de meulière rendue à son plan de 1902, les cloisons rapportées déposées, l’extension détachée en fond de jardin.">
      {/* ---- existant : le mur de meulière, en poché ---- */}
      <path
        className="existant-plein"
        fillRule="evenodd"
        d="M60,26 H300 V148 H60 Z M69,35 H291 V139 H69 Z"
      />
      <path className="existant" d="M60,26 H300 V148 H60 Z" />
      <path className="existant" d="M69,35 H291 V139 H69 Z" />
      {/* les refends conservés */}
      <rect className="existant-plein" x="168" y="35" width="7" height="104" />
      <path className="existant" d="M168,35 V139 M175,35 V139" />
      <rect className="existant-plein" x="175" y="84" width="116" height="7" />
      <path className="existant" d="M175,84 H291 M175,91 H291" />

      {/* ---- déposé : les cloisons de carreau de plâtre ---- */}
      <path className="depose" d="M112,35 V139 M175,116 H291 M231,91 V139" />

      {/*
        Les trois souches. Le tireté courant (4 3) ne place que deux
        traits par côté sur un carré de douze : la forme se disloque et
        ne se lit plus comme un carré. Ces trois-là prennent donc un
        tireté serré — écrit en style *en ligne*, parce qu’une règle de
        classe l’emporterait sur l’attribut de présentation et le
        `stroke-dasharray` de `.depose` reviendrait aussitôt.
      */}
      {cheminees.map(([x, y], i) => (
        <g key={i}>
          <rect
            className="depose"
            style={{ strokeDasharray: "1.6 1.4" }}
            x={x - 6}
            y={y}
            width="12"
            height="12"
          />
          <rect
            className="depose"
            style={{ strokeDasharray: "1.6 1.4" }}
            x={x - 2}
            y={y + 3.5}
            width="4"
            height="5"
          />
        </g>
      ))}

      {/* ---- projeté : l’extension, détachée du mur ancien ---- */}
      <path className="projete" d="M104,186 H236 V232 H104 Z" />
      {/* le passage vitré, bas */}
      <path className="projete" d="M154,162 V186 M186,162 V186" />

      {/* Le joint creux : le mur ancien se voit sur toute sa hauteur. */}
      <path className="cote-dessin" d="M170,148 V162 M165,148 H175 M165,162 H175" />
      <text className="texte-dessin" x="200" y="158" textAnchor="start">
        joint 80
      </text>

      <text className="texte-dessin" x="180" y="18" textAnchor="middle">
        meulière 1902 — conservée
      </text>
      <text className="texte-dessin" x="115" y="66" textAnchor="middle">
        salon
      </text>
      <text className="texte-dessin" x="233" y="64" textAnchor="middle">
        salle à manger
      </text>
      {/* Sous la cloison déposée de y=116, pas dessus. */}
      <text className="texte-dessin" x="233" y="131" textAnchor="middle">
        cuisine
      </text>
      <text className="texte-dessin" x="170" y="212" textAnchor="middle">
        extension 28 m²
      </text>

      <text className="texte-dessin" x="330" y="45" textAnchor="start">
        cloisons
      </text>
      <text className="texte-dessin" x="330" y="55" textAnchor="start">
        déposées
      </text>
      <Renvoi d="M328,50 H305" fleche={[305, 50, 5]} />
    </Planche>
  );
}

/* ------------------------------------------------------------------ */
/*  5 — Surélévation Ramponneau : coupe sur la façade rue              */
/* ------------------------------------------------------------------ */

function Surelevation() {
  /* Les planchers existants, du haut vers le bas. */
  const planchers = [129, 150, 171, 192, 213];
  /* Le haut de chaque niveau, pour y centrer les baies. */
  const niveaux = [111, 129, 150, 171, 192, 213];
  const joints = [155, 200, 245];
  return (
    <Planche titre="Coupe sur la façade rue : l’immeuble de 1936 resté occupé, le comble à surcroît déposé, le chevêtre d’acier et les deux niveaux de caissons bois posés dessus.">
      {/* ---- existant : l’immeuble de 1936 ---- */}
      <path className="existant" d="M92,234 H308" />
      <path className="existant" d="M110,234 V111 M290,234 V111" />
      {planchers.map((y) => (
        <path key={y} className="existant" d={`M110,${y} H290`} />
      ))}
      {/* les deux refends porteurs : ils décident de tout le projet */}
      <rect className="existant-plein" x="167" y="111" width="6" height="123" />
      <rect className="existant-plein" x="227" y="111" width="6" height="123" />
      <path
        className="existant"
        d="M167,111 V234 M173,111 V234 M227,111 V234 M233,111 V234"
      />
      {/* les baies, centrées dans chaque niveau */}
      {niveaux.map((haut) =>
        [128, 189, 250].map((x) => (
          <rect
            key={`${haut}-${x}`}
            className="existant"
            x={x}
            y={haut + 5}
            width="21"
            height="11"
          />
        )),
      )}

      {/*
        Le comble déposé occupait exactement la place que prennent
        aujourd’hui les caissons : le dessiner à cet endroit
        superposerait deux états et ne se lirait plus. Il est donc porté
        en marge, comme une note, et relié par un renvoi.
      */}
      <path className="depose" d="M20,111 L58,88 L96,111 Z" />
      <text className="texte-dessin" x="58" y="82" textAnchor="middle">
        comble déposé
      </text>
      <Renvoi d="M96,105 H110" />

      {/* ---- projeté : le chevêtre puis les deux niveaux ---- */}
      <rect className="projete-plein" x="104" y="103" width="192" height="8" />
      <path className="projete" d="M110,103 V47 M290,103 V47 M110,47 H290 M110,75 H290" />
      {joints.map((x) => (
        <path key={x} className="projete" d={`M${x},103 V47`} />
      ))}
      {/* la descente de charge : sur les refends, pas sur la façade */}
      {[170, 230].map((x) => (
        <path
          key={x}
          className="cote-dessin"
          d={`M${x},95 V125 M${x - 3},119 L${x},125 L${x + 3},119`}
        />
      ))}

      <text className="texte-dessin" x="200" y="36" textAnchor="middle">
        2 niveaux de caissons bois préfabriqués — + 780 m²
      </text>
      <text className="texte-dessin" x="304" y="110" textAnchor="start">
        chevêtre
      </text>
      <text className="texte-dessin" x="200" y="247" textAnchor="middle">
        immeuble 1936 — resté occupé pendant les 22 mois
      </text>
    </Planche>
  );
}

/* ------------------------------------------------------------------ */
/*  6 — Halle des Deux-Ponts : plan d’ensemble                         */
/* ------------------------------------------------------------------ */

function Halle() {
  const portiques = Array.from({ length: 13 }, (_, i) => 28 + i * (344 / 12));
  const etals = Array.from({ length: 22 }, (_, i) => 78 + i * 10);
  return (
    <Planche titre="Plan d’ensemble de la halle : les treize portiques de 1954 conservés, les trois volumes rapportés déposés, la bande programmée de six mètres le long de la façade nord.">
      {/* ---- existant : la halle de 1954 ---- */}
      <path className="existant" d="M28,42 H372 V214 H28 Z" />
      {portiques.map((x, i) => (
        <g key={i}>
          <rect className="existant-plein" x={x - 3} y="42" width="6" height="10" />
          <rect className="existant-plein" x={x - 3} y="204" width="6" height="10" />
          <path className="existant" d={`M${x},52 V204`} opacity={0.24} />
        </g>
      ))}

      {/* ---- déposé : les trois volumes rapportés ---- */}
      <rect className="depose" x="120" y="128" width="62" height="52" />
      <rect className="depose" x="212" y="152" width="56" height="46" />
      <rect className="depose" x="294" y="118" width="52" height="42" />
      <text className="texte-dessin" x="151" y="157" textAnchor="middle">
        1971
      </text>
      <text className="texte-dessin" x="240" y="178" textAnchor="middle">
        1986
      </text>
      <text className="texte-dessin" x="320" y="142" textAnchor="middle">
        1999
      </text>

      {/* ---- projeté : la bande de six mètres au nord ---- */}
      <path className="projete" d="M28,42 H372 V85 H28" />
      <path className="projete" d="M74,42 V85 M300,42 V85" />
      {etals.map((x, i) => (
        <rect
          key={i}
          className="projete-plein"
          x={x}
          y="56"
          width="6"
          height="20"
          opacity={0.5}
        />
      ))}
      {/* le rideau d’acier qui ferme la salle */}
      <path className="depose" d="M300,85 H372" />

      <text className="texte-dessin" x="51" y="67" textAnchor="middle">
        rés.
      </text>
      <text className="texte-dessin" x="187" y="99" textAnchor="middle">
        22 étals
      </text>
      <text className="texte-dessin" x="336" y="67" textAnchor="middle">
        salle
      </text>
      <text className="texte-dessin" x="200" y="238" textAnchor="middle">
        halle 1954 — 13 portiques conservés, 1 000 m² laissés libres
      </text>
      <Cote x1={28} x2={372} y={30} texte="48,00 m" />
    </Planche>
  );
}

/* ------------------------------------------------------------------ */

const PLANCHES: Record<string, () => React.ReactElement> = {
  "ateliers-de-la-fonderie-montreuil": Fonderie,
  "maison-a-cour-montreuil": MaisonACour,
  "brasserie-du-canal-pantin": Brasserie,
  "maison-de-maitre-nogent": MaisonDeMaitre,
  "surelevation-ramponneau-paris": Surelevation,
  "halle-des-deux-ponts-ivry": Halle,
};

export default function Schema({ slug }: { slug: string }) {
  const Dessin = PLANCHES[slug];
  if (!Dessin) return null;
  return <Dessin />;
}
