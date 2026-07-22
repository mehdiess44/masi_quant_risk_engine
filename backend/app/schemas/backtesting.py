from typing import List
from datetime import date
from pydantic import BaseModel, ConfigDict, Field


class HitSequenceEntry(BaseModel):
    model_config = ConfigDict(strict=True)

    date: date
    actual_return: float
    var_threshold: float
    es_threshold: float
    is_violation: bool


class KupiecTestResult(BaseModel):
    model_config = ConfigDict(strict=True)

    N: int = Field(..., description="Total number of observations")
    x: int = Field(..., description="Number of exceptions (hits)")
    p: float = Field(..., description="Expected failure rate (alpha)")
    p_hat: float = Field(..., description="Observed failure rate (x/N)")
    LR_statistic: float = Field(..., description="Likelihood Ratio test statistic")
    p_value: float = Field(..., description="p-value of the test")
    critical_value: float = Field(..., description="Chi-square critical value at 95% confidence")
    reject_H0: bool = Field(..., description="True if model is rejected (p_value < 0.05)")
    verdict: str = Field(..., description="Human-readable verdict")


class BacktestingResponse(BaseModel):
    model_config = ConfigDict(strict=True)

    model: str
    alpha: float
    kupiec: KupiecTestResult
    hit_sequence: List[HitSequenceEntry]


class BacktestingComparisonResponse(BaseModel):
    model_config = ConfigDict(strict=True)

    alpha: float
    mc: KupiecTestResult
    ml: KupiecTestResult
    best_model: str = Field(..., description="Name of the model that performs best ('MC' or 'ML')")
