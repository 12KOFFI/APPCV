<?php

namespace App\Command;

use App\Entity\Cv;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

#[AsCommand(
    name: 'app:cv:purger-anonymes',
    description: 'Purge les CV anonymes non rattachés expirés (après 48h) conformément au RGPD.'
)]
final class PurgerCvAnonymesCommand extends Command
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        #[Autowire('%kernel.project_dir%/var/uploads/cv')]
        private readonly string $dossierCv,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $maintenant = new \DateTimeImmutable();

        $qb = $this->em->createQueryBuilder();
        $cvsExpires = $qb->select('c')
            ->from(Cv::class, 'c')
            ->where('c.proprietaire IS NULL')
            ->andWhere('c.jetonExpireLe IS NOT NULL AND c.jetonExpireLe < :now')
            ->setParameter('now', $maintenant)
            ->getQuery()
            ->getResult();

        $count = count($cvsExpires);
        if ($count === 0) {
            $io->success('Aucun CV anonyme expiré à purger.');
            return Command::SUCCESS;
        }

        foreach ($cvsExpires as $cv) {
            $fichier = $this->dossierCv . '/' . $cv->getNomFichier();
            if (is_file($fichier)) {
                @unlink($fichier);
            }
            $this->em->remove($cv);
        }

        $this->em->flush();

        $io->success(sprintf('%d CV anonyme(s) expiré(s) purgé(s) avec succès conformément au RGPD.', $count));
        return Command::SUCCESS;
    }
}
