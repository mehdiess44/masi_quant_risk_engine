from typing import List
from datetime import date
from pydantic import BaseModel, ConfigDict, Field


class MLVarPrediction(BaseModel):
    model_config = ConfigDict(strict=True)

    date: date
    actual_return: float
    var_predicted: float = Field(..., le=0, description="Predicted VaR is always non-positive")
    es_predicted: float = Field(..., le=0, description="Predicted ES conditionnel is non-positive")
    is_violation: bool


class MLVarPredictionsResponse(BaseModel):
    model_config = ConfigDict(strict=True)

    model_name: str
    quantile: float
    total_predictions: int
    violation_count: int
    violation_rate: float
    start_date: date
    end_date: date
    predictions: List[MLVarPrediction]


class FeatureImportance(BaseModel):
    model_config = ConfigDict(strict=True)

    feature_name: str
    importance: float
    rank: int


class FeatureImportanceResponse(BaseModel):
    model_config = ConfigDict(strict=True)

    model_name: str
    features: List[FeatureImportance]
