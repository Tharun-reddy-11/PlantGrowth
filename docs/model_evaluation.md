# Evaluation report

No experimental evaluation is available yet: the supplied data has no repeat plant-height target. The pipeline emits MAE, RMSE, sample count and guarded R² only after it receives a qualifying height dataset. It saves those values in `ml-service/artifacts/manifest.json`; the backend should subsequently ingest them into `model_versions` and `model_evaluations` for the UI.
