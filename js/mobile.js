/* =====================================================
   NutriGuide — Smartphone & application installable (PWA)
   - installation sur l'écran d'accueil + fonctionnement hors ligne
   - reprise au bon jour quand on rouvre l'app
   - feuille d'ajout avec bouton « + », recherche d'aliment tactile
   - bandeau compact des limites, panneaux repliables
   Chargé après app.js et suivi.js.
   ===================================================== */
"use strict";

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
const isMobileLayout = () => window.matchMedia("(max-width: 760px)").matches;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

if (isStandalone()) document.documentElement.classList.add("standalone");

/* ---------- Service worker : hors ligne + mises à jour ---------- */
function showBanner(html, actions) {
  const b = $("#app-banner");
  b.innerHTML = html;
  b.hidden = false;
  (actions || []).forEach(([sel, fn]) => b.querySelector(sel).addEventListener("click", fn));
}
function hideBanner() { $("#app-banner").hidden = true; }

let updateRequested = false;
if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").then(reg => {
      const offerUpdate = (worker) => {
        showBanner(`<span>✨ Nouvelle version de NutriGuide disponible.</span>
          <button class="btn btn-primary btn-sm" id="banner-update">Mettre à jour</button>
          <button class="modal-close" id="banner-close" title="Plus tard">✕</button>`, [
          ["#banner-update", () => { updateRequested = true; worker.postMessage("skipWaiting"); }],
          ["#banner-close", hideBanner]
        ]);
      };
      if (reg.waiting && navigator.serviceWorker.controller) offerUpdate(reg.waiting);
      reg.addEventListener("updatefound", () => {
        const w = reg.installing;
        if (!w) return;
        w.addEventListener("statechange", () => {
          if (w.state === "installed" && navigator.serviceWorker.controller) offerUpdate(w);
        });
      });
      // Vérifie les mises à jour à chaque retour dans l'app
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") reg.update().catch(() => {});
      });
    }).catch(() => {});
    // Rechargement uniquement après « Mettre à jour » (pas à la toute première installation)
    let reloading = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloading || !updateRequested) return;
      reloading = true;
      location.reload();
    });
  });
}

/* Demande au navigateur de ne jamais effacer les données de l'app
   (sinon il peut le faire en cas de manque d'espace). */
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persisted().then(p => { if (!p) navigator.storage.persist().catch(() => {}); }).catch(() => {});
}

/* ---------- Installation ---------- */
let deferredInstall = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstall = e;
  $("#install-btn").hidden = false;
});
window.addEventListener("appinstalled", () => {
  deferredInstall = null;
  $("#install-btn").hidden = true;
  toast("NutriGuide est installé sur votre écran d'accueil 🎉");
});
if (isIOS && !isStandalone() && /^https?:$/.test(location.protocol)) $("#install-btn").hidden = false;
$("#install-btn").addEventListener("click", async () => {
  if (deferredInstall) {
    deferredInstall.prompt();
    await deferredInstall.userChoice.catch(() => {});
    deferredInstall = null;
    $("#install-btn").hidden = true;
  } else if (isIOS) {
    showBanner(`<span>Sur iPhone : touchez <strong>Partager</strong> <span class="ios-share">⬆︎</span> en bas de Safari,
      puis <strong>« Sur l'écran d'accueil »</strong>.</span>
      <button class="modal-close" id="banner-close" title="Fermer">✕</button>`, [["#banner-close", hideBanner]]);
  }
});

/* ---------- Ouverture : page demandée par l'URL (icône, raccourcis) ---------- */
(function handleLaunchParams() {
  const params = new URLSearchParams(location.search);
  const page = params.get("page");
  if (page && document.getElementById("page-" + page)) showPage(page);
  if (params.get("add") === "1") setTimeout(() => openAddSheet(), 150);
  if (params.toString()) history.replaceState(null, "", location.pathname);
})();

/* ---------- Reprise : on rouvre l'app le lendemain → on est sur aujourd'hui ---------- */
let svWasToday = true;
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    svWasToday = svDate === todayISO();
    return;
  }
  // Données éventuellement modifiées dans un autre onglet / l'app installée
  journal = store.get("journal", {});
  if (svWasToday && svDate !== todayISO()) {
    svDate = todayISO();
    $("#sv-meal").value = defaultMealForNow();
  }
  $("#sv-date").max = todayISO();
  if ($("#page-suivi").classList.contains("active")) renderSuivi();
  else renderHomeToday();
});

/* ---------- Clavier : hauteur réellement visible ----------
   Quand le clavier s'ouvre, seule la zone au-dessus reste visible : on la
   mesure pour que la feuille d'ajout et les fenêtres de saisie y tiennent,
   et on garde le champ actif à l'écran. */
if (window.visualViewport) {
  const vv = window.visualViewport;
  const syncVvh = () => document.documentElement.style.setProperty("--vvh", Math.round(vv.height) + "px");
  vv.addEventListener("resize", syncVvh);
  syncVvh();
}
document.addEventListener("focusin", (e) => {
  if (!isMobileLayout() || !e.target.matches("input, select, textarea")) return;
  if (!e.target.closest(".sv-add, .modal")) return;
  setTimeout(() => e.target.scrollIntoView({ block: "nearest" }), 300); // après l'ouverture du clavier
});

/* ---------- Feuille d'ajout (mobile) ---------- */
function openAddSheet(meal) {
  if (!$("#page-suivi").classList.contains("active")) showPage("suivi");
  if (meal) $("#sv-meal").value = meal;
  if (!isMobileLayout()) {
    $(".sv-add").scrollIntoView({ behavior: "smooth", block: "center" });
    $("#sv-food").focus();
    return;
  }
  if (document.body.classList.contains("sheet-open")) { $("#sv-food").focus(); return; }
  document.body.classList.add("sheet-open");
  $("#sheet-backdrop").hidden = false;
  // Le bouton « retour » d'Android ferme la feuille au lieu de quitter l'app
  history.pushState({ sheet: true }, "");
  setTimeout(() => $("#sv-food").focus({ preventScroll: true }), 60);
}
function closeAddSheet(fromPopstate) {
  if (!document.body.classList.contains("sheet-open")) return;
  document.body.classList.remove("sheet-open");
  $("#sheet-backdrop").hidden = true;
  hideAutocomplete();
  if (document.activeElement) document.activeElement.blur();
  if (!fromPopstate && history.state && history.state.sheet) history.back();
}
// Retour arrière : on ne referme la feuille que si l'on quitte vraiment son état
// (revenir du scanner, ouvert par-dessus, ne doit pas la fermer)
window.addEventListener("popstate", () => { if (!(history.state && history.state.sheet)) closeAddSheet(true); });
$("#sv-fab").addEventListener("click", () => openAddSheet());
$("#sv-sheet-close").addEventListener("click", () => closeAddSheet());
$("#sheet-backdrop").addEventListener("click", () => closeAddSheet());
document.addEventListener("click", (e) => {
  const pick = e.target.closest(".sv-pick-meal");
  if (pick && isMobileLayout()) openAddSheet(pick.dataset.meal);
});
window.matchMedia("(max-width: 760px)").addEventListener("change", (e) => { if (!e.matches) closeAddSheet(); });
// Changer de page referme la feuille
document.addEventListener("click", (e) => { if (e.target.closest("[data-page]")) closeAddSheet(); });

/* ---------- Recherche d'aliment adaptée au tactile ----------
   Remplace la liste déroulante native (peu pratique sur téléphone) :
   correspondance sans accents, début de mot prioritaire, récents en tête. */
const norm = (str) => String(str).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/œ/g, "oe");
let acItems = [];
let acIndex = -1;

function searchFoods(q, max = 8) {
  const nq = norm(q.trim());
  if (!nq) return [];
  const words = nq.split(/\s+/).filter(Boolean);
  const recents = store.get("recents", []).map(r => r.id);
  return ALIMENTS.map(a => {
    const n = norm(a.nom);
    const hay = a.alias ? n + " " + norm(a.alias) : n; // mots-clés en plus (ex. « ardennes »)
    if (!words.every(w => hay.includes(w))) return null;
    let score = n.startsWith(nq) ? 0 : n.split(/[\s(,'-]+/).some(w => w.startsWith(words[0])) ? 1 : 2;
    const r = recents.indexOf(a.id);
    if (r >= 0) score -= 0.5 - r * 0.01;
    return { a, score };
  }).filter(Boolean)
    .sort((x, y) => x.score - y.score || x.a.nom.length - y.a.nom.length)
    .slice(0, max).map(x => x.a);
}
function renderAutocomplete() {
  const q = $("#sv-food").value;
  const exact = ALIMENTS_BY_NAME[q.trim().toLowerCase()];
  acItems = exact ? [] : searchFoods(q);
  acIndex = -1;
  const box = $("#sv-ac");
  if (!acItems.length) { box.hidden = true; return; }
  box.innerHTML = acItems.map((a, i) => {
    const feu = (a.sel || 0) <= SEUILS_100G.sel.bas ? "feu-vert" : (a.sel || 0) > SEUILS_100G.sel.haut ? "feu-rouge" : "feu-orange";
    const u = UNITES[a.id];
    // Plat ou recette : valeurs pour une portion (plus parlant que pour 100 g)
    const meta = (a.plat || a.recette) && u
      ? (() => { const n = itemNutrition({ id: a.id, g: u.g }); return `${fmtKcal(n.kcal)} kcal · ${fmtG(n.sel, 1)} g sel · ${fmtG(n.l, 0)} g lip. · ${fmtG(n.g, 0)} g gluc. <em>/ ${escapeHtml(u.l)} (${fmtG(u.g, 0)} g)</em>`; })()
      : `${fmtG(a.sel || 0, (a.sel || 0) < 10 ? 2 : 0)} g sel · ${fmtG(a.l, 0)} g lip. · ${fmtG(a.g, 0)} g gluc. <em>/100 g</em>`;
    const tag = a.recette ? `<span class="perso-tag">ma recette</span>` : a.plat ? `<span class="plat-tag">moyenne</span>` : "";
    return `<button type="button" class="sv-ac-item" role="option" data-i="${i}">
      <span class="sv-ac-nom">${escapeHtml(a.nom)} ${tag}</span>
      <span class="sv-ac-meta"><span class="feu ${feu}"></span>${meta}</span>
    </button>`;
  }).join("");
  box.hidden = false;
}
function hideAutocomplete() { $("#sv-ac").hidden = true; acItems = []; acIndex = -1; }
function pickAutocomplete(i) {
  const a = acItems[i];
  if (!a) return;
  $("#sv-food").value = a.nom;
  hideAutocomplete();
  renderPreview();
  const qty = $("#sv-qty");
  qty.focus({ preventScroll: true });
  try { qty.select(); } catch { /* certains navigateurs refusent select() sur type=number */ }
}
$("#sv-food").addEventListener("input", renderAutocomplete);
$("#sv-food").addEventListener("focus", renderAutocomplete);
// Choix dans la liste : on sélectionne au « click » (et pas au toucher) pour
// éviter que le doigt « traverse » la liste qui disparaît et touche le bouton
// Ajouter situé dessous. Pendant l'appui, la liste ne se ferme pas.
let acPressing = false;
$("#sv-food").addEventListener("blur", () => setTimeout(() => { if (!acPressing && document.activeElement !== $("#sv-food")) hideAutocomplete(); }, 200));
$("#sv-ac").addEventListener("pointerdown", (e) => {
  if (!e.target.closest(".sv-ac-item")) return;
  acPressing = true;
  if (e.pointerType === "mouse") e.preventDefault(); // garde le focus dans le champ
});
$("#sv-ac").addEventListener("click", (e) => {
  const it = e.target.closest(".sv-ac-item");
  acPressing = false;
  if (it) pickAutocomplete(+it.dataset.i);
});
document.addEventListener("pointerup", () => setTimeout(() => { acPressing = false; }, 400));

// Phase de capture sur le parent : passe avant le « Entrée = ajouter » de suivi.js
$(".sv-add").addEventListener("keydown", (e) => {
  if (e.target.id !== "sv-food" || $("#sv-ac").hidden) return;
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    acIndex = (acIndex + (e.key === "ArrowDown" ? 1 : -1) + acItems.length) % acItems.length;
    $$(".sv-ac-item").forEach((el, i) => el.classList.toggle("active", i === acIndex));
  } else if (e.key === "Enter") {
    e.preventDefault();
    e.stopPropagation();
    pickAutocomplete(acIndex >= 0 ? acIndex : 0);
  } else if (e.key === "Escape") {
    hideAutocomplete();
  }
}, true);
/* ---------- Bandeau compact des limites (visible en faisant défiler) ---------- */
function renderStickyStrip() {
  const t = dayTotals(svDate);
  const lim = getLimites();
  $("#sv-sticky").innerHTML = ["sel", "l", "g", "p", "fib"].map(k => {
    const L = LIMITE_LABELS[k];
    const st = L.goal ? "goal " + goalStatus(t[k], lim[k]) : limitStatus(t[k], lim[k]);
    const pct = lim[k] > 0 ? Math.min(100, t[k] / lim[k] * 100) : 0;
    return `<div class="ss-item ${st}">
      <span class="ss-lbl">${L.emoji} ${fmtG(t[k], L.dec)}<small>/${fmtG(lim[k], L.dec)}</small></span>
      <span class="ss-track"><span class="ss-bar" style="width:${pct.toFixed(0)}%"></span></span>
    </div>`;
  }).join("");
}
if ("IntersectionObserver" in window) {
  new IntersectionObserver(([entry]) => {
    document.body.classList.toggle("gauges-hidden", !entry.isIntersecting && entry.boundingClientRect.top < 0);
  }, { rootMargin: "-60px 0px 0px 0px" }).observe($("#sv-gauges"));
}

function syncHeaderHeight() {
  document.documentElement.style.setProperty("--header-h", $(".site-header").offsetHeight + "px");
}
window.addEventListener("resize", syncHeaderHeight);
syncHeaderHeight();

/* ---------- Panneaux repliables sur téléphone ---------- */
function setupCollapsibles() {
  ["#sv-limits-card", "#sv-week"].forEach(sel => {
    const card = $(sel);
    card.classList.add("collapsible");
    if (isMobileLayout()) card.classList.add("collapsed");
    card.addEventListener("click", (e) => {
      if (e.target.closest("h3") && isMobileLayout()) card.classList.toggle("collapsed");
    });
  });
  const dataCard = $("#sv-export").closest(".card");
  dataCard.classList.add("collapsible");
  if (isMobileLayout()) dataCard.classList.add("collapsed");
  dataCard.addEventListener("click", (e) => {
    if (e.target.closest("h3") && isMobileLayout()) dataCard.classList.toggle("collapsed");
  });
}

/* ---------- Branchement sur le rendu du suivi ---------- */
const renderSuiviBase = renderSuivi;
renderSuivi = function () {
  renderSuiviBase();
  renderStickyStrip();
};
setupCollapsibles();
renderSuivi();
