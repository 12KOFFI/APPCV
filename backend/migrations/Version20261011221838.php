<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261011221838 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user ENGINE = InnoDB');
        $this->addSql('CREATE TABLE cv (id INT AUTO_INCREMENT NOT NULL, nom_original VARCHAR(255) NOT NULL, nom_fichier VARCHAR(255) NOT NULL, type_mime VARCHAR(100) NOT NULL, taille INT NOT NULL, jeton_acces VARCHAR(64) NOT NULL, cree_le DATETIME NOT NULL, proprietaire_id INT DEFAULT NULL, UNIQUE INDEX UNIQ_B66FFE926EF95ED7 (nom_fichier), UNIQUE INDEX UNIQ_B66FFE927A31D13D (jeton_acces), INDEX IDX_B66FFE9276C50E4A (proprietaire_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 ENGINE = InnoDB');
        $this->addSql('ALTER TABLE cv ADD CONSTRAINT FK_B66FFE9276C50E4A FOREIGN KEY (proprietaire_id) REFERENCES user (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE cv DROP FOREIGN KEY FK_B66FFE9276C50E4A');
        $this->addSql('DROP TABLE cv');
    }
}
