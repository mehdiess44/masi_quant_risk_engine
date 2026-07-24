from fastapi import APIRouter, Request, Query, HTTPException
from scipy.stats import norm
from app.schemas import BacktestingResponse, BacktestingComparisonResponse
from app.services.backtesting_engine import BacktestingEngine
from app.data_pipeline import load_test_data, load_eval_test_data, load_pure_test_data
import numpy as np

router = APIRouter(prefix="/api/backtesting", tags=["Backtesting"])
bt_engine = BacktestingEngine()

def get_mc_var_predictions(alpha: float):
    df_eval_test = load_eval_test_data()
    df_test = load_pure_test_data()
    
    dates = df_test['Date'].tolist()
    actual_returns = df_test['log_return'].tolist()
    
    var_preds = []
    es_preds = []
    
    FENETRE_GLISSANTE = 252
    N_TRAJECTOIRES_BT = 10000
    
    # Fixer la seed pour assurer la reproductibilité stricte du backtest par rapport au notebook
    # Wait, the seed here makes the Monte Carlo backtest strictly deterministic.
    # We will keep it here since it's for backtesting and reproducibility is good.
    np.random.seed(42)
    
    for target_date in dates:
        # Fenêtre stricte du passé
        fenetre_data = df_eval_test[df_eval_test['Date'] < target_date].tail(FENETRE_GLISSANTE)
        
        if len(fenetre_data) < FENETRE_GLISSANTE:
            var_preds.append(0.0)
            es_preds.append(0.0)
            continue
            
        rendements_fenetre = fenetre_data['log_return'].dropna()
        mu_dyn = np.mean(rendements_fenetre)
        sigma_dyn = np.std(rendements_fenetre, ddof=1)
        
        # Moteur Monte Carlo pour T=1
        Z = np.random.standard_normal(N_TRAJECTOIRES_BT)
        terme_drift = mu_dyn - (0.5 * sigma_dyn**2)
        rendements_simules_T1 = terme_drift + (sigma_dyn * Z)
        
        # La VaR est le percentile (négatif) de la distribution simulée
        var_pred = np.percentile(rendements_simules_T1, alpha * 100)
        var_preds.append(float(var_pred))
        
        # L'ES est la moyenne conditionnelle
        es_pred = np.mean(rendements_simules_T1[rendements_simules_T1 <= var_pred])
        es_preds.append(float(es_pred))
        
    return actual_returns, var_preds, es_preds, dates

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
        returns, vars_pred, es_preds, dates = get_mc_var_predictions(alpha)
        
    res = bt_engine.kupiec_test(returns, vars_pred, alpha)
    
    hit_sequence = []
    for i in range(len(dates)):
        hit_sequence.append({
            "date": dates[i],
            "actual_return": float(returns[i]),
            "var_threshold": float(vars_pred[i]),
            "es_threshold": float(es_preds[i]) if model == "mc" else float(vars_pred[i]) * 1.25,
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
    mc_returns, mc_vars, mc_es, _ = get_mc_var_predictions(alpha)
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
