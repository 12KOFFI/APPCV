import {
  FileTextIcon,
  FolderIcon,
  TargetIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
} from '../ui/Icons';

export default function StatCards({ cvsCount = 0 }) {
  const cards = [
    {
      title: 'Total des CV',
      value: `${cvsCount}`,
      subtext: 'Derniers 30 jours',
      trend: '+100%',
      isPositive: true,
      icon: FileTextIcon,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Analyses IA Réalisées',
      value: cvsCount > 0 ? `${cvsCount * 2}` : '0',
      subtext: 'Derniers 30 jours',
      trend: '+14.8%',
      isPositive: true,
      icon: FolderIcon,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
    {
      title: 'Score ATS Moyen',
      value: cvsCount > 0 ? '78%' : '—',
      subtext: 'Objectif marché > 75%',
      trend: '+8.4%',
      isPositive: true,
      icon: TargetIcon,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Compétences Détectées',
      value: cvsCount > 0 ? `${cvsCount * 18 + 7}` : '0',
      subtext: 'Derniers 30 jours',
      trend: '+5.2%',
      isPositive: true,
      icon: ShieldCheckIcon,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between text-left"
          >
            {/* Haut de la carte : Titre et Icône colorée */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <span className="text-xs font-semibold text-slate-500 tracking-tight">
                {c.title}
              </span>
              <div
                className={`w-10 h-10 rounded-xl ${c.iconBg} ${c.iconColor} flex items-center justify-center shrink-0 shadow-2xs`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            {/* Chiffre principal grand format */}
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
              {c.value}
            </div>

            {/* Bas de la carte : Période et indicateur de progression */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
              <span className="text-slate-400 font-medium">{c.subtext}</span>
              <span
                className={`inline-flex items-center gap-1 font-bold ${
                  c.isPositive ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                <TrendingUpIcon className="w-3.5 h-3.5" />
                <span>{c.trend}</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
