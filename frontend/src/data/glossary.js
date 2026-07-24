export const glossary = {
  var: {
    fullName: 'Value at Risk (VaR)',
    emoji: '📊',
    definition: 'La perte maximale que vous pourriez subir dans 95% des scénarios.',
    analogy: "C'est la quantité de pluie max prévue par la météo — il ne devrait pas pleuvoir plus, sauf surprise.",
    source: 'Bâle III, Art. 718(Lxxi)'
  },
  es: {
    fullName: 'Expected Shortfall (ES)',
    emoji: '📉',
    definition: 'La perte moyenne prévue si le pire (les 5% des pires scénarios) se produit.',
    analogy: "Si la météo se trompe complètement, c'est l'étendue des dégâts de l'inondation.",
    source: 'FRTB, Comité de Bâle'
  },
  alpha: {
    fullName: 'Alpha / Niveau de Confiance',
    emoji: '🎯',
    definition: 'Le degré de certitude du modèle, généralement 99% ou 95%.',
    analogy: "C'est votre marge de sécurité pour ne pas vous tromper dans l'estimation.",
    source: 'Statistique'
  },
  montecarlo: {
    fullName: 'Simulation de Monte Carlo',
    emoji: '🎲',
    definition: 'Méthode générant des milliers de scénarios aléatoires pour estimer le risque.',
    analogy: "Comme jouer un match de foot 10 000 fois dans un jeu vidéo pour deviner qui va gagner en vrai.",
    source: 'Mathématiques financières'
  },
  kupiec: {
    fullName: 'Test de Kupiec (POF)',
    emoji: '🔬',
    definition: 'Un test pour vérifier si le nombre de fois où on a dépassé la VaR correspond à ce qu\'on attendait.',
    analogy: "Un contrôle qualité : on vérifie si la météo a eu raison 95% du temps l'année dernière.",
    source: 'Kupiec (1995)'
  },
  lr_statistic: {
    fullName: 'Statistique du Rapport de Vraisemblance (LR)',
    emoji: '📈',
    definition: 'Valeur mathématique calculée par le test de Kupiec pour juger la qualité de la VaR.',
    analogy: "La note sur 20 donnée par l'inspecteur des travaux finis.",
    source: 'Économétrie'
  },
  p_value: {
    fullName: 'P-Value',
    emoji: '⚖️',
    definition: "Probabilité d'obtenir ces résultats de backtesting si notre modèle de risque était parfait.",
    analogy: "Plus elle est petite, plus ça sent le roussi pour notre modèle.",
    source: 'Statistique'
  },
  hit_sequence: {
    fullName: 'Séquence de Dépassements',
    emoji: '💥',
    definition: 'Série de 1 (dépassement de la VaR) et de 0 (perte dans la norme) sur une période.',
    analogy: "Le carnet de correspondances avec les mots pour mauvaise conduite.",
    source: 'Backtesting'
  },
  zone_verte: {
    fullName: 'Zone Verte',
    emoji: '🟢',
    definition: 'Le modèle est robuste, le nombre d\'exceptions est parfaitement acceptable.',
    analogy: "Le feu est vert, la conduite de la banque est sécuritaire.",
    source: 'Supervision bancaire'
  },
  zone_jaune: {
    fullName: 'Zone Jaune',
    emoji: '🟡',
    definition: 'Le modèle est douteux, avec trop d\'exceptions. Une pénalité en capital est appliquée.',
    analogy: "Feu orange : attention, on vous à l'oeil et l'amende augmente.",
    source: 'Supervision bancaire'
  },
  zone_rouge: {
    fullName: 'Zone Rouge',
    emoji: '🔴',
    definition: 'Le modèle est rejeté. Le nombre d\'exceptions est beaucoup trop élevé.',
    analogy: "Carton rouge. Retournez au modèle standard, votre système de risque ne marche pas.",
    source: 'Supervision bancaire'
  },
  ewma: {
    fullName: 'EWMA (Moyenne Mobile Exponentiellement Pondérée)',
    emoji: '🌊',
    definition: 'Méthode de calcul de la volatilité qui donne plus de poids aux événements récents.',
    analogy: "On s'intéresse plus à la météo d'hier qu'à celle d'il y a 3 mois pour prévoir celle de demain.",
    source: 'RiskMetrics'
  },
  max_drawdown: {
    fullName: 'Maximum Drawdown (Perte Maximale)',
    emoji: '🎢',
    definition: 'La plus grande baisse observée depuis le point le plus haut jusqu\'au point le plus bas.',
    analogy: "La plus grande frayeur de la montagne russe financière.",
    source: 'Gestion de portefeuille'
  },
  quantile_regression: {
    fullName: 'Régression Quantile',
    emoji: '🧠',
    definition: 'Modèle Machine Learning prédisant directement un certain quantile (ex: le pire 5%) plutôt que la moyenne.',
    analogy: "Au lieu de deviner le salaire moyen, on essaie de deviner le salaire des 5% les plus pauvres.",
    source: 'Machine Learning'
  },
  feature_importance: {
    fullName: 'Importance des Variables',
    emoji: '🔍',
    definition: 'Classement de l\'impact des différentes données sur les prédictions du modèle ML.',
    analogy: "Qui est le coupable ? Le taux de chômage, l'inflation, ou la crise pétrolière ?",
    source: 'Machine Learning'
  },
  capital_multiplier: {
    fullName: 'Multiplicateur de Capital (mc)',
    emoji: '💰',
    definition: 'Pénalité imposée par le régulateur (souvent entre 3 et 4) sur le capital requis selon la qualité du modèle.',
    analogy: "La caution qu'on vous demande de bloquer. Plus vous êtes dangereux, plus elle est grosse.",
    source: 'Réglementation Bâloise'
  },
  horizon: {
    fullName: 'Horizon de Temps',
    emoji: '⏳',
    definition: 'Période sur laquelle le risque est calculé (ex: 1 jour, 10 jours).',
    analogy: "Est-ce qu'on prévoit la météo pour demain ou pour la semaine prochaine ?",
    source: 'Finance'
  },
  violation_rate: {
    fullName: 'Taux de Violation',
    emoji: '🚨',
    definition: 'Pourcentage de jours où les pertes réelles ont dépassé la VaR prévue.',
    analogy: "Le pourcentage de jours où il a plu plus que prévu par rapport au total.",
    source: 'Backtesting'
  },
  confidence_level: {
    fullName: 'Niveau de Confiance (1 - Alpha)',
    emoji: '🛡️',
    definition: 'La probabilité que la perte ne dépasse pas la VaR (souvent 95% ou 99%).',
    analogy: "La solidité de votre bouclier face aux attaques.",
    source: 'Statistique'
  },
  portfolio_value: {
    fullName: 'Valeur du Portefeuille',
    emoji: '💵',
    definition: 'Valeur totale actuelle des actifs sous gestion.',
    analogy: "Combien vous avez sur votre compte en banque aujourd'hui.",
    source: 'Finance'
  },
  volatility: {
    fullName: 'Volatilité',
    emoji: '⚡',
    definition: 'Mesure de l\'ampleur des variations du prix d\'un actif.',
    analogy: "C'est l'agitation de la mer : mer d'huile (basse) ou tempête (haute).",
    source: 'Mathématiques financières'
  }
};
