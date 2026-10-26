# Plant Growth Forecasting

Research-oriented, end-to-end foundation for a React → Spring Boot → MySQL → FastAPI plant-height forecasting workflow.

## Windows local setup

1. Verify tools in PowerShell:
   ```powershell
   java -version
   mvn -version
   node --version
   npm --version
   py -3.11 --version
   mysql --version
   ```
2. In MySQL Workbench, open and run [database/schema.sql](D:/Projects/PlantGrowth/database/schema.sql). Create a non-production DB user and edit local environment values from [backend/.env.example](D:/Projects/PlantGrowth/backend/.env.example); never commit it.
3. ML service (requires a real Python 3.11 installation—this machine's `python` alias is unavailable):
   ```powershell
   cd D:\Projects\PlantGrowth\ml-service
   py -3.11 -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   Copy-Item .env.example .env
   uvicorn app.main:app --reload --port 8000
   ```
   Verify `http://localhost:8000/health`. It correctly reports `ready:false` until trained artifacts exist.
4. Backend:
   ```powershell
   cd D:\Projects\PlantGrowth\backend
   $env:DB_HOST='localhost'; $env:DB_PORT='3306'; $env:DB_NAME='plant_growth_forecasting'
   $env:DB_USERNAME='YOUR_LOCAL_DB_USER'; $env:DB_PASSWORD='YOUR_LOCAL_DB_PASSWORD'
   $env:JWT_SECRET='replace-with-a-unique-local-secret-longer-than-32-characters'
   mvn spring-boot:run
   ```
5. Frontend:
   ```powershell
   cd D:\Projects\PlantGrowth\frontend
   Copy-Item .env.example .env
   npm install
   npm run dev
   ```

## Training gate

Do not run the trainer against the supplied aggregate file: it has no height labels. After importing a real CSV with `plant_code,measurement_timestamp,plant_height_cm`, run:

```powershell
cd D:\Projects\PlantGrowth\ml-service
.\.venv\Scripts\Activate.ps1
python -m training.run_pipeline --growth-csv ..\datasets\raw\height_measurements.csv --horizon 7
```

Then restart FastAPI and use `/models` to check exact artifact status. No forecast is fabricated if a requested model/horizon is unavailable.

## Current implementation boundary

The project foundation, secure registration/login, ownership-protected plants and growth records, artifact-gated ML request path, database schema, and responsive frontend are implemented and compiled. The remaining research models (GRU, LSTM, validation-stacked fusion), CSV import audit, soil/environment CRUD, model evaluation persistence, admin workflow and comprehensive tests need a valid repeated-height source before they can be honestly completed and tested. They must not be represented as completed results until such data is supplied.
