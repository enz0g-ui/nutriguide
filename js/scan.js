/* =====================================================
   NutriGuide — Scan de code-barres + Open Food Facts
   - lecture : API BarcodeDetector native (Chrome Android) sinon ZXing
     (bibliothèque locale chargée à la demande, ex. iPhone)
   - recherche : d'abord dans les produits déjà enregistrés (marche hors
     ligne), puis sur Open Food Facts
   - le produit devient un « aliment perso » (id off_<code>) réutilisable
   Chargé après suivi.js et mobile.js.
   ===================================================== */
"use strict";

const OFF_FIELDS = [
  "code", "product_name", "product_name_fr", "generic_name_fr", "brands", "quantity",
  "serving_size", "serving_quantity", "nutriments", "nutriscore_grade",
  "image_front_small_url", "categories_tags"
].join(",");
const BARCODE_FORMATS = ["ean_13", "ean_8", "upc_a", "upc_e"];

let scanStream = null;
let scanLoop = null;
let zxingReader = null;
let scanContext = "suivi";   // "suivi" : ajout au journal ; "form" : pré-remplir le formulaire
let scanBusy = false;

/* ---------- Validation du code (clé de contrôle EAN/UPC) ---------- */
function validBarcode(code) {
  if (!/^\d{8}$|^\d{12,14}$/.test(code)) return false;
  const digits = code.split("").map(Number);
  const check = digits.pop();
  const sum = digits.reverse().reduce((s, d, i) => s + d * (i % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === check;
}

/* ---------- Open Food Facts ---------- */
async function fetchOFF(code) {
  const url = `https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=${OFF_FIELDS}&lc=fr`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" }, signal: ctrl.signal });
    if (res.status === 404) return null;
    if (res.status === 429 || res.status === 503) throw new Error("busy");
    if (!res.ok) throw new Error("http");
    const j = await res.json();
    return j && j.status === 1 && j.product ? j.product : null;
  } finally {
    clearTimeout(timer);
  }
}

const OFF_CATS = [
  [/cheeses|dairies|yogurts|milks|creams|butters/, "Produits laitiers"],
  [/hams|sausages|meats|poultry|charcuterie|prepared-meats/, "Viandes & œufs"],
  [/fishes|seafood|crustaceans|surimi/, "Poissons & fruits de mer"],
  [/pizzas|meals|sandwiches|quiches|prepared-salads|soups/, "Plats préparés"],
  [/breads|pastas|rices|cereals|breakfast-cereals|biscottes|viennoiseries|potatoes/, "Féculents"],
  [/legumes|pulses|lentils|chickpeas|beans/, "Légumineuses"],
  [/beverages|waters|juices|sodas|wines|beers/, "Boissons"],
  [/chocolates|biscuits|sweet-snacks|confectioneries|desserts|jams|honeys|salty-snacks|crisps|chips/, "Sucré & divers"],
  [/sauces|condiments|mustards|mayonnaises|ketchup|spices|broths/, "Sauces & condiments"],
  [/oils|fats|nuts|seeds/, "Matières grasses & oléagineux"],
  [/fruits/, "Fruits"],
  [/vegetables/, "Légumes"]
];
function offCategory(tags) {
  const t = (tags || []).join(" ");
  const hit = OFF_CATS.find(([re]) => re.test(t));
  return hit ? hit[1] : "Mes aliments";
}
const round2 = (v) => Math.round(v * 100) / 100;

/* Convertit un produit OFF en aliment NutriGuide (valeurs pour 100 g). */
function offToFood(p, code) {
  const n = p.nutriments || {};
  const num = (k) => (n[k] === undefined || n[k] === "" || isNaN(+n[k])) ? null : +n[k];
  let kcal = num("energy-kcal_100g");
  if (kcal === null && num("energy_100g") !== null) kcal = num("energy_100g") / 4.184; // kJ → kcal
  let sel = num("salt_100g");
  if (sel === null && num("sodium_100g") !== null) sel = num("sodium_100g") * 2.5;
  const vals = { kcal, p: num("proteins_100g"), g: num("carbohydrates_100g"), suc: num("sugars_100g"),
    l: num("fat_100g"), ags: num("saturated-fat_100g"), sel };
  const missing = Object.keys(vals).filter(k => vals[k] === null);
  const fib = num("fiber_100g"); // souvent absent sur Open Food Facts : facultatif, compté 0
  const pot = num("potassium_100g"); // en g sur OFF → converti en mg ; facultatif
  const brand = (p.brands || "").split(",")[0].trim();
  let nom = (p.product_name_fr || p.product_name || p.generic_name_fr || "").trim() || `Produit ${code}`;
  if (brand && !nom.toLowerCase().includes(brand.toLowerCase())) nom += ` — ${brand}`;
  nom = nom.slice(0, 60);
  const food = {
    id: "off_" + code, code, nom, cat: offCategory(p.categories_tags), perso: true, source: "off",
    kcal: Math.round(vals.kcal || 0), p: round2(vals.p || 0), g: round2(vals.g || 0), l: round2(vals.l || 0),
    ags: round2(vals.ags || 0), suc: round2(vals.suc || 0), sel: round2(vals.sel || 0), fib: round2(fib || 0), pot: Math.round((pot || 0) * 1000),
    nutriscore: /^[a-e]$/.test(p.nutriscore_grade || "") ? p.nutriscore_grade : null,
    image: p.image_front_small_url || null,
    quantite: p.quantity || null
  };
  const sq = parseFloat(p.serving_quantity);
  if (sq > 0 && sq < 1000) food.portion = { g: round2(sq), l: "portion" };
  if (missing.length) food.missing = missing;
  return food;
}

/* Homonymes : deux produits OFF peuvent porter le même nom → on suffixe le code */
function uniqueName(food) {
  const other = ALIMENTS_BY_NAME[food.nom.toLowerCase()];
  if (other && other.id !== food.id) food.nom = `${food.nom.slice(0, 50)} (${food.code.slice(-6)})`;
  return food;
}

/* ---------- Caméra ---------- */
async function startCamera() {
  const video = $("#scan-video");
  $("#scan-view").classList.remove("off");
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    scanStatus("Caméra indisponible ici (il faut ouvrir l'app en https). Tapez le code-barres ci-dessous.", "warn");
    $("#scan-view").classList.add("off");
    return;
  }
  const native = await nativeDetector();
  try {
    if (native) {
      scanStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false
      });
      video.srcObject = scanStream;
      await video.play();
      setupTorch();
      const tick = async () => {
        if (!scanStream) return;
        try {
          const codes = await native.detect(video);
          const hit = codes.find(c => validBarcode(c.rawValue));
          if (hit) { onBarcode(hit.rawValue); return; }
        } catch { /* image pas encore prête */ }
        scanLoop = setTimeout(tick, 120);
      };
      tick();
    } else {
      scanStatus("Chargement du lecteur…");
      await loadZXing();
      const hints = new Map();
      hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, [
        ZXing.BarcodeFormat.EAN_13, ZXing.BarcodeFormat.EAN_8, ZXing.BarcodeFormat.UPC_A, ZXing.BarcodeFormat.UPC_E
      ]);
      zxingReader = new ZXing.BrowserMultiFormatReader(hints, 150);
      await zxingReader.decodeFromConstraints(
        { video: { facingMode: { ideal: "environment" } }, audio: false }, video,
        (result) => { if (result && validBarcode(result.getText())) onBarcode(result.getText()); }
      );
      scanStream = video.srcObject;
      setupTorch();
    }
    scanStatus("Visez le code-barres du produit.");
  } catch (err) {
    const denied = err && (err.name === "NotAllowedError" || err.name === "SecurityError");
    scanStatus(denied
      ? "Accès à la caméra refusé. Autorisez-le dans les réglages du navigateur, ou tapez le code ci-dessous."
      : "Impossible d'ouvrir la caméra. Tapez le code-barres ci-dessous.", "warn");
    $("#scan-view").classList.add("off");
    stopCamera();
  }
}
async function nativeDetector() {
  if (!("BarcodeDetector" in window)) return null;
  try {
    const supported = await BarcodeDetector.getSupportedFormats();
    const formats = BARCODE_FORMATS.filter(f => supported.includes(f));
    return formats.length ? new BarcodeDetector({ formats }) : null;
  } catch { return null; }
}
function loadZXing() {
  if (window.ZXing) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "js/vendor/zxing-0.21.3.min.js";
    s.onload = resolve;
    s.onerror = () => reject(new Error("zxing"));
    document.head.appendChild(s);
  });
}
function setupTorch() {
  const btn = $("#scan-torch");
  btn.hidden = true;
  const track = scanStream && scanStream.getVideoTracks()[0];
  if (!track || !track.getCapabilities) return;
  try {
    if (!track.getCapabilities().torch) return;
  } catch { return; }
  let on = false;
  btn.hidden = false;
  btn.onclick = () => {
    on = !on;
    track.applyConstraints({ advanced: [{ torch: on }] }).catch(() => {});
    btn.classList.toggle("on", on);
  };
}
function stopCamera() {
  clearTimeout(scanLoop);
  scanLoop = null;
  if (zxingReader) { try { zxingReader.reset(); } catch { /* déjà arrêté */ } zxingReader = null; }
  if (scanStream) { scanStream.getTracks().forEach(t => t.stop()); scanStream = null; }
  const v = $("#scan-video");
  v.srcObject = null;
  $("#scan-torch").hidden = true;
}
function scanStatus(msg, kind) {
  const el = $("#scan-status");
  el.textContent = msg;
  el.className = "scan-status" + (kind ? " " + kind : "");
}

/* ---------- Ouverture / fermeture ---------- */
function openScanner(context) {
  scanContext = context || "suivi";
  scanBusy = false;
  $("#scan-result").innerHTML = "";
  $("#scan-code").value = "";
  $("#scan-modal").hidden = false;
  document.body.classList.add("has-scan");
  history.pushState({ scan: true }, "");
  startCamera();
}
function closeScanner(fromPopstate) {
  if ($("#scan-modal").hidden) return;
  stopCamera();
  $("#scan-modal").hidden = true;
  document.body.classList.remove("has-scan");
  if (!fromPopstate && history.state && history.state.scan) history.back();
}
window.addEventListener("popstate", () => { if (!(history.state && history.state.scan)) closeScanner(true); });

/* ---------- Code lu → recherche ---------- */
async function onBarcode(raw) {
  const code = String(raw).replace(/\D/g, "");
  if (scanBusy) return;
  if (!validBarcode(code)) { scanStatus("Code-barres invalide — vérifiez les chiffres.", "warn"); return; }
  scanBusy = true;
  stopCamera();
  $("#scan-view").classList.add("off");
  if (navigator.vibrate) navigator.vibrate(60);
  $("#scan-code").value = code;

  // 1) Déjà dans ma base ? (instantané, fonctionne hors ligne)
  const local = ALIMENTS.find(a => a.code === code);
  if (local) {
    scanStatus("Produit déjà enregistré dans votre base.", "ok");
    renderScanResult(local, true);
    scanBusy = false;
    return;
  }
  // 2) Open Food Facts
  if (!navigator.onLine) {
    scanStatus("Pas de connexion : impossible d'interroger Open Food Facts. Vous pouvez saisir l'étiquette à la main.", "warn");
    renderNotFound(code, true);
    scanBusy = false;
    return;
  }
  scanStatus(`Recherche du ${code} sur Open Food Facts…`);
  $("#scan-result").innerHTML = `<div class="scan-loading"><span class="spinner"></span></div>`;
  try {
    const p = await fetchOFF(code);
    if (!p) {
      scanStatus("Produit inconnu d'Open Food Facts.", "warn");
      renderNotFound(code);
    } else {
      const food = uniqueName(offToFood(p, code));
      scanStatus(food.missing ? "Produit trouvé, mais des valeurs manquent." : "Produit trouvé ✔", food.missing ? "warn" : "ok");
      renderScanResult(food, false);
    }
  } catch (err) {
    scanStatus(err && err.message === "busy"
      ? "Open Food Facts est saturé, réessayez dans une minute."
      : "Open Food Facts ne répond pas. Réessayez ou saisissez l'étiquette.", "warn");
    renderNotFound(code, true);
  }
  scanBusy = false;
}

function renderNotFound(code, network) {
  $("#scan-result").innerHTML = `<div class="scan-card">
    <p>${network ? "Recherche impossible pour le moment." : `Le code <strong>${code}</strong> n'est pas dans Open Food Facts.`}
      Recopiez l'étiquette : il sera enregistré avec ce code-barres et reconnu au prochain scan.</p>
    <div class="scan-actions">
      <button class="btn btn-primary btn-sm" id="scan-manual-fill">🏷️ Saisir l'étiquette</button>
      <button class="btn btn-ghost btn-sm" id="scan-again">🔄 Scanner un autre</button>
    </div>
  </div>`;
  $("#scan-manual-fill").onclick = () => { closeScanner(); openFoodModal("", { code, nom: "" }); };
  $("#scan-again").onclick = restartScan;
}

function renderScanResult(food, known) {
  const lim = getLimites();
  const v = (x, d) => fmtG(x || 0, d);
  const miss = (k) => (food.missing || []).includes(k);
  const cell = (k, label, dec) => {
    const feu = SEUILS_100G[k] && !miss(k) ? feuHtml(k, food[k] || 0) : "";
    return `<div class="sc-val ${miss(k) ? "missing" : ""}"><span>${label}</span><strong>${feu}${miss(k) ? "?" : v(food[k], dec) + " g"}</strong></div>`;
  };
  const portion = food.portion ? food.portion.g : null;
  const parPortion = portion
    ? `<p class="small-note">Par portion (${fmtG(portion, 0)} g) : 🧂 ${v(food.sel * portion / 100, 2)} g sel
        (${Math.round(food.sel * portion / 100 / lim.sel * 100)} % de votre limite) ·
        🫒 ${v(food.l * portion / 100, 1)} g lipides · ⚡ ${v(food.g * portion / 100, 1)} g glucides ·
        💪 ${v(food.p * portion / 100, 1)} g protéines · 🌾 ${v((food.fib || 0) * portion / 100, 1)} g fibres</p>`
    : "";
  $("#scan-result").innerHTML = `<div class="scan-card">
    <div class="sc-head">
      ${food.image ? `<img src="${escapeHtml(food.image)}" alt="" class="sc-img" loading="lazy" referrerpolicy="no-referrer">` : `<div class="sc-img sc-noimg">🏷️</div>`}
      <div class="sc-title">
        <strong>${escapeHtml(food.nom)}</strong>
        <span class="small-note">${escapeHtml(food.cat)}${food.quantite ? " · " + escapeHtml(food.quantite) : ""} · code ${food.code}</span>
        ${food.nutriscore ? `<span class="nutriscore ns-${food.nutriscore}">Nutri-Score ${food.nutriscore.toUpperCase()}</span>` : ""}
      </div>
    </div>
    <div class="sc-grid">
      ${cell("sel", "🧂 Sel", 2)}${cell("l", "🫒 Lipides", 1)}${cell("ags", "dont saturés", 1)}
      ${cell("g", "⚡ Glucides", 1)}${cell("suc", "dont sucres", 1)}
      ${cell("p", "💪 Protéines", 1)}${cell("fib", "🌾 Fibres", 1)}
      <div class="sc-val ${miss("kcal") ? "missing" : ""}"><span>🔥 Énergie</span><strong>${miss("kcal") ? "?" : fmtKcal(food.kcal) + " kcal"}</strong></div>
    </div>
    <p class="small-note" style="margin-top:4px">Valeurs pour 100 g${known ? " — enregistrées dans votre base" : ""}.</p>
    ${parPortion}
    <div class="scan-actions">
      ${food.missing ? "" : `<button class="btn btn-primary btn-sm" id="scan-use">${scanContext === "form" ? "✅ Pré-remplir le formulaire" : "✅ Utiliser ce produit"}</button>`}
      <button class="btn ${food.missing ? "btn-primary" : "btn-ghost"} btn-sm" id="scan-edit">✏️ ${food.missing ? "Compléter les valeurs" : "Corriger"}</button>
      <button class="btn btn-ghost btn-sm" id="scan-again">🔄 Autre produit</button>
    </div>
  </div>`;
  const use = $("#scan-use");
  if (use) use.onclick = () => {
    closeScanner();
    if (scanContext === "form") { openFoodModal("", food); return; }
    const clean = { ...food };
    delete clean.missing;
    upsertCustomFood(clean);
    toast(`« ${clean.nom} » prêt à ajouter — vérifiez la quantité`);
    // Après le retour d'historique du scanner (asynchrone), on ouvre la saisie
    setTimeout(() => {
      if (!document.body.classList.contains("sheet-open") && typeof openAddSheet === "function") openAddSheet();
      useFoodInSuivi(clean);
      const q = $("#sv-qty");
      q.focus({ preventScroll: true });
      try { q.select(); } catch { /* type number */ }
    }, 250);
  };
  $("#scan-edit").onclick = () => { closeScanner(); openFoodModal("", food); };
  $("#scan-again").onclick = restartScan;
}
function restartScan() {
  scanBusy = false;
  $("#scan-result").innerHTML = "";
  $("#scan-code").value = "";
  startCamera();
}

/* ---------- Branchements ---------- */
$("#sv-scan").addEventListener("click", () => openScanner("suivi"));
$("#ff-scan").addEventListener("click", () => { $("#food-modal").hidden = true; openScanner("form"); });
$("#ff-lookup").addEventListener("click", () => {
  const code = $("#ff-code").value.replace(/\D/g, "");
  if (!validBarcode(code)) { toast("Code-barres invalide (8, 12 ou 13 chiffres)"); return; }
  $("#food-modal").hidden = true;
  openScanner("form");
  onBarcode(code);
});
$("#scan-close").addEventListener("click", () => closeScanner());
$("#scan-modal").addEventListener("click", (e) => { if (e.target.id === "scan-modal") closeScanner(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#scan-modal").hidden) closeScanner(); });
$("#scan-manual").addEventListener("submit", (e) => {
  e.preventDefault();
  scanBusy = false;
  onBarcode($("#scan-code").value);
});
// On coupe la caméra si l'app passe en arrière-plan
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden" && !$("#scan-modal").hidden) stopCamera();
  else if (document.visibilityState === "visible" && !$("#scan-modal").hidden && !scanStream && !$("#scan-result").innerHTML) startCamera();
});
