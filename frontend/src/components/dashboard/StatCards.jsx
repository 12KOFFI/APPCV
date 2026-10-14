import {
  FileTextIcon,
  FolderIcon,
  TargetIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
} from '../ui/Icons';

export default function StatCards({ stats, cvsCount = 0 }) {
  const totalCvs = stats?.totalCvs ?? cvsCount;
  const totalAnalyses = stats?.totalAnalyses ?? 0;
  const analysesTerminees = stats?.analysesTerminees ?? 0;
  const scoreMoyen = stats?.scoreMoyen;
  const totalCompetences = stats?.totalCompetences ?? 0;

  const cards = [
    {
      title: 'Total des CV',
      value: `${totalCvs}`,
      subtext: totalCvs > 1 ? 'Documents enregistrés' : 'Document enregistré',
      trend: totalCvs > 0 ? `${totalCvs} actif(s)` : 'Aucun',
      isPositive: totalCvs > 0,
      icon: FileTextIcon,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Analyses IA Réalisées',
      value: `${analysesTerminees}`,
      subtext: totalAnalyses > analysesTerminees ? `${totalAnalyses - analysesTerminees} en cours` : 'Rapports complétés',
      trend: analysesTerminees > 0 ? `${analysesTerminees} finalisée(s)` : 'Aucune',
      isPositive: analysesTerminees > 0,
      icon: FolderIcon,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
    {
      title: 'Score ATS Moyen',
      value: scoreMoyen !== null && scoreMoyen !== undefined ? `${scoreMoyen}%` : '—',
      subtext: scoreMoyen ? 'Moyenne de vos bilans' : 'Aucun CV analysé',
      trend: scoreMoyen ? (scoreMoyen >= 75 ? 'Optimal' : 'À améliorer') : 'En attente',
      isPositive: scoreMoyen ? scoreMoyen >= 70 : false,
      icon: TargetIcon,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Compétences Détectées',
      value: `${totalCompetences}`,
      subtext: totalCompetences > 0 ? 'Compétences uniques indexées' : 'En attente d\'analyse',
      trend: totalCompetences > 0 ? `${totalCompetences} identifiée(s)` : '0',
      isPositive: totalCompetences > 0,
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

            {/* Bas de la carte : Période et indicateur réel */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
              <span className="text-slate-400 font-medium">{c.subtext}</span>
              <span
                className={`inline-flex items-center gap-1 font-bold ${
                  c.isPositive ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                {c.isPositive && <TrendingUpIcon className="w-3.5 h-3.5" />}
                <span>{c.trend}</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
