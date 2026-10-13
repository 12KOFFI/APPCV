import { useState } from 'react';
import client from '../api/client';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { Card } from './ui/Card';
import {
  DownloadIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  SparklesIcon,
} from './ui/Icons';

export default function AnalyseResult({ analyse, onRecommencer }) {
  const [chargementPdf, setChargementPdf] = useState(false);
  const [erreurPdf, setErreurPdf] = useState('');

  const note = analyse.note ?? 0;

  let etiquetteScore = 'Excellent profil technique';
  let badgeVariant = 'success';
  if (note < 50) {
    etiquetteScore = 'Des ajustements majeurs sont nécessaires';
    badgeVariant = 'error';
  } else if (note < 70) {
    etiquetteScore = 'Profil prometteur à consolider';
    badgeVariant = 'warning';
  }

  async function handleTelechargerPdf() {
    if (!analyse?.id) return;
    setChargementPdf(true);
    setErreurPdf('');
    try {
      const res = await client.get(`/api/analyse/${analyse.id}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport-analyse-${analyse.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      setErreurPdf('Erreur lors du téléchargement du PDF.');
    } finally {
      setChargementPdf(false);
    }
  }

  return (
    <div className="space-y-6 fade-in text-left">
      {/* ── En-tête avec note globale & actions ── */}
      <Card className="p-6 sm:p-8 bg-white border-slate-200/90 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left flex-1">
          <Badge variant="blue" size="sm" className="mb-2">
            Rapport d'audit officiel
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Diagnostic de votre profil
          </h2>
          <p className="text-slate-500 text-sm mt-1">{etiquetteScore}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button
            onClick={handleTelechargerPdf}
            disabled={chargementPdf}
            loading={chargementPdf}
            variant="primary"
            size="md"
            className="shadow-sm"
          >
            <DownloadIcon className="w-4 h-4" />
            <span>Télécharger le rapport PDF</span>
          </Button>

          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-200/80 min-w-[120px] text-center">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">{note}</span>
            <Badge variant={badgeVariant} size="sm" className="mt-1">
              / 100
            </Badge>
          </div>
        </div>
      </Card>

      {erreurPdf && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircleIcon className="w-4 h-4 text-red-600 shrink-0" />
          <span>{erreurPdf}</span>
        </div>
      )}

      {/* ── Grille Points Forts & Faibles ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Points forts */}
        <Card className="p-6 bg-white border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold text-base">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircleIcon className="w-4 h-4" />
            </div>
            <span>Points forts identifiés</span>
          </div>
          <ul className="space-y-3">
            {analyse.pointsForts?.map((point, index) => (
              <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Points faibles / Axes d'amélioration */}
        <Card className="p-6 bg-white border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold text-base">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <AlertCircleIcon className="w-4 h-4" />
            </div>
            <span>Axes d'amélioration</span>
          </div>
          <ul className="space-y-3">
            {analyse.pointsFaibles?.map((point, index) => (
              <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* ── Compétences clés détectées ── */}
      {analyse.competences && analyse.competences.length > 0 && (
        <Card className="p-6 bg-white border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">Compétences clés identifiées</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {analyse.competences.map((comp, index) => (
              <Badge key={index} variant="blue" size="md">
                {comp}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* ── 5 Recommandations concrètes ── */}
      {analyse.recommandations && analyse.recommandations.length > 0 && (
        <Card className="p-6 bg-white border-slate-200/90 shadow-xs">
          <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-900" />
            <span>Plan d'action & Recommandations prioritaires</span>
          </h3>
          <div className="space-y-3">
            {analyse.recommandations.map((rec, index) => (
              <div
                key={index}
                className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs sm:text-sm text-slate-700"
              >
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <p className="flex-1 leading-relaxed pt-0.5">{rec}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Bouton pour recommencer ── */}
      {onRecommencer && (
        <div className="flex justify-end pt-2">
          <Button onClick={onRecommencer} variant="secondary" size="md">
            Refaire une nouvelle analyse
          </Button>
        </div>
      )}
    </div>
  );
}