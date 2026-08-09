# PASUPA• — site 12, la synthèse

Douzième et dernière direction de la série. Les onze précédentes exploraient
chacune un parti graphique ou structurel ; celle-ci ne cherche rien de neuf.
Elle reprend, de chacune, ce qui avait été retenu à la relecture, et en fait
un site sobre, complet et fini.

**Tout est fictif** — l'agence, les associés, l'équipe, les projets, les
communes, les concours, les distinctions, les surfaces et les montants.
Aucune ressemblance avec une agence réelle n'est voulue.

## Ce qui vient d'où

| Élément | Repris du |
| --- | --- |
| Description à gauche / fiche technique à droite, alignées en haut **et** en bas | site 1 |
| Mini-texte sous le titre, avant la description longue | site 1 |
| « Revenir à tous les projets », étoile de page courante, équipe à ronds | site 1 |
| Frise du parcours à grosses dates en colonne de gauche | sites 1 et 3 |
| **La typographie** — Bricolage Grotesque, Public Sans, Spline Sans Mono | site 3 |
| Convention existant / déposé / projeté, filets entre les projets, légende sous le dessin | site 3 |
| Navigation à quatre entrées, trait sous la page courante, gros point après le nom | site 3 |
| « Voir tous les projets », chiffres clés, grand appel au rendez-vous en fin de page | site 4 |
| Précédent **et** suivant, ordre chronologique, prix et concours en page agence | site 4 |
| Dégradé chaud, sans bande visible (le site 5 était trop sombre — celui-ci reste clair) | sites 5 et 7 |
| Concours détaillés, dates, récompenses, y compris les concours perdus | site 6 |
| Matières avec leur petit dessin en légende | site 7 |
| Questions fréquentes | site 8 |
| Fil d'Ariane en chemin de fichier, navigation centrée, « Prendre rendez-vous » en haut à droite | site 11 |
| Données structurées, titres et descriptions uniques, plan du site généré | site 11 |

## Trois arbitrages

Le cahier des charges se contredisait sur trois points. Ils ont été tranchés
avec le client avant construction :

1. **La FAQ.** Le texte demandait cinq pages, la liste de contrôle en exigeait
   quatre et « uniquement ces quatre ». Les questions vivent donc en bas de la
   page Contact, à l'ancre `#questions`, avec un lien direct dans le pied de
   page de toutes les pages. La navigation reste à quatre entrées.
2. **Le nombre de projets.** Quatre projets rendaient « Voir tous les projets »
   et la navigation précédent / suivant sans objet. Il y en a six ; l'accueil
   met en avant les quatre derniers.
3. **Le dégradé.** Un dégradé courant sur toute la hauteur de page fait varier
   le contraste du texte et retombe à un endroit différent sur chaque page. Il
   est donc fixe : marron clair sous l'en-tête, blanc franc au bout de neuf
   cents pixels, puis plus rien. Le corps de lecture est toujours sur du blanc.

## Technique

Next.js 16 (App Router) + Tailwind v4. **Aucune dépendance d'exécution** en
dehors de `next`, `react` et `react-dom` : pas de GSAP, pas de Lenis, pas de
bibliothèque d'animation. Les quinze routes sont statiques.

- **Aucune ressource tierce.** Les polices sont téléchargées à la construction
  et servies depuis le domaine ; la politique de sécurité (`font-src 'self'`)
  refuse tout le reste. Vérifié : le navigateur ne contacte que l'origine.
- **Aucune photographie.** Les six opérations sont représentées par des plans
  et des coupes dessinés à la main dans `src/components/Schema.tsx`, tous dans
  le même cadre de 400 × 250, avec la même convention de trait.
- **Le mouvement est un supplément.** Sans JavaScript la page est complète et
  immobile ; c'est un état acceptable, et il est testé.
- **Une carte de partage** générée à la construction (`opengraph-image.tsx`),
  dans la palette du site, avec la convention de trait pour signature.
- **La typographie est française.** Espaces insécables avant les ponctuations
  doubles, fines devant `;` `!` `?` `%` et dans les milliers, apostrophes
  courbes, guillemets qui tiennent leur texte. Le sous-ensemble « latin » des
  trois polices couvre U+2000-206F : ces caractères sont dessinés dans les
  fichiers servis, pas remplacés par un caractère de secours.

### Palette

Tous les couples texte / fond atteignent AA (4,5:1), y compris sur la partie
la plus soutenue du dégradé. Il n'y a volontairement que deux gris : un
troisième, plus clair, mesurait 4,01:1 et a été retiré.

| Jeton | Valeur | Emploi |
| --- | --- | --- |
| `--brun-pale` | `#dcc6a8` | haut du dégradé, fond de l'en-tête |
| `--brun-pied` | `#d5bd9d` | pied de page |
| `--creme` | `#f7f2ea` | cartouches, appel au rendez-vous |
| `--blanc` | `#ffffff` | corps de lecture |
| `--encre` | `#241d17` | texte — 16,6:1 sur blanc, 8,3:1 au pire |
| `--gris` | `#6a5f53` | texte secondaire — 6,2:1 sur blanc |
| `--brun` | `#7c5b39` | accent — 6,2:1 sur blanc |
| `--bord-champ` | `#8f7e64` | bordure de champ — 3,9:1, seuil 1.4.11 tenu |

L'en-tête et le pied de page déclarent le contexte `.sur-brun`, qui rabaisse
`--gris` et `--brun` : sur un fond chaud, le gris courant tombe à 3,1:1.

## Démarrer

```bash
npm install
npm run dev     # http://localhost:3011
npm run build && npm start
```

`NEXT_PUBLIC_SITE_URL` définit l'origine (par défaut `https://www.pasupa.fr`,
domaine fictif). Elle est lue **à la construction** : `next.config.ts` n'émet
`upgrade-insecure-requests` et HSTS que si elle déclare une origine `https://`.
En clair : ne pas la renseigner en HTTP local, sinon Safari réécrit
`http://localhost:3011` en `https://` et tombe sur un port mort — la spécification
exempte `localhost`, Chromium l'applique, WebKit non.

## Mettre en ligne

Netlify, par le dépôt git. `netlify.toml` déclare tout : la commande, le
dossier publié et la version de Node (épinglée à 22, la même que
`.nvmrc`). Rien à régler dans l'interface, à une exception près, ci-dessous.

Le site est **entièrement statique** — dix-huit routes préconstruites,
aucune fonction, aucune base, aucun appel réseau à l'exécution, et un
formulaire qui ne poste nulle part et le dit. Il n'y a donc rien à
prévoir côté serveur.

### La seule variable qui compte

`NEXT_PUBLIC_SITE_URL` est lue **à la construction**, et elle nomme tout :
canoniques, plan du site, `@id` des données structurées, origine de
l'image Open Graph, activation de HSTS. Sans elle, tout cela désigne
`https://www.pasupa.fr`, le domaine fictif de la démonstration : le site
se déploierait sans une erreur et se référencerait de travers, ce qui est
la pire des deux pannes.

La commande de construction s'en prémunit :

```toml
command = "NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL:-$URL} npm run build"
```

La variable posée dans le projet Netlify l'emporte ; à défaut, c'est
`$URL`, que Netlify définit lui-même à l'adresse de production. Le
domaine fictif n'est donc jamais atteint en ligne. Les deux cas ont été
éprouvés avant le premier déploiement.

### Le site n'est pas indexable, et c'est voulu

L'agence, ses associés, ses six opérations, son adresse, son numéro
d'ordre et son numéro RCS sont inventés. `next.config.ts` pose donc
`X-Robots-Tag: noindex, follow` sur toutes les adresses.

C'est un en-tête et non un `Disallow` de `robots.txt`, pour la raison
déjà exposée dans `src/app/robots.ts` : un robot qui respecte
l'interdiction ne charge jamais la page, ne lit donc jamais la consigne
qu'elle porte, et peut indexer l'adresse sur la foi des liens qui la
désignent. Des deux, seule celle que le robot peut lire fait ce qu'on
attend d'elle. Le plan du site reste émis — il fait partie de ce que la
démonstration montre, et un plan de site n'indexe rien par lui-même.

`NEXT_PUBLIC_INDEXABLE=oui` lève l'interdiction, le jour où ce gabarit
portera le nom d'une agence réelle. Ce jour-là seulement.

### Après le premier déploiement

Les en-têtes viennent de `next.config.ts` et non d'un `public/_headers`,
parce que plusieurs dépendent de conditions calculées à la construction.
Le runtime Next de Netlify est censé les appliquer ; ça se vérifie d'une
ligne :

```bash
curl -sI https://VOTRE-SITE.netlify.app/ \
  | grep -i 'content-security-policy\|x-robots-tag\|strict-transport'
```

S'ils manquent, il faudra les reporter dans `public/_headers`, qui
deviendra alors la source unique.

HSTS est à un an **sans `preload`** : le `preload` inscrit le domaine
dans une liste compilée à l'intérieur des navigateurs, dont on ne sort
qu'au bout de plusieurs mois. C'est une décision qui se prend pour un
domaine qu'on possède et qu'on gardera.

## Vérifier

La vérification est outillée : sept scripts dans `scripts/`, tous
exécutables séparément, aucun ne demande de dépendance supplémentaire.

```bash
npm run verifier        # sans navigateur : lint, typographie, cohérence, build
npm start &             # puis, sur le site rendu :
npm run verifier:rendu  # audit, sémantique, liens, clavier, robustesse
```

| Script | Ce qu'il empêche |
| --- | --- |
| `npm run coherence` | Qu'une fiche annonce quatorze mois de chantier et une livraison qui n'en compte que treize. Il refait les calculs : livraison = fin des études + durée, coût au mètre carré dans la fourchette publiée par la FAQ, concours antérieur aux études qu'il a lancées, effectif de la frise égal au nombre de personnes réellement arrivées à cette date, listes datées en ordre décroissant, totaux qui s'additionnent. |
| `npm run typographie` | Qu'une apostrophe droite ou une espace sécable avant un « : » se glisse dans la prose. Corrige avec `--ecrire`. Ne touche **que** la prose — un premier jet appliquait les règles à toute chaîne et a inséré une insécable dans `mt-0.5 h-6`, fusionnant deux classes, puis dans un chemin SVG, où l'insécable n'est pas une espace valide. |
| `npm run audit` | 12 pages × 8 largeurs (320 → 1920), **page 404 comprise** : débordement horizontal, contraste réel après composition des fonds, cibles sous 24 px, identifiants dupliqués, plan des titres, champs sans étiquette, repères sans nom, typographie du HTML rendu, titres, descriptions et **canoniques** dupliqués, JSON-LD analysable. |
| `npm run semantique` | Que le HTML produit ne soit pas celui qu'on croit avoir écrit. JSX ne valide rien : il accepte un `<div>` dans un `<p>`, un `<a>` dans un `<a>`, un `aria-labelledby` qui ne désigne personne. Le navigateur répare en silence et l'arbre d'accessibilité cesse de ressembler à ce qu'on voit. Vérifie aussi le critère 2.5.3 (le nom accessible doit contenir le texte visible, sans quoi la commande vocale ne peut pas actionner ce qu'on lit), les inversions d'ordre entre CSS et document, et les données structurées en profondeur — `@id` qui résolvent, propriétés requises, dates ISO. |
| `npm run liens` | Qu'un lien mène nulle part. Il part du plan du site, suit chaque lien de chaque page, et vérifie que les routes répondent, que les ancres existent **dans la page visée** et non seulement dans celle d'où l'on part, que `tel:` est en E.164 et que `mailto:` correspond au canon de l'agence. Il refuse aussi qu'un `Disallow` de `robots.txt` porte sur une page en `noindex` — c'est ce qu'il a trouvé au premier passage. |
| `npm run clavier` | Ce que seuls le clavier et le doigt révèlent : bouton « Fermer » atteignable au pointeur, focus retenu dans le menu ouvert, Échap qui rend le focus, lien d'évitement qui déplace vraiment le focus, et **le focus du formulaire** — qui doit suivre la confirmation quand elle remplace le formulaire, au lieu de retomber sur le corps du document. |
| `npm run robustesse` | Zoom 200 % (1.4.4) **et 400 %** (1.4.10, soit 320 × 256 CSS), espacement du texte du critère 1.4.12, couleurs forcées, JavaScript coupé, plus le poids transféré et le décalage cumulé. |

### Second passage — ce qu'a trouvé l'élargissement de la couverture

Trois défauts que le premier passage ne pouvait pas voir, parce qu'aucun
script ne regardait là :

1. **`robots.txt` interdisait `/mentions-legales`, qui porte un
   `noindex`.** Les deux consignes s'annulent : un robot qui respecte
   l'interdiction ne charge jamais la page, ne lit donc jamais le
   `noindex` qu'elle porte, et peut indexer l'adresse sur la foi des
   liens qui pointent vers elle — sans résumé, puisqu'il n'a rien pu
   lire. Le `Disallow` est retiré ; `npm run liens` refuse désormais
   tout `Disallow` posé sur une page en `noindex`.
2. **La page 404 se déclarait canonique de l'accueil.** Elle héritait de
   l'`alternates.canonical` de la mise en page racine. Un moteur la
   rangeait donc parmi les doublons de l'accueil plutôt que de la
   traiter comme une erreur — en contradiction avec son propre
   `noindex`. Elle était aussi la seule page qu'aucun script ne
   regardait ; elle est maintenant dans la liste de `audit.mjs`.
3. **Le formulaire perdait le focus.** Envoyer remplace le bloc entier
   par la confirmation, et revenir fait l'inverse : dans les deux cas
   l'élément qui avait le focus quitte le document et le focus retombe
   sur `<body>`. La personne au clavier se retrouvait au début de la
   page sans savoir que quelque chose avait répondu. Corrigé, et
   verrouillé par quatre tests dans `clavier.mjs`.

Au passage : l'aide d'un champ disparaissait quand une erreur
survenait, alors que `aria-describedby` continuait de la citer — un
renvoi vers un identifiant absent du document, invisible à l'écran
comme à la relecture, et muet au lecteur d'écran.

### État au dernier passage

Aucun constat sur 12 pages × 8 largeurs. 297 liens vérifiés sur 13
pages, aucune route morte ni ancre absente. Zoom 200 % et 400 %, espacement forcé,
couleurs système et JavaScript coupé : rien à signaler. 292 ko transférés
au total dont 152 ko de script, LCP 28 ms, décalage cumulé nul. Ouvert
dans le vrai Safari — l'adresse n'est pas réécrite en `https`.

Playwright WebKit se bloque à `newPage()` sur cette machine ; la
vérification Safari passe donc par `open -a Safari` et la lecture de
l'URL de l'onglet.
