/* =====================================================
   NutriGuide — Plats maison, spécialités et desserts du quotidien
   Valeurs MOYENNES pour 100 g d'une recette type (ordres de grandeur
   inspirés de Ciqual et de recettes courantes) : une recette réelle
   peut varier de ± 20 à 30 %. Pour sa propre recette exacte, utiliser
   « Composer ma recette » (js/recettes.js).
   Chargé après data.js, avant app.js.
   ===================================================== */
"use strict";

/* Ingrédients de base utiles pour composer ses recettes (pâtisserie, plats mijotés).
   [kcal, protéines, glucides, lipides, sel, saturés, sucres] pour 100 g */
const INGREDIENTS_RECETTES = [
  ["farine", "Farine de blé", "Féculents", [350, 10, 74, 1.2, 0, 0.2, 1.5], { G: 1, u: [10, "c. à soupe"] }],
  ["maizena", "Fécule de maïs (Maïzena)", "Féculents", [350, 0.3, 87, 0.1, 0.02, 0, 0], { u: [8, "c. à soupe"] }],
  ["chapelure", "Chapelure", "Féculents", [380, 12, 72, 4, 1.5, 0.8, 4], { G: 1 }],
  ["pates_crues", "Pâtes (crues)", "Féculents", [355, 12.5, 70, 1.8, 0, 0.4, 3], { G: 1 }],
  ["riz_cru", "Riz blanc (cru)", "Féculents", [350, 7, 78, 0.6, 0, 0.2, 0.2] ],
  ["pate_brisee", "Pâte brisée (crue)", "Féculents", [420, 6, 45, 24, 0.9, 11, 2], { G: 1, u: [230, "rouleau"] }],
  ["pate_feuilletee", "Pâte feuilletée (crue)", "Féculents", [400, 6, 38, 25, 0.9, 12, 1.5], { G: 1, u: [230, "rouleau"] }],
  ["pate_sablee", "Pâte sablée (crue)", "Féculents", [460, 6, 57, 23, 0.6, 11, 18], { G: 1, u: [250, "rouleau"] }],
  ["lait_entier", "Lait entier", "Produits laitiers", [64, 3.2, 4.8, 3.6, 0.1, 2.3, 4.8], { L: 1, u: [200, "verre"] }],
  ["chantilly", "Crème chantilly", "Produits laitiers", [330, 2, 13, 30, 0.05, 20, 12], { L: 1 }],
  ["creme_anglaise", "Crème anglaise", "Produits laitiers", [170, 4, 20, 8.2, 0.1, 4.5, 19], { L: 1 }],
  ["lait_coco", "Lait de coco", "Matières grasses & oléagineux", [190, 2, 3, 19, 0.05, 17, 2] ],
  ["huile_tournesol", "Huile de tournesol", "Matières grasses & oléagineux", [900, 0, 0, 100, 0, 11, 0], { u: [10, "c. à soupe"] }],
  ["pate_tartiner", "Pâte à tartiner chocolat-noisettes", "Sucré & divers", [540, 6, 57, 31, 0.1, 10.6, 56], { L: 1, u: [15, "c. à soupe"] }],
  ["boeuf_braiser", "Bœuf à braiser (paleron, macreuse, cru)", "Viandes & œufs", [160, 20, 0, 9, 0.15, 3.8, 0] ],
  ["viande_hachee", "Viande hachée 15 % (crue)", "Viandes & œufs", [215, 18, 0, 15.6, 0.2, 6.5, 0] ],
  ["echine_porc", "Échine de porc (crue)", "Viandes & œufs", [200, 18, 0, 14, 0.15, 5, 0] ],
  ["cuisse_poulet", "Cuisse de poulet avec peau (crue)", "Viandes & œufs", [190, 18, 0, 13, 0.2, 3.8, 0], { u: [250, "cuisse"] }],
  ["saucisse_fumee", "Saucisse fumée (Morteau, Montbéliard)", "Viandes & œufs", [300, 15, 1, 26.5, 2.2, 10, 0.5], { u: [100, "portion"], alias: "morteau montbeliard" }],
  ["bechamel", "Sauce béchamel", "Sauces & condiments", [120, 3.5, 9, 7.8, 0.4, 4.8, 4], { G: 1, L: 1 }],
  ["pesto", "Pesto", "Sauces & condiments", [450, 5, 6, 45, 2.5, 7, 2], { L: 1, u: [15, "c. à soupe"] }],
  ["vin_blanc", "Vin blanc", "Boissons", [70, 0, 0.5, 0, 0.01, 0, 0.5], { u: [125, "verre"] }]
];

/* Plats : [id, nom, famille, [kcal, p, g, l, sel, ags, suc], { u: [g, "portion"], v: viande/poisson, G: gluten, L: lactose, alias }] */
const PM = "Plats maison", SR = "Spécialités régionales", ES = "Entrées, salades & soupes",
  SN = "Sandwichs & snacking", DM = "Desserts & gâteaux maison", PV = "Pâtisseries & viennoiseries",
  RS = "Restaurant & fast-food", CT = "Charcuterie & traiteur";
const PLATS_MAISON = [
  // ----- Plats mijotés & plats du quotidien -----
  ["boeuf_bourguignon", "Bœuf bourguignon", PM, [140, 15, 3, 7, 0.8, 2.8, 1.2], { u: [300, "assiette"], v: 1, G: 1, alias: "bourguignon" }],
  ["blanquette_veau", "Blanquette de veau", PM, [135, 12, 4, 7.5, 0.7, 4, 1], { u: [300, "assiette"], v: 1, G: 1, L: 1 }],
  ["pot_au_feu", "Pot-au-feu (viande & légumes)", PM, [95, 10, 4, 4.2, 0.7, 1.6, 2], { u: [400, "assiette"], v: 1 }],
  ["coq_au_vin", "Coq au vin", PM, [150, 15, 2.5, 8.5, 0.8, 2.6, 1], { u: [300, "assiette"], v: 1, G: 1 }],
  ["daube", "Daube de bœuf", PM, [135, 15, 3, 6.8, 0.7, 2.5, 1], { u: [300, "assiette"], v: 1, alias: "provencale" }],
  ["navarin", "Navarin d'agneau", PM, [140, 11, 5, 8.5, 0.7, 3.8, 1.5], { u: [350, "assiette"], v: 1 }],
  ["lapin_moutarde", "Lapin à la moutarde", PM, [160, 17, 2, 9.5, 0.8, 4.5, 0.5], { u: [300, "assiette"], v: 1, L: 1 }],
  ["hachis_parmentier", "Hachis parmentier", PM, [130, 7, 10, 6.8, 0.7, 3.2, 1.5], { u: [350, "assiette"], v: 1, L: 1 }],
  ["poulet_basquaise", "Poulet basquaise", PM, [110, 13, 3.5, 5, 0.6, 1.3, 2.5], { u: [350, "assiette"], v: 1 }],
  ["poulet_roti", "Poulet rôti (avec la peau)", PM, [200, 26, 0, 10.5, 0.4, 3, 0], { u: [150, "portion"], v: 1 }],
  ["roti_porc", "Rôti de porc", PM, [175, 27, 0, 7.5, 0.5, 2.6, 0], { u: [130, "portion"], v: 1 }],
  ["escalope_panee", "Escalope panée / milanaise", PM, [230, 18, 12, 12.5, 0.6, 2.5, 0.5], { u: [150, "escalope"], v: 1, G: 1 }],
  ["cordon_bleu", "Cordon bleu", PM, [240, 14, 14, 14, 1.3, 4, 1], { u: [100, "pièce"], v: 1, G: 1, L: 1 }],
  ["steak_hache_cuit", "Steak haché 15 % (cuit)", PM, [250, 26, 0, 16, 0.2, 7, 0], { u: [100, "steak"], v: 1 }],
  ["boulettes_tomate", "Boulettes de viande sauce tomate", PM, [160, 11, 6, 10, 0.9, 3.8, 2.5], { u: [300, "assiette"], v: 1, G: 1 }],
  ["chili", "Chili con carne", PM, [120, 9, 9, 5.5, 0.8, 2, 2], { u: [350, "assiette"], v: 1 }],
  ["couscous", "Couscous royal", PM, [160, 10, 15, 6.5, 0.9, 2, 2], { u: [450, "assiette"], v: 1, G: 1 }],
  ["tajine_poulet", "Tajine de poulet (citron, olives)", PM, [115, 12, 4, 5.5, 0.9, 1.3, 2.5], { u: [350, "assiette"], v: 1 }],
  ["curry_poulet", "Curry de poulet au lait de coco", PM, [150, 12, 4, 9.5, 0.7, 6, 2.5], { u: [300, "assiette"], v: 1, alias: "colombo" }],
  ["paella", "Paëlla", PM, [155, 10, 17, 5, 0.8, 1.2, 1], { u: [400, "assiette"], v: 1, alias: "paella" }],
  ["spaghetti_bolo", "Spaghetti bolognaise", PM, [140, 7, 18, 4.5, 0.5, 1.6, 2.5], { u: [350, "assiette"], v: 1, G: 1, alias: "pates bolognaise" }],
  ["pates_carbonara", "Pâtes carbonara (à la crème)", PM, [200, 8, 20, 9.8, 0.8, 4.8, 1], { u: [350, "assiette"], v: 1, G: 1, L: 1 }],
  ["lasagnes_maison", "Lasagnes bolognaise maison", PM, [160, 9, 13, 8, 0.8, 4, 2.5], { u: [350, "part"], v: 1, G: 1, L: 1 }],
  ["gratin_pates", "Gratin de pâtes jambon-fromage", PM, [170, 8.5, 18, 7.2, 0.7, 4, 1.5], { u: [300, "assiette"], v: 1, G: 1, L: 1, alias: "macaroni" }],
  ["risotto_champi", "Risotto aux champignons", PM, [140, 4, 20, 5, 0.6, 2.8, 0.8], { u: [300, "assiette"], L: 1 }],
  ["endives_jambon", "Endives au jambon (béchamel)", PM, [110, 7, 5, 7, 0.8, 4, 2.5], { u: [300, "assiette"], v: 1, G: 1, L: 1 }],
  ["gratin_choufleur", "Gratin de chou-fleur", PM, [100, 5, 6, 6.2, 0.5, 3.5, 3], { u: [250, "portion"], G: 1, L: 1 }],
  ["gratin_courgettes", "Gratin de courgettes", PM, [85, 4.5, 4, 5.7, 0.5, 3.2, 2.5], { u: [250, "portion"], L: 1 }],
  ["gratin_dauphinois", "Gratin dauphinois", PM, [140, 3.5, 12, 8.5, 0.5, 5.5, 2], { u: [200, "portion"], L: 1, alias: "pommes de terre" }],
  ["ratatouille", "Ratatouille", PM, [60, 1.2, 5.5, 3.7, 0.5, 0.5, 4], { u: [200, "portion"] }],
  ["puree_maison", "Purée maison (lait, beurre)", PM, [95, 2, 13, 3.8, 0.4, 2.4, 1.5], { u: [200, "portion"], L: 1, alias: "pommes de terre" }],
  ["pdt_sautees", "Pommes de terre sautées", PM, [150, 2.3, 20, 6.5, 0.5, 0.8, 0.6], { u: [200, "portion"], alias: "rissolees" }],
  ["frites_friteuse", "Frites (friteuse)", PM, [290, 3.5, 35, 15, 0.4, 1.6, 0.5], { u: [150, "portion"] }],
  ["moules_frites", "Moules-frites", PM, [190, 8.5, 18, 9, 0.9, 1.5, 0.5], { u: [500, "assiette"], v: 1 }],
  ["brandade", "Brandade de morue", PM, [150, 9, 9, 8.8, 1.0, 1.6, 0.8], { u: [300, "assiette"], v: 1, L: 1 }],
  ["poisson_pane", "Poisson pané", PM, [210, 13, 17, 10, 0.8, 1, 1], { u: [100, "pavé"], v: 1, G: 1 }],
  ["omelette", "Omelette nature", PM, [155, 11, 0.5, 12, 0.7, 3.8, 0.4], { u: [120, "omelette (2 œufs)"] }],
  ["omelette_fromage", "Omelette au fromage", PM, [210, 14, 0.6, 17, 0.9, 7.5, 0.4], { u: [150, "omelette"], L: 1 }],
  ["oeufs_brouilles", "Œufs brouillés", PM, [165, 11, 1.2, 13, 0.7, 5, 1], { u: [120, "portion (2 œufs)"], L: 1 }],
  ["quiche_poireaux", "Quiche aux poireaux", PM, [230, 7, 17, 15, 0.6, 8, 2], { u: [150, "part"], G: 1, L: 1 }],
  ["tarte_tomate", "Tarte tomate-moutarde", PM, [220, 4.5, 20, 13.5, 0.8, 6.5, 3], { u: [150, "part"], G: 1, L: 1 }],
  ["bo_bun", "Bo bun", PM, [130, 7, 15, 4.5, 0.8, 1, 3], { u: [450, "bol"], v: 1 }],
  ["pad_thai", "Pad thaï", PM, [160, 7, 20, 5.8, 1.0, 1, 4], { u: [350, "assiette"], v: 1 }],
  ["riz_cantonais", "Riz cantonais", PM, [165, 5.5, 24, 5.2, 0.8, 1, 1], { u: [300, "assiette"], v: 1 }],
  ["nems", "Nems (frits)", PM, [230, 8, 22, 12.5, 1.0, 2.5, 2], { u: [50, "nem"], v: 1, G: 1 }],
  ["sushis", "Sushis / makis", PM, [150, 5, 28, 2, 0.9, 0.4, 5], { u: [25, "pièce"], v: 1, alias: "maki japonais" }],

  // ----- Spécialités régionales -----
  ["cacasse", "Cacasse à cul nu (Ardennes)", SR, [130, 5, 13, 6.5, 0.7, 2.5, 1.5], { u: [400, "assiette"], v: 1, alias: "cacasse ardennaise pommes de terre lardons" }],
  ["salade_lard", "Salade au lard ardennaise", SR, [145, 5, 10, 9.5, 0.9, 3, 1], { u: [350, "assiette"], v: 1, alias: "ardennes pommes de terre" }],
  ["boudin_blanc", "Boudin blanc (de Rethel)", SR, [260, 11, 5, 22, 1.5, 8, 1], { u: [100, "boudin"], v: 1, L: 1, alias: "ardennes rethel" }],
  ["gateau_mollet", "Gâteau mollet (Ardennes)", SR, [380, 8, 45, 18.5, 0.6, 11, 12], { u: [60, "part"], G: 1, L: 1, alias: "brioche ardennaise" }],
  ["tarte_sucre", "Tarte au sucre", SR, [360, 7, 50, 14.5, 0.5, 8.5, 25], { u: [100, "part"], G: 1, L: 1, alias: "ardennes nord" }],
  ["choucroute", "Choucroute garnie", SR, [150, 8, 3.5, 11.5, 1.6, 4.2, 0.8], { u: [400, "assiette"], v: 1, alias: "alsace" }],
  ["baeckeoffe", "Baeckeoffe", SR, [130, 9, 9, 6.5, 0.7, 2.5, 1], { u: [400, "assiette"], v: 1, alias: "alsace" }],
  ["flammekueche", "Flammekueche (tarte flambée)", SR, [250, 9, 25, 12.8, 1.2, 6.5, 2], { u: [150, "part"], v: 1, G: 1, L: 1, alias: "alsace" }],
  ["potee", "Potée (lorraine, auvergnate)", SR, [110, 7, 7, 6, 1.0, 2.2, 1.5], { u: [450, "assiette"], v: 1, alias: "chou" }],
  ["cassoulet", "Cassoulet", SR, [150, 9, 11, 7.5, 1.0, 2.8, 1], { u: [400, "assiette"], v: 1 }],
  ["tartiflette", "Tartiflette", SR, [190, 8, 13, 11.8, 0.8, 6.5, 1], { u: [350, "assiette"], v: 1, L: 1, alias: "reblochon savoie" }],
  ["raclette", "Raclette (assiette complète)", SR, [230, 12, 12, 15, 1.6, 8.5, 0.8], { u: [450, "assiette"], v: 1, L: 1, alias: "savoie" }],
  ["fondue_savoyarde", "Fondue savoyarde (avec pain)", SR, [270, 14, 20, 15, 1.1, 9, 0.8], { u: [400, "assiette"], G: 1, L: 1 }],
  ["aligot", "Aligot", SR, [200, 7, 14, 13, 0.7, 8, 1], { u: [250, "portion"], L: 1 }],
  ["truffade", "Truffade", SR, [210, 7, 15, 13.5, 0.7, 7, 0.8], { u: [300, "assiette"], L: 1 }],
  ["petit_sale", "Petit salé aux lentilles", SR, [145, 11, 10, 6.8, 1.1, 2.5, 0.8], { u: [350, "assiette"], v: 1 }],
  ["carbonade", "Carbonade flamande", SR, [145, 14, 6, 7, 0.8, 3, 3], { u: [300, "assiette"], v: 1, G: 1, alias: "carbonnade biere nord" }],
  ["potjevleesch", "Potjevleesch", SR, [140, 16, 1, 8, 0.8, 2.5, 0.5], { u: [200, "portion"], v: 1, alias: "nord" }],
  ["welsh", "Welsh", SR, [260, 12, 13, 17.5, 1.5, 11, 1.5], { u: [350, "welsh"], v: 1, G: 1, L: 1, alias: "nord cheddar" }],
  ["flamiche", "Flamiche aux poireaux", SR, [240, 6.5, 18, 16, 0.6, 9, 2], { u: [150, "part"], G: 1, L: 1, alias: "picardie nord" }],
  ["andouillette", "Andouillette grillée", SR, [200, 20, 0.5, 13, 1.5, 4.8, 0.3], { u: [150, "andouillette"], v: 1 }],
  ["bouillabaisse", "Bouillabaisse", SR, [90, 10, 3, 4.2, 0.9, 0.7, 1], { u: [400, "assiette"], v: 1, alias: "marseille poisson" }],
  ["pissaladiere", "Pissaladière", SR, [230, 5, 28, 10.5, 1.4, 1.8, 3], { u: [150, "part"], v: 1, G: 1, alias: "nice" }],
  ["galette_complete", "Galette complète (sarrasin, jambon, œuf, fromage)", SR, [210, 12, 16, 11, 1.2, 5.5, 0.8], { u: [200, "galette"], v: 1, L: 1, alias: "bretagne crepe ble noir" }],
  ["kouign_amann", "Kouign-amann", SR, [420, 5, 45, 24.5, 0.9, 16, 22], { u: [100, "part"], G: 1, L: 1, alias: "bretagne" }],
  ["far_breton", "Far breton", SR, [210, 6, 32, 6.5, 0.3, 3.8, 18], { u: [120, "part"], G: 1, L: 1, alias: "bretagne pruneaux" }],
  ["gateau_basque", "Gâteau basque", SR, [390, 6, 48, 19, 0.3, 11, 27], { u: [90, "part"], G: 1, L: 1 }],
  ["canele", "Canelé", SR, [260, 4, 45, 7, 0.1, 4, 28], { u: [50, "canelé"], G: 1, L: 1, alias: "bordeaux" }],

  // ----- Entrées, salades & soupes -----
  ["salade_cesar", "Salade César", ES, [150, 10, 6, 9.5, 0.9, 2.5, 1.5], { u: [300, "assiette"], v: 1, G: 1, L: 1 }],
  ["salade_nicoise", "Salade niçoise", ES, [110, 7, 4, 7.4, 0.8, 1.2, 2], { u: [350, "assiette"], v: 1 }],
  ["salade_pates", "Salade de pâtes (thon, crudités)", ES, [150, 6, 17, 6.3, 0.6, 1, 2], { u: [250, "portion"], v: 1, G: 1 }],
  ["salade_piemontaise", "Salade piémontaise", ES, [155, 4, 11, 10.5, 0.8, 1.8, 1.5], { u: [200, "portion"], v: 1 }],
  ["taboule", "Taboulé", ES, [160, 3.5, 22, 6.3, 0.7, 0.9, 2.5], { u: [200, "portion"], G: 1 }],
  ["carottes_rapees", "Carottes râpées vinaigrette", ES, [80, 0.8, 6, 5.8, 0.4, 0.5, 5], { u: [150, "portion"] }],
  ["celeri_remoulade", "Céleri rémoulade", ES, [120, 1.2, 3, 11.5, 0.7, 1, 2], { u: [150, "portion"] }],
  ["oeuf_mayo", "Œuf mayonnaise", ES, [260, 8, 1, 25, 0.7, 3.5, 0.8], { u: [70, "œuf"] }],
  ["soupe_oignon", "Soupe à l'oignon gratinée", ES, [110, 5, 10, 5.5, 1.0, 3, 3], { u: [350, "bol"], G: 1, L: 1 }],
  ["veloute_potiron", "Velouté de potiron (à la crème)", ES, [50, 1, 5, 2.9, 0.5, 1.8, 2.5], { u: [300, "bol"], L: 1, alias: "soupe potimarron" }],
  ["soupe_poireaux", "Soupe poireaux-pommes de terre", ES, [45, 1.2, 6, 1.8, 0.5, 1, 1.5], { u: [300, "bol"], L: 1, alias: "potage" }],
  ["gaspacho", "Gaspacho", ES, [45, 0.9, 4, 2.8, 0.6, 0.4, 3], { u: [250, "bol"] }],
  ["cake_sale", "Cake salé jambon-olives", ES, [300, 10, 25, 17.8, 1.4, 6, 2], { u: [50, "tranche"], v: 1, G: 1, L: 1 }],
  ["gougeres", "Gougères", ES, [380, 13, 25, 25.5, 0.9, 14, 1], { u: [15, "gougère"], G: 1, L: 1 }],
  ["feuillete_saucisse", "Feuilletés apéritif (saucisse)", ES, [350, 9, 25, 24, 1.3, 11, 1], { u: [40, "pièce"], v: 1, G: 1 }],
  ["guacamole", "Guacamole", ES, [150, 1.8, 6, 13, 0.6, 2, 1], { u: [50, "portion"] }],

  // ----- Sandwichs & snacking -----
  ["jambon_beurre", "Sandwich jambon-beurre", SN, [260, 11, 34, 8.8, 1.6, 5, 2], { u: [200, "sandwich"], v: 1, G: 1, L: 1 }],
  ["croque_monsieur", "Croque-monsieur", SN, [270, 15, 22, 13.5, 1.6, 7, 3], { u: [150, "croque"], v: 1, G: 1, L: 1 }],
  ["croque_madame", "Croque-madame", SN, [255, 15, 18, 13.5, 1.4, 6.5, 2.5], { u: [200, "croque"], v: 1, G: 1, L: 1 }],
  ["panini", "Panini jambon-fromage", SN, [260, 12, 30, 10, 1.5, 5, 2.5], { u: [200, "panini"], v: 1, G: 1, L: 1 }],
  ["burger_maison", "Hamburger maison", SN, [250, 13, 22, 12, 1.2, 4.8, 4], { u: [220, "burger"], v: 1, G: 1, L: 1 }],
  ["kebab", "Kebab (sandwich)", SN, [230, 11, 22, 11, 1.3, 3.5, 2], { u: [350, "kebab"], v: 1, G: 1 }],
  ["tacos", "Tacos français", SN, [250, 10, 24, 12.8, 1.3, 4.5, 1.5], { u: [400, "tacos"], v: 1, G: 1, L: 1 }],
  ["hot_dog", "Hot-dog", SN, [260, 9, 26, 13.5, 1.6, 5, 3], { u: [150, "hot-dog"], v: 1, G: 1 }],
  ["wrap_poulet", "Wrap poulet crudités", SN, [190, 11, 20, 7.3, 1.0, 1.8, 2.5], { u: [200, "wrap"], v: 1, G: 1 }],

  // ----- Snacking de boulangerie -----
  ["pizza_boulangerie", "Part de pizza (boulangerie)", SN, [260, 10, 30, 11, 1.5, 4.5, 3], { u: [150, "part"], v: 1, G: 1, L: 1 }],
  ["croissant_jambon", "Croissant jambon-fromage", SN, [300, 11, 22, 18.5, 1.5, 10, 3], { u: [150, "pièce"], v: 1, G: 1, L: 1 }],
  ["feuillete_jambon", "Feuilleté jambon-fromage", SN, [320, 10, 25, 20, 1.4, 10, 2], { u: [140, "pièce"], v: 1, G: 1, L: 1, alias: "boulangerie" }],
  ["friand", "Friand à la viande", SN, [330, 9, 25, 21.5, 1.3, 10, 1], { u: [130, "friand"], v: 1, G: 1, alias: "boulangerie" }],
  ["sandwich_poulet", "Sandwich baguette poulet-crudités", SN, [220, 11, 28, 7, 1.3, 1.5, 2.5], { u: [280, "sandwich"], v: 1, G: 1, alias: "boulangerie" }],
  ["sandwich_thon", "Sandwich baguette thon-crudités", SN, [220, 10, 28, 7.5, 1.3, 1.2, 2.5], { u: [280, "sandwich"], v: 1, G: 1, alias: "boulangerie" }],
  ["club_sandwich", "Club sandwich", SN, [240, 11, 22, 12, 1.4, 2.5, 3], { u: [200, "sandwich"], v: 1, G: 1 }],

  // ----- Restaurant & fast-food : assiette servie, sel du restaurant compris
  // (en général 1,5 à 2 fois plus salé qu'à la maison) -----
  ["resto_entrecote", "Entrecôte-frites (brasserie)", RS, [250, 14, 15, 15, 0.9, 5.5, 0.5], { u: [400, "assiette"], v: 1, alias: "restaurant steak bavette" }],
  ["resto_sauce", "Sauce béarnaise / au poivre (restaurant)", RS, [450, 2, 4, 47, 1.5, 28, 1], { u: [50, "ramequin"], L: 1 }],
  ["resto_tartare", "Steak tartare-frites", RS, [220, 11, 15, 13, 1.3, 3.5, 1], { u: [450, "assiette"], v: 1, alias: "restaurant brasserie" }],
  ["resto_burger", "Burger-frites (restaurant)", RS, [260, 11, 23, 14, 1.2, 5, 3], { u: [450, "assiette"], v: 1, G: 1, L: 1 }],
  ["resto_plat_jour", "Plat du jour (viande en sauce + accompagnement)", RS, [160, 9, 13, 8, 1.0, 3, 1.5], { u: [400, "assiette"], v: 1, G: 1, alias: "restaurant brasserie cantine" }],
  ["resto_poisson", "Poisson grillé & légumes (restaurant)", RS, [110, 12, 4, 5, 0.8, 1, 1.5], { u: [350, "assiette"], v: 1 }],
  ["resto_pates", "Plat de pâtes (restaurant, crème ou fromage)", RS, [190, 7.5, 21, 8.5, 1.0, 4.5, 1.5], { u: [400, "assiette"], v: 1, G: 1, L: 1, alias: "italien" }],
  ["resto_pizza", "Pizza entière (pizzeria)", RS, [245, 11, 28, 9.8, 1.5, 4.5, 3], { u: [400, "pizza"], v: 1, G: 1, L: 1, alias: "restaurant italien" }],
  ["resto_salade", "Grande salade composée (restaurant)", RS, [170, 9, 7, 11.8, 1.1, 3, 2], { u: [350, "assiette"], v: 1, alias: "cesar perigourdine chevre chaud" }],
  ["resto_croque", "Croque-monsieur & salade (brasserie)", RS, [230, 11, 18, 12.8, 1.4, 6.5, 2.5], { u: [300, "assiette"], v: 1, G: 1, L: 1 }],
  ["resto_magret", "Magret de canard & pommes sarladaises", RS, [260, 14, 12, 17.5, 1.0, 5.5, 0.5], { u: [400, "assiette"], v: 1, alias: "restaurant" }],
  ["resto_tartare_saumon", "Tartare de saumon", RS, [160, 14, 2, 10.8, 1.1, 2, 1], { u: [180, "assiette"], v: 1, alias: "restaurant" }],
  ["resto_fish_chips", "Fish & chips", RS, [230, 10, 20, 12.2, 0.9, 1.5, 0.5], { u: [400, "assiette"], v: 1, G: 1 }],
  ["resto_couscous", "Couscous royal (restaurant)", RS, [165, 10, 15, 7, 1.1, 2.2, 2], { u: [550, "assiette"], v: 1, G: 1 }],
  ["resto_kebab_assiette", "Assiette kebab (viande, frites, salade, sauce)", RS, [230, 11, 17, 13, 1.3, 3.5, 1.5], { u: [500, "assiette"], v: 1 }],
  ["resto_menu_fastfood", "Menu fast-food : burger + frites moyennes", RS, [270, 10, 30, 12.5, 1.1, 4, 3.5], { u: [330, "menu (sans boisson)"], v: 1, G: 1, L: 1, alias: "mcdo burger king quick" }],
  ["resto_nuggets", "Nuggets de poulet", RS, [260, 15, 17, 15, 1.3, 2, 0.5], { u: [100, "boîte de 6"], v: 1, G: 1, alias: "fast-food mcdo" }],
  ["resto_sushi", "Plateau sushis / makis (restaurant japonais)", RS, [160, 6, 28, 2.7, 1.0, 0.6, 5], { u: [450, "plateau (18 pièces)"], v: 1, alias: "japonais" }],
  ["resto_ramen", "Ramen", RS, [95, 5, 11, 3.4, 1.3, 1, 1], { u: [600, "bol"], v: 1, G: 1, alias: "japonais soupe nouilles" }],
  ["resto_pho", "Phở (soupe vietnamienne)", RS, [60, 4.5, 7, 1.5, 0.9, 0.5, 1], { u: [650, "bol"], v: 1, alias: "pho vietnamien" }],
  ["resto_chinois", "Plat chinois sauté + riz (restaurant asiatique)", RS, [160, 8, 20, 5.3, 1.2, 1, 4], { u: [450, "assiette"], v: 1, alias: "porc caramel poulet aigre-doux canard laque" }],
  ["resto_indien", "Poulet tikka masala & riz (restaurant indien)", RS, [150, 8, 15, 6.3, 0.8, 2.8, 2], { u: [450, "assiette"], v: 1, L: 1, alias: "curry butter chicken" }],
  ["resto_naan", "Naan au fromage", RS, [320, 10, 40, 13, 1.4, 7, 3], { u: [120, "naan"], G: 1, L: 1, alias: "indien cheese" }],
  ["resto_cafe_gourmand", "Café gourmand", RS, [330, 4.5, 40, 17, 0.2, 10, 30], { u: [120, "assiette"], G: 1, L: 1, alias: "dessert restaurant" }],
  ["resto_moelleux", "Moelleux au chocolat & boule de glace", RS, [380, 5.5, 38, 23, 0.2, 13.5, 30], { u: [130, "dessert"], G: 1, L: 1, alias: "fondant dessert restaurant" }],

  // ----- Charcuterie & traiteur -----
  ["pate_campagne", "Pâté / terrine de campagne", CT, [300, 14, 2, 26, 1.8, 9.5, 0.5], { u: [50, "tranche"], v: 1 }],
  ["pate_croute", "Pâté en croûte", CT, [330, 11, 18, 24, 1.9, 9, 1], { u: [100, "tranche"], v: 1, G: 1 }],
  ["rillettes", "Rillettes", CT, [380, 15, 0.5, 35.5, 1.5, 13, 0.3], { u: [30, "tartine"], v: 1 }],
  ["mousse_foie", "Mousse de foie", CT, [300, 10, 4, 27, 1.6, 10, 1], { u: [50, "tranche"], v: 1 }],
  ["foie_gras", "Foie gras", CT, [460, 7, 3, 47, 1.2, 18, 1], { u: [40, "tranche"], v: 1 }],
  ["boudin_noir", "Boudin noir", CT, [290, 12, 4, 25, 1.8, 9.5, 0.5], { u: [120, "boudin"], v: 1 }],
  ["jambon_persille", "Jambon persillé", CT, [160, 20, 1, 8.5, 2.0, 3, 0.5], { u: [80, "tranche"], v: 1 }],
  ["fromage_tete", "Fromage de tête", CT, [200, 16, 0.5, 15, 1.8, 5.5, 0.3], { u: [60, "tranche"], v: 1 }],
  ["saucisse_toulouse", "Saucisse de Toulouse (cuite)", CT, [300, 17, 1, 25.5, 1.9, 9.5, 0.5], { u: [120, "saucisse"], v: 1 }],
  ["merguez", "Merguez (cuite)", CT, [300, 15, 1.5, 26, 2.0, 10, 0.5], { u: [50, "merguez"], v: 1 }],
  ["chipolata", "Chipolata (cuite)", CT, [280, 15, 1, 24, 1.8, 9, 0.5], { u: [50, "chipolata"], v: 1, alias: "barbecue saucisse" }],
  ["andouille", "Andouille (Vire, Guémené)", CT, [210, 20, 0.5, 14.5, 2.5, 5.5, 0.3], { u: [30, "tranche"], v: 1 }],
  ["chorizo", "Chorizo", CT, [455, 24, 2, 39, 4.0, 15, 1], { u: [10, "tranche"], v: 1 }],
  ["bacon", "Bacon (tranches)", CT, [200, 20, 1, 13, 3.5, 4.5, 1], { u: [15, "tranche"], v: 1 }],

  // ----- Desserts & gâteaux maison -----
  ["gateau_chocolat", "Gâteau au chocolat maison (fondant)", DM, [420, 6, 40, 26, 0.15, 15.5, 32], { u: [80, "part"], G: 1, L: 1 }],
  ["gateau_yaourt", "Gâteau au yaourt", DM, [340, 6, 45, 15, 0.3, 2.5, 27], { u: [80, "part"], G: 1, L: 1 }],
  ["quatre_quarts", "Quatre-quarts", DM, [410, 6, 48, 21.5, 0.4, 13, 26], { u: [60, "tranche"], G: 1, L: 1 }],
  ["marbre", "Gâteau marbré", DM, [400, 6, 50, 19.5, 0.4, 11, 28], { u: [60, "tranche"], G: 1, L: 1 }],
  ["cake_fruits", "Cake aux fruits confits", DM, [360, 5, 55, 13.5, 0.4, 7.5, 35], { u: [60, "tranche"], G: 1, L: 1 }],
  ["brownie", "Brownie", DM, [450, 6, 50, 25, 0.2, 12, 38], { u: [60, "carré"], G: 1, L: 1 }],
  ["cookies", "Cookies maison", DM, [480, 5.5, 62, 23, 0.6, 13, 35], { u: [25, "cookie"], G: 1, L: 1 }],
  ["madeleine", "Madeleine", DM, [440, 6, 52, 23, 0.6, 14, 28], { u: [25, "madeleine"], G: 1, L: 1 }],
  ["financier", "Financier", DM, [420, 7, 42, 25, 0.2, 12, 32], { u: [35, "financier"], G: 1, L: 1 }],
  ["cheesecake", "Cheesecake", DM, [320, 6, 26, 21.5, 0.5, 12.5, 20], { u: [110, "part"], G: 1, L: 1 }],
  ["tarte_pommes", "Tarte aux pommes", DM, [250, 3, 33, 11.8, 0.3, 6.5, 16], { u: [120, "part"], G: 1, L: 1 }],
  ["tarte_tatin", "Tarte Tatin", DM, [260, 2.5, 36, 11.8, 0.3, 7, 24], { u: [130, "part"], G: 1, L: 1 }],
  ["tarte_fraises", "Tarte aux fraises (crème pâtissière)", DM, [240, 4, 32, 10.8, 0.2, 6, 18], { u: [120, "part"], G: 1, L: 1, alias: "fruits" }],
  ["tarte_citron", "Tarte au citron meringuée", DM, [320, 4.5, 45, 13.5, 0.2, 7.5, 30], { u: [110, "part"], G: 1, L: 1 }],
  ["clafoutis", "Clafoutis aux cerises", DM, [180, 5, 26, 6.2, 0.1, 3.5, 18], { u: [130, "part"], G: 1, L: 1 }],
  ["crumble_pommes", "Crumble aux pommes", DM, [230, 2.5, 33, 9.5, 0.2, 5.8, 20], { u: [150, "portion"], G: 1, L: 1 }],
  ["flan_patissier", "Flan pâtissier", DM, [200, 4.5, 28, 8, 0.2, 5, 17], { u: [130, "part"], G: 1, L: 1 }],
  ["creme_brulee", "Crème brûlée", DM, [300, 4, 18, 23.5, 0.1, 15, 18], { u: [110, "ramequin"], L: 1 }],
  ["creme_caramel", "Crème caramel", DM, [140, 4.5, 22, 3.8, 0.1, 2.2, 21], { u: [110, "pot"], L: 1, alias: "flan" }],
  ["mousse_chocolat", "Mousse au chocolat", DM, [300, 6, 25, 19.5, 0.1, 11.5, 23], { u: [100, "ramequin"] }],
  ["ile_flottante", "Île flottante", DM, [160, 5, 25, 4.4, 0.1, 2.3, 24], { u: [150, "coupe"], L: 1, alias: "oeufs a la neige" }],
  ["riz_au_lait", "Riz au lait", DM, [140, 3.5, 24, 3.3, 0.1, 2, 13], { u: [150, "pot"], L: 1 }],
  ["tiramisu", "Tiramisu", DM, [290, 5.5, 28, 17, 0.1, 10, 20], { u: [120, "part"], G: 1, L: 1 }],
  ["panna_cotta", "Panna cotta", DM, [230, 3, 18, 16.3, 0.1, 10.5, 17], { u: [120, "pot"], L: 1 }],
  ["fraisier", "Fraisier", DM, [280, 4.5, 32, 14.8, 0.15, 8, 24], { u: [120, "part"], G: 1, L: 1 }],
  ["foret_noire", "Forêt-noire", DM, [290, 4.5, 32, 16, 0.15, 9.5, 24], { u: [120, "part"], G: 1, L: 1 }],
  ["buche_noel", "Bûche de Noël", DM, [360, 4.5, 38, 21, 0.2, 12.5, 30], { u: [100, "part"], G: 1, L: 1 }],
  ["galette_rois", "Galette des rois (frangipane)", DM, [440, 7, 38, 28.5, 0.5, 14, 18], { u: [100, "part"], G: 1, L: 1 }],
  ["crepe_nature", "Crêpe nature (maison)", DM, [210, 7, 27, 8.2, 0.3, 4, 6], { u: [60, "crêpe"], G: 1, L: 1 }],
  ["crepe_sucre", "Crêpe au sucre", DM, [260, 6, 38, 9.2, 0.25, 4.5, 18], { u: [65, "crêpe"], G: 1, L: 1 }],
  ["crepe_nutella", "Crêpe à la pâte à tartiner", DM, [320, 6.5, 40, 15, 0.2, 5, 22], { u: [75, "crêpe"], G: 1, L: 1, alias: "nutella chocolat" }],
  ["gaufre", "Gaufre au sucre", DM, [330, 7, 42, 15, 0.4, 8, 15], { u: [70, "gaufre"], G: 1, L: 1 }],
  ["pancakes", "Pancakes", DM, [230, 6.5, 32, 8.5, 0.6, 3, 7], { u: [40, "pancake"], G: 1, L: 1 }],
  ["pain_perdu", "Pain perdu", DM, [230, 7, 30, 9, 0.5, 4.5, 12], { u: [100, "tranche"], G: 1, L: 1 }],
  ["salade_fruits", "Salade de fruits frais", DM, [55, 0.6, 12, 0.2, 0, 0.03, 11], { u: [150, "coupe"] }],
  ["glace_vanille", "Glace à la vanille", DM, [200, 3.5, 24, 10, 0.15, 6.5, 21], { u: [60, "boule"], L: 1, alias: "creme glacee" }],
  ["sorbet", "Sorbet", DM, [120, 0.3, 29, 0.1, 0, 0, 27], { u: [50, "boule"] }],

  // ----- Pâtisseries & viennoiseries -----
  ["pain_chocolat", "Pain au chocolat", PV, [420, 7.5, 46, 22.5, 0.9, 14, 12], { u: [65, "pièce"], G: 1, L: 1, alias: "chocolatine" }],
  ["chausson_pommes", "Chausson aux pommes", PV, [320, 4, 38, 16.5, 0.6, 9.5, 14], { u: [90, "pièce"], G: 1, L: 1 }],
  ["pain_raisins", "Pain aux raisins", PV, [330, 6, 47, 13, 0.6, 8, 20], { u: [100, "pièce"], G: 1, L: 1 }],
  ["brioche", "Brioche", PV, [360, 8.5, 50, 14, 0.9, 8.5, 13], { u: [50, "tranche"], G: 1, L: 1 }],
  ["chouquettes", "Chouquettes", PV, [360, 9, 40, 18, 0.5, 9, 15], { u: [10, "chouquette"], G: 1, L: 1 }],
  ["beignet", "Beignet (confiture)", PV, [340, 6, 42, 16.5, 0.4, 5, 17], { u: [70, "beignet"], G: 1, L: 1 }],
  ["eclair", "Éclair au chocolat", PV, [270, 5.5, 30, 14, 0.3, 8, 18], { u: [80, "éclair"], G: 1, L: 1, alias: "cafe" }],
  ["paris_brest", "Paris-Brest", PV, [400, 7, 32, 27.5, 0.3, 12, 22], { u: [100, "pièce"], G: 1, L: 1 }],
  ["mille_feuille", "Mille-feuille", PV, [330, 4.5, 38, 17.8, 0.3, 10, 20], { u: [110, "pièce"], G: 1, L: 1 }],
  ["profiteroles", "Profiteroles / choux à la crème", PV, [280, 5, 28, 16.5, 0.2, 10, 20], { u: [120, "portion"], G: 1, L: 1 }]
];


/* Fibres (g pour 100 g) des ingrédients et plats ci-dessus — 0 si absent */
const FIBRES_PLATS = {
  // Ingrédients
  farine: 3, maizena: 0.9, chapelure: 4, pates_crues: 3, riz_cru: 1.3, pate_brisee: 1.8, pate_feuilletee: 1.5,
  pate_sablee: 1.5, lait_coco: 1, pate_tartiner: 3.4, bechamel: 0.2, pesto: 1.5,
  // Plats maison
  boeuf_bourguignon: 0.8, blanquette_veau: 0.5, pot_au_feu: 1.5, coq_au_vin: 0.6, daube: 0.8, navarin: 1.2,
  lapin_moutarde: 0.3, hachis_parmentier: 1, poulet_basquaise: 1.2, escalope_panee: 0.6, cordon_bleu: 0.7,
  boulettes_tomate: 0.8, chili: 3, couscous: 2, tajine_poulet: 1.3, curry_poulet: 0.8, paella: 0.8,
  spaghetti_bolo: 1.5, pates_carbonara: 1.2, lasagnes_maison: 1.2, gratin_pates: 1.1, risotto_champi: 0.7,
  endives_jambon: 0.8, gratin_choufleur: 1.4, gratin_courgettes: 0.8, gratin_dauphinois: 1.2, ratatouille: 1.8,
  puree_maison: 1.2, pdt_sautees: 1.8, frites_friteuse: 3, moules_frites: 1.5, brandade: 0.8, poisson_pane: 0.8,
  quiche_poireaux: 1, tarte_tomate: 1.4, bo_bun: 1, pad_thai: 1.2, riz_cantonais: 0.8, nems: 1.2, sushis: 0.6,
  // Spécialités régionales
  cacasse: 1.6, salade_lard: 1.5, boudin_blanc: 0.2, gateau_mollet: 1.5, tarte_sucre: 1.2, choucroute: 1.8,
  baeckeoffe: 1.3, flammekueche: 1.2, potee: 2, cassoulet: 3, tartiflette: 1, raclette: 0.8, fondue_savoyarde: 1,
  aligot: 0.8, truffade: 1.2, petit_sale: 3, carbonade: 0.6, welsh: 0.8, flamiche: 1.2, bouillabaisse: 0.6,
  pissaladiere: 1.8, galette_complete: 1.5, kouign_amann: 1, far_breton: 1.5, gateau_basque: 1.2, canele: 0.5,
  // Entrées, salades & soupes
  salade_cesar: 1, salade_nicoise: 1.8, salade_pates: 1.5, salade_piemontaise: 1.2, taboule: 2,
  carottes_rapees: 2.4, celeri_remoulade: 2.5, soupe_oignon: 1, veloute_potiron: 1, soupe_poireaux: 1.2,
  gaspacho: 1, cake_sale: 1, gougeres: 0.8, feuillete_saucisse: 0.8, guacamole: 5,
  // Sandwichs & snacking
  jambon_beurre: 1.8, croque_monsieur: 1.6, croque_madame: 1.3, panini: 1.8, burger_maison: 1.5, kebab: 1.6,
  tacos: 1.4, hot_dog: 1.4, wrap_poulet: 1.8, pizza_boulangerie: 2, croissant_jambon: 1.5, feuillete_jambon: 1,
  friand: 1, sandwich_poulet: 2.2, sandwich_thon: 2.2, club_sandwich: 2,
  // Restaurant & fast-food
  resto_entrecote: 1.5, resto_tartare: 1.6, resto_burger: 1.8, resto_plat_jour: 1.2, resto_poisson: 1.8,
  resto_pates: 1.4, resto_pizza: 2, resto_salade: 1.5, resto_croque: 1.4, resto_magret: 1.2,
  resto_tartare_saumon: 0.5, resto_fish_chips: 1.8, resto_couscous: 2, resto_kebab_assiette: 1.6,
  resto_menu_fastfood: 2, resto_nuggets: 1, resto_sushi: 0.6, resto_ramen: 0.6, resto_pho: 0.5,
  resto_chinois: 1, resto_indien: 1, resto_naan: 2, resto_cafe_gourmand: 1.2, resto_moelleux: 1.5,
  // Charcuterie & traiteur
  pate_croute: 0.6,
  // Desserts & gâteaux maison
  gateau_chocolat: 2.5, gateau_yaourt: 1, quatre_quarts: 0.8, marbre: 1.2, cake_fruits: 1.8, brownie: 2.5,
  cookies: 2, madeleine: 0.8, financier: 1.5, cheesecake: 0.5, tarte_pommes: 1.6, tarte_tatin: 1.5,
  tarte_fraises: 1.2, tarte_citron: 0.7, clafoutis: 0.8, crumble_pommes: 1.8, flan_patissier: 0.3,
  mousse_chocolat: 2.5, riz_au_lait: 0.2, tiramisu: 0.5, fraisier: 0.8, foret_noire: 1.5, buche_noel: 1,
  galette_rois: 2, crepe_nature: 0.8, crepe_sucre: 0.7, crepe_nutella: 1.2, gaufre: 1, pancakes: 1,
  pain_perdu: 1, salade_fruits: 1.8, sorbet: 0.8,
  // Pâtisseries & viennoiseries
  pain_chocolat: 2.5, chausson_pommes: 1.5, pain_raisins: 1.8, brioche: 1.8, chouquettes: 1, beignet: 1.5,
  eclair: 0.8, paris_brest: 1.5, mille_feuille: 0.7, profiteroles: 0.8
};


/* Potassium (mg pour 100 g) des ingrédients et plats ci-dessus — 0 si absent */
const POTASSIUM_PLATS = {
  // Ingrédients
  farine: 140, maizena: 5, chapelure: 200, pates_crues: 200, riz_cru: 100, pate_brisee: 100, pate_feuilletee: 90,
  pate_sablee: 90, lait_entier: 150, chantilly: 80, creme_anglaise: 150, lait_coco: 220, pate_tartiner: 400,
  boeuf_braiser: 300, viande_hachee: 290, echine_porc: 300, cuisse_poulet: 230, saucisse_fumee: 200,
  bechamel: 140, pesto: 200, vin_blanc: 80,
  // Plats maison
  boeuf_bourguignon: 300, blanquette_veau: 230, pot_au_feu: 300, coq_au_vin: 260, daube: 300, navarin: 280,
  lapin_moutarde: 280, hachis_parmentier: 300, poulet_basquaise: 300, poulet_roti: 250, roti_porc: 380,
  escalope_panee: 280, cordon_bleu: 200, steak_hache_cuit: 330, boulettes_tomate: 280, chili: 330, couscous: 230,
  tajine_poulet: 280, curry_poulet: 260, paella: 200, spaghetti_bolo: 200, pates_carbonara: 130,
  lasagnes_maison: 220, gratin_pates: 140, risotto_champi: 120, endives_jambon: 220, gratin_choufleur: 230,
  gratin_courgettes: 230, gratin_dauphinois: 300, ratatouille: 250, puree_maison: 300, pdt_sautees: 400,
  frites_friteuse: 550, moules_frites: 380, brandade: 250, poisson_pane: 250, omelette: 140, omelette_fromage: 130,
  oeufs_brouilles: 140, quiche_poireaux: 150, tarte_tomate: 200, bo_bun: 180, pad_thai: 160, riz_cantonais: 100,
  nems: 180, sushis: 110,
  // Spécialités régionales
  cacasse: 350, salade_lard: 330, boudin_blanc: 150, gateau_mollet: 120, tarte_sucre: 110, choucroute: 200,
  baeckeoffe: 330, flammekueche: 170, potee: 280, cassoulet: 300, tartiflette: 280, raclette: 250,
  fondue_savoyarde: 120, aligot: 280, truffade: 340, petit_sale: 300, carbonade: 280, potjevleesch: 280,
  welsh: 150, flamiche: 180, andouillette: 200, bouillabaisse: 300, pissaladiere: 220, galette_complete: 200,
  kouign_amann: 80, far_breton: 230, gateau_basque: 110, canele: 120,
  // Entrées, salades & soupes
  salade_cesar: 240, salade_nicoise: 270, salade_pates: 160, salade_piemontaise: 300, taboule: 170,
  carottes_rapees: 230, celeri_remoulade: 250, oeuf_mayo: 100, soupe_oignon: 130, veloute_potiron: 230,
  soupe_poireaux: 220, gaspacho: 230, cake_sale: 160, gougeres: 110, feuillete_saucisse: 130, guacamole: 430,
  // Sandwichs & snacking
  jambon_beurre: 180, croque_monsieur: 170, croque_madame: 170, panini: 180, burger_maison: 230, kebab: 250,
  tacos: 260, hot_dog: 170, wrap_poulet: 230, pizza_boulangerie: 200, croissant_jambon: 160, feuillete_jambon: 150,
  friand: 160, sandwich_poulet: 230, sandwich_thon: 210, club_sandwich: 230,
  // Restaurant & fast-food
  resto_entrecote: 450, resto_sauce: 30, resto_tartare: 450, resto_burger: 330, resto_plat_jour: 300,
  resto_poisson: 380, resto_pates: 150, resto_pizza: 200, resto_salade: 270, resto_croque: 210, resto_magret: 380,
  resto_tartare_saumon: 330, resto_fish_chips: 380, resto_couscous: 230, resto_kebab_assiette: 330,
  resto_menu_fastfood: 300, resto_nuggets: 250, resto_sushi: 110, resto_ramen: 120, resto_pho: 120,
  resto_chinois: 180, resto_indien: 220, resto_naan: 150, resto_cafe_gourmand: 200, resto_moelleux: 280,
  // Charcuterie & traiteur
  pate_campagne: 200, pate_croute: 180, rillettes: 200, mousse_foie: 200, foie_gras: 140, boudin_noir: 70,
  jambon_persille: 280, fromage_tete: 120, saucisse_toulouse: 250, merguez: 250, chipolata: 250, andouille: 200,
  chorizo: 450, bacon: 300,
  // Desserts & gâteaux maison
  gateau_chocolat: 300, gateau_yaourt: 120, quatre_quarts: 90, marbre: 150, cake_fruits: 200, brownie: 320,
  cookies: 200, madeleine: 100, financier: 220, cheesecake: 120, tarte_pommes: 120, tarte_tatin: 120,
  tarte_fraises: 150, tarte_citron: 90, clafoutis: 170, crumble_pommes: 130, flan_patissier: 140,
  creme_brulee: 100, creme_caramel: 150, mousse_chocolat: 330, ile_flottante: 160, riz_au_lait: 140,
  tiramisu: 140, panna_cotta: 100, fraisier: 130, foret_noire: 180, buche_noel: 150, galette_rois: 220,
  crepe_nature: 140, crepe_sucre: 120, crepe_nutella: 200, gaufre: 120, pancakes: 140, pain_perdu: 150,
  salade_fruits: 200, glace_vanille: 200, sorbet: 100,
  // Pâtisseries & viennoiseries
  pain_chocolat: 180, chausson_pommes: 100, pain_raisins: 200, brioche: 120, chouquettes: 110, beignet: 100,
  eclair: 150, paris_brest: 230, mille_feuille: 110, profiteroles: 150
};

(function ajouterPlats() {
  const add = ([id, nom, cat, v, o = {}], plat) => {
    if (ALIMENTS.some(a => a.id === id)) return;
    const [kcal, p, g, l, sel, ags, suc] = v;
    const a = { id, nom, cat, kcal, p, g, l, sel, ags, suc, fib: FIBRES_PLATS[id] || 0, pot: POTASSIUM_PLATS[id] || 0 };
    if (plat) a.plat = true;           // valeur moyenne d'une recette type
    else a.ingredient = true;          // ingrédient de cuisine (farine, pâte crue…) : pas une suggestion de remplacement
    if (o.v) a.viande = true;          // contient viande ou poisson
    if (o.G) a.gluten = true;
    if (o.L) a.lactose = true;
    if (o.alias) a.alias = o.alias;    // mots-clés de recherche supplémentaires
    ALIMENTS.push(a);
    if (o.u) UNITES[id] = { g: o.u[0], l: o.u[1] };
  };
  INGREDIENTS_RECETTES.forEach(x => add(x, false));
  PLATS_MAISON.forEach(x => add(x, true));
})();
