import pytest
from fastapi.testclient import TestClient
from app.main import app

# Utilisation d'une fixture pour le client afin de s'assurer que le lifespan est executé (chargement LightGBM)
@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_masi_summary(client):
    response = client.get("/api/masi/summary")
    assert response.status_code == 200
    data = response.json()
    assert "last_close" in data
    assert "mean_return" in data
    assert "annualized_return" in data
    assert "max_drawdown" in data
    assert "volatilities" in data
    assert "10d" in data["volatilities"]

def test_montecarlo_simulate_valid(client):
    payload = {
        "n_simulations": 10000,
        "horizon_days": 1,
        "alpha": 0.05
    }
    response = client.post("/api/montecarlo/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["var"] < 0
    assert data["es"] < 0
    assert len(data["sample_paths"]) == 200

def test_montecarlo_simulate_invalid_validation(client):
    payload = {
        "n_simulations": 500, # Sous le minimum de 10000 requis par le schema
        "horizon_days": 1,
        "alpha": 0.05
    }
    response = client.post("/api/montecarlo/simulate", json=payload)
    assert response.status_code == 422 # Unprocessable Entity
    error_data = response.json()
    assert "detail" in error_data

def test_ml_var_predictions(client):
    response = client.get("/api/ml/var-predictions")
    assert response.status_code == 200
    data = response.json()
    assert "predictions" in data
    # Le dataset de test clean doit contenir 1265 prédictions (moins les NaNs qui ont été drop par le calcul des features, donc ~1246)
    assert len(data["predictions"]) > 1000
    # Vérifie que la VaR prédite est bien <= 0
    assert all(p["var_predicted"] <= 0 for p in data["predictions"])

def test_backtesting_comparison(client):
    response = client.get("/api/backtesting/comparison")
    assert response.status_code == 200
    data = response.json()
    assert "mc" in data
    assert "ml" in data
    assert "best_model" in data
    assert data["best_model"] in ["MC", "ML"]

def test_regulatory_traffic_light(client):
    response = client.get("/api/regulatory/traffic-light?model=ml")
    assert response.status_code == 200
    data = response.json()
    assert "result" in data
    result = data["result"]
    assert result["zone"] in ["VERTE", "JAUNE", "ROUGE"]
    assert result["model"] == "ML"
