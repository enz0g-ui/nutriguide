/* =====================================================
   NutriGuide — Logique applicative
   ===================================================== */
"use strict";

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const ALIMENTS_MAP = Object.fromEntries(ALIMENTS.map(a => [a.id, a]));
const ALIMENTS_BY_NAME = Object.fromEntries(ALIMENTS.map(a => [a.nom.toLowerCase(), a]));

const MEAL_TYPES = [
  ["pdej", "Petit-déjeuner"],
  ["dej", "Déjeuner"],
  ["col", "Collation"],
  ["diner", "Dîner"]
];
const JOURS_SEMAINE = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

/* ---------- État & stockage ---------- */
const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem("nutriguide_" + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem("nutriguide_" + key, JSON.stringify(val)); } catch {}
  }
};

let editorMenu = store.get("editor_menu", null) || newEmptyMenu(1);
let currentDay = 0;
let lastGenerated = null;

function newEmptyMenu(nbDays) {
  return {
    nom: "",
    mode: nbDays,
    target: getTarget(),
    days: Array.from({ length: nbDays }, () => newEmptyDay())
  };
}
function newEmptyDay() {
  const d = {};
  MEAL_TYPES.forEach(([key]) => { d[key] = { nom: "", items: [] }; });
  return d;
}
function getTarget() { return store.get("target_kcal", 2000); }
function setTarget(v) {
  store.set("target_kcal", v);
  $("#gen-kcal").value = v;
  $("#edit-kcal").value = v;
}

/* ---------- Calculs nutritionnels ---------- */
function itemNutrition(item) {
  const a = ALIMENTS_MAP[item.id];
  if (!a) return { kcal: 0, p: 0, g: 0, l: 0 };
  const f = item.g / 100;
  return { kcal: a.kcal * f, p: a.p * f, g: a.g * f, l: a.l * f };
}
function sumNutrition(items) {
  return items.reduce((acc, it) => {
    const n = itemNutrition(it);
    acc.kcal += n.kcal; acc.p += n.p; acc.g += n.g; acc.l += n.l;
    return acc;
  }, { kcal: 0, p: 0, g: 0, l: 0 });
}
function dayNutrition(day) {
  return sumNutrition(MEAL_TYPES.flatMap(([key]) => day[key].items));
}
function templateKcal(template) {
  return sumNutrition(template.items.map(([id, g]) => ({ id, g }))).kcal;
}
function fmtKcal(n) { return Math.round(n).toLocaleString("fr-FR"); }
function dayLabel(i, mode, short) {
  if (mode === 1) return "Votre journée";
  if (mode === 7) return JOURS_SEMAINE[i];
  return short
    ? `S${Math.floor(i / 7) + 1} ${JOURS_SEMAINE[i % 7].slice(0, 3)}`
    : `Semaine ${Math.floor(i / 7) + 1} — ${JOURS_SEMAINE[i % 7]}`;
}
function modeLabel(mode) {
  if (mode === 1) return "1 jour";
  if (mode === 7) return "Semaine complète";
  if (mode === 14) return "2 semaines";
  if (mode === 21) return "3 semaines";
  if (mode === 28) return "1 mois";
  return `${mode} jours`;
}

/* ---------- Dates & calendrier ---------- */
const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
function dateOfDay(menu, i) {
  const d = new Date(menu.startDate + "T12:00:00");
  d.setDate(d.getDate() + i);
  return d;
}
function fmtDateLong(d) {
  const s = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function fmtDateShort(d) {
  const s = d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function menuDayTitle(menu, i) {
  return menu.startDate ? fmtDateLong(dateOfDay(menu, i)) : dayLabel(i, menu.mode);
}
function nextMondayISO() {
  const d = new Date();
  d.setDate(d.getDate() + (((8 - d.getDay()) % 7) || 7));
  return d.toISOString().slice(0, 10);
}
function currentMonthOf(startDate) {
  return startDate ? new Date(startDate + "T12:00:00").getMonth() + 1 : new Date().getMonth() + 1;
}
/* Mois (1-12) du i-ème jour d'un programme démarrant à baseISO (ou aujourd'hui) :
   permet d'adapter la saisonnalité au fil des semaines d'un long programme. */
function monthOfOffset(baseISO, i) {
  const d = baseISO ? new Date(baseISO + "T12:00:00") : new Date();
  d.setDate(d.getDate() + i);
  return d.getMonth() + 1;
}
function moisLabel(m) {
  const n = MOIS[m - 1];
  return (/^[aeiouâéè]/.test(n) ? "d'" : "de ") + n;
}

/* ---------- Navigation ---------- */
function showPage(pageId) {
  $$(".page").forEach(p => p.classList.toggle("active", p.id === "page-" + pageId));
  $$(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.page === pageId));
  window.scrollTo({ top: 0 });
}
document.addEventListener("click", (e) => {
  const target = e.target.closest("[data-page]");
  if (target) { e.preventDefault(); showPage(target.dataset.page); }
});

/* ---------- Page Approches ---------- */
function renderApproches() {
  const grid = $("#approches-grid");
  grid.innerHTML = Object.entries(APPROCHES).map(([key, a]) => `
    <article class="approche-card" data-key="${key}">
      <div class="approche-head">
        <span class="approche-emoji">${a.emoji}</span>
        <div>
          <h3>${a.nom}</h3>
          <p>${a.court}</p>
          ${a.lien ? `<a class="approche-lien" href="${a.lien.url}" target="_blank" rel="noopener">📖 En savoir plus — ${a.lien.source} ↗</a>` : ""}
        </div>
        <span class="approche-chevron">▼</span>
      </div>
      <div class="approche-body">
        <h4>Le principe</h4>
        <p>${a.principe}</p>
        <h4>En pratique</h4>
        <ul>${a.pratique.map(x => `<li>${x}</li>`).join("")}</ul>
        <h4>Points forts</h4>
        <div class="badge-list">${a.atouts.map(x => `<span class="badge-ok">✓ ${x}</span>`).join("")}</div>
        <h4>Points de vigilance</h4>
        <div class="badge-list">${a.vigilance.map(x => `<span class="badge-warn">⚠ ${x}</span>`).join("")}</div>
        <div class="approche-try">
          <button class="btn btn-primary btn-sm btn-try-approche" data-key="${key}">🎲 Générer un menu ${a.nom.toLowerCase()}</button>
        </div>
      </div>
    </article>
  `).join("");

  grid.addEventListener("click", (e) => {
    const tryBtn = e.target.closest(".btn-try-approche");
    if (tryBtn) {
      $("#gen-approche").value = tryBtn.dataset.key;
      updateApprocheHint();
      showPage("menus");
      switchSubtab("generateur");
      generateMenu();
      return;
    }
    if (e.target.closest("a")) return; // ne pas replier la carte quand on suit un lien
    const head = e.target.closest(".approche-head");
    if (head) head.closest(".approche-card").classList.toggle("open");
  });
}

/* ---------- Page Besoins ---------- */
function setupBesoins() {
  const saved = store.get("profile", null);
  if (saved) {
    const radio = document.querySelector(`input[name="sexe"][value="${saved.sexe}"]`);
    if (radio) radio.checked = true;
    $("#age").value = saved.age;
    $("#poids").value = saved.poids;
    $("#taille").value = saved.taille;
    $("#activite").value = saved.activite;
    $("#objectif").value = saved.objectif;
  }

  $("#besoins-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const profile = {
      sexe: document.querySelector('input[name="sexe"]:checked').value,
      age: +$("#age").value,
      poids: +$("#poids").value,
      taille: +$("#taille").value,
      activite: +$("#activite").value,
      objectif: +$("#objectif").value
    };
    store.set("profile", profile);

    // Mifflin-St Jeor
    const mb = 10 * profile.poids + 6.25 * profile.taille - 5 * profile.age + (profile.sexe === "h" ? 5 : -161);
    const tdee = mb * profile.activite;
    const cible = Math.round(tdee * (1 + profile.objectif) / 10) * 10;

    $("#res-mb").textContent = fmtKcal(mb);
    $("#res-tdee").textContent = fmtKcal(tdee);
    $("#res-cible").textContent = fmtKcal(cible);

    const m = APPROCHES.equilibre.macros;
    $("#res-macros").innerHTML = macroBarsHtml({
      p: cible * m.p / 4,
      g: cible * m.g / 4,
      l: cible * m.l / 9
    }, cible);

    const resultats = $("#besoins-resultats");
    resultats.classList.remove("hidden");
    resultats.dataset.cible = cible;
    resultats.dataset.tdee = Math.round(tdee);
    resultats.dataset.mb = Math.round(mb);
    $("#planning-output").innerHTML = "";
  });

  $("#btn-use-target").addEventListener("click", () => {
    const cible = +$("#besoins-resultats").dataset.cible;
    if (cible) {
      setTarget(cible);
      editorMenu.target = cible;
      persistEditor();
      renderEditor();
      toast(`Objectif fixé à ${fmtKcal(cible)} kcal/jour pour vos menus`);
      showPage("menus");
    }
  });
}

/* ---------- Planning calorique ---------- */
const PLAN_RECOS = {
  seche: [
    "Visez 1,8 à 2,2 g de protéines par kilo de poids et par jour, réparties sur les 4 repas (au-delà de 2,5 g/kg : aucun bénéfice).",
    "Maintenez vos séances de renforcement : ce sont elles qui « ordonnent » au corps de garder le muscle.",
    "Placez les féculents autour de vos entraînements.",
    "Dormez 7 à 9 h : le manque de sommeil oriente la perte vers le muscle plutôt que le gras.",
    "Après la sèche, remontez les calories progressivement (+100 à 150 kcal par semaine) jusqu'au maintien."
  ],
  perte: [
    "Ne descendez jamais durablement sous votre métabolisme de base.",
    "Protéines et légumes à chaque repas : c'est la satiété qui fait tenir un déficit.",
    "Les paliers sont normaux : gardez le cap 2 à 3 semaines avant d'ajuster.",
    "Un écart ne ruine rien — c'est la moyenne de la semaine qui compte.",
    "Bougez en dehors du sport : 8 000 à 10 000 pas par jour font une vraie différence."
  ],
  prise: [
    "Un surplus modéré suffit : au-delà de +10 %, on prend surtout du gras.",
    "1,6 à 2 g de protéines par kilo et par jour, avec un entraînement en résistance.",
    "Misez sur les aliments denses : oléagineux, flocons d'avoine, huile d'olive, poissons gras.",
    "Prise raisonnable : 1 à 2 kg par mois maximum — pesez-vous chaque semaine."
  ],
  maintien: [
    "Votre repère : un poids stable sur plusieurs semaines, pas au jour le jour.",
    "Gardez la structure de l'équilibre classique (½ légumes, ¼ protéines, ¼ féculents).",
    "Si le poids dérive durablement, ajustez de ±100 à 200 kcal, pas plus."
  ]
};

function planWeekTarget(type, i, tdee, mb) {
  let pct, note;
  switch (type) {
    case "seche":
      if (i === 1) { pct = -0.10; note = "Mise en route, adaptation"; }
      else if (i % 4 === 0) { pct = -0.08; note = "Semaine « pause » — récupération"; }
      else if (i <= 3) { pct = -0.15; note = "Déficit modéré"; }
      else { pct = -0.20; note = "Déficit renforcé"; }
      break;
    case "perte":
      if (i === 1) { pct = -0.10; note = "Mise en route en douceur"; }
      else if (i % 4 === 0) { pct = -0.05; note = "Pause métabolique"; }
      else { pct = -0.15; note = "Déficit modéré"; }
      break;
    case "prise":
      pct = i === 1 ? 0.05 : 0.10;
      note = i === 1 ? "Surplus léger pour démarrer" : "Surplus modéré";
      break;
    default:
      pct = 0; note = "Stabilisation";
  }
  let kcal = Math.round(tdee * (1 + pct) / 10) * 10;
  if (kcal < mb) { kcal = Math.round(mb / 10) * 10; note += " · plancher : métabolisme de base"; }
  return { kcal, note };
}

function renderPlanning() {
  const res = $("#besoins-resultats");
  const tdee = +res.dataset.tdee;
  const mb = +res.dataset.mb;
  if (!tdee) { toast("Calculez d'abord vos besoins ci-dessus"); return; }
  const type = $("#plan-type").value;
  const weeks = +$("#plan-duree").value;

  let totalDelta = 0;
  const rows = [];
  for (let i = 1; i <= weeks; i++) {
    const w = planWeekTarget(type, i, tdee, mb);
    const deltaKg = (tdee - w.kcal) * 7 / 7700; // 1 kg de masse grasse ≈ 7 700 kcal
    totalDelta += deltaKg;
    rows.push({ i, ...w, deltaKg });
  }

  $("#planning-output").innerHTML = `
    <div class="table-wrap plan-wrap">
      <table class="alim-table plan-table">
        <thead><tr>
          <th class="check-col"><input type="checkbox" id="plan-check-all" checked title="Tout cocher / décocher"></th>
          <th>Semaine</th><th class="num">kcal / jour</th><th>Phase</th><th class="num">Est. poids</th>
        </tr></thead>
        <tbody>${rows.map(r => `<tr>
          <td class="check-col"><input type="checkbox" class="plan-week-check" data-week="${r.i}" data-kcal="${r.kcal}" checked></td>
          <td>Semaine ${r.i}</td>
          <td class="num"><strong>${fmtKcal(r.kcal)}</strong></td>
          <td class="cat-cell">${r.note}</td>
          <td class="num">${Math.abs(r.deltaKg) < 0.05 ? "—" : (r.deltaKg > 0 ? "−" : "+") + Math.abs(r.deltaKg).toFixed(1) + " kg"}</td>
        </tr>`).join("")}</tbody>
      </table>
    </div>
    <p class="small-note">Estimation théorique : <strong>${totalDelta >= 0 ? "−" : "+"}${Math.abs(totalDelta).toFixed(1)} kg
      sur ${weeks} semaines</strong> (1 kg de masse grasse ≈ 7 700 kcal). La réalité varie — eau, adaptation, activité :
      pesez-vous 1 fois par semaine maximum, dans les mêmes conditions.</p>
    <div class="plan-generate-row">
      <div class="control">
        <label for="plan-date">Commencer le</label>
        <input type="date" id="plan-date" value="${nextMondayISO()}">
      </div>
      <button class="btn btn-primary" id="btn-plan-generate">🎲 Générer les menus des semaines cochées</button>
    </div>
    <p class="small-note">Cochez les semaines voulues (une, trois, tout le programme…) : chaque semaine de menus
      respectera ses propres calories. Le calendrier démarre à la date choisie.</p>
    <h4 class="plan-reco-title">Recommandations pour réussir</h4>
    <ul class="plan-recos">${PLAN_RECOS[type].map(r => `<li>${r}</li>`).join("")}</ul>
  `;

  $("#plan-check-all").addEventListener("change", (e) => {
    $$(".plan-week-check").forEach(c => { c.checked = e.target.checked; });
  });
  $("#btn-plan-generate").addEventListener("click", () => {
    const weeksSel = $$(".plan-week-check:checked")
      .map(c => ({ num: +c.dataset.week, kcal: +c.dataset.kcal }));
    if (!weeksSel.length) { toast("Cochez au moins une semaine"); return; }
    const startDate = $("#plan-date").value || null;
    generatePlanMenu(weeksSel, startDate, type);
  });
}

function setupPlanning() {
  $("#btn-planning").addEventListener("click", renderPlanning);
}

function macroBarsHtml(grams, kcalTotal) {
  const rows = [
    ["Protéines", "prot", grams.p, grams.p * 4],
    ["Glucides", "gluc", grams.g, grams.g * 4],
    ["Lipides", "lip", grams.l, grams.l * 9]
  ];
  return rows.map(([label, cls, g, kcal]) => {
    const pct = kcalTotal > 0 ? Math.min(100, kcal / kcalTotal * 100) : 0;
    return `<div class="macro-row">
      <span class="macro-name">${label}</span>
      <div class="macro-bar-track"><div class="macro-bar ${cls}" style="width:${pct.toFixed(0)}%"></div></div>
      <span class="macro-val">${Math.round(g)} g · ${Math.round(pct)} %</span>
    </div>`;
  }).join("");
}

/* ---------- Générateur ---------- */
function setupGenerator() {
  const select = $("#gen-approche");
  select.innerHTML = Object.entries(APPROCHES)
    .map(([key, a]) => `<option value="${key}">${a.emoji} ${a.nom}</option>`).join("");
  select.addEventListener("change", updateApprocheHint);
  updateApprocheHint();

  $("#gen-kcal").value = getTarget();
  $("#btn-generer").addEventListener("click", generateMenu);

  // Régimes particuliers : restaurer puis persister
  const savedReg = store.get("regimes", {});
  $("#reg-vegetarien").checked = !!savedReg.vegetarien;
  $("#reg-sansgluten").checked = !!savedReg.sansGluten;
  $("#reg-sanslactose").checked = !!savedReg.sansLactose;
  ["reg-vegetarien", "reg-sansgluten", "reg-sanslactose"].forEach(id => {
    $("#" + id).addEventListener("change", () => store.set("regimes", regimesActifs()));
  });
  $("#reg-saison").checked = !!store.get("saison", false);
  $("#reg-saison").addEventListener("change", () => store.set("saison", $("#reg-saison").checked));
  // Variété : limite la répétition d'une même recette au sein d'une semaine
  $("#reg-variete").checked = store.get("variete", true) !== false;
  $("#reg-variete").addEventListener("change", () => store.set("variete", $("#reg-variete").checked));
}

/* ---------- Régimes particuliers ---------- */
function regimesActifs() {
  return {
    vegetarien: $("#reg-vegetarien").checked,
    sansGluten: $("#reg-sansgluten").checked,
    sansLactose: $("#reg-sanslactose").checked
  };
}
function isMeatOrFish(a) {
  return a.cat === "Poissons & fruits de mer" || (a.cat === "Viandes & œufs" && a.id !== "oeuf");
}
function foodOkForRegimes(a, reg) {
  if (reg.vegetarien && isMeatOrFish(a)) return false;
  if (reg.sansGluten && GLUTEN_IDS.has(a.id)) return false;
  if (reg.sansLactose && LACTOSE_IDS.has(a.id)) return false;
  return true;
}
/* Adapte un repas type aux régimes cochés : substitue quand c'est possible
   (pâtes → riz, beurre → huile…), sinon renvoie null (repas écarté).
   `month` (1-12) : si fourni, écarte les repas contenant des fruits/légumes
   frais hors saison. */
function adaptTemplate(template, reg, month) {
  let adapted = false;
  const items = [];
  for (const [id, g] of template.items) {
    const a = ALIMENTS_MAP[id];
    if (!a) continue;
    if (reg.vegetarien && isMeatOrFish(a)) return null;
    if (month && SAISONS[id] && !SAISONS[id].includes(month)) return null;
    let newId = id;
    if (reg.sansGluten && GLUTEN_IDS.has(newId)) {
      newId = SUBS_SANS_GLUTEN[newId];
      if (!newId) return null;
      adapted = true;
    }
    if (reg.sansLactose && LACTOSE_IDS.has(newId)) {
      newId = SUBS_SANS_LACTOSE[newId];
      if (!newId) return null;
      adapted = true;
    }
    items.push([newId, g]);
  }
  return { items, adapted };
}

function updateApprocheHint() {
  const a = APPROCHES[$("#gen-approche").value];
  $("#gen-approche-hint").textContent = a ? a.court : "";
}

function pickTemplate(pool, avoidIds) {
  if (!pool.length) return null;
  const avoid = avoidIds || [];
  let candidates = pool.filter(x => !avoid.includes(x.t.id));
  if (!candidates.length) candidates = pool;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/* Sélection « variété » : privilégie les recettes encore jamais servies cette
   semaine, puis les moins servies (répartition la plus égale possible quand le
   pool est plus petit que 7). À égalité, évite le repas de la veille. */
function pickTemplateVaried(pool, avoidIds, weekUsed) {
  if (!pool.length) return null;
  const avoid = avoidIds || [];
  const uses = (x) => weekUsed[x.t.id] || 0;
  const minUses = Math.min(...pool.map(uses));
  let candidates = pool.filter(x => uses(x) === minUses);
  const notYesterday = candidates.filter(x => !avoid.includes(x.t.id));
  if (notYesterday.length) candidates = notYesterday;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/* Cœur du générateur : produit nbDays journées pour une approche, une cible
   calorique, des régimes et éventuellement la saisonnalité.
   `monthOf` : null, ou fonction (indexJourGlobal) → mois 1-12, évaluée jour par
   jour pour que les longs programmes suivent les changements de saison.
   `prevIds` (partagé entre appels) évite de répéter le même repas deux jours de suite. */
function generateDays(appKey, target, nbDays, reg, monthOf, prevIds, dayOffset = 0, varier = true) {
  const approche = APPROCHES[appKey];
  // Le jeûne 16/8 réutilise les repas « équilibre », seule la répartition change
  const poolKey = appKey === "jeune" ? "equilibre" : appKey;
  const days = [];
  let fallbackUsed = false;
  // Compteur d'utilisation par recette, remis à zéro à chaque début de semaine
  // du programme (aligné sur le jour global) — porte le filtre « variété ».
  let weekUsed = {};

  for (let d = 0; d < nbDays; d++) {
    const day = newEmptyDay();
    const month = monthOf ? monthOf(dayOffset + d) : null;
    if ((dayOffset + d) % 7 === 0) weekUsed = {};
    for (const [type] of MEAL_TYPES) {
      const share = approche.repartition[type];
      if (!share) continue;
      // Repas de l'approche compatibles avec les régimes cochés (adaptés si besoin)
      let pool = REPAS.filter(r => r.type === type && r.app.includes(poolKey))
        .map(t => ({ t, adapt: adaptTemplate(t, reg, month) }))
        .filter(x => x.adapt);
      // Repli : si l'approche n'a plus de repas compatible, on élargit à tous les repas du même type
      if (!pool.length) {
        pool = REPAS.filter(r => r.type === type)
          .map(t => ({ t, adapt: adaptTemplate(t, reg, month) }))
          .filter(x => x.adapt);
        if (pool.length) fallbackUsed = true;
      }
      const picked = varier
        ? pickTemplateVaried(pool, prevIds[type], weekUsed)
        : pickTemplate(pool, prevIds[type]);
      if (!picked) continue;
      weekUsed[picked.t.id] = (weekUsed[picked.t.id] || 0) + 1;
      // Mémorise les 2 derniers repas de ce type pour espacer les répétitions
      prevIds[type] = [picked.t.id, ...(prevIds[type] || [])].slice(0, 2);

      const adaptedItems = picked.adapt.items.map(([id, g]) => ({ id, g }));
      const baseKcal = sumNutrition(adaptedItems).kcal;
      // En 16/8 les repas sont moins nombreux donc plus copieux : plafond plus haut
      const maxFactor = appKey === "jeune" ? 2.1 : 1.8;
      const factor = Math.max(0.6, Math.min(maxFactor, (target * share) / baseKcal));
      day[type] = {
        nom: picked.t.nom + (picked.adapt.adapted ? " · adapté" : ""),
        items: adaptedItems.map(it => ({ id: it.id, g: Math.max(5, Math.round(it.g * factor / 5) * 5) }))
      };
    }
    days.push(day);
  }
  return { days, fallbackUsed };
}

function generateMenu() {
  const appKey = $("#gen-approche").value;
  const nbDays = +$("#gen-duree").value;
  const target = Math.max(1200, Math.min(4500, +$("#gen-kcal").value || 2000));
  const reg = regimesActifs();
  const saison = $("#reg-saison").checked;
  const startDate = $("#gen-date").value || null;
  const monthOf = saison ? (i) => monthOfOffset(startDate, i) : null;

  const varier = $("#reg-variete").checked;
  const r = generateDays(appKey, target, nbDays, reg, monthOf, {}, 0, varier);
  lastGenerated = {
    nom: "", mode: nbDays, approche: appKey, target, regimes: reg,
    saison, saisonMois: saison ? monthOfOffset(startDate, 0) : null,
    saisonMoisFin: saison ? monthOfOffset(startDate, nbDays - 1) : null,
    startDate, fallbackUsed: r.fallbackUsed, days: r.days
  };
  renderGenerated();
}

/* Génère un menu multi-semaines depuis le planning calorique :
   chaque semaine cochée garde sa propre cible kcal. */
function generatePlanMenu(weeks, startDate, type) {
  if (type === "seche") { $("#gen-approche").value = "seche"; updateApprocheHint(); }
  const appKey = $("#gen-approche").value;
  const reg = regimesActifs();
  const saison = $("#reg-saison").checked;
  const monthOf = saison ? (i) => monthOfOffset(startDate, i) : null;

  const varier = $("#reg-variete").checked;
  const prevIds = {};
  const days = [];
  const dayTargets = [];
  let fallbackUsed = false;
  weeks.forEach((w, wi) => {
    const r = generateDays(appKey, w.kcal, 7, reg, monthOf, prevIds, wi * 7, varier);
    days.push(...r.days);
    fallbackUsed = fallbackUsed || r.fallbackUsed;
    for (let i = 0; i < 7; i++) dayTargets.push(w.kcal);
  });
  const avg = Math.round(dayTargets.reduce((s, k) => s + k, 0) / dayTargets.length);

  lastGenerated = {
    nom: "", mode: days.length, approche: appKey, target: avg, dayTargets,
    weekNums: weeks.map(w => w.num), weekKcals: weeks.map(w => w.kcal),
    startDate, regimes: reg, saison,
    saisonMois: saison ? monthOfOffset(startDate, 0) : null,
    saisonMoisFin: saison ? monthOfOffset(startDate, days.length - 1) : null,
    fallbackUsed, days
  };
  showPage("menus");
  switchSubtab("generateur");
  renderGenerated();
  toast(`Menus générés pour ${weeks.length} semaine${weeks.length > 1 ? "s" : ""} du planning`);
}

function renderGenerated() {
  const out = $("#gen-output");
  if (!lastGenerated) { out.innerHTML = ""; return; }
  const menu = lastGenerated;
  const approche = APPROCHES[menu.approche];

  let note = menu.approche === "jeune"
    ? `<p class="approche-hint">🕛 Jeûne 16/8 : pas de petit-déjeuner — premier repas vers 12 h, dernier avant 20 h. Eau, café et thé non sucrés à volonté pendant le jeûne.</p>`
    : "";
  const regLabels = [];
  if (menu.regimes?.vegetarien) regLabels.push("🌱 végétarien");
  if (menu.regimes?.sansGluten) regLabels.push("🌾 sans gluten");
  if (menu.regimes?.sansLactose) regLabels.push("🥛 sans lactose");
  if (regLabels.length) {
    note += `<p class="approche-hint">Menu ${regLabels.join(" · ")} — les repas marqués « adapté » ont vu certains
      ingrédients remplacés.${menu.fallbackUsed ? " Certains repas sortent du cadre strict de l'approche choisie, faute d'options compatibles." : ""}</p>`;
  }
  if (menu.saison) {
    const multiMois = menu.saisonMoisFin && menu.saisonMoisFin !== menu.saisonMois;
    const periode = multiMois
      ? `${moisLabel(menu.saisonMois)} à ${MOIS[menu.saisonMoisFin - 1]} — la sélection s'adapte au fil des semaines`
      : moisLabel(menu.saisonMois);
    note += `<p class="approche-hint">🍓 Fruits &amp; légumes de saison (mois ${periode}) —
      les repas contenant des produits frais hors saison ont été écartés.</p>`;
  }

  const weekHeading = (i) => {
    const num = menu.weekNums ? menu.weekNums[i / 7] : i / 7 + 1;
    const kcalInfo = menu.weekKcals ? ` · ${fmtKcal(menu.weekKcals[i / 7])} kcal/jour` : "";
    let dates = "";
    if (menu.startDate) {
      const d1 = dateOfDay(menu, i);
      const d2 = dateOfDay(menu, Math.min(i + 6, menu.days.length - 1));
      dates = ` — du ${d1.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} au ${d2.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`;
    }
    return `<div class="week-heading-row">
      <h2 class="week-heading">Semaine ${num}${dates}${kcalInfo}</h2>
      <button class="btn btn-ghost btn-week-liste" data-week="${i / 7}">🛒 Courses de la semaine</button>
    </div>`;
  };
  const showHeadings = menu.mode > 7 || menu.weekNums;

  out.innerHTML = `
    <div class="gen-actions">
      <button class="btn btn-ghost" id="btn-regenerer">🔁 Regénérer</button>
      <button class="btn btn-ghost" id="btn-edit-generated">✏️ Modifier dans l'éditeur</button>
      <button class="btn btn-ghost" id="btn-liste-generated">🛒 Liste de courses</button>
      <button class="btn btn-ghost" id="btn-save-generated">💾 Enregistrer</button>
      <button class="btn btn-ghost" id="btn-print-generated">🖨️ Imprimer</button>
    </div>
    ${note}
    ${menu.days.map((day, i) =>
      (showHeadings && i % 7 === 0 ? weekHeading(i) : "") +
      dayCardHtml(day, i, menu)
    ).join("")}
  `;

  $("#btn-regenerer").addEventListener("click", () => {
    if (menu.weekNums) {
      generatePlanMenu(menu.weekNums.map((num, i) => ({ num, kcal: menu.weekKcals[i] })), menu.startDate,
        menu.approche === "seche" ? "seche" : "");
    } else {
      generateMenu();
    }
  });
  $("#btn-liste-generated").addEventListener("click", () => {
    openShoppingList(menu, `Courses — menu ${APPROCHES[menu.approche].nom.toLowerCase()}`);
  });
  // Boutons « Courses de la semaine » des en-têtes : ouvre la liste directement
  // sur la bonne semaine (l'index de rendu i/7 ; le libellé peut être Semaine 3
  // du planning, mais les jours affichés sont bien ceux de ce bloc).
  $$(".btn-week-liste").forEach(b => b.addEventListener("click", () => {
    openShoppingList(menu, `Courses — menu ${APPROCHES[menu.approche].nom.toLowerCase()}`, +b.dataset.week);
  }));
  $("#btn-print-generated").addEventListener("click", () => window.print());
  $("#btn-edit-generated").addEventListener("click", () => {
    editorMenu = JSON.parse(JSON.stringify(menu));
    editorMenu.nom = `Menu ${approche.nom.toLowerCase()}`;
    currentDay = 0;
    persistEditor();
    ensureDureeOption(menu.mode);
    $("#edit-kcal").value = menu.target;
    $("#edit-nom").value = editorMenu.nom;
    renderEditor();
    switchSubtab("editeur");
    toast("Menu chargé dans l'éditeur — ajustez-le librement");
  });
  $("#btn-save-generated").addEventListener("click", () => {
    saveMenu(JSON.parse(JSON.stringify(menu)), `Menu ${approche.nom.toLowerCase()} (${menu.mode === 7 ? "semaine" : "1 jour"})`);
  });
}

function dayCardHtml(day, index, menu) {
  const n = dayNutrition(day);
  const title = menuDayTitle(menu, index);
  const target = menu.dayTargets ? menu.dayTargets[index] : menu.target;
  const meals = MEAL_TYPES.map(([type, label]) => {
    const meal = day[type];
    if (!meal.items.length) return "";
    const mealN = sumNutrition(meal.items);
    const foods = meal.items.map(it => {
      const a = ALIMENTS_MAP[it.id];
      return a ? `${a.nom} (${it.g} g)` : "";
    }).filter(Boolean).join(" · ");
    return `<div class="meal-block">
      <span class="meal-kcal">${fmtKcal(mealN.kcal)} kcal</span>
      <div class="meal-title">${label}</div>
      ${meal.nom ? `<div class="meal-name">${meal.nom}</div>` : ""}
      <div class="meal-foods">${foods}</div>
    </div>`;
  }).join("");

  return `<div class="day-card">
    <div class="day-head"><h3>${title}</h3><span class="day-kcal">${fmtKcal(n.kcal)} kcal ${target ? `/ ${fmtKcal(target)}` : ""}</span></div>
    <div class="day-body">${meals}</div>
    <div class="day-summary">${macroBarsHtml(n, n.kcal)}</div>
  </div>`;
}

/* ---------- Éditeur ---------- */
function setupEditor() {
  $("#edit-kcal").value = editorMenu.target || getTarget();
  $("#edit-duree").value = editorMenu.mode;
  $("#edit-nom").value = editorMenu.nom || "";

  $("#edit-duree").addEventListener("change", () => {
    const nb = +$("#edit-duree").value;
    if (nb === editorMenu.mode) return;
    if (nb > editorMenu.mode) {
      while (editorMenu.days.length < nb) editorMenu.days.push(newEmptyDay());
    } else {
      const hasContent = editorMenu.days.slice(nb).some(d => dayNutrition(d).kcal > 0);
      if (hasContent && !confirm(`Réduire la durée supprimera les jours au-delà du ${nb === 1 ? "1er jour" : nb + "e jour"}. Continuer ?`)) {
        $("#edit-duree").value = editorMenu.mode;
        return;
      }
      editorMenu.days = editorMenu.days.slice(0, nb);
    }
    editorMenu.mode = nb;
    currentDay = Math.min(currentDay, nb - 1);
    persistEditor();
    renderEditor();
  });

  $("#edit-kcal").addEventListener("change", () => {
    editorMenu.target = +$("#edit-kcal").value || 2000;
    persistEditor();
    renderEditor();
  });

  $("#edit-nom").addEventListener("input", () => {
    editorMenu.nom = $("#edit-nom").value;
    persistEditor();
  });

  $("#btn-save-menu").addEventListener("click", () => {
    const nom = $("#edit-nom").value.trim() || "Menu sans nom";
    saveMenu(JSON.parse(JSON.stringify(editorMenu)), nom);
  });

  $("#btn-print-menu").addEventListener("click", () => window.print());

  $("#btn-clear-menu").addEventListener("click", () => {
    if (!confirm("Vider entièrement ce menu ?")) return;
    editorMenu = newEmptyMenu(+$("#edit-duree").value);
    editorMenu.target = +$("#edit-kcal").value || 2000;
    currentDay = 0;
    persistEditor();
    renderEditor();
  });

  // Datalist pour l'autocomplétion
  $("#foods-datalist").innerHTML = ALIMENTS
    .map(a => `<option value="${a.nom}"></option>`).join("");
}

function persistEditor() { store.set("editor_menu", editorMenu); }

/* Le sélecteur de durée ne propose que 1/7/14/28 jours : si un menu chargé a une
   autre durée (ex. 21 jours depuis le planning), on ajoute l'option à la volée. */
function ensureDureeOption(nb) {
  const sel = $("#edit-duree");
  if (![...sel.options].some(o => +o.value === nb)) {
    const o = document.createElement("option");
    o.value = nb;
    o.textContent = modeLabel(nb);
    sel.appendChild(o);
  }
  sel.value = nb;
}

function renderEditor() {
  // Onglets jours
  const tabs = $("#edit-day-tabs");
  if (editorMenu.mode === 1) {
    tabs.innerHTML = "";
    currentDay = 0;
  } else {
    tabs.innerHTML = editorMenu.days.map((day, i) => {
      const kcal = dayNutrition(day).kcal;
      const label = editorMenu.startDate ? fmtDateShort(dateOfDay(editorMenu, i)) : dayLabel(i, editorMenu.mode, true);
      return `<button class="day-tab ${i === currentDay ? "active" : ""}" data-day="${i}">
        ${label}<span class="day-tab-kcal">${fmtKcal(kcal)} kcal</span>
      </button>`;
    }).join("");
    tabs.querySelectorAll(".day-tab").forEach(btn => {
      btn.addEventListener("click", () => { currentDay = +btn.dataset.day; renderEditor(); });
    });
  }

  // Contenu du jour
  const day = editorMenu.days[currentDay];
  const target = (editorMenu.dayTargets && editorMenu.dayTargets[currentDay]) || editorMenu.target || 2000;
  const n = dayNutrition(day);
  const pct = Math.min(100, n.kcal / target * 100);
  const over = n.kcal > target * 1.05;

  $("#edit-day-content").innerHTML = `
    <div class="day-card">
      <div class="day-head">
        <h3>${menuDayTitle(editorMenu, currentDay)}</h3>
        <span class="day-kcal">${fmtKcal(n.kcal)} / ${fmtKcal(target)} kcal</span>
      </div>
      <div class="day-body">
        ${MEAL_TYPES.map(([type, label]) => editMealHtml(type, label, day[type])).join("")}
      </div>
      <div class="day-summary">
        <div class="kcal-progress-track"><div class="kcal-progress ${over ? "over" : ""}" style="width:${pct.toFixed(0)}%"></div></div>
        <span class="kcal-progress-label">${over ? "⚠ Objectif dépassé de " + fmtKcal(n.kcal - target) + " kcal" : "Reste " + fmtKcal(Math.max(0, target - n.kcal)) + " kcal"}</span>
        ${macroBarsHtml(n, n.kcal)}
      </div>
    </div>
  `;

  // Résumé de la période
  const weekSummary = $("#edit-week-summary");
  if (editorMenu.mode > 1) {
    const totals = editorMenu.days.map(dayNutrition);
    const avg = totals.reduce((s, t) => s + t.kcal, 0) / editorMenu.days.length;
    const avgTarget = editorMenu.dayTargets
      ? editorMenu.dayTargets.reduce((s, k) => s + k, 0) / editorMenu.dayTargets.length
      : target;
    weekSummary.style.display = "";
    weekSummary.innerHTML = `<h3>Bilan ${editorMenu.mode === 7 ? "de la semaine" : "de la période (" + modeLabel(editorMenu.mode).toLowerCase() + ")"}</h3>
      <p class="small-note">Moyenne : <strong>${fmtKcal(avg)} kcal/jour</strong> pour un objectif moyen de ${fmtKcal(avgTarget)} kcal.
      ${avg > 0 && Math.abs(avg - avgTarget) / avgTarget <= 0.05 ? "🎯 Vous êtes dans la cible (± 5 %)." : ""}</p>`;
  } else {
    weekSummary.style.display = "none";
  }

  bindEditorEvents();
}

function editMealHtml(type, label, meal) {
  const mealN = sumNutrition(meal.items);
  const rows = meal.items.map((it, idx) => {
    const a = ALIMENTS_MAP[it.id];
    if (!a) return "";
    return `<div class="food-row">
      <span class="food-name">${a.nom}</span>
      <input type="number" class="food-grams" data-type="${type}" data-idx="${idx}" value="${it.g}" min="1" max="2000"> g
      <span class="food-kcal">${fmtKcal(itemNutrition(it).kcal)} kcal</span>
      <button class="food-del" data-type="${type}" data-idx="${idx}" title="Retirer">✕</button>
    </div>`;
  }).join("");

  return `<div class="meal-block edit-meal">
    <div class="edit-meal-head">
      <h4>${label}${meal.nom ? ` — <em>${meal.nom}</em>` : ""}</h4>
      <span class="edit-meal-kcal">${fmtKcal(mealN.kcal)} kcal</span>
    </div>
    ${rows || `<div class="empty-meal">Aucun aliment — ajoutez-en ci-dessous.</div>`}
    <div class="food-add-row">
      <input list="foods-datalist" placeholder="Rechercher un aliment…" data-type="${type}" class="food-search">
      <input type="number" class="grams-input" placeholder="g" value="100" min="1" max="2000" data-type="${type}">
      <button class="btn btn-primary btn-sm food-add-btn" data-type="${type}">+ Ajouter</button>
    </div>
  </div>`;
}

function bindEditorEvents() {
  const content = $("#edit-day-content");
  const day = editorMenu.days[currentDay];

  content.querySelectorAll(".food-grams").forEach(input => {
    input.addEventListener("change", () => {
      const item = day[input.dataset.type].items[+input.dataset.idx];
      if (item) item.g = Math.max(1, +input.value || 1);
      persistEditor();
      renderEditor();
    });
  });

  content.querySelectorAll(".food-del").forEach(btn => {
    btn.addEventListener("click", () => {
      day[btn.dataset.type].items.splice(+btn.dataset.idx, 1);
      persistEditor();
      renderEditor();
    });
  });

  content.querySelectorAll(".food-add-btn").forEach(btn => {
    btn.addEventListener("click", () => addFoodFromRow(btn.dataset.type));
  });
  content.querySelectorAll(".food-search").forEach(input => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); addFoodFromRow(input.dataset.type); }
    });
  });
}

function addFoodFromRow(type) {
  const content = $("#edit-day-content");
  const search = content.querySelector(`.food-search[data-type="${type}"]`);
  const gramsInput = content.querySelector(`.grams-input[data-type="${type}"]`);
  const name = (search.value || "").trim().toLowerCase();
  if (!name) { search.focus(); return; }

  let food = ALIMENTS_BY_NAME[name];
  if (!food) {
    const matches = ALIMENTS.filter(a => a.nom.toLowerCase().includes(name));
    if (matches.length === 1) food = matches[0];
    else if (matches.length > 1) { toast(`Précisez : ${matches.slice(0, 3).map(m => m.nom).join(", ")}…`); return; }
  }
  if (!food) { toast("Aliment introuvable dans la base — voir l'onglet Aliments"); return; }

  const g = Math.max(1, Math.min(2000, +gramsInput.value || 100));
  editorMenu.days[currentDay][type].items.push({ id: food.id, g });
  persistEditor();
  renderEditor();
  // Refocus sur le champ de recherche du même repas
  const newSearch = $("#edit-day-content").querySelector(`.food-search[data-type="${type}"]`);
  if (newSearch) newSearch.focus();
}

/* ---------- Liste de courses ---------- */
const RAYON_ORDER = [
  "Fruits", "Légumes", "Féculents", "Légumineuses", "Viandes & œufs",
  "Poissons & fruits de mer", "Produits laitiers", "Matières grasses & oléagineux",
  "Sucré & divers", "Sauces & condiments"
];
const LIQUIDES_IDS = new Set(["lait_demi", "lait_ecreme", "lait_amande", "jus_orange", "soupe_legumes"]);
let currentListe = null;

function buildShoppingList(menu) {
  // `uses` : nombre de repas de la période où le produit apparaît — affiché
  // en badge ×N quand un produit sert plusieurs fois (on l'achète une fois,
  // mais il doit durer / être dosé en conséquence).
  const totals = {};
  menu.days.forEach(day => MEAL_TYPES.forEach(([k]) => {
    (day[k].items || []).forEach(it => {
      const t = (totals[it.id] = totals[it.id] || { g: 0, uses: 0 });
      t.g += it.g;
      t.uses += 1;
    });
  }));
  const byCat = {};
  Object.entries(totals).forEach(([id, t]) => {
    const a = ALIMENTS_MAP[id];
    if (!a) return;
    (byCat[a.cat] = byCat[a.cat] || []).push({ id, nom: a.nom, g: Math.ceil(t.g / 10) * 10, uses: t.uses });
  });
  return RAYON_ORDER.filter(c => byCat[c]).map(c => ({
    cat: c,
    items: byCat[c].sort((x, y) => x.nom.localeCompare(y.nom, "fr"))
  }));
}

function qtyLabel(item) {
  const u = UNITES[item.id];
  if (u) {
    const nb = Math.max(1, Math.ceil(item.g / u.g));
    return `${nb} ${u.l}${nb > 1 ? "s" : ""} (${item.g} g)`;
  }
  if (LIQUIDES_IDS.has(item.id)) return `${item.g} ml`;
  return `${item.g} g`;
}

function openShoppingList(menu, title, presetWeek) {
  if (!buildShoppingList(menu).length) { toast("Le menu est vide — rien à exporter"); return; }
  // Au-delà d'une semaine, la liste se consulte semaine par semaine (courses hebdomadaires).
  // `presetWeek` : ouverture directe sur une semaine donnée (boutons « Courses » des en-têtes).
  currentListe = { menu, title, week: presetWeek ?? (menu.mode > 7 ? 0 : null) };
  renderListeModal();
  $("#liste-modal").hidden = false;
  document.body.classList.add("has-modal");
}

function renderListeModal() {
  const { menu, title, week } = currentListe;
  const days = (week === null || week === -1) ? menu.days : menu.days.slice(week * 7, week * 7 + 7);
  const groups = buildShoppingList({ days });
  // Numéro affiché : celui du planning si le menu vient de semaines cochées
  // (ex. semaines 3, 5, 8), sinon le rang dans le menu.
  const weekLabel = (i) => menu.weekNums ? menu.weekNums[i] : i + 1;
  currentListe.groups = groups;
  currentListe.fullTitle = title + (week !== null && week >= 0 ? ` — semaine ${weekLabel(week)}` : "");
  currentListe.periode = days.length === 1 ? "1 journée" : `${days.length} jours`;

  const nbWeeks = Math.ceil(menu.days.length / 7);
  const weekSel = menu.mode > 7 ? `
    <div class="liste-week-row">
      <label for="liste-week">Faire les courses pour :</label>
      <select id="liste-week">
        ${Array.from({ length: nbWeeks }, (_, i) =>
          `<option value="${i}" ${week === i ? "selected" : ""}>Semaine ${weekLabel(i)}</option>`).join("")}
        <option value="-1" ${week === -1 ? "selected" : ""}>Tout (${menu.days.length} jours)</option>
      </select>
    </div>` : "";

  const nbArticles = groups.reduce((s, g) => s + g.items.length, 0);
  $("#liste-content").innerHTML = `
    ${weekSel}
    <p class="liste-sub">${currentListe.fullTitle}<br>${currentListe.periode} · ${nbArticles} articles ·
      quantités à acheter, besoin réel du menu entre parenthèses</p>
    ${groups.map(g => `
      <div class="liste-group">
        <h3>${g.cat}</h3>
        <ul>${g.items.map(i => `<li><span>${i.nom}${i.uses > 1
          ? ` <span class="liste-uses" title="Ce produit sert dans ${i.uses} repas sur la période">×${i.uses} repas</span>`
          : ""}</span><span class="liste-qty">${qtyLabel(i)}</span></li>`).join("")}</ul>
      </div>`).join("")}
  `;
  const sel = $("#liste-week");
  if (sel) sel.addEventListener("change", () => { currentListe.week = +sel.value; renderListeModal(); });
}

function closeShoppingList() {
  $("#liste-modal").hidden = true;
  document.body.classList.remove("has-modal");
}

function listeToText() {
  const lines = [`🛒 ${currentListe.fullTitle}`,
    `${currentListe.periode} — générée par NutriGuide`, ""];
  currentListe.groups.forEach(g => {
    lines.push(g.cat.toUpperCase());
    g.items.forEach(i => lines.push(`  • ${i.nom} — ${qtyLabel(i)}${i.uses > 1 ? ` (sert dans ${i.uses} repas)` : ""}`));
    lines.push("");
  });
  return lines.join("\n");
}

function listeToJson() {
  // Format aligné sur les modèles de l'app fooding (ListItem : name / quantity)
  return JSON.stringify({
    source: "nutriguide",
    format: "fooding-shopping-list",
    version: 1,
    exportedAt: new Date().toISOString(),
    list: { name: currentListe.fullTitle },
    items: currentListe.groups.flatMap(g => g.items.map(i => ({
      name: i.nom,
      quantity: qtyLabel(i),
      category: g.cat,
      usedInMeals: i.uses,
      barcode: null
    })))
  }, null, 2);
}

function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime + ";charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

async function copyListe() {
  const text = listeToText();
  try {
    await navigator.clipboard.writeText(text);
    toast("Liste copiée dans le presse-papiers");
  } catch {
    // Repli si l'API clipboard n'est pas disponible (ex. ouverture en file://)
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    toast("Liste copiée dans le presse-papiers");
  }
}

function setupShoppingList() {
  $("#liste-close").addEventListener("click", closeShoppingList);
  $("#liste-modal").addEventListener("click", (e) => { if (e.target === $("#liste-modal")) closeShoppingList(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#liste-modal").hidden) closeShoppingList(); });
  $("#liste-copy").addEventListener("click", copyListe);
  $("#liste-txt").addEventListener("click", () => downloadFile(listeToText(), "liste-de-courses.txt", "text/plain"));
  $("#liste-json").addEventListener("click", () => downloadFile(listeToJson(), "liste-de-courses-fooding.json", "application/json"));
  $("#liste-print").addEventListener("click", () => window.print());
  $("#btn-liste-editor").addEventListener("click", () => {
    openShoppingList(editorMenu, `Courses — ${editorMenu.nom || "mon menu"}`);
  });
}

/* ---------- Menus enregistrés ---------- */
function saveMenu(menu, nom) {
  const saved = store.get("saved_menus", []);
  menu.nom = nom;
  menu.savedAt = Date.now();
  menu.id = "m" + Date.now() + Math.floor(Math.random() * 1000);
  saved.unshift(menu);
  store.set("saved_menus", saved.slice(0, 30));
  renderSaved();
  toast(`« ${nom} » enregistré`);
}

function renderSaved() {
  const saved = store.get("saved_menus", []);
  const list = $("#saved-list");
  if (!saved.length) {
    list.innerHTML = `<div class="empty-state">Aucun menu enregistré pour l'instant.<br>
      Générez un menu ou composez-le dans l'éditeur, puis cliquez sur « Enregistrer ».</div>`;
    return;
  }
  list.innerHTML = saved.map(m => {
    const avg = m.days.reduce((s, d) => s + dayNutrition(d).kcal, 0) / m.days.length;
    const date = new Date(m.savedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    const approche = m.approche && APPROCHES[m.approche] ? APPROCHES[m.approche].emoji + " " : "";
    return `<div class="saved-item">
      <div class="saved-info">
        <h3>${approche}${m.nom}</h3>
        <span class="saved-meta">${modeLabel(m.mode)} · ~${fmtKcal(avg)} kcal/jour · enregistré le ${date}</span>
      </div>
      <button class="btn btn-ghost btn-sm saved-load" data-id="${m.id}">✏️ Ouvrir dans l'éditeur</button>
      <button class="btn btn-ghost btn-sm saved-liste" data-id="${m.id}">🛒 Liste</button>
      <button class="btn btn-danger-ghost btn-sm saved-del" data-id="${m.id}">Supprimer</button>
    </div>`;
  }).join("");

  list.querySelectorAll(".saved-liste").forEach(btn => {
    btn.addEventListener("click", () => {
      const m = store.get("saved_menus", []).find(x => x.id === btn.dataset.id);
      if (m) openShoppingList(m, `Courses — ${m.nom}`);
    });
  });

  list.querySelectorAll(".saved-load").forEach(btn => {
    btn.addEventListener("click", () => {
      const m = store.get("saved_menus", []).find(x => x.id === btn.dataset.id);
      if (!m) return;
      editorMenu = JSON.parse(JSON.stringify(m));
      currentDay = 0;
      persistEditor();
      ensureDureeOption(editorMenu.mode);
      $("#edit-kcal").value = editorMenu.target || getTarget();
      $("#edit-nom").value = editorMenu.nom || "";
      renderEditor();
      switchSubtab("editeur");
      toast(`« ${m.nom} » chargé dans l'éditeur`);
    });
  });
  list.querySelectorAll(".saved-del").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!confirm("Supprimer ce menu ?")) return;
      store.set("saved_menus", store.get("saved_menus", []).filter(x => x.id !== btn.dataset.id));
      renderSaved();
    });
  });
}

/* ---------- Sous-onglets Menus ---------- */
function switchSubtab(name) {
  $$(".subtab").forEach(b => b.classList.toggle("active", b.dataset.subtab === name));
  $$(".subpanel").forEach(p => p.classList.toggle("active", p.id === "panel-" + name));
}
function setupSubtabs() {
  $("#menus-subtabs").addEventListener("click", (e) => {
    const btn = e.target.closest(".subtab");
    if (btn) switchSubtab(btn.dataset.subtab);
  });
}

/* ---------- Page Aliments ---------- */
function setupAliments() {
  const cats = [...new Set(ALIMENTS.map(a => a.cat))];
  $("#alim-cat").innerHTML = `<option value="">Toutes</option>` +
    cats.map(c => `<option value="${c}">${c}</option>`).join("");
  $("#alim-search").addEventListener("input", renderAliments);
  $("#alim-cat").addEventListener("change", renderAliments);
  ["alim-vegetarien", "alim-sansgluten", "alim-sanslactose"].forEach(id => {
    $("#" + id).addEventListener("change", renderAliments);
  });
  renderAliments();
}

function renderAliments() {
  const q = ($("#alim-search").value || "").trim().toLowerCase();
  const cat = $("#alim-cat").value;
  const reg = {
    vegetarien: $("#alim-vegetarien").checked,
    sansGluten: $("#alim-sansgluten").checked,
    sansLactose: $("#alim-sanslactose").checked
  };
  const rows = ALIMENTS
    .filter(a => (!cat || a.cat === cat) && (!q || a.nom.toLowerCase().includes(q)) && foodOkForRegimes(a, reg))
    .sort((a, b) => a.nom.localeCompare(b.nom, "fr"));

  $("#alim-table tbody").innerHTML = rows.map(a => `
    <tr>
      <td>${a.nom}</td>
      <td class="cat-cell">${a.cat}</td>
      <td class="num"><strong>${a.kcal}</strong></td>
      <td class="num">${a.p} g</td>
      <td class="num">${a.g} g</td>
      <td class="num">${a.l} g</td>
    </tr>`).join("");
  $("#alim-count").textContent = `${rows.length} aliment${rows.length > 1 ? "s" : ""} affiché${rows.length > 1 ? "s" : ""} — valeurs pour 100 g.`;
}

/* ---------- Toast ---------- */
let toastTimer = null;
function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
}

/* ---------- Init ---------- */
renderApproches();
setupBesoins();
setupPlanning();
setupGenerator();
setupEditor();
setupSubtabs();
setupAliments();
setupShoppingList();
renderEditor();
renderSaved();
