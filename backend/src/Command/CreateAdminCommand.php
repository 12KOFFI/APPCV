<?php

namespace App\Command;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Question\Question;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:create-admin',
    description: 'Crée ou promeut un utilisateur au rôle ROLE_ADMIN avec un mot de passe.'
)]
class CreateAdminCommand extends Command
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly UserPasswordHasherInterface $hasher,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('email', InputArgument::REQUIRED, 'Adresse email de l\'admin')
            ->addArgument('password', InputArgument::OPTIONAL, 'Mot de passe (si omis, il sera demandé de façon masquée)');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $email = mb_strtolower(trim((string) $input->getArgument('email')));
        $password = (string) $input->getArgument('password');

        // Pas de mot de passe par défaut : saisie masquée si non fourni (évite le passage en clair dans l'historique shell)
        if ($password === '') {
            $question = (new Question('Mot de passe administrateur : '))
                ->setHidden(true)
                ->setHiddenFallback(false);
            $password = (string) $this->getHelper('question')->ask($input, $output, $question);
        }

        if (mb_strlen($password) < 8) {
            $output->writeln('<error>Le mot de passe doit comporter au moins 8 caractères.</error>');
            return Command::FAILURE;
        }

        $repo = $this->em->getRepository(User::class);
        $user = $repo->findOneBy(['email' => $email]);

        if (!$user) {
            $user = new User();
            $user->setEmail($email);
            $this->em->persist($user);
            $output->writeln("<info>Création du compte administrateur : {$email}</info>");
        } else {
            $output->writeln("<comment>Mise à jour du compte administrateur existant : {$email}</comment>");
        }

        $user->setPassword($this->hasher->hashPassword($user, $password));
        $user->setRole('ROLE_ADMIN');
        $user->setRoles(['ROLE_ADMIN', 'ROLE_USER']);
        $user->setActif(true);

        $this->em->flush();

        $output->writeln("<info>[SUCCÈS] Administrateur configuré :</info>");
        $output->writeln("  - Email : <info>{$email}</info>");
        $output->writeln("  - Rôle : <info>{$user->getRole()}</info>");

        return Command::SUCCESS;
    }
}
