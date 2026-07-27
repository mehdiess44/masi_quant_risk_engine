export const traceabilityCatalog = {
  // --- Monte Carlo Metrics ---
  var_mc: {
    id: "var_mc",
    label: "VaR Monte Carlo (MAD)",
    notebook: "02_Moteur_MonteCarlo_VaR_MASI.ipynb",
    cell: "Cellule 21 (Simulation Stochastique & Percentiles)",
    configFile: "backend/app/models/moteur_mc_v3.json",
    formula: "VaR_α = S₀ - P_{α}(S_{T})",
    regulation: "Bâle III / FRTB (MAR20.4)",
    description: "Perte maximale estimée au seuil de confiance de 95% ou 99% par simulation stochastique de Mouvement Brownien Géométrique (MBG)."
  },
  es_mc: {
    id: "es_mc",
    label: "Expected Shortfall Monte Carlo (MAD)",
    notebook: "02_Moteur_MonteCarlo_VaR_MASI.ipynb",
    cell: "Cellule 23 (Calcul Expected Shortfall / CVaR)",
    configFile: "backend/app/models/moteur_mc_v3.json",
    formula: "ES_α = E[S₀ - S_{T} | S₀ - S_{T} > VaR_α]",
    regulation: "Bâle III / FRTB (MAR33.1 - Transition VaR vers ES)",
    description: "Perte moyenne espérée conditionnelle au dépassement de la VaR (Queue de distribution extrême)."
  },
  mu_calibrated: {
    id: "mu_calibrated",
    label: "Rendement Journalier Calibré (μ)",
    notebook: "02_Moteur_MonteCarlo_VaR_MASI.ipynb",
    cell: "Cellule 21 (Paramètres MBG sur MASI)",
    configFile: "backend/app/models/moteur_mc_v3.json",
    formula: "μ = \\frac{1}{N} \\sum_{t=1}^{N} \\ln\\left(\\frac{S_t}{S_{t-1}}\\right)",
    regulation: "Bâle III (MAR21.3 - Calibration historique)",
    description: "Moyenne empirique des rendements logarithmiques journaliers sur la série historique de référence du MASI."
  },
  sigma_calibrated: {
    id: "sigma_calibrated",
    label: "Volatilité Journalière Calibrée (σ)",
    notebook: "02_Moteur_MonteCarlo_VaR_MASI.ipynb",
    cell: "Cellule 21 (Paramètres MBG sur MASI)",
    configFile: "backend/app/models/moteur_mc_v3.json",
    formula: "σ = \\sqrt{\\frac{1}{N-1} \\sum_{t=1}^{N} (r_t - μ)^2}",
    regulation: "Bâle III (MAR21.3 - Paramètres stochastiques)",
    description: "Écart-type empirique des rendements logarithmiques journaliers sur le MASI."
  },
  s0_calibrated: {
    id: "s0_calibrated",
    label: "Prix Initial Calibré (S₀)",
    notebook: "02_Moteur_MonteCarlo_VaR_MASI.ipynb",
    cell: "Cellule 21 (Dernier prix historique)",
    configFile: "backend/app/models/moteur_mc_v3.json",
    formula: "S₀ = S_{t_{max}}",
    regulation: "Bâle III (Valorisation au prix de marché - Mark-to-Market)",
    description: "Dernière valeur unitaire observée sur le MASI servant de point d'ancrage aux trajectoires de Monte Carlo."
  },
  seed_42: {
    id: "seed_42",
    label: "Graine Aléatoire Reproductible (Seed = 42)",
    notebook: "02_Moteur_MonteCarlo_VaR_MASI.ipynb",
    cell: "Cellule 8 (Initialisation du générateur de nombres pseudo-aléatoires)",
    configFile: "backend/app/routers/montecarlo.py (/simulate endpoint)",
    formula: "Z \\sim \\mathcal{N}(0, 1), \\quad \\text{seed} = 42",
    regulation: "Bâle III (MAR50 - Auditalité & Reproductibilité des Simulations)",
    description: "Fixation d'une graine (seed) garantissant une parfaite reproductibilité au chiffre près des simulations de Monte Carlo lors des audits bancaires et revues de comités de risque."
  },

  // --- Machine Learning Metrics ---
  var_ml: {
    id: "var_ml",
    label: "VaR Machine Learning (LightGBM)",
    notebook: "03_MASI_VaR_MachineLearning_QuantileRegression.ipynb",
    cell: "Cellule 15 (Entraînement LightGBM Quantile α=0.05)",
    configFile: "backend/app/models/lgb_var_model.txt",
    formula: "L_q(y, \\hat{y}) = \\max(q(y - \\hat{y}), (q - 1)(y - \\hat{y}))",
    regulation: "Bâle III / IA Explicable dans la gestion des risques (EBA Guidelines)",
    description: "Prédiction non-paramétrique du quantile 5% des pertes par gradient boosting arborescent calibré avec fonction de perte Pinball."
  },
  es_ml: {
    id: "es_ml",
    label: "ES Conditionnel ML (LightGBM)",
    notebook: "03_MASI_VaR_MachineLearning_QuantileRegression.ipynb",
    cell: "Cellule 18 (Calcul ES Conditionnel Queue de Distribution)",
    configFile: "backend/app/models/lgb_var_model.txt",
    formula: "ES_{ML} = E[L_{réel} | L_{réel} > \\hat{VaR}_{ML}]",
    regulation: "FRTB (MAR33.1 - Remplacement réglementaire de la VaR par l'ES)",
    description: "Calcul d'Expected Shortfall rigoureux par espérance conditionnelle des pertes excédant la frontière prédite par le modèle LightGBM."
  },
  feature_importance: {
    id: "feature_importance",
    label: "Importance des Variables (SHAP / Gain)",
    notebook: "03_MASI_VaR_MachineLearning_QuantileRegression.ipynb",
    cell: "Cellule 19 (Analyse d'importance LightGBM & SHAP Values)",
    configFile: "backend/app/models/lgb_var_model.txt",
    formula: "\\text{Gain}(j) = \\sum_{T \\in \\text{arbres}} \\text{Gain de scission de la variable } j",
    regulation: "Bâle III (Gouvernance des modèles & Explicabilité - EBA/GL/2021/12)",
    description: "Traçabilité des facteurs explicatifs de la VaR (volatilités historiques, momentum, spreads) assurant l'interprétabilité bancaire."
  },

  // --- Bâle III & Backtesting Regulatory Metrics ---
  kupiec_pof: {
    id: "kupiec_pof",
    label: "Test de Kupiec (Proportion of Failures - POF)",
    notebook: "02_Moteur_MonteCarlo_VaR_MASI.ipynb & 03_MASI...",
    cell: "Cellule 25 (Validation Kupiec POF Likelihood Ratio)",
    configFile: "Calcul en temps réel (Backtesting Engine)",
    formula: "LR_{POF} = -2 \\ln\\left[ \\frac{(1-\\alpha)^{T-x} \\alpha^x}{(1-\\hat{p})^{T-x} \\hat{p}^x} \\right] \\sim \\chi^2(1)",
    regulation: "Bâle II / Bâle III (MAR50.2 - Validation du modèle interne)",
    description: "Test de vraisemblance vérifiant l'adéquation statistique entre le nombre d'exceptions de VaR observées et le taux d'alpha théorique (p-value > 0.05 pour valider le modèle)."
  },
  traffic_light: {
    id: "traffic_light",
    label: "Traffic Light Approach (Approche Feux Tricolores)",
    notebook: "02_Moteur_MonteCarlo_VaR_MASI.ipynb",
    cell: "Cellule 26 (Classification Bâloise Zones Vert/Jaune/Rouge)",
    configFile: "Calcul en temps réel sur 250 jours de trading",
    formula: "P(X \\le k) = \\sum_{i=0}^{k} \\binom{T}{i} \\alpha^i (1-\\alpha)^{T-i}",
    regulation: "Bâle III (MAR50.4 à MAR50.8 - Loi Binomiale & Pénalités k)",
    description: "Classification réglementaire du modèle de risque sur une fenêtre glissante de 250 jours (Zone Verte <= 4 exceptions, Jaune 5-9, Rouge >= 10)."
  },
  capital_penalty: {
    id: "capital_penalty",
    label: "Multiplicateur de Capital Bâlois (m_c)",
    notebook: "02_Moteur_MonteCarlo_VaR_MASI.ipynb",
    cell: "Cellule 26 (Détermination du facteur de majoration de capital)",
    configFile: "Tableau réglementaire Bâle III",
    formula: "K = m_c \\cdot \\text{VaR}_{60j} + \\text{surcharges zone jaune/rouge}",
    regulation: "Bâle III (MAR50.4 - Majoration du capital en Zone Jaune)",
    description: "Multiplicateur réglementaire s'appliquant aux exigences de fonds propres de la banque (démarre à 3.0 en Zone Verte, augmente jusqu'à 4.0 selon les exceptions)."
  }
};

export const getTraceability = (metricId) => {
  return traceabilityCatalog[metricId] || {
    label: metricId,
    notebook: "Référence interne CDG",
    cell: "Documentation générale",
    configFile: "Configuration système",
    formula: "N/A",
    regulation: "Conformité générale",
    description: "Métrique de pilotage du risque de marché MASI."
  };
};
