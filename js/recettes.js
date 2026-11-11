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
  // Assistant IA : seulement pour une nouvelle recette ; la description reprend le nom cherché
  $("#rc-ia").hidden = !!rcEditing;
  $("#rc-ia").open = false;
  $("#rc-ia-plat").value = rcEditing ? "" : (nom || "");
  $("#rc-ia-rep").value = "";
  rcIaMsg("");
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
    <span class="sv-ac-nom">${escapeHtml(a.nom)}${a.source === "ciqual" ? ` <span class="src-tag">Ciqual</span>` : ""}</span>
    <span class="sv-ac-meta">${fmtKcal(a.kcal)} kcal · ${fmtG(a.l, 0)} g lip. · ${fmtG(a.g, 0)} g gluc. <em>/100 g</em></span></button>`).join("");
  box.hidden = false;
}
function rcHideAc() {
  $$("#rc-ings .rc-ac").forEach(b => { b.hidden = true; });
  rcAc = { row: null, items: [], index: -1 };
}
function rcPick(row, a) {
  a = ensureFood(a);
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

/* ---------- Assistant IA : composition type d'un plat décrit en quelques mots ----------
   Sans abonnement ni clé : l'app prépare une demande que l'on envoie à son propre
   assistant (Claude, ChatGPT, Gemini, Le Chat…) par le partage d'Android, puis on
   recolle sa réponse. L'IA ne donne que les ingrédients et leurs quantités ;
   chaque ingrédient est retrouvé dans les tables de l'app (NutriGuide + Ciqual)
   qui fournissent les valeurs. Ce qui n'est pas reconnu reste en orange. */
function rcIaMsg(text, kind) {
  const m = $("#rc-ia-msg");
  m.hidden = !text;
  m.className = "rc-ia-msg" + (kind ? " " + kind : "");
  m.innerHTML = text;
}
function rcIaPrompt(plat) {
  return `Je note mes repas dans une application de suivi (régime pauvre en sel). Donne-moi la composition d'une recette type, maison, de ce plat : ${plat}

Règles :
- Si le plat est peu courant ou régional, cherche une recette de référence.
- Ingrédients du PLAT ENTIER, pesés avant cuisson, en grammes (1 œuf ≈ 55 g, 1 c. à soupe d'huile ≈ 10 g, 1 c. à café de sel ≈ 5 g…).
- "recherche" : nom simple et générique de l'ingrédient tel qu'il figure dans la table Ciqual (1 à 3 mots, sans marque). Ex. : "farine de blé", "beurre", "lait demi-écrémé", "pomme de terre", "crème fraîche", "lardons", "huile d'olive", "oignon", "gruyère", "sel".
- Bouillon ou fond : poids du cube ou de la poudre (1 cube ≈ 10 g, recherche "bouillon déshydraté"), pas le volume d'eau. L'eau ne compte pas.
- Mets le sel de la recette sur sa propre ligne ("sel"), je l'ajusterai.
- "poids_cuit_g" : poids approximatif du plat cuit, ou 0 si tu ne sais pas.

Réponds UNIQUEMENT avec ce bloc JSON, sans autre texte :
\`\`\`json
{"nom": "…", "parts": 4, "poids_cuit_g": 0, "ingredients": [{"nom": "…", "recherche": "…", "g": 0}], "remarque": "une phrase : source ou hypothèse"}
\`\`\``;
}
/* Lit la réponse collée : le bloc JSON demandé, sinon des lignes « 200 g de farine » */
function rcIaParse(text) {
  const t = String(text || "").replace(/[“”«»]/g, '"').replace(/[‘’]/g, "'");
  const bloc = (t.match(/```(?:json)?\s*([\s\S]*?)```/) || [])[1] || t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1);
  if (bloc && bloc.includes("{")) {
    for (const s of [bloc, bloc.replace(/,\s*([}\]])/g, "$1")]) {
      try {
        const r = JSON.parse(s);
        if (r && Array.isArray(r.ingredients) && r.ingredients.length) return r;
      } catch { /* essai suivant */ }
    }
  }
  const ingredients = [];
  for (const line of t.split(/\n/)) {
    const m = line.match(/(\d+(?:[.,]\d+)?)\s*(kg|g)\b\.?\s*(?:de |d'|d’)?\s*([^\d(:;]+)/i);
    if (!m) continue;
    const nom = m[3].replace(/[*_]/g, "").trim();
    const g = parseFloat(m[1].replace(",", ".")) * (m[2].toLowerCase() === "kg" ? 1000 : 1);
    if (nom && g > 0) ingredients.push({ nom, recherche: nom, g });
  }
  return ingredients.length ? { ingredients } : null;
}
/* Meilleur aliment pour un nom d'ingrédient : nom exact, sinon un nom qui commence par
   le mot cherché ou le contient en mot entier (« ail » → « Ail, cru », pas « Lentilles corail »),
   ingrédients bruts avant les plats. Rien de sûr : null (l'utilisateur choisira). */
function rcMatch(...noms) {
  for (const q of noms) {
    if (!q || !q.trim()) continue;
    const exact = ALIMENTS_BY_NAME[q.trim().toLowerCase()];
    if (exact) return exact;
    const nq = norm(q.trim()).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const mot = new RegExp(`(^|[^a-z0-9])${nq}s?([^a-z0-9]|$)`);
    const rank = (a) => { const n = norm(a.nom); return n.startsWith(nq) && mot.test(n) ? 0 : mot.test(n) ? 1 : 2; };
    const found = searchFoods(q, 40).filter(a => !a.approx && !a.recette)
      .map((a, i) => ({ a, i, r: rank(a) + (a.plat ? 0.5 : 0) }))
      .filter(x => x.r < 2)
      .sort((x, y) => x.r - y.r || x.i - y.i);
    if (found.length) return ensureFood(found[0].a);
  }
  return null;
}
function rcFillFromIa(rec) {
  if (!$("#rc-nom").value.trim() && rec.nom) $("#rc-nom").value = String(rec.nom).slice(0, 60);
  if (rec.parts > 0) $("#rc-parts").value = Math.round(rec.parts);
  $("#rc-poids").value = rec.poids_cuit_g > 0 ? Math.round(rec.poids_cuit_g) : "";
  const ings = $("#rc-ings");
  ings.innerHTML = "";
  let todo = 0;
  for (const it of rec.ingredients || []) {
    const g = Math.round((+it.g || 0) * 10) / 10;
    if (!(g > 0)) continue;
    const a = rcMatch(it.recherche, it.nom);
    if (a) { ings.insertAdjacentHTML("beforeend", rcRowHtml({ id: a.id, q: g, u: "g" })); continue; }
    todo++;
    ings.insertAdjacentHTML("beforeend", rcRowHtml(null));
    const row = ings.lastElementChild;
    row.querySelector(".rc-ing-food").value = it.nom || it.recherche || "";
    row.querySelector(".rc-ing-qty").value = g;
  }
  if (!ings.children.length) ings.insertAdjacentHTML("beforeend", rcRowHtml(null));
  rcRenderSummary();
  const n = ings.children.length;
  const sel = (rec.ingredients || []).some(it => /\bsel\b/i.test(it.recherche || ""));
  rcIaMsg(`✅ ${n} ingrédient${n > 1 ? "s" : ""} proposé${n > 1 ? "s" : ""}.` +
    (todo ? ` <strong>${todo} à préciser</strong> (en orange) : touchez le nom et choisissez dans la liste.` : "") +
    ` Vérifiez les quantités, comme pour votre propre cuisine${sel ? ", notamment le sel" : ""}.` +
    (rec.remarque ? `<br><em>${escapeHtml(rec.remarque)}</em>` : ""), "ok");
}
async function rcIaSend(share) {
  const plat = $("#rc-ia-plat").value.trim() || $("#rc-nom").value.trim();
  if (plat.length < 3) { $("#rc-ia-plat").focus(); rcIaMsg("Décrivez d'abord le plat.", "warn"); return; }
  const prompt = rcIaPrompt(plat);
  let copied = false;
  try { await navigator.clipboard.writeText(prompt); copied = true; } catch { /* pas d'accès au presse-papiers */ }
  if (share && navigator.share) {
    try {
      await navigator.share({ text: prompt });
      rcIaMsg("Quand l'assistant a répondu : <strong>copiez sa réponse</strong>, revenez ici et collez-la en 2.");
      return;
    } catch (e) { if (e.name === "AbortError") return; }
  }
  rcIaMsg(copied
    ? "📋 Demande copiée. Ouvrez votre assistant (appli Claude, ChatGPT…), <strong>collez-la</strong>, puis recopiez sa réponse ici en 2."
    : "Impossible de copier automatiquement : sélectionnez la description et réessayez.", copied ? "" : "warn");
}
function rcIaFill() {
  const rec = rcIaParse($("#rc-ia-rep").value);
  if (!rec) {
    rcIaMsg("Je ne trouve pas d'ingrédients dans ce texte : copiez la réponse <strong>en entier</strong> (le bloc entre accolades { … }).", "warn");
    return false;
  }
  rcFillFromIa(rec);
  return true;
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
  $("#rc-ia-share").addEventListener("click", () => rcIaSend(true));
  $("#rc-ia-copy").addEventListener("click", () => rcIaSend(false));
  $("#rc-ia-fill").addEventListener("click", rcIaFill);
  // Remplissage dès que la réponse est collée
  $("#rc-ia-rep").addEventListener("paste", () => setTimeout(() => { if (rcIaParse($("#rc-ia-rep").value)) rcIaFill(); }, 50));
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
