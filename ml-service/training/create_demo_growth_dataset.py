"""Create a labelled *simulated* growth dataset for local product demonstration.

This data is deliberately separate from field data.  It exists so GrowBot can
be started end-to-end before a grower imports real repeated measurements.
"""
from __future__ import annotations

from pathlib import Path
import numpy as np
import pandas as pd


def main() -> None:
    rng = np.random.default_rng(20261021)
    rows = []
    start = pd.Timestamp("2026-01-01", tz="UTC")
    for plant_number in range(1, 25):
        plant_code = f"DEMO-{plant_number:03d}"
        initial = rng.uniform(4.5, 8.0)
        vigor = rng.uniform(0.10, 0.22)
        soil_ph = rng.uniform(6.1, 7.0)
        for day in range(120):
            temperature = 24 + 5 * np.sin(day / 13) + rng.normal(0, 1.1)
            humidity = 65 + 12 * np.cos(day / 17) + rng.normal(0, 3)
            moisture = 48 + 10 * np.sin(day / 9 + plant_number) + rng.normal(0, 2)
            radiation = max(8, 19 + 5 * np.sin(day / 11) + rng.normal(0, 1))
            rain = max(0, rng.gamma(1.4, 1.1) - 0.7)
            nutrient_effect = 0.018 * (rng.uniform(45, 75) + rng.uniform(25, 50) + rng.uniform(35, 65)) / 3
            climate_effect = 0.028 * max(0, 1 - abs(temperature - 26) / 12) + 0.018 * max(0, 1 - abs(moisture - 55) / 35)
            height = initial + day * (vigor + climate_effect + nutrient_effect) + 0.012 * day ** 1.18 + rng.normal(0, 0.18)
            rows.append({
                "plant_code": plant_code,
                "measurement_timestamp": (start + pd.Timedelta(days=day)).isoformat(),
                "plant_height_cm": round(max(0.5, height), 3),
                "air_temperature_c": round(temperature, 2),
                "relative_humidity_percent": round(np.clip(humidity, 25, 98), 2),
                "precipitation_mm": round(rain, 2),
                "solar_radiation": round(radiation, 2),
                "soil_ph": round(soil_ph, 2),
                "soil_moisture": round(np.clip(moisture, 15, 90), 2),
                "nitrogen": round(rng.uniform(45, 75), 2),
                "phosphorus": round(rng.uniform(25, 50), 2),
                "potassium": round(rng.uniform(35, 65), 2),
                "data_origin": "SIMULATED_DEMO_ONLY",
            })
    output = Path(__file__).resolve().parents[2] / "datasets" / "demo_simulated_plant_height_training.csv"
    pd.DataFrame(rows).to_csv(output, index=False)
    print(f"Wrote {len(rows)} simulated rows to {output}")


if __name__ == "__main__":
    main()
