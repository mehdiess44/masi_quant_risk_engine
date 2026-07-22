import os
import numpy as np
import lightgbm as lgb
from app.data_pipeline import load_test_data, compute_ml_features

class MLEngine:
    def __init__(self):
        self.booster = self._load_model()
        self.features_order = [
            'return_lag_1', 'return_lag_2', 'return_lag_3', 'return_lag_5',
            'Dist_SMA_20', 'Amplitude_Intraday', 'EWMA_Vol_10d', 'EWMA_Vol_20d'
        ]

    def _load_model(self):
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
        model_path = os.path.join(base_dir, 'app', 'models', 'moteur_var_v3.txt')
        if not os.path.exists(model_path):
            model_path = os.path.join(os.getcwd(), 'app', 'models', 'moteur_var_v3.txt')
            
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Modèle LightGBM introuvable: {model_path}")
            
        booster = lgb.Booster(model_file=model_path)
        return booster

    def predict_test_set(self):
        # Charge et prépare les données de test
        df_raw = load_test_data()
        df_features = compute_ml_features(df_raw)
        
        # Extrait les features dans le bon ordre
        X_test = df_features[self.features_order]
        
        # Prédiction LightGBM
        preds = self.booster.predict(X_test)
        
        # Force les prédictions VaR à être non-positives
        var_predictions = np.minimum(preds, 0.0)
        
        # On a besoin des dates et rendements actuels correspondants
        dates = df_features['Date'].tolist()
        actual_returns = df_features['log_return'].tolist()
        
        results = []
        for i in range(len(dates)):
            is_violation = bool(actual_returns[i] < var_predictions[i])
            results.append({
                "date": dates[i],
                "actual_return": float(actual_returns[i]),
                "var_predicted": float(var_predictions[i]),
                "is_violation": is_violation
            })
            
        return results

    def get_feature_importance(self):
        # Extract feature importance by gain
        importance = self.booster.feature_importance(importance_type='gain')
        feature_names = self.booster.feature_name()
        
        # Si le modèle ne contient pas les noms de features, on utilise self.features_order
        if not feature_names or len(feature_names) != len(self.features_order):
            feature_names = self.features_order
            
        # Trier par ordre décroissant
        features = [{"feature_name": name, "importance": float(imp)} for name, imp in zip(feature_names, importance)]
        features.sort(key=lambda x: x["importance"], reverse=True)
        
        # Assigner le rang
        for i, feat in enumerate(features):
            feat["rank"] = i + 1
            
        return features
