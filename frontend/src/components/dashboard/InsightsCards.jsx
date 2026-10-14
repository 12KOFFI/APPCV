import {
  SparklesIcon,
  CheckCircleIcon,
  MoreVerticalIcon,
  ClockIcon,
} from '../ui/Icons';

export default function InsightsCards({ stats, cvsCount = 0 }) {
  const totalCvs = stats?.totalCvs ?? cvsCount;
  const analysesTerminees = stats?.analysesTerminees ?? 0;
  const derniersConseils = stats?.derniersConseils || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 text-left">
      {/* ── Carte Gauche : Conformité & Audit Technique Réel ── */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                État de Vos Documents
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Surveillance technique de vos fichiers téléversés
              </p>
            </div>
            <button
              type="button"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700"
              aria-label="Options"
            >
              <MoreVerticalIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500">
                Documents Actifs
              </span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{totalCvs}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">
                Stockage sécurisé
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500">
                Analyses Finalisées
              </span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{analysesTerminees}</p>
              <span className="text-[10px] text-blue-600 font-semibold">
                Bilan disponible en PDF
              </span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
            <span>PDF (.pdf) & Word (.docx) supportés</span>
          </span>
          <span className="font-semibold text-slate-900">
            {totalCvs} CV sous gestion
          </span>
        </div>
      </div>

      {/* ── Carte Droite : Recommandations Réelles de l'IA ── */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Recommandations Clés de Vos Analyses
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Conseils extraits de vos bilans de compétences
              </p>
            </div>
            <button
              type="button"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700"
              aria-label="Options"
            >
              <MoreVerticalIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5">
            {derniersConseils.length > 0 ? (
              derniersConseils.slice(0, 3).map((conseil, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100/60 flex items-start gap-2.5"
                >
                  <SparklesIcon className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {conseil}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Aucune recommandation pour l'instant. Lancez l'analyse d'un CV pour recevoir des conseils personnalisés.
              </div>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>Mis à jour en temps réel</span>
          </span>
          <span className="font-semibold text-blue-600">
            {analysesTerminees > 0 ? 'Diagnostic actif' : 'En attente d’analyse'}
          </span>
        </div>
      </div>
    </div>
  );
}
