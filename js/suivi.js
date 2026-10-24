/* =====================================================
   NutriGuide — Mon suivi : journal quotidien lipides / glucides / sel
   Dépend de data.js et app.js (store, ALIMENTS_MAP, getLimites…).
   ===================================================== */
"use strict";

/* ---------- Journal : stockage ----------
   journal[YYYY-MM-DD] = { pdej: [entry], dej: [], col: [], diner: [] }
   entry = { id, nom, g, n: {valeurs pour 100 g, figées à l'ajout}, t }
   Les valeurs sont figées pour que l'historique ne change pas si l'aliment
   est modifié ou supprimé ensuite. */
const SV_KEYS = ["sel", "l", "ags", "g", "suc"];
let svDate = todayISO();
let journal = store.get("journal", {});

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function isoShift(iso, delta) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d + delta);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}
function isoToDate(iso) { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); }
function persistJournal() { store.set("journal", journal); }
function getDay(iso, create) {
  if (!journal[iso] && create) {
    journal[iso] = {};
    MEAL_TYPES.forEach(([k]) => { journal[iso][k] = []; });
  }
  return journal[iso] || null;
}
function snapshot(a) {
  const n = {};
  NUTRI_KEYS.forEach(k => { n[k] = a[k] || 0; });
  return n;
}
function entryNutrition(e) {
  const n = {};
  NUTRI_KEYS.forEach(k => { n[k] = (e.n[k] || 0) * e.g / 100; });
  return n;
}
function sumEntries(entries) {
  return entries.reduce((acc, e) => {
    const n = entryNutrition(e);
    NUTRI_KEYS.forEach(k => { acc[k] += n[k]; });
    return acc;
  }, zeroNutrition());
}
function dayEntries(iso) {
  const d = journal[iso];
  return d ? MEAL_TYPES.flatMap(([k]) => d[k] || []) : [];
}
function dayTotals(iso) { return sumEntries(dayEntries(iso)); }
function addEntry(iso, meal, food, g) {
  const day = getDay(iso, true);
  day[meal].push({ id: food.id, nom: food.nom, g: Math.round(g * 10) / 10, n: snapshot(food), t: Date.now() });
  rememberRecent(food.id, g);
  persistJournal();
}
function cleanupDay(iso) {
  if (journal[iso] && !dayEntries(iso).length) delete journal[iso];
}

/* ---------- Récents ---------- */
function rememberRecent(id, g) {
  const rec = store.get("recents", []).filter(r => r.id !== id);
  rec.unshift({ id, g });
  store.set("recents", rec.slice(0, 14));
}

/* ---------- Recherche d'aliment ---------- */
function findFood(name) {
  const q = (name || "").trim().toLowerCase();
  if (!q) return { food: null, matches: [] };
  if (ALIMENTS_BY_NAME[q]) return { food: ALIMENTS_BY_NAME[q], matches: [] };
  const matches = ALIMENTS.filter(a => a.nom.toLowerCase().includes(q));
  if (matches.length === 1) return { food: matches[0], matches };
  const starts = matches.filter(a => a.nom.toLowerCase().startsWith(q));
  if (starts.length === 1) return { food: starts[0], matches };
  return { food: null, matches };
}
function defaultMealForNow() {
  const h = new Date().getHours();
  return h < 10 ? "pdej" : h < 15 ? "dej" : h < 18 ? "col" : "diner";
}

/* ---------- Rendu principal ---------- */
function renderSuivi() {
  journal = store.get("journal", {});
  $("#sv-date").value = svDate;
  const d = isoToDate(svDate);
  const isToday = svDate === todayISO();
  $("#sv-date-label").textContent = (isToday ? "Aujourd'hui — " : "") +
    d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  $("#sv-next").disabled = isToday;
  renderGauges();
  renderMeals();
  renderPreview();
  renderRecents();
  renderInsights();
  renderWeek();
  renderLimitsForm();
  renderHomeToday();
}

function gaugeHtml(k, val, lim, big) {
  const L = LIMITE_LABELS[k];
  const st = limitStatus(val, lim);
  const pct = lim > 0 ? Math.min(100, val / lim * 100) : 0;
  const reste = lim - val;
  const msg = st === "over"
    ? `Dépassé de <strong>${fmtG(-reste, L.dec || 1)} g</strong>`
    : `Reste <strong>${fmtG(Math.max(0, reste), L.dec)} g</strong>`;
  return `<div class="gauge ${st} ${big ? "big" : ""} ${k === "ags" || k === "suc" ? "sub" : ""}">
    <div class="gauge-head"><span class="gauge-name">${L.emoji} ${L.nom}</span>
      <span class="gauge-val"><strong>${fmtG(val, L.dec)}</strong> / ${fmtG(lim, L.dec)} g</span></div>
    <div class="gauge-track"><div class="gauge-bar" style="width:${pct.toFixed(1)}%"></div></div>
    <div class="gauge-msg">${msg}</div>
  </div>`;
}
function renderGauges() {
  const t = dayTotals(svDate);
  const lim = getLimites();
  const kcalTarget = lim.kcal || getTarget();
  $("#sv-gauges").innerHTML =
    gaugeHtml("sel", t.sel, lim.sel, true) +
    `<div class="gauge-pair">${gaugeHtml("l", t.l, lim.l)}${gaugeHtml("ags", t.ags, lim.ags)}</div>` +
    `<div class="gauge-pair">${gaugeHtml("g", t.g, lim.g)}${gaugeHtml("suc", t.suc, lim.suc)}</div>` +
    `<div class="gauge kcal-gauge">
      <div class="gauge-head"><span class="gauge-name">🔥 Énergie</span>
      <span class="gauge-val"><strong>${fmtKcal(t.kcal)}</strong> / ${fmtKcal(kcalTarget)} kcal</span></div>
      <div class="gauge-track"><div class="gauge-bar" style="width:${Math.min(100, t.kcal / kcalTarget * 100).toFixed(1)}%"></div></div>
      <div class="gauge-msg">Protéines ${fmtG(t.p, 0)} g · lipides ${t.kcal ? Math.round(t.l * 9 / t.kcal * 100) : 0} % des kcal · glucides ${t.kcal ? Math.round(t.g * 4 / t.kcal * 100) : 0} %</div>
    </div>`;
}

function renderMeals() {
  const day = journal[svDate];
  const lim = getLimites();
  $("#sv-meals").innerHTML = MEAL_TYPES.map(([type, label]) => {
    const entries = (day && day[type]) || [];
    const n = sumEntries(entries);
    const rows = entries.map((e, idx) => {
      const en = entryNutrition(e);
      // Repère une ligne qui pèse lourd : ≥ 25 % de la limite du jour
      const heavy = SV_KEYS.filter(k => lim[k] > 0 && en[k] / lim[k] >= 0.25);
      const u = UNITES[e.id];
      const unitHint = u && e.g >= u.g * 0.5 ? `<span class="sv-unit-hint">≈ ${fmtG(e.g / u.g, 1)} ${u.l}</span>` : "";
      return `<div class="sv-row ${heavy.length ? "heavy" : ""}">
        <span class="sv-row-name">${escapeHtml(e.nom)}${heavy.length ? ` <span class="sv-heavy" title="Pèse ≥ 25 % de votre limite du jour">${heavy.map(k => LIMITE_LABELS[k].emoji).join("")}</span>` : ""}</span>
        <span class="sv-row-qty"><input type="number" class="sv-g" data-meal="${type}" data-idx="${idx}" value="${e.g}" min="0.1" step="any" inputmode="decimal"> g ${unitHint}</span>
        <span class="sv-row-vals">
          <span class="v-sel">${fmtG(en.sel, 2)} g sel</span>
          <span class="v-l">${fmtG(en.l, 1)} g lip.</span>
          <span class="v-g">${fmtG(en.g, 1)} g gluc.</span>
          <span class="v-kcal">${fmtKcal(en.kcal)} kcal</span>
        </span>
        <button class="food-del sv-del" data-meal="${type}" data-idx="${idx}" title="Retirer">✕</button>
      </div>`;
    }).join("");
    return `<div class="day-card sv-meal">
      <div class="day-head"><h3>${label}</h3>
        <span class="sv-meal-tot">${entries.length ? `🧂 ${fmtG(n.sel, 1)} g · 🫒 ${fmtG(n.l, 0)} g · ⚡ ${fmtG(n.g, 0)} g · ${fmtKcal(n.kcal)} kcal` : ""}</span>
        <button class="link-btn sv-pick-meal" data-meal="${type}" title="Ajouter à ce repas">+ ajouter</button>
      </div>
      <div class="day-body">${rows || `<div class="empty-meal">Rien de noté.</div>`}</div>
    </div>`;
  }).join("");
}

/* Aperçu en direct : ce que coûte l'aliment saisi, et où on en sera après */
function currentInput() {
  const { food, matches } = findFood($("#sv-food").value);
  const qty = Math.max(0, +$("#sv-qty").value || 0);
  const unit = $("#sv-unit").value;
  const g = food ? (unit === "u" && UNITES[food.id] ? qty * UNITES[food.id].g : qty) : 0;
  return { food, matches, g };
}
function syncUnitSelect(food) {
  const sel = $("#sv-unit");
  const u = food && UNITES[food.id];
  const prev = sel.dataset.food;
  if (prev === (food ? food.id : "")) return;
  sel.dataset.food = food ? food.id : "";
  sel.innerHTML = `<option value="g">g</option>` + (u ? `<option value="u">${escapeHtml(u.l)} (${fmtG(u.g, u.g < 10 ? 1 : 0)} g)</option>` : "");
  if (food) {
    const rec = store.get("recents", []).find(r => r.id === food.id);
    if (rec) { sel.value = "g"; $("#sv-qty").value = rec.g; }
    // Unité proposée d'office seulement pour les petites portions (œuf, tranche, pot…),
    // pas pour une baguette ou un melon entier
    // (et toujours pour un plat ou une recette : on compte en assiettes / parts)
    else if (u && (u.g <= 200 || food.plat || food.recette)) { sel.value = "u"; $("#sv-qty").value = 1; }
    else { sel.value = "g"; $("#sv-qty").value = 100; }
  }
}
function renderPreview() {
  const box = $("#sv-preview");
  const { food, matches, g } = currentInput();
  syncUnitSelect(food);
  const g2 = currentInput().g;
  if (!food) {
    box.innerHTML = $("#sv-food").value.trim() && matches.length > 1
      ? `<span class="small-note">Plusieurs aliments correspondent : ${matches.slice(0, 5).map(m => `<button class="chip-btn sv-suggest" data-nom="${escapeHtml(m.nom)}">${escapeHtml(m.nom)}</button>`).join(" ")}</span>`
      : $("#sv-food").value.trim() ? `<span class="small-note">Introuvable — <button class="inline-link" id="sv-preview-create">créer l'aliment depuis son étiquette</button>
        ou, pour un plat fait maison, <button class="inline-link sv-make-recette" data-nom="${escapeHtml($("#sv-food").value.trim())}">composer la recette</button></span>` : "";
    return;
  }
  const n = itemNutrition({ id: food.id, g: g2 });
  const t = dayTotals(svDate);
  const lim = getLimites();
  const after = SV_KEYS.map(k => {
    const v = t[k] + n[k];
    const st = limitStatus(v, lim[k]);
    return { k, v, st };
  });
  const overs = after.filter(a => a.st === "over" && t[a.k] <= lim[a.k]);
  box.innerHTML = `<div class="sv-preview-line">
      <strong>${fmtG(g2, g2 < 10 ? 1 : 0)} g de ${escapeHtml(food.nom)}</strong> :
      🧂 ${fmtG(n.sel, 2)} g sel · 🫒 ${fmtG(n.l, 1)} g lipides (dont ${fmtG(n.ags, 1)} sat.) ·
      ⚡ ${fmtG(n.g, 1)} g glucides (dont ${fmtG(n.suc, 1)} sucres) · ${fmtKcal(n.kcal)} kcal
    </div>
    <div class="sv-preview-after">Après ajout : ${after.map(a =>
      `<span class="lim-chip ${a.st}">${LIMITE_LABELS[a.k].emoji} ${fmtG(a.v, LIMITE_LABELS[a.k].dec)}/${fmtG(lim[a.k], LIMITE_LABELS[a.k].dec)}</span>`).join(" ")}</div>
    ${portionChipsHtml(food)}
    ${food.cat === "Restaurant & fast-food" ? `<div class="small-note sv-plat-note">🍽️ Valeur moyenne d'une assiette servie, sel du restaurant compris.
      Pour limiter : sauce à part, pas de salière, pain avec modération (≈ 0,6 g de sel pour 50 g).</div>` :
    food.plat ? `<div class="small-note sv-plat-note">≈ Valeur moyenne d'une recette type (± 20 à 30 % selon la recette).
      <button class="inline-link sv-make-recette" data-nom="${escapeHtml(food.nom)} (ma recette)">Composer ma version</button></div>` : ""}
    ${overs.length ? `<div class="sv-warn">⚠️ Cela vous ferait dépasser votre limite de ${overs.map(o => LIMITE_LABELS[o.k].nom.toLowerCase()).join(", ")}.
      ${altSuggestionHtml(food, overs[0].k)}</div>` : ""}`;
}

/* « assiette » → « assiettes », « c. à soupe » et « omelette (2 œufs) » inchangés */
function plurielFr(l) { return /^[^\s(.]+$/.test(l) && !/[sxz]$/.test(l) ? l + "s" : l; }

/* Boutons de portion rapides : ½, 1, 1 ½, 2 assiettes / parts / pièces */
function portionChipsHtml(food) {
  const u = UNITES[food.id];
  if (!u) return "";
  const unitOn = $("#sv-unit").value === "u";
  const qty = +$("#sv-qty").value || 0;
  const lbl = { 0.5: "½", 1: "1", 1.5: "1 ½", 2: "2" };
  return `<div class="sv-portions"><span class="regimes-label">Portion :</span> ${[0.5, 1, 1.5, 2].map(f =>
    `<button type="button" class="chip-btn sv-portion ${unitOn && qty === f ? "active" : ""}" data-f="${f}">${lbl[f]} ${escapeHtml(f >= 2 ? plurielFr(u.l) : u.l)}</button>`).join(" ")}
    <span class="small-note">(1 = ${fmtG(u.g, u.g < 10 ? 1 : 0)} g)</span></div>`;
}

/* Alternatives : même famille, nettement moins chargées sur le nutriment visé,
   apport calorique comparable. */
function alternatives(food, k, max = 3) {
  const ref = food[k] || 0;
  if (ref <= 0) return [];
  return ALIMENTS
    .filter(a => a.id !== food.id && a.cat === food.cat && a.id !== "sel" && (a[k] || 0) <= ref * 0.5 &&
      (food.kcal < 30 || (a.kcal >= food.kcal * 0.4 && a.kcal <= food.kcal * 1.8)))
    .sort((a, b) => (a[k] || 0) - (b[k] || 0))
    .slice(0, max);
}
function altSuggestionHtml(food, k) {
  const alts = alternatives(food, k);
  if (!alts.length) return "Réduisez la portion ou compensez au repas suivant.";
  return `Moins chargé dans la même famille : ${alts.map(a =>
    `<button class="chip-btn sv-suggest" data-nom="${escapeHtml(a.nom)}">${escapeHtml(a.nom)} · ${fmtG(a[k], 2)} g</button>`).join(" ")}`;
}

function renderRecents() {
  const rec = store.get("recents", []).filter(r => ALIMENTS_MAP[r.id]).slice(0, 10);
  $("#sv-recents").innerHTML = rec.length
    ? `<span class="regimes-label">Récents (1 clic = ajout au repas choisi) :</span> ` + rec.map(r => {
      const a = ALIMENTS_MAP[r.id];
      return `<button class="chip-btn sv-recent" data-id="${r.id}" data-g="${r.g}">${escapeHtml(a.nom)} · ${fmtG(r.g, r.g < 10 ? 1 : 0)} g</button>`;
    }).join(" ")
    : "";
}

/* Encart « Ce qui pèse aujourd'hui » : principales sources + conseils ciblés */
const CONSEILS_CAT = {
  "Féculents": "Le pain est la 1ʳᵉ source de sel en France : pain sans sel ou au levain peu salé, une tranche de moins.",
  "Produits laitiers": "Les fromages affinés sont salés et gras : préférez fromage blanc, yaourt, mozzarella, ou réduisez à 30 g.",
  "Viandes & œufs": "La charcuterie concentre sel et graisses saturées : volaille, viande fraîche ou jambon « -25 % de sel ».",
  "Poissons & fruits de mer": "Fumé, surimi et conserves sont salés : poisson frais ou surgelé nature, thon rincé.",
  "Sauces & condiments": "Sauces et bouillons cachent beaucoup de sel : herbes, épices, citron, ail, vinaigre à la place.",
  "Plats préparés": "Les plats préparés sont souvent très salés : comparez les étiquettes, cuisinez maison quand c'est possible.",
  "Matières grasses & oléagineux": "Oléagineux nature plutôt que grillés salés ; huile d'olive ou de colza plutôt que beurre.",
  "Sucré & divers": "Les produits sucrés apportent aussi des graisses saturées : fruit frais, yaourt nature, carré de chocolat noir."
};
function renderInsights() {
  const box = $("#sv-insights");
  const entries = dayEntries(svDate);
  if (!entries.length) {
    box.innerHTML = `<h3>💡 Ce qui pèse aujourd'hui</h3>
      <p class="small-note" style="margin-top:0">Notez votre premier repas : vous verrez ici les aliments qui comptent le plus
      dans votre sel, vos lipides et vos glucides, avec des idées pour les remplacer.</p>`;
    return;
  }
  const t = dayTotals(svDate);
  const lim = getLimites();
  // Agrège par aliment (un même aliment noté à plusieurs repas)
  const agg = {};
  entries.forEach(e => {
    const n = entryNutrition(e);
    const a = (agg[e.id] = agg[e.id] || { id: e.id, nom: e.nom, g: 0, sel: 0, l: 0, ags: 0, gl: 0, suc: 0 });
    a.g += e.g; a.sel += n.sel; a.l += n.l; a.ags += n.ags; a.gl += n.g; a.suc += n.suc;
  });
  const list = Object.values(agg);
  const top = (key, totKey) => list.filter(x => x[key] > 0).sort((a, b) => b[key] - a[key]).slice(0, 3)
    .map(x => `<li><span>${escapeHtml(x.nom)}</span><span class="liste-qty">${fmtG(x[key], key === "sel" ? 2 : 0)} g · ${t[totKey] > 0 ? Math.round(x[key] / t[totKey] * 100) : 0} %</span></li>`).join("");

  // Nutriment le plus tendu par rapport à sa limite
  const tension = SV_KEYS.map(k => ({ k, r: lim[k] > 0 ? t[k] / lim[k] : 0 })).sort((a, b) => b.r - a.r)[0];
  const keyMap = { sel: "sel", l: "l", ags: "ags", g: "gl", suc: "suc" };
  const worst = list.slice().sort((a, b) => b[keyMap[tension.k]] - a[keyMap[tension.k]])[0];
  const worstFood = worst && ALIMENTS_MAP[worst.id];
  let conseil = "";
  if (tension.r >= 0.6 && worstFood) {
    const alts = alternatives(worstFood, tension.k);
    conseil = `<div class="sv-tip">
      <strong>${LIMITE_LABELS[tension.k].emoji} ${LIMITE_LABELS[tension.k].nom} à ${Math.round(tension.r * 100)} % de votre limite.</strong>
      Le plus gros contributeur est <em>${escapeHtml(worst.nom)}</em>.
      ${alts.length ? `<br>À essayer à la place : ${alts.map(a => `${escapeHtml(a.nom)} (${fmtG(a[tension.k], 2)} g/100 g)`).join(", ")}.` : ""}
      ${CONSEILS_CAT[worstFood.cat] ? `<br>${CONSEILS_CAT[worstFood.cat]}` : ""}
    </div>`;
  }
  // Ce qu'il reste pour le prochain repas
  const nextMeal = MEAL_TYPES.find(([k]) => !((journal[svDate] || {})[k] || []).length);
  const reste = nextMeal && svDate === todayISO()
    ? `<p class="small-note">Pour ${nextMeal[0] === "col" ? "la" : "le"} ${nextMeal[1].toLowerCase()}, il vous reste
        <strong>${fmtG(Math.max(0, lim.sel - t.sel), 1)} g de sel</strong>,
        <strong>${fmtG(Math.max(0, lim.l - t.l), 0)} g de lipides</strong> et
        <strong>${fmtG(Math.max(0, lim.g - t.g), 0)} g de glucides</strong>.</p>`
    : "";

  box.innerHTML = `<h3>💡 Ce qui pèse aujourd'hui</h3>
    ${conseil}
    <div class="sv-tops">
      <div class="liste-group"><h3>🧂 Sel</h3><ul>${top("sel", "sel") || "<li>—</li>"}</ul></div>
      <div class="liste-group"><h3>🫒 Lipides</h3><ul>${top("l", "l") || "<li>—</li>"}</ul></div>
      <div class="liste-group"><h3>⚡ Glucides</h3><ul>${top("gl", "g") || "<li>—</li>"}</ul></div>
    </div>
    ${reste}`;
}

/* 7 derniers jours (jusqu'à la date affichée) */
function renderWeek() {
  const lim = getLimites();
  const days = Array.from({ length: 7 }, (_, i) => isoShift(svDate, i - 6));
  const totals = days.map(iso => ({ iso, t: dayTotals(iso), filled: dayEntries(iso).length > 0 }));
  const filled = totals.filter(x => x.filled);
  const row = (k) => {
    const L = LIMITE_LABELS[k];
    const max = Math.max(lim[k] * 1.4, ...totals.map(x => x.t[k]));
    const bars = totals.map(x => {
      const v = x.t[k];
      const h = max > 0 ? v / max * 100 : 0;
      const st = x.filled ? limitStatus(v, lim[k]) : "empty";
      const dd = isoToDate(x.iso);
      return `<button class="wk-col ${x.iso === svDate ? "current" : ""}" data-iso="${x.iso}" title="${dd.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} : ${x.filled ? fmtG(v, L.dec) + " g" : "non renseigné"}">
        <span class="wk-bar ${st}" style="height:${h.toFixed(1)}%"></span>
        <span class="wk-day">${dd.toLocaleDateString("fr-FR", { weekday: "narrow" })}</span>
      </button>`;
    }).join("");
    const okDays = filled.filter(x => x.t[k] <= lim[k]).length;
    const avg = filled.length ? filled.reduce((s, x) => s + x.t[k], 0) / filled.length : 0;
    return `<div class="wk-row">
      <div class="wk-label">${L.emoji} ${L.nom}<span>moy. ${fmtG(avg, L.dec)} g · ${okDays}/${filled.length} j ok</span></div>
      <div class="wk-chart"><span class="wk-limit" style="bottom:${(lim[k] / max * 100).toFixed(1)}%"></span>${bars}</div>
    </div>`;
  };
  $("#sv-week").innerHTML = `<h3>📅 Mes 7 derniers jours</h3>
    ${filled.length ? ["sel", "l", "g"].map(row).join("") +
      `<p class="small-note">Trait pointillé = votre limite. Cliquez sur un jour pour l'ouvrir. C'est la moyenne de la semaine qui compte.</p>`
    : `<p class="small-note" style="margin-top:0">L'historique s'affichera dès que vous aurez noté quelques jours.</p>`}`;
}

/* Formulaire des limites */
function renderLimitsForm() {
  const lim = getLimites();
  $("#sv-presets").innerHTML = Object.entries(LIMITE_PRESETS).map(([key, p]) =>
    `<button class="chip-btn ${lim.preset === key ? "active" : ""}" data-preset="${key}" title="${escapeHtml(p.info)}">${escapeHtml(p.nom)}</button>`).join("") +
    `<button class="chip-btn ${lim.preset === "perso" ? "active" : ""}" data-preset="perso">Personnalisé</button>`;
  const field = (k, step) => `<label class="sv-lim-field"><span>${LIMITE_LABELS[k].emoji} ${LIMITE_LABELS[k].nom}</span>
    <input type="number" data-lim="${k}" value="${lim[k]}" min="0" step="${step}"> g</label>`;
  $("#sv-limits-form").innerHTML =
    field("sel", 0.1) + field("l", 1) + field("ags", 1) + field("g", 1) + field("suc", 1) +
    `<label class="sv-lim-field"><span>🔥 Calories de référence</span>
      <input type="number" data-lim="kcal" value="${lim.kcal || getTarget()}" min="1000" max="4500" step="50"> kcal</label>`;
  const p = LIMITE_PRESETS[lim.preset];
  $("#sv-limits-info").innerHTML = p
    ? `${escapeHtml(p.info)} Calculé pour ${fmtKcal(lim.kcal)} kcal — <button class="inline-link" data-page="besoins">recalculer mes besoins</button>.`
    : "Valeurs personnalisées. Elles s'appliquent aussi au générateur de menus et aux bilans de l'éditeur.";
}

/* Accueil : résumé du jour */
function renderHomeToday() {
  const el = $("#home-today");
  if (!el) return;
  const iso = todayISO();
  if (!dayEntries(iso).length) { el.innerHTML = ""; return; }
  const t = dayTotals(iso);
  el.innerHTML = `<span class="regimes-label">Aujourd'hui :</span> ${limitsLineHtml(t)}`;
}

/* ---------- Actions ---------- */
function addFromForm() {
  const { food, matches, g } = currentInput();
  if (!food) {
    if (matches.length > 1) toast(`Précisez : ${matches.slice(0, 3).map(m => m.nom).join(", ")}…`);
    else toast("Aliment introuvable — créez-le depuis son étiquette");
    $("#sv-food").focus();
    return;
  }
  if (!(g > 0)) { toast("Indiquez une quantité"); $("#sv-qty").focus(); return; }
  const meal = $("#sv-meal").value;
  addEntry(svDate, meal, food, g);
  $("#sv-food").value = "";
  renderSuivi();
  $("#sv-food").focus();
  toast(`${food.nom} ajouté (${MEAL_TYPES.find(m => m[0] === meal)[1].toLowerCase()})`);
}

function importMenuDayToJournal(menuDay) {
  if (!menuDay) return;
  let nb = 0;
  MEAL_TYPES.forEach(([k]) => (menuDay[k].items || []).forEach(it => {
    const a = ALIMENTS_MAP[it.id];
    if (a) { addEntry(svDate, k, a, it.g); nb++; }
  }));
  if (!nb) { toast("Ce jour du menu est vide"); return; }
  showPage("suivi");
  toast(`${nb} aliment${nb > 1 ? "s" : ""} reporté${nb > 1 ? "s" : ""} dans le suivi du ${isoToDate(svDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`);
}

/* ---------- Aliments personnels ---------- */
/* prefill : nom (texte) ; data : aliment déjà rempli (ex. venant d'Open Food Facts)
   avec éventuellement data.code (code-barres) et data.missing (valeurs absentes). */
function openFoodModal(prefill, data) {
  const cats = [...new Set(["Mes aliments", ...ALIMENTS.map(a => a.cat)])];
  if (data && data.cat && !cats.includes(data.cat)) cats.push(data.cat);
  $("#ff-cat").innerHTML = cats.map(c => `<option>${escapeHtml(c)}</option>`).join("");
  $("#food-form").reset();
  $("#ff-note").innerHTML = "";
  if (prefill) $("#ff-nom").value = prefill;
  if (data) {
    $("#ff-nom").value = data.nom || "";
    $("#ff-code").value = data.code || "";
    // Valeur manquante : champ vidé (et non « 0 ») pour attirer l'œil
    const set = (id, v) => {
      if ((data.missing || []).includes(id)) $("#ff-" + id).value = "";
      else if (v !== undefined && v !== null) $("#ff-" + id).value = v;
    };
    ["kcal", "p", "l", "ags", "g", "suc", "sel"].forEach(k => set(k, data[k]));
    if (data.cat) $("#ff-cat").value = data.cat;
    if (data.portion) { $("#ff-portion").value = data.portion.g; $("#ff-portion-l").value = data.portion.l || ""; }
    if (data.missing && data.missing.length) {
      $("#ff-note").innerHTML = `⚠️ Valeurs absentes d'Open Food Facts : <strong>${data.missing.map(k => FF_LABELS[k]).join(", ")}</strong>.
        Complétez-les depuis l'étiquette (les champs vides comptent pour 0).`;
    } else if (data.code) {
      $("#ff-note").textContent = "Valeurs pré-remplies depuis Open Food Facts : vérifiez-les avec l'étiquette avant d'enregistrer.";
    }
  }
  $("#food-modal").hidden = false;
  $("#ff-nom").focus({ preventScroll: true });
}
const FF_LABELS = { kcal: "énergie", p: "protéines", l: "lipides", ags: "saturés", g: "glucides", suc: "sucres", sel: "sel" };
function closeFoodModal() { $("#food-modal").hidden = true; }

/* Enregistre (ou met à jour, même id) un aliment personnel et rafraîchit tous les index. */
function upsertCustomFood(food) {
  const custom = loadCustomFoods().filter(x => x.id !== food.id);
  custom.push(food);
  store.set("custom_foods", custom);
  const i = ALIMENTS.findIndex(x => x.id === food.id);
  if (i >= 0) ALIMENTS[i] = food; else ALIMENTS.push(food);
  if (food.portion && food.portion.g > 0) UNITES[food.id] = { g: food.portion.g, l: food.portion.l || "portion" };
  else delete UNITES[food.id];
  rebuildFoodIndex();
  refreshAlimCats();
  renderAliments();
}
/* Met l'aliment dans le champ de saisie du suivi (aperçu + portion proposée) */
function useFoodInSuivi(food) {
  const sel = $("#sv-unit");
  sel.dataset.food = ""; // force la remise à jour de l'unité / quantité
  $("#sv-food").value = food.nom;
  renderPreview();
}
function saveCustomFood(e) {
  e.preventDefault();
  const num = (id) => Math.max(0, parseFloat(String($(id).value).replace(",", ".")) || 0);
  const nom = $("#ff-nom").value.trim();
  if (!nom) return;
  const code = $("#ff-code").value.replace(/\D/g, "");
  const id = code ? "off_" + code : "perso_" + Date.now();
  const homonyme = ALIMENTS_BY_NAME[nom.toLowerCase()];
  if (homonyme && homonyme.id !== id) { toast("Un aliment porte déjà ce nom"); return; }
  const sodium = num("#ff-sodium");
  const food = {
    id, nom, cat: $("#ff-cat").value || "Mes aliments", perso: true,
    kcal: num("#ff-kcal"), p: num("#ff-p"), g: num("#ff-g"), l: num("#ff-l"),
    ags: num("#ff-ags"), suc: num("#ff-suc"),
    sel: sodium > 0 && !num("#ff-sel") ? Math.round(sodium * 2.5 / 10) / 100 : num("#ff-sel")
  };
  if (code) food.code = code;
  if (food.ags > food.l || food.suc > food.g) { toast("« dont » ne peut pas dépasser le total (saturés ≤ lipides, sucres ≤ glucides)"); return; }
  const portion = num("#ff-portion");
  if (portion > 0) food.portion = { g: portion, l: $("#ff-portion-l").value.trim() || "portion" };
  upsertCustomFood(food);
  closeFoodModal();
  useFoodInSuivi(food);
  toast(`« ${food.nom} » enregistré dans votre base`);
}
function deleteCustomFood(id) {
  const a = ALIMENTS_MAP[id];
  if (!a || !a.perso) return;
  if (!confirm(`Supprimer « ${a.nom} » de votre base ? (Les jours déjà notés le conservent.)`)) return;
  store.set("custom_foods", loadCustomFoods().filter(x => x.id !== id));
  const i = ALIMENTS.findIndex(x => x.id === id);
  if (i >= 0) ALIMENTS.splice(i, 1);
  delete UNITES[id];
  rebuildFoodIndex();
  refreshAlimCats();
  renderAliments();
  toast("Aliment supprimé");
}

/* ---------- Export / import ---------- */
function exportData() {
  const data = {
    app: "NutriGuide", version: 1, exportedAt: new Date().toISOString(),
    journal: store.get("journal", {}), limites: store.get("limites", null),
    custom_foods: loadCustomFoods(), recents: store.get("recents", [])
  };
  downloadFile(JSON.stringify(data, null, 2), `nutriguide-suivi-${todayISO()}.json`, "application/json");
}
function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || typeof data.journal !== "object") throw new Error("format");
      const cur = store.get("journal", {});
      let nbJours = 0;
      Object.entries(data.journal).forEach(([iso, day]) => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return;
        cur[iso] = day; nbJours++;
      });
      store.set("journal", cur);
      if (data.limites && data.limites.sel > 0) store.set("limites", data.limites);
      if (Array.isArray(data.custom_foods)) {
        const custom = loadCustomFoods();
        data.custom_foods.forEach(f => {
          if (f && f.id && f.nom && !custom.some(c => c.id === f.id)) {
            custom.push(f);
            if (!ALIMENTS.some(a => a.id === f.id)) ALIMENTS.push(f);
            if (f.portion && f.portion.g > 0) UNITES[f.id] = { g: f.portion.g, l: f.portion.l || "portion" };
          }
        });
        store.set("custom_foods", custom);
        rebuildFoodIndex();
        refreshAlimCats();
      }
      renderSuivi();
      toast(`Import terminé : ${nbJours} jour${nbJours > 1 ? "s" : ""}`);
    } catch {
      toast("Fichier non reconnu (export NutriGuide attendu)");
    }
  };
  reader.readAsText(file);
}
function exportCsv() {
  const lines = ["date;kcal;lipides_g;satures_g;glucides_g;sucres_g;sel_g;proteines_g"];
  for (let i = 29; i >= 0; i--) {
    const iso = isoShift(todayISO(), -i);
    if (!dayEntries(iso).length) continue;
    const t = dayTotals(iso);
    const f = (v, d) => v.toFixed(d).replace(".", ",");
    lines.push([iso, f(t.kcal, 0), f(t.l, 1), f(t.ags, 1), f(t.g, 1), f(t.suc, 1), f(t.sel, 2), f(t.p, 1)].join(";"));
  }
  if (lines.length === 1) { toast("Aucun jour noté sur les 30 derniers jours"); return; }
  downloadFile("﻿" + lines.join("\r\n"), `nutriguide-30-jours-${todayISO()}.csv`, "text/csv");
}

/* ---------- Initialisation ---------- */
function setupSuivi() {
  $("#sv-meal").value = defaultMealForNow();
  $("#sv-date").max = todayISO();

  $("#sv-prev").addEventListener("click", () => { svDate = isoShift(svDate, -1); renderSuivi(); });
  $("#sv-next").addEventListener("click", () => { if (svDate < todayISO()) { svDate = isoShift(svDate, 1); renderSuivi(); } });
  $("#sv-today").addEventListener("click", () => { svDate = todayISO(); renderSuivi(); });
  $("#sv-date").addEventListener("change", () => { if ($("#sv-date").value) { svDate = $("#sv-date").value; renderSuivi(); } });

  $("#sv-food").addEventListener("input", renderPreview);
  $("#sv-food").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); addFromForm(); } });
  $("#sv-qty").addEventListener("input", renderPreview);
  $("#sv-qty").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); addFromForm(); } });
  $("#sv-unit").addEventListener("change", () => {
    const { food } = findFood($("#sv-food").value);
    const u = food && UNITES[food.id];
    if (u) $("#sv-qty").value = $("#sv-unit").value === "u" ? 1 : u.g;
    renderPreview();
  });
  $("#sv-add-btn").addEventListener("click", addFromForm);

  // Délégation : chips, lignes du journal, semaine, limites
  $("#page-suivi").addEventListener("click", (e) => {
    const salt = e.target.closest("[data-salt]");
    if (salt) {
      addEntry(svDate, $("#sv-meal").value, ALIMENTS_MAP.sel, +salt.dataset.salt);
      renderSuivi();
      toast(`${fmtG(+salt.dataset.salt, 1)} g de sel ajouté`);
      return;
    }
    const recent = e.target.closest(".sv-recent");
    if (recent) {
      const a = ALIMENTS_MAP[recent.dataset.id];
      if (a) { addEntry(svDate, $("#sv-meal").value, a, +recent.dataset.g); renderSuivi(); toast(`${a.nom} ajouté`); }
      return;
    }
    const por = e.target.closest(".sv-portion");
    if (por) { $("#sv-unit").value = "u"; $("#sv-qty").value = +por.dataset.f; renderPreview(); return; }
    const sug = e.target.closest(".sv-suggest");
    if (sug) { $("#sv-food").value = sug.dataset.nom; renderPreview(); $("#sv-qty").focus(); return; }
    if (e.target.closest("#sv-preview-create") || e.target.closest("#sv-new-food")) {
      openFoodModal(e.target.closest("#sv-preview-create") ? $("#sv-food").value.trim() : "");
      return;
    }
    const pick = e.target.closest(".sv-pick-meal");
    if (pick) { $("#sv-meal").value = pick.dataset.meal; $(".sv-add").scrollIntoView({ behavior: "smooth", block: "center" }); $("#sv-food").focus(); return; }
    const del = e.target.closest(".sv-del");
    if (del) {
      const day = journal[svDate];
      if (day) { day[del.dataset.meal].splice(+del.dataset.idx, 1); cleanupDay(svDate); persistJournal(); renderSuivi(); }
      return;
    }
    const col = e.target.closest(".wk-col");
    if (col) { svDate = col.dataset.iso; renderSuivi(); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    const preset = e.target.closest("[data-preset]");
    if (preset) {
      const lim = getLimites();
      const kcal = lim.kcal || getTarget();
      if (preset.dataset.preset === "perso") setLimites({ ...lim, preset: "perso" });
      else setLimites(computePreset(preset.dataset.preset, kcal));
      renderSuivi();
      if (typeof renderEditor === "function") renderEditor();
      return;
    }
  });
  $("#page-suivi").addEventListener("change", (e) => {
    const gi = e.target.closest(".sv-g");
    if (gi) {
      const entry = journal[svDate] && journal[svDate][gi.dataset.meal][+gi.dataset.idx];
      if (entry) { entry.g = Math.max(0.1, +gi.value || 0.1); persistJournal(); renderSuivi(); }
      return;
    }
    const li = e.target.closest("[data-lim]");
    if (li) {
      const lim = { ...getLimites() };
      const v = Math.max(0, +li.value || 0);
      if (li.dataset.lim === "kcal") {
        // Changer les calories recalcule le préréglage actif (sinon on garde les grammes saisis)
        const kcal = Math.max(1000, Math.min(4500, v || 2000));
        setLimites(LIMITE_PRESETS[lim.preset] ? computePreset(lim.preset, kcal) : { ...lim, kcal });
      } else {
        lim[li.dataset.lim] = v;
        lim.preset = "perso";
        setLimites(lim);
      }
      renderSuivi();
      if (typeof renderEditor === "function") renderEditor();
    }
  });

  $("#sv-copy-yesterday").addEventListener("click", () => {
    const y = journal[isoShift(svDate, -1)];
    if (!y || !dayEntries(isoShift(svDate, -1)).length) { toast("Rien de noté la veille"); return; }
    if (dayEntries(svDate).length && !confirm("Ajouter les repas de la veille à ceux déjà notés ?")) return;
    const day = getDay(svDate, true);
    MEAL_TYPES.forEach(([k]) => (y[k] || []).forEach(e => day[k].push({ ...e, n: { ...e.n }, t: Date.now() })));
    persistJournal();
    renderSuivi();
    toast("Repas de la veille recopiés — ajustez les quantités si besoin");
  });
  $("#sv-from-editor").addEventListener("click", () => importMenuDayToJournal(editorMenu.days[currentDay]));
  $("#sv-clear-day").addEventListener("click", () => {
    if (!dayEntries(svDate).length) return;
    if (!confirm("Effacer tout ce qui est noté pour cette journée ?")) return;
    delete journal[svDate];
    persistJournal();
    renderSuivi();
  });

  $("#sv-export").addEventListener("click", exportData);
  $("#sv-csv").addEventListener("click", exportCsv);
  $("#sv-import").addEventListener("change", (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) importData(f);
    e.target.value = "";
  });

  // Modale aliment personnel
  $("#alim-new-food").addEventListener("click", () => openFoodModal(""));
  $("#food-modal-close").addEventListener("click", closeFoodModal);
  $("#food-modal").addEventListener("click", (e) => { if (e.target.id === "food-modal") closeFoodModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#food-modal").hidden) closeFoodModal(); });
  $("#food-form").addEventListener("submit", saveCustomFood);

  // Garder les limites en phase quand on change l'objectif calorique dans « Mes besoins »
  $("#btn-use-target").addEventListener("click", () => {
    const lim = getLimites();
    if (LIMITE_PRESETS[lim.preset]) setLimites(computePreset(lim.preset, getTarget()));
    renderSuivi();
  });

  renderSuivi();
  // Reprendre là où on s'était arrêté (le suivi par défaut si on a déjà commencé)
  const last = store.get("last_page", null);
  if (last && document.getElementById("page-" + last)) showPage(last);
  else if (Object.keys(journal).length) showPage("suivi");
}

setupSuivi();
