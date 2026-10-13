import { Link } from 'react-router-dom';
import Badge from './ui/Badge';
import Button from './ui/Button';
import { Card } from './ui/Card';
import { FileTextIcon, SparklesIcon, ClockIcon, CheckCircleIcon } from './ui/Icons';

export default function CvCard({ cv }) {
  const dateFormatee = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(cv.creeLe));

  return (
    <Card hover className="p-6 flex flex-col justify-between group bg-white border-slate-200/90 shadow-xs text-left">
      <div>
        {/* En-tête : Icône de fichier + Statut de lecture simple */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <FileTextIcon className="w-6 h-6" />
          </div>
          <Badge variant="success" size="sm" className="font-semibold">
            <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>Prêt à l'analyse</span>
          </Badge>
        </div>

        {/* Titre du document (nom du fichier) */}
        <h3
          className="font-bold text-slate-900 text-base truncate mb-1"
          title={cv.nomOriginal}
        >
          {cv.nomOriginal}
        </h3>

        {/* Date d'ajout en clair */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
          <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
          <span>Ajouté le {dateFormatee}</span>
        </div>

        {/* Petit texte rassurant et compréhensible */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 mb-6 space-y-1">
          <p className="font-semibold text-slate-800">Que pouvez-vous faire ?</p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Obtenez une note sur 100 et découvrez comment perfectionner ce CV pour vos futurs entretiens.
          </p>
        </div>
      </div>

      {/* Boutons d'action limpides */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <Link to={`/cv/${cv.id}/analyse`} className="block w-full">
          <Button variant="primary" size="md" className="w-full shadow-xs">
            <SparklesIcon className="w-4 h-4 text-white" />
            <span>Analyser ce CV</span>
          </Button>
        </Link>
        <Link to={`/cv/${cv.id}/historique`} className="block w-full">
          <Button variant="secondary" size="sm" className="w-full text-slate-600">
            <span>Voir mes anciens rapports</span>
          </Button>
        </Link>
      </div>
    </Card>
  );
}