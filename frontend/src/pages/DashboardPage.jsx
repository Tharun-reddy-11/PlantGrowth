import {useEffect, useMemo, useState} from 'react';
import {Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {Sprout, Ruler, ChartNoAxesCombined, BrainCircuit, CloudSun, ShieldCheck, Camera, ScanSearch, ChevronLeft, ChevronRight} from 'lucide-react';
import {dashboard, plants} from '../services/api';
import {useAuth} from '../context/AuthContext';
import {useLanguage} from '../context/LanguageContext';
import sproutsImage from '../assets/carousel-sprouts.jpg';
import hydroponicsImage from '../assets/carousel-hydroponics.jpg';
import insightsImage from '../assets/dashboard-insights.svg';

const fmtDate = value => new Date(value).toLocaleDateString(undefined, {month: 'short', day: 'numeric'});

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [plantList, setPlantList] = useState([]);
  const [records, setRecords] = useState([]);
  const [monitorIndex, setMonitorIndex] = useState(0);
  const {user, isGuest} = useAuth();
  const {t} = useLanguage();

  const username = user?.fullName || user?.email?.split('@')[0] || (isGuest ? t('guest') : t('user'));

  useEffect(() => {
    let alive = true;
    Promise.all([dashboard.summary(), plants.list()]).then(async ([summaryResponse, plantsResponse]) => {
      if (!alive) return;
      const list = plantsResponse.data.content ?? plantsResponse.data ?? [];
      setSummary(summaryResponse.data);
      setPlantList(list);
      if (list[0]) {
        try {
          const growthResponse = await plants.growth(list[0].id);
          if (alive) setRecords(growthResponse.data ?? []);
        } catch { if (alive) setRecords([]); }
      }
    }).catch(() => alive && setSummary({}));
    return () => { alive = false; };
  }, []);

  const chart = useMemo(() => records.map(record => ({
    date: fmtDate(record.measurementTimestamp),
    height: record.plantHeightCm
  })), [records]);

  const cards = [
    [t('registeredPlants'), summary?.plantCount, <Sprout key="sprout"/>, t('registeredPlantsTip')],
    [t('latestHeight'), summary?.latestHeightCm ? `${summary.latestHeightCm} cm` : null, <Ruler key="ruler"/>, t('latestHeightTip')],
    [t('latestForecast'), summary?.latestForecastCm ? `${Number(summary.latestForecastCm).toFixed(1)} cm` : null, <ChartNoAxesCombined key="forecast"/>, t('latestForecastTip')],
    [t('modelStatus'), summary?.modelStatus ? (summary.modelStatus === 'Operational' ? t('operational') : summary.modelStatus) : null, <BrainCircuit key="brain"/>, t('modelStatusTip')]
  ];

  // Carousel images with translated titles and descriptions
  const monitoring = [
    [sproutsImage, t('slide1Title'), t('slide1Desc'), Sprout],
    [hydroponicsImage, t('slide2Title'), t('slide2Desc'), CloudSun],
    [insightsImage, t('slide3Title'), t('slide3Desc'), ScanSearch]
  ];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMonitorIndex(index => (index + 1) % monitoring.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [monitoring.length]);

  const prevSlide = () => setMonitorIndex(idx => (idx - 1 + monitoring.length) % monitoring.length);
  const nextSlide = () => setMonitorIndex(idx => (idx + 1) % monitoring.length);

  return (
    <div>
      {/* Clean Simple Welcome Header without green box */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-4">
        <div>
          <p className="eyebrow">{t('fieldOverview')}</p>
          <h1 className="display-font mt-1 text-3xl font-bold tracking-tight text-forest md:text-4xl">
            {t('welcomeUser')}, {username}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {t('dashboardSubtitle')}
          </p>
        </div>
      </div>

      {isGuest && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <ShieldCheck size={19} className="shrink-0" />
          <div>
            <b>{t('guestTitle')}</b>
            <p className="mt-1">{t('guestText')}</p>
          </div>
        </div>
      )}

      {/* 3 Moving Images Carousel */}
      <section className="mt-6">
        {(() => {
          const [image, title, description, Icon] = monitoring[monitorIndex];
          return (
            <article className="hover-card group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm lg:flex">
              <span className="hover-tip">{description}</span>
              <div className="relative h-64 w-full overflow-hidden bg-slate-900 lg:h-80 lg:w-3/5">
                <img
                  src={image}
                  alt={title}
                  className="h-full w-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                <button
                  type="button"
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white/80 backdrop-blur hover:bg-black/70 hover:text-white transition"
                  aria-label="Previous slide"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white/80 backdrop-blur hover:bg-black/70 hover:text-white transition"
                  aria-label="Next slide"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <div className="flex flex-1 flex-col justify-center p-6 lg:p-10">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-leaf">
                  <Icon size={20} />
                </span>
                <h2 className="mt-4 text-2xl font-bold text-forest">{title}</h2>
                <p className="mt-2 max-w-xl leading-7 text-slate-600">{description}</p>
                <div className="mt-6 flex items-center gap-2">
                  {monitoring.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      aria-label={`Slide ${index + 1}`}
                      onClick={() => setMonitorIndex(index)}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        index === monitorIndex ? 'w-8 bg-leaf' : 'w-2.5 bg-emerald-200 hover:bg-emerald-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </article>
          );
        })()}
      </section>

      {/* KPI Cards */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([name, value, Icon, tip]) => (
          <article className="metric-card hover-card group" key={name}>
            <span className="hover-tip">{tip}</span>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-leaf transition group-hover:scale-110 group-hover:bg-lime-100">
              {Icon}
            </span>
            <p className="mt-5 text-sm text-slate-500">{name}</p>
            <strong className="mt-1 block text-2xl text-forest">{value ?? t('notAvailable')}</strong>
          </article>
        ))}
      </section>

      {/* Charts & Context Section */}
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_.85fr]">
        <article className="card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-forest">{t('history')}</h2>
              <p className="mt-1 text-sm text-slate-500">{plantList[0]?.plantName || t('selectPlantPrompt')}</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-leaf">
              {t('measured')}
            </span>
          </div>
          <div className="chart-shell mt-5 h-72">
            {chart.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart}>
                  <defs>
                    <linearGradient id="heightFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#5daf72" stopOpacity=".45" />
                      <stop offset="100%" stopColor="#5daf72" stopOpacity=".03" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e7eee9" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis unit=" cm" tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="height"
                    name={t('measuredHeight')}
                    stroke="#20724b"
                    strokeWidth={3}
                    fill="url(#heightFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart text={t('noHeightHistory')} />
            )}
          </div>
        </article>

        {/* Environmental Context */}
        <aside className="card">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CloudSun className="text-leaf" size={20} />
              <h2 className="font-bold text-forest">{t('environmentalContext')}</h2>
            </div>
            {summary?.locationName && (
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-leaf">
                {summary.locationName}
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {t('environmentalSubtitle')}
          </p>
          <div className="mt-4 space-y-3">
            <Info
              label={t('airTemperature')}
              value={summary?.temperature != null ? `${summary.temperature} °C` : t('notAvailable')}
            />
            <Info
              label={t('relativeHumidity')}
              value={summary?.humidity != null ? `${summary.humidity} %` : t('notAvailable')}
            />
            <Info
              label={t('soilMoisture')}
              value={summary?.soilMoisture != null ? `${summary.soilMoisture} %` : t('notAvailable')}
            />
            {summary?.soilPh != null && (
              <Info
                label={t('soilPh')}
                value={`${summary.soilPh}`}
              />
            )}
          </div>
          <div className="mt-5 rounded-xl bg-emerald-50/70 p-3 text-xs leading-5 text-emerald-900 border border-emerald-100">
            {summary?.telemetrySource
              ? `${t('telemetrySourceLabel')}: ${summary.telemetrySource}`
              : t('telemetryNotice')}
          </div>
        </aside>
      </section>
    </div>
  );
}

function Info({label, value}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-3">
      <span className="text-sm text-slate-600">{label}</span>
      <b className="text-sm text-forest">{value}</b>
    </div>
  );
}

function EmptyChart({text}) {
  return (
    <div className="grid h-full place-items-center text-center">
      <div>
        <Camera className="mx-auto text-emerald-200" size={40} />
        <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">{text}</p>
      </div>
    </div>
  );
}
