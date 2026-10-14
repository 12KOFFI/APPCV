import { useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import {
  FileTextIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  DownloadIcon,
  ShieldCheckIcon,
  BarChartIcon,
  ChevronDownIcon,
  TargetIcon,
  ClockIcon,
} from '../components/ui/Icons';
import {
  BlueStripedCircle,
  GreenDotMatrixTriangle,
  PinkSquigglyWaves,
  TealCurvedSnake,
  BlueMultiWaves,
  MagentaRibbonM,
} from '../components/landing/LandingDecorations';

export default function HomePage() {
  const [faqOuverte, setFaqOuverte] = useState(0);

  // Informations strictement réelles relatives à APPCV
  const faqs = [
    {
      question: "Comment l'IA analyse-t-elle mon CV sur APPCV ?",
      reponse:
        "Notre moteur extrait le texte intégral de votre fichier PDF ou Word (.docx), puis analyse la clarté structurelle, la densité des compétences techniques et comportementales, ainsi que la conformité aux algorithmes de tri ATS (Applicant Tracking Systems). Vous recevez instantanément un score global sur 100 ainsi qu'un diagnostic complet avec recommandations concrètes.",
    },
    {
      question: "Puis-je adapter mon CV à une offre d'emploi ciblée ?",
      reponse:
        "Absolument. Lors de la demande d'analyse, vous pouvez coller le descriptif de l'annonce visée. L'IA confronte directement les compétences demandées par l'employeur avec celles de votre document et met en évidence les mots-clés stratégiques manquants.",
    },
    {
      question: "Mes documents personnels restent-ils confidentiels ?",
      reponse:
        "Oui, à 100%. Vos fichiers sont stockés hors de la racine web du serveur avec un nom chiffré unique et sont protégés contre les accès non autorisés. Vos données ne sont jamais vendues ni utilisées pour entraîner des modèles publics tiers.",
    },
    {
      question: "Quels formats de fichiers sont pris en charge ?",
      reponse:
        "Nous prenons en charge les formats PDF (.pdf) et Microsoft Word (.docx) jusqu'à une taille maximale de 5 Mo.",
    },
    {
      question: "Combien de temps dure une analyse complète ?",
      reponse:
        "Grâce à notre traitement asynchrone par file de messages, l'audit complet, le calcul du score ATS et la génération du bilan détaillé s'effectuent en moyenne en moins de 5 secondes.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-slate-900 selection:text-white">
      {/* ══════════════════════════════════════════════════════════════════
          1. HERO SECTION (AVEC FORMES VECTORIELLES DÉCORATIVES LOOPCV)
          ══════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-14 pb-20 sm:pt-20 sm:pb-28 overflow-hidden bg-[#F0F5F9]/60">
        {/* ── Formes décoratives SVG flottantes (fidèles à LoopCV) ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-0">
          {/* Cercle rayé bleu en haut à gauche */}
          <div className="absolute top-12 left-6 sm:left-24 animate-pulse duration-1000">
            <BlueStripedCircle className="w-10 h-10 sm:w-14 sm:h-14 opacity-90" />
          </div>

          {/* Triangle de points turquoise à gauche */}
          <div className="absolute top-44 left-4 sm:left-16">
            <GreenDotMatrixTriangle className="w-12 h-12 sm:w-16 sm:h-16 opacity-85" />
          </div>

          {/* Vagues ondulées roses en bas à gauche */}
          <div className="absolute bottom-12 left-8 sm:left-28">
            <PinkSquigglyWaves className="w-12 h-10 sm:w-14 sm:h-12 opacity-85" />
          </div>

          {/* Crochet turquoise à droite */}
          <div className="absolute top-48 right-6 sm:right-28">
            <TealCurvedSnake className="w-8 h-12 sm:w-10 sm:h-14 opacity-90" />
          </div>

          {/* Ondulations bleues à droite */}
          <div className="absolute top-72 right-4 sm:right-16">
            <BlueMultiWaves className="w-10 h-10 sm:w-12 sm:h-12 opacity-80" />
          </div>

          {/* Ruban Magenta M en bas à droite */}
          <div className="absolute bottom-10 right-8 sm:right-32">
            <MagentaRibbonM className="w-14 h-12 sm:w-18 sm:h-16 opacity-85" />
          </div>
        </div>

        {/* ── Contenu central du Hero ── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Titre principal centré et percutant */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.08] mb-6">
            APPCV vous aide à obtenir 3x plus d’entretiens grâce à l’IA
          </h1>

          {/* Sous-titre informatif et concis */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-9 leading-relaxed font-normal">
            Importez votre CV, vérifiez votre compatibilité avec les algorithmes ATS des recruteurs et recevez un plan d'action personnalisé avec rapport PDF officiel.
          </p>

          {/* Bouton CTA format rectangulaire noir LoopCV */}
          <div className="flex flex-col items-center justify-center gap-4 mb-8">
            <Link to="/register">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg text-sm sm:text-base font-bold text-white bg-slate-900 hover:bg-black transition-all duration-200 hover:-translate-y-0.5 shadow-md hover:shadow-xl cursor-pointer group"
              >
                <span>Commencez dès maintenant</span>
                <span className="group-hover:translate-x-1.5 transition-transform duration-200">→</span>
              </button>
            </Link>

           

            <p className="text-xs text-slate-400 font-medium">Démarrer gratuitement sans engagement</p>
          </div>

          {/* Preuve sociale (Avatars réels de candidats + étoiles) */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-2xs">JD</div>
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-2xs">SL</div>
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-2xs">MK</div>
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-2xs">AN</div>
            </div>
            <div className="text-left text-xs">
              <span className="font-bold text-slate-900">et plus de 25 000 candidats</span>
              <p className="text-[11px] text-slate-500">ont optimisé leur CV avec APPCV</p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            MOCKUP DU TABLEAU DE BORD (PRÉSENTATION DU DESIGN TAILADMIN)
            ══════════════════════════════════════════════════════════════════ */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 relative z-10">
          <div className="relative rounded-2xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden p-3 sm:p-6 transition-all duration-300 hover:shadow-3xl">
            {/* Barre supérieure de l'interface */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                  <FileTextIcon className="w-4 h-4 text-white" />
                </div>
                <span className="font-extrabold text-slate-900 text-sm tracking-tight">APPCV Dashboard</span>
                <Badge variant="blue" size="sm">IA v2.4</Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Score ATS : 88 / 100
                </span>
              </div>
            </div>

            {/* Faux aperçu interactif haute fidélité */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 text-left">
                <span className="text-[11px] font-semibold text-slate-400">Total des CV</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">3</div>
                <span className="text-[10px] text-emerald-600 font-bold">↑ +100% ce mois</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 text-left">
                <span className="text-[11px] font-semibold text-slate-400">Analyses Complétées</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">6</div>
                <span className="text-[10px] text-emerald-600 font-bold">↑ +14.8%</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 text-left">
                <span className="text-[11px] font-semibold text-slate-400">Score ATS Moyen</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">82%</div>
                <span className="text-[10px] text-emerald-600 font-bold">↑ +8.4%</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 text-left">
                <span className="text-[11px] font-semibold text-slate-400">Compétences Détectées</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">61</div>
                <span className="text-[10px] text-emerald-600 font-bold">↑ Optimal</span>
              </div>
            </div>

            {/* Aperçu des recommandations */}
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100/70 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <SparklesIcon className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Diagnostic IA :</strong> 5 recommandations clés prêtes à appliquer pour votre prochain entretien.
                </span>
              </div>
              <Link to="/register">
                <button
                  type="button"
                  className="px-4 py-1.5 rounded-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
                >
                  Tester mon CV →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          2. COMMENT ÇA FONCTIONNE EN 3 ÉTAPES SIMPLES (STYLE LOOPCV)
          ══════════════════════════════════════════════════════════════════ */}
      <section id="comment-ca-marche" className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Comment APPCV Fonctionne En 3 Étapes Simples
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base leading-relaxed">
              Le processus de sélection des recruteurs est désormais automatisé. Nous avons conçu un outil d'audit instantané pour maximiser votre visibilité avec un minimum d'effort.
            </p>
          </div>

          {/* ── Frise chronologique des 3 étapes avec ligne de connexion ── */}
          <div className="relative max-w-3xl mx-auto mb-16 hidden md:block">
            <div className="absolute top-5 left-16 right-16 h-0.5 bg-slate-200 -z-0" />
            <div className="grid grid-cols-3 gap-6 relative z-10">
              <div className="flex flex-col items-center">
                <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-extrabold text-base flex items-center justify-center shadow-md mb-3">
                  1
                </div>
                <p className="text-xs font-bold text-slate-900 max-w-[180px]">
                  Créez votre profil et importez votre CV
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-extrabold text-base flex items-center justify-center shadow-md mb-3">
                  2
                </div>
                <p className="text-xs font-bold text-slate-900 max-w-[180px]">
                  L’IA analyse votre profil et calcule votre note ATS
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-extrabold text-base flex items-center justify-center shadow-md mb-3">
                  3
                </div>
                <p className="text-xs font-bold text-slate-900 max-w-[180px]">
                  Consultez vos conseils et téléchargez le rapport PDF
                </p>
              </div>
            </div>
          </div>

          {/* ── 3 Cartes avec bouton rectangulaire [ En savoir plus ] ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-left">
            {/* Carte 1 */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-2 hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 mb-6 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <FileTextIcon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 tracking-tight">
                  Importation & Extraction Binaire
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Glissez-déposez votre CV au format PDF ou Word. Notre extracteur natif lit le texte brut, les métadonnées et la disposition sans déformation.
                </p>
              </div>

              <div>
                <Link to="/register">
                  <button
                    type="button"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-sky-600 text-sky-800 hover:bg-sky-50 font-bold text-xs tracking-tight transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                  >
                    En savoir plus
                  </button>
                </Link>
              </div>
            </div>

            {/* Carte 2 */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-2 hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 mb-6 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <SparklesIcon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 tracking-tight">
                  Audit IA & Score sur 100
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  L’algorithme évalue la force de vos puces, la cohérence de vos intitulés de postes et détecte les compétences requises par le marché.
                </p>
              </div>

              <div>
                <Link to="/register">
                  <button
                    type="button"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-sky-600 text-sky-800 hover:bg-sky-50 font-bold text-xs tracking-tight transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                  >
                    En savoir plus
                  </button>
                </Link>
              </div>
            </div>

            {/* Carte 3 */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-2 hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 mb-6 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <BarChartIcon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 tracking-tight">
                  Recommandations & Bilan PDF
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Consultez vos 5 conseils prioritaires avec impact chiffré et téléchargez un rapport d'analyse officiel prêt à imprimer.
                </p>
              </div>

              <div>
                <Link to="/register">
                  <button
                    type="button"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-sky-600 text-sky-800 hover:bg-sky-50 font-bold text-xs tracking-tight transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                  >
                    En savoir plus
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          3. SECTIONS ALTERNÉES AVEC FORMES GÉOMÉTRIQUES ARRIÈRE-PLAN
          ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-[#F0F5F9]/70 border-y border-slate-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          {/* Bloc 1 : Téléversez et gérez vos CV avec forme géométrique turquoise */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block mb-2">
                En quelques secondes seulement
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                Téléversez et gérez vos CV facilement et rapidement
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                Plus besoin d'outils complexes. Importez votre fichier PDF ou Word en un clic. Notre plateforme conserve l'historique complet de vos documents pour vous permettre de mesurer vos progrès à chaque mise à jour.
              </p>
              <Link to="/register">
                <button
                  type="button"
                  className="px-6 py-3 rounded-lg text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-black transition-all hover:-translate-y-0.5 shadow-xs cursor-pointer inline-flex items-center gap-2 group"
                >
                  <span>Découvrir le gestionnaire de CV</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </Link>
            </div>

            {/* Mockup avec forme géométrique teal/cyan en arrière-plan */}
            <div className="relative flex items-center justify-center">
              {/* Forme géométrique arrière-plan */}
              <div className="absolute w-72 h-44 sm:w-96 sm:h-52 rounded-full bg-[#0D9488]/80 -rotate-6 transform -z-0 blur-xs" />

              {/* Carte Mockup premier plan */}
              <div className="relative z-10 w-full max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">Mes CV Déposés</span>
                  <Badge variant="success" size="sm">3 Actifs</Badge>
                </div>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileTextIcon className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-semibold text-slate-800">CV_Developpeur_Senior.pdf</span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">88/100</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileTextIcon className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-semibold text-slate-800">CV_Lead_Technique.docx</span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-50 text-blue-700">82/100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bloc 2 : Consultez les statistiques avec formes cercle bleu et pilule rouge */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
            {/* Mockup avec cercle bleu et pilule corail en arrière-plan */}
            <div className="relative flex items-center justify-center order-2 lg:order-1">
              {/* Cercle bleu */}
              <div className="absolute -top-6 -right-4 w-36 h-36 rounded-full bg-[#2563EB] -z-0 opacity-90" />
              {/* Pilule rouge/corail */}
              <div className="absolute -bottom-6 -left-4 w-44 h-24 rounded-full bg-[#FB7185] -z-0 opacity-85" />

              {/* Carte Mockup premier plan */}
              <div className="relative z-10 w-full max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">Score de Compatibilité ATS</span>
                  <span className="text-xs font-extrabold text-blue-600">+14.8%</span>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Mots-clés cibles</span>
                    <span className="font-bold text-slate-900">92%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full w-[92%]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Clarté structurelle</span>
                    <span className="font-bold text-slate-900">86%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full w-[86%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-2">
                Visibilité immédiate
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                Consultez les statistiques de vos analyses en un clin d’œil
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                Fini le doute sur la qualité de votre candidature. APPCV calcule des métriques objectives pour savoir exactement où vous vous situez par rapport aux exigences réelles des recruteurs.
              </p>
              <Link to="/register">
                <button
                  type="button"
                  className="px-6 py-3 rounded-lg text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-black transition-all hover:-translate-y-0.5 shadow-xs cursor-pointer inline-flex items-center gap-2 group"
                >
                  <span>Voir mes statistiques ATS</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Bloc 3 : Recommandations avec demi-cercle vert */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-2">
                Conseils actionnables
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                Recommandations et détails de chaque analyse
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                L’IA ne se contente pas de vous noter : elle vous donne 5 conseils personnalisés pour reformuler vos expériences, ajouter les bons verbes d’action et maximiser votre score.
              </p>
              <Link to="/register">
                <button
                  type="button"
                  className="px-6 py-3 rounded-lg text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-black transition-all hover:-translate-y-0.5 shadow-xs cursor-pointer inline-flex items-center gap-2 group"
                >
                  <span>Générer mes recommandations</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </Link>
            </div>

            {/* Mockup avec demi-cercle vert émeraude */}
            <div className="relative flex items-center justify-center">
              {/* Forme géométrique émeraude */}
              <div className="absolute w-64 h-32 rounded-t-full bg-[#10B981] -z-0 opacity-85 -bottom-2" />

              {/* Carte Mockup premier plan */}
              <div className="relative z-10 w-full max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                  <SparklesIcon className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">Conseils Prioritaires de l'IA</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                    <span className="text-emerald-500 font-bold shrink-0">✓</span>
                    <span>Quantifiez l'impact de vos réalisations avec des chiffres précis (+12 pts).</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                    <span className="text-blue-500 font-bold shrink-0">✓</span>
                    <span>Ajoutez les verbes d'action au début de chaque mission (+8 pts).</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          4. GRILLE DES 6 FONCTIONNALITÉS ESSENTIELLES
          ══════════════════════════════════════════════════════════════════ */}
      <section id="fonctionnalites" className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tous les outils dont vous avez besoin pour réussir
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base leading-relaxed">
              Une suite complète pensée pour éliminer les rejets automatiques et valoriser votre réel potentiel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {/* 1 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 hover:border-blue-200 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <CheckCircleIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Scanner de conformité ATS</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Vérifiez que vos titres, sections et polices franchissent sans encombre les logiciels de tri ATS.
              </p>
            </div>

            {/* 2 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 hover:border-blue-200 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <TargetIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Matching avec une offre</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Collez l’annonce ciblée pour comparer vos compétences avec les prérequis stricts du recruteur.
              </p>
            </div>

            {/* 3 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 hover:border-blue-200 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <BarChartIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Score objectif sur 100</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Obtenez une note claire et comprenez en un instant vos points forts et vos axes de perfectionnement.
              </p>
            </div>

            {/* 4 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 hover:border-blue-200 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <DownloadIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Exportation PDF instantanée</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Téléchargez un bilan officiel prêt à imprimer au format A4 généré de manière sécurisée côté serveur.
              </p>
            </div>

            {/* 5 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 hover:border-blue-200 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <ClockIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Historique des versions</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Consultez à tout moment l'ensemble de vos analyses passées sans avoir à relancer le traitement.
              </p>
            </div>

            {/* 6 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 hover:border-blue-200 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <ShieldCheckIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Confidentialité & RGPD</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Vos documents sont stockés hors de la racine publique et strictement réservés à votre compte personnel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          5. ACCORDÉON FAQ (AVEC BOUTON CTA EN BAS COMME LOOPCV)
          ══════════════════════════════════════════════════════════════════ */}
      <section id="faq" className="py-20 sm:py-28 bg-[#F0F5F9]/60 border-t border-slate-200/70">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Questions Fréquentes
            </h2>
            <p className="text-slate-600 mt-2 text-xs sm:text-sm">
              Tout ce que vous devez savoir pour démarrer avec APPCV
            </p>
          </div>

          <div className="space-y-3 mb-12">
            {faqs.map((faq, index) => {
              const estOuverte = faqOuverte === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200/90 bg-white overflow-hidden transition-all duration-200 hover:border-slate-300 shadow-2xs"
                >
                  <button
                    onClick={() => setFaqOuverte(estOuverte ? -1 : index)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm hover:text-blue-600 transition cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDownIcon
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        estOuverte ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>
                  {estOuverte && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.reponse}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bouton CTA format rectangulaire noir sous la FAQ comme Loopcv */}
          <div className="text-center">
            <Link to="/register">
              <button
                type="button"
                className="px-8 py-3.5 rounded-lg text-sm font-bold text-white bg-slate-900 hover:bg-black transition-all hover:-translate-y-0.5 shadow-md hover:shadow-lg cursor-pointer inline-flex items-center gap-2 group"
              >
                <span>Commencez dès maintenant</span>
                <span className="group-hover:translate-x-1.5 transition-transform duration-200">→</span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          6. OUTILS DE CARRIÈRE GRATUITS (4 CARTES COMME LOOPCV)
          ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 bg-white border-t border-slate-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Outils de Carrière Gratuits
            </h2>
            <p className="text-slate-500 mt-2 text-xs sm:text-sm">
              Profitez de nos ressources pour préparer votre prochaine étape professionnelle.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-2 hover:border-sky-300 transition-all duration-300 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-blue-600 mb-2 block">01</span>
                <h3 className="font-bold text-slate-900 text-sm mb-2">Test de conformité ATS</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  Vérifiez instantanément la lisibilité de votre police, rubriques et colonnes.
                </p>
              </div>
              <Link to="/register">
                <button
                  type="button"
                  className="w-full py-2 px-3 rounded-lg border border-sky-600 text-sky-700 hover:bg-sky-50 font-bold text-xs tracking-tight transition-all cursor-pointer"
                >
                  En savoir plus
                </button>
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-2 hover:border-sky-300 transition-all duration-300 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-blue-600 mb-2 block">02</span>
                <h3 className="font-bold text-slate-900 text-sm mb-2">Calculateur de score</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  Obtenez une estimation de votre note globale sur 100 face au marché.
                </p>
              </div>
              <Link to="/register">
                <button
                  type="button"
                  className="w-full py-2 px-3 rounded-lg border border-sky-600 text-sky-700 hover:bg-sky-50 font-bold text-xs tracking-tight transition-all cursor-pointer"
                >
                  En savoir plus
                </button>
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-2 hover:border-sky-300 transition-all duration-300 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-blue-600 mb-2 block">03</span>
                <h3 className="font-bold text-slate-900 text-sm mb-2">Audit des mots-clés</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  Détectez les termes techniques manquants face à une offre d'emploi ciblée.
                </p>
              </div>
              <Link to="/register">
                <button
                  type="button"
                  className="w-full py-2 px-3 rounded-lg border border-sky-600 text-sky-700 hover:bg-sky-50 font-bold text-xs tracking-tight transition-all cursor-pointer"
                >
                  En savoir plus
                </button>
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-2 hover:border-sky-300 transition-all duration-300 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-blue-600 mb-2 block">04</span>
                <h3 className="font-bold text-slate-900 text-sm mb-2">Synthèse PDF officielle</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  Téléchargez un rapport A4 professionnel pour vos entretiens et bilans.
                </p>
              </div>
              <Link to="/register">
                <button
                  type="button"
                  className="w-full py-2 px-3 rounded-lg border border-sky-600 text-sky-700 hover:bg-sky-50 font-bold text-xs tracking-tight transition-all cursor-pointer"
                >
                  En savoir plus
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          7. BANNIÈRE CTA DE FIN (STYLE FOND GRIS CLAIR AVEC BOUTON NOIR LOOPCV)
          ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 bg-[#F0F5F9]/80 border-t border-slate-200/70 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Laissez APPCV Vous Aider À Trouver Un Emploi Plus Vite
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Rejoignez des milliers de candidats qui ont maximisé l'impact de leur CV grâce à l'analyse par intelligence artificielle.
          </p>
          <Link to="/register">
            <button
              type="button"
              className="px-8 py-3.5 rounded-lg text-sm sm:text-base font-bold text-white bg-slate-900 hover:bg-black transition-all hover:-translate-y-0.5 shadow-md hover:shadow-xl cursor-pointer inline-flex items-center gap-2 group"
            >
              <span>Commencez dès maintenant</span>
              <span className="group-hover:translate-x-1.5 transition-transform duration-200">→</span>
            </button>
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          8. FOOTER MULTI-COLONNES
          ══════════════════════════════════════════════════════════════════ */}
      <footer className="bg-white border-t border-slate-200 py-14 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 text-left">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                <FileTextIcon className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-slate-900 text-base tracking-tight">APPCV</span>
            </div>
            <p className="text-slate-500 leading-relaxed pr-4">
              La plateforme d’audit et d’optimisation de CV par intelligence artificielle conçue pour maximiser vos chances d'entretien.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Fonctionnalités</h4>
            <ul className="space-y-2">
              <li><Link to="/upload" className="hover:text-slate-900 transition">Importer un CV</Link></li>
              <li><Link to="/dashboard" className="hover:text-slate-900 transition">Tableau de bord</Link></li>
              <li><a href="#comment-ca-marche" className="hover:text-slate-900 transition">Comment ça marche</a></li>
              <li><a href="#fonctionnalites" className="hover:text-slate-900 transition">Outils & Avantages</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Ressources</h4>
            <ul className="space-y-2">
              <li><a href="#faq" className="hover:text-slate-900 transition">Questions fréquentes</a></li>
              <li><Link to="/register" className="hover:text-slate-900 transition">Créer un compte</Link></li>
              <li><Link to="/login" className="hover:text-slate-900 transition">Se connecter</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Sécurité & Confidentialité</h4>
            <ul className="space-y-2">
              <li><span className="text-slate-600 font-medium">Protection des données privées</span></li>
              <li><span className="text-slate-600 font-medium">Stockage hors racine web</span></li>
              <li><span className="text-slate-600 font-medium">Conformité RGPD</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 APPCV. Tous droits réservés.</p>
          <p className="text-slate-400">Propulsé par Symfony 7.4 & React 19</p>
        </div>
      </footer>
    </div>
  );
}
