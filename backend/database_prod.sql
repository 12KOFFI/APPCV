-- ==============================================================================
-- BASE DE DONNÉES DE PRODUCTION - APPCV
-- Schéma vierge de production avec le compte Administrateur initial uniquement
-- ==============================================================================
-- Pour importer ce fichier sur votre hébergeur mutualisé (phpMyAdmin ou terminal) :
-- 1. Créez votre base de données vide (ex: nom_base)
-- 2. Dans phpMyAdmin, sélectionnez la base puis cliquez sur "Importer"
-- 3. Choisissez ce fichier database_prod.sql et validez
-- ==============================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

-- 1. Table des versions de migrations Doctrine
CREATE TABLE IF NOT EXISTS `doctrine_migration_versions` (
  `version` VARCHAR(191) NOT NULL,
  `executed_at` DATETIME DEFAULT NULL,
  `execution_time` INT DEFAULT NULL,
  PRIMARY KEY (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

INSERT INTO `doctrine_migration_versions` (`version`, `executed_at`, `execution_time`) VALUES
('DoctrineMigrations\\Version20261011014025', NOW(), 10),
('DoctrineMigrations\\Version20261011221838', NOW(), 10),
('DoctrineMigrations\\Version20261012011646', NOW(), 10),
('DoctrineMigrations\\Version20261012223940', NOW(), 10),
('DoctrineMigrations\\Version20261014120000', NOW(), 10)
ON DUPLICATE KEY UPDATE `executed_at` = VALUES(`executed_at`);

-- 2. Suppression propre si réimport
DROP TABLE IF EXISTS `analyse`;
DROP TABLE IF EXISTS `cv`;
DROP TABLE IF EXISTS `user`;

-- 3. Structure de la table `user`
CREATE TABLE `user` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `email` VARCHAR(180) NOT NULL,
  `roles` JSON NOT NULL,
  `role` VARCHAR(30) DEFAULT 'ROLE_USER' NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `actif` TINYINT(1) DEFAULT 1 NOT NULL,
  `cree_le` DATETIME DEFAULT NULL,
  UNIQUE INDEX `UNIQ_IDENTIFIER_EMAIL` (`email`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB;

-- 4. Structure de la table `cv` (Vierge de production)
CREATE TABLE `cv` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `proprietaire_id` INT DEFAULT NULL,
  `nom_original` VARCHAR(255) NOT NULL,
  `nom_fichier` VARCHAR(255) NOT NULL,
  `type_mime` VARCHAR(100) NOT NULL,
  `taille` INT NOT NULL,
  `jeton_acces_hash` VARCHAR(64) DEFAULT NULL,
  `jeton_expire_le` DATETIME DEFAULT NULL,
  `texte_offre` LONGTEXT DEFAULT NULL,
  `hash_fichier` VARCHAR(64) DEFAULT NULL,
  `cree_le` DATETIME NOT NULL,
  `texte_extrait` LONGTEXT DEFAULT NULL,
  UNIQUE INDEX `UNIQ_B66FFE926EF95ED7` (`nom_fichier`),
  INDEX `idx_cv_jeton_claim` (`jeton_acces_hash`, `jeton_expire_le`),
  INDEX `idx_cv_hash_fichier` (`hash_fichier`),
  INDEX `IDX_B66FFE9276C50E4A` (`proprietaire_id`),
  PRIMARY KEY (`id`),
  CONSTRAINT `FK_B66FFE9276C50E4A` FOREIGN KEY (`proprietaire_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB;

-- 5. Structure de la table `analyse` (Vierge de production)
CREATE TABLE `analyse` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `cv_id` INT NOT NULL,
  `statut` VARCHAR(20) NOT NULL,
  `texte_offre` LONGTEXT DEFAULT NULL,
  `note` INT DEFAULT NULL,
  `points_forts` JSON DEFAULT NULL,
  `points_faibles` JSON DEFAULT NULL,
  `competences` JSON DEFAULT NULL,
  `recommandations` JSON DEFAULT NULL,
  `erreur` LONGTEXT DEFAULT NULL,
  `cree_le` DATETIME NOT NULL,
  INDEX `IDX_351B0C7ECFE419E2` (`cv_id`),
  PRIMARY KEY (`id`),
  CONSTRAINT `FK_351B0C7ECFE419E2` FOREIGN KEY (`cv_id`) REFERENCES `cv` (`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB;

-- 6. Compte Administrateur Initial Unique
-- Identifiants de connexion :
-- Email : admin@appcv.com
-- Mot de passe : Admin123456!
INSERT INTO `user` (`id`, `email`, `roles`, `role`, `password`, `actif`, `cree_le`) VALUES
(1, 'admin@appcv.com', '["ROLE_ADMIN", "ROLE_USER"]', 'ROLE_ADMIN', '$2y$13$BtxVXbsMFiNFRwNHxblmBOVBRRTpUTUMgQ0HtV.puBVxrJc6s3LC2', 1, NOW());

SET foreign_key_checks = 1;