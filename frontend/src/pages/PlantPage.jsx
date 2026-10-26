import {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {useNavigate} from 'react-router-dom';
import {ImagePlus, Leaf, MapPin, Search, ShieldCheck, Sprout} from 'lucide-react';
import {plants} from '../services/api';
import {useAuth} from '../context/AuthContext';
import {useLanguage} from '../context/LanguageContext';

const origin = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/api\/?$/, '');
const dateValue = (daysAgo = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
};
const isoAtNoon = date => new Date(`${date}T12:00:00`).toISOString();

export default function PlantPage() {
  const [items, setItems] = useState([]);
  const [preview, setPreview] = useState('');
  const [notice, setNotice] = useState('');
  const {isGuest} = useAuth();
  const {t, language} = useLanguage();
  const navigate = useNavigate();
  const {register, handleSubmit, reset, watch, formState: {isSubmitting}} = useForm({
    defaultValues: {
      plantingDate: dateValue(14),
      soilSource: 'Manual entry',
      measurementSource: 'Manual measurement',
      firstMeasurementDate: dateValue(7),
      latestMeasurementDate: dateValue(0)
    }
  });
  const image = watch('image');

  useEffect(() => {
    if (!image?.[0]) {
      setPreview('');
      return undefined;
    }
    const url = URL.createObjectURL(image[0]);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const load = () => plants.list().then(response => setItems(response.data.content ?? response.data ?? [])).catch(() => setItems([]));
  useEffect(() => { load(); }, []);

  const openForecast = plantId => {
    sessionStorage.setItem('selectedPlantId', String(plantId));
    navigate('/predict');
  };

  const submit = async values => {
    setNotice('');
    if (values.firstMeasurementDate >= values.latestMeasurementDate) {
      setNotice(language === 'te'
        ? 'రెండు వేర్వేరు తేదీలను ఉపయోగించండి: మొదటి కొలత తాజా కొలత కంటే ముందుగా ఉండాలి.'
        : 'Use two different dates: the first measurement must be earlier than the latest measurement.');
      return;
    }
    try {
      const created = (await plants.create({
        plantCode: values.plantCode,
        plantName: values.plantName,
        species: values.species,
        plantingDate: values.plantingDate,
        locationName: values.locationName
      })).data;

      if (values.image?.[0]) await plants.uploadImage(created.id, values.image[0]);

      const hasSoil = ['soilPh', 'soilMoisture', 'nitrogen', 'phosphorus', 'potassium']
        .some(key => values[key] !== '' && values[key] != null);
      if (hasSoil) {
        await plants.addSoil(created.id, {
          observationDate: values.latestMeasurementDate,
          soilPh: values.soilPh === '' ? null : Number(values.soilPh),
          soilMoisture: values.soilMoisture === '' ? null : Number(values.soilMoisture),
          nitrogen: values.nitrogen === '' ? null : Number(values.nitrogen),
          phosphorus: values.phosphorus === '' ? null : Number(values.phosphorus),
          potassium: values.potassium === '' ? null : Number(values.potassium),
          source: values.soilSource || 'Manual entry'
        });
      }

      await plants.addGrowth(created.id, {
        measurementTimestamp: isoAtNoon(values.firstMeasurementDate),
        plantHeightCm: Number(values.firstHeight),
        measurementMethod: 'Manual measurement',
        source: values.measurementSource || 'Manual measurement'
      });
      await plants.addGrowth(created.id, {
        measurementTimestamp: isoAtNoon(values.latestMeasurementDate),
        plantHeightCm: Number(values.latestHeight),
        measurementMethod: 'Manual measurement',
        source: values.measurementSource || 'Manual measurement'
      });

      sessionStorage.setItem('selectedPlantId', String(created.id));
      reset();
      setPreview('');
      setNotice(language === 'te'
        ? 'మొక్క, నేల సమాచారం మరియు రెండు ఎత్తు కొలతలు భద్రపరచబడ్డాయి. అంచనాను అభ్యర్థించడానికి సిద్ధంగా ఉంది.'
        : 'Plant, soil context, and two dated height measurements were saved. Select Forecast to request an eligible model result.');
      await load();
    } catch (error) {
      setNotice(error.response?.data?.message || (language === 'te'
        ? 'మొక్క రికార్డును భద్రపరచడం సాధ్యపడలేదు. వివరాలను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.'
        : 'The plant record could not be saved. Check the fields and try again.'));
    }
  };

  return <div>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow">{t('plantRegEyebrow')}</p>
        <h1 className="display-font mt-2 text-4xl font-bold text-forest">{t('plantRegTitle')}</h1>
        <p className="mt-2 max-w-2xl text-slate-600">{t('plantRegSubtitle')}</p>
      </div>
      <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900">
        <Sprout size={16} className="mr-2 inline"/>{items.length} {t('savedPlantsCount')}
      </div>
    </div>

    {isGuest && (
      <div className="mt-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <ShieldCheck className="shrink-0" size={19}/>
        <p>{t('guestPlantNotice')}</p>
      </div>
    )}
    {notice && <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{notice}</div>}

    <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
      <form className="card grid gap-5" onSubmit={handleSubmit(submit)}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-forest">{t('plantDetailsStep')}</h2>
          <span className="text-xs text-slate-500">{t('step1Of2')}</span>
        </div>

        <label className="label">{t('plantImageLabel')}
          <div className="mt-1 overflow-hidden rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/60">
            {preview ? (
              <img src={preview} alt="Selected plant preview" className="h-44 w-full object-cover"/>
            ) : (
              <div className="grid h-44 place-items-center text-center text-sm text-slate-500">
                <span>
                  <ImagePlus className="mx-auto mb-2 text-leaf" size={28}/>
                  {t('uploadImageNotice')}<br/>
                  <small>{t('maxFileSize')}</small>
                </span>
              </div>
            )}
            <input disabled={isGuest} className="block w-full cursor-pointer p-3 text-xs" type="file" accept="image/jpeg,image/png,image/webp" {...register('image')}/>
          </div>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="label">{t('plantIdLabel')}<input disabled={isGuest} className="field" placeholder="e.g. TOM-001" {...register('plantCode', {required: true})}/></label>
          <label className="label">{t('plantNameLabel')}<input disabled={isGuest} className="field" placeholder="e.g. Tomato A" {...register('plantName', {required: true})}/></label>
          <label className="label">{t('speciesLabel')}<input disabled={isGuest} className="field" placeholder="e.g. Solanum lycopersicum" {...register('species')}/></label>
          <label className="label">{t('plantingDateLabel')}<input disabled={isGuest} className="field" type="date" {...register('plantingDate', {required: true})}/></label>
        </div>
        <label className="label">{t('growingLocationLabel')}<input disabled={isGuest} className="field" placeholder="Greenhouse 1 / Field block" {...register('locationName', {required: true})}/></label>

        <div className="rounded-2xl bg-emerald-50 p-4">
          <h3 className="font-bold text-forest">{t('soilSectionTitle')}</h3>
          <p className="mt-1 text-xs text-slate-600">{t('soilSectionNotice')}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <label className="label">{t('phLabel')}<input disabled={isGuest} className="field" type="number" step="0.01" min="0" max="14" placeholder="6.5" {...register('soilPh')}/></label>
            <label className="label">{t('moisturePercentLabel')}<input disabled={isGuest} className="field" type="number" min="0" max="100" placeholder="45" {...register('soilMoisture')}/></label>
            <label className="label">{t('nitrogenLabel')}<input disabled={isGuest} className="field" type="number" min="0" placeholder="90" {...register('nitrogen')}/></label>
            <label className="label">{t('phosphorusLabel')}<input disabled={isGuest} className="field" type="number" min="0" placeholder="42" {...register('phosphorus')}/></label>
            <label className="label">{t('potassiumLabel')}<input disabled={isGuest} className="field" type="number" min="0" placeholder="43" {...register('potassium')}/></label>
            <label className="label">{t('sourceLabel')}<input disabled={isGuest} className="field" {...register('soilSource')}/></label>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <h3 className="font-bold text-forest">{t('growthSectionTitle')}</h3>
          <p className="mt-1 text-xs text-slate-600">{t('growthSectionNotice')}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="label">{t('earlierDateLabel')}<input disabled={isGuest} className="field" type="date" {...register('firstMeasurementDate', {required: true})}/></label>
            <label className="label">{t('earlierHeightLabel')}<input disabled={isGuest} className="field" type="number" min="0.01" step="0.01" {...register('firstHeight', {required: true, min: 0.01})}/></label>
            <label className="label">{t('latestDateLabel')}<input disabled={isGuest} className="field" type="date" {...register('latestMeasurementDate', {required: true})}/></label>
            <label className="label">{t('latestHeightLabel')}<input disabled={isGuest} className="field" type="number" min="0.01" step="0.01" {...register('latestHeight', {required: true, min: 0.01})}/></label>
            <label className="label sm:col-span-2">{t('measSourceLabel')}<input disabled={isGuest} className="field" {...register('measurementSource')}/></label>
          </div>
        </div>
        <button disabled={isGuest || isSubmitting} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">
          {isSubmitting ? t('savingPlantHistory') : t('savePlantAndContinue')}
        </button>
      </form>

      <section className="card self-start">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-forest">{t('yourRegisteredPlants')}</h2>
            <p className="mt-1 text-sm text-slate-500">{t('yourPlantsSubtitle')}</p>
          </div>
          <Search className="text-leaf" size={20}/>
        </div>
        <div className="mt-5 grid gap-3">
          {items.length ? items.map(plant => (
            <button
              type="button"
              onClick={() => openForecast(plant.id)}
              className="group flex items-center gap-3 rounded-2xl border border-slate-200 p-3 text-left transition hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-sm"
              key={plant.id}
            >
              {plant.imageUrl ? (
                <img src={`${origin}${plant.imageUrl}`} alt={plant.plantName} className="h-16 w-16 rounded-xl object-cover"/>
              ) : (
                <span className="grid h-16 w-16 place-items-center rounded-xl bg-emerald-100 text-leaf"><Leaf/></span>
              )}
              <span className="min-w-0 flex-1">
                <b className="block text-forest">{plant.plantName}</b>
                <span className="text-xs text-slate-500">{plant.plantCode} · {plant.species || (language === 'te' ? 'జాతి నమోదు కాలేదు' : 'Species not recorded')}</span>
                <span className="mt-1 flex items-center gap-1 text-xs text-slate-500"><MapPin size={12}/>{plant.locationName}</span>
              </span>
              <span className="text-xs font-semibold text-leaf">{t('forecastArrow')}</span>
            </button>
          )) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
              <Sprout className="mx-auto text-emerald-300" size={34}/>
              <p className="mt-3 font-semibold text-forest">{t('noRegisteredPlantsNotice')}</p>
              <p className="mt-1 text-sm text-slate-500">{t('completeFormPrompt')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  </div>;
}
