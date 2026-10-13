<?php

namespace App\Entity;

use App\Repository\CvRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\DBAL\Types\Types;


#[ORM\Entity(repositoryClass: CvRepository::class)]
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

    #[ORM\Column(length: 64, unique: true)]
    private string $jetonAcces;

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
        $this->jetonAcces = bin2hex(random_bytes(32));
        $this->creeLe = new \DateTimeImmutable();
        $this->analyses = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }
    public function getNomOriginal(): string { return $this->nomOriginal; }
    public function getNomFichier(): string { return $this->nomFichier; }
    public function getTypeMime(): string { return $this->typeMime; }
    public function getTaille(): int { return $this->taille; }
    public function getJetonAcces(): string { return $this->jetonAcces; }
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

}
