import numpy as np
import scipy.stats as stats

class BacktestingEngine:
    def kupiec_test(self, returns: list[float], var_predictions: list[float], alpha: float = 0.05) -> dict:
        """
        Calcule le test POF (Proportion of Failures) de Kupiec.
        """
        N = len(returns)
        if N == 0:
            raise ValueError("Le tableau des rendements est vide.")
            
        # Identification de la Hit Sequence
        hit_sequence = []
        exceptions = 0
        
        for r, var in zip(returns, var_predictions):
            is_violation = bool(r < var)
            hit_sequence.append(is_violation)
            if is_violation:
                exceptions += 1
                
        x = exceptions
        p = alpha
        p_hat = x / N
        
        # Gestion des cas limites pour le ratio de vraisemblance
        # LR = -2 * ln( ( (1-p)^(N-x) * p^x ) / ( (1-p_hat)^(N-x) * p_hat^x ) )
        # On utilise une formulation stable avec np.log
        
        if x == 0:
            # Cas limite : 0 exception
            lr_stat = -2 * (N * np.log(1 - p))
        elif x == N:
            # Cas limite : exceptions tous les jours
            lr_stat = -2 * (N * np.log(p))
        else:
            term1 = (N - x) * np.log(1 - p) + x * np.log(p)
            term2 = (N - x) * np.log(1 - p_hat) + x * np.log(p_hat)
            lr_stat = -2 * (term1 - term2)
            
        # P-value = 1 - cdf(lr_stat, df=1) ou sf(lr_stat, df=1)
        p_value = stats.chi2.sf(lr_stat, df=1)
        
        # Seuil critique de Chi-2 à 95% de confiance (p=0.05, df=1) est de 3.841
        critical_value = stats.chi2.ppf(0.95, df=1)
        reject_h0 = bool(p_value < 0.05)
        
        if reject_h0:
            if x > N * p:
                verdict = "Modèle rejeté : VaR sous-estimée (trop d'exceptions)"
            else:
                verdict = "Modèle rejeté : VaR surestimée (trop peu d'exceptions)"
        else:
            verdict = "Modèle accepté : Proportion d'exceptions conforme aux attentes"
            
        return {
            "N": N,
            "x": x,
            "p": p,
            "p_hat": p_hat,
            "LR_statistic": float(lr_stat),
            "p_value": float(p_value),
            "critical_value": float(critical_value),
            "reject_H0": reject_h0,
            "verdict": verdict,
            "hit_sequence_bools": hit_sequence
        }
