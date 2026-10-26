from fastapi import APIRouter, HTTPException
from app.schemas import PredictRequest
from app.services.registry import manifest, ArtifactUnavailable
from app.services.prediction import predict
router=APIRouter()
@router.get('/health')
def health(): return {"status":"ok", "artifact_count":len(manifest().get("models", [])), "ready":bool(manifest().get("models", []))}
@router.get('/models')
def models(): return manifest()
@router.post('/predict')
def prediction(request: PredictRequest):
    try: return predict(request)
    except ArtifactUnavailable as exc: raise HTTPException(409, detail=str(exc))
    except ValueError as exc: raise HTTPException(422, detail=str(exc))
@router.post('/explain')
def explain(request: PredictRequest): return prediction(request)
@router.post('/train', status_code=501)
def train(): raise HTTPException(501, detail="Run the bounded training pipeline from an authorized backend job runner.")
@router.post('/evaluate', status_code=501)
def evaluate(): raise HTTPException(501, detail="Run evaluation through training/run_pipeline.py; results are artifact-backed.")
@router.get('/training-jobs/{job_id}', status_code=404)
def job(job_id: str): raise HTTPException(404, detail="No ML job store is configured in this standalone service.")
