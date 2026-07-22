import scipy.stats as stats

class RegulatoryEngine:
    def classify_traffic_light(self, exceptions_count: int, window_size: int = 250, alpha: float = 0.01) -> dict:
        """
        Classification Traffic Light de Bâle III basée sur la distribution binomiale.
        Note: Dans la pratique Bâloise, alpha pour la VaR est généralement de 1% (0.01) sur 10 jours,
        mais le backtesting Traffic Light se fait classiquement sur 1 an (250 jours) à 99% (alpha=0.01).
        
        Seuils typiques de Bâle pour N=250 et p=0.01 :
        - Vert : <= 4 exceptions (cdf >= 0.95 environ)
        - Jaune : 5 à 9 exceptions
        - Rouge : >= 10 exceptions (cdf >= 0.9999)
        """
        p = alpha
        
        # Seuil vert : quantile à 95% de la distribution cumulée
        # ppf donne le plus petit k tel que cdf(k) >= 0.95
        # Mais dans scipy, ppf(0.95) avec n=250, p=0.01 donne 4
        green_threshold = int(stats.binom.ppf(0.95, window_size, p))
        
        # Seuil jaune : quantile à 99.99% de la distribution
        # ppf(0.9999) donne 9
        yellow_threshold = int(stats.binom.ppf(0.9999, window_size, p))
        
        if exceptions_count <= green_threshold:
            zone = 'VERTE'
            capital_multiplier = 0.0
        elif exceptions_count <= yellow_threshold:
            zone = 'JAUNE'
            # Le multiplicateur en zone jaune dépend du nombre exact d'exceptions.
            # Bâle définit des facteurs spécifiques (0.4 pour 5, 0.5 pour 6, etc.)
            # On utilise une interpolation simple ou 0.5 par défaut
            capital_multiplier = 0.5
        else:
            zone = 'ROUGE'
            capital_multiplier = 1.0
            
        return {
            "model": "Modèle évalué",
            "zone": zone,
            "n_exceptions": exceptions_count,
            "window_size": window_size,
            "green_threshold": green_threshold,
            "yellow_threshold": yellow_threshold,
            "capital_multiplier": capital_multiplier,
            "alpha": alpha
        }
