import os
import json
import numpy as np

class MonteCarloEngine:
    def __init__(self):
        self.default_mu = 0.0
        self.default_sigma = 0.15
        self.default_s0 = 10000.0
        self._load_config()

    def _load_config(self):
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
        config_path = os.path.join(base_dir, 'app', 'models', 'moteur_mc_v3.json')
        if not os.path.exists(config_path):
            config_path = os.path.join(os.getcwd(), 'app', 'models', 'moteur_mc_v3.json')
            
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                config = json.load(f)
                self.default_mu = config.get('mu', self.default_mu)
                self.default_sigma = config.get('sigma', self.default_sigma)
                self.default_s0 = config.get('S0', self.default_s0)

    def simulate(self, n_simulations: int, horizon_days: int, alpha: float, custom_params: dict = None):
        mu = self.default_mu
        sigma = self.default_sigma
        s0 = self.default_s0
        
        if custom_params:
            if 'mu' in custom_params and custom_params['mu'] is not None:
                mu = custom_params['mu']
            if 'sigma' in custom_params and custom_params['sigma'] is not None:
                sigma = custom_params['sigma']
            if 'S0' in custom_params and custom_params['S0'] is not None:
                s0 = custom_params['S0']
                
        if sigma <= 0:
            raise ValueError("La volatilité doit être strictement positive")
            
        dt = horizon_days / 252.0
        
        # Mouvement Brownien Géométrique vectorisé
        Z = np.random.standard_normal(n_simulations)
        drift = (mu - 0.5 * sigma**2) * dt
        diffusion = sigma * np.sqrt(dt) * Z
        S_t = s0 * np.exp(drift + diffusion)
        
        # Calcul des rendements simulés
        simulated_returns = (S_t - s0) / s0
        
        # Tri des rendements pour VaR et ES
        sorted_returns = np.sort(simulated_returns)
        var_index = int(n_simulations * alpha)
        
        # VaR = percentile alpha des rendements (négatif)
        var_pct = sorted_returns[var_index]
        # ES = moyenne des rendements pires que la VaR
        es_pct = np.mean(sorted_returns[:var_index])
        
        # En valeur absolue (montant)
        var_value = var_pct * s0
        es_value = es_pct * s0
        
        # Downsampling à EXACTEMENT 200 trajectoires pour le front-end
        # On renvoie une matrice de 2 points par trajectoire : [S0, S_t]
        step = max(1, n_simulations // 200)
        sampled_st = S_t[::step][:200]
        # S'il en manque (ex: n_simulations=100), on prend ce qu'on peut, mais n_sim >= 10000 est garanti par le modèle
        sample_paths = [[float(s0), float(st)] for st in sampled_st]
        
        # Histogramme pré-agrégé (60 bins)
        counts, bin_edges = np.histogram(simulated_returns, bins=60)
        distribution_bins = [
            {"bin_start": float(bin_edges[i]), "bin_end": float(bin_edges[i+1]), "count": int(counts[i])}
            for i in range(len(counts))
        ]
        
        # Percentiles
        percentiles = {
            "p1": float(np.percentile(simulated_returns, 1)),
            "p5": float(np.percentile(simulated_returns, 5)),
            "p10": float(np.percentile(simulated_returns, 10)),
            "p50": float(np.percentile(simulated_returns, 50)),
            "p90": float(np.percentile(simulated_returns, 90)),
            "p95": float(np.percentile(simulated_returns, 95)),
            "p99": float(np.percentile(simulated_returns, 99))
        }
        
        return {
            "var": float(var_value),
            "es": float(es_value),
            "var_pct": float(var_pct),
            "es_pct": float(es_pct),
            "mu": float(mu),
            "sigma": float(sigma),
            "S0": float(s0),
            "n_simulations": n_simulations,
            "horizon_days": horizon_days,
            "alpha": alpha,
            "distribution_bins": distribution_bins,
            "sample_paths": sample_paths,
            "percentiles": percentiles
        }
