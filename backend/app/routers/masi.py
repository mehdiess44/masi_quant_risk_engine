from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from datetime import date
from app.schemas import MASIHistoryResponse, MASISummaryResponse, MASIDataPoint
from app.data_pipeline import load_full_data, get_market_summary

router = APIRouter(prefix="/api/masi", tags=["MASI Data"])

@router.get("/history", response_model=MASIHistoryResponse)
def get_history(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)")
):
    df = load_full_data()
    if df.empty:
        raise HTTPException(status_code=404, detail="Data not found")
        
    if start_date:
        df = df[df['Date'] >= start_date]
    if end_date:
        df = df[df['Date'] <= end_date]
        
    records = []
    for _, row in df.iterrows():
        records.append(MASIDataPoint(
            date=row['Date'],
            close=float(row['Close']),
            log_return=float(row['log_return']) if 'log_return' in row and not type(row['log_return']) == str else 0.0,
            return_lag_1=float(row['return_lag_1']) if 'return_lag_1' in row else None,
            return_lag_2=float(row['return_lag_2']) if 'return_lag_2' in row else None,
            return_lag_3=float(row['return_lag_3']) if 'return_lag_3' in row else None,
            return_lag_4=float(row['return_lag_4']) if 'return_lag_4' in row else None,
            return_lag_5=float(row['return_lag_5']) if 'return_lag_5' in row else None,
            volatility_10d=float(row['volatility_10d']) if 'volatility_10d' in row else None,
            volatility_20d=float(row['volatility_20d']) if 'volatility_20d' in row else None,
            volatility_60d=float(row['volatility_60d']) if 'volatility_60d' in row else None,
        ))
        
    return MASIHistoryResponse(
        total_records=len(records),
        start_date=records[0].date if records else date.today(),
        end_date=records[-1].date if records else date.today(),
        data=records
    )

@router.get("/summary", response_model=MASISummaryResponse)
def get_summary():
    summary = get_market_summary()
    if not summary:
        raise HTTPException(status_code=404, detail="Data not found")
    return MASISummaryResponse(**summary)
