# Research methodology and limitations

This system forecasts a future **plant height in centimetres** only when a matching trained model artifact exists. It does not diagnose disease, guarantee yield, or replace physical measurements. The illustrative 15.0 cm → 17.6 cm example is not a model result.

## Leakage controls

- Examples are ordered by forecast-origin timestamp: earliest 70% train, next 15% validation, newest 15% test.
- Imputation, scaling and adaptive feature selection fit only on training rows.
- A target must be a real measurement within the configured tolerance of `origin + horizon`; gaps produce no supervised example.
- Sequence windows are grouped by `plant_code` and never cross plants.

## Current supplied-data assessment

`Dataset_1_Plant_Growth_Historical.csv` contains weather and aggregate fruit/biomass information but its `plant_height_cm` is absent and explicitly annotated as not supplied. No performance numbers are reported and the service will not create an artifact from this file. Import genuine repeated height measurements to unlock evaluation.

## Base-paper distinction

The wearable FBG plant-growth monitoring paper measures stem elongation with an optical sensor. This software forecasts a later growth value from prior records and contextual soil/environment data; it neither reproduces that sensor's physical measurement nor claims to replace it.
