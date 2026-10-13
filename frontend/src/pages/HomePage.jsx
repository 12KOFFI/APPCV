import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import {
  FileTextIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  DownloadIcon,
  ShieldCheckIcon,
  BarChartIcon,
  ChevronDownIcon,
} from '../components/ui/Icons';

export default function HomePage() {
  const [faqOuverte, setFaqOuverte] = useState(0);

  const faqs = [
    {
      question: "Comment l'IA analyse-t-elle mon CV ?",
      reponse:
        "Notre moteur extrait le texte de votre fichier PDF ou Word, puis analyse la structure, la densité de compétences, la lisibilité et la pertinence face aux filtres ATS (Applicant Tracking Systems). Vous recevez un score sur 100 ainsi que 5 recommandations concrètes pour maximiser l'impact auprès des recruteurs.",
    },
    {
      question: "Puis-je adapter mon CV à une offre d'emploi précise ?",
      reponse:
        "Oui ! Lors de l'analyse, vous pouvez coller le texte de l'offre visée. L'IA compare directement les compétences requises par le recruteur avec celles présentes sur votre CV et vous indique précisément les mots-clés manquants.",
    },
    {
      question: "Mes données personnelles sont-elles protégées ?",
      reponse:
        "Absolument. Vos documents sont stockés hors de la racine publique du serveur, renommés de manière chiffrée et traités de façon strictement confidentielle. Nous ne vendons pas vos données et ne les utilisons pas pour entraîner des modèles publics.",
    },
    {
      question: "Quels formats de fichiers sont acceptés ?",
      reponse:
        "Nous acceptons les formats PDF (.pdf) et Microsoft Word (.docx) jusqu'à une taille maximale de 5 Mo.",
    },
    {
      question: "Combien de temps prend l'audit d'un CV ?",
      reponse:
        "Grâce à notre architecture asynchrone par file de messages (Symfony Messenger), l'analyse complète prend généralement entre 3 et 8 secondes.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* ══════════════════════════════════════════════════════════════════
          HERO SECTION
          ══════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Décoration géométrique sobre en arrière-plan */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none -z-10">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-blue-50/60 to-transparent blur-3xl rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge de statut */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-700">Audit de CV propulsé par l'IA • Version 2026</span>
          </div>

          {/* Titre orienté bénéfice chiffré */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
            Multipliez par 3 vos entretiens d'embauche grâce à l'IA
          </h1>

          {/* Sous-titre court et percutant */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Téléversez votre CV. Notre intelligence artificielle audite vos forces, comble vos lacunes face aux filtres ATS et génère un rapport officiel en PDF prêt pour vos candidatures.
          </p>

          {/* Double CTA LoopCV */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-12">
            <Link to="/register">
              <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md">
                <span>Analyser mon CV gratuitement</span>
                <ArrowRightIcon className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Consulter mes analyses
              </Button>
            </Link>
          </div>

          {/* Preuve sociale & Badge statistique */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-slate-600">
            {/* Avatars empilés */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white">JD</div>
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white">SL</div>
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white">MK</div>
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white">AN</div>
              </div>
              <div className="text-left">
                <div className="flex items-center text-amber-500 text-xs">★★★★★</div>
                <span className="font-semibold text-slate-800">+25 000 CV audités</span>
              </div>
            </div>

            <span className="hidden sm:inline text-slate-300">•</span>

            <div className="flex items-center gap-1.5 font-medium text-slate-700 bg-white px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
              <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
              <span><strong>92 %</strong> des candidats améliorent leur taux de réponse</span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            MOCKUP DASHBOARD INTERACTIF EN PERSPECTIVE
            ══════════════════════════════════════════════════════════════════ */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 sm:mt-18">
          <div className="relative rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white shadow-2xl overflow-hidden p-4 sm:p-8">
            {/* Barre de fenêtre macOS */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs font-semibold text-slate-400 font-mono">rapport-analyse-cv.pdf</span>
              </div>
              <Badge variant="success" size="sm">Score d'impact : 88 / 100</Badge>
            </div>

            {/* Grille du faux aperçu de dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Carte Score */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Score Global</span>
                  <div className="text-4xl font-extrabold text-slate-900 mt-2">88<span className="text-base text-slate-500 font-normal">/100</span></div>
                  <p className="text-xs text-emerald-600 font-medium mt-1">✓ Profil hautement compétitif</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                  <span>Temps d'audit</span>
                  <span className="font-semibold text-slate-700">4.2s</span>
                </div>
              </div>

              {/* Compétences détectées */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 md:col-span-2">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Compétences Clés Détectées</span>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="blue">PHP 8.3</Badge>
                  <Badge variant="blue">Symfony 7.4</Badge>
                  <Badge variant="blue">React 19</Badge>
                  <Badge variant="blue">Architecture API REST</Badge>
                  <Badge variant="blue">Docker</Badge>
                  <Badge variant="blue">MySQL 9</Badge>
                  <Badge variant="blue">CI/CD</Badge>
                  <Badge variant="blue">PHPUnit</Badge>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 text-xs text-slate-700 flex items-start gap-2">
                    <span className="text-emerald-500 font-bold shrink-0">✓</span>
                    <span>Structure claire et adaptée aux robots de sélection ATS.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 text-xs text-slate-700 flex items-start gap-2">
                    <span className="text-blue-500 font-bold shrink-0">💡</span>
                    <span>Recommandation : quantifier l'impact de vos réalisations avec des pourcentages chiffrés.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          COMMENT ÇA MARCHE (3 ÉTAPES NUMÉROTÉES LOOPCV)
          ══════════════════════════════════════════════════════════════════ */}
      <section id="comment-ca-marche" className="py-20 sm:py-28 bg-white border-y border-slate-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2 block">Parcours simplifié</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Comment ça fonctionne en 3 étapes
            </h2>
            <p className="text-slate-600 mt-3 text-base">
              Pas de formulaire interminable. Obtenez votre diagnostic d'employabilité en moins de 60 secondes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Étape 1 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <div>
                <span className="text-3xl font-black text-slate-300 font-mono mb-4 block">01</span>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Importez votre CV</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Glissez-déposez votre document PDF ou Word. Notre extracteur natif lit le contenu binaire sans perte de mise en forme.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <FileTextIcon className="w-4 h-4 text-slate-400" />
                Formats PDF & DOCX jusqu'à 5 Mo
              </div>
            </div>

            {/* Étape 2 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <div>
                <span className="text-3xl font-black text-slate-300 font-mono mb-4 block">02</span>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Audit IA & Matching</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Notre modèle évalue la structure de votre profil, compare vos compétences face aux standards du marché et détecte les lacunes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <SparklesIcon className="w-4 h-4 text-blue-600" />
                Traitement asynchrone en tâche de fond
              </div>
            </div>

            {/* Étape 3 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <div>
                <span className="text-3xl font-black text-slate-300 font-mono mb-4 block">03</span>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Téléchargez le rapport PDF</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Consultez votre score sur 100, appliquez les 5 recommandations prioritaires et téléchargez votre synthèse imprimable.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <DownloadIcon className="w-4 h-4 text-slate-400" />
                Génération vectorielle via Dompdf
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          GRILLE DES FONCTIONNALITÉS
          ══════════════════════════════════════════════════════════════════ */}
      <section id="fonctionnalites" className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2 block">Outils & Avantages</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tout ce dont vous avez besoin pour maximiser votre impact
            </h2>
            <p className="text-slate-600 mt-3 text-base">
              Conçu pour éliminer les refus automatiques et valoriser votre parcours auprès des recruteurs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="p-6">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 mb-4">
                <CheckCircleIcon className="w-5 h-5 text-slate-900" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Scanner de compatibilité ATS</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Vérifiez que vos titres, compétences et sections franchissent les filtres de tri automatisés des entreprises.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="p-6">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 mb-4">
                <SparklesIcon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Matching d'offre sur-mesure</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Collez l'annonce du poste visé pour un diagnostic précis et une liste des termes stratégiques à intégrer.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="p-6">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 mb-4">
                <BarChartIcon className="w-5 h-5 text-slate-900" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Score objectif sur 100</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Visualisez la note globale de votre profil et comprenez immédiatement vos points forts et axes d'amélioration.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="p-6">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 mb-4">
                <DownloadIcon className="w-5 h-5 text-slate-900" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Exportation PDF instantanée</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Téléchargez un rapport officiel imprimable au format A4 généré côté serveur pour vos bilans de compétences.
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className="p-6">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 mb-4">
                <FileTextIcon className="w-5 h-5 text-slate-900" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Historique des versions</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Consultez l'historique complet de vos analyses passées sans devoir relancer l'IA ni payer à nouveau.
              </p>
            </Card>

            {/* Feature 6 */}
            <Card className="p-6">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 mb-4">
                <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Protection & Confidentialité</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Vos documents sont stockés en sécurité hors racine web et protégés contre les failles d'accès direct (IDOR).
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          ACCORDÉON FAQ
          ══════════════════════════════════════════════════════════════════ */}
      <section id="faq" className="py-20 sm:py-28 bg-white border-t border-slate-200/70">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2 block">Questions fréquentes</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Tout ce que vous devez savoir
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const estOuverte = faqOuverte === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/50 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setFaqOuverte(estOuverte ? -1 : index)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-semibold text-slate-900 text-sm hover:text-slate-700 transition"
                  >
                    <span>{faq.question}</span>
                    <ChevronDownIcon
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        estOuverte ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {estOuverte && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/50">
                      {faq.reponse}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          BANNIÈRE CTA DE FIN (STYLE LOOPCV)
          ══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-3xl p-8 sm:p-14 text-center text-white shadow-xl relative overflow-hidden">
            <div className="max-w-2xl mx-auto space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Passez à la vitesse supérieure</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Prêt à décrocher votre prochain entretien ?
              </h2>
              <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed pb-4">
                Téléversez votre CV dès maintenant et découvrez en quelques secondes comment le rendre irrésistible pour les recruteurs.
              </p>
              <div>
                <Link to="/register">
                  <Button variant="secondary" size="lg" className="shadow-lg hover:bg-slate-100">
                    <span>Créer mon compte gratuit</span>
                    <ArrowRightIcon className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          FOOTER MULTI-COLONNES
          ══════════════════════════════════════════════════════════════════ */}
      <footer className="bg-white border-t border-slate-200 py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                <FileTextIcon className="w-3.5 h-3.5" />
              </div>
              <span className="font-extrabold text-slate-900 text-sm tracking-tight">APPCV</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              La plateforme d'audit et d'optimisation de CV par intelligence artificielle conçue pour les candidats exigeants.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Produit</h4>
            <ul className="space-y-2">
              <li><Link to="/upload" className="hover:text-slate-900 transition">Ajouter un CV</Link></li>
              <li><Link to="/dashboard" className="hover:text-slate-900 transition">Dashboard</Link></li>
              <li><a href="#fonctionnalites" className="hover:text-slate-900 transition">Fonctionnalités</a></li>
              <li><a href="#comment-ca-marche" className="hover:text-slate-900 transition">Comment ça marche</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Ressources</h4>
            <ul className="space-y-2">
              <li><a href="#faq" className="hover:text-slate-900 transition">Questions fréquentes</a></li>
              <li><span className="text-slate-400">Guide de l'entretien (Bientôt)</span></li>
              <li><span className="text-slate-400">Modèles de CV ATS</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Sécurité & Légal</h4>
            <ul className="space-y-2">
              <li><span className="text-slate-500">Conformité RGPD</span></li>
              <li><span className="text-slate-500">Protection des données</span></li>
              <li><span className="text-slate-500">Mentions légales</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 APPCV Technologies. Tous droits réservés.</p>
          <p>Conçu avec Symfony 7.4 & React 19</p>
        </div>
      </footer>
    </div>
  );
}
