import {NavLink, Outlet} from 'react-router-dom';
import {Leaf, LogOut, LayoutDashboard, Sprout, ChartNoAxesCombined, BrainCircuit, Languages} from 'lucide-react';
import {useAuth} from '../context/AuthContext';
import {useLanguage} from '../context/LanguageContext';

export default function AppLayout() {
  const {logout, user, isGuest} = useAuth();
  const {t, language, setLanguage} = useLanguage();

  const links = [
    ['/dashboard', t('dashboard'), LayoutDashboard],
    ['/plants', t('plants'), Sprout],
    ['/predict', t('forecast'), ChartNoAxesCombined],
    ['/models', t('evaluation'), BrainCircuit]
  ];

  return (
    <div className="min-h-screen bg-[#f5f8f2] md:flex">
      <aside className="bg-forest p-4 text-white md:sticky md:top-0 md:h-screen md:w-64 md:p-5">
        <div className="flex items-center justify-between md:block">
          <NavLink to="/dashboard" className="flex items-center gap-2 text-xl font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime-200 text-forest">
              <Leaf size={20} />
            </span>
            {t('brand')}
          </NavLink>
          <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] md:hidden">
            {isGuest ? t('guestTitle') : t('user')}
          </span>
        </div>

        <nav className="mt-5 flex gap-2 overflow-x-auto md:mt-8 md:grid md:gap-2">
          {links.map(([to, n, Icon]) => (
            <NavLink
              key={to}
              className={({isActive}) =>
                `flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/75 hover:bg-white/10 hover:text-white ${
                  isActive ? 'nav-active' : ''
                }`
              }
              to={to}
            >
              <Icon size={17} />
              {n}
            </NavLink>
          ))}
        </nav>

        <div className="mt-7 hidden border-t border-white/10 pt-5 md:block">
          <p className="text-xs text-white/55">
            {isGuest ? t('guestWorkspace') : (user?.fullName || t('user'))}
          </p>
          <p className="mt-1 truncate text-sm font-semibold">{user?.email}</p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="mt-4 hidden items-center gap-2 text-sm text-white/80 hover:text-white md:flex"
        >
          <LogOut size={16} /> {t('signOut')}
        </button>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-emerald-950/5 bg-white/70 px-5 py-3 backdrop-blur md:px-8">
          <p className="text-xs font-semibold text-slate-500">
            {isGuest ? t('guestWorkspace') : t('authenticatedWorkspace')}
          </p>
          <div className="flex items-center gap-2">
            <Languages size={16} className="text-leaf" />
            <span className="text-xs font-semibold text-slate-600">{t('language')}</span>
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
            <button
              type="button"
              onClick={logout}
              className="ml-1 text-slate-500 md:hidden"
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>
        <div className="p-5 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
