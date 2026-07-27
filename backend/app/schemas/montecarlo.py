from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, model_validator


class MonteCarloRequest(BaseModel):
    model_config = ConfigDict(strict=True)

    n_simulations: int = Field(default=10_000, ge=10_000, le=500_000)
    horizon_days: int = Field(default=252, ge=1, le=2520)
    alpha: float = Field(default=0.05, gt=0.0001, le=0.50)
    
    custom_params: bool = Field(default=False, description="Set to True to override mu, sigma, S0")
    mu: Optional[float] = None
    sigma: Optional[float] = Field(None, gt=0)
    S0: Optional[float] = Field(None, gt=0)
    seed: Optional[int] = Field(default=42, description="Seed de simulation. Mettre 42 pour le Mode Audit (reproductible), ou None pour une simulation libre.")

    @model_validator(mode='after')
    def check_custom_params(self) -> 'MonteCarloRequest':
        if self.custom_params:
            if self.mu is None or self.sigma is None or self.S0 is None:
                raise ValueError("mu, sigma, and S0 must be provided when custom_params is True")
        return self


class DistributionBin(BaseModel):
    model_config = ConfigDict(strict=True)

    bin_start: float
    bin_end: float
    count: int


class MonteCarloResponse(BaseModel):
    model_config = ConfigDict(strict=True)

    var: float
    es: float
    var_pct: float
    es_pct: float
    
    mu: float
    sigma: float
    S0: float
    
    n_simulations: int
    horizon_days: int
    alpha: float
    
    distribution_bins: List[DistributionBin]
    sample_paths: List[List[float]] = Field(..., description="Subset of Monte Carlo paths for visualization")
    percentiles: dict[str, float] = Field(..., description="Percentiles of the final distribution (e.g., P1, P5, P50)")
