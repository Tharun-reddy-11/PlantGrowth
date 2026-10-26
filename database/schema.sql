CREATE DATABASE IF NOT EXISTS plant_growth_forecasting CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE plant_growth_forecasting;

CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, full_name VARCHAR(120) NOT NULL, email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL, role ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER', active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE growing_locations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, location_name VARCHAR(160) NOT NULL, latitude DECIMAL(10,7) NULL, longitude DECIMAL(10,7) NULL,
  location_description TEXT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE plants (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, owner_user_id BIGINT NOT NULL, plant_code VARCHAR(80) NOT NULL, plant_name VARCHAR(120) NOT NULL,
  species VARCHAR(160) NULL, planting_date DATE NULL, image_url VARCHAR(500) NULL, location_id BIGINT NOT NULL, status ENUM('ACTIVE','ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_plant_owner_code UNIQUE(owner_user_id, plant_code), CONSTRAINT fk_plant_owner FOREIGN KEY(owner_user_id) REFERENCES users(id),
  CONSTRAINT fk_plant_location FOREIGN KEY(location_id) REFERENCES growing_locations(id)
);
CREATE TABLE soil_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, location_id BIGINT NOT NULL, plant_id BIGINT NULL, observation_date DATE NULL,
  soil_ph DECIMAL(4,2) NULL, soil_moisture DECIMAL(6,2) NULL, nitrogen DECIMAL(10,3) NULL, phosphorus DECIMAL(10,3) NULL,
  potassium DECIMAL(10,3) NULL, organic_carbon DECIMAL(10,3) NULL, clay_percentage DECIMAL(5,2) NULL, sand_percentage DECIMAL(5,2) NULL,
  silt_percentage DECIMAL(5,2) NULL, source VARCHAR(255) NOT NULL, depth_range VARCHAR(80) NULL,
  quality_status ENUM('VALID','WARNING','REJECTED','UNKNOWN') NOT NULL DEFAULT 'UNKNOWN', created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(location_id) REFERENCES growing_locations(id), FOREIGN KEY(plant_id) REFERENCES plants(id), INDEX ix_soil_location_date(location_id, observation_date)
);
CREATE TABLE environmental_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, location_id BIGINT NOT NULL, observation_timestamp DATETIME NOT NULL,
  air_temperature_c DECIMAL(6,2) NULL, relative_humidity_percent DECIMAL(6,2) NULL, precipitation_mm DECIMAL(8,2) NULL,
  solar_radiation DECIMAL(10,3) NULL, light_intensity_lux DECIMAL(12,2) NULL, soil_moisture_percent DECIMAL(6,2) NULL,
  source VARCHAR(255) NOT NULL, quality_status ENUM('VALID','WARNING','REJECTED','UNKNOWN') NOT NULL DEFAULT 'UNKNOWN', created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(location_id) REFERENCES growing_locations(id), UNIQUE KEY uq_environment_time(location_id, observation_timestamp), INDEX ix_environment_location_time(location_id, observation_timestamp)
);
CREATE TABLE growth_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, plant_id BIGINT NOT NULL, measurement_timestamp DATETIME NOT NULL, plant_height_cm DECIMAL(10,3) NOT NULL,
  growth_stage VARCHAR(100) NULL, measurement_method VARCHAR(160) NOT NULL, source VARCHAR(255) NOT NULL,
  quality_status ENUM('VALID','WARNING','REJECTED','UNKNOWN') NOT NULL DEFAULT 'UNKNOWN', created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(plant_id) REFERENCES plants(id), UNIQUE KEY uq_growth_time(plant_id, measurement_timestamp), INDEX ix_growth_plant_time(plant_id, measurement_timestamp)
);
CREATE TABLE dataset_imports (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, user_id BIGINT NOT NULL, file_name VARCHAR(255) NOT NULL, dataset_type ENUM('SOIL','ENVIRONMENT','GROWTH') NOT NULL,
  source_name VARCHAR(255) NULL, total_rows INT NOT NULL DEFAULT 0, accepted_rows INT NOT NULL DEFAULT 0, rejected_rows INT NOT NULL DEFAULT 0,
  status ENUM('PENDING','PROCESSING','COMPLETED','FAILED') NOT NULL, validation_summary JSON NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, completed_at TIMESTAMP NULL,
  FOREIGN KEY(user_id) REFERENCES users(id), INDEX ix_import_user_time(user_id, created_at)
);
CREATE TABLE model_versions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, model_name VARCHAR(80) NOT NULL, model_version VARCHAR(100) NOT NULL, target_type ENUM('FUTURE_HEIGHT','GROWTH_AMOUNT') NOT NULL,
  forecast_horizon_days INT NOT NULL, artifact_reference VARCHAR(500) NOT NULL, training_dataset_version VARCHAR(100) NOT NULL,
  feature_pipeline_version VARCHAR(100) NOT NULL, trained_at DATETIME NOT NULL, evaluation_status ENUM('NOT_EVALUATED','COMPLETED','FAILED') NOT NULL,
  training_metadata_json JSON NULL, active BOOLEAN NOT NULL DEFAULT FALSE, UNIQUE KEY uq_model_version(model_name, model_version, target_type, forecast_horizon_days)
);
CREATE TABLE model_evaluations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, model_version_id BIGINT NOT NULL, split_name VARCHAR(30) NOT NULL, target_type ENUM('FUTURE_HEIGHT','GROWTH_AMOUNT') NOT NULL,
  forecast_horizon_days INT NOT NULL, mae DECIMAL(12,5) NULL, rmse DECIMAL(12,5) NULL, r2 DECIMAL(12,5) NULL, sample_count INT NOT NULL,
  start_date DATE NULL, end_date DATE NULL, evaluation_details_json JSON NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(model_version_id) REFERENCES model_versions(id)
);
CREATE TABLE predictions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, plant_id BIGINT NOT NULL, requested_by_user_id BIGINT NOT NULL, prediction_timestamp DATETIME NOT NULL,
  forecast_origin_timestamp DATETIME NOT NULL, forecast_horizon_days INT NOT NULL, target_type ENUM('FUTURE_HEIGHT','GROWTH_AMOUNT') NOT NULL,
  current_height_cm DECIMAL(10,3) NULL, predicted_future_height_cm DECIMAL(10,3) NULL, predicted_growth_cm DECIMAL(10,3) NULL,
  model_name VARCHAR(80) NOT NULL, model_version VARCHAR(100) NOT NULL, feature_pipeline_version VARCHAR(100) NOT NULL,
  shap_explanation_json JSON NULL, input_snapshot_json JSON NOT NULL, data_quality_status VARCHAR(30) NOT NULL,
  actual_future_height_cm DECIMAL(10,3) NULL, absolute_error_cm DECIMAL(10,3) NULL, status ENUM('COMPLETED','FAILED','AWAITING_ACTUAL') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(plant_id) REFERENCES plants(id), FOREIGN KEY(requested_by_user_id) REFERENCES users(id),
  INDEX ix_prediction_plant_time(plant_id, prediction_timestamp)
);
CREATE TABLE refresh_tokens (id BIGINT PRIMARY KEY AUTO_INCREMENT, user_id BIGINT NOT NULL, token_hash VARCHAR(255) NOT NULL UNIQUE, expires_at DATETIME NOT NULL, revoked_at DATETIME NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(user_id) REFERENCES users(id));
CREATE TABLE training_jobs (id BIGINT PRIMARY KEY AUTO_INCREMENT, requested_by_user_id BIGINT NULL, job_id VARCHAR(80) NOT NULL UNIQUE, status VARCHAR(30) NOT NULL, logs_summary TEXT NULL, result_metadata_json JSON NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, completed_at TIMESTAMP NULL, FOREIGN KEY(requested_by_user_id) REFERENCES users(id));
