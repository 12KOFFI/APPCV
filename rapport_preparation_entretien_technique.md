# 🎓 GUIDE DE PRÉPARATION À L'ENTRETIEN TECHNIQUE
## Projet : Analyseur de CV par IA (Symfony 7.4 & React 19)

> **Document de révision stratégique** conçu pour vous préparer aux questions d'architecture, de code, de sécurité et de bonnes pratiques posées par des Lead Developers et Recruteurs Techniques.

---

## 📌 TABLE DES MATIÈRES

1. [Vue d'ensemble de l'Architecture & Stack](#1-vue-densemble-de-larchitecture--stack)
2. [Étape 9 décortiquée : Génération PDF & Dompdf](#2-étape-9-décortiquée--génération-pdf--dompdf)
3. [Étape 10 décortiquée : Stratégie de Tests Automatisés](#3-étape-10-décortiquée--stratégie-de-tests-automatisés)
4. [Sécurité & Défense en Profondeur](#4-sécurité--défense-en-profondeur)
5. [Le Workflow Asynchrone : Messenger, Polling & Worker](#5-le-workflow-asynchrone--messenger-polling--worker)
6. [Banque de Questions / Réponses pour l'Entretien Technique](#6-banque-de-questions--réponses-pour-lentretien-technique)
7. [Check-list de synthèse (Étapes 0 à 10)](#7-check-list-de-synthèse-étapes-0-à-10)

---

## 1. VUE D'ENSEMBLE DE L'ARCHITECTURE & STACK

### 🏛️ Architecture Globale

```
+-----------------------------------------------------------------------------------+
|                                FRONTEND REACT 19                                  |
|   - Vite + SPA React Router v7                                                    |
|   - Contexte d'authentification JWT (AuthContext) avec Axios interceptors         |
|   - Short Polling temps réel (AnalysePolling) avec timer & indicateur visuel      |
|   - Téléchargement dynamique de PDF via Blob / Object URL                         |
+-----------------------------------------+-----------------------------------------+
                                          | Requêtes REST (JSON / Multipart / Bearer)
                                          v
+-----------------------------------------------------------------------------------+
|                               BACKEND SYMFONY 7.4                                 |
|                                                                                   |
|  [AuthController]  --> LexikJWTAuthenticationBundle (RSA RS256, Stateless)        |
|                                                                                   |
|  [CvController]    --> Upload sécurisé, validation Fileinfo (Magic Bytes)         |
|                    --> ExtracteurTexte (Smalot PDFParser + ZipArchive DOCX)       |
|                    --> Dispatch asynchrone dans Symfony Messenger                 |
|                    --> Endpoint GET /api/analyse/{id}/pdf (Dompdf)                |
|                                                                                   |
|  [Messenger Async] --> Worker en tâche de fond (messenger:consume)                |
|                    --> AnalyseurCvIa (Anthropic Claude via Tool Use JSON Schema)  |
|                    --> Mise à jour de l'entité Analyse (statut TERMINE / ERREUR)  |
|                                                                                   |
|  [PdfGenerator]    --> Rendu Twig (rapport_analyse.html.twig) + Dompdf binaire    |
+-----------------------------------------+-----------------------------------------+
                                          |
                        +-----------------+-----------------+
                        |                                   |
                        v                                   v
             [MySQL 9.1 (InnoDB)]               [Anthropic Claude API]
             Base de données relationnelle      Modèle d'IA structuré
```

### 🎯 Choix Technologiques Clés à Défendre

* **Pourquoi Symfony 7.4 ?** Framework robuste, écosystème mature, respect des standards PSR, typage strict PHP 8.2+, conteneur d'injection de dépendances puissant et bundle d'authentification JWT natif.
* **Pourquoi une API Stateless (JWT) ?** Pas de session stockée côté serveur. Horizontalement scalable (aucun état partagé nécessaire entre plusieurs serveurs Web ou conteneurs Docker).
* **Pourquoi React 19 + Vite ?** Vitesse de build instantanée grâce à esbuild/Rollup, gestion déclarative de l'état, architecture modulaire en composants réutilisables.

---

## 2. ÉTAPE 9 DÉCORTIQUÉE : GÉNÉRATION PDF & DOMPDF

### 🚀 L'Objectif Métier
Permettre au candidat d'exporter son rapport d'audit sous la forme d'un document PDF imprimable, élégant, professionnel et téléchargeable en un clic.

### ⚙️ Composants Techniques Mis en Place

#### 1. Le Service Métier Découplé (`PdfGeneratorService.php`)
```php
final class PdfGeneratorService
{
    public function __construct(
        private readonly Environment $twig,
    ) {}

    public function genererRapportAnalyse(Analyse $analyse): string
    {
        // 1. Rendu du template Twig en chaîne HTML pure
        $html = $this->twig->render('pdf/rapport_analyse.html.twig', [
            'analyse' => $analyse,
        ]);

        // 2. Configuration fine de Dompdf
        $options = new Options();
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isRemoteEnabled', true);
        $options->set('defaultFont', 'Helvetica');

        // 3. Transformation en binaire PDF
        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return (string) $dompdf->output();
    }
}
```

#### 2. Le Contrôleur Sécurisé (`CvController::telechargerPdf`)
```php
#[Route('/api/analyse/{id}/pdf', name: 'api_analyse_telecharger_pdf', methods: ['GET'], requirements: ['id' => '\d+'])]
public function telechargerPdf(
    #[MapEntity(id: 'id')] Analyse $analyse,
    #[CurrentUser] User $user,
    PdfGeneratorService $pdfGenerator,
): Response {
    // 🛡️ SÉCURITÉ ANTI-IDOR : Le CV appartient-il à l'utilisateur authentifié ?
    if ($analyse->getCv()->getProprietaire()?->getId() !== $user->getId()) {
        return $this->json(['erreur' => 'Accès refusé.'], Response::HTTP_FORBIDDEN); // 403
    }

    // Cohérence métier : On ne génère pas de PDF sur une analyse en attente ou échouée
    if ($analyse->getStatut() !== Analyse::STATUT_TERMINE) {
        return $this->json(['erreur' => 'Le rapport PDF n\'est disponible que pour les analyses terminées.'], Response::HTTP_BAD_REQUEST);
    }

    $pdfContenu = $pdfGenerator->genererRapportAnalyse($analyse);
    $nomFichier = sprintf('rapport-analyse-%d.pdf', $analyse->getId());

    return new Response($pdfContenu, Response::HTTP_OK, [
        'Content-Type' => 'application/pdf',
        'Content-Disposition' => sprintf('attachment; filename="%s"', $nomFichier),
    ]);
}
```

#### 3. Les Pièges Dompdf et Comment nous les avons Résolus
| Contrainte Dompdf | Risque / Erreur courante | Solution appliquée dans notre projet |
|---|---|---|
| **Pas de support CSS Flexbox / Grid** | Le PDF est complètement déstructuré ou vide si on utilise Tailwind / Flexbox | Utilisation d'un layout en tables HTML (`<table class="two-cols">`) et CSS 2.1 classique. |
| **Sauts de page inopportuns** | Un paragraphe de recommandation coupé en deux au milieu d'une page | Utilisation de la règle CSS `page-break-inside: avoid;`. |
| **Variables Twig nulles** | Crash 500 si le CV n'a pas de propriétaire rattaché | Sécurisation dans le template : `{{ analyse.cv.proprietaire ? analyse.cv.proprietaire.email : 'Non renseigné' }}`. |
| **Téléchargement SPA côté client** | Un simple lien `<a href="...">` ne peut pas injecter le header `Authorization: Bearer <JWT>` | Axios appelle l'API avec `{ responseType: 'blob' }`, puis crée une URL virtuelle avec `window.URL.createObjectURL(blob)`. |

---

## 3. ÉTAPE 10 DÉCORTIQUÉE : STRATÉGIE DE TESTS AUTOMATISÉS

### 📐 La Pyramide des Tests dans notre Projet

Notre suite de tests comprend **22 tests automatisés et 77 assertions** exécutés en **moins de 5 secondes**.

```
                /\
               /  \       Tests Fonctionnels (WebTestCase)
              /    \      - Inscription, Connexion JWT, /api/moi
             /  E2E \     - Upload de CV, Filtres MIME, Erreurs 422
            /────────\    - Contrôle IDOR (403), Téléchargement PDF (200)
           /          \
          / Intégration\  Tests d'Intégration (KernelTestCase)
         /              \ - PdfGeneratorService avec le vrai Twig Engine
        /────────────────\
       /                  \  Tests Unitaires Purs (TestCase)
      /     Unitaires      \ - ExtracteurTexte (Mimes, Docx, Anti-zip-bomb)
     /                      \- Validation DTOs (InscriptionDto, AnalyseCvDto)
    /────────────────────────\- Entités de domaine (User, Cv, Analyse)
```

### 🧪 Inventaire Détaillé des Tests Développés

1. **`PdfGeneratorServiceTest` (Unitaire)** : Vérifie avec un Mock Twig que le flux généré commence par `%PDF-` et n'est pas vide.
2. **`PdfGeneratorServiceIntegrationTest` (Intégration)** : Démarre le Kernel Symfony, compile le vrai fichier `rapport_analyse.html.twig`, passe les données d'une analyse complète et valide le PDF généré (> 5 Ko).
3. **`ExtracteurTexteTest` (Unitaire)** :
   * Teste le rejet d'un type MIME non autorisé (`ExtractionImpossibleException`).
   * Teste l'extraction d'un fichier .docx généré dynamiquement via `ZipArchive`.
   * Teste la détection d'un CV contenant moins de 50 caractères (anti-scans/images).
   * Teste le rejet d'un fichier corrompu.
4. **`InscriptionDtoTest` & `AnalyseCvDtoTest` (Unitaires)** :
   * Validation de l'email et de la longueur du mot de passe.
   * Règle stricte des **exactement 5 recommandations** et note comprise entre 0 et 100.
5. **`EntityTest` (Unitaire)** : Vérifie le comportement des entités POPO/Doctrine (`User`, `Cv`, `Analyse`).
6. **`SanteControllerTest` (Fonctionnel)** : Vérifie `GET /api/sante` -> 200 OK avec `{ statut: "ok" }`.
7. **`AuthControllerTest` (Fonctionnel)** :
   * Inscription d'un nouvel utilisateur -> 201 Created.
   * Tentative de doublon avec le même email -> 409 Conflict.
   * Connexion avec mauvais mot de passe -> 401 Unauthorized.
   * Connexion avec bon mot de passe -> 200 OK avec token JWT.
   * Appel de `GET /api/moi` avec Bearer token -> 200 OK avec email & rôles.
   * Appel de `GET /api/moi` sans Bearer token -> 401 Unauthorized.
8. **`CvControllerTest` (Fonctionnel)** :
   * `GET /api/cv` protégé par authentification (401 si anonyme, 200 si authentifié).
   * Upload d'un vrai fichier PDF généré au vol -> 201 Created avec caractères extraits.
   * Rejet d'un fichier texte ou exécutable non autorisé -> 422 Unprocessable Entity.
   * **Test de Sécurité IDOR** : Un User B tentant d'accéder aux analyses d'un User A reçoit un code **403 Forbidden**.
   * **Test de Sécurité IDOR PDF** : Un User B tentant de télécharger le PDF d'un User A reçoit un code **403 Forbidden**.
   * Téléchargement de PDF sur une analyse non terminée -> **400 Bad Request**.
   * Téléchargement de PDF sur une analyse terminée -> **200 OK** avec `Content-Type: application/pdf` et binaire valide.

### 🛡️ Isolation et Idempotence des Tests
* **Base de données de test dédiée** : `DATABASE_URL` configurée dans `.env.test` pointant vers `analyseur_cv_test`.
* **Identifiants dynamiques** : Pour éviter l'erreur `Duplicate entry for key UNIQ_...`, chaque test génère des emails et noms de fichiers uniques via `bin2hex(random_bytes(6))`. Les tests peuvent être rejoués à l'infini sans jamais polluer ou entrer en collision.

---

## 4. SÉCURITÉ & DÉFENSE EN PROFONDEUR

Lors d'un entretien technique, la sécurité est le critère qui distingue un développeur junior d'un développeur confirmé. Voici les arguments clés du projet :

### 1. Faille IDOR (Insecure Direct Object Reference)
* **Le Risque :** Un utilisateur change l'identifiant dans l'URL (`/api/analyse/42/pdf` au lieu de `/api/analyse/41/pdf`) pour espionner le CV d'un autre candidat.
* **Notre Riposte :** Aucun accès n'est accordé sur simple existence de l'ID. Symfony injecte l'utilisateur connecté via `#[CurrentUser]` et nous comparons :
  ```php
  if ($analyse->getCv()->getProprietaire()?->getId() !== $user->getId()) {
      return $this->json(['erreur' => 'Accès refusé.'], Response::HTTP_FORBIDDEN); // 403
  }
  ```

### 2. Validation Réelle des Fichiers (Magic Bytes vs Extension)
* **Le Risque :** Un pirate renomme `malware.exe` ou `script.php` en `cv.pdf`.
* **Notre Riposte :** Nous n'utilisons jamais l'extension ou `getClientMimeType()` (facilement forgés par le client). Nous utilisons l'extension PHP `fileinfo` (`$file->getMimeType()`) qui inspecte les premiers octets binaires du fichier (magic bytes, `%PDF-...`).

### 3. Stockage Sécurisé Hors Racine Publique
* Les CV téléversés ne sont **JAMAIS** enregistrés dans `public/`.
* Ils sont stockés dans `var/uploads/cv` sous un nom aléatoire haché (`bin2hex(random_bytes(16)) . '.pdf'`). Aucune exécution PHP directe n'est possible, et les noms originaux des candidats ne sont pas exposés.

### 4. Protection Anti-Prompt Injection
* Le texte du CV est encapsulé entre des balises strictes `<cv>...</cv>` avant envoi à Claude.
* Le prompt système spécifie à l'IA que le texte contenu est une donnée passive à auditer et qu'aucune instruction contenue dans ce texte ne doit outrepasser ses règles.

---

## 5. LE WORKFLOW ASYNCHRONE : MESSENGER, POLLING & WORKER

### ⏱️ Pourquoi l'IA ne peut PAS être traitée en synchrone ?
* Un appel LLM (Claude) prend entre **3 et 10 secondes**.
* Si 20 candidats cliquent en même temps, 20 processus PHP-FPM sont gelés en attente I/O réseau. Le serveur s'effondre et les reverse-proxies (Nginx, Cloudflare) coupent la connexion avec une erreur **504 Gateway Timeout**.

### 🔄 Le Cycle Complet mis en place :
1. React envoie `POST /api/cv/{id}/analyse`.
2. Symfony crée l'entité avec `statut = EN_ATTENTE`, dispatche un message dans Symfony Messenger et **répond immédiatement en < 30 ms avec le code HTTP 202 Accepted**.
3. Le worker en tâche de fond (`php bin/console messenger:consume async`) prend le message, appelle Claude via Tool Use, enregistre les résultats en BDD et passe le statut à `TERMINE`.
4. React effectue un **Short Polling** toutes les 2 secondes sur `GET /api/analyse/{id}`. Dès que le statut passe à `TERMINE`, le polling s'arrête et les résultats s'affichent.
5. Si le composant React est démonté (l'utilisateur change de page), la fonction de nettoyage (`cleanup function`) de `useEffect` appelle immédiatement `clearInterval(timer)` pour éliminer toute fuite mémoire.

---

## 6. BANQUE DE QUESTIONS / RÉPONSES POUR L'ENTRETIEN TECHNIQUE

Voici les questions exactes que posera un examinateur technique, avec les réponses attendues de haut niveau :

---

### Q1. "Pourquoi avoir choisi Dompdf plutôt qu'une solution headless comme Puppeteer ou Gotenberg ?"
> **Réponse attendue :**
> "Dompdf est une bibliothèque 100% PHP, légère et sans dépendance externe. Pour notre besoin de génération de rapport A4 basé sur un gabarit Twig, elle s'installe via Composer sans nécessiter l'exécution d'un processus Chromium headless lourd (qui consomme 500 Mo à 1 Go de RAM par instance et pose des contraintes d'installation sur certains serveurs ou conteneurs légers). 
> Si le besoin évoluait vers du rendu SVG complexe, des graphiques dynamiques JavaScript ou du CSS Grid moderne, nous pourrions alors isoler la génération dans un microservice Gotenberg/Docker."

---

### Q2. "Comment téléchargez-vous un fichier protégé par JWT dans une application React ?"
> **Réponse attendue :**
> "Une balise HTML standard `<a href="/api/analyse/1/pdf" download>` ne permet pas d'ajouter des headers personnalisés, donc le header `Authorization: Bearer <token>` ne peut pas être transmis, ce qui entraînerait une erreur 401.
> Notre solution : nous effectuons une requête `GET` via notre instance Axios configurée avec `responseType: 'blob'`. Une fois les octets reçus, nous générons une URL locale en mémoire via `window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))`, nous créons un lien temporaire invisible dans le DOM, simulons le clic pour déclencher le téléchargement navigateur, puis nous révoquons l'URL avec `window.URL.revokeObjectURL(url)` pour éviter toute fuite de mémoire."

---

### Q3. "Pourquoi renvoyer un code HTTP `202 Accepted` plutôt que `200 OK` lors du lancement de l'analyse ?"
> **Réponse attendue :**
> "Selon la RFC HTTP, le code `202 Accepted` signifie que la requête a été validée et acceptée pour traitement, mais que le traitement n'est pas encore achevé. C'est le standard de l'industrie pour les architectures asynchrones basées sur des files de messages (Message Queues / Event-Driven). Renvoyer un `200 OK` laisserait croire au client que le résultat final est déjà disponible dans le corps de la réponse."

---

### Q4. "Quelle est la différence fondamentale entre vos tests unitaires, d'intégration et fonctionnels ?"
> **Réponse attendue :**
> - **Tests Unitaires (`TestCase`) :** Testent une classe isolée sans démarrer le framework ni toucher à la base de données (ex: `ExtracteurTexteTest`, validation des DTOs, Mock de Twig). Ils s'exécutent en quelques millisecondes.
> - **Tests d'Intégration (`KernelTestCase`) :** Démarrent le conteneur d'injection de dépendances Symfony pour tester la collaboration entre plusieurs services réels (ex: `PdfGeneratorServiceIntegrationTest` qui fait collaborer Twig, le système de templates et Dompdf).
> - **Tests Fonctionnels (`WebTestCase`) :** Simulent un client HTTP complet (`static::createClient()`), envoient de vraies requêtes sur les routes, passent par les pare-feu de sécurité (firewalls JWT), et exécutent les contrôleurs avec une base de données de test (`analyseur_cv_test`)."

---

### Q5. "Comment évitez-vous qu'un utilisateur n'accède aux données d'un autre utilisateur (Faille IDOR) ?"
> **Réponse attendue :**
> "Nous n'interrogeons jamais directement un objet en BDD sans vérifier son propriétaire. Dans chaque contrôleur sensible (`CvController`), nous récupérons l'utilisateur actuellement authentifié via l'attribut `#[CurrentUser]`. Nous vérifions ensuite que `$cv->getProprietaire()->getId() === $user->getId()`. Si ce n'est pas le cas, Symfony retourne immédiatement un code HTTP `403 Forbidden`. Nous avons d'ailleurs écrit un test fonctionnel dédié (`testSecuriteIdorEtTelechargementPdf`) qui vérifie qu'un User B se voit refuser l'accès au CV et au PDF de User A."

---

### Q6. "Pourquoi avoir forcé le moteur MySQL en InnoDB plutôt que MyISAM ?"
> **Réponse attendue :**
> "Sur certaines configurations Windows/WAMP, MySQL crée les tables par défaut en MyISAM. Or, MyISAM ne supporte pas les transactions ACID ni les contraintes de clés étrangères (`FOREIGN KEY` avec `ON DELETE CASCADE`), et limite la taille des index à 1000 octets.
> En forçant `default_table_options: { engine: InnoDB }` dans `doctrine.yaml`, nous garantissons l'intégrité référentielle, le respect du RGPD (supprimer un utilisateur supprime automatiquement ses CV et analyses associées), et le support complet des transactions."

---

### Q7. "Comment garantissez-vous que Claude renvoie un format JSON exploitable sans hallucination de format ?"
> **Réponse attendue :**
> "Demander du JSON dans un prompt texte est fragile car les LLMs peuvent ajouter des phrases de politesse ou des balises markdown ('Voici votre JSON: ```json...').
> Nous utilisons la fonctionnalité **Tool Use (Structured Outputs)** d'Anthropic. Nous déclarons un faux outil `enregistrer_analyse` avec un schéma JSON strict (`properties`, `required`, types `array` et `integer`), et nous configurons `tool_choice: { type: 'tool', name: 'enregistrer_analyse' }`. Claude est ainsi mathématiquement contraint par son moteur d'inférence de générer les arguments de la fonction selon notre schéma."

---

## 7. CHECK-LIST DE SYNTHÈSE (ÉTAPES 0 À 10)

| Étape | Domaine | Fonctionnalité clé | Statut |
|:---:|:---|:---|:---:|
| **0** | Setup | Initialisation Symfony 7.4 + Vite React, NelmioCorsBundle, `/api/sante` | ✅ Prêt |
| **1** | Sécurité | Inscription DTO, Hachage bcrypt, JWT Lexik asymétrique RS256, `/api/moi` | ✅ Prêt |
| **2** | Upload | Upload `multipart/form-data`, vérification Magic Bytes Fileinfo, var/uploads | ✅ Prêt |
| **3** | Extraction | Parser PDF Smalot, ZipArchive Word DOCX, anti-bombe ZIP, détection scan | ✅ Prêt |
| **4 & 5** | IA Claude | HTTP Client scopé, Tool Use structuré (JSON Schema), 5 recommandations | ✅ Prêt |
| **6 & 7** | Async | Symfony Messenger, worker CLI en tâche de fond, HTTP 202 Accepted | ✅ Prêt |
| **8** | Frontend | AuthContext, Drag & Drop FileDropzone, Polling 2s, AnalyseResult, Historique | ✅ Prêt |
| **9** | **Export PDF** | **`PdfGeneratorService`, gabarit Twig stylisé, Dompdf A4, streaming binaire** | ✅ **100% Validé** |
| **10** | **Tests** | **22 tests (Unitaires, Intégration, Fonctionnels), IDOR testé, DB test isolée** | ✅ **100% Validé** |

---

> 💡 **Conseil pour l'entretien :** Présentez toujours le projet en insistant sur **la séparation des responsabilités**, **la robustesse de la sécurité (IDOR, Magic bytes)** et **l'architecture asynchrone (Messenger)**. Ce sont les 3 marqueurs clés qui convainquent instantanément un recruteur technique !
