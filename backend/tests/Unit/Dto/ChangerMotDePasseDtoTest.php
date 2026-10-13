<?php

namespace App\Tests\Unit\Dto;

use App\Dto\ChangerMotDePasseDto;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Validator\Validation;
use Symfony\Component\Validator\Validator\ValidatorInterface;

final class ChangerMotDePasseDtoTest extends TestCase
{
    private ValidatorInterface $validator;

    protected function setUp(): void
    {
        $this->validator = Validation::createValidatorBuilder()
            ->enableAttributeMapping()
            ->getValidator();
    }

    public function testDtoValide(): void
    {
        $dto = new ChangerMotDePasseDto(
            ancienMotDePasse: 'AncienPass123!',
            nouveauMotDePasse: 'NouveauPass456!'
        );

        $violations = $this->validator->validate($dto);
        $this->assertCount(0, $violations);
    }

    public function testDtoInvalideChampsVides(): void
    {
        $dto = new ChangerMotDePasseDto(
            ancienMotDePasse: '',
            nouveauMotDePasse: ''
        );

        $violations = $this->validator->validate($dto);
        $this->assertGreaterThanOrEqual(2, count($violations));
    }

    public function testDtoNouveauMotDePasseTropCourt(): void
    {
        $dto = new ChangerMotDePasseDto(
            ancienMotDePasse: 'AncienPass123!',
            nouveauMotDePasse: 'short'
        );

        $violations = $this->validator->validate($dto);
        $this->assertCount(1, $violations);
        $this->assertSame('nouveauMotDePasse', $violations[0]->getPropertyPath());
    }
}
