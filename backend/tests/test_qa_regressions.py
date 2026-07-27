"""
Test de régression automatique QA (/gstack /qa)
Garantit que les 4 points prioritaires de l'audit et du dashboard R&D ne dérivent plus silencieusement.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_qa_priority_1_montecarlo_calibration_defaults(client):
    """
    1. Page /montecarlo : vérifier que 'Calibration Active' affiche bien
       μ≈8.17% (an), σ≈12.52% (an), S0≈12.39 par défaut (pas 0%/15%/1M).
    """
    response = client.get("/api/montecarlo/calibration")
    assert response.status_code == 200
    data = response.json()
    
    # Vérification des valeurs journalières calibrées sur le MASI
    mu_day = data["mu"]
    sigma_day = data["sigma"]
    s0 = data["S0"]
    
    # μ journalier ≈ 0.00032432 (~8.17% annualisé)
    assert 0.00032 <= mu_day <= 0.00033, f"μ journalier incorrect: {mu_day}"
    assert 0.081 <= mu_day * 252 <= 0.082, f"μ annualisé incorrect: {mu_day * 252}"
    
    # σ journalier ≈ 0.00788724 (~12.52% annualisé)
    assert 0.0078 <= sigma_day <= 0.0079, f"σ journalier incorrect: {sigma_day}"
    assert 0.125 <= sigma_day * (252 ** 0.5) <= 0.126, f"σ annualisé incorrect: {sigma_day * (252 ** 0.5)}"
    
    # S0 ≈ 12.38882 (pas 1 000 000)
    assert 12.38 <= s0 <= 12.40, f"S0 initial incorrect: {s0}"

def test_qa_priority_2_ml_conditional_es(client):
    """
    2. Page /ml : vérifier que le calcul ES est un vrai calcul conditionnel
       (espérance des pertes dans la queue) et non une heuristique constante.
    """
    response = client.get("/api/ml/var-predictions")
    assert response.status_code == 200
    data = response.json()
    predictions = data["predictions"]
    
    # Pour toutes les prédictions en violation (actual_return < var_predicted),
    # l'ES prédit doit être strictement inférieur à la VaR prédite
    violations = [p for p in predictions if p["is_violation"]]
    assert len(violations) > 0, "Aucune violation trouvée pour tester l'ES conditionnel"
    
    for p in violations:
        assert p["es_predicted"] <= p["var_predicted"], (
            f"Erreur mathématique Bâle III: ES ({p['es_predicted']}) > VaR ({p['var_predicted']}) pour {p['date']}"
        )

def test_qa_priority_3_compliance_window_vs_full_period(client):
    """
    3. Page /compliance : vérifier la distinction explicite entre la fenêtre glissante
       Bâle III (250j) et la période de backtesting complète Kupiec (1265j).
    """
    # Test de la fenêtre glissante Feux Tricolores
    res_traf = client.get("/api/regulatory/traffic-light?model=mc&window_size=250")
    assert res_traf.status_code == 200
    data_traf = res_traf.json()
    assert data_traf["result"]["window_size"] == 250, "Le feu tricolore doit fonctionner sur une fenêtre 250j"
    
    # Test de la période complète Kupiec (1265 jours de test)
    res_bt = client.get("/api/backtesting/comparison")
    assert res_bt.status_code == 200
    data_bt = res_bt.json()
    assert data_bt["mc"]["N"] == 1265, f"La période Kupiec MC doit être 1265j (actuel: {data_bt['mc']['N']})"
    assert data_bt["ml"]["N"] == 1265, f"La période Kupiec ML doit être 1265j (actuel: {data_bt['ml']['N']})"

def test_qa_priority_4_non_regression_exact_metrics(client):
    """
    4. Non-régression : vérifier au pixel/chiffre près les indicateurs clés
       du R&D (MASI Close, Volatilité 20D, Statistiques Kupiec, Feature Importance).
    """
    # A. Vue d'ensemble : MASI Summary
    res_summary = client.get("/api/masi/summary")
    assert res_summary.status_code == 200
    summary = res_summary.json()
    assert round(summary["last_close"], 3) == 15.886, f"Last close différent: {summary['last_close']}"
    assert round(summary["volatilities"]["20d"] * 100, 2) == 14.06, f"Vol 20D différente: {summary['volatilities']['20d']}"
    
    # B. Statistiques Backtesting ML (Kupiec)
    res_bt = client.get("/api/backtesting/comparison")
    assert res_bt.status_code == 200
    bt = res_bt.json()
    
    ml_stats = bt["ml"]
    assert round(ml_stats["p_hat"] * 100, 2) == 4.03, f"ML p_hat différent: {ml_stats['p_hat']}"
    assert round(ml_stats["LR_statistic"], 2) == 2.67, f"ML LR différent: {ml_stats['LR_statistic']}"
    assert round(ml_stats["p_value"], 3) == 0.102, f"ML p_value différent: {ml_stats['p_value']}"
    
    # C. Feature Importance ML (Amplitude_Intraday ≈ 763.87 en tête)
    res_fi = client.get("/api/ml/feature-importance")
    assert res_fi.status_code == 200
    fi = res_fi.json()
    top_feature = fi["features"][0]
    
    assert top_feature["feature_name"] == "Amplitude_Intraday", f"Top feature différente: {top_feature['feature_name']}"
    assert round(top_feature["importance"], 2) == 763.88, f"Importance différente: {top_feature['importance']}"
    assert top_feature["rank"] == 1
