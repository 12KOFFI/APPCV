<?php

namespace App\Command;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
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
            ->addArgument('email', InputArgument::OPTIONAL, 'Adresse email de l\'admin', 'admin@appcv.com')
            ->addArgument('password', InputArgument::OPTIONAL, 'Mot de passe de l\'admin', 'Admin123456!');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $email = mb_strtolower(trim((string) $input->getArgument('email')));
        $password = (string) $input->getArgument('password');

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
        $output->writeln("  - Mot de passe : <info>{$password}</info>");
        $output->writeln("  - Rôle : <info>{$user->getRole()}</info>");

        return Command::SUCCESS;
    }
}
