# Source assessment

The workspace includes greenhouse weather and fruit/biomass measurements, plus soil estimates. The supplied aggregate growth file has no usable plant-height target (`plant_height_cm` is blank and annotated as absent). It therefore supports ingestion/schema validation but not an empirical claim about seven-day height accuracy. Do not use it to fabricate daily plant heights.

The optional weather connector fetches NASA POWER Daily data only after a location and date interval are supplied, recording its source and units. It does not relabel solar radiation as lux or infer soil moisture.
