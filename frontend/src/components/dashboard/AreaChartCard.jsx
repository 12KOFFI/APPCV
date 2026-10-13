import { useState } from 'react';

export default function AreaChartCard() {
  const [periode, setPeriode] = useState('mensuel');
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Données mensuelles réalistes de progression ATS
  const dataMensuelle = [
    { label: 'Jan', score: 55, motsCles: 35 },
    { label: 'Fév', score: 62, motsCles: 42 },
    { label: 'Mar', score: 58, motsCles: 39 },
    { label: 'Avr', score: 68, motsCles: 48 },
    { label: 'Mai', score: 65, motsCles: 45 },
    { label: 'Juin', score: 74, motsCles: 55 },
    { label: 'Juil', score: 72, motsCles: 52 },
    { label: 'Août', score: 78, motsCles: 60 },
    { label: 'Sep', score: 76, motsCles: 58 },
    { label: 'Oct', score: 84, motsCles: 68 },
    { label: 'Nov', score: 81, motsCles: 64 },
    { label: 'Déc', score: 89, motsCles: 75 },
  ];

  const dataTrimestrielle = [
    { label: 'T1', score: 58, motsCles: 39 },
    { label: 'T2', score: 69, motsCles: 49 },
    { label: 'T3', score: 75, motsCles: 57 },
    { label: 'T4', score: 85, motsCles: 69 },
  ];

  const dataAnnuelle = [
    { label: '2024', score: 54, motsCles: 32 },
    { label: '2025', score: 72, motsCles: 54 },
    { label: '2026', score: 85, motsCles: 71 },
  ];

  const data =
    periode === 'mensuel'
      ? dataMensuelle
      : periode === 'trimestriel'
      ? dataTrimestrielle
      : dataAnnuelle;

  // Calcul des coordonnées SVG pour les courbes
  const svgWidth = 720;
  const svgHeight = 260;
  const paddingX = 40;
  const paddingY = 25;
  const usableWidth = svgWidth - paddingX * 2;
  const usableHeight = svgHeight - paddingY * 2;

  function getX(i) {
    if (data.length === 1) return svgWidth / 2;
    return paddingX + (i / (data.length - 1)) * usableWidth;
  }

  function getY(val) {
    // 0 à 100
    return paddingY + usableHeight - (val / 100) * usableHeight;
  }

  // Générateur de chemin lisse (Monotone cubic spline)
  function createPath(accessor) {
    if (data.length === 0) return '';
    const points = data.map((d, i) => [getX(i), getY(accessor(d))]);

    let path = `M ${points[0][0]},${points[0][1]}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0[0] + (p1[0] - p0[0]) * 0.45;
      const cpY1 = p0[1];
      const cpX2 = p0[0] + (p1[0] - p0[0]) * 0.55;
      const cpY2 = p1[1];
      path += ` C ${cpX1},${cpY1} ${cpX2},${cpY2} ${p1[0]},${p1[1]}`;
    }
    return path;
  }

  const lineScore = createPath((d) => d.score);
  const lineMots = createPath((d) => d.motsCles);

  const areaScore = `${lineScore} L ${getX(data.length - 1)},${
    svgHeight - paddingY
  } L ${getX(0)},${svgHeight - paddingY} Z`;
  const areaMots = `${lineMots} L ${getX(data.length - 1)},${
    svgHeight - paddingY
  } L ${getX(0)},${svgHeight - paddingY} Z`;

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between text-left">
      {/* ── En-tête : Titre + Commutateur de période (Mensuel, Trimestriel, Annuel) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Statistiques d'analyse & Score ATS
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualisez la progression de vos scores ATS et l'impact de vos optimisations.
          </p>
        </div>

        {/* Boutons d'onglets de période */}
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/60 self-start sm:self-auto">
          {[
            { id: 'mensuel', label: 'Mensuel' },
            { id: 'trimestriel', label: 'Trimestriel' },
            { id: 'annuel', label: 'Annuel' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setPeriode(tab.id);
                setHoveredIdx(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                periode === tab.id
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Légende ── */}
      <div className="flex items-center gap-6 mb-4 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <span>Score ATS moyen (%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
          <span>Mots-clés optimisés</span>
        </div>
      </div>

      {/* ── Graphique Vectoriel SVG Réactif ── */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-56 sm:h-64 overflow-visible"
        >
          <defs>
            <linearGradient id="gradScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="gradMots" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Lignes de repère horizontales Y */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1.5"
                />
                <text
                  x={paddingX - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] font-medium"
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          {/* Remplissages en dégradé (Aires) */}
          <path d={areaScore} fill="url(#gradScore)" />
          <path d={areaMots} fill="url(#gradMots)" />

          {/* Lignes des courbes */}
          <path
            d={lineMots}
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d={lineScore}
            fill="none"
            stroke="#2563EB"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Ligne verticale de survol */}
          {hoveredIdx !== null && (
            <line
              x1={getX(hoveredIdx)}
              y1={paddingY}
              x2={getX(hoveredIdx)}
              y2={svgHeight - paddingY}
              stroke="#CBD5E1"
              strokeDasharray="4 4"
              strokeWidth="1.5"
            />
          )}

          {/* Points interactifs */}
          {data.map((d, i) => {
            const x = getX(i);
            const yScore = getY(d.score);
            const yMots = getY(d.motsCles);
            const isHovered = hoveredIdx === i;

            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                {/* Zone cliquable invisible élargie */}
                <rect
                  x={x - 20}
                  y={paddingY}
                  width="40"
                  height={usableHeight}
                  fill="transparent"
                />

                {/* Point Mots-clés */}
                <circle
                  cx={x}
                  cy={yMots}
                  r={isHovered ? 5.5 : 3.5}
                  fill="#ffffff"
                  stroke="#38BDF8"
                  strokeWidth="2.5"
                />

                {/* Point Score ATS */}
                <circle
                  cx={x}
                  cy={yScore}
                  r={isHovered ? 6 : 4}
                  fill="#ffffff"
                  stroke="#2563EB"
                  strokeWidth="3"
                />

                {/* Étiquette d'abscisse X */}
                <text
                  x={x}
                  y={svgHeight - 4}
                  textAnchor="middle"
                  className={`text-[11px] font-semibold transition-colors ${
                    isHovered ? 'fill-slate-900 font-bold' : 'fill-slate-400'
                  }`}
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Infobulle de survol flottante */}
        {hoveredIdx !== null && (
          <div
            className="absolute top-2 pointer-events-none p-2.5 rounded-xl bg-slate-900 text-white shadow-xl text-left border border-slate-800 z-10 transition-all text-xs"
            style={{
              left: `${Math.min(
                Math.max((getX(hoveredIdx) / svgWidth) * 100, 15),
                85
              )}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
              {data[hoveredIdx].label} {periode === 'mensuel' ? '2026' : ''}
            </p>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-300">Score ATS :</span>
              <span className="font-extrabold text-blue-400">
                {data[hoveredIdx].score}%
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-300">Mots-clés :</span>
              <span className="font-extrabold text-sky-400">
                {data[hoveredIdx].motsCles}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
