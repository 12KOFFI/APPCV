import {
  FileTextIcon,
  SparklesIcon,
  CheckCircleIcon,
  MoreVerticalIcon,
  ClockIcon,
} from '../ui/Icons';

export default function InsightsCards({ cvsCount = 0 }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 text-left">
      {/* ── Carte Gauche : Audit & Métriques Techniques ── */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Conformité & Audit Technique
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Indicateurs de lecture par les logiciels ATS
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
                Structure & Lisibilité
              </span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">98.5%</p>
              <span className="text-[10px] text-emerald-600 font-semibold">
                Sans erreurs de parsing
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500">
                Temps d'analyse IA
              </span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">4.2s</p>
              <span className="text-[10px] text-blue-600 font-semibold">
                Traitement asynchrone
              </span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
            <span>Format PDF & Word supportés</span>
          </span>
          <span className="font-semibold text-slate-900">
            {cvsCount} document(s) sous surveillance
          </span>
        </div>
      </div>

      {/* ── Carte Droite : Recommandations Clés de l'IA ── */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Conseils Clés pour Vos Candidatures
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Optimisations prioritaires détectées par notre moteur
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
            <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100/60 flex items-start gap-2.5">
              <SparklesIcon className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900">
                  Débutez vos puces par des verbes d'action
                </p>
                <p className="text-[11px] text-slate-500">
                  Exemple : « Conçu », « Piloté », « Développé » plutôt que « En charge de ».
                </p>
              </div>
              <span className="ml-auto text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 shrink-0">
                +12 pts
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
              <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900">
                  Quantifiez vos réalisations avec des chiffres
                </p>
                <p className="text-[11px] text-slate-500">
                  Exemple : « Augmentation des ventes de 20% » ou « Équipe de 5 personnes ».
                </p>
              </div>
              <span className="ml-auto text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 shrink-0">
                +8 pts
              </span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>Mis à jour en temps réel</span>
          </span>
          <span className="font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
            Consulter le guide complet →
          </span>
        </div>
      </div>
    </div>
  );
}
