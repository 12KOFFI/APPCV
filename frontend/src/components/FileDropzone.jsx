import { useState, useRef } from 'react';

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
    <div className="w-full">
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`dropzone cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          estSurvole
            ? 'dropzone-active border-indigo-500 bg-indigo-500/10 scale-[1.01]'
            : 'border-slate-700 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/70'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
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
          <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center text-2xl text-indigo-400">
            📄
          </div>
          <div>
            <p className="text-base font-medium text-slate-200">
              {fichierLocal ? (
                <span className="text-indigo-400 font-semibold">{fichierLocal.name}</span>
              ) : (
                'Glissez-déposez votre CV ici, ou cliquez pour parcourir'
              )}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Formats acceptés : PDF ou Word (.docx) — Max 5 Mo
            </p>
          </div>
          {fichierLocal && (
            <span className="text-xs font-mono bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full">
              {(fichierLocal.size / (1024 * 1024)).toFixed(2)} Mo
            </span>
          )}
        </div>
      </div>

      {erreur && (
        <p className="mt-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">
          ⚠️ {erreur}
        </p>
      )}
    </div>
  );
}