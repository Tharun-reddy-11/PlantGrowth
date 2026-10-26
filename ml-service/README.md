# ML service

Start: `python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt; uvicorn app.main:app --reload --port 8000`.

Train only with a real height dataset: `python -m training.run_pipeline --growth-csv ..\datasets\raw\height_measurements.csv --horizon 7`. The supplied aggregate file is rejected because its height target is blank. The trainer currently produces leakage-safe tabular Random Forest and XGBoost artifacts; GRU/LSTM/fusion remain unavailable until a dataset has sufficient per-plant sequences and are reported as not trained, never simulated.
