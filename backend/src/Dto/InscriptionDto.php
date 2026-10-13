<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

final class InscriptionDto
{
    public function __construct(
        #[Assert\NotBlank(message: "L'email est obligatoire.")]
        #[Assert\Email(message: "L'email n'est pas valide.")]
        #[Assert\Length(max: 180)]
        public readonly string $email = '',

        #[Assert\NotBlank(message: 'Le mot de passe est obligatoire.')]
        #[Assert\Length(min: 8, max: 4096, minMessage: 'Le mot de passe doit faire au moins {{ limit }} caractères.')]
        public readonly string $motDePasse = '',
    ) {}
}
