from typing import Literal
from pydantic import BaseModel, ConfigDict


class TrafficLightResult(BaseModel):
    model_config = ConfigDict(strict=True)

    model: str
    zone: Literal['VERTE', 'JAUNE', 'ROUGE']
    n_exceptions: int
    window_size: int
    green_threshold: int
    yellow_threshold: int
    capital_multiplier: float
    alpha: float


class TrafficLightResponse(BaseModel):
    model_config = ConfigDict(strict=True)

    result: TrafficLightResult
