<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Testing\Fluent\AssertableJson;
use Illuminate\Testing\TestResponse;

abstract class TestCase extends BaseTestCase
{
    public static function setUpBeforeClass(): void
    {
        parent::setUpBeforeClass();

        // Fluent assertions on the `data` payload of an API envelope — the
        // JSON counterpart of the assertInertia() page-props assertions the
        // tests used before the frontend was split out.
        TestResponse::macro('assertData', function (callable $callback) {
            /** @var TestResponse $this */
            $this->assertJsonPath('success', true);
            $callback(AssertableJson::fromArray((array) $this->json('data')));

            return $this;
        });
    }

    /**
     * Every request is sent the way the React SPA sends it: JSON, from the
     * frontend origin (a Sanctum stateful domain), so API routes get the
     * session cookie authentication. Webhook tests override the headers.
     */
    protected function setUp(): void
    {
        parent::setUp();

        $this->withHeaders([
            'Accept' => 'application/json',
            'Origin' => 'http://localhost',
            'Referer' => 'http://localhost/',
        ]);
    }

    /** URL of an /api/v1 endpoint: api('/customer') → /api/v1/customer. */
    protected function api(string $path = ''): string
    {
        return '/api/v1/'.ltrim($path, '/');
    }
}
