from typing import List, Optional
from datetime import date
from pydantic import BaseModel, ConfigDict, Field


class MASIDataPoint(BaseModel):
    model_config = ConfigDict(strict=True)

    date: date
    open: float = Field(..., description="Daily opening price")
    high: float = Field(..., description="Daily high price")
    low: float = Field(..., description="Daily low price")
    close: float = Field(..., description="Daily closing price")
    log_return: float = Field(..., description="Daily log return")
    return_lag_1: Optional[float] = None
    return_lag_2: Optional[float] = None
    return_lag_3: Optional[float] = None
    return_lag_4: Optional[float] = None
    return_lag_5: Optional[float] = None
    volatility_10d: Optional[float] = None
    volatility_20d: Optional[float] = None
    volatility_60d: Optional[float] = None


class MASIHistoryResponse(BaseModel):
    model_config = ConfigDict(strict=True)

    total_records: int
    start_date: date
    end_date: date
    data: List[MASIDataPoint]


class MASISummaryResponse(BaseModel):
    model_config = ConfigDict(strict=True)

    last_close: float
    mean_return: float
    annualized_return: float
    max_drawdown: float
    volatilities: dict[str, float] = Field(
        ..., description="Dictionary of volatilities (e.g., {'10d': 0.01, '20d': 0.015})"
    )
