<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261012223940 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE analyse (id INT AUTO_INCREMENT NOT NULL, statut VARCHAR(20) NOT NULL, texte_offre LONGTEXT DEFAULT NULL, note INT DEFAULT NULL, points_forts JSON DEFAULT NULL, points_faibles JSON DEFAULT NULL, competences JSON DEFAULT NULL, recommandations JSON DEFAULT NULL, erreur LONGTEXT DEFAULT NULL, cree_le DATETIME NOT NULL, cv_id INT NOT NULL, INDEX IDX_351B0C7ECFE419E2 (cv_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 ENGINE = InnoDB');
        $this->addSql('ALTER TABLE analyse ADD CONSTRAINT FK_351B0C7ECFE419E2 FOREIGN KEY (cv_id) REFERENCES cv (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE analyse DROP FOREIGN KEY FK_351B0C7ECFE419E2');
        $this->addSql('DROP TABLE analyse');
    }
}
