/* =====================================================
   NutriGuide — Données
   Aliments (valeurs pour 100 g, source : approx. Ciqual),
   repas types pour le générateur, contenu des approches.
   ===================================================== */

const APPROCHES = {
  equilibre: {
    nom: "Équilibre classique",
    emoji: "🥗",
    court: "Manger de tout, dans les bonnes proportions. La référence recommandée par la santé publique.",
    lien: { url: "https://www.mangerbouger.fr/manger-mieux", source: "MangerBouger — programme national nutrition santé" },
    principe: "On ne supprime rien : on ajuste les proportions. Une assiette repère : la moitié de légumes, un quart de protéines, un quart de féculents (de préférence complets), un peu de bonnes graisses. C'est l'approche recommandée par les autorités de santé (type PNNS).",
    pratique: [
      "5 portions de fruits et légumes par jour",
      "Des féculents à chaque repas, plutôt complets",
      "Poisson 2 fois par semaine, dont 1 poisson gras",
      "Légumineuses (lentilles, pois chiches…) 2 fois par semaine",
      "Limiter le sucre ajouté, le sel et les produits ultra-transformés"
    ],
    atouts: ["Durable et sans frustration", "Convient à toute la famille", "Le meilleur consensus scientifique"],
    vigilance: ["Demande de cuisiner un minimum", "Les portions restent à adapter à son appétit et son activité"],
    repartition: { pdej: 0.25, dej: 0.35, col: 0.10, diner: 0.30 },
    macros: { p: 0.15, g: 0.50, l: 0.35 }
  },
  chrono: {
    nom: "Chrononutrition",
    emoji: "⏰",
    court: "Manger en phase avec son horloge biologique : gras le matin, dense le midi, sucré au goûter, léger le soir.",
    lien: { url: "https://fr.wikipedia.org/wiki/Chrononutrition", source: "Wikipédia" },
    principe: "Développée par le Dr Alain Delabos en 1986, la chrononutrition part du principe que l'organisme n'assimile pas les aliments de la même façon selon l'heure. Le matin, on sécrète des enzymes qui gèrent bien les graisses ; le soir, le métabolisme ralentit, donc on allège.",
    pratique: [
      "Matin : gras et consistant — fromage, œufs, pain beurré",
      "Midi : le repas le plus dense — viande + féculents, un seul plat",
      "Goûter (obligatoire) : le moment du sucré — chocolat noir, fruits secs, oléagineux",
      "Soir : léger — poisson ou fruits de mer avec des légumes, voire rien si pas faim"
    ],
    atouts: ["Cadre clair et facile à suivre", "Le goûter « plaisir » aide à tenir", "Dîner léger souvent bénéfique pour le sommeil"],
    vigilance: ["Peu d'études scientifiques solides sur la méthode complète", "Le petit-déjeuner copieux ne convient pas à tous", "Risque de monotonie si on ne varie pas"],
    repartition: { pdej: 0.30, dej: 0.35, col: 0.15, diner: 0.20 },
    macros: { p: 0.20, g: 0.35, l: 0.45 }
  },
  dissociee: {
    nom: "Alimentation dissociée",
    emoji: "🍽️",
    court: "Ne pas mélanger certaines familles d'aliments au même repas, notamment protéines et féculents.",
    lien: { url: "https://fr.wikipedia.org/wiki/R%C3%A9gime_dissoci%C3%A9", source: "Wikipédia" },
    principe: "L'idée : certains aliments demanderaient des digestions « incompatibles ». On sépare donc les protéines concentrées (viande, poisson, œufs) des féculents, et on mange les fruits en dehors des repas. Un repas type : protéines + légumes le midi, féculents + légumes le soir.",
    pratique: [
      "Midi : protéines (viande, poisson, œufs) + légumes à volonté",
      "Soir : féculents (riz, pâtes, pommes de terre) + légumes",
      "Fruits plutôt seuls, en collation",
      "Les légumes se marient avec tout"
    ],
    atouts: ["Repas simples à composer", "Fait la part belle aux légumes", "Certains ressentent une digestion plus légère"],
    vigilance: ["Fondement scientifique faible : un système digestif sain gère très bien les mélanges", "Peut compliquer les repas sociaux", "Veiller à couvrir tous ses besoins sur la journée"],
    repartition: { pdej: 0.20, dej: 0.35, col: 0.10, diner: 0.35 },
    macros: { p: 0.20, g: 0.45, l: 0.35 }
  },
  mediterraneen: {
    nom: "Régime méditerranéen",
    emoji: "🫒",
    court: "Huile d'olive, légumes, légumineuses, poisson : le modèle alimentaire le plus étudié au monde.",
    lien: { url: "https://fr.wikipedia.org/wiki/R%C3%A9gime_m%C3%A9diterran%C3%A9en", source: "Wikipédia" },
    principe: "Inspiré des habitudes traditionnelles de Crète et du sud de l'Italie, c'est le mode alimentaire dont les bénéfices sont les mieux démontrés, notamment pour le cœur. Beaucoup de végétaux, de l'huile d'olive comme matière grasse principale, du poisson plutôt que de la viande rouge.",
    pratique: [
      "Huile d'olive comme matière grasse principale",
      "Légumes à chaque repas, fruits en dessert",
      "Légumineuses et céréales complètes régulièrement",
      "Poisson 2 à 3 fois par semaine, viande rouge limitée",
      "Herbes et épices plutôt que sel"
    ],
    atouts: ["Bénéfices cardiovasculaires démontrés par de nombreuses études", "Gourmand, varié, convivial", "Facile à suivre sur le long terme"],
    vigilance: ["L'huile d'olive reste calorique : on dose", "Demande des produits frais et un peu de cuisine"],
    repartition: { pdej: 0.25, dej: 0.35, col: 0.10, diner: 0.30 },
    macros: { p: 0.15, g: 0.45, l: 0.40 }
  },
  vegetarien: {
    nom: "Végétarien",
    emoji: "🌱",
    court: "Sans viande ni poisson. Œufs, laitages et protéines végétales prennent le relais.",
    lien: { url: "https://fr.wikipedia.org/wiki/V%C3%A9g%C3%A9tarisme", source: "Wikipédia" },
    principe: "On retire la viande et le poisson, on garde (selon les variantes) œufs et produits laitiers. Bien mené, c'est un mode alimentaire complet : la clé est d'associer les sources de protéines végétales (légumineuses + céréales) et de surveiller quelques nutriments.",
    pratique: [
      "Associer légumineuses et céréales (riz + lentilles, semoule + pois chiches…)",
      "Œufs, tofu, laitages comme sources de protéines",
      "Fer végétal + vitamine C au même repas (agrumes, poivron…)",
      "B12 à supplémenter si l'on tend vers le végétalisme"
    ],
    atouts: ["Riche en fibres et végétaux", "Impact environnemental réduit", "Souvent économique"],
    vigilance: ["Surveiller B12, fer, et l'apport total en protéines", "Les substituts végé industriels sont parfois ultra-transformés"],
    repartition: { pdej: 0.25, dej: 0.35, col: 0.10, diner: 0.30 },
    macros: { p: 0.15, g: 0.50, l: 0.35 }
  },
  lowcarb: {
    nom: "Low carb (modéré)",
    emoji: "🥑",
    court: "Réduire les glucides — sans les supprimer — au profit des protéines, des légumes et des bonnes graisses.",
    lien: { url: "https://fr.wikipedia.org/wiki/R%C3%A9gime_pauvre_en_glucides", source: "Wikipédia" },
    principe: "On diminue la part des féculents et du sucre, et on construit l'assiette autour des protéines, des légumes et des bonnes graisses. La version modérée (100–150 g de glucides/jour) garde fruits et petites portions de féculents : plus tenable que les versions extrêmes.",
    pratique: [
      "Assiette type : protéines + légumes + bonnes graisses",
      "Féculents en petite portion, plutôt autour de l'activité physique",
      "Fruits peu sucrés (fruits rouges, kiwi, agrumes)",
      "Oléagineux et huile d'olive pour la satiété"
    ],
    atouts: ["Forte satiété, utile contre les fringales", "Simple à comprendre", "Peut aider à réguler l'appétit pour le sucre"],
    vigilance: ["Fatigue possible les premiers jours", "Pas nécessaire pour tout le monde", "Garder fibres et légumes ; éviter les versions extrêmes sans avis médical"],
    repartition: { pdej: 0.25, dej: 0.35, col: 0.10, diner: 0.30 },
    macros: { p: 0.30, g: 0.20, l: 0.50 }
  },
  seche: {
    nom: "Sèche sportive",
    emoji: "🏋️",
    court: "Perdre du gras en préservant le muscle : déficit modéré, protéines élevées. Pour sportifs réguliers.",
    lien: { url: "https://www.irbms.com/proteines-sport-alimentation/", source: "IRBMS — médecine du sport" },
    principe: "La sèche est une phase temporaire (8 à 12 semaines maximum) où l'on crée un déficit calorique modéré tout en augmentant les protéines (1,8 à 2,2 g par kilo de poids corporel et par jour) pour forcer le corps à puiser dans le gras sans sacrifier le muscle. Elle n'a de sens qu'avec un entraînement en résistance maintenu.",
    pratique: [
      "Des protéines à chaque repas, collation comprise (1,8 à 2,2 g/kg/jour)",
      "Déficit modéré : 300 à 500 kcal sous la dépense quotidienne, jamais sous le métabolisme de base",
      "Féculents conservés, surtout autour des entraînements",
      "Légumes à volonté pour le volume et la satiété",
      "1 semaine « pause » à un déficit léger toutes les 3-4 semaines"
    ],
    atouts: ["Préserve la masse musculaire", "Cadre chiffré, facile à suivre", "Forte satiété grâce aux protéines"],
    vigilance: ["Phase temporaire : 8 à 12 semaines max, puis retour progressif au maintien", "Baisse d'énergie possible à l'entraînement", "Réservée aux sportifs réguliers — inutile pour débuter", "Au-delà de 2,5 g/kg de protéines : aucun bénéfice supplémentaire"],
    repartition: { pdej: 0.25, dej: 0.35, col: 0.15, diner: 0.25 },
    macros: { p: 0.30, g: 0.40, l: 0.30 }
  },
  jeune: {
    nom: "Jeûne intermittent 16/8",
    emoji: "🕛",
    court: "Concentrer ses repas sur une fenêtre de 8 h (ex. 12 h – 20 h) et jeûner le reste du temps.",
    lien: { url: "https://fr.wikipedia.org/wiki/Je%C3%BBne_intermittent", source: "Wikipédia" },
    principe: "On ne change pas forcément ce qu'on mange, mais quand : tous les repas sont pris dans une fenêtre d'environ 8 heures, le plus souvent en sautant le petit-déjeuner. En dehors, uniquement des boissons non caloriques (eau, café, thé sans sucre).",
    pratique: [
      "Fenêtre type : 12 h – 20 h (déjeuner, collation, dîner)",
      "Boissons non caloriques pendant le jeûne",
      "Ne pas surcompenser aux repas suivants",
      "La qualité des repas reste essentielle"
    ],
    atouts: ["Simple : moins de repas à préparer", "Peut aider à réduire les apports sans compter", "Flexible (on choisit sa fenêtre)"],
    vigilance: ["Déconseillé : femmes enceintes, diabète traité, antécédents de troubles alimentaires", "Vigilance si activité physique intense le matin", "Ce n'est pas magique : le total de la journée compte toujours"],
    repartition: { pdej: 0, dej: 0.40, col: 0.15, diner: 0.45 },
    macros: { p: 0.20, g: 0.45, l: 0.35 }
  }
};

/* ---------- Aliments : valeurs pour 100 g ---------- */
const ALIMENTS = [
  // Fruits
  { id: "pomme", nom: "Pomme", cat: "Fruits", kcal: 52, p: 0.3, g: 12, l: 0.2 },
  { id: "banane", nom: "Banane", cat: "Fruits", kcal: 89, p: 1.1, g: 20, l: 0.3 },
  { id: "orange", nom: "Orange", cat: "Fruits", kcal: 47, p: 0.9, g: 9, l: 0.1 },
  { id: "poire", nom: "Poire", cat: "Fruits", kcal: 57, p: 0.4, g: 12, l: 0.1 },
  { id: "kiwi", nom: "Kiwi", cat: "Fruits", kcal: 58, p: 1.1, g: 11, l: 0.5 },
  { id: "fraise", nom: "Fraise", cat: "Fruits", kcal: 32, p: 0.7, g: 6, l: 0.3 },
  { id: "framboise", nom: "Framboise", cat: "Fruits", kcal: 43, p: 1.2, g: 7, l: 0.6 },
  { id: "myrtille", nom: "Myrtille", cat: "Fruits", kcal: 57, p: 0.7, g: 12, l: 0.3 },
  { id: "raisin", nom: "Raisin", cat: "Fruits", kcal: 69, p: 0.6, g: 16, l: 0.2 },
  { id: "ananas", nom: "Ananas", cat: "Fruits", kcal: 50, p: 0.5, g: 11, l: 0.1 },
  { id: "mangue", nom: "Mangue", cat: "Fruits", kcal: 60, p: 0.8, g: 13, l: 0.4 },
  { id: "peche", nom: "Pêche", cat: "Fruits", kcal: 39, p: 0.9, g: 8, l: 0.2 },
  { id: "abricot", nom: "Abricot", cat: "Fruits", kcal: 48, p: 1.4, g: 9, l: 0.4 },
  { id: "clementine", nom: "Clémentine", cat: "Fruits", kcal: 47, p: 0.9, g: 10, l: 0.2 },
  { id: "melon", nom: "Melon", cat: "Fruits", kcal: 34, p: 0.8, g: 7, l: 0.2 },
  { id: "pasteque", nom: "Pastèque", cat: "Fruits", kcal: 30, p: 0.6, g: 7, l: 0.2 },
  { id: "cerise", nom: "Cerise", cat: "Fruits", kcal: 63, p: 1.1, g: 14, l: 0.3 },
  { id: "prune", nom: "Prune", cat: "Fruits", kcal: 46, p: 0.7, g: 10, l: 0.3 },
  { id: "figue", nom: "Figue", cat: "Fruits", kcal: 74, p: 0.8, g: 16, l: 0.3 },
  { id: "citron", nom: "Citron", cat: "Fruits", kcal: 29, p: 1.1, g: 3, l: 0.3 },
  { id: "avocat", nom: "Avocat", cat: "Fruits", kcal: 160, p: 2, g: 4, l: 15 },
  { id: "compote", nom: "Compote sans sucre ajouté", cat: "Fruits", kcal: 68, p: 0.3, g: 15, l: 0.2 },
  { id: "abricot_sec", nom: "Abricot sec", cat: "Fruits", kcal: 241, p: 3.4, g: 53, l: 0.5 },
  { id: "datte", nom: "Datte", cat: "Fruits", kcal: 282, p: 2.5, g: 64, l: 0.4 },
  { id: "raisin_sec", nom: "Raisin sec", cat: "Fruits", kcal: 299, p: 3, g: 64, l: 0.5 },
  { id: "pruneau", nom: "Pruneau", cat: "Fruits", kcal: 240, p: 2.2, g: 52, l: 0.4 },

  // Légumes
  { id: "carotte", nom: "Carotte", cat: "Légumes", kcal: 41, p: 0.9, g: 8, l: 0.2 },
  { id: "tomate", nom: "Tomate", cat: "Légumes", kcal: 18, p: 0.9, g: 3, l: 0.2 },
  { id: "courgette", nom: "Courgette", cat: "Légumes", kcal: 17, p: 1.2, g: 2, l: 0.3 },
  { id: "brocoli", nom: "Brocoli", cat: "Légumes", kcal: 34, p: 2.8, g: 4, l: 0.4 },
  { id: "epinard", nom: "Épinard", cat: "Légumes", kcal: 23, p: 2.9, g: 1.5, l: 0.4 },
  { id: "haricot_vert", nom: "Haricot vert", cat: "Légumes", kcal: 31, p: 1.8, g: 5, l: 0.2 },
  { id: "poivron", nom: "Poivron", cat: "Légumes", kcal: 26, p: 1, g: 5, l: 0.2 },
  { id: "concombre", nom: "Concombre", cat: "Légumes", kcal: 15, p: 0.6, g: 2.5, l: 0.1 },
  { id: "salade", nom: "Salade verte", cat: "Légumes", kcal: 15, p: 1.4, g: 1.5, l: 0.2 },
  { id: "chou_fleur", nom: "Chou-fleur", cat: "Légumes", kcal: 25, p: 1.9, g: 3, l: 0.3 },
  { id: "aubergine", nom: "Aubergine", cat: "Légumes", kcal: 25, p: 1, g: 4, l: 0.2 },
  { id: "champignon", nom: "Champignon", cat: "Légumes", kcal: 22, p: 3.1, g: 2, l: 0.3 },
  { id: "poireau", nom: "Poireau", cat: "Légumes", kcal: 31, p: 1.5, g: 5, l: 0.3 },
  { id: "oignon", nom: "Oignon", cat: "Légumes", kcal: 40, p: 1.1, g: 8, l: 0.1 },
  { id: "betterave", nom: "Betterave", cat: "Légumes", kcal: 43, p: 1.6, g: 8, l: 0.2 },
  { id: "potiron", nom: "Potiron", cat: "Légumes", kcal: 26, p: 1, g: 5, l: 0.1 },
  { id: "asperge", nom: "Asperge", cat: "Légumes", kcal: 20, p: 2.2, g: 2, l: 0.1 },
  { id: "endive", nom: "Endive", cat: "Légumes", kcal: 17, p: 1, g: 2.5, l: 0.1 },
  { id: "celeri", nom: "Céleri branche", cat: "Légumes", kcal: 16, p: 0.7, g: 2, l: 0.2 },
  { id: "petit_pois", nom: "Petit pois", cat: "Légumes", kcal: 81, p: 5.4, g: 12, l: 0.4 },
  { id: "mais", nom: "Maïs doux", cat: "Légumes", kcal: 96, p: 3.4, g: 17, l: 1.5 },
  { id: "fenouil", nom: "Fenouil", cat: "Légumes", kcal: 31, p: 1.2, g: 5, l: 0.2 },
  { id: "soupe_legumes", nom: "Soupe de légumes", cat: "Légumes", kcal: 35, p: 1.2, g: 5, l: 1 },

  // Féculents
  { id: "riz_blanc", nom: "Riz blanc (cuit)", cat: "Féculents", kcal: 130, p: 2.7, g: 28, l: 0.3 },
  { id: "riz_complet", nom: "Riz complet (cuit)", cat: "Féculents", kcal: 111, p: 2.6, g: 22, l: 0.9 },
  { id: "pates", nom: "Pâtes (cuites)", cat: "Féculents", kcal: 131, p: 5, g: 25, l: 1.1 },
  { id: "pates_completes", nom: "Pâtes complètes (cuites)", cat: "Féculents", kcal: 124, p: 5.3, g: 23, l: 1.3 },
  { id: "pain_blanc", nom: "Pain blanc (baguette)", cat: "Féculents", kcal: 265, p: 9, g: 49, l: 3.2 },
  { id: "pain_complet", nom: "Pain complet", cat: "Féculents", kcal: 247, p: 13, g: 41, l: 3.4 },
  { id: "pain_cereales", nom: "Pain aux céréales", cat: "Féculents", kcal: 259, p: 11, g: 43, l: 4.5 },
  { id: "pdt", nom: "Pomme de terre (vapeur)", cat: "Féculents", kcal: 77, p: 2, g: 17, l: 0.1 },
  { id: "patate_douce", nom: "Patate douce", cat: "Féculents", kcal: 86, p: 1.6, g: 20, l: 0.1 },
  { id: "quinoa", nom: "Quinoa (cuit)", cat: "Féculents", kcal: 120, p: 4.4, g: 21, l: 1.9 },
  { id: "boulgour", nom: "Boulgour (cuit)", cat: "Féculents", kcal: 83, p: 3.1, g: 19, l: 0.2 },
  { id: "semoule", nom: "Semoule (cuite)", cat: "Féculents", kcal: 112, p: 3.8, g: 23, l: 0.2 },
  { id: "avoine", nom: "Flocons d'avoine", cat: "Féculents", kcal: 379, p: 13, g: 58, l: 7 },
  { id: "muesli", nom: "Muesli", cat: "Féculents", kcal: 360, p: 9, g: 62, l: 8 },
  { id: "biscotte", nom: "Biscotte", cat: "Féculents", kcal: 407, p: 11, g: 72, l: 6 },
  { id: "galette_riz", nom: "Galette de riz", cat: "Féculents", kcal: 387, p: 8, g: 81, l: 3 },

  // Légumineuses
  { id: "lentilles", nom: "Lentilles (cuites)", cat: "Légumineuses", kcal: 116, p: 9, g: 20, l: 0.4 },
  { id: "pois_chiches", nom: "Pois chiches (cuits)", cat: "Légumineuses", kcal: 164, p: 9, g: 27, l: 2.6 },
  { id: "haricots_rouges", nom: "Haricots rouges (cuits)", cat: "Légumineuses", kcal: 127, p: 8.7, g: 23, l: 0.5 },
  { id: "haricots_blancs", nom: "Haricots blancs (cuits)", cat: "Légumineuses", kcal: 115, p: 8, g: 21, l: 0.6 },
  { id: "tofu", nom: "Tofu nature", cat: "Légumineuses", kcal: 76, p: 8, g: 1.9, l: 4.8 },
  { id: "houmous", nom: "Houmous", cat: "Légumineuses", kcal: 250, p: 7, g: 15, l: 19 },

  // Viandes & œufs
  { id: "poulet", nom: "Poulet (blanc)", cat: "Viandes & œufs", kcal: 165, p: 31, g: 0, l: 3.6 },
  { id: "dinde", nom: "Dinde (escalope)", cat: "Viandes & œufs", kcal: 135, p: 29, g: 0, l: 1.7 },
  { id: "steak5", nom: "Steak haché 5 % MG", cat: "Viandes & œufs", kcal: 129, p: 21, g: 0, l: 5 },
  { id: "boeuf_roti", nom: "Bœuf rôti", cat: "Viandes & œufs", kcal: 149, p: 26, g: 0, l: 4.5 },
  { id: "porc_filet", nom: "Filet de porc", cat: "Viandes & œufs", kcal: 143, p: 26, g: 0, l: 3.9 },
  { id: "jambon_blanc", nom: "Jambon blanc", cat: "Viandes & œufs", kcal: 115, p: 20, g: 0.5, l: 3.5 },
  { id: "jambon_cru", nom: "Jambon cru", cat: "Viandes & œufs", kcal: 240, p: 27, g: 0.3, l: 14 },
  { id: "veau", nom: "Veau (escalope)", cat: "Viandes & œufs", kcal: 172, p: 31, g: 0, l: 5 },
  { id: "agneau", nom: "Agneau (côtelette)", cat: "Viandes & œufs", kcal: 230, p: 25, g: 0, l: 14 },
  { id: "canard", nom: "Magret de canard", cat: "Viandes & œufs", kcal: 200, p: 24, g: 0, l: 11 },
  { id: "lapin", nom: "Lapin", cat: "Viandes & œufs", kcal: 137, p: 20, g: 0, l: 5.5 },
  { id: "oeuf", nom: "Œuf (1 œuf ≈ 50 g)", cat: "Viandes & œufs", kcal: 143, p: 12.6, g: 0.7, l: 9.9 },

  // Poissons & fruits de mer
  { id: "saumon", nom: "Saumon", cat: "Poissons & fruits de mer", kcal: 208, p: 20, g: 0, l: 13 },
  { id: "saumon_fume", nom: "Saumon fumé", cat: "Poissons & fruits de mer", kcal: 184, p: 23, g: 0, l: 10 },
  { id: "thon_boite", nom: "Thon au naturel (boîte)", cat: "Poissons & fruits de mer", kcal: 116, p: 26, g: 0, l: 1 },
  { id: "cabillaud", nom: "Cabillaud", cat: "Poissons & fruits de mer", kcal: 82, p: 18, g: 0, l: 0.7 },
  { id: "colin", nom: "Colin", cat: "Poissons & fruits de mer", kcal: 78, p: 17, g: 0, l: 0.9 },
  { id: "sardine", nom: "Sardine", cat: "Poissons & fruits de mer", kcal: 208, p: 24, g: 0, l: 12 },
  { id: "maquereau", nom: "Maquereau", cat: "Poissons & fruits de mer", kcal: 205, p: 19, g: 0, l: 14 },
  { id: "truite", nom: "Truite", cat: "Poissons & fruits de mer", kcal: 148, p: 21, g: 0, l: 7 },
  { id: "crevette", nom: "Crevette", cat: "Poissons & fruits de mer", kcal: 99, p: 21, g: 0.2, l: 1.1 },
  { id: "dorade", nom: "Dorade", cat: "Poissons & fruits de mer", kcal: 100, p: 20, g: 0, l: 2 },
  { id: "sole", nom: "Sole", cat: "Poissons & fruits de mer", kcal: 86, p: 18, g: 0, l: 1.3 },
  { id: "moules", nom: "Moules", cat: "Poissons & fruits de mer", kcal: 86, p: 12, g: 3, l: 2.2 },

  // Produits laitiers
  { id: "lait_demi", nom: "Lait demi-écrémé", cat: "Produits laitiers", kcal: 46, p: 3.2, g: 4.8, l: 1.5 },
  { id: "lait_ecreme", nom: "Lait écrémé", cat: "Produits laitiers", kcal: 33, p: 3.3, g: 4.7, l: 0.1 },
  { id: "lait_amande", nom: "Lait d'amande", cat: "Produits laitiers", kcal: 24, p: 0.5, g: 3, l: 1.1 },
  { id: "yaourt_nature", nom: "Yaourt nature", cat: "Produits laitiers", kcal: 60, p: 4, g: 5, l: 3 },
  { id: "yaourt_grec", nom: "Yaourt grec", cat: "Produits laitiers", kcal: 97, p: 5.6, g: 3.8, l: 6.5 },
  { id: "fromage_blanc0", nom: "Fromage blanc 0 %", cat: "Produits laitiers", kcal: 43, p: 7.5, g: 4, l: 0.2 },
  { id: "fromage_blanc", nom: "Fromage blanc 3 %", cat: "Produits laitiers", kcal: 72, p: 6.8, g: 3.5, l: 3.2 },
  { id: "skyr", nom: "Skyr", cat: "Produits laitiers", kcal: 57, p: 10, g: 3.8, l: 0.2 },
  { id: "emmental", nom: "Emmental", cat: "Produits laitiers", kcal: 380, p: 28, g: 0.5, l: 29 },
  { id: "camembert", nom: "Camembert", cat: "Produits laitiers", kcal: 300, p: 20, g: 0.5, l: 24 },
  { id: "chevre", nom: "Fromage de chèvre (bûche)", cat: "Produits laitiers", kcal: 320, p: 18, g: 1.5, l: 27 },
  { id: "comte", nom: "Comté", cat: "Produits laitiers", kcal: 410, p: 27, g: 0.5, l: 33 },
  { id: "feta", nom: "Feta", cat: "Produits laitiers", kcal: 264, p: 14, g: 1.5, l: 21 },
  { id: "mozzarella", nom: "Mozzarella", cat: "Produits laitiers", kcal: 280, p: 18, g: 1.5, l: 22 },
  { id: "parmesan", nom: "Parmesan", cat: "Produits laitiers", kcal: 431, p: 36, g: 0.5, l: 30 },
  { id: "beurre", nom: "Beurre", cat: "Produits laitiers", kcal: 745, p: 0.7, g: 0.5, l: 82 },
  { id: "creme_fraiche", nom: "Crème fraîche 30 %", cat: "Produits laitiers", kcal: 292, p: 2.3, g: 3, l: 30 },
  { id: "creme_legere", nom: "Crème légère 15 %", cat: "Produits laitiers", kcal: 162, p: 2.5, g: 4, l: 15 },

  // Matières grasses & oléagineux
  { id: "huile_olive", nom: "Huile d'olive", cat: "Matières grasses & oléagineux", kcal: 900, p: 0, g: 0, l: 100 },
  { id: "huile_colza", nom: "Huile de colza", cat: "Matières grasses & oléagineux", kcal: 900, p: 0, g: 0, l: 100 },
  { id: "amandes", nom: "Amandes", cat: "Matières grasses & oléagineux", kcal: 634, p: 25, g: 8, l: 53 },
  { id: "noix", nom: "Noix", cat: "Matières grasses & oléagineux", kcal: 698, p: 15, g: 6, l: 67 },
  { id: "noisettes", nom: "Noisettes", cat: "Matières grasses & oléagineux", kcal: 646, p: 14, g: 6, l: 61 },
  { id: "cajou", nom: "Noix de cajou", cat: "Matières grasses & oléagineux", kcal: 580, p: 18, g: 27, l: 44 },
  { id: "pistaches", nom: "Pistaches", cat: "Matières grasses & oléagineux", kcal: 601, p: 21, g: 17, l: 49 },
  { id: "cacahuetes", nom: "Cacahuètes", cat: "Matières grasses & oléagineux", kcal: 585, p: 26, g: 8, l: 49 },
  { id: "beurre_cacahuete", nom: "Beurre de cacahuète", cat: "Matières grasses & oléagineux", kcal: 597, p: 25, g: 12, l: 50 },
  { id: "chia", nom: "Graines de chia", cat: "Matières grasses & oléagineux", kcal: 486, p: 17, g: 8, l: 31 },
  { id: "lin", nom: "Graines de lin", cat: "Matières grasses & oléagineux", kcal: 534, p: 18, g: 3, l: 42 },
  { id: "olives", nom: "Olives", cat: "Matières grasses & oléagineux", kcal: 145, p: 1, g: 1, l: 14 },

  // Sucré & divers
  { id: "chocolat_noir", nom: "Chocolat noir 70 %", cat: "Sucré & divers", kcal: 546, p: 6, g: 33, l: 39 },
  { id: "chocolat_lait", nom: "Chocolat au lait", cat: "Sucré & divers", kcal: 550, p: 7, g: 57, l: 32 },
  { id: "miel", nom: "Miel", cat: "Sucré & divers", kcal: 304, p: 0.4, g: 82, l: 0 },
  { id: "confiture", nom: "Confiture", cat: "Sucré & divers", kcal: 240, p: 0.5, g: 59, l: 0.1 },
  { id: "sucre", nom: "Sucre", cat: "Sucré & divers", kcal: 400, p: 0, g: 100, l: 0 },
  { id: "biscuits", nom: "Biscuits secs", cat: "Sucré & divers", kcal: 435, p: 7, g: 72, l: 12 },
  { id: "pain_epices", nom: "Pain d'épices", cat: "Sucré & divers", kcal: 313, p: 4, g: 71, l: 2 },
  { id: "jus_orange", nom: "Jus d'orange", cat: "Sucré & divers", kcal: 45, p: 0.7, g: 10, l: 0.1 },

  // Sauces & condiments
  { id: "vinaigrette", nom: "Vinaigrette", cat: "Sauces & condiments", kcal: 330, p: 0.3, g: 3, l: 34 },
  { id: "mayonnaise", nom: "Mayonnaise", cat: "Sauces & condiments", kcal: 700, p: 1, g: 2, l: 76 },
  { id: "sauce_tomate", nom: "Sauce tomate", cat: "Sauces & condiments", kcal: 38, p: 1.5, g: 6, l: 1 },
  { id: "moutarde", nom: "Moutarde", cat: "Sauces & condiments", kcal: 150, p: 7, g: 6, l: 11 },

  // Alternatives pour régimes particuliers
  { id: "pain_sans_gluten", nom: "Pain sans gluten", cat: "Féculents", kcal: 235, p: 3.5, g: 45, l: 4 },
  { id: "yaourt_soja", nom: "Yaourt au soja nature", cat: "Produits laitiers", kcal: 50, p: 4, g: 2.1, l: 2.3 },
  { id: "creme_soja", nom: "Crème de soja", cat: "Produits laitiers", kcal: 178, p: 3, g: 3, l: 17 }
];

/* ---------- Régimes particuliers ----------
   Aliments contenant du gluten ou du lactose, et substitutions
   automatiques utilisées par le générateur. L'avoine est classée
   « gluten » par prudence (contamination croisée fréquente). ---------- */
const GLUTEN_IDS = new Set([
  "pain_blanc", "pain_complet", "pain_cereales", "pates", "pates_completes",
  "semoule", "boulgour", "biscotte", "muesli", "avoine", "biscuits", "pain_epices"
]);
const LACTOSE_IDS = new Set([
  "lait_demi", "lait_ecreme", "yaourt_nature", "yaourt_grec", "fromage_blanc0",
  "fromage_blanc", "skyr", "emmental", "camembert", "chevre", "comte", "feta",
  "mozzarella", "parmesan", "beurre", "creme_fraiche", "creme_legere", "chocolat_lait"
]);

const SUBS_SANS_GLUTEN = {
  pain_blanc: "pain_sans_gluten", pain_complet: "pain_sans_gluten", pain_cereales: "pain_sans_gluten",
  pates: "riz_blanc", pates_completes: "riz_complet",
  semoule: "quinoa", boulgour: "quinoa", avoine: "quinoa", biscotte: "galette_riz"
};
/* ---------- Unités d'achat ----------
   Poids moyen d'une unité (g) et libellé, pour afficher la liste de
   courses en « pièces à acheter » plutôt qu'en grammes bruts.
   Les aliments absents de cette table restent affichés au poids. ---------- */
const UNITES = {
  // Fruits
  pomme: { g: 150, l: "pièce" }, banane: { g: 120, l: "pièce" }, orange: { g: 150, l: "pièce" },
  poire: { g: 160, l: "pièce" }, kiwi: { g: 100, l: "pièce" }, citron: { g: 100, l: "pièce" },
  avocat: { g: 150, l: "pièce" }, peche: { g: 150, l: "pièce" }, abricot: { g: 50, l: "pièce" },
  clementine: { g: 70, l: "pièce" }, prune: { g: 50, l: "pièce" }, figue: { g: 50, l: "pièce" },
  mangue: { g: 350, l: "pièce" }, melon: { g: 900, l: "pièce" }, ananas: { g: 1500, l: "pièce" },
  pasteque: { g: 3000, l: "pièce" }, compote: { g: 100, l: "pot" },
  // Légumes
  tomate: { g: 120, l: "pièce" }, courgette: { g: 250, l: "pièce" }, poivron: { g: 150, l: "pièce" },
  concombre: { g: 300, l: "pièce" }, aubergine: { g: 300, l: "pièce" }, oignon: { g: 100, l: "pièce" },
  carotte: { g: 100, l: "pièce" }, poireau: { g: 150, l: "pièce" }, endive: { g: 120, l: "pièce" },
  salade: { g: 250, l: "pièce" }, chou_fleur: { g: 800, l: "pièce" }, brocoli: { g: 400, l: "pièce" },
  fenouil: { g: 250, l: "pièce" }, betterave: { g: 150, l: "pièce" }, mais: { g: 140, l: "boîte" },
  // Féculents
  pain_blanc: { g: 250, l: "baguette" }, biscotte: { g: 10, l: "pièce" }, galette_riz: { g: 9, l: "pièce" },
  // Viandes & œufs
  oeuf: { g: 50, l: "œuf" }, steak5: { g: 125, l: "steak" }, poulet: { g: 180, l: "filet" },
  dinde: { g: 130, l: "escalope" }, veau: { g: 150, l: "escalope" },
  jambon_blanc: { g: 45, l: "tranche" }, jambon_cru: { g: 15, l: "tranche" },
  // Poissons
  saumon: { g: 130, l: "pavé" }, saumon_fume: { g: 35, l: "tranche" },
  cabillaud: { g: 150, l: "filet" }, colin: { g: 130, l: "filet" }, thon_boite: { g: 140, l: "boîte" },
  // Produits laitiers
  yaourt_nature: { g: 125, l: "pot" }, yaourt_grec: { g: 150, l: "pot" }, skyr: { g: 150, l: "pot" },
  yaourt_soja: { g: 100, l: "pot" }, camembert: { g: 250, l: "pièce" }, chevre: { g: 180, l: "bûche" },
  mozzarella: { g: 125, l: "boule" }
};

/* ---------- Saisonnalité (France métropolitaine) ----------
   Mois (1-12) où le produit FRAIS est de saison. Les aliments absents
   sont considérés disponibles toute l'année (stockage, conserve,
   surgelé, import courant : pomme, banane, carotte, oignon…). ---------- */
const SAISONS = {
  // Fruits
  fraise: [4, 5, 6, 7, 8], framboise: [6, 7, 8, 9], myrtille: [6, 7, 8, 9], cerise: [5, 6, 7],
  abricot: [6, 7, 8], peche: [6, 7, 8, 9], prune: [7, 8, 9, 10], figue: [7, 8, 9, 10],
  raisin: [8, 9, 10, 11], melon: [6, 7, 8, 9], pasteque: [6, 7, 8, 9],
  clementine: [11, 12, 1, 2], orange: [11, 12, 1, 2, 3, 4],
  poire: [8, 9, 10, 11, 12, 1, 2], kiwi: [11, 12, 1, 2, 3, 4, 5],
  // Légumes
  tomate: [6, 7, 8, 9, 10], courgette: [5, 6, 7, 8, 9, 10], aubergine: [6, 7, 8, 9, 10],
  poivron: [6, 7, 8, 9, 10], concombre: [5, 6, 7, 8, 9], haricot_vert: [6, 7, 8, 9, 10],
  petit_pois: [5, 6, 7], asperge: [4, 5, 6], potiron: [9, 10, 11, 12, 1],
  poireau: [9, 10, 11, 12, 1, 2, 3, 4], endive: [10, 11, 12, 1, 2, 3, 4],
  chou_fleur: [9, 10, 11, 12, 1, 2, 3, 4, 5], brocoli: [6, 7, 8, 9, 10, 11],
  fenouil: [5, 6, 7, 8, 9, 10], epinard: [1, 2, 3, 4, 5, 9, 10, 11, 12]
};

const SUBS_SANS_LACTOSE = {
  lait_demi: "lait_amande", lait_ecreme: "lait_amande",
  yaourt_nature: "yaourt_soja", yaourt_grec: "yaourt_soja", fromage_blanc0: "yaourt_soja",
  fromage_blanc: "yaourt_soja", skyr: "yaourt_soja",
  beurre: "huile_olive", creme_fraiche: "creme_soja", creme_legere: "creme_soja",
  chocolat_lait: "chocolat_noir"
};

/* ---------- Repas types pour le générateur ----------
   items : [idAliment, grammes]
   app : approches compatibles ---------- */
const REPAS = [
  // ===== Petits-déjeuners =====
  { id: "pd1", type: "pdej", nom: "Petit-déj salé : œufs, pain & fromage", app: ["chrono", "equilibre"], items: [["oeuf", 100], ["pain_complet", 50], ["beurre", 10], ["emmental", 30]] },
  { id: "pd2", type: "pdej", nom: "Pain beurré & comté", app: ["chrono"], items: [["pain_complet", 60], ["beurre", 20], ["comte", 60]] },
  { id: "pd3", type: "pdej", nom: "Porridge aux fruits rouges", app: ["equilibre", "vegetarien"], items: [["avoine", 60], ["lait_demi", 250], ["myrtille", 80], ["amandes", 15]] },
  { id: "pd4", type: "pdej", nom: "Yaourt grec, miel, noix & banane", app: ["mediterraneen", "vegetarien", "equilibre"], items: [["yaourt_grec", 150], ["miel", 15], ["noix", 20], ["banane", 100]] },
  { id: "pd5", type: "pdej", nom: "Tartines méditerranéennes (feta, tomate, huile d'olive)", app: ["mediterraneen"], items: [["pain_complet", 60], ["huile_olive", 10], ["tomate", 80], ["feta", 40], ["oeuf", 50]] },
  { id: "pd6", type: "pdej", nom: "Assiette de fruits frais & amandes", app: ["dissociee", "vegetarien"], items: [["banane", 120], ["pomme", 150], ["kiwi", 100], ["amandes", 20]] },
  { id: "pd7", type: "pdej", nom: "Muesli, lait & banane", app: ["equilibre", "vegetarien"], items: [["muesli", 60], ["lait_demi", 200], ["banane", 100]] },
  { id: "pd8", type: "pdej", nom: "Fromage blanc, fraises & graines de chia", app: ["seche", "equilibre", "vegetarien", "lowcarb"], items: [["fromage_blanc", 200], ["fraise", 150], ["chia", 15], ["miel", 10]] },
  { id: "pd9", type: "pdej", nom: "Œufs brouillés, avocat & tomate", app: ["seche", "lowcarb", "chrono"], items: [["oeuf", 150], ["avocat", 80], ["tomate", 100]] },
  { id: "pd10", type: "pdej", nom: "Skyr, muesli & framboises", app: ["seche", "equilibre", "vegetarien"], items: [["skyr", 200], ["muesli", 40], ["framboise", 100]] },
  { id: "pd11", type: "pdej", nom: "Tartines beurre-confiture & jus d'orange", app: ["equilibre"], items: [["pain_blanc", 70], ["beurre", 10], ["confiture", 30], ["jus_orange", 150]] },
  { id: "pd12", type: "pdej", nom: "Toast avocat & saumon fumé", app: ["equilibre", "mediterraneen"], items: [["pain_cereales", 50], ["avocat", 70], ["saumon_fume", 50], ["citron", 10]] },
  { id: "pd13", type: "pdej", nom: "Salade de fruits (orange, banane, raisin, datte)", app: ["dissociee", "vegetarien"], items: [["orange", 150], ["banane", 100], ["raisin", 100], ["datte", 20]] },

  // ===== Déjeuners =====
  { id: "dj1", type: "dej", nom: "Poulet rôti, riz & haricots verts", app: ["seche", "equilibre", "chrono"], items: [["poulet", 150], ["riz_blanc", 180], ["haricot_vert", 150], ["huile_olive", 10]] },
  { id: "dj2", type: "dej", nom: "Saumon, quinoa & brocoli", app: ["seche", "equilibre", "mediterraneen"], items: [["saumon", 130], ["quinoa", 150], ["brocoli", 150], ["huile_olive", 10]] },
  { id: "dj3", type: "dej", nom: "Steak haché, pâtes & courgettes à la tomate", app: ["equilibre", "chrono"], items: [["steak5", 130], ["pates", 200], ["courgette", 100], ["sauce_tomate", 80], ["huile_olive", 5]] },
  { id: "dj4", type: "dej", nom: "Grande salade méditerranéenne (pois chiches, feta, olives)", app: ["mediterraneen", "vegetarien"], items: [["pois_chiches", 150], ["feta", 60], ["tomate", 120], ["concombre", 100], ["olives", 30], ["huile_olive", 15]] },
  { id: "dj5", type: "dej", nom: "Cabillaud, pommes de terre vapeur & carottes", app: ["equilibre"], items: [["cabillaud", 160], ["pdt", 200], ["carotte", 100], ["beurre", 10]] },
  { id: "dj6", type: "dej", nom: "Poulet grillé & poêlée de légumes verts", app: ["seche", "dissociee", "lowcarb"], items: [["poulet", 160], ["courgette", 150], ["epinard", 100], ["champignon", 100], ["huile_olive", 12]] },
  { id: "dj7", type: "dej", nom: "Bœuf & légumes rôtis au four", app: ["dissociee", "lowcarb"], items: [["steak5", 150], ["aubergine", 150], ["poivron", 100], ["oignon", 50], ["huile_olive", 12]] },
  { id: "dj8", type: "dej", nom: "Chili végétarien & riz complet", app: ["vegetarien", "equilibre"], items: [["haricots_rouges", 200], ["mais", 80], ["tomate", 150], ["riz_complet", 150], ["oignon", 50], ["huile_olive", 8]] },
  { id: "dj9", type: "dej", nom: "Buddha bowl au tofu", app: ["vegetarien", "equilibre"], items: [["tofu", 150], ["quinoa", 150], ["avocat", 60], ["carotte", 80], ["epinard", 60], ["huile_colza", 8]] },
  { id: "dj10", type: "dej", nom: "Pâtes complètes au thon & sauce tomate", app: ["equilibre", "mediterraneen"], items: [["thon_boite", 100], ["pates_completes", 200], ["sauce_tomate", 100], ["parmesan", 15], ["huile_olive", 8]] },
  { id: "dj11", type: "dej", nom: "Magret de canard & pommes de terre sautées", app: ["chrono"], items: [["canard", 150], ["pdt", 250], ["salade", 50], ["vinaigrette", 15]] },
  { id: "dj12", type: "dej", nom: "Salade César sans croûtons", app: ["seche", "lowcarb"], items: [["poulet", 140], ["salade", 100], ["parmesan", 20], ["oeuf", 50], ["mayonnaise", 20]] },
  { id: "dj13", type: "dej", nom: "Couscous poulet & légumes", app: ["equilibre"], items: [["semoule", 180], ["poulet", 130], ["carotte", 100], ["courgette", 100], ["pois_chiches", 80], ["huile_olive", 8]] },
  { id: "dj14", type: "dej", nom: "Omelette aux champignons & salade", app: ["seche", "lowcarb", "dissociee"], items: [["oeuf", 150], ["champignon", 100], ["emmental", 30], ["salade", 80], ["vinaigrette", 10]] },
  { id: "dj15", type: "dej", nom: "Dahl de lentilles & riz", app: ["vegetarien", "equilibre"], items: [["lentilles", 220], ["tomate", 100], ["oignon", 50], ["riz_blanc", 120], ["huile_colza", 10]] },

  // ===== Collations =====
  { id: "co1", type: "col", nom: "Pomme & amandes", app: ["equilibre", "mediterraneen", "vegetarien", "dissociee", "lowcarb"], items: [["pomme", 150], ["amandes", 25]] },
  { id: "co2", type: "col", nom: "Chocolat noir & abricots secs", app: ["chrono", "vegetarien"], items: [["chocolat_noir", 30], ["abricot_sec", 40]] },
  { id: "co3", type: "col", nom: "Yaourt, framboises & miel", app: ["equilibre", "vegetarien"], items: [["yaourt_nature", 125], ["framboise", 100], ["miel", 10]] },
  { id: "co4", type: "col", nom: "Banane & beurre de cacahuète", app: ["seche", "vegetarien", "equilibre"], items: [["banane", 120], ["beurre_cacahuete", 15]] },
  { id: "co5", type: "col", nom: "Skyr & myrtilles", app: ["seche", "equilibre", "lowcarb"], items: [["skyr", 150], ["myrtille", 80], ["miel", 8]] },
  { id: "co6", type: "col", nom: "Poignée de noix & carrés de chocolat noir", app: ["chrono", "lowcarb", "vegetarien"], items: [["noix", 20], ["chocolat_noir", 20]] },
  { id: "co7", type: "col", nom: "Houmous & bâtonnets de légumes", app: ["mediterraneen", "vegetarien", "dissociee"], items: [["houmous", 60], ["carotte", 100], ["concombre", 100]] },
  { id: "co8", type: "col", nom: "Compote & biscottes", app: ["equilibre", "vegetarien"], items: [["compote", 100], ["biscotte", 20]] },
  { id: "co9", type: "col", nom: "Salade de fruits frais", app: ["dissociee", "vegetarien", "equilibre", "mediterraneen"], items: [["orange", 150], ["kiwi", 100], ["fraise", 100]] },

  // ===== Dîners =====
  { id: "di1", type: "diner", nom: "Colin & légumes verts vapeur", app: ["chrono", "lowcarb", "dissociee"], items: [["colin", 160], ["courgette", 200], ["haricot_vert", 100], ["huile_olive", 8]] },
  { id: "di2", type: "diner", nom: "Soupe de légumes & tartine de chèvre", app: ["equilibre", "vegetarien"], items: [["soupe_legumes", 300], ["pain_complet", 40], ["chevre", 40]] },
  { id: "di3", type: "diner", nom: "Omelette aux légumes", app: ["lowcarb", "dissociee", "chrono", "vegetarien", "equilibre"], items: [["oeuf", 100], ["poivron", 80], ["oignon", 40], ["champignon", 80], ["huile_olive", 8], ["salade", 50]] },
  { id: "di4", type: "diner", nom: "Riz aux légumes façon risotto", app: ["dissociee", "vegetarien"], items: [["riz_blanc", 200], ["courgette", 150], ["champignon", 100], ["oignon", 40], ["huile_olive", 12]] },
  { id: "di5", type: "diner", nom: "Pâtes aux légumes du soleil", app: ["dissociee", "vegetarien", "equilibre"], items: [["pates", 220], ["aubergine", 100], ["courgette", 100], ["sauce_tomate", 100], ["huile_olive", 10]] },
  { id: "di6", type: "diner", nom: "Dorade au four, fenouil & pommes de terre", app: ["mediterraneen", "equilibre"], items: [["dorade", 160], ["fenouil", 200], ["citron", 20], ["huile_olive", 12], ["pdt", 120]] },
  { id: "di7", type: "diner", nom: "Curry de légumes & riz complet", app: ["vegetarien", "equilibre"], items: [["riz_complet", 150], ["chou_fleur", 150], ["petit_pois", 80], ["creme_legere", 40], ["oignon", 40]] },
  { id: "di8", type: "diner", nom: "Salade complète du soir (thon, œuf, olives)", app: ["seche", "lowcarb", "equilibre", "mediterraneen"], items: [["thon_boite", 80], ["salade", 80], ["tomate", 100], ["oeuf", 50], ["olives", 20], ["vinaigrette", 15]] },
  { id: "di9", type: "diner", nom: "Assiette légère : soupe, jambon & fromage blanc", app: ["seche", "equilibre", "lowcarb"], items: [["soupe_legumes", 300], ["jambon_blanc", 60], ["fromage_blanc", 100]] },
  { id: "di10", type: "diner", nom: "Crevettes sautées & wok de légumes", app: ["seche", "lowcarb", "chrono", "dissociee", "mediterraneen"], items: [["crevette", 150], ["brocoli", 150], ["poivron", 100], ["huile_colza", 10]] },
  { id: "di11", type: "diner", nom: "Truite, patate douce & épinards", app: ["equilibre"], items: [["truite", 140], ["patate_douce", 180], ["epinard", 150], ["huile_olive", 8]] },
  { id: "di12", type: "diner", nom: "Tofu sauté, boulgour & brocoli", app: ["vegetarien", "equilibre"], items: [["tofu", 120], ["boulgour", 180], ["brocoli", 150], ["huile_colza", 10]] },
  { id: "di13", type: "diner", nom: "Poulet grillé & purée de chou-fleur", app: ["seche", "lowcarb"], items: [["poulet", 140], ["chou_fleur", 250], ["creme_legere", 30], ["beurre", 5]] },
  { id: "di14", type: "diner", nom: "Sardines grillées & légumes", app: ["chrono", "mediterraneen", "lowcarb"], items: [["sardine", 100], ["tomate", 150], ["courgette", 150], ["huile_olive", 8]] },

  // ===== Enrichissement végétarien & variété =====
  { id: "pd15", type: "pdej", nom: "Compote, banane & noisettes", app: ["dissociee", "vegetarien"], items: [["compote", 150], ["banane", 100], ["noisettes", 20]] },
  { id: "pd16", type: "pdej", nom: "Pancakes d'avoine à la banane", app: ["equilibre", "vegetarien", "seche"], items: [["avoine", 60], ["oeuf", 100], ["banane", 100], ["lait_demi", 100]] },
  { id: "dj17", type: "dej", nom: "Tofu grillé, avocat & légumes poêlés", app: ["dissociee", "lowcarb", "vegetarien", "seche"], items: [["tofu", 200], ["avocat", 100], ["courgette", 150], ["champignon", 100], ["huile_olive", 15], ["olives", 30]] },
  { id: "dj18", type: "dej", nom: "Omelette au chèvre & épinards", app: ["seche", "dissociee", "lowcarb", "vegetarien"], items: [["oeuf", 150], ["chevre", 50], ["epinard", 150], ["salade", 80], ["vinaigrette", 15]] },
  { id: "dj19", type: "dej", nom: "Salade grecque à l'œuf", app: ["mediterraneen", "lowcarb", "vegetarien", "dissociee"], items: [["oeuf", 100], ["feta", 80], ["tomate", 150], ["concombre", 150], ["olives", 40], ["huile_olive", 12]] },
  { id: "dj20", type: "dej", nom: "Curry de pois chiches & riz", app: ["vegetarien", "equilibre"], items: [["pois_chiches", 200], ["riz_blanc", 150], ["tomate", 100], ["oignon", 50], ["huile_colza", 10]] },
  { id: "dj21", type: "dej", nom: "Œufs au plat, pommes de terre sautées & emmental", app: ["chrono", "equilibre", "vegetarien"], items: [["oeuf", 100], ["pdt", 250], ["emmental", 40], ["huile_olive", 10]] },
  { id: "dj22", type: "dej", nom: "Risotto crémeux aux champignons & parmesan", app: ["chrono", "equilibre", "vegetarien"], items: [["riz_blanc", 250], ["champignon", 150], ["parmesan", 30], ["oignon", 40], ["beurre", 15]] },
  { id: "dj23", type: "dej", nom: "Escalope de veau & purée maison", app: ["chrono", "equilibre"], items: [["veau", 150], ["pdt", 250], ["beurre", 15], ["haricot_vert", 100]] },
  { id: "co11", type: "col", nom: "Œufs durs & bâtonnets de concombre", app: ["lowcarb", "seche", "dissociee"], items: [["oeuf", 100], ["concombre", 100]] },
  { id: "co12", type: "col", nom: "Smoothie banane & lait d'amande", app: ["equilibre", "vegetarien"], items: [["banane", 120], ["lait_amande", 200], ["beurre_cacahuete", 10]] },
  { id: "co13", type: "col", nom: "Poire & carrés de chocolat noir", app: ["chrono", "dissociee", "vegetarien", "equilibre"], items: [["poire", 150], ["chocolat_noir", 20]] },
  { id: "co14", type: "col", nom: "Yaourt de soja & fruits rouges", app: ["vegetarien", "equilibre"], items: [["yaourt_soja", 150], ["framboise", 100], ["miel", 10]] },
  { id: "di16", type: "diner", nom: "Velouté de légumes & œuf mollet", app: ["equilibre", "vegetarien"], items: [["soupe_legumes", 300], ["oeuf", 100], ["pain_complet", 40]] },
  { id: "di17", type: "diner", nom: "Quinoa aux légumes rôtis", app: ["dissociee", "vegetarien", "equilibre", "mediterraneen"], items: [["quinoa", 200], ["aubergine", 150], ["poivron", 100], ["oignon", 50], ["huile_olive", 12]] },
  { id: "di18", type: "diner", nom: "Semoule, pois chiches & légumes", app: ["vegetarien", "equilibre"], items: [["semoule", 200], ["pois_chiches", 100], ["courgette", 150], ["carotte", 100], ["huile_olive", 10]] },
  { id: "di19", type: "diner", nom: "Pommes de terre au four & fromage blanc aux herbes", app: ["vegetarien", "equilibre"], items: [["pdt", 300], ["fromage_blanc", 150], ["salade", 80], ["huile_colza", 8]] },
  { id: "di20", type: "diner", nom: "Gratin de courgettes au chèvre", app: ["lowcarb", "vegetarien", "chrono"], items: [["courgette", 300], ["chevre", 60], ["oeuf", 100], ["creme_legere", 50]] },

  // ===== Spécial sèche sportive =====
  { id: "pd14", type: "pdej", nom: "Bowl protéiné : skyr, avoine & banane", app: ["seche", "equilibre", "vegetarien"], items: [["skyr", 250], ["avoine", 50], ["banane", 100]] },
  { id: "dj16", type: "dej", nom: "Poulet, patate douce & brocoli", app: ["seche", "equilibre"], items: [["poulet", 180], ["patate_douce", 200], ["brocoli", 200], ["huile_olive", 8]] },
  { id: "co10", type: "col", nom: "Fromage blanc 0 % & amandes", app: ["seche", "lowcarb", "equilibre", "vegetarien"], items: [["fromage_blanc0", 250], ["amandes", 15], ["miel", 5]] },
  { id: "di15", type: "diner", nom: "Cabillaud, riz & épinards", app: ["seche", "equilibre"], items: [["cabillaud", 180], ["riz_blanc", 150], ["epinard", 200], ["huile_olive", 8]] },

  // ===== Variété des approches à petit pool (chrono matin/goûter/soir,
  // low carb & méditerranéen matin) — limite les répétitions hebdomadaires =====
  { id: "pd17", type: "pdej", nom: "Omelette au comté & jambon", app: ["chrono", "lowcarb", "seche"], items: [["oeuf", 120], ["comte", 40], ["jambon_blanc", 40], ["beurre", 5]] },
  { id: "pd18", type: "pdej", nom: "Œufs au plat, jambon & pain beurré", app: ["chrono", "equilibre"], items: [["oeuf", 100], ["jambon_blanc", 50], ["pain_complet", 60], ["beurre", 10]] },
  { id: "pd19", type: "pdej", nom: "Pain complet, chèvre & noix", app: ["chrono", "vegetarien"], items: [["pain_complet", 60], ["chevre", 60], ["noix", 20]] },
  { id: "pd20", type: "pdej", nom: "Yaourt grec, myrtilles & chia", app: ["lowcarb", "seche", "vegetarien"], items: [["yaourt_grec", 200], ["myrtille", 80], ["chia", 15], ["amandes", 15]] },
  { id: "pd21", type: "pdej", nom: "Yaourt grec, figue, noix & miel", app: ["mediterraneen", "vegetarien"], items: [["yaourt_grec", 150], ["figue", 80], ["noix", 20], ["miel", 10]] },
  { id: "co15", type: "col", nom: "Dattes, amandes & carré de chocolat noir", app: ["chrono", "vegetarien"], items: [["datte", 30], ["amandes", 20], ["chocolat_noir", 15]] },
  { id: "co16", type: "col", nom: "Banane & chocolat noir", app: ["chrono", "vegetarien", "equilibre"], items: [["banane", 120], ["chocolat_noir", 20]] },
  { id: "di21", type: "diner", nom: "Sole vapeur, épinards & champignons", app: ["chrono", "lowcarb", "dissociee"], items: [["sole", 160], ["epinard", 150], ["champignon", 100], ["huile_olive", 8]] },
  { id: "di22", type: "diner", nom: "Moules marinières & salade", app: ["chrono", "mediterraneen", "lowcarb"], items: [["moules", 250], ["oignon", 40], ["salade", 80], ["vinaigrette", 10]] },
  { id: "dj24", type: "dej", nom: "Dorade grillée, boulgour & poivrons", app: ["mediterraneen", "equilibre"], items: [["dorade", 150], ["boulgour", 150], ["poivron", 120], ["huile_olive", 10]] }
];

/* =====================================================
   Suivi lipides / glucides / sel — données complémentaires
   Pour 100 g : [sel (g), acides gras saturés (g), sucres (g)].
   Ordres de grandeur inspirés de Ciqual (version non salée pour les
   produits cuits à l'eau : le sel de cuisson est à noter à part).
   ===================================================== */
const NUTRI_PLUS = {
  // Fruits
  pomme: [0, 0.03, 11.5], banane: [0, 0.1, 15], orange: [0, 0.02, 8.5], poire: [0, 0.02, 10],
  kiwi: [0, 0.03, 9], fraise: [0, 0.02, 5], framboise: [0, 0.02, 4.5], myrtille: [0, 0.03, 10],
  raisin: [0, 0.05, 16], ananas: [0, 0.01, 10], mangue: [0, 0.1, 13], peche: [0, 0.02, 8],
  abricot: [0, 0.03, 8], clementine: [0, 0.02, 9], melon: [0.03, 0.05, 7], pasteque: [0, 0.02, 6],
  cerise: [0, 0.07, 13], prune: [0, 0.02, 9], figue: [0, 0.06, 15], citron: [0, 0.04, 2.5],
  avocat: [0.02, 2.1, 0.7], compote: [0, 0.04, 13], abricot_sec: [0.03, 0.03, 45], datte: [0.01, 0.03, 63],
  raisin_sec: [0.05, 0.06, 59], pruneau: [0.01, 0.05, 38],
  // Légumes
  carotte: [0.1, 0.03, 5], tomate: [0.01, 0.04, 3], brocoli: [0.07, 0.05, 1.5], epinard: [0.2, 0.05, 0.5],
  haricot_vert: [0.01, 0.05, 2], poivron: [0.01, 0.03, 4], salade: [0.02, 0.03, 0.8], chou_fleur: [0.04, 0.06, 2],
  aubergine: [0.01, 0.03, 3], champignon: [0.02, 0.05, 0.4], poireau: [0.03, 0.04, 3], oignon: [0.01, 0.03, 5],
  betterave: [0.2, 0.03, 7], potiron: [0.01, 0.05, 3], asperge: [0.01, 0.04, 1.5], endive: [0.01, 0.02, 1],
  celeri: [0.2, 0.04, 1.5], petit_pois: [0.01, 0.08, 5], mais: [0.5, 0.2, 5], fenouil: [0.1, 0.03, 3],
  soupe_legumes: [0.7, 0.1, 2], courgette: [0.01, 0.06, 2], concombre: [0.01, 0.03, 2],
  // Féculents
  riz_blanc: [0.02, 0.05, 0.1], riz_complet: [0.02, 0.2, 0.4], pates: [0.01, 0.1, 0.6], pates_completes: [0.01, 0.2, 0.8],
  pain_blanc: [1.3, 0.3, 2.5], pain_complet: [1.1, 0.4, 3], pain_cereales: [1.1, 0.8, 3], patate_douce: [0.1, 0.03, 6],
  quinoa: [0.02, 0.2, 0.9], boulgour: [0.02, 0.05, 0.2], semoule: [0.02, 0.05, 0.2], avoine: [0.01, 1.3, 1],
  muesli: [0.2, 1.5, 20], biscotte: [1.3, 1.5, 6], galette_riz: [0.3, 0.6, 0.5], pdt: [0.02, 0.02, 0.8],
  pain_sans_gluten: [1.1, 0.5, 3],
  // Légumineuses
  lentilles: [0.01, 0.07, 0.5], pois_chiches: [0.02, 0.3, 1], haricots_rouges: [0.01, 0.1, 0.3],
  haricots_blancs: [0.02, 0.1, 0.3], tofu: [0.03, 0.9, 0.7], houmous: [1.0, 1.4, 0.5],
  // Viandes & œufs
  poulet: [0.15, 0.5, 0], steak5: [0.2, 2.3, 0], boeuf_roti: [0.15, 2.5, 0], porc_filet: [0.15, 1.2, 0],
  jambon_blanc: [1.9, 1.1, 0.8], jambon_cru: [5.0, 4, 0.3], veau: [0.2, 0.6, 0], agneau: [0.2, 8, 0],
  canard: [0.2, 7, 0], lapin: [0.15, 1.5, 0], oeuf: [0.35, 2.8, 0.3], dinde: [0.15, 0.5, 0],
  // Poissons & fruits de mer
  saumon: [0.15, 2.5, 0], saumon_fume: [3.0, 2, 0], thon_boite: [0.9, 0.3, 0], cabillaud: [0.25, 0.1, 0],
  sardine: [0.3, 2.5, 0], maquereau: [0.2, 3.5, 0], truite: [0.1, 1.2, 0], crevette: [1.5, 0.2, 0],
  dorade: [0.2, 1.2, 0], sole: [0.25, 0.3, 0], moules: [0.7, 0.4, 0], colin: [0.25, 0.2, 0],
  // Produits laitiers
  lait_demi: [0.1, 1, 4.8], lait_ecreme: [0.1, 0.1, 4.7], lait_amande: [0.12, 0.1, 0.2],
  yaourt_nature: [0.13, 0.8, 4.7], yaourt_grec: [0.1, 6.5, 4], fromage_blanc0: [0.1, 0.1, 4],
  fromage_blanc: [0.1, 2, 3.8], skyr: [0.1, 0.1, 4], emmental: [0.6, 18, 0], camembert: [1.6, 14, 0],
  chevre: [1.6, 15, 0], feta: [3.0, 14, 0.5], mozzarella: [0.5, 12, 1], parmesan: [1.6, 19, 0],
  beurre: [0.03, 53, 0.6], creme_fraiche: [0.1, 20, 2.5], creme_legere: [0.1, 9, 3.5], comte: [0.8, 21, 0],
  yaourt_soja: [0.1, 0.4, 1], creme_soja: [0.1, 2, 2],
  // Matières grasses & oléagineux
  huile_olive: [0, 14, 0], huile_colza: [0, 7, 0], amandes: [0.01, 4, 4.5], noix: [0.01, 6.5, 2.6],
  noisettes: [0.01, 4.5, 4], cajou: [0.03, 8, 6], pistaches: [1.2, 6, 7], cacahuetes: [1.0, 7, 4],
  beurre_cacahuete: [0.9, 10, 6], chia: [0.04, 3.3, 0], lin: [0.08, 3.7, 1.5], olives: [2.8, 2, 0],
  // Sucré & divers
  chocolat_noir: [0.03, 26, 28], chocolat_lait: [0.25, 19, 52], miel: [0.02, 0, 81], sucre: [0, 0, 100],
  biscuits: [0.7, 6, 23], pain_epices: [0.6, 0.3, 40], jus_orange: [0, 0, 9], confiture: [0.02, 0, 55],
  // Sauces & condiments
  vinaigrette: [1.8, 4, 2.5], mayonnaise: [1.2, 6, 1.5], sauce_tomate: [0.9, 0.2, 5], moutarde: [6.0, 0.7, 2]
};

/* Aliments ajoutés pour le suivi du quotidien : ce sont souvent eux qui
   font exploser le compteur de sel ou de lipides sans qu'on s'en rende compte. */
const ALIMENTS_SUIVI = [
  { id: "sel", nom: "Sel de table", cat: "Sauces & condiments", kcal: 0, p: 0, g: 0, l: 0, sel: 100, ags: 0, suc: 0 },
  { id: "sauce_soja", nom: "Sauce soja", cat: "Sauces & condiments", kcal: 60, p: 8, g: 6, l: 0.1, sel: 14, ags: 0, suc: 1.5 },
  { id: "bouillon_cube", nom: "Bouillon cube (déshydraté)", cat: "Sauces & condiments", kcal: 230, p: 10, g: 15, l: 15, sel: 47, ags: 7, suc: 3 },
  { id: "ketchup", nom: "Ketchup", cat: "Sauces & condiments", kcal: 110, p: 1.3, g: 25, l: 0.2, sel: 1.8, ags: 0, suc: 22 },
  { id: "cornichons", nom: "Cornichons", cat: "Sauces & condiments", kcal: 18, p: 0.8, g: 2, l: 0.2, sel: 2.2, ags: 0, suc: 1.5 },
  { id: "beurre_demi_sel", nom: "Beurre demi-sel", cat: "Produits laitiers", kcal: 730, p: 0.7, g: 0.7, l: 80, sel: 2, ags: 53, suc: 0.7 },
  { id: "roquefort", nom: "Roquefort / bleu", cat: "Produits laitiers", kcal: 370, p: 20, g: 0, l: 32, sel: 3.5, ags: 21, suc: 0 },
  { id: "pain_mie", nom: "Pain de mie", cat: "Féculents", kcal: 270, p: 8, g: 48, l: 4.5, sel: 1.2, ags: 0.6, suc: 5 },
  { id: "croissant", nom: "Croissant", cat: "Féculents", kcal: 420, p: 8, g: 45, l: 22, sel: 1.0, ags: 13, suc: 9 },
  { id: "cereales_pdej", nom: "Céréales petit-déj (type corn flakes)", cat: "Féculents", kcal: 375, p: 7, g: 84, l: 1, sel: 1.4, ags: 0.2, suc: 8 },
  { id: "frites", nom: "Frites (au four)", cat: "Féculents", kcal: 200, p: 3, g: 30, l: 7, sel: 0.5, ags: 1, suc: 0.5 },
  { id: "saucisson", nom: "Saucisson sec", cat: "Viandes & œufs", kcal: 410, p: 26, g: 2, l: 33, sel: 5, ags: 12, suc: 1 },
  { id: "lardons", nom: "Lardons", cat: "Viandes & œufs", kcal: 270, p: 16, g: 0.5, l: 23, sel: 2.5, ags: 8.5, suc: 0 },
  { id: "saucisse", nom: "Saucisse de Strasbourg", cat: "Viandes & œufs", kcal: 270, p: 12, g: 2, l: 24, sel: 2.0, ags: 9, suc: 1 },
  { id: "surimi", nom: "Surimi", cat: "Poissons & fruits de mer", kcal: 100, p: 8, g: 14, l: 1.5, sel: 1.8, ags: 0.3, suc: 5 },
  { id: "pizza", nom: "Pizza (type margherita)", cat: "Plats préparés", kcal: 250, p: 11, g: 28, l: 10, sel: 1.3, ags: 4.5, suc: 3 },
  { id: "quiche", nom: "Quiche lorraine", cat: "Plats préparés", kcal: 280, p: 9, g: 18, l: 19, sel: 0.9, ags: 9, suc: 1.5 },
  { id: "lasagnes", nom: "Lasagnes bolognaise (plat préparé)", cat: "Plats préparés", kcal: 150, p: 7.5, g: 14, l: 7, sel: 0.9, ags: 3, suc: 2.5 },
  { id: "chips", nom: "Chips", cat: "Sucré & divers", kcal: 540, p: 6, g: 50, l: 34, sel: 1.3, ags: 3, suc: 0.5 },
  { id: "soda", nom: "Soda sucré (type cola)", cat: "Boissons", kcal: 42, p: 0, g: 10.6, l: 0, sel: 0, ags: 0, suc: 10.6 },
  { id: "eau_vichy", nom: "Eau gazeuse riche en sodium (type Vichy)", cat: "Boissons", kcal: 0, p: 0, g: 0, l: 0, sel: 0.43, ags: 0, suc: 0 },
  { id: "biere", nom: "Bière blonde", cat: "Boissons", kcal: 40, p: 0.3, g: 3, l: 0, sel: 0.01, ags: 0, suc: 0.2 },
  { id: "vin", nom: "Vin rouge", cat: "Boissons", kcal: 70, p: 0, g: 0.5, l: 0, sel: 0.01, ags: 0, suc: 0.5 }
];

(function enrichirAliments() {
  ALIMENTS.forEach(a => {
    const x = NUTRI_PLUS[a.id];
    if (a.sel === undefined) a.sel = x ? x[0] : 0;
    if (a.ags === undefined) a.ags = x ? x[1] : 0;
    if (a.suc === undefined) a.suc = x ? x[2] : 0;
  });
  ALIMENTS.push(...ALIMENTS_SUIVI);
  UNITES.sel = { g: 0.4, l: "pincée" };
  UNITES.bouillon_cube = { g: 10, l: "cube" };
  UNITES.croissant = { g: 60, l: "pièce" };
  UNITES.pain_mie = { g: 25, l: "tranche" };
  UNITES.saucisse = { g: 35, l: "saucisse" };
  UNITES.sauce_soja = { g: 15, l: "c. à soupe" };
  UNITES.ketchup = { g: 15, l: "c. à soupe" };
  UNITES.biere = { g: 250, l: "demi" };
  UNITES.vin = { g: 125, l: "verre" };
  UNITES.soda = { g: 330, l: "canette" };
})();

/* Repères nutritionnels (seuils « feu tricolore » pour 100 g, utilisés sur les
   étiquettes européennes) : ≤ bas = vert, > haut = rouge. */
const SEUILS_100G = {
  sel: { bas: 0.3, haut: 1.5 },
  l: { bas: 3, haut: 17.5 },
  ags: { bas: 1.5, haut: 5 },
  suc: { bas: 5, haut: 22.5 }
};
