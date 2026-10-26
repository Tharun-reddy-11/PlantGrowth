# API contract

All timestamps are ISO-8601 UTC strings and height units are centimetres.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create USER account |
| POST | `/api/auth/login` | Public | Return short-lived access token |
| GET | `/api/users/me` | User | Current profile |
| GET/POST | `/api/plants` | User | List/create owned plants |
| GET/PUT/DELETE | `/api/plants/{id}` | Owner | Read/edit/archive plant |
| GET/POST | `/api/plants/{id}/growth-records` | Owner | Growth data |
| GET/POST | `/api/plants/{id}/soil-records` | Owner | Soil data |
| GET/POST | `/api/plants/{id}/environmental-records` | Owner | Location environmental data |
| POST | `/api/datasets/import` | User | Validated CSV import |
| GET | `/api/datasets/imports` | User | Import audit |
| POST | `/api/predictions` | Owner | ML forecast |
| GET | `/api/predictions`, `/api/predictions/{id}` | Owner | Stored forecasts |
| POST | `/api/predictions/{id}/actual-measurement` | Owner | Record actual future height |
| GET | `/api/models`, `/api/evaluations` | User | Artifact/evaluation status |
| GET | `/api/dashboard/summary` | User | Dashboard summary |
| GET | `/api/admin/*` | Admin | Administration |

Prediction request:
```json
{"plantId": 1, "targetType": "FUTURE_HEIGHT", "forecastHorizonDays": 7, "modelName": "fusion"}
```

Error envelope: `{"timestamp":"...","status":422,"code":"INSUFFICIENT_HISTORY","message":"...","fieldErrors":{}}`.
