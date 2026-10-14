import { useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import {
  FileTextIcon,
  SparklesIcon,
  SearchIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
} from '../ui/Icons';

export default function CvTable({ cvs = [], recherche = '', setRecherche }) {
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const cvsFiltres = cvs.filter((cv) =>
    (cv.nomOriginal || '').toLowerCase().includes((recherche || '').toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(cvsFiltres.length / itemsPerPage));
  const cvsAffiches = cvsFiltres.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div
      id="mes-documents"
      className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-left"
    >
      {/* ── En-tête : Titre + Recherche & Filtre ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Mes Documents & Analyses Récentes
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {cvsFiltres.length} document(s) trouvé(s) • Cliquez sur « Analyser » pour calculer votre score ATS
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Recherche dans la table */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <SearchIcon className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              placeholder="Filtrer par nom de fichier..."
              value={recherche}
              onChange={(e) => {
                setRecherche(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs text-slate-900 bg-slate-50/70 border border-slate-200 rounded-xl pl-8 pr-3 py-2 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all shadow-2xs"
            />
          </div>

          {/* Bouton Nouveau CV */}
          <Link to="/upload">
            <Button variant="primary" size="sm" className="shadow-2xs">
              <PlusIcon className="w-3.5 h-3.5" />
              <span>Nouveau CV</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Tableau des Documents Réactifs ── */}
      {cvs.length === 0 ? (
        /* État vide guidé réel */
        <div className="py-14 px-4 text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-2xs">
            <FileTextIcon className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 mb-1">
            Aucun CV pour l'instant
          </h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Importez votre premier document au format PDF ou Word pour obtenir votre analyse ATS complète en 5 secondes.
          </p>
          <Link to="/upload">
            <Button variant="primary" size="md" className="shadow-xs">
              <PlusIcon className="w-4 h-4" />
              <span>Importer un premier CV</span>
            </Button>
          </Link>
        </div>
      ) : cvsFiltres.length === 0 ? (
        /* Recherche sans résultat */
        <div className="py-12 text-center text-slate-500 text-xs">
          Aucun document ne correspond à « <span className="font-semibold text-slate-800">{recherche}</span> ».
        </div>
      ) : (
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 pr-4">Document</th>
                <th className="py-3 px-4">Date d'import</th>
                <th className="py-3 px-4">Statut IA</th>
                <th className="py-3 px-4">Note ATS Réelle</th>
                <th className="py-3 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {cvsAffiches.map((cv) => {
                const date = new Intl.DateTimeFormat('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(new Date(cv.creeLe));

                const isAnalyzed = cv.derniereNote !== null && cv.derniereNote !== undefined;

                return (
                  <tr
                    key={cv.id}
                    className="group hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Colonne Document */}
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <FileTextIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p
                            className="font-bold text-slate-900 truncate max-w-xs group-hover:text-blue-600 transition-colors"
                            title={cv.nomOriginal}
                          >
                            {cv.nomOriginal}
                          </p>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">
                            {cv.typeMime?.includes('pdf') ? 'PDF' : 'DOCX'} • {cv.nombreCaracteres || 0} car.
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Colonne Date */}
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{date}</span>
                      </div>
                    </td>

                    {/* Colonne Statut réel */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {cv.dernierStatut === 'TERMINE' ? (
                        <Badge variant="success" size="sm">
                          <CheckCircleIcon className="w-3 h-3 text-emerald-600" />
                          <span>Analysé</span>
                        </Badge>
                      ) : cv.dernierStatut === 'EN_COURS' ? (
                        <Badge variant="warning" size="sm">
                          <span>En cours...</span>
                        </Badge>
                      ) : cv.dernierStatut === 'EN_ATTENTE' ? (
                        <Badge variant="warning" size="sm">
                          <span>En attente</span>
                        </Badge>
                      ) : cv.dernierStatut === 'ERREUR' ? (
                        <Badge variant="danger" size="sm">
                          <span>Erreur</span>
                        </Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">
                          <span>Prêt à l'analyse</span>
                        </Badge>
                      )}
                    </td>

                    {/* Colonne Note ATS Réelle */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isAnalyzed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-100">
                          <SparklesIcon className="w-3 h-3 text-blue-600" />
                          <span>{cv.derniereNote} / 100</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                          <span>Non analysé</span>
                        </span>
                      )}
                    </td>

                    {/* Colonne Actions */}
                    <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <Link to={`/cv/${cv.id}/analyse`}>
                          <Button variant="primary" size="sm" className="shadow-2xs">
                            <SparklesIcon className="w-3.5 h-3.5" />
                            <span>{isAnalyzed ? 'Ré-analyser' : 'Analyser'}</span>
                          </Button>
                        </Link>
                        <Link to={`/cv/${cv.id}/historique`}>
                          <Button variant="secondary" size="sm" className="text-slate-600">
                            <span>Historique ({cv.nombreAnalyses || 0})</span>
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination en bas de tableau ── */}
      {cvsFiltres.length > itemsPerPage && (
        <div className="flex items-center justify-between pt-5 mt-4 border-t border-slate-100 text-xs">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors font-medium"
          >
            ← Précédent
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setPage(num)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  page === num
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors font-medium"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}
