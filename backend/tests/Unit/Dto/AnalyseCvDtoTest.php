<?php

namespace App\Tests\Unit\Dto;

use App\Dto\AnalyseCvDto;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Validator\Validation;
use Symfony\Component\Validator\Validator\ValidatorInterface;

final class AnalyseCvDtoTest extends TestCase
{
    private ValidatorInterface $validator;

    protected function setUp(): void
    {
        $this->validator = Validation::createValidatorBuilder()
            ->enableAttributeMapping()
            ->getValidator();
    }

    public function testAnalyseValideAvecExactement5Recommandations(): void
    {
        $dto = new AnalyseCvDto(
            pointsForts: ['Bonne structure', 'Compétences backend claires'],
            pointsFaibles: ['Manque d\'exemples chiffrés'],
            competences: ['PHP', 'Symfony', 'MySQL'],
            recommandations: [
                'Rec 1', 'Rec 2', 'Rec 3', 'Rec 4', 'Rec 5'
            ],
            note: 75
        );

        $violations = $this->validator->validate($dto);
        $this->assertCount(0, $violations);
    }

    public function testRecommandationsNonConformesDeclenchentViolation(): void
    {
        // 4 recommandations au lieu de 5 exigées
        $dto = new AnalyseCvDto(
            pointsForts: ['Bonne structure'],
            pointsFaibles: ['Manque d\'exemples'],
            competences: ['PHP'],
            recommandations: [
                'Rec 1', 'Rec 2', 'Rec 3', 'Rec 4'
            ],
            note: 75
        );

        $violations = $this->validator->validate($dto);
        $this->assertGreaterThan(0, count($violations));
    }

    public function testNoteSuperieureA100DeclencheViolation(): void
    {
        $dto = new AnalyseCvDto(
            pointsForts: ['Bonne structure'],
            pointsFaibles: ['Manque d\'exemples'],
            competences: ['PHP'],
            recommandations: [
                'Rec 1', 'Rec 2', 'Rec 3', 'Rec 4', 'Rec 5'
            ],
            note: 120 // Note impossible > 100
        );

        $violations = $this->validator->validate($dto);
        $this->assertGreaterThan(0, count($violations));
    }
}
