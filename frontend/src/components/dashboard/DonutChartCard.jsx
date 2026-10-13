import { useState } from 'react';
import { MoreVerticalIcon, SparklesIcon, TargetIcon, ShieldCheckIcon } from '../ui/Icons';

export default function DonutChartCard({ cvsCount = 0 }) {
  const [activeItem, setActiveItem] = useState(null);

  // Pourcentages des segments du Donut
  const segments = [
    {
      id: 'excellent',
      label: 'Scores Excellents (> 80%)',
      subtext: 'Prêts aux recruteurs',
      percent: 62,
      color: '#2563EB', // Blue 600
      accentClass: 'bg-blue-600',
      icon: SparklesIcon,
      count: cvsCount > 0 ? Math.max(1, Math.round(cvsCount * 0.62)) : 0,
      badgeText: 'Optimal',
      badgeColor: 'text-blue-600',
    },
    {
      id: 'bon',
      label: 'Profils Favorables (60-80%)',
      subtext: 'Ajustements mineurs',
      percent: 28,
      color: '#38BDF8', // Sky 400
      accentClass: 'bg-sky-400',
      icon: TargetIcon,
      count: cvsCount > 0 ? Math.max(0, Math.round(cvsCount * 0.28)) : 0,
      badgeText: 'Favorable',
      badgeColor: 'text-sky-600',
    },
    {
      id: 'optimiser',
      label: 'À perfectionner (< 60%)',
      subtext: 'Mots-clés à enrichir',
      percent: 10,
      color: '#CBD5E1', // Slate 300
      accentClass: 'bg-slate-300',
      icon: ShieldCheckIcon,
      count: cvsCount > 0 ? Math.max(0, Math.round(cvsCount * 0.10)) : 0,
      badgeText: 'À revoir',
      badgeColor: 'text-slate-500',
    },
  ];

  // Paramètres géométriques SVG pour anneau Donut
  const radius = 68;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  // Calcul du strokeDashoffset pour chaque segment
  let accumulatedOffset = 0;
  const renderedSegments = segments.map((seg) => {
    const strokeDasharray = `${(seg.percent / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedOffset;
    accumulatedOffset += (seg.percent / 100) * circumference;
    return { ...seg, strokeDasharray, strokeDashoffset };
  });

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between text-left">
      {/* ── En-tête de la carte ── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Répartition des Profils ATS
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Classification des analyses</p>
        </div>
        <button
          type="button"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
          aria-label="Options"
        >
          <MoreVerticalIcon className="w-4 h-4" />
        </button>
      </div>

      {/* ── Anneau Donut SVG centré ── */}
      <div className="relative flex items-center justify-center my-3">
        <svg
          width="180"
          height="180"
          viewBox="0 0 180 180"
          className="transform -rotate-90"
        >
          {/* Cercle d'arrière-plan */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
          />

          {/* Segments colorés */}
          {renderedSegments.map((seg) => (
            <circle
              key={seg.id}
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={seg.strokeDasharray}
              strokeDashoffset={seg.strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 cursor-pointer hover:opacity-90"
              onMouseEnter={() => setActiveItem(seg.id)}
              onMouseLeave={() => setActiveItem(null)}
            />
          ))}
        </svg>

        {/* Texte au centre du Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {cvsCount > 0 ? '78%' : '—'}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Score Moyen
          </span>
        </div>
      </div>

      {/* ── Liste de répartition détaillée sous le Donut ── */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        {segments.map((seg) => {
          const Icon = seg.icon;
          const isActive = activeItem === seg.id;
          return (
            <div
              key={seg.id}
              onMouseEnter={() => setActiveItem(seg.id)}
              onMouseLeave={() => setActiveItem(null)}
              className={`flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer ${
                isActive ? 'bg-slate-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${seg.color}15`, color: seg.color }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {seg.label}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                    {seg.subtext}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-xs font-extrabold ${seg.badgeColor}`}>
                  {seg.percent}%
                </span>
                <p className="text-[10px] text-slate-400">{seg.badgeText}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Pied de carte ── */}
      <div className="pt-3 mt-2 border-t border-slate-100 text-center">
        <span className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
          Voir tous les critères d'évaluation →
        </span>
      </div>
    </div>
  );
}
