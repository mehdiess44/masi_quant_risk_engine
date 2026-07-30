import numpy as np
from fastapi import APIRouter
from app.schemas import MonteCarloRequest, MonteCarloResponse
from app.services.monte_carlo_engine import MonteCarloEngine

router = APIRouter(prefix="/api/montecarlo", tags=["Monte Carlo"])
mc_engine = MonteCarloEngine()

@router.get("/calibration")
def get_calibration():
    return {
        "mu": mc_engine.default_mu,
        "sigma": mc_engine.default_sigma,
        "S0": mc_engine.default_s0,
        "n_simulations": getattr(mc_engine, 'default_n_simulations', 100000),
        "horizon_days": getattr(mc_engine, 'default_horizon', 1),
        "alpha": getattr(mc_engine, 'default_alpha', 0.05)
    }

@router.post("/simulate", response_model=MonteCarloResponse)
def simulate(request: MonteCarloRequest):
    # Générateur aléatoire LOCAL thread-safe (au lieu de np.random.seed() global)
    rng = np.random.default_rng(request.seed)
    
    custom_params = None
    if request.custom_params and request.mu is not None and request.sigma is not None and request.S0 is not None:
        custom_params = {
            "mu": request.mu,
            "sigma": request.sigma,
            "S0": request.S0
        }
        
    result = mc_engine.simulate(
        n_simulations=request.n_simulations or getattr(mc_engine, 'default_n_simulations', 100000),
        horizon_days=request.horizon_days or getattr(mc_engine, 'default_horizon', 1),
        alpha=request.alpha or getattr(mc_engine, 'default_alpha', 0.05),
        custom_params=custom_params,
        rng=rng
    )
    
    return MonteCarloResponse(**result)
