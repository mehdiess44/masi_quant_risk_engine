from fastapi import APIRouter, Request, Query, HTTPException
from app.schemas import TrafficLightResponse
from app.services.regulatory_engine import RegulatoryEngine
from app.services.backtesting_engine import BacktestingEngine
from app.data_pipeline import load_test_data
from scipy.stats import norm

router = APIRouter(prefix="/api/regulatory", tags=["Regulatory (Basel III)"])
reg_engine = RegulatoryEngine()
bt_engine = BacktestingEngine()

@router.get("/traffic-light", response_model=TrafficLightResponse)
def get_traffic_light(request: Request, model: str = Query("ml", pattern="^(mc|ml)$"), window_size: int = 250, alpha: float = 0.01):
    if model == "ml":
        ml_engine = request.app.state.ml_engine
        if not ml_engine:
            raise HTTPException(status_code=500, detail="MLEngine not initialized")
        preds = ml_engine.predict_test_set()
        # On extrait la fenêtre glissante la plus récente (window_size)
        preds = preds[-window_size:]
        returns = [p['actual_return'] for p in preds]
        vars_pred = [p['var_predicted'] for p in preds]
    else:
        df = load_test_data().tail(window_size)
        returns = df['log_return'].tolist()
        z_score = norm.ppf(alpha)
        if 'EWMA_Vol_20d' in df.columns:
            vars_pred = (df['EWMA_Vol_20d'] * z_score).fillna(0).tolist()
        else:
            vars_pred = (df['volatility_20d'] * z_score).fillna(0).tolist()
            
    res = bt_engine.kupiec_test(returns, vars_pred, alpha)
    exceptions = res['x']
    
    tl_res = reg_engine.classify_traffic_light(exceptions, window_size, alpha)
    tl_res['model'] = model.upper()
    
    return TrafficLightResponse(result=tl_res)
