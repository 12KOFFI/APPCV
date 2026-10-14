import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChartIcon, PlusIcon } from '../ui/Icons';

export default function AreaChartCard({ historique = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Formater l'historique réel des analyses
  const data = (historique || []).map((h, idx) => {
    const d = new Date(h.creeLe);
    const label = new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
    }).format(d);

    return {
      label: label || `CV #${idx + 1}`,
      nomCv: h.nomCv || `CV #${idx + 1}`,
      score: h.score ?? 0,
      id: h.id,
      cvId: h.cvId,
    };
  });

  // Dimensions SVG
  const svgWidth = 720;
  const svgHeight = 240;
  const paddingX = 40;
  const paddingY = 25;
  const usableWidth = svgWidth - paddingX * 2;
  const usableHeight = svgHeight - paddingY * 2;

  function getX(i) {
    if (data.length <= 1) return svgWidth / 2;
    return paddingX + (i / (data.length - 1)) * usableWidth;
  }

  function getY(val) {
    return paddingY + usableHeight - (Math.min(Math.max(val, 0), 100) / 100) * usableHeight;
  }

  // Génération de chemin lisse
  function createPath() {
    if (data.length === 0) return '';
    if (data.length === 1) return `M ${paddingX},${getY(data[0].score)} L ${svgWidth - paddingX},${getY(data[0].score)}`;

    const points = data.map((d, i) => [getX(i), getY(d.score)]);
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

  const lineScore = createPath();
  const areaScore =
    data.length > 1
      ? `${lineScore} L ${getX(data.length - 1)},${svgHeight - paddingY} L ${getX(0)},${svgHeight - paddingY} Z`
      : '';

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between text-left h-full">
      {/* ── En-tête : Titre & Badge ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Statistiques d'analyse & Score ATS
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Vue administrateur : progression globale des scores ATS et volume d'analyses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>{data.length} analyse(s) enregistrée(s)</span>
          </span>
        </div>
      </div>

      {/* ── Contenu : Graphique réel OU État vide si aucune analyse ── */}
      {data.length === 0 ? (
        <div className="py-12 px-4 text-center my-auto flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
            <BarChartIcon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Aucune analyse réalisée pour le moment
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mb-5 leading-relaxed">
            Dès que vous lancerez l'audit d'un CV, la courbe de vos notes réelles apparaîtra ici.
          </p>
          <Link to="/upload">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-black transition-colors shadow-2xs"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              <span>Déposer un CV pour l'analyser</span>
            </button>
          </Link>
        </div>
      ) : (
        <div className="relative w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-56 sm:h-60 overflow-visible"
          >
            <defs>
              <linearGradient id="realGradScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
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

            {/* Dégradé sous la courbe */}
            {areaScore && <path d={areaScore} fill="url(#realGradScore)" />}

            {/* Ligne de score réelle */}
            <path
              d={lineScore}
              fill="none"
              stroke="#2563EB"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Ligne verticale de survol */}
            {hoveredIdx !== null && data.length > 1 && (
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

            {/* Points interactifs réels */}
            {data.map((d, i) => {
              const x = getX(i);
              const yScore = getY(d.score);
              const isHovered = hoveredIdx === i;

              return (
                <g
                  key={i}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="cursor-pointer"
                >
                  <rect
                    x={x - 20}
                    y={paddingY}
                    width="40"
                    height={usableHeight}
                    fill="transparent"
                  />

                  <circle
                    cx={x}
                    cy={yScore}
                    r={isHovered ? 6 : 4}
                    fill="#ffffff"
                    stroke="#2563EB"
                    strokeWidth="3"
                  />

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
              className="absolute top-2 pointer-events-none p-2.5 rounded-xl bg-slate-900 text-white shadow-xl text-left border border-slate-800 z-10 text-xs"
              style={{
                left: `${Math.min(
                  Math.max((getX(hoveredIdx) / svgWidth) * 100, 15),
                  85
                )}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5 truncate max-w-[180px]">
                {data[hoveredIdx].nomCv}
              </p>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-300">Score ATS :</span>
                <span className="font-extrabold text-blue-400">
                  {data[hoveredIdx].score} / 100
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
