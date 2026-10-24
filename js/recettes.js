/* =====================================================
   NutriGuide — « Composer ma recette »
   On saisit les ingrédients d'un plat entier (tels qu'on les pèse) et le
   nombre de parts ; NutriGuide calcule les valeurs pour 100 g et pour une
   part, puis enregistre le plat comme aliment personnel (famille
   « Mes recettes »), réutilisable au jour le jour dans le suivi.
   food.recette = { items: [{ id, q, u }], parts, poids } garde la
   composition pour pouvoir modifier la recette plus tard.
   Chargé en dernier (après app.js, suivi.js, mobile.js).
   ===================================================== */
"use strict";

let rcEditing = null; // recette en cours de modification (sinon création)

function rcRowHtml(it) {
  const a = it && ALIMENTS_MAP[it.id];
  return `<div class="rc-ing" data-id="${a ? a.id : ""}">
    <div class="rc-ing-search">
      <input type="search" class="rc-ing-food" placeholder="Ingrédient (ex. farine, beurre…)" autocomplete="off" autocapitalize="off" value="${a ? escapeHtml(a.nom) : ""}">
      <div class="sv-ac rc-ac" role="listbox" hidden></div>
    </div>
    <input type="number" class="rc-ing-qty" min="0" step="any" inputmode="decimal" value="${it ? it.q : ""}" placeholder="Qté" aria-label="Quantité">
    <select class="rc-ing-unit" aria-label="Unité">${rcUnitOptions(a, it && it.u)}</select>
    <button type="button" class="food-del rc-ing-del" title="Retirer">✕</button>
  </div>`;
}
function rcUnitOptions(a, cur) {
  const u = a && UNITES[a.id];
  return `<option value="g">g</option>` +
    (u ? `<option value="u" ${cur === "u" ? "selected" : ""}>${escapeHtml(u.l)} (${fmtG(u.g, u.g < 10 ? 1 : 0)} g)</option>` : "");
}

/* Ingrédients saisis (lignes complètes uniquement), en grammes */
function rcItems() {
  return $$("#rc-ings .rc-ing").map(row => {
    const a = ALIMENTS_MAP[row.dataset.id];
    const q = Math.max(0, parseFloat(String(row.querySelector(".rc-ing-qty").value).replace(",", ".")) || 0);
    const u = row.querySelector(".rc-ing-unit").value;
    if (!a || !(q > 0)) return null;
    const g = u === "u" && UNITES[a.id] ? q * UNITES[a.id].g : q;
    return { a, q, u, g };
  }).filter(Boolean);
}
function rcCompute() {
  const items = rcItems();
  const total = sumNutrition(items.map(x => ({ id: x.a.id, g: x.g })));
  const brut = items.reduce((s, x) => s + x.g, 0);
  const poidsCuit = Math.max(0, +$("#rc-poids").value || 0);
  const poids = poidsCuit > 0 ? poidsCuit : brut;
  const parts = Math.max(1, Math.round(+$("#rc-parts").value || 1));
  const per100 = zeroNutrition();
  if (poids > 0) NUTRI_KEYS.forEach(k => { per100[k] = total[k] * 100 / poids; });
  return { items, total, brut, poids, parts, part: poids / parts, per100 };
}

function rcRenderSummary() {
  const r = rcCompute();
  const box = $("#rc-summary");
  if (!r.items.length) { box.innerHTML = `<p class="small-note">Ajoutez au moins un ingrédient avec sa quantité.</p>`; return; }
  const p = {};
  NUTRI_KEYS.forEach(k => { p[k] = r.per100[k] * r.part / 100; });
  const line = (n) => `🧂 ${fmtG(n.sel, 2)} g sel · 🫒 ${fmtG(n.l, 1)} g lipides (dont ${fmtG(n.ags, 1)} sat.) ·
    ⚡ ${fmtG(n.g, 1)} g glucides (dont ${fmtG(n.suc, 1)} sucres) · 💪 ${fmtG(n.p, 1)} g prot. · 🌾 ${fmtG(n.fib, 1)} g fibres · 🍌 ${fmtG(n.pot, 0)} mg potassium`;
  const lim = getLimites();
  const lourd = ["sel", "l", "ags", "suc"].filter(k => lim[k] > 0 && p[k] / lim[k] >= 0.4);
  box.innerHTML = `
    <div class="rc-sum-part"><strong>1 part ≈ ${fmtG(r.part, 0)} g · ${fmtKcal(p.kcal)} kcal</strong><br>${line(p)}</div>
    ${lourd.length ? `<div class="sv-warn">⚠️ Une part représente déjà ≥ 40 % de votre limite du jour en ${lourd.map(k => LIMITE_LABELS[k].nom.toLowerCase()).join(", ")}.</div>` : ""}
    <div class="small-note">Plat entier : ${fmtG(r.poids, 0)} g${r.poids !== r.brut ? ` cuit (${fmtG(r.brut, 0)} g d'ingrédients)` : ""} · ${fmtKcal(r.total.kcal)} kcal ·
      pour 100 g : ${fmtKcal(r.per100.kcal)} kcal, ${fmtG(r.per100.sel, 2)} g sel, ${fmtG(r.per100.l, 1)} g lipides, ${fmtG(r.per100.g, 1)} g glucides</div>`;
}

/* food : recette existante à modifier ; nom : nom proposé pour une nouvelle recette */
function openRecetteModal(food, nom) {
  rcEditing = food && food.recette ? food : null;
  $("#recette-form").reset();
  $("#recette-title").textContent = rcEditing ? "✏️ Modifier ma recette" : "🍲 Composer ma recette";
  $("#rc-nom").value = rcEditing ? rcEditing.nom : (nom || "");
  const items = rcEditing ? rcEditing.recette.items.filter(it => ALIMENTS_MAP[it.id]) : [];
  $("#rc-ings").innerHTML = (items.length ? items : [null, null, null]).map(rcRowHtml).join("");
  $("#rc-parts").value = rcEditing ? rcEditing.recette.parts : 4;
  $("#rc-poids").value = rcEditing && rcEditing.recette.poids ? rcEditing.recette.poids : "";
  $("#rc-delete").hidden = !rcEditing;
  rcRenderSummary();
  $("#recette-modal").hidden = false;
  const first = rcEditing ? $("#rc-parts") : ($("#rc-nom").value ? $(".rc-ing-food") : $("#rc-nom"));
  first.focus({ preventScroll: true });
}
function closeRecetteModal() { $("#recette-modal").hidden = true; rcHideAc(); }

function saveRecette(e) {
  e.preventDefault();
  const nom = $("#rc-nom").value.trim();
  if (!nom) { $("#rc-nom").focus(); return; }
  const r = rcCompute();
  if (!r.items.length) { toast("Ajoutez au moins un ingrédient avec sa quantité"); return; }
  const incomplete = $$("#rc-ings .rc-ing").some(row => row.querySelector(".rc-ing-food").value.trim() && !ALIMENTS_MAP[row.dataset.id]);
  if (incomplete) { toast("Un ingrédient n'est pas reconnu : choisissez-le dans la liste (ou retirez la ligne)"); return; }
  const id = rcEditing ? rcEditing.id : "rec_" + Date.now();
  const homonyme = ALIMENTS_BY_NAME[nom.toLowerCase()];
  if (homonyme && homonyme.id !== id) { toast("Un aliment porte déjà ce nom : choisissez-en un autre"); return; }
  const round = (v, d) => Math.round(v * 10 ** d) / 10 ** d;
  const food = {
    id, nom, cat: "Mes recettes", perso: true,
    kcal: round(r.per100.kcal, 0), p: round(r.per100.p, 1), g: round(r.per100.g, 1), l: round(r.per100.l, 1),
    ags: round(r.per100.ags, 1), suc: round(r.per100.suc, 1), sel: round(r.per100.sel, 2), fib: round(r.per100.fib, 1), pot: round(r.per100.pot, 0),
    portion: { g: Math.round(r.part), l: "part" },
    recette: {
      items: r.items.map(x => ({ id: x.a.id, q: x.q, u: x.u })),
      parts: r.parts,
      poids: Math.max(0, +$("#rc-poids").value || 0) || null
    }
  };
  // Régimes : déduits des ingrédients
  if (r.items.some(x => isMeatOrFish(x.a))) food.viande = true;
  if (r.items.some(x => GLUTEN_IDS.has(x.a.id) || x.a.gluten)) food.gluten = true;
  if (r.items.some(x => LACTOSE_IDS.has(x.a.id) || x.a.lactose)) food.lactose = true;
  upsertCustomFood(food);
  closeRecetteModal();
  if (typeof useFoodInSuivi === "function" && $("#page-suivi").classList.contains("active")) useFoodInSuivi(food);
  toast(`« ${food.nom} » enregistrée : 1 part = ${food.portion.g} g`);
}

/* ---------- Recherche d'ingrédient (même moteur que la saisie du suivi) ---------- */
let rcAc = { row: null, items: [], index: -1 };
function rcShowAc(row) {
  const input = row.querySelector(".rc-ing-food");
  const box = row.querySelector(".rc-ac");
  const exact = ALIMENTS_BY_NAME[input.value.trim().toLowerCase()];
  // Ingrédients bruts avant les plats tout faits (« Œuf » avant « Œufs brouillés »)
  const items = exact ? [] : searchFoods(input.value, 25)
    .filter(a => !rcEditing || a.id !== rcEditing.id)
    .sort((x, y) => (x.plat ? 1 : 0) - (y.plat ? 1 : 0))
    .slice(0, 7);
  rcHideAc();
  rcAc = { row, items, index: -1 };
  if (!items.length) return;
  box.innerHTML = items.map((a, i) => `<button type="button" class="sv-ac-item" data-i="${i}">
    <span class="sv-ac-nom">${escapeHtml(a.nom)}</span>
    <span class="sv-ac-meta">${fmtKcal(a.kcal)} kcal · ${fmtG(a.l, 0)} g lip. · ${fmtG(a.g, 0)} g gluc. <em>/100 g</em></span></button>`).join("");
  box.hidden = false;
}
function rcHideAc() {
  $$("#rc-ings .rc-ac").forEach(b => { b.hidden = true; });
  rcAc = { row: null, items: [], index: -1 };
}
function rcPick(row, a) {
  row.dataset.id = a.id;
  row.querySelector(".rc-ing-food").value = a.nom;
  const sel = row.querySelector(".rc-ing-unit");
  sel.innerHTML = rcUnitOptions(a);
  const qty = row.querySelector(".rc-ing-qty");
  // Unité naturelle proposée d'office pour œuf, pincée, rouleau de pâte…
  if (UNITES[a.id] && UNITES[a.id].g <= 250 && !qty.value) { sel.value = "u"; qty.value = 1; }
  rcHideAc();
  rcRenderSummary();
  qty.focus({ preventScroll: true });
  try { qty.select(); } catch { /* type=number */ }
}

function setupRecettes() {
  const ings = $("#rc-ings");
  ings.addEventListener("input", (e) => {
    const row = e.target.closest(".rc-ing");
    if (!row) return;
    if (e.target.classList.contains("rc-ing-food")) {
      // Le texte a changé : l'ingrédient n'est plus reconnu tant qu'il n'est pas rechoisi
      const exact = ALIMENTS_BY_NAME[e.target.value.trim().toLowerCase()];
      row.dataset.id = exact ? exact.id : "";
      if (exact) row.querySelector(".rc-ing-unit").innerHTML = rcUnitOptions(exact);
      rcShowAc(row);
    }
    rcRenderSummary();
  });
  ings.addEventListener("change", (e) => {
    const sel = e.target.closest(".rc-ing-unit");
    if (sel) {
      const row = sel.closest(".rc-ing");
      const u = UNITES[row.dataset.id];
      if (u) row.querySelector(".rc-ing-qty").value = sel.value === "u" ? 1 : u.g;
      rcRenderSummary();
    }
  });
  ings.addEventListener("focusin", (e) => { if (e.target.classList.contains("rc-ing-food")) rcShowAc(e.target.closest(".rc-ing")); });
  ings.addEventListener("focusout", (e) => {
    if (!e.target.classList.contains("rc-ing-food")) return;
    const input = e.target, row = input.closest(".rc-ing");
    // Ne ferme que la liste de CETTE ligne (pas celle de l'ingrédient suivant déjà ouverte)
    setTimeout(() => {
      if (rcPressing || document.activeElement === input) return;
      row.querySelector(".rc-ac").hidden = true;
      if (rcAc.row === row) rcAc = { row: null, items: [], index: -1 };
    }, 200);
  });
  // Comme dans la saisie du suivi : pendant l'appui sur la liste, elle ne se ferme pas
  let rcPressing = false;
  ings.addEventListener("pointerdown", (e) => {
    if (!e.target.closest(".rc-ac .sv-ac-item")) return;
    rcPressing = true;
    if (e.pointerType === "mouse") e.preventDefault();
  });
  document.addEventListener("pointerup", () => setTimeout(() => { rcPressing = false; }, 400));
  ings.addEventListener("click", (e) => {
    const it = e.target.closest(".rc-ac .sv-ac-item");
    rcPressing = false;
    if (it && rcAc.row) { rcPick(rcAc.row, rcAc.items[+it.dataset.i]); return; }
    const del = e.target.closest(".rc-ing-del");
    if (del) {
      del.closest(".rc-ing").remove();
      if (!$("#rc-ings .rc-ing")) ings.insertAdjacentHTML("beforeend", rcRowHtml(null));
      rcRenderSummary();
    }
  });
  ings.addEventListener("keydown", (e) => {
    if (!e.target.classList.contains("rc-ing-food")) return;
    const row = e.target.closest(".rc-ing");
    const open = rcAc.row === row && rcAc.items.length;
    if (open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      rcAc.index = (rcAc.index + (e.key === "ArrowDown" ? 1 : -1) + rcAc.items.length) % rcAc.items.length;
      row.querySelectorAll(".sv-ac-item").forEach((el, i) => el.classList.toggle("active", i === rcAc.index));
    } else if (e.key === "Enter") {
      e.preventDefault(); // pas d'envoi du formulaire depuis un champ ingrédient
      if (open) rcPick(row, rcAc.items[rcAc.index >= 0 ? rcAc.index : 0]);
    } else if (e.key === "Escape" && open) {
      e.stopPropagation();
      rcHideAc();
    }
  });

  $("#rc-add-ing").addEventListener("click", () => {
    ings.insertAdjacentHTML("beforeend", rcRowHtml(null));
    const inputs = $$("#rc-ings .rc-ing-food");
    inputs[inputs.length - 1].focus();
  });
  $("#rc-parts").addEventListener("input", rcRenderSummary);
  $("#rc-poids").addEventListener("input", rcRenderSummary);
  $("#recette-form").addEventListener("submit", saveRecette);
  $("#rc-delete").addEventListener("click", () => {
    if (!rcEditing) return;
    const id = rcEditing.id;
    closeRecetteModal();
    deleteCustomFood(id);
  });
  $("#recette-close").addEventListener("click", closeRecetteModal);
  $("#recette-modal").addEventListener("click", (e) => { if (e.target.id === "recette-modal") closeRecetteModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#recette-modal").hidden) closeRecetteModal(); });

  // Points d'entrée : saisie du suivi, page Aliments
  document.addEventListener("click", (e) => {
    const mk = e.target.closest(".sv-make-recette");
    if (mk) { openRecetteModal(null, mk.dataset.nom || ""); return; }
    if (e.target.closest("#sv-new-recette") || e.target.closest("#alim-new-recette")) openRecetteModal(null, "");
  });
}
setupRecettes();
