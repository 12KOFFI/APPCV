import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import client from '../../api/client';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import {
  SearchIcon,
  PlusIcon,
  DownloadIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  EyeIcon,
  EyeOffIcon,
} from '../../components/ui/Icons';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [recherche, setRecherche] = useState('');
  const [roleFiltre, setRoleFiltre] = useState('');
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');

  // Modals state
  const [modalCreation, setModalCreation] = useState(false);
  const [modalEdition, setModalEdition] = useState(null); // user object to edit
  const [modalSuppression, setModalSuppression] = useState(null); // user object to delete
  
  // Form states for creation
  const [nouveauEmail, setNouveauEmail] = useState('');
  const [nouveauMdp, setNouveauMdp] = useState('');
  const [nouveauRole, setNouveauRole] = useState('ROLE_USER');
  const [nouveauActif, setNouveauActif] = useState(true);
  const [showMdp, setShowMdp] = useState(false);
  const [savingUser, setSavingUser] = useState(false);

  // Form states for edition
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('ROLE_USER');
  const [editActif, setEditActif] = useState(true);
  const [editMdp, setEditMdp] = useState('');

  async function chargerUsers() {
    setChargement(true);
    setErreur('');
    try {
      const res = await client.get('/api/admin/users', {
        params: {
          recherche: recherche.trim(),
          role: roleFiltre,
          page,
          limit: 10,
        },
      });
      setUsers(res.data.donnees || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors du chargement des utilisateurs.');
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    chargerUsers();
  }, [page, roleFiltre]);

  function handleRechercheSubmit(e) {
    e.preventDefault();
    setPage(1);
    chargerUsers();
  }

  async function handleCreerSubmit(e) {
    e.preventDefault();
    setSavingUser(true);
    setErreur('');
    setSucces('');
    try {
      await client.post('/api/admin/users', {
        email: nouveauEmail.trim(),
        motDePasse: nouveauMdp,
        role: nouveauRole,
        actif: nouveauActif,
      });
      setSucces(`Utilisateur ${nouveauEmail} créé avec succès.`);
      setModalCreation(false);
      setNouveauEmail('');
      setNouveauMdp('');
      setNouveauRole('ROLE_USER');
      chargerUsers();
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la création.');
    } finally {
      setSavingUser(false);
    }
  }

  function ouvrirEdition(user) {
    setModalEdition(user);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditActif(user.actif);
    setEditMdp('');
    setErreur('');
    setSucces('');
  }

  async function handleModifierSubmit(e) {
    e.preventDefault();
    if (!modalEdition) return;
    setSavingUser(true);
    setErreur('');
    setSucces('');
    try {
      const payload = {
        email: editEmail.trim(),
        role: editRole,
        actif: editActif,
      };
      if (editMdp.trim()) {
        payload.motDePasse = editMdp.trim();
      }
      await client.put(`/api/admin/users/${modalEdition.id}`, payload);
      setSucces(`Utilisateur #${modalEdition.id} mis à jour avec succès.`);
      setModalEdition(null);
      chargerUsers();
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la modification.');
    } finally {
      setSavingUser(false);
    }
  }

  async function handleConfirmerSuppression() {
    if (!modalSuppression) return;
    setSavingUser(true);
    setErreur('');
    setSucces('');
    try {
      await client.delete(`/api/admin/users/${modalSuppression.id}`);
      setSucces(`Utilisateur #${modalSuppression.id} (${modalSuppression.email}) supprimé avec succès.`);
      setModalSuppression(null);
      chargerUsers();
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la suppression.');
    } finally {
      setSavingUser(false);
    }
  }

    async function handleExportUsers() {
    try {
      const res = await client.get('/api/admin/export/users', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `utilisateurs-appcv-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setErreur('Impossible d\'exporter les utilisateurs.');
    }
  }

  return (
    <div className="space-y-6 fade-in">
      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Gestion des Utilisateurs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {total} compte(s) enregistré(s) sur la plateforme. Gérez les rôles, les accès et les statuts des utilisateurs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={handleExportUsers} className="cursor-pointer">
            <DownloadIcon className="w-3.5 h-3.5 mr-1" />
            Exporter CSV
          </Button>
          <Button variant="primary" size="sm" onClick={() => setModalCreation(true)} className="cursor-pointer">
            <PlusIcon className="w-3.5 h-3.5 mr-1" />
            Nouvel Utilisateur
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {succes && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{succes}</span>
          </div>
          <button onClick={() => setSucces('')} className="text-emerald-700 font-bold hover:underline cursor-pointer">×</button>
        </div>
      )}

      {erreur && (
        <div className="p-4 rounded-xl bg-red-50 text-red-800 border border-red-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircleIcon className="w-4 h-4 text-red-600 shrink-0" />
            <span>{erreur}</span>
          </div>
          <button onClick={() => setErreur('')} className="text-red-700 font-bold hover:underline cursor-pointer">×</button>
        </div>
      )}

      {/* ── Barre de Filtres & Recherche ── */}
      <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800">
        <form onSubmit={handleRechercheSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par adresse email ou ID..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={roleFiltre}
              onChange={(e) => {
                setRoleFiltre(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="">Tous les rôles</option>
              <option value="ROLE_USER">Utilisateur (ROLE_USER)</option>
              <option value="ROLE_ADMIN">Administrateur (ROLE_ADMIN)</option>
            </select>

            <Button type="submit" variant="secondary" size="sm">
              Filtrer
            </Button>
          </div>
        </form>
      </Card>

      {/* ── Table des Utilisateurs ── */}
      <Card className="overflow-hidden bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 font-bold">ID</th>
                <th className="py-3.5 px-4 font-bold">Utilisateur</th>
                <th className="py-3.5 px-4 font-bold">Rôle</th>
                <th className="py-3.5 px-4 font-bold">Statut</th>
                <th className="py-3.5 px-4 font-bold">CVs / ATS Moyen</th>
                <th className="py-3.5 px-4 font-bold">Date Inscription</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {chargement ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="spinner mx-auto mb-2" />
                    Chargement des comptes...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Aucun utilisateur trouvé pour ces critères de recherche.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const initiales = u.email ? u.email.substring(0, 2).toUpperCase() : 'U';
                  const isAdmin = u.role === 'ROLE_ADMIN' || u.roles?.includes('ROLE_ADMIN');

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-400 font-bold">
                        #{u.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-2xs ${
                            isAdmin ? 'bg-purple-600' : 'bg-slate-800'
                          }`}>
                            {initiales}
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]" title={u.email}>
                            {u.email}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {isAdmin ? (
                          <Badge variant="purple" size="sm">Admin</Badge>
                        ) : (
                          <Badge variant="neutral" size="sm">Utilisateur</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {u.actif ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Suspendu
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{u.nombreCvs} CV</span>
                          {u.scoreMoyen !== null && (
                            <Badge variant={u.scoreMoyen >= 70 ? 'success' : u.scoreMoyen >= 50 ? 'blue' : 'warning'} size="sm">
                              {u.scoreMoyen}%
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {u.creeLe ? new Date(u.creeLe).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/admin/users/${u.id}`}
                            className="px-2.5 py-1 rounded-md text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 transition cursor-pointer inline-flex items-center"
                            title="Consulter la fiche détaillée & analyses ATS"
                          >
                            Détails
                          </Link>
                          <button
                            type="button"
                            onClick={() => ouvrirEdition(u)}
                            className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 transition cursor-pointer"
                            title="Modifier"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => setModalSuppression(u)}
                            className="px-2 py-1 rounded-md text-[11px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/60 transition cursor-pointer"
                            title="Supprimer"
                          >
                            ×
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {page} sur {totalPages} ({total} utilisateurs au total)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Précédent
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Modal Création d'Utilisateur ── */}
      {modalCreation && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-5 fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Ajouter un Nouvel Utilisateur
              </h3>
              <button
                type="button"
                onClick={() => setModalCreation(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreerSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Adresse Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="nom@exemple.com"
                  value={nouveauEmail}
                  onChange={(e) => setNouveauEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mot de passe temporaire * (min. 8 caractères)
                </label>
                <div className="relative">
                  <input
                    type={showMdp ? 'text' : 'password'}
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={nouveauMdp}
                    onChange={(e) => setNouveauMdp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMdp(!showMdp)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showMdp ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Rôle Attribué
                  </label>
                  <select
                    value={nouveauRole}
                    onChange={(e) => setNouveauRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="ROLE_USER">Utilisateur Standard</option>
                    <option value="ROLE_ADMIN">Administrateur</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Statut du Compte
                  </label>
                  <select
                    value={nouveauActif ? '1' : '0'}
                    onChange={(e) => setNouveauActif(e.target.value === '1')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="1">Actif</option>
                    <option value="0">Suspendu</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setModalCreation(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={savingUser}
                  disabled={savingUser}
                >
                  Créer l'utilisateur
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Édition d'Utilisateur ── */}
      {modalEdition && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-5 fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Modifier l'Utilisateur #{modalEdition.id}
              </h3>
              <button
                type="button"
                onClick={() => setModalEdition(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleModifierSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Adresse Email
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Rôle
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="ROLE_USER">Utilisateur Standard</option>
                    <option value="ROLE_ADMIN">Administrateur</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Statut (Soft Ban)
                  </label>
                  <select
                    value={editActif ? '1' : '0'}
                    onChange={(e) => setEditActif(e.target.value === '1')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="1">Actif</option>
                    <option value="0">Suspendu (Accès bloqué)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Réinitialiser le mot de passe (Optionnel)
                </label>
                <input
                  type="password"
                  placeholder="Laisser vide pour conserver le mot de passe actuel"
                  value={editMdp}
                  onChange={(e) => setEditMdp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setModalEdition(null)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={savingUser}
                  disabled={savingUser}
                >
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Confirmation Suppression ── */}
      {modalSuppression && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full p-6 space-y-4 fade-in">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircleIcon className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Supprimer cet utilisateur ?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Êtes-vous sûr de vouloir supprimer définitivement <strong>{modalSuppression.email}</strong> ? Tous ses CVs téléversés et analyses associées seront également détruits du serveur.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setModalSuppression(null)}
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={savingUser}
                disabled={savingUser}
                onClick={handleConfirmerSuppression}
              >
                Confirmer la suppression
              </Button>
            </div>
          </div>
        </div>
      )}

      </div>
  );
}
