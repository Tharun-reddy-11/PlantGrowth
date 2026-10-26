package com.plantgrowth.forecasting.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "predictions")
public class Prediction {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "plant_id")
  private Plant plant;

  @ManyToOne
  @JoinColumn(name = "requested_by_user_id")
  private User requestedBy;

  @Column(name = "prediction_timestamp")
  private Instant predictionTimestamp = Instant.now();

  @Column(name = "forecast_origin_timestamp")
  private Instant forecastOriginTimestamp;

  @Column(name = "forecast_horizon_days")
  private Integer horizon;

  @Column(name = "target_type")
  private String targetType;

  @Column(name = "current_height_cm")
  private Double currentHeightCm;

  @Column(name = "predicted_future_height_cm")
  private Double predictedFutureHeightCm;

  @Column(name = "predicted_growth_cm")
  private Double predictedGrowthCm;

  @Column(name = "model_name")
  private String modelName;

  @Column(name = "model_version")
  private String modelVersion;

  @Column(name = "feature_pipeline_version")
  private String pipelineVersion;

  @Lob
  @Column(name = "shap_explanation_json", columnDefinition = "LONGTEXT")
  private String shapJson;

  @Lob
  @Column(name = "input_snapshot_json", columnDefinition = "LONGTEXT")
  private String inputJson;

  @Column(name = "data_quality_status")
  private String quality;

  private String status = "AWAITING_ACTUAL";

  @Column(name = "actual_future_height_cm")
  private Double actual;

  @Column(name = "absolute_error_cm")
  private Double error;

  public Long getId() { return id; }
  public Plant getPlant() { return plant; }
  public User getRequestedBy() { return requestedBy; }
  public Instant getPredictionTimestamp() { return predictionTimestamp; }
  public Instant getForecastOriginTimestamp() { return forecastOriginTimestamp; }
  public Integer getHorizon() { return horizon; }
  public String getTargetType() { return targetType; }
  public Double getCurrentHeightCm() { return currentHeightCm; }
  public Double getPredictedFutureHeightCm() { return predictedFutureHeightCm; }
  public Double getPredictedGrowthCm() { return predictedGrowthCm; }
  public String getModelName() { return modelName; }
  public String getModelVersion() { return modelVersion; }
  public String getPipelineVersion() { return pipelineVersion; }
  public String getShapJson() { return shapJson; }
  public String getInputJson() { return inputJson; }
  public String getQuality() { return quality; }
  public String getStatus() { return status; }
  public Double getActual() { return actual; }
  public Double getError() { return error; }

  public void setPlant(Plant x) { plant = x; }
  public void setRequestedBy(User x) { requestedBy = x; }
  public void setForecastOriginTimestamp(Instant x) { forecastOriginTimestamp = x; }
  public void setHorizon(Integer x) { horizon = x; }
  public void setTargetType(String x) { targetType = x; }
  public void setCurrentHeightCm(Double x) { currentHeightCm = x; }
  public void setPredictedFutureHeightCm(Double x) { predictedFutureHeightCm = x; }
  public void setPredictedGrowthCm(Double x) { predictedGrowthCm = x; }
  public void setModelName(String x) { modelName = x; }
  public void setModelVersion(String x) { modelVersion = x; }
  public void setPipelineVersion(String x) { pipelineVersion = x; }
  public void setShapJson(String x) { shapJson = x; }
  public void setInputJson(String x) { inputJson = x; }
  public void setQuality(String x) { quality = x; }

  public void recordActual(Double x) {
    actual = x;
    error = predictedFutureHeightCm == null ? null : Math.abs(x - predictedFutureHeightCm);
    status = "COMPLETED";
  }
}
