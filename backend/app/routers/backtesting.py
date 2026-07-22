from fastapi import APIRouter, Request, Query, HTTPException
from scipy.stats import norm
from app.schemas import BacktestingResponse, BacktestingComparisonResponse
from app.services.backtesting_engine import BacktestingEngine
from app.data_pipeline import load_test_data

router = APIRouter(prefix="/api/backtesting", tags=["Backtesting"])
bt_engine = BacktestingEngine()

def get_mc_var_predictions(alpha: float):
    df = load_test_data()
    # Utilisation de la méthode paramétrique (EWMA_Vol_20d ou volatilité classique) comme proxy
    # pour la VaR historique Monte Carlo si non pré-calculée.
    z_score = norm.ppf(alpha)
    if 'EWMA_Vol_20d' in df.columns:
        vol = df['EWMA_Vol_20d']
    elif 'volatility_20d' in df.columns:
        vol = df['volatility_20d']
    else:
        vol = df['log_return'].rolling(20).std()
        
    var_preds = vol * z_score
    return df['log_return'].tolist(), var_preds.fillna(0).tolist(), df['Date'].tolist()

@router.get("/kupiec", response_model=BacktestingResponse)
def get_kupiec_test(request: Request, model: str = Query("ml", pattern="^(mc|ml)$"), alpha: float = 0.05):
    if model == "ml":
        ml_engine = request.app.state.ml_engine
        if not ml_engine:
            raise HTTPException(status_code=500, detail="MLEngine not initialized")
        preds = ml_engine.predict_test_set()
        returns = [p['actual_return'] for p in preds]
        vars_pred = [p['var_predicted'] for p in preds]
        dates = [p['date'] for p in preds]
    else:
        returns, vars_pred, dates = get_mc_var_predictions(alpha)
        
    res = bt_engine.kupiec_test(returns, vars_pred, alpha)
    
    hit_sequence = []
    for i in range(len(dates)):
        hit_sequence.append({
            "date": dates[i],
            "actual_return": float(returns[i]),
            "var_threshold": float(vars_pred[i]),
            "es_threshold": float(vars_pred[i]) * 1.25, # approximation ES
            "is_violation": bool(res['hit_sequence_bools'][i])
        })
        
    return BacktestingResponse(
        model=model.upper(),
        alpha=alpha,
        kupiec=res,
        hit_sequence=hit_sequence
    )

@router.get("/comparison", response_model=BacktestingComparisonResponse)
def get_comparison(request: Request, alpha: float = 0.05):
    # ML
    ml_engine = request.app.state.ml_engine
    if not ml_engine:
        raise HTTPException(status_code=500, detail="MLEngine not initialized")
    preds = ml_engine.predict_test_set()
    ml_returns = [p['actual_return'] for p in preds]
    ml_vars = [p['var_predicted'] for p in preds]
    ml_res = bt_engine.kupiec_test(ml_returns, ml_vars, alpha)
    
    # MC
    mc_returns, mc_vars, _ = get_mc_var_predictions(alpha)
    mc_res = bt_engine.kupiec_test(mc_returns, mc_vars, alpha)
    
    # Best model logic: closer to target p_hat or better p-value
    ml_diff = abs(ml_res['p_hat'] - alpha)
    mc_diff = abs(mc_res['p_hat'] - alpha)
    best_model = "ML" if ml_diff <= mc_diff else "MC"
    
    return BacktestingComparisonResponse(
        alpha=alpha,
        mc=mc_res,
        ml=ml_res,
        best_model=best_model
    )
