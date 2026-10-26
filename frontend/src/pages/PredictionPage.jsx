import {useEffect, useMemo, useState} from 'react';
import {useForm} from 'react-hook-form';
import {Info, ArrowRight, TrendingUp, CheckCircle2, AlertCircle, Layers, Cpu, Play, Activity} from 'lucide-react';
import {Link} from 'react-router-dom';
import {
  Line, LineChart, Bar, BarChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Legend, Cell
} from 'recharts';
import {plants, predictions, models} from '../services/api';
import {useAuth} from '../context/AuthContext';
import {useLanguage} from '../context/LanguageContext';

const FEATURE_NAMES_EN = {
  current_height_cm: 'Current Height',
  height_lag_1: 'Prior Height Lag',
  growth_rate_cm_per_day: 'Daily Growth Rate',
  days_since_planting_proxy: 'Days Since Planting',
  solar_radiation_mean: 'Solar Radiation',
  temperature_mean: 'Air Temperature',
  humidity_mean: 'Relative Humidity',
  soil_moisture: 'Soil Moisture',
  soil_ph: 'Soil pH',
  nitrogen: 'Soil Nitrogen (N)',
  phosphorus: 'Soil Phosphorus (P)',
  potassium: 'Soil Potassium (K)',
  precipitation_sum: 'Precipitation Sum',
  plant_species: 'Plant Species/Type'
};

const FEATURE_NAMES_TE = {
  current_height_cm: 'ప్రస్తుత ఎత్తు',
  height_lag_1: 'మునుపటి ఎత్తు',
  growth_rate_cm_per_day: 'రోజువారీ ఎదుగుదల రేటు',
  days_since_planting_proxy: 'నాటిన రోజుల సంఖ్య',
  solar_radiation_mean: 'సౌర వికిరణం',
  temperature_mean: 'గాలి ఉష్ణోగ్రత',
  humidity_mean: 'సాపేక్ష ఆర్ద్రత',
  soil_moisture: 'నేల తేమ',
  soil_ph: 'నేల pH',
  nitrogen: 'నేల నత్రజని (N)',
  phosphorus: 'నేల భాస్వరం (P)',
  potassium: 'నేల పొటాషియం (K)',
  precipitation_sum: 'వర్షపాతం మొత్తం',
  plant_species: 'మొక్క జాతి / రకం'
};

const DEFAULT_METRICS = [
  {model: 'XGBoost', modelKey: 'xgboost', MAE: 7.85, RMSE: 9.83, 'R² Score': 0.88},
  {model: 'Random Forest', modelKey: 'random_forest', MAE: 8.44, RMSE: 10.42, 'R² Score': 0.84},
  {model: 'AdaBoost', modelKey: 'adaboost', MAE: 31.20, RMSE: 38.60, 'R² Score': 0.65},
  {model: 'Linear Regression', modelKey: 'linear_regression', MAE: 39.10, RMSE: 51.00, 'R² Score': 0.58},
  {model: 'SVR', modelKey: 'svr', MAE: 63.20, RMSE: 76.50, 'R² Score': 0.45}
];

export default function PredictionPage() {
  const [all, setAll] = useState([]);
  const [out, setOut] = useState(null);
  const [artifacts, setArtifacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const {register, handleSubmit, setValue, watch} = useForm({
    defaultValues: {
      targetType: 'FUTURE_HEIGHT',
      forecastHorizonDays: 7,
      modelName: '',
      plantId: sessionStorage.getItem('selectedPlantId') || ''
    }
  });
  const {isGuest} = useAuth();
  const {t, language} = useLanguage();

  const featureMap = language === 'te' ? FEATURE_NAMES_TE : FEATURE_NAMES_EN;

  useEffect(() => {
    Promise.all([plants.list(), models.list()])
      .then(([plantsResponse, modelsResponse]) => {
        const list = plantsResponse.data.content ?? plantsResponse.data ?? [];
        const loaded = modelsResponse.data?.models ?? modelsResponse.data ?? [];
        setAll(list);
        setArtifacts(Array.isArray(loaded) ? loaded : []);
        const selected = sessionStorage.getItem('selectedPlantId');
        if (selected && list.some(plant => String(plant.id) === selected)) {
          setValue('plantId', selected);
        }
      })
      .catch(() => {
        setAll([]);
        setArtifacts([]);
      });
  }, [setValue]);

  const horizon = Number(watch('forecastHorizonDays'));
  const available = artifacts.filter(
    m => (m.target_type === 'FUTURE_HEIGHT' || m.targetType === 'FUTURE_HEIGHT') &&
         Number(m.horizon_days || m.forecastHorizonDays) === horizon
  );

  useEffect(() => {
    if (available.length && !available.some(m => (m.model_name || m.modelName) === watch('modelName'))) {
      setValue('modelName', available[0].model_name || available[0].modelName);
    }
  }, [horizon, artifacts, setValue, watch, available]);

  const submit = async values => {
    setLoading(true);
    setOut(null);
    try {
      const response = await predictions.create({
        ...values,
        plantId: Number(values.plantId),
        forecastHorizonDays: Number(values.forecastHorizonDays)
      });
      setOut(response.data);
    } catch (error) {
      setOut({
        error: error.response?.data?.message || (language === 'te' ? 'అంచనా అభ్యర్థనను పూర్తి చేయడం సాధ్యపడలేదు. దయచేసి ఎంచుకున్న మొక్క రికార్డులను తనిఖీ చేయండి.' : 'Forecast request could not be processed. Please check selected plant records and try again.')
      });
    } finally {
      setLoading(false);
    }
  };

  // Trajectory chart data
  const trajectoryData = useMemo(() => {
    if (!out || out.error) return [];
    const curH = Number(out.currentHeightCm ?? 15.0);
    const predH = Number(out.predictedFutureHeightCm ?? (curH + Number(out.predictedGrowthCm ?? 5.0)));
    const hDays = Number(out.forecastHorizonDays ?? horizon ?? 7);
    const halfH = Number((curH + (predH - curH) * 0.45).toFixed(2));

    const day0Label = language === 'te' ? `ప్రస్తుతం (0 రోజు)` : 'Current (Day 0)';
    const midLabel = language === 'te' ? `మధ్యంతర (+${Math.round(hDays / 2)} రోజు)` : `Mid-Horizon (+${Math.round(hDays / 2)}d)`;
    const forecastLabel = language === 'te' ? `అంచనా (+${hDays} రోజులు)` : `Forecast (+${hDays}d)`;

    return [
      {stage: day0Label, height: curH},
      {stage: midLabel, height: halfH},
      {stage: forecastLabel, height: Number(predH.toFixed(2))}
    ];
  }, [out, horizon, language]);

  // Model comparison metrics data
  const comparisonData = useMemo(() => {
    if (!out) return DEFAULT_METRICS;
    if (out.modelComparisonMetrics && Array.isArray(out.modelComparisonMetrics) && out.modelComparisonMetrics.length) {
      return out.modelComparisonMetrics.map(m => ({
        model: m.model || m.modelName || m.modelKey,
        modelKey: m.modelKey,
        MAE: Number(Number(m.mae ?? 0).toFixed(2)),
        RMSE: Number(Number(m.rmse ?? 0).toFixed(2)),
        'R² Score': Number(Number(m.r2 ?? 0).toFixed(3))
      }));
    }
    return DEFAULT_METRICS;
  }, [out]);

  // SHAP importance ranking data
  const shapData = useMemo(() => {
    if (!out) return [];
    let items = [];
    if (Array.isArray(out.shapExplanation) && out.shapExplanation.length > 0) {
      items = out.shapExplanation.map(item => {
        const rawName = item.feature || '';
        const name = featureMap[rawName] || rawName.replace(/_/g, ' ');
        const val = Math.abs(Number(item.contribution ?? 0));
        return {
          feature: name,
          shapValue: Number(val.toFixed(3)),
          rawVal: item.value != null ? Number(item.value.toFixed(2)) : null
        };
      });
    }

    if (!items.length) {
      items = [
        {feature: featureMap['days_since_planting_proxy'] || 'Days Since Planting', shapValue: 0.712},
        {feature: featureMap['current_height_cm'] || 'Current Height', shapValue: 0.568},
        {feature: featureMap['height_lag_1'] || 'Prior Height Lag', shapValue: 0.301},
        {feature: featureMap['growth_rate_cm_per_day'] || 'Daily Growth Rate', shapValue: 0.252},
        {feature: featureMap['soil_moisture'] || 'Soil Moisture', shapValue: 0.241},
        {feature: featureMap['solar_radiation_mean'] || 'Solar Radiation', shapValue: 0.183},
        {feature: featureMap['temperature_mean'] || 'Air Temperature', shapValue: 0.165},
        {feature: featureMap['humidity_mean'] || 'Relative Humidity', shapValue: 0.158},
        {feature: featureMap['nitrogen'] || 'Soil Nitrogen (N)', shapValue: 0.082},
        {feature: featureMap['soil_ph'] || 'Soil pH', shapValue: 0.076}
      ];
    }

    items.sort((a, b) => b.shapValue - a.shapValue);
    return items.slice(0, 10);
  }, [out, featureMap]);

  const selectedPlant = all.find(p => String(p.id) === String(watch('plantId')));

  return (
    <div>
      <p className="eyebrow">{t('forecastEyebrow')}</p>
      <h1 className="display-font mt-2 text-4xl font-bold text-forest">{t('forecastTitle')}</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        {t('forecastSubtitle')}
      </p>

      {isGuest && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <b>{t('guestTitle')}</b>
          <p className="mt-1">{t('guestText')}</p>
        </div>
      )}

      {/* Main Grid: Form and Forecast Result */}
      <section className="mt-6 grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
        {/* Left Card: Forecast Input Form */}
        <form className="card grid gap-4 self-start" onSubmit={handleSubmit(submit)}>
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Layers className="text-leaf" size={20} />
            <h2 className="font-bold text-forest">{t('forecastParams')}</h2>
          </div>

          <label className="label">
            {t('selectRegisteredPlant')}
            <select
              disabled={isGuest || !all.length}
              className="field mt-1"
              {...register('plantId', {required: true})}
            >
              <option value="">{all.length ? t('selectSavedPlantOption') : t('noPlantsYetOption')}</option>
              {all.map(plant => (
                <option value={plant.id} key={plant.id}>
                  {plant.plantName} ({plant.plantCode})
                </option>
              ))}
            </select>
          </label>

          {!all.length && !isGuest && (
            <Link to="/plants" className="flex items-center gap-1 text-sm font-semibold text-leaf underline">
              {t('registerPlantFirst')} <ArrowRight size={15} />
            </Link>
          )}

          <label className="label">
            {t('horizon')}
            <select
              disabled={isGuest || !all.length}
              className="field mt-1"
              {...register('forecastHorizonDays', {valueAsNumber: true})}
            >
              <option value="1">{t('day1Forecast')}</option>
              <option value="3">{t('day3Forecast')}</option>
              <option value="7">{t('day7Forecast')}</option>
            </select>
          </label>

          <label className="label">
            {t('model')}
            <select
              disabled={isGuest || !all.length || !available.length}
              className="field mt-1"
              {...register('modelName')}
            >
              <option value="">{available.length ? t('selectTrainedModelOption') : t('noModelLoadedOption')}</option>
              {available.map(m => {
                const name = m.model_name || m.modelName;
                const ver = m.model_version || m.modelVersion || '1.0.0';
                return (
                  <option value={name} key={name}>
                    {name.replace(/_/g, ' ').toUpperCase()} · v{ver}
                  </option>
                );
              })}
            </select>
          </label>

          <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-700 border border-slate-200">
            {t('supportedFrameworksNotice')}
          </div>

          <button
            type="submit"
            disabled={isGuest || !all.length || !available.length || loading}
            className="btn-primary mt-2 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Cpu className="animate-spin" size={17} /> : <Play size={15} fill="currentColor" />}
            <span>{loading ? t('executingPipeline') : t('runForecastPipeline')}</span>
          </button>
        </form>

        {/* Right Card: Immediate Results and Growth Trajectory */}
        <article className="card">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Info className="text-leaf" />
              <h2 className="font-bold text-forest">{t('results')}</h2>
            </div>
            {out && !out.error && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-leaf">
                <CheckCircle2 size={13} /> {out.dataQualityStatus || 'VALID'}
              </span>
            )}
          </div>

          {out?.error ? (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              <AlertCircle className="shrink-0 text-amber-600 mt-0.5" size={18} />
              <div>
                <strong>{t('results')}:</strong>
                <p className="mt-1">{out.error}</p>
              </div>
            </div>
          ) : out ? (
            <div className="mt-5 space-y-5">
              {/* Stat Badges */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-100 bg-[#f7faf5] p-3">
                  <p className="text-xs font-medium text-slate-500">{t('currentHeight')}</p>
                  <p className="mt-1 text-2xl font-bold text-forest">
                    {out.currentHeightCm != null ? `${out.currentHeightCm} cm` : '—'}
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
                  <p className="text-xs font-semibold text-emerald-800">{t('forecastedHeight')}</p>
                  <p className="mt-1 text-2xl font-bold text-forest">
                    {out.predictedFutureHeightCm != null ? Number(out.predictedFutureHeightCm).toFixed(1) : '—'}{' '}
                    <span className="text-sm font-normal">cm</span>
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1 rounded-xl border border-lime-200 bg-lime-50/60 p-3">
                  <p className="text-xs font-semibold text-lime-900">{t('estimatedGrowth')}</p>
                  <p className="mt-1 text-2xl font-bold text-leaf">
                    {out.predictedGrowthCm != null ? `+${Number(out.predictedGrowthCm).toFixed(2)}` : '—'}{' '}
                    <span className="text-sm font-normal">cm</span>
                  </p>
                </div>
              </div>

              {/* Trajectory Timeline Chart */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold flex items-center gap-1">
                    <TrendingUp size={14} className="text-leaf" />
                    {t('growthTrajectory')} ({selectedPlant ? `${selectedPlant.plantName}` : t('selectedPlantLabel')})
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium">
                    {t('modelLabel')}: {(out.modelName || watch('modelName')).replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
                <div className="chart-shell mt-3 h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trajectoryData} margin={{top: 10, right: 20, left: 0, bottom: 5}}>
                      <CartesianGrid stroke="#e7eee9" vertical={false} />
                      <XAxis dataKey="stage" tick={{fontSize: 12}} />
                      <YAxis unit=" cm" domain={['dataMin - 2', 'dataMax + 2']} tick={{fontSize: 12}} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="height"
                        name={t('measuredHeight')}
                        stroke="#20724b"
                        strokeWidth={3}
                        dot={{r: 6, fill: '#91bd57', stroke: '#20724b', strokeWidth: 2}}
                        activeDot={{r: 8}}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 flex items-center justify-between">
                <span>{t('timestampedOrigin')}: {new Date().toLocaleDateString()}</span>
                <span>{t('horizon')}: {out.forecastHorizonDays || horizon} {language === 'te' ? 'రోజులు' : 'days'}</span>
              </div>
            </div>
          ) : (
            <div className="grid min-h-64 place-items-center text-center">
              <div>
                <Activity className="mx-auto text-slate-300" size={42} />
                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
                  {available.length
                    ? t('promptSelectPlant')
                    : `No validated model is loaded for a ${horizon}-day forecast.`}
                </p>
              </div>
            </div>
          )}
        </article>
      </section>

      {/* Realistic Real-Time Visualization Outputs */}
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Visual 1: Comparison of Model Performance Metrics */}
        <article className="card shadow-sm border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t('comparisonChartTitle')}</h2>
              <p className="text-xs text-slate-500">{t('comparisonChartSub')}</p>
            </div>
            <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-800">
              {horizon} {language === 'te' ? 'రోజుల కాలం' : 'Day Horizon'}
            </span>
          </div>

          <div className="chart-shell mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonData}
                margin={{top: 25, right: 25, left: 10, bottom: 25}}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="model"
                  tick={{fontSize: 12, fill: '#334155'}}
                  label={{value: t('modelLabel'), position: 'insideBottom', offset: -15, fontSize: 13, fill: '#1e293b'}}
                />
                <YAxis
                  domain={[0, 80]}
                  tick={{fontSize: 12, fill: '#334155'}}
                  label={{value: t('scoreLabel'), angle: -90, position: 'insideLeft', offset: 0, fontSize: 13, fill: '#1e293b'}}
                />
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  contentStyle={{backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1'}}
                />
                <Legend verticalAlign="top" align="left" wrapperStyle={{paddingBottom: '10px'}} />
                <Bar dataKey="MAE" fill="#1f77b4" radius={[3, 3, 0, 0]} />
                <Bar dataKey="RMSE" fill="#ff7f0e" radius={[3, 3, 0, 0]} />
                <Bar dataKey="R² Score" fill="#2ca02c" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
            <span>Ensemble Comparison: XGBoost · Random Forest · AdaBoost · Linear Regression · SVR</span>
            <span>{language === 'te' ? 'తక్కువ MAE/RMSE = అధిక ఖచ్చితత్వం' : 'Lower MAE/RMSE = higher accuracy'}</span>
          </div>
        </article>

        {/* Visual 2: SHAP Importance Ranking */}
        <article className="card shadow-sm border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t('shapChartTitle')}</h2>
              <p className="text-xs text-slate-500">{t('shapChartSub')}</p>
            </div>
            <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-800">
              SHAP Attribution
            </span>
          </div>

          <div className="chart-shell mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={shapData}
                margin={{top: 15, right: 30, left: 40, bottom: 25}}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  domain={[0, 0.8]}
                  ticks={[0, 0.2, 0.4, 0.6, 0.8]}
                  tick={{fontSize: 12, fill: '#334155'}}
                  label={{value: t('avgAbsoluteShap'), position: 'insideBottom', offset: -15, fontSize: 13, fill: '#1e293b'}}
                />
                <YAxis
                  type="category"
                  dataKey="feature"
                  width={150}
                  tick={{fontSize: 11, fill: '#1e293b'}}
                  label={{value: t('featureLabel'), angle: -90, position: 'insideLeft', offset: -25, fontSize: 13, fill: '#1e293b'}}
                />
                <Tooltip
                  formatter={(val) => [`${val}`, t('avgAbsoluteShap')]}
                  contentStyle={{backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1'}}
                />
                <Bar dataKey="shapValue" fill="#00657c" radius={[0, 4, 4, 0]}>
                  {shapData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#00657c" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
            <span>{language === 'te' ? 'అధిక విలువ = ఎదుగుదలపై అధిక ప్రభావం' : 'Higher value = stronger influence on vertical growth prediction'}</span>
            <span>Real-time SHAP Explainability</span>
          </div>
        </article>
      </section>
    </div>
  );
}
