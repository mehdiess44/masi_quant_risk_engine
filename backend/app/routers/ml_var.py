from fastapi import APIRouter, Request, HTTPException
from app.schemas import MLVarPredictionsResponse, FeatureImportanceResponse

router = APIRouter(prefix="/api/ml", tags=["Machine Learning"])

@router.get("/var-predictions", response_model=MLVarPredictionsResponse)
def get_var_predictions(request: Request):
    ml_engine = request.app.state.ml_engine
    if not ml_engine:
        raise HTTPException(status_code=500, detail="MLEngine not initialized")
        
    predictions = ml_engine.predict_test_set()
    
    if not predictions:
        raise HTTPException(status_code=404, detail="No predictions available")
        
    total_preds = len(predictions)
    violations = sum(1 for p in predictions if p['is_violation'])
    
    return MLVarPredictionsResponse(
        model_name="LightGBM Quantile Regression",
        quantile=0.05,
        total_predictions=total_preds,
        violation_count=violations,
        violation_rate=violations / total_preds if total_preds > 0 else 0.0,
        start_date=predictions[0]['date'],
        end_date=predictions[-1]['date'],
        predictions=predictions
    )

@router.get("/feature-importance", response_model=FeatureImportanceResponse)
def get_feature_importance(request: Request):
    ml_engine = request.app.state.ml_engine
    if not ml_engine:
        raise HTTPException(status_code=500, detail="MLEngine not initialized")
        
    features = ml_engine.get_feature_importance()
    
    return FeatureImportanceResponse(
        model_name="LightGBM Quantile Regression",
        features=features
    )
