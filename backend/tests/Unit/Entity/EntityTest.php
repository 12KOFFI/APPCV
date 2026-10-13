<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Analyse;
use App\Entity\Cv;
use App\Entity\User;
use PHPUnit\Framework\TestCase;

final class EntityTest extends TestCase
{
    public function testUserEntity(): void
    {
        $user = new User();
        $user->setEmail('dev@example.com');
        $user->setPassword('hash_securise');

        $this->assertSame('dev@example.com', $user->getEmail());
        $this->assertSame('dev@example.com', $user->getUserIdentifier());
        $this->assertContains('ROLE_USER', $user->getRoles());
        $this->assertSame('hash_securise', $user->getPassword());
    }

    public function testCvEntity(): void
    {
        $user = new User();
        $cv = new Cv('cv.pdf', 'hash.pdf', 'application/pdf', 1024, $user);
        $cv->setTexteExtrait('Texte extrait du document pour analyse...');

        $this->assertSame('cv.pdf', $cv->getNomOriginal());
        $this->assertSame('hash.pdf', $cv->getNomFichier());
        $this->assertSame('application/pdf', $cv->getTypeMime());
        $this->assertSame(1024, $cv->getTaille());
        $this->assertSame($user, $cv->getProprietaire());
        $this->assertNotEmpty($cv->getCreeLe());
        $this->assertSame('Texte extrait du document pour analyse...', $cv->getTexteExtrait());
    }

    public function testAnalyseEntity(): void
    {
        $cv = new Cv('cv.pdf', 'hash.pdf', 'application/pdf', 1024);
        $analyse = new Analyse($cv, 'Offre Symfony...');

        $this->assertSame($cv, $analyse->getCv());
        $this->assertSame('Offre Symfony...', $analyse->getTexteOffre());
        $this->assertSame(Analyse::STATUT_TERMINE, $analyse->getStatut());

        $analyse->setStatut(Analyse::STATUT_EN_COURS);
        $analyse->setNote(88);
        $analyse->setPointsForts(['Excellente maîtrise technique']);
        $analyse->setPointsFaibles(['Manque d\'anglais']);
        $analyse->setCompetences(['PHP', 'Symfony']);
        $analyse->setRecommandations(['Améliorer le niveau d\'anglais']);

        $this->assertSame(Analyse::STATUT_EN_COURS, $analyse->getStatut());
        $this->assertSame(88, $analyse->getNote());
        $this->assertCount(1, $analyse->getPointsForts());
        $this->assertCount(1, $analyse->getPointsFaibles());
        $this->assertCount(2, $analyse->getCompetences());
        $this->assertCount(1, $analyse->getRecommandations());
    }
}
