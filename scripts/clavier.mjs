/**
 * Ce que seul le clavier — et le doigt — révèlent.
 *
 * Trois défauts de cette série de sites n'ont été trouvés ni à l'œil ni
 * par un audit de contraste, mais en tabulant et en touchant l'écran :
 *
 *   — le bouton « Fermer » passé sous son propre voile, atteignable au
 *     clavier mais pas au doigt ;
 *   — la tabulation qui s'échappe du menu ouvert et parcourt, un par un,
 *     des liens que l'écran ne montre plus ;
 *   — le lien d'évitement qui déplace la page sans déplacer le focus,
 *     si bien que la tabulation suivante repart de ce qu'on venait de
 *     sauter.
 *
 * Les trois sont vérifiés ici, à chaque passage.
 *
 *     node scripts/clavier.mjs [http://localhost:3011]
 */

import { chromium } from "/Users/sulianbrouard-heulluy/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs";

const BASE = process.argv.find((a) => a.startsWith("http")) ?? "http://localhost:3011";
const constats = [];
const ko = (q) => constats.push(q);

const nav = await chromium.launch();

/* ------------------------------------------------------------------ */
/*  Le menu du téléphone                                               */
/* ------------------------------------------------------------------ */
{
  const ctx = await nav.newContext({ viewport: { width: 390, height: 780 }, hasTouch: true });
  const p = await ctx.newPage();
  p.setDefaultTimeout(9000);
  await p.goto(BASE + "/projets", { waitUntil: "networkidle" });

  const ouvrir = () => p.getByRole("button", { name: /Ouvrir le menu/ }).click();
  const fermer = () => p.getByRole("button", { name: /Fermer le menu/ }).click();
  const estOuvert = () => p.evaluate(() => !!document.getElementById("menu-mobile"));

  await ouvrir();
  await p.waitForTimeout(220);

  /* 1. Le bouton de fermeture est-il vraiment sous le doigt ? */
  const b = await p.getByRole("button", { name: /Fermer le menu/ }).boundingBox();
  const dessus = await p.evaluate(
    ({ x, y }) => {
      const e = document.elementFromPoint(x, y);
      return e?.closest("button") ? "le bouton" : (e?.tagName ?? "rien");
    },
    { x: b.x + b.width / 2, y: b.y + b.height / 2 },
  );
  if (dessus !== "le bouton") ko(`menu — sous le bouton Fermer, on touche « ${dessus} »`);

  /* 2. La tabulation reste-t-elle dans l'en-tête ? */
  const parcours = [];
  for (let i = 0; i < 14; i++) {
    await p.keyboard.press("Tab");
    parcours.push(
      await p.evaluate(() => !!document.activeElement?.closest("header")),
    );
  }
  const fuites = parcours.filter((x) => !x).length;
  if (fuites) ko(`menu — ${fuites} arrêt(s) de tabulation derrière le voile`);

  /* 3. Le voile est-il annoncé comme un dialogue nommé ? */
  const role = await p.evaluate(() => {
    const m = document.getElementById("menu-mobile");
    return { role: m?.getAttribute("role"), nom: m?.getAttribute("aria-label") };
  });
  if (role.role !== "dialog" || !role.nom) ko(`menu — voile sans rôle ni nom (${JSON.stringify(role)})`);

  /* 4. Échap referme et rend le focus au bouton. */
  await p.keyboard.press("Escape");
  await p.waitForTimeout(180);
  if (await estOuvert()) ko("menu — Échap ne referme pas");
  /* Le bouton se reconnaît à `aria-expanded`, qu'il porte dans les deux
     états — et non à `aria-controls`, qui ne désigne le voile que
     lorsque le voile existe. */
  const rendu = await p.evaluate(
    () => document.activeElement?.hasAttribute("aria-expanded") === true,
  );
  if (!rendu) ko("menu — le focus n'est pas rendu au bouton après Échap");

  /* 5. Le bouton referme, et la navigation aussi. */
  await ouvrir();
  await p.waitForTimeout(180);
  await fermer();
  await p.waitForTimeout(180);
  if (await estOuvert()) ko("menu — le bouton ne referme pas");

  await ouvrir();
  await p.waitForTimeout(180);
  await p.locator("#menu-mobile").getByRole("link", { name: /Agence/ }).click();
  await p.waitForURL("**/agence");
  await p.waitForTimeout(320);
  if (await estOuvert()) ko("menu — reste ouvert après navigation");

  /* 6. La page derrière ne défile plus quand le menu est ouvert. */
  await ouvrir();
  await p.waitForTimeout(180);
  const bloque = await p.evaluate(() => getComputedStyle(document.body).overflow === "hidden");
  if (!bloque) ko("menu — la page continue de défiler derrière le voile");

  await ctx.close();
}

/* ------------------------------------------------------------------ */
/*  Le lien d'évitement                                                */
/* ------------------------------------------------------------------ */
{
  const ctx = await nav.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });

  await p.keyboard.press("Tab");
  await p.waitForTimeout(380); // laisser la transition finir avant de mesurer
  const saut = await p.evaluate(() => {
    const e = document.activeElement;
    const b = e.getBoundingClientRect();
    return { texte: e.textContent.trim(), haut: Math.round(b.top), cerne: getComputedStyle(e).outlineStyle };
  });
  if (!/contenu/i.test(saut.texte)) ko(`clavier — le premier tabulable n'est pas le lien d'évitement (« ${saut.texte} »)`);
  if (saut.haut < 0) ko(`clavier — le lien d'évitement reste hors écran (${saut.haut} px)`);
  if (saut.cerne === "none") ko("clavier — le lien d'évitement n'a pas d'anneau de focus");

  await p.keyboard.press("Enter");
  await p.waitForTimeout(280);
  const cible = await p.evaluate(() => document.activeElement?.id);
  if (cible !== "contenu") ko(`clavier — après le saut, le focus est sur « ${cible || "body"} » et non sur le contenu`);

  /* L'anneau de focus doit se voir sur chaque type de commande. */
  const sansAnneau = await p.evaluate(() => {
    const manque = [];
    for (const sel of [".bouton", ".lien", "summary", ".champ"]) {
      const el = document.querySelector(sel);
      if (!el) continue;
      el.focus?.();
      const s = getComputedStyle(el, ":focus-visible");
      if (s.outlineStyle === "none" && s.boxShadow === "none") manque.push(sel);
    }
    return manque;
  });
  sansAnneau.forEach((s) => ko(`clavier — pas d'anneau de focus visible sur ${s}`));

  await ctx.close();
}

/* ------------------------------------------------------------------ */
/*  Le formulaire : là où le focus se perd                             */
/* ------------------------------------------------------------------ */
{
  const ctx = await nav.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  p.setDefaultTimeout(9000);
  await p.goto(BASE + "/contact", { waitUntil: "networkidle" });

  const envoyer = () => p.getByRole("button", { name: /Envoyer la demande/ }).click();
  const focus = () =>
    p.evaluate(() => {
      const e = document.activeElement;
      if (!e || e === document.body) return { ou: "body" };
      return {
        ou: e.tagName.toLowerCase(),
        nom: e.getAttribute("name") ?? e.textContent?.trim().slice(0, 40) ?? "",
        decrit: e.getAttribute("aria-describedby") ?? "",
      };
    });

  /* 1. Soumission vide : le focus va au premier champ fautif, et son
        message d'erreur lui est bien rattaché. */
  await envoyer();
  await p.waitForTimeout(180);
  let f = await focus();
  if (f.ou !== "input" || f.nom !== "nom")
    ko(`formulaire — après une soumission vide, le focus est sur « ${f.ou} ${f.nom ?? ""} » et non sur le premier champ fautif`);
  if (!f.decrit) ko("formulaire — le champ fautif ne cite aucun message d'erreur");

  /* 2. Aucun `aria-describedby` ne doit pointer dans le vide. Un renvoi
        mort ne se voit qu'au lecteur d'écran, qui n'annonce alors rien. */
  const morts = await p.evaluate(() =>
    [...document.querySelectorAll("[aria-describedby]")]
      .flatMap((e) =>
        e.getAttribute("aria-describedby").split(/\s+/).filter(Boolean)
          .filter((id) => !document.getElementById(id))
          .map((id) => `${e.getAttribute("name") || e.tagName} → #${id}`),
      ),
  );
  morts.forEach((m) => ko(`formulaire — aria-describedby pointe dans le vide : ${m}`));

  /* 3. Soumission valide : le formulaire disparaît, et le focus doit
        partir avec la confirmation — pas retomber sur le corps. */
  await p.fill('input[name="nom"]', "Camille Delaunay");
  await p.fill('input[name="courriel"]', "camille@example.org");
  await p.fill(
    'textarea[name="message"]',
    "Une maison de 1930 à Montreuil, 110 m², ouvrir le rez-de-chaussée.",
  );
  await p.check('input[name="accord"]');
  await envoyer();
  await p.waitForTimeout(220);

  const dansConfirmation = await p.evaluate(() => {
    const e = document.activeElement;
    return !!e && e !== document.body && !!e.querySelector("h3");
  });
  if (!dansConfirmation) {
    f = await focus();
    ko(`formulaire — après envoi, le focus est sur « ${f.ou} » au lieu de la confirmation`);
  }

  /* 4. Le retour au formulaire rend le focus au premier champ. */
  await p.getByRole("button", { name: /Revenir au formulaire/ }).click();
  await p.waitForTimeout(220);
  f = await focus();
  if (f.ou !== "input" || f.nom !== "nom")
    ko(`formulaire — au retour, le focus est sur « ${f.ou} » et non sur le premier champ`);

  await ctx.close();
}

await nav.close();

console.log("CLAVIER ET POINTEUR");
if (constats.length) {
  for (const c of constats) console.log("  ✗ " + c);
  process.exit(1);
}
console.log("  menu du téléphone, retenue du focus, lien d'évitement, formulaire : rien à signaler");
