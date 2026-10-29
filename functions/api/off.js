/* Cloudflare Pages Function : GET /api/off?q=gâteau aux pommes
   Relais vers le moteur de recherche d'Open Food Facts (search.openfoodfacts.org),
   qui n'accepte pas les appels directs depuis le navigateur d'un autre site.
   - produits vendus en France uniquement ;
   - réponse allégée (nom, marque, valeurs pour 100 g) et gardée en cache 1 jour.
   Aucune donnée personnelle ne transite : seulement le texte recherché. */

const FIELDS = "code,product_name_fr,product_name,brands,nutriments,categories_tags,serving_quantity,image_front_small_url,nutriscore_grade,quantity";
const NUTRIMENTS = ["energy-kcal_100g", "energy_100g", "proteins_100g", "carbohydrates_100g", "sugars_100g",
  "fat_100g", "saturated-fat_100g", "salt_100g", "sodium_100g", "fiber_100g", "potassium_100g"];

const json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), {
  status, headers: { "Content-Type": "application/json; charset=utf-8", ...extra }
});

export async function onRequestGet({ request, waitUntil }) {
  const url = new URL(request.url);
  // Texte simple uniquement : les caractères spéciaux du moteur de recherche sont retirés
  const q = (url.searchParams.get("q") || "").replace(/[^\p{L}\p{N}\s'’-]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 80);
  if (q.length < 2) return json({ hits: [] }, 400);

  const cache = caches.default;
  const key = new Request(`${url.origin}/api/off?q=${encodeURIComponent(q.toLowerCase())}`);
  const cached = await cache.match(key);
  if (cached) return cached;

  const query = `${q} countries_tags:"en:france"`;
  const upstream = `https://search.openfoodfacts.org/search?q=${encodeURIComponent(query)}&langs=fr&page_size=30&fields=${FIELDS}`;
  let data;
  try {
    const res = await fetch(upstream, { headers: { "User-Agent": "NutriGuide/1.0 (https://nutriguide-fooding.pages.dev)" } });
    if (!res.ok) return json({ error: "busy" }, 502);
    data = await res.json();
  } catch {
    return json({ error: "busy" }, 502);
  }

  const hits = (data.hits || [])
    .filter(h => (h.product_name_fr || h.product_name) && h.nutriments)
    .map(h => {
      const n = h.nutriments;
      const nutriments = {};
      for (const k of NUTRIMENTS) if (n[k] !== undefined) nutriments[k] = n[k];
      if (nutriments["energy-kcal_100g"] === undefined && nutriments.energy_100g === undefined && n["energy-kj_100g"] !== undefined) {
        nutriments.energy_100g = n["energy-kj_100g"]; // kJ, converti en kcal par l'app
      }
      return {
        code: String(h.code || ""),
        product_name_fr: h.product_name_fr, product_name: h.product_name,
        brands: Array.isArray(h.brands) ? h.brands.join(", ") : (h.brands || ""),
        categories_tags: h.categories_tags || [], serving_quantity: h.serving_quantity,
        image_front_small_url: h.image_front_small_url, nutriscore_grade: h.nutriscore_grade,
        quantity: h.quantity, nutriments
      };
    })
    .filter(h => /^\d{6,14}$/.test(h.code))
    .slice(0, 15);

  const out = json({ hits }, 200, { "Cache-Control": "public, max-age=86400" });
  waitUntil(cache.put(key, out.clone()));
  return out;
}
