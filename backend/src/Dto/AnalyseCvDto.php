<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

final class AnalyseCvDto
{
    /**
     * @param list<string> $pointsForts
     * @param list<string> $pointsFaibles
     * @param list<string> $competences
     * @param list<string> $recommandations
     */
    public function __construct(
        #[Assert\Count(min: 1, max: 10)]
        #[Assert\All([new Assert\Type('string'), new Assert\NotBlank()])]
        public readonly array $pointsForts,

        #[Assert\Count(min: 1, max: 10)]
        #[Assert\All([new Assert\Type('string'), new Assert\NotBlank()])]
        public readonly array $pointsFaibles,

        #[Assert\Count(min: 1, max: 40)]
        #[Assert\All([new Assert\Type('string'), new Assert\NotBlank()])]
        public readonly array $competences,

        #[Assert\Count(exactly: 5)]
        #[Assert\All([new Assert\Type('string'), new Assert\NotBlank()])]
        public readonly array $recommandations,

        #[Assert\Range(min: 0, max: 100)]
        public readonly int $note,
    ) {}
}
