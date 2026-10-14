<?php

namespace App\Entity;

use App\Repository\CvRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\DBAL\Types\Types;

#[ORM\Entity(repositoryClass: CvRepository::class)]
#[ORM\Index(name: 'idx_cv_jeton_claim', fields: ['jetonAccesHash', 'jetonExpireLe'])]
#[ORM\Index(name: 'idx_cv_hash_fichier', fields: ['hashFichier'])]
class Cv
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $nomOriginal;

    #[ORM\Column(length: 255, unique: true)]
    private string $nomFichier;

    #[ORM\Column(length: 100)]
    private string $typeMime;

    #[ORM\Column]
    private int $taille;

    #[ORM\Column(length: 64, nullable: true)]
    private ?string $jetonAccesHash = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $jetonExpireLe = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $texteOffre = null;

    #[ORM\Column(length: 64, nullable: true)]
    private ?string $hashFichier = null;

    #[ORM\Column(type: Types::SMALLINT, nullable: true)]
    private ?int $scoreTeaser = null;

    /** @var list<string>|null */
    #[ORM\Column(type: Types::JSON, nullable: true)]
    private ?array $constatsTeaser = null;

    #[ORM\Column(type: Types::SMALLINT, nullable: true)]
    private ?int $nbProblemesTeaser = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'CASCADE')]
    private ?User $proprietaire = null;

    #[ORM\Column]
    private \DateTimeImmutable $creeLe;

    /** @var Collection<int, Analyse> */
    #[ORM\OneToMany(targetEntity: Analyse::class, mappedBy: 'cv', cascade: ['remove'], orphanRemoval: true)]
    private Collection $analyses;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $texteExtrait = null;

    public function __construct(
        string $nomOriginal,
        string $nomFichier,
        string $typeMime,
        int $taille,
        ?User $proprietaire = null,
    ) {
        $this->nomOriginal = mb_substr($nomOriginal, 0, 255);
        $this->nomFichier = $nomFichier;
        $this->typeMime = $typeMime;
        $this->taille = $taille;
        $this->proprietaire = $proprietaire;
        $this->creeLe = new \DateTimeImmutable();
        $this->analyses = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }
    public function getNomOriginal(): string { return $this->nomOriginal; }
    public function getNomFichier(): string { return $this->nomFichier; }
    public function getTypeMime(): string { return $this->typeMime; }
    public function getTaille(): int { return $this->taille; }
    public function getProprietaire(): ?User { return $this->proprietaire; }
    public function getCreeLe(): \DateTimeImmutable { return $this->creeLe; }

    /** @return Collection<int, Analyse> */
    public function getAnalyses(): Collection { return $this->analyses; }

    public function setProprietaire(?User $proprietaire): static
    {
        $this->proprietaire = $proprietaire;
        return $this;
    }

    public function getTexteExtrait(): ?string { return $this->texteExtrait; }

    public function setTexteExtrait(?string $texteExtrait): static
    {
        $this->texteExtrait = $texteExtrait;
        return $this;
    }

    public function getJetonAccesHash(): ?string { return $this->jetonAccesHash; }

    public function setJetonAccesHash(?string $jetonAccesHash): static
    {
        $this->jetonAccesHash = $jetonAccesHash;
        return $this;
    }

    public function getJetonExpireLe(): ?\DateTimeImmutable { return $this->jetonExpireLe; }

    public function setJetonExpireLe(?\DateTimeImmutable $jetonExpireLe): static
    {
        $this->jetonExpireLe = $jetonExpireLe;
        return $this;
    }

    public function getTexteOffre(): ?string { return $this->texteOffre; }

    public function setTexteOffre(?string $texteOffre): static
    {
        $this->texteOffre = $texteOffre;
        return $this;
    }

    public function getHashFichier(): ?string { return $this->hashFichier; }

    public function setHashFichier(?string $hashFichier): static
    {
        $this->hashFichier = $hashFichier;
        return $this;
    }

    public function getScoreTeaser(): ?int { return $this->scoreTeaser; }

    public function setScoreTeaser(?int $scoreTeaser): static
    {
        $this->scoreTeaser = $scoreTeaser;
        return $this;
    }

    public function getConstatsTeaser(): ?array { return $this->constatsTeaser; }

    public function setConstatsTeaser(?array $constatsTeaser): static
    {
        $this->constatsTeaser = $constatsTeaser;
        return $this;
    }

    public function getNbProblemesTeaser(): ?int { return $this->nbProblemesTeaser; }

    public function setNbProblemesTeaser(?int $nbProblemesTeaser): static
    {
        $this->nbProblemesTeaser = $nbProblemesTeaser;
        return $this;
    }
}
