<?php

namespace App\MessageHandler;

use App\Entity\Analyse;
use App\Exception\AnalyseIaException;
use App\Message\AnalyserCvMessage;
use App\Repository\AnalyseRepository;
use App\Service\AnalyseurCvIa;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
final class AnalyserCvMessageHandler
{
    public function __construct(
        private readonly AnalyseRepository $analyseRepository,
        private readonly AnalyseurCvIa $analyseur,
        private readonly EntityManagerInterface $em,
    ) {}

    public function __invoke(AnalyserCvMessage $message): void
    {
        $analyse = $this->analyseRepository->find($message->analyseId);
        if (!$analyse) {
            return;
        }

        $analyse->setStatut(Analyse::STATUT_EN_COURS);
        $this->em->flush();

        try {
            $resultat = $this->analyseur->analyser(
                $analyse->getCv()->getTexteExtrait() ?? '',
                $analyse->getTexteOffre()
            );

            $analyse->setNote($resultat->note);
            $analyse->setPointsForts($resultat->pointsForts);
            $analyse->setPointsFaibles($resultat->pointsFaibles);
            $analyse->setCompetences($resultat->competences);
            $analyse->setRecommandations($resultat->recommandations);
            $analyse->setStatut(Analyse::STATUT_TERMINE);
        } catch (\Throwable $e) {
            $analyse->setStatut(Analyse::STATUT_ERREUR);
            $analyse->setErreur($e->getMessage());
        }

        $this->em->flush();
    }
}
