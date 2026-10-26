# Dataset intake

The supplied `Dataset_1_Plant_Growth_Historical.csv` explicitly records that `plant_height_cm` is not provided. It is retained as a source for environmental and fruit/biomass measurements, but cannot train or validate a plant-height forecaster. The training pipeline refuses to run until a CSV containing repeated, timestamped `plant_code` and `plant_height_cm` values is imported.

Expected CSVs (ISO timestamps preferred):

| Type | Required columns |
|---|---|
| Growth | `plant_code,measurement_timestamp,plant_height_cm` |
| Environment | `location_name,observation_timestamp,air_temperature_c,relative_humidity_percent,precipitation_mm,solar_radiation` |
| Soil | `location_name,observation_date,soil_ph` plus whichever optional soil values are known |

Raw files stay unchanged. Derived datasets and reports are versioned outputs under `processed/` and `reports/`. Missing values remain null; the fitted training pipeline determines imputation solely from the training period.

## Local demonstration data

`demo_simulated_plant_height_training.csv` is generated locally by
`ml-service/training/create_demo_growth_dataset.py`. It is **simulated demo
data**, not field research data and not evidence of agricultural performance.
It provides labelled, repeated plant-height records only so the full local
application can demonstrate training, predictions, evaluation and model
visualisation. Replace it with documented field measurements before making any
real-world claim or decision.
