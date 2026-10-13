<?php

namespace App\Entity;

use App\Repository\AnalyseRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AnalyseRepository::class)]
class Analyse
{
    public const STATUT_EN_ATTENTE = 'EN_ATTENTE';
    public const STATUT_EN_COURS = 'EN_COURS';
    public const STATUT_TERMINE = 'TERMINE';
    public const STATUT_ERREUR = 'ERREUR';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'analyses')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Cv $cv = null;

    #[ORM\Column(length: 20)]
    private string $statut = self::STATUT_TERMINE;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $texteOffre = null;

    #[ORM\Column(nullable: true)]
    private ?int $note = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    private ?array $pointsForts = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    private ?array $pointsFaibles = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    private ?array $competences = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    private ?array $recommandations = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $erreur = null;

    #[ORM\Column]
    private \DateTimeImmutable $creeLe;

    public function __construct(Cv $cv, ?string $texteOffre = null)
    {
        $this->cv = $cv;
        $this->texteOffre = $texteOffre ? trim($texteOffre) : null;
        $this->creeLe = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }
    public function getCv(): ?Cv { return $this->cv; }
    public function getStatut(): string { return $this->statut; }
    public function setStatut(string $statut): static { $this->statut = $statut; return $this; }
    public function getTexteOffre(): ?string { return $this->texteOffre; }
    public function getNote(): ?int { return $this->note; }
    public function setNote(?int $note): static { $this->note = $note; return $this; }
    public function getPointsForts(): ?array { return $this->pointsForts; }
    public function setPointsForts(?array $pointsForts): static { $this->pointsForts = $pointsForts; return $this; }
    public function getPointsFaibles(): ?array { return $this->pointsFaibles; }
    public function setPointsFaibles(?array $pointsFaibles): static { $this->pointsFaibles = $pointsFaibles; return $this; }
    public function getCompetences(): ?array { return $this->competences; }
    public function setCompetences(?array $competences): static { $this->competences = $competences; return $this; }
    public function getRecommandations(): ?array { return $this->recommandations; }
    public function setRecommandations(?array $recommandations): static { $this->recommandations = $recommandations; return $this; }
    public function getErreur(): ?string { return $this->erreur; }
    public function setErreur(?string $erreur): static { $this->erreur = $erreur; return $this; }
    public function getCreeLe(): \DateTimeImmutable { return $this->creeLe; }
}
