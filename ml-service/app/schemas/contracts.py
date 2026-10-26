from datetime import datetime, date
from enum import Enum
from pydantic import BaseModel, Field, field_validator

class TargetType(str, Enum): FUTURE_HEIGHT = "FUTURE_HEIGHT"; GROWTH_AMOUNT = "GROWTH_AMOUNT"
class GrowthObservation(BaseModel):
    timestamp: datetime
    plant_height_cm: float = Field(gt=0, le=10000)
class SoilObservation(BaseModel):
    observation_date: date | None = None
    soil_ph: float | None = Field(default=None, ge=0, le=14)
    soil_moisture: float | None = Field(default=None, ge=0, le=100)
    nitrogen: float | None = Field(default=None, ge=0)
    phosphorus: float | None = Field(default=None, ge=0)
    potassium: float | None = Field(default=None, ge=0)
class EnvironmentalObservation(BaseModel):
    timestamp: datetime
    air_temperature_c: float | None = Field(default=None, ge=-90, le=70)
    relative_humidity_percent: float | None = Field(default=None, ge=0, le=100)
    precipitation_mm: float | None = Field(default=None, ge=0)
    solar_radiation: float | None = Field(default=None, ge=0)
    soil_moisture_percent: float | None = Field(default=None, ge=0, le=100)
class PredictRequest(BaseModel):
    plant_identifier: str = Field(min_length=1, max_length=80)
    forecast_origin_timestamp: datetime
    target_type: TargetType = TargetType.FUTURE_HEIGHT
    forecast_horizon_days: int = Field(ge=1, le=365)
    model_name: str = "fusion"
    feature_pipeline_version: str | None = None
    historical_growth: list[GrowthObservation] = Field(min_length=2)
    soil_data: list[SoilObservation] = Field(default_factory=list)
    environmental_data: list[EnvironmentalObservation] = Field(default_factory=list)
    @field_validator("historical_growth")
    @classmethod
    def ordered(cls, values):
        if len({x.timestamp for x in values}) != len(values): raise ValueError("duplicate growth timestamps")
        return sorted(values, key=lambda x: x.timestamp)
class ShapContribution(BaseModel): feature: str; value: float | None = None; contribution: float
class PredictResponse(BaseModel):
    prediction_identifier: str; predicted_target: float; target_units: str = "cm"; current_height_cm: float
    forecast_horizon_days: int; target_type: TargetType; model_name: str; model_version: str; feature_pipeline_version: str
    data_quality_status: str; shap_explanation: list[ShapContribution] = []; warnings: list[str] = []
