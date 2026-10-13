import { Link } from 'react-router-dom';
import Badge from './ui/Badge';
import Button from './ui/Button';
import { Card } from './ui/Card';
import { FileTextIcon, SparklesIcon, ClockIcon } from './ui/Icons';

export default function CvCard({ cv }) {
  const dateFormatee = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(cv.creeLe));

  const tailleKo = Math.round((cv.nombreCaracteres || 0) / 100);

  return (
    <Card hover className="p-5 flex flex-col justify-between group">
      <div>
        {/* En-tête de la carte */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-200 shrink-0">
            <FileTextIcon className="w-5 h-5" />
          </div>
          <Badge variant="neutral" size="sm">
            {cv.nombreCaracteres} car.
          </Badge>
        </div>

        {/* Informations fichier */}
        <h3
          className="font-bold text-slate-900 text-base truncate mb-1"
          title={cv.nomOriginal}
        >
          {cv.nomOriginal}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
          <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
          <span>Ajouté le {dateFormatee}</span>
          <span className="text-slate-300">•</span>
          <span>~{tailleKo} Ko</span>
        </div>
      </div>

      {/* Barre d'action */}
      <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
        <Link to={`/cv/${cv.id}/analyse`} className="flex-1">
          <Button variant="primary" size="sm" className="w-full">
            <SparklesIcon className="w-3.5 h-3.5 text-white" />
            <span>Auditer</span>
          </Button>
        </Link>
        <Link to={`/cv/${cv.id}/historique`}>
          <Button variant="secondary" size="sm">
            Historique
          </Button>
        </Link>
      </div>
    </Card>
  );
}