<?php

namespace App\Tests\Functional\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class SanteControllerTest extends WebTestCase
{
    public function testEndpointSanteRetourne200EtJson(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/sante');

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/json');

        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
        $this->assertSame('ok', $data['statut']);
    }
}
