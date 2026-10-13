<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

final class ChangerMotDePasseDto
{
    public function __construct(
        #[Assert\NotBlank(message: 'Le mot de passe actuel est obligatoire.')]
        public readonly string $ancienMotDePasse = '',

        #[Assert\NotBlank(message: 'Le nouveau mot de passe est obligatoire.')]
        #[Assert\Length(min: 8, max: 4096, minMessage: 'Le mot de passe doit faire au moins {{ limit }} caractères.')]
        public readonly string $nouveauMotDePasse = '',
    ) {}
}
