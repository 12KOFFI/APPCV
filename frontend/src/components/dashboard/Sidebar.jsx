import { Link, useLocation } from 'react-router-dom';
import Badge from '../ui/Badge';
import {
  FileTextIcon,
  GridIcon,
  UploadIcon,
  UserIcon,
  ExternalLinkIcon,
  SparklesIcon,
} from '../ui/Icons';

export default function Sidebar({
  isOpen,
  onClose,
  cvsCount = 0,
}) {
  const location = useLocation();

  const menuItems = [
    {
      label: 'Tableau de bord',
      to: '/dashboard',
      icon: GridIcon,
      badge: 'Principal',
      badgeVariant: 'blue',
      active: location.pathname === '/dashboard',
    },
    {
      label: 'Déposer un CV',
      to: '/upload',
      icon: UploadIcon,
      badge: 'Nouveau',
      badgeVariant: 'success',
      active: location.pathname === '/upload',
    },
    {
      label: 'Mes CV enregistrés',
      to: '/mes-cvs',
      icon: FileTextIcon,
      badge: `${cvsCount}`,
      badgeVariant: 'neutral',
      active: location.pathname === '/mes-cvs' || location.pathname === '/cvs',
    },
  ];

  const secondaryItems = [
    {
      label: 'Mon Profil',
      to: '/profil',
      icon: UserIcon,
      active: location.pathname === '/profil' || location.pathname === '/profile',
    },
    {
      label: 'Page d’accueil publique',
      to: '/',
      icon: ExternalLinkIcon,
      active: false,
    },
  ];

  return (
    <>
      {/* Overlay sur mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Conteneur principal de la Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 z-50 w-72 h-screen shrink-0 bg-white dark:bg-[#111827] border-r border-slate-200/80 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* ── 1. En-tête : Logo & Marque ── */}
        <div className="h-18 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-800 border border-transparent dark:border-slate-700 flex items-center justify-center text-white shadow-xs group-hover:bg-slate-800 transition-colors">
              <FileTextIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 dark:text-white text-xl tracking-tight">APPCV</span>
              <Badge variant="blue" size="sm" className="font-bold text-[10px] px-1.5 py-0.5">
                IA
              </Badge>
            </div>
          </Link>

          {/* Bouton fermeture sur mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            aria-label="Fermer le menu"
          >
            ✕
          </button>
        </div>

        {/* ── 2. Navigation : Groupes de Menus ── */}
        <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          {/* Groupe Menu Principal */}
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Menu
            </p>
            <nav className="space-y-1">
              {menuItems.map((item, idx) => {
                const Icon = item.icon;
                const itemContent = (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-5 h-5 transition-colors ${
                          item.active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-700'
                        }`}
                      />
                      <span className="font-semibold text-xs tracking-tight">{item.label}</span>
                    </div>
                    {item.badge && (
                      <Badge
                        variant={item.active ? 'blue' : item.badgeVariant || 'neutral'}
                        size="sm"
                        className="text-[10px] font-bold"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </>
                );

                const commonClasses = `flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs transition-all group ${
                  item.active
                    ? 'bg-blue-50/80 text-blue-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                }`;

                return (
                  <Link
                    key={idx}
                    to={item.to}
                    onClick={onClose}
                    className={commonClasses}
                  >
                    {itemContent}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Groupe Espace Candidature */}
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Compte & Paramètres
            </p>
            <nav className="space-y-1">
              {secondaryItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={idx}
                    to={item.to}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all group ${
                      item.active
                        ? 'bg-blue-50/80 text-blue-700 font-bold shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-slate-400 group-hover:text-slate-700" />
                      <span className="font-semibold text-xs">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Carte promotionnelle IA Sobre */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50/90 to-indigo-50/50 border border-blue-100/80 text-left">
            <div className="flex items-center gap-2 mb-1.5">
              <SparklesIcon className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-950">Assistant ATS Pro</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
              Analysez jusqu’à 10 CV par jour et optimisez vos chances d'entretien.
            </p>
            <Link
              to="/upload"
              className="inline-flex items-center justify-center w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] shadow-2xs transition-colors"
            >
              + Analyser un CV
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
