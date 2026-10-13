<?php

namespace App\Tests\Unit\Dto;

use App\Dto\InscriptionDto;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Validator\Validation;
use Symfony\Component\Validator\Validator\ValidatorInterface;

final class InscriptionDtoTest extends TestCase
{
    private ValidatorInterface $validator;

    protected function setUp(): void
    {
        $this->validator = Validation::createValidatorBuilder()
            ->enableAttributeMapping()
            ->getValidator();
    }

    public function testInscriptionValide(): void
    {
        $dto = new InscriptionDto('developpeur@example.com', 'motdepasseSecurise123');
        $violations = $this->validator->validate($dto);

        $this->assertCount(0, $violations);
    }

    public function testEmailInvalide(): void
    {
        $dto = new InscriptionDto('pas-un-email-valide', 'motdepasseSecurise123');
        $violations = $this->validator->validate($dto);

        $this->assertGreaterThan(0, count($violations));
        $this->assertSame("L'email n'est pas valide.", $violations[0]->getMessage());
    }

    public function testEmailVide(): void
    {
        $dto = new InscriptionDto('', 'motdepasseSecurise123');
        $violations = $this->validator->validate($dto);

        $this->assertGreaterThan(0, count($violations));
    }

    public function testMotDePasseTropCourt(): void
    {
        $dto = new InscriptionDto('test@example.com', 'court');
        $violations = $this->validator->validate($dto);

        $this->assertGreaterThan(0, count($violations));
        $this->assertStringContainsString('au moins 8 caractères', $violations[0]->getMessage());
    }
}
