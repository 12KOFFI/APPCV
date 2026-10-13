# 🚀 APPCV — Analyseur de CV par Intelligence Artificielle

Application fullstack moderne permettant aux candidats et recruteurs de téléverser des CV (PDF ou Word), d'en extraire le texte de manière sécurisée, de réaliser un diagnostic approfondi par intelligence artificielle (Claude), de suivre l'évolution des scores et d'exporter un rapport officiel au format PDF.

---

## 🛠️ Stack Technique

* **Backend :** Symfony 7.4 (API REST pure, architecture stateless)
* **Frontend :** React 19 + Vite + React Router v7
* **Sécurité & Auth :** LexikJWTAuthenticationBundle (RSA RS256, JWT asymétrique)
* **Intelligence Artificielle :** Anthropic Claude API (Structured Outputs via Tool Use / JSON Schema)
* **Traitement Asynchrone :** Symfony Messenger + Worker en tâche de fond (`doctrine://default`)
* **Génération de documents :** Twig + Dompdf (A4 vectoriel stylisé)
* **Base de données :** MySQL 9.1 (Moteur forcé en InnoDB pour transactions et clés étrangères)
* **Tests :** PHPUnit 12.5 (Tests unitaires, d'intégration et fonctionnels avec scénarios anti-IDOR)

---

## 🏗️ Architecture & Fonctionnalités

1. **Authentification JWT Stateless :** Inscription (`POST /api/inscription`), Connexion (`POST /api/connexion`), Profil protégé (`GET /api/moi`).
2. **Upload Sécurisé (Défense en profondeur) :**
   * Validation stricte des Magic Bytes binaires via `fileinfo` (anti-spoofing).
   * Stockage hors racine publique dans `var/uploads/cv` avec hachage aléatoire.
3. **Extraction de Texte :**
   * PDF : `smalot/pdfparser` (100% natif).
   * Word : `ZipArchive` (XML parsing avec protection contre les Zip Bombs).
   * Détection des scans sans texte (< 50 caractères).
4. **Audit Asynchrone par IA :**
   * Réponse immédiate `202 Accepted`.
   * Worker Messenger consommant les tâches en arrière-plan.
   * Short Polling React avec chronomètre et retours temps réel.
   * 5 recommandations prioritaires, points forts, points faibles, compétences extraites et note sur 100.
5. **Export de Rapport PDF :**
   * Service découplé `PdfGeneratorService` avec template Twig dédié.
   * Streaming binaire sécurisé (`GET /api/analyse/{id}/pdf`) avec protection anti-IDOR.
6. **Historique & Comparatif :**
   * Consultation instantanée des audits passés sans surcoût d'appel IA.

---

## ⚡ Installation & Démarrage

### Prérequis
* PHP >= 8.2 (avec extensions `pdo_mysql`, `fileinfo`, `zip`, `gd`, `intl`)
* Node.js >= 18
* Composer
* MySQL

### 1. Backend (Symfony 7.4)
```bash
cd backend
composer install

# Configurer .env.local avec vos accès BDD
# DATABASE_URL="mysql://root:@127.0.0.1:3306/analyseur_cv?serverVersion=9.1.0&charset=utf8mb4"

# Génération des clés JWT (si nécessaire)
php bin/console lexik:jwt:generate-keypair

# Migrations de base de données
php bin/console doctrine:migrations:migrate --no-interaction

# Lancer le serveur Symfony
symfony serve
# ou: php -S 127.0.0.1:8000 -t public
```

### 2. Worker Asynchrone (Messenger)
Dans un terminal séparé :
```bash
cd backend
php bin/console messenger:consume async -vv
```

### 3. Frontend (React 19)
```bash
cd frontend
npm install
npm run dev
```
L'application est accessible sur `http://localhost:5173`.

---

## 🧪 Tests Automatisés

Le backend dispose d'une suite complète de tests unitaires, d'intégration et fonctionnels :
```bash
cd backend
php bin/phpunit
```
> **22 tests & 77 assertions** couvrant l'authentification, les DTOs, l'extraction de texte, la génération Dompdf et la sécurité IDOR.

---

## 📚 Documentation pour Entretien Technique

Un rapport de synthèse complet pour préparer les entretiens techniques (questions/réponses, architecture, sécurité) est disponible dans [`rapport_preparation_entretien_technique.md`](./rapport_preparation_entretien_technique.md).
