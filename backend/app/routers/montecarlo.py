import numpy as np
from fastapi import APIRouter
from app.schemas import MonteCarloRequest, MonteCarloResponse
from app.services.monte_carlo_engine import MonteCarloEngine

router = APIRouter(prefix="/api/montecarlo", tags=["Monte Carlo"])
mc_engine = MonteCarloEngine()

@router.post("/simulate", response_model=MonteCarloResponse)
def simulate(request: MonteCarloRequest):
    np.random.seed(42)
    custom_params = None
    if request.custom_params:
        custom_params = {
            "mu": request.mu,
            "sigma": request.sigma,
            "S0": request.S0
        }
        
    result = mc_engine.simulate(
        n_simulations=request.n_simulations,
        horizon_days=request.horizon_days,
        alpha=request.alpha,
        custom_params=custom_params
    )
    
    return MonteCarloResponse(**result)
