<?php

namespace App\Service;

use App\Entity\Cv;
use App\Entity\User;
use App\Exception\ExtractionImpossibleException;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\File\UploadedFile;

final class CvUploadService
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ExtracteurTexte $extracteur,
        #[Autowire('%kernel.project_dir%/var/uploads/cv')]
        private readonly string $dossierCv,
    ) {}

    public function enregistrer(UploadedFile $fichier, ?User $proprietaire): Cv
    {
        // 1. On lit TOUT avant de déplacer le fichier
        $typeMime = $fichier->getMimeType();
        $taille = $fichier->getSize();
        $nomOriginal = $fichier->getClientOriginalName();
        $extension = $fichier->guessExtension();

        // 2. Nom aléatoire + déplacement dans le dossier privé
        $nomFichier = bin2hex(random_bytes(16)) . '.' . $extension;
        $fichier->move($this->dossierCv, $nomFichier);
        $chemin = $this->dossierCv . '/' . $nomFichier;

        // 3. Extraction du texte. En cas d'échec, on supprime le fichier orphelin
        try {
            $texte = $this->extracteur->extraire($chemin, $typeMime);
        } catch (ExtractionImpossibleException $e) {
            if (is_file($chemin)) {
                unlink($chemin);
            }
            throw $e;
        }

        // 4. Enregistrement en base
        $cv = new Cv($nomOriginal, $nomFichier, $typeMime, $taille, $proprietaire);
        $cv->setTexteExtrait($texte);

        $this->em->persist($cv);
        $this->em->flush();

        return $cv;
    }
}
