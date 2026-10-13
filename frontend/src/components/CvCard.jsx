import { Link } from 'react-router-dom';

export default function CvCard({ cv }) {
  const dateFormatee = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(cv.creeLe));

  return (
    <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-5 hover:border-slate-600 transition shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-lg text-indigo-400 shrink-0">
            📄
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-900/60 px-2 py-1 rounded-md">
            {cv.nombreCaracteres} car.
          </span>
        </div>

        <h3 className="font-semibold text-white text-base truncate mb-1" title={cv.nomOriginal}>
          {cv.nomOriginal}
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Ajouté le {dateFormatee}
        </p>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-slate-700/60">
        <Link
          to={`/cv/${cv.id}/analyse`}
          className="flex-1 py-2 px-3 text-center rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition"
        >
          Analyser
        </Link>
        <Link
          to={`/cv/${cv.id}/historique`}
          className="py-2 px-3 text-center rounded-lg text-xs font-medium text-slate-300 bg-slate-700/80 hover:bg-slate-700 transition"
        >
          Historique
        </Link>
      </div>
    </div>
  );
}