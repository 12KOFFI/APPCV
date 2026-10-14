<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Remise à niveau du schéma (MySQL) : aligne la base sur les entités actuelles.
 *
 * - user : colonnes role, actif, cree_le (utilisées par le code, absentes des migrations initiales)
 * - cv   : jeton_acces (NOT NULL, sans valeur par défaut) remplacé par jeton_acces_hash / jeton_expire_le ;
 *          ajout de texte_offre, hash_fichier et des index associés
 * - messenger_messages : table du transport Doctrine, requise par la file d'analyse asynchrone
 *
 * Idempotente : chaque opération est conditionnée à l'état réel de la base (information_schema).
 */
final class Version20261014120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Alignement du schéma user / cv sur les entités et création de messenger_messages';
    }

    public function up(Schema $schema): void
    {
        // ── Table de la file Messenger (transport doctrine://default?auto_setup=0) ──
        if (!$this->tableExiste('messenger_messages')) {
            $this->addSql(
                'CREATE TABLE messenger_messages (
                    id BIGINT AUTO_INCREMENT NOT NULL,
                    body LONGTEXT NOT NULL,
                    headers LONGTEXT NOT NULL,
                    queue_name VARCHAR(190) NOT NULL,
                    created_at DATETIME NOT NULL,
                    available_at DATETIME NOT NULL,
                    delivered_at DATETIME DEFAULT NULL,
                    INDEX IDX_75EA56E0FB7336F0 (queue_name),
                    INDEX IDX_75EA56E0E3BD61CE (available_at),
                    INDEX IDX_75EA56E016BA31DB (delivered_at),
                    PRIMARY KEY (id)
                ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB'
            );
        }

        // ── Table user ──
        if (!$this->colonneExiste('user', 'role')) {
            $this->addSql("ALTER TABLE user ADD role VARCHAR(30) DEFAULT 'ROLE_USER' NOT NULL");
            // Conserve les droits des administrateurs existants (rôle déjà présent dans la colonne roles)
            $this->addSql("UPDATE user SET role = 'ROLE_ADMIN' WHERE JSON_CONTAINS(roles, '\"ROLE_ADMIN\"')");
        }

        if (!$this->colonneExiste('user', 'actif')) {
            $this->addSql('ALTER TABLE user ADD actif TINYINT(1) DEFAULT 1 NOT NULL');
        }

        if (!$this->colonneExiste('user', 'cree_le')) {
            $this->addSql('ALTER TABLE user ADD cree_le DATETIME DEFAULT NULL');
        }

        // ── Table cv ──
        // L'ancienne colonne jeton_acces était NOT NULL : tout INSERT du code actuel échouait.
        // Les jetons anonymes sont éphémères (48 h) : on les supprime et on repart sur le nouveau modèle.
        if ($this->colonneExiste('cv', 'jeton_acces')) {
            $this->addSql('ALTER TABLE cv DROP jeton_acces');
        }

        if (!$this->colonneExiste('cv', 'jeton_acces_hash')) {
            $this->addSql('ALTER TABLE cv ADD jeton_acces_hash VARCHAR(64) DEFAULT NULL');
        }

        if (!$this->colonneExiste('cv', 'jeton_expire_le')) {
            $this->addSql('ALTER TABLE cv ADD jeton_expire_le DATETIME DEFAULT NULL');
        }

        if (!$this->colonneExiste('cv', 'texte_offre')) {
            $this->addSql('ALTER TABLE cv ADD texte_offre LONGTEXT DEFAULT NULL');
        }

        if (!$this->colonneExiste('cv', 'hash_fichier')) {
            $this->addSql('ALTER TABLE cv ADD hash_fichier VARCHAR(64) DEFAULT NULL');
        }

        if (!$this->indexExiste('cv', 'idx_cv_jeton_claim')) {
            $this->addSql('CREATE INDEX idx_cv_jeton_claim ON cv (jeton_acces_hash, jeton_expire_le)');
        }

        if (!$this->indexExiste('cv', 'idx_cv_hash_fichier')) {
            $this->addSql('CREATE INDEX idx_cv_hash_fichier ON cv (hash_fichier)');
        }
    }

    public function down(Schema $schema): void
    {
        $this->throwIrreversibleMigrationException('Migration de remise à niveau : retour arrière non supporté.');
    }

    private function tableExiste(string $table): bool
    {
        return (int) $this->connection->fetchOne(
            'SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?',
            [$table]
        ) > 0;
    }

    private function colonneExiste(string $table, string $colonne): bool
    {
        return (int) $this->connection->fetchOne(
            'SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
            [$table, $colonne]
        ) > 0;
    }

    private function indexExiste(string $table, string $index): bool
    {
        return (int) $this->connection->fetchOne(
            'SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?',
            [$table, $index]
        ) > 0;
    }
}
