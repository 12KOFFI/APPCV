<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

final class DemandeAnalyseDto
{
    public function __construct(
        #[Assert\Length(max: 15000, maxMessage: "L'offre d'emploi ne doit pas dépasser 15 000 caractères.")]
        public readonly ?string $texteOffre = null,
    ) {}
}
