import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {useNavigate, Link} from 'react-router-dom';
import {Leaf, ArrowRight, ShieldCheck} from 'lucide-react';
import {useAuth} from '../context/AuthContext';
import {auth} from '../services/api';
import {useLanguage} from '../context/LanguageContext';

function Form({registerMode = false}) {
  const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm();
  const {login, guest} = useAuth();
  const {t, language, setLanguage} = useLanguage();
  const nav = useNavigate();
  const [error, setError] = useState('');

  const submit = async v => {
    setError('');
    try {
      if (registerMode) await auth.register(v);
      await login({email: v.email, password: v.password});
      nav('/dashboard');
    } catch (e) {
      setError(e.response?.data?.message || (language === 'te' ? 'అభ్యర్థనను పూర్తి చేయడం సాధ్యపడలేదు.' : 'The request could not be completed.'));
    }
  };

  const guestLogin = async () => {
    setError('');
    try {
      await guest();
      nav('/dashboard');
    } catch (e) {
      setError(e.response?.data?.message || (language === 'te' ? 'అతిథి యాక్సెస్ తాత్కాలికంగా అందుబాటులో లేదు.' : 'Guest access is temporarily unavailable.'));
    }
  };

  return (
    <div className="grid min-h-screen bg-[#f5f8f2] lg:grid-cols-2">
      <section className="hero-surface hidden flex-col justify-between p-12 text-white lg:flex">
        <div className="flex items-center justify-between">
          <Link className="flex items-center gap-2 text-xl font-bold" to="/">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime-200 text-forest">
              <Leaf />
            </span>
            {t('brand')}
          </Link>
          <div className="flex rounded-lg border border-white/20 bg-white/10 p-1">
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
        </div>
        <div>
          <p className="eyebrow !text-lime-200">{t('authenticatedWorkspace')}</p>
          <h1 className="display-font mt-4 max-w-xl text-5xl font-bold leading-tight">
            {t('authLeftTitle')}
          </h1>
          <p className="mt-5 max-w-lg text-white/75">
            {t('authLeftSubtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-white/70">
          <ShieldCheck size={18} /> {t('authSecurityNotice')}
        </div>
      </section>

      <main className="grid place-items-center p-5">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link className="flex items-center gap-2 text-lg font-bold text-forest" to="/">
              <Leaf /> {t('brand')}
            </Link>
            <div className="flex rounded-lg border border-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`rounded-md px-2 py-1 text-xs ${language === 'en' ? 'bg-emerald-100 text-forest font-bold' : ''}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('te')}
                className={`rounded-md px-2 py-1 text-xs ${language === 'te' ? 'bg-emerald-100 text-forest font-bold' : ''}`}
              >
                తె
              </button>
            </div>
          </div>

          <section className="card p-6 md:p-8">
            <p className="eyebrow">{registerMode ? t('newResearcherProfile') : t('welcomeBack')}</p>
            <h2 className="display-font mt-2 text-3xl font-bold text-forest">
              {registerMode ? t('register') : t('login')}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {registerMode ? t('registerSubtitle') : t('loginSubtitle')}
            </p>

            <form onSubmit={handleSubmit(submit)} className="mt-6 grid gap-4">
              {registerMode && (
                <label className="label">
                  {t('fullNameLabel')}
                  <input className="field" {...register('fullName', {required: true, minLength: 2})} />
                </label>
              )}
              <label className="label">
                {t('emailLabel')}
                <input className="field" type="email" autoComplete="email" {...register('email', {required: true})} />
              </label>
              <label className="label">
                {t('passwordLabel')}
                <input
                  className="field"
                  type="password"
                  autoComplete={registerMode ? 'new-password' : 'current-password'}
                  {...register('password', {required: true, minLength: 8})}
                />
                {errors.password && <small className="text-red-700">{t('passwordLengthNotice')}</small>}
              </label>

              {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

              <button disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? t('pleaseWait') : (registerMode ? t('register') : t('login'))}
                <ArrowRight className="ml-2" size={17} />
              </button>
            </form>

            {!registerMode && (
              <>
                <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
                  <span className="h-px flex-1 bg-slate-200" />
                  {t('orDivider')}
                  <span className="h-px flex-1 bg-slate-200" />
                </div>
                <button onClick={guestLogin} className="btn-secondary w-full">
                  {t('guest')}
                </button>
                <p className="mt-3 text-center text-xs text-slate-500">
                  {t('guestNotice')}
                </p>
              </>
            )}

            <p className="mt-6 text-center text-sm text-slate-600">
              {registerMode ? t('alreadyRegisteredPrompt') : t('newHerePrompt')}{' '}
              <Link className="font-semibold text-leaf underline" to={registerMode ? '/login' : '/register'}>
                {registerMode ? t('login') : t('register')}
              </Link>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

export const Login = () => <Form />;
export const Register = () => <Form registerMode />;
