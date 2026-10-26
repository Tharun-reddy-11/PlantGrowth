from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    artifact_dir: Path = Path("artifacts")
    dataset_dir: Path = Path("../datasets")
    model_version: str = "1.0.0"
    max_forecast_horizon_days: int = 7
    sequence_length: int = 5
    target_alignment_tolerance_days: int = 2
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
settings.artifact_dir.mkdir(parents=True, exist_ok=True)
