"""Bounded offline trainer. Never treats blank height columns as labels."""
from __future__ import annotations
import argparse, json
from pathlib import Path
import joblib, pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.feature_selection import SelectFromModel
from sklearn.ensemble import ExtraTreesRegressor, GradientBoostingRegressor, RandomForestRegressor, AdaBoostRegressor
from sklearn.linear_model import LinearRegression
from sklearn.svm import SVR
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor
from app.config import settings
from app.preprocessing.pipeline import build_examples, chronological_split, TABULAR_FEATURES

def score(y, p): return {"mae":float(mean_absolute_error(y,p)),"rmse":float(mean_squared_error(y,p)**.5),"r2":None if len(y)<2 else float(r2_score(y,p)),"sample_count":len(y)}
def main():
 p=argparse.ArgumentParser(); p.add_argument('--growth-csv',required=True); p.add_argument('--horizon',type=int,default=7); p.add_argument('--version',default=settings.model_version); a=p.parse_args()
 frame=pd.read_csv(a.growth_csv); examples,_=build_examples(frame,a.horizon,settings.target_alignment_tolerance_days,settings.sequence_length); splits=chronological_split(examples)
 xtr=splits['train'][TABULAR_FEATURES]; ytr=splits['train'].target_future_height
 pre=ColumnTransformer([('numeric',Pipeline([('impute',SimpleImputer(strategy='median')),('scale',StandardScaler())]),TABULAR_FEATURES)])
 fitted=pre.fit(xtr); selector=SelectFromModel(RandomForestRegressor(n_estimators=250,random_state=42), threshold='median').fit(fitted.transform(xtr),ytr)
 selected=[f for f,keep in zip(TABULAR_FEATURES,selector.get_support()) if keep] or TABULAR_FEATURES
 # Selection was trained only on train; models use same selected feature order.
 manifest_path=settings.artifact_dir/'manifest.json'
 existing=json.loads(manifest_path.read_text(encoding='utf-8')).get('models',[]) if manifest_path.exists() else []
 registry=[entry for entry in existing if entry.get('horizon_days') != a.horizon]
 model_specs = [
  ('xgboost', XGBRegressor(n_estimators=300, max_depth=4, learning_rate=.04, random_state=42, n_jobs=1)),
  ('random_forest', RandomForestRegressor(n_estimators=180, random_state=42, n_jobs=-1)),
  ('adaboost', AdaBoostRegressor(n_estimators=100, random_state=42)),
  ('linear_regression', LinearRegression()),
  ('svr', SVR(C=1.0, epsilon=0.2)),
  ('extra_trees', ExtraTreesRegressor(n_estimators=180, random_state=42, n_jobs=-1)),
  ('gradient_boosting', GradientBoostingRegressor(n_estimators=250, random_state=42, learning_rate=.04, max_depth=3)),
 ]
 for name, estimator in model_specs:
   pp=Pipeline([('impute',SimpleImputer(strategy='median')),('scale',StandardScaler())]).fit(splits['train'][selected])
   estimator.fit(pp.transform(splits['train'][selected]),ytr)
   test=splits['test']; metrics=score(test.target_future_height,estimator.predict(pp.transform(test[selected])))
   filename=f'{name}_{a.version}_{a.horizon}d.joblib'; joblib.dump({'estimator':estimator,'preprocessor':pp,'selected_features':selected},settings.artifact_dir/filename)
   registry.append({'model_name':name,'model_version':a.version,'target_type':'FUTURE_HEIGHT','horizon_days':a.horizon,'artifact':filename,'pipeline_version':'tabular-v1','sequence_length':settings.sequence_length,'evaluation_status':'COMPLETED','metrics':metrics})
 manifest_path.write_text(json.dumps({'models':registry,'dataset_rows':len(examples),'dataset_origin':'SIMULATED_DEMO_ONLY'},indent=2),encoding='utf-8')
 print(json.dumps({'trained':len(registry),'examples':len(examples),'test': [x['metrics'] for x in registry]},indent=2))
if __name__=='__main__': main()
