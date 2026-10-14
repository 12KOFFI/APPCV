import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Card } from '../ui/Card';
import {
  SparklesIcon,
  CheckCircleIcon,
  LockIcon,
  ArrowRightIcon,
  ClockIcon,
  ShieldCheckIcon,
  FileTextIcon,
} from '../ui/Icons';

export default function TeaserResult({ data, onRecommencer }) {
  const teaser = data?.teaser || { score: 65, constats: [], nombreProblemes: 2 };
  const score = teaser.score ?? 60;
  const constats = teaser.constats || [];
  const nombreProblemes = teaser.nombreProblemes ?? 2;
  const nomOriginal = data?.nomOriginal || 'Votre CV';
  const messageRgpd = data?.messageRgpd || 'Fichier conservé 48h max sans compte';

  // Couleurs selon le score
  const scoreColor =
    score >= 75
      ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
      : score >= 50
      ? 'text-amber-600 dark:text-amber-400 border-amber-500 bg-amber-50 dark:bg-amber-950/40'
      : 'text-red-600 dark:text-red-400 border-red-500 bg-red-50 dark:bg-red-950/40';

  const badgeVariant = score >= 75 ? 'success' : score >= 50 ? 'warning' : 'danger';

  return (
    <div className="space-y-6 fade-in max-w-3xl mx-auto">
      {/* ── 1. En-tête de validation préliminaire ── */}
      <Card className="p-6 sm:p-8 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 shrink-0">
              <FileTextIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate max-w-[280px] sm:max-w-md">
                  {nomOriginal}
                </h2>
                <Badge variant="neutral" size="sm">Pre-Audit ATS</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Analyse structurelle préliminaire instantanée générée avec succès
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/60">
            <ClockIcon className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{messageRgpd}</span>
          </div>
        </div>

        {/* ── 2. Indicateurs Clés : Score & Problèmes Détectés ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card Score préliminaire */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/40 dark:to-slate-900/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-5">
            <div className={`w-18 h-18 rounded-2xl border-2 flex flex-col items-center justify-center font-extrabold shrink-0 shadow-sm ${scoreColor}`}>
              <span className="text-2xl leading-none">{score}</span>
              <span className="text-[10px] font-medium opacity-80 mt-0.5">/ 100</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Score préliminaire ATS</span>
                <Badge variant={badgeVariant} size="sm">
                  {score >= 75 ? 'Solide' : score >= 50 ? 'À perfectionner' : 'Critique'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Estimation basée sur les standards d'indexation des recruteurs et robots ATS.
              </p>
            </div>
          </div>

          {/* Card Nombre de problèmes */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/40 dark:to-slate-900/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-5">
            <div className="w-18 h-18 rounded-2xl border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex flex-col items-center justify-center font-extrabold shrink-0 shadow-sm">
              <span className="text-2xl leading-none">{nombreProblemes}</span>
              <span className="text-[10px] font-medium opacity-80 mt-0.5">alertes</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Points d'attention majeurs</span>
                <Badge variant="warning" size="sm">À corriger</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {nombreProblemes} anomalie{nombreProblemes > 1 ? 's' : ''} structurelle{nombreProblemes > 1 ? 's' : ''} ou lexicale{nombreProblemes > 1 ? 's' : ''} détectée{nombreProblemes > 1 ? 's' : ''}.
              </p>
            </div>
          </div>
        </div>

        {/* ── 3. Constats Réels Extraits ── */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
            Constats préliminaires détectés
          </h3>
          <div className="space-y-2.5">
            {constats.map((constat, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircleIcon className="w-3.5 h-3.5" />
                </div>
                <span className="leading-relaxed font-medium">{constat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. Sections Verrouillées (Aucun payload sensible dans le DOM) ── */}
        <div className="space-y-3 pt-3 teaser-locked-print">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <LockIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Détails & Analyse avancée par IA (Verrouillés)</span>
            </h3>
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
              Débloquable gratuitement
            </span>
          </div>

          <div className="relative rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-5 bg-gradient-to-b from-slate-50/50 to-slate-100/30 dark:from-slate-800/20 dark:to-slate-900/40 overflow-hidden">
            {/* Simulation floutée sans données réelles */}
            <div className="space-y-3 filter blur-[3px] select-none opacity-40 pointer-events-none">
              <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded-md w-3/4"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-full"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-5/6"></div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
              </div>
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-4/5"></div>
            </div>

            {/* Overlay d'invitation avec cadenas */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xs">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20 mb-2.5">
                <LockIcon className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white text-center">
                Audit sémantique complet & Recommandations ciblées
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-md mt-1">
                Identifiez les mots-clés manquants, les faiblesses bloquantes et obtenez les correctifs textuels prêts à l'emploi.
              </p>
            </div>
          </div>
        </div>

        {/* ── 5. Notification RGPD ── */}
        <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
          <ShieldCheckIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold">Engagement de confidentialité RGPD :</span> Votre CV est stocké de manière temporaire et chiffrée pendant <span className="font-semibold">48 heures maximum</span>. En l'absence de création de compte pour le réclamer, il sera définitivement purgé de nos serveurs.
          </div>
        </div>

        {/* ── 6. Bouton CTA Principal & Actions ── */}
        <div className="pt-2 space-y-3">
          <Link to="/register" className="block w-full">
            <Button
              variant="primary"
              size="lg"
              className="w-full justify-center text-sm sm:text-base py-3.5 shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 transition-all font-bold"
            >
              <SparklesIcon className="w-5 h-5 mr-1" />
              <span>Crée un compte gratuit pour débloquer le détail et télécharger le PDF</span>
              <ArrowRightIcon className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <span>Vous avez déjà un compte ?</span>
              <Link
                to="/login"
                className="font-semibold text-slate-900 dark:text-white underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Se connecter pour rattacher ce CV
              </Link>
            </div>

            {onRecommencer && (
              <button
                type="button"
                onClick={onRecommencer}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline transition-colors cursor-pointer"
              >
                Analyser un autre CV
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
