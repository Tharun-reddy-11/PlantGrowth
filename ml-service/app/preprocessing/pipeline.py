"""Leakage-safe feature construction shared by training and inference."""
from __future__ import annotations
import pandas as pd
import numpy as np

TABULAR_FEATURES = ["current_height_cm", "height_lag_1", "growth_rate_cm_per_day", "days_since_planting_proxy", "temperature_mean", "humidity_mean", "precipitation_sum", "solar_radiation_mean", "soil_ph", "soil_moisture", "nitrogen", "phosphorus", "potassium"]
SEQUENCE_FEATURES = ["plant_height_cm", "temperature", "humidity", "precipitation", "solar_radiation", "soil_moisture"]

def require_height_training_frame(frame: pd.DataFrame) -> None:
    missing = {"plant_code", "measurement_timestamp", "plant_height_cm"} - set(frame.columns)
    if missing: raise ValueError(f"growth data missing required columns: {sorted(missing)}")
    if frame["plant_height_cm"].dropna().empty: raise ValueError("No plant-height labels are available; training is blocked.")

def build_examples(frame: pd.DataFrame, horizon_days: int, tolerance_days: int, sequence_length: int):
    """Build origin-only features; future measurements are used only as labels."""
    require_height_training_frame(frame)
    data = frame.copy()
    data["measurement_timestamp"] = pd.to_datetime(data["measurement_timestamp"], utc=True)
    data = data.sort_values(["plant_code", "measurement_timestamp"])
    records = []
    sequences = []
    for plant, group in data.groupby("plant_code", sort=False):
        group = group.reset_index(drop=True)
        for i in range(sequence_length - 1, len(group)):
            origin = group.iloc[i]
            target_time = origin.measurement_timestamp + pd.Timedelta(days=horizon_days)
            candidates = group.iloc[i + 1:].copy()
            candidates["delta"] = (candidates.measurement_timestamp - target_time).abs()
            candidates = candidates[candidates.delta <= pd.Timedelta(days=tolerance_days)]
            if candidates.empty: continue
            target = candidates.sort_values("delta").iloc[0]
            previous = group.iloc[i - 1]
            window = group.iloc[i-sequence_length+1:i+1]
            interval = max((origin.measurement_timestamp - previous.measurement_timestamp).total_seconds()/86400, 1e-6)
            rec = {"plant_code": plant, "origin_timestamp": origin.measurement_timestamp, "target_timestamp": target.measurement_timestamp,
                   "target_future_height": float(target.plant_height_cm), "current_height_cm": float(origin.plant_height_cm),
                   "height_lag_1": float(previous.plant_height_cm), "growth_rate_cm_per_day": (float(origin.plant_height_cm)-float(previous.plant_height_cm))/interval,
                   "days_since_planting_proxy": i}
            for col, out, agg in [("air_temperature_c","temperature_mean","mean"),("relative_humidity_percent","humidity_mean","mean"),("precipitation_mm","precipitation_sum","sum"),("solar_radiation","solar_radiation_mean","mean")]:
                rec[out] = float(window[col].agg(agg)) if col in window and window[col].notna().any() else np.nan
            for col in ["soil_ph","soil_moisture","nitrogen","phosphorus","potassium"]:
                rec[col] = float(origin[col]) if col in origin and pd.notna(origin[col]) else np.nan
            seq = pd.DataFrame({"plant_height_cm": window.plant_height_cm})
            for source, output in [("air_temperature_c","temperature"),("relative_humidity_percent","humidity"),("precipitation_mm","precipitation"),("solar_radiation","solar_radiation"),("soil_moisture","soil_moisture")]:
                seq[output] = window[source].values if source in window else np.nan
            records.append(rec); sequences.append(seq[SEQUENCE_FEATURES].to_numpy(dtype=float))
    return pd.DataFrame(records), np.array(sequences, dtype=float)

def chronological_split(examples: pd.DataFrame):
    ordered = examples.sort_values("origin_timestamp").reset_index(drop=True)
    n = len(ordered)
    if n < 10: raise ValueError("Need at least 10 valid chronological examples for split")
    train_end, validation_end = max(1, int(n*.70)), max(2, int(n*.85))
    return {"train": ordered.iloc[:train_end], "validation": ordered.iloc[train_end:validation_end], "test": ordered.iloc[validation_end:]}
