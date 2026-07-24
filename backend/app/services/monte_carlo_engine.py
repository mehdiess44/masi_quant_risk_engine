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
        else:
            try:
                from app.data_pipeline import load_full_data
                df = load_full_data()
                if not df.empty:
                    if 'log_return' not in df.columns:
                        df['log_return'] = np.log(df['Close'] / df['Close'].shift(1))
                    recent = df['log_return'].tail(252).dropna()
                    if len(recent) > 0:
                        mu = float(np.mean(recent))
                        sigma = float(np.std(recent, ddof=1))
                    s0 = float(df['Close'].iloc[-1])
            except ImportError:
                pass
                
        if sigma <= 0:
            raise ValueError("La volatilité doit être strictement positive")
            
        # Les paramètres mu et sigma sont quotidiens, donc dt = 1 pas quotidien
        dt = 1.0
        
        # Mouvement Brownien Géométrique vectorisé (multi-step)
        # Z de dimension (horizon_days, n_simulations)
        Z = np.random.standard_normal((horizon_days, n_simulations))
        drift = (mu - 0.5 * sigma**2) * dt
        daily_log_returns = drift + sigma * np.sqrt(dt) * Z
        
        # Cumul des rendements sur l'horizon
        cumulative_log_returns = np.cumsum(daily_log_returns, axis=0)
        
        # Prix final S_T
        S_T = s0 * np.exp(cumulative_log_returns[-1])
        
        # Calcul VaR et ES sur les log-rendements cumulatifs finaux (espace log-normal)
        final_log_returns = cumulative_log_returns[-1]
        sorted_returns = np.sort(final_log_returns)
        var_index = int(n_simulations * alpha)
        
        # VaR = percentile alpha des log-rendements (négatif)
        var_pct = sorted_returns[var_index]
        # ES = moyenne des rendements pires que la VaR
        es_pct = np.mean(sorted_returns[:var_index])
        
        # En valeur absolue (montant basé sur S0)
        # Note: on utilise np.exp pour repasser en arithmétique pour le montant monétaire si besoin,
        # mais la VaR absolue est classiquement S0 * (1 - exp(var_pct)) ou S0 * var_pct pour de petits pourcentages.
        # On garde S0 * (exp(var_pct) - 1) pour être exact mathématiquement.
        var_value = s0 * (np.exp(var_pct) - 1)
        es_value = s0 * (np.exp(es_pct) - 1)
        
        # Downsampling à EXACTEMENT 200 trajectoires pour le front-end
        # On renvoie des trajectoires complètes de (horizon_days + 1) points
        step = max(1, n_simulations // 200)
        sampled_indices = np.arange(0, n_simulations, step)[:200]
        
        sample_paths = []
        for i in sampled_indices:
            # Trajectoire: S0 puis S0 * exp(cum_returns)
            path = [float(s0)] + (s0 * np.exp(cumulative_log_returns[:, i])).tolist()
            sample_paths.append(path)
            
        # Histogramme pré-agrégé (60 bins)
        counts, bin_edges = np.histogram(final_log_returns, bins=60)
        distribution_bins = [
            {"bin_start": float(bin_edges[i]), "bin_end": float(bin_edges[i+1]), "count": int(counts[i])}
            for i in range(len(counts))
        ]
        
        # Percentiles sur les log-rendements
        percentiles = {
            "p1": float(np.percentile(final_log_returns, 1)),
            "p5": float(np.percentile(final_log_returns, 5)),
            "p10": float(np.percentile(final_log_returns, 10)),
            "p50": float(np.percentile(final_log_returns, 50)),
            "p90": float(np.percentile(final_log_returns, 90)),
            "p95": float(np.percentile(final_log_returns, 95)),
            "p99": float(np.percentile(final_log_returns, 99))
        }
        
        return {
            "var": float(var_value),
            "es": float(es_value),
            "var_pct": float(np.exp(var_pct) - 1),  # Conversion en arithmétique pour affichage UI
            "es_pct": float(np.exp(es_pct) - 1),
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
