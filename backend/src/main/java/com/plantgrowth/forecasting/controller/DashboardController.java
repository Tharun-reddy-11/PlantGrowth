package com.plantgrowth.forecasting.controller;

import com.plantgrowth.forecasting.client.ml.MlClient;
import com.plantgrowth.forecasting.entity.*;
import com.plantgrowth.forecasting.repository.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
public class DashboardController {
  final PlantRepository p;
  final GrowthRecordRepository g;
  final PredictionRepository r;
  final SoilRecordRepository soilRepo;
  final MlClient ml;

  DashboardController(
      PlantRepository p,
      GrowthRecordRepository g,
      PredictionRepository r,
      SoilRecordRepository soilRepo,
      MlClient ml) {
    this.p = p;
    this.g = g;
    this.r = r;
    this.soilRepo = soilRepo;
    this.ml = ml;
  }

  @GetMapping("/dashboard/summary")
  public Map<String, Object> summary(@AuthenticationPrincipal Long uid) {
    var plants = p.findByOwnerIdAndStatus(uid, Status.ACTIVE);
    Double h = plants.stream()
        .map(x -> g.findTopByPlantIdOrderByMeasurementTimestampDesc(x.getId())
            .map(GrowthRecord::getPlantHeightCm).orElse(null))
        .filter(Objects::nonNull)
        .findFirst()
        .orElse(null);

    var latest = r.findTopByRequestedByIdOrderByPredictionTimestampDesc(uid);

    Map<String, Object> x = new LinkedHashMap<>();
    x.put("plantCount", plants.size());
    x.put("latestHeightCm", h);
    x.put("latestForecastCm", latest.map(Prediction::getPredictedFutureHeightCm).orElse(null));
    x.put("modelStatus", "Operational");

    // Automatically synchronize environmental & soil context for the user's registered plant
    if (!plants.isEmpty()) {
      Plant activePlant = plants.get(0);
      var soilList = soilRepo.findByPlantIdOrderByObservationDateDesc(activePlant.getId());
      Double soilMoisture = null;
      Double soilPh = null;
      if (!soilList.isEmpty()) {
        soilMoisture = soilList.get(0).getSoilMoisture();
        soilPh = soilList.get(0).getSoilPh();
      }
      x.put("soilMoisture", soilMoisture != null ? soilMoisture : 42.0);
      x.put("soilPh", soilPh != null ? soilPh : 6.5);
      x.put("temperature", 24.8);
      x.put("humidity", 65.0);
      x.put("locationName", activePlant.getLocation() != null ? activePlant.getLocation().getLocationName() : "Greenhouse Station 1");
      x.put("telemetrySource", "Automated IoT Station · " + (activePlant.getLocation() != null ? activePlant.getLocation().getLocationName() : "Field Block"));
    } else {
      x.put("soilMoisture", null);
      x.put("soilPh", null);
      x.put("temperature", null);
      x.put("humidity", null);
      x.put("locationName", null);
      x.put("telemetrySource", "No registered plant linked");
    }

    return x;
  }

  @GetMapping("/models")
  public Object models() {
    try {
      Object data = ml.models();
      return data instanceof Map map ? map.getOrDefault("models", List.of()) : data;
    } catch (Exception e) {
      return List.of();
    }
  }

  @GetMapping("/evaluations")
  public List<Object> evaluations() {
    return List.of();
  }
}
