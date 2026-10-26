from __future__ import annotations
import uuid, numpy as np, pandas as pd
from app.schemas import PredictRequest, PredictResponse, ShapContribution
from app.services.registry import load
from app.preprocessing.pipeline import TABULAR_FEATURES

def _feature_row(request: PredictRequest):
    history = sorted(request.historical_growth, key=lambda x: x.timestamp)
    current, prior = history[-1], history[-2]
    interval = max((current.timestamp-prior.timestamp).total_seconds()/86400, 1e-6)
    env = [e for e in request.environmental_data if e.timestamp <= request.forecast_origin_timestamp]
    soils = request.soil_data
    def avg(attr):
        v=[getattr(x, attr) for x in env if getattr(x, attr) is not None]; return float(np.mean(v)) if v else np.nan
    def summ(attr):
        v=[getattr(x, attr) for x in env if getattr(x, attr) is not None]; return float(np.sum(v)) if v else np.nan
    soil = soils[-1] if soils else None
    values = {"current_height_cm":current.plant_height_cm,"height_lag_1":prior.plant_height_cm,"growth_rate_cm_per_day":(current.plant_height_cm-prior.plant_height_cm)/interval,
        "days_since_planting_proxy":len(history)-1,"temperature_mean":avg("air_temperature_c"),"humidity_mean":avg("relative_humidity_percent"),"precipitation_sum":summ("precipitation_mm"),"solar_radiation_mean":avg("solar_radiation")}
    for name in ["soil_ph","soil_moisture","nitrogen","phosphorus","potassium"]: values[name]=getattr(soil,name,None) if soil else np.nan
    return pd.DataFrame([values], columns=TABULAR_FEATURES)

def predict(request: PredictRequest) -> PredictResponse:
    entry, bundle = load(request.model_name, request.target_type.value, request.forecast_horizon_days)
    row = _feature_row(request)
    estimator = bundle["estimator"]; preprocessor = bundle["preprocessor"]; selected = bundle["selected_features"]
    x = preprocessor.transform(row[selected]); result = float(estimator.predict(x)[0])
    current = float(row.iloc[0].current_height_cm)
    prediction = result if request.target_type.value == "FUTURE_HEIGHT" else result
    warnings=[]
    if len(request.historical_growth) < entry.get("sequence_length",2): warnings.append("History is shorter than the configured temporal sequence; selected model must be a tabular artifact.")
    contributions=[]
    if hasattr(estimator, "feature_importances_"):
        raw_vals = [float(v) for v in estimator.feature_importances_]
        total = sum(raw_vals) if sum(raw_vals) > 0 else 1.0
        contributions = [
            ShapContribution(
                feature=f,
                value=None if pd.isna(row.iloc[0][f]) else float(row.iloc[0][f]),
                contribution=float(round(v / total, 4))
            )
            for f, v in zip(selected, raw_vals)
        ]
    elif hasattr(estimator, "coef_"):
        raw_vals = [float(abs(v)) for v in np.atleast_1d(estimator.coef_)]
        total = sum(raw_vals) if sum(raw_vals) > 0 else 1.0
        contributions = [
            ShapContribution(
                feature=f,
                value=None if pd.isna(row.iloc[0][f]) else float(row.iloc[0][f]),
                contribution=float(round(v / total, 4))
            )
            for f, v in zip(selected, raw_vals)
        ]
    else:
        # Sensitivity-based attribution for kernel estimators (e.g., SVR)
        base_pred = float(result)
        diffs = []
        for col in selected:
            perturbed = row.copy()
            val = perturbed.iloc[0][col]
            perturbed.iloc[0, perturbed.columns.get_loc(col)] = (val * 1.08) if (val is not None and not pd.isna(val) and val != 0) else 1.0
            try:
                xp = preprocessor.transform(perturbed[selected])
                diff = abs(float(estimator.predict(xp)[0]) - base_pred)
            except Exception:
                diff = 0.05
            diffs.append(max(diff, 1e-4))
        total = sum(diffs) if sum(diffs) > 0 else 1.0
        contributions = [
            ShapContribution(
                feature=f,
                value=None if pd.isna(row.iloc[0][f]) else float(row.iloc[0][f]),
                contribution=float(round(d / total, 4))
            )
            for f, d in zip(selected, diffs)
        ]
    if contributions:
        contributions.sort(key=lambda c: abs(c.contribution), reverse=True)
    return PredictResponse(prediction_identifier=str(uuid.uuid4()), predicted_target=prediction, current_height_cm=current,
      forecast_horizon_days=request.forecast_horizon_days,target_type=request.target_type,model_name=entry["model_name"],model_version=entry["model_version"],feature_pipeline_version=entry["pipeline_version"], data_quality_status="WARNING" if warnings else "VALID",shap_explanation=contributions,warnings=warnings)
