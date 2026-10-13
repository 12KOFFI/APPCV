import { useState, useRef } from 'react';
import Badge from './ui/Badge';
import { UploadIcon, FileTextIcon, CheckCircleIcon, AlertCircleIcon } from './ui/Icons';

export default function FileDropzone({ onFichierSelectionne, disabled }) {
  const [estSurvole, setEstSurvole] = useState(false);
  const [fichierLocal, setFichierLocal] = useState(null);
  const [erreur, setErreur] = useState('');
  const inputRef = useRef(null);

  const extensionsAcceptees = ['.pdf', '.docx'];
  const tailleMaxMo = 5;

  function validerEtTransmettre(fichier) {
    setErreur('');
    if (!fichier) return;

    const nomFichier = fichier.name.toLowerCase();
    const estValide = extensionsAcceptees.some((ext) => nomFichier.endsWith(ext));

    if (!estValide) {
      setErreur('Format non accepté. Seuls les fichiers PDF et Word (.docx) sont autorisés.');
      return;
    }

    if (fichier.size > tailleMaxMo * 1024 * 1024) {
      setErreur(`Le fichier est trop volumineux (maximum ${tailleMaxMo} Mo).`);
      return;
    }

    setFichierLocal(fichier);
    onFichierSelectionne(fichier);
  }

  function handleDrop(e) {
    e.preventDefault();
    setEstSurvole(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validerEtTransmettre(e.dataTransfer.files[0]);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    if (!disabled) setEstSurvole(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setEstSurvole(false);
  }

  return (
    <div className="w-full text-left">
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`dropzone-saas ${estSurvole ? 'active border-slate-900 bg-slate-50' : ''} ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              validerEtTransmettre(e.target.files[0]);
            }
          }}
          disabled={disabled}
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
            {fichierLocal ? (
              <FileTextIcon className="w-6 h-6 text-slate-900" />
            ) : (
              <UploadIcon className="w-6 h-6 text-slate-700" />
            )}
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold text-slate-900">
              {fichierLocal ? (
                <span className="flex items-center justify-center gap-1.5 text-slate-900">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                  <span>{fichierLocal.name}</span>
                </span>
              ) : (
                'Glissez-déposez votre CV ici, ou parcourez vos fichiers'
              )}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Documents acceptés : PDF ou Word (.docx) — Taille maximale : 5 Mo
            </p>
          </div>

          {fichierLocal && (
            <Badge variant="neutral" size="sm">
              {(fichierLocal.size / (1024 * 1024)).toFixed(2)} Mo
            </Badge>
          )}
        </div>
      </div>

      {erreur && (
        <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircleIcon className="w-4 h-4 text-red-600 shrink-0" />
          <span>{erreur}</span>
        </div>
      )}
    </div>
  );
}