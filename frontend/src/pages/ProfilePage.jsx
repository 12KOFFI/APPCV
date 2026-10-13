import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import client from '../api/client';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import {
  UserIcon,
  LockIcon,
  KeyIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  EyeIcon,
  EyeOffIcon,
} from '../components/ui/Icons';

export default function ProfilePage() {
  const { user } = useAuth();

  // Données de profil enrichies
  const [profilInfo, setProfilInfo] = useState(null);

  // Formulaire de changement de mot de passe
  const [ancienMotDePasse, setAncienMotDePasse] = useState('');
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState('');

  // Toggles de visibilité
  const [showAncien, setShowAncien] = useState(false);
  const [showNouveau, setShowNouveau] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // États du formulaire
  const [soumissionEnCours, setSoumissionEnCours] = useState(false);
  const [messageSucces, setMessageSucces] = useState('');
  const [messageErreur, setMessageErreur] = useState('');

  // Récupérer les informations complètes du profil
  useEffect(() => {
    async function chargerProfil() {
      try {
        const res = await client.get('/api/moi');
        setProfilInfo(res.data);
      } catch {
        // En cas d'erreur ponctuelle, on utilise les données du contexte
        setProfilInfo(user);
      }
    }
    chargerProfil();
  }, [user]);

  // Validation non-technique simple en direct
  const estLongueurOk = nouveauMotDePasse.length >= 8;
  const lesMotsDePasseCorrespondent =
    nouveauMotDePasse.length > 0 &&
    confirmationMotDePasse.length > 0 &&
    nouveauMotDePasse === confirmationMotDePasse;
  const estIdentiqueAncien =
    ancienMotDePasse.length > 0 &&
    nouveauMotDePasse.length > 0 &&
    ancienMotDePasse === nouveauMotDePasse;

  async function handleChangerMotDePasse(e) {
    e.preventDefault();
    setMessageSucces('');
    setMessageErreur('');

    // Vérifications côté client avec messages compréhensibles
    if (!ancienMotDePasse) {
      setMessageErreur('Veuillez saisir votre mot de passe actuel.');
      return;
    }

    if (nouveauMotDePasse.length < 8) {
      setMessageErreur('Le nouveau mot de passe doit comporter au moins 8 caractères.');
      return;
    }

    if (nouveauMotDePasse !== confirmationMotDePasse) {
      setMessageErreur('La confirmation ne correspond pas au nouveau mot de passe saisi.');
      return;
    }

    if (ancienMotDePasse === nouveauMotDePasse) {
      setMessageErreur('Le nouveau mot de passe doit être différent de votre mot de passe actuel.');
      return;
    }

    setSoumissionEnCours(true);

    try {
      const response = await client.post('/api/profil/mot-de-passe', {
        ancienMotDePasse,
        nouveauMotDePasse,
      });

      setMessageSucces(
        response.data?.message || 'Votre mot de passe a été modifié avec succès.'
      );
      // Réinitialiser les champs
      setAncienMotDePasse('');
      setNouveauMotDePasse('');
      setConfirmationMotDePasse('');
    } catch (err) {
      const msgServeur =
        err.response?.data?.erreur ||
        err.response?.data?.message ||
        'Une erreur est survenue lors du changement de mot de passe. Veuillez vérifier votre mot de passe actuel.';
      setMessageErreur(msgServeur);
    } finally {
      setSoumissionEnCours(false);
    }
  }

  const emailAffiche = profilInfo?.email || user?.email || 'mon-compte@email.com';
  const initiales = emailAffiche.charAt(0).toUpperCase();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 fade-in">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* ── Entête & Navigation de retour ── */}
        <div className="pb-2 border-b border-slate-200/80">
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/dashboard"
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors inline-flex items-center gap-1"
            >
              <span>← Retour au Tableau de bord</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Mon Profil & Sécurité
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Gérez simplement vos informations de compte et modifiez votre mot de passe en toute sécurité.
          </p>
        </div>

        {/* ── Carte Récapitulative Identité Compte ── */}
        <Card className="p-6 bg-white shadow-xs border-slate-200">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
              {initiales}
            </div>
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <UserIcon className="w-5 h-5 text-slate-600" />
                <span className="font-extrabold text-slate-900 text-lg truncate">
                  {emailAffiche}
                </span>
                <Badge variant="success" size="sm" className="font-semibold text-[11px]">
                  Compte Actif
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                Identifiant utilisé pour vous connecter et sécuriser votre espace personnel.
              </p>
              <div className="pt-2 flex items-center gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
                  <span>Sécurité renforcée (Chiffrement sécurisé)</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* ── Formulaire de Modification du Mot de Passe ── */}
        <Card className="p-6 sm:p-8 bg-white space-y-6 shadow-xs border-slate-200">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
              <KeyIcon className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Modifier mon mot de passe
              </h2>
              <p className="text-xs text-slate-500">
                Saisissez votre mot de passe actuel puis choisissez votre nouveau code confidentiel.
              </p>
            </div>
          </div>

          {/* Bannière de succès */}
          {messageSucces && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-xs sm:text-sm flex items-start gap-3">
              <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Succès !</span>
                <span>{messageSucces}</span>
              </div>
            </div>
          )}

          {/* Bannière d'erreur */}
          {messageErreur && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircleIcon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Attention</span>
                <span>{messageErreur}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleChangerMotDePasse} className="space-y-5">
            {/* 1. Mot de passe actuel */}
            <div>
              <Input
                id="ancienMotDePasse"
                label="1. Votre mot de passe actuel"
                type={showAncien ? 'text' : 'password'}
                value={ancienMotDePasse}
                onChange={(e) => setAncienMotDePasse(e.target.value)}
                placeholder="Saisissez votre mot de passe actuel"
                required
                icon={<LockIcon className="w-4 h-4" />}
                helperText="Indispensable pour vérifier que vous êtes bien le titulaire du compte."
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowAncien(!showAncien)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                    title={showAncien ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showAncien ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                }
              />
            </div>

            {/* 2. Nouveau mot de passe */}
            <div>
              <Input
                id="nouveauMotDePasse"
                label="2. Votre nouveau mot de passe"
                type={showNouveau ? 'text' : 'password'}
                value={nouveauMotDePasse}
                onChange={(e) => setNouveauMotDePasse(e.target.value)}
                placeholder="Au moins 8 caractères"
                required
                icon={<KeyIcon className="w-4 h-4" />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowNouveau(!showNouveau)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                    title={showNouveau ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showNouveau ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                }
              />

              {/* Indicateurs simples et lisibles en temps réel */}
              <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                <span className="font-semibold text-slate-700 block">Exigences :</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      estLongueurOk
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {estLongueurOk ? '✓' : '•'}
                  </span>
                  <span className={estLongueurOk ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                    Au moins 8 caractères ({nouveauMotDePasse.length}/8)
                  </span>
                </div>

                {ancienMotDePasse && nouveauMotDePasse && (
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        !estIdentiqueAncien
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {!estIdentiqueAncien ? '✓' : '×'}
                    </span>
                    <span
                      className={
                        !estIdentiqueAncien ? 'text-emerald-700 font-medium' : 'text-red-600'
                      }
                    >
                      {!estIdentiqueAncien
                        ? 'Différent du mot de passe actuel'
                        : 'Le nouveau mot de passe doit être différent de l’actuel'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Confirmation */}
            <div>
              <Input
                id="confirmationMotDePasse"
                label="3. Confirmez votre nouveau mot de passe"
                type={showConfirm ? 'text' : 'password'}
                value={confirmationMotDePasse}
                onChange={(e) => setConfirmationMotDePasse(e.target.value)}
                placeholder="Retapez exactement le nouveau mot de passe"
                required
                icon={<KeyIcon className="w-4 h-4" />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                    title={showConfirm ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showConfirm ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                }
              />

              {confirmationMotDePasse.length > 0 && (
                <div className="mt-2 text-xs flex items-center gap-2">
                  {lesMotsDePasseCorrespondent ? (
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <span>✓</span> Les deux mots de passe correspondent parfaitement.
                    </span>
                  ) : (
                    <span className="text-red-500 font-medium flex items-center gap-1">
                      <span>×</span> Les mots de passe ne correspondent pas pour le moment.
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Bouton de validation */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={soumissionEnCours}
                disabled={soumissionEnCours || !estLongueurOk || !lesMotsDePasseCorrespondent}
                className="w-full sm:w-auto"
              >
                Enregistrer mon nouveau mot de passe
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => {
                  setAncienMotDePasse('');
                  setNouveauMotDePasse('');
                  setConfirmationMotDePasse('');
                  setMessageErreur('');
                  setMessageSucces('');
                }}
                disabled={soumissionEnCours}
              >
                Effacer
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
