from __future__ import annotations
import json
from pathlib import Path
import joblib
from app.config import settings

class ArtifactUnavailable(Exception): pass

def manifest_path(): return settings.artifact_dir / "manifest.json"
def manifest():
    if not manifest_path().exists(): return {"models": []}
    return json.loads(manifest_path().read_text(encoding="utf-8"))
def get_entry(model_name: str, target_type: str, horizon: int):
    for item in manifest().get("models", []):
        if item["model_name"] == model_name and item["target_type"] == target_type and item["horizon_days"] == horizon:
            return item
    raise ArtifactUnavailable(f"No trained artifact for {model_name}/{target_type}/{horizon} days")
def load(model_name, target_type, horizon):
    item = get_entry(model_name, target_type, horizon)
    return item, joblib.load(settings.artifact_dir / item["artifact"])
