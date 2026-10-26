# Architecture

```mermaid
flowchart LR
  R[React + Vite] -->|JWT REST /api| B[Spring Boot]
  B -->|JPA| DB[(MySQL 8)]
  B -->|validated internal HTTP| M[FastAPI ML service]
  M --> A[Versioned preprocessing + model artifacts]
  M --> D[Versioned processed dataset]
  W[Daily Weather API / imports] --> B
```

The React app never calls FastAPI directly. Spring Boot is the authorization boundary and persists all prediction inputs, model metadata, outputs, and explanations. The ML service rejects missing artifacts rather than generating a fallback forecast.

## Core relationships

```mermaid
erDiagram
 USERS ||--o{ PLANTS : owns
 GROWING_LOCATIONS ||--o{ PLANTS : hosts
 PLANTS ||--o{ GROWTH_RECORDS : measures
 PLANTS ||--o{ SOIL_RECORDS : may_have
 GROWING_LOCATIONS ||--o{ SOIL_RECORDS : describes
 GROWING_LOCATIONS ||--o{ ENVIRONMENTAL_RECORDS : records
 PLANTS ||--o{ PREDICTIONS : forecasts
 USERS ||--o{ PREDICTIONS : requests
 MODEL_VERSIONS ||--o{ MODEL_EVALUATIONS : evaluated_as
```

The primary research target is `FUTURE_HEIGHT` in cm. A training example at origin *t* targets the first measurement in the configured tolerance near *t + horizon*; examples without a valid target are excluded rather than invented.
