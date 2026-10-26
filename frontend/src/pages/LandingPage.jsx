import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import {Sprout, ChartNoAxesCombined, BrainCircuit, ScanSearch, ArrowRight, ShieldCheck, CloudSun} from 'lucide-react';
import {useLanguage} from '../context/LanguageContext';

const featureIcons = [Sprout, CloudSun, ChartNoAxesCombined, BrainCircuit, ScanSearch, ShieldCheck];

export default function LandingPage() {
  const {t, language, setLanguage} = useLanguage();

  const features = [
    [t('featIntegratedTitle'), t('featIntegratedDesc')],
    [t('featDailyTitle'), t('featDailyDesc')],
    [t('featTemporalTitle'), t('featTemporalDesc')],
    [t('featMultiModelTitle'), t('featMultiModelDesc')],
    [t('featExplainableTitle'), t('featExplainableDesc')],
    [t('featAuditableTitle'), t('featAuditableDesc')]
  ];

  const methodologySteps = [
    t('methodStep1'),
    t('methodStep2'),
    t('methodStep3'),
    t('methodStep4')
  ];

  return (
    <div className="min-h-screen bg-[#f5f8f2]">
      <section className="landing-hero relative isolate overflow-hidden px-5 pb-24 pt-32 text-white md:px-8">
        <header className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime-200 text-forest">
              <Sprout size={20} />
            </span>
            {t('brand')}
          </Link>
          <nav className="hidden gap-6 text-sm font-medium text-white/85 lg:flex">
            <a href="#features">{t('features')}</a>
            <a href="#method">{t('methodology')}</a>
            <a href="#research">{t('research')}</a>
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden rounded-lg border border-white/20 bg-white/10 p-1 sm:flex">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`rounded-md px-2 py-1 text-xs ${language === 'en' ? 'bg-white text-forest font-bold' : ''}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('te')}
                className={`rounded-md px-2 py-1 text-xs ${language === 'te' ? 'bg-white text-forest font-bold' : ''}`}
              >
                తె
              </button>
            </div>
            <Link className="hidden text-sm font-semibold sm:block" to="/login">
              {t('login')}
            </Link>
            <Link className="btn bg-lime-200 px-3 py-2 text-sm text-forest hover:bg-lime-100" to="/register">
              {t('getStarted')}
            </Link>
          </div>
        </header>

        <div className="relative mx-auto flex min-h-[560px] max-w-7xl items-center">
          <motion.div
            initial={{opacity: 0, y: 18}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.55}}
            className="max-w-3xl"
          >
            <p className="eyebrow !text-lime-200">{t('heroEyebrow')}</p>
            <h1 className="display-font mt-4 text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
              {t('heroTitle')}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">
              {t('heroText')}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link className="btn bg-lime-200 text-forest hover:bg-lime-100" to="/register">
                {t('explore')} <ArrowRight className="ml-2" size={17} />
              </Link>
              <a className="btn border border-white/30 bg-white/10 text-white hover:bg-white/15" href="#method">
                {t('method')}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <main>
        {/* Features Section */}
        <section id="features" className="mx-auto max-w-7xl px-5 py-20 md:px-8">
          <div className="max-w-2xl">
            <p className="eyebrow">{t('featuresEyebrow')}</p>
            <h2 className="display-font mt-3 text-4xl font-bold text-forest">
              {t('featuresTitle')}
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map(([title, body], i) => {
              const Icon = featureIcons[i];
              return (
                <article key={title} className="card transition hover:-translate-y-1 hover:shadow-lg">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-leaf">
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-forest">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Methodology Section */}
        <section id="method" className="bg-forest px-5 py-20 text-white md:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
            <div>
              <p className="eyebrow !text-lime-200">{t('methodology')}</p>
              <h2 className="display-font mt-3 text-4xl font-bold">
                {t('methodologyTitle')}
              </h2>
              <p className="mt-5 max-w-xl leading-7 text-white/75">
                {t('methodologyDesc')}
              </p>
            </div>
            <ol className="grid gap-3">
              {methodologySteps.map((stepText, i) => (
                <li className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/5 p-4" key={stepText}>
                  <b className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lime-200 text-sm text-forest">
                    0{i + 1}
                  </b>
                  <span>{stepText}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Responsible Use Section */}
        <section id="research" className="mx-auto max-w-7xl px-5 py-20 md:px-8">
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-emerald-950/5 md:p-12">
            <p className="eyebrow">{t('responsibleEyebrow')}</p>
            <h2 className="display-font mt-3 text-3xl font-bold text-forest">
              {t('responsibleTitle')}
            </h2>
            <p className="mt-4 max-w-3xl leading-7 text-slate-600">
              {t('responsibleDesc')}
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-[#0d2c21] px-5 py-10 text-white/70 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 md:flex-row">
          <span className="font-semibold text-white">{t('brand')}</span>
          <p className="max-w-2xl text-sm">{t('landingFooter')}</p>
        </div>
      </footer>
    </div>
  );
}
