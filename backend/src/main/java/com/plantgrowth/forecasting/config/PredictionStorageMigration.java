package com.plantgrowth.forecasting.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/** Expands legacy local columns so audited prediction payloads are never truncated. */
@Component
public class PredictionStorageMigration implements ApplicationRunner {
  private final JdbcTemplate jdbc;

  public PredictionStorageMigration(JdbcTemplate jdbc) { this.jdbc = jdbc; }

  @Override public void run(ApplicationArguments arguments) {
    jdbc.execute("ALTER TABLE predictions MODIFY COLUMN input_snapshot_json LONGTEXT NULL");
    jdbc.execute("ALTER TABLE predictions MODIFY COLUMN shap_explanation_json LONGTEXT NULL");
  }
}
