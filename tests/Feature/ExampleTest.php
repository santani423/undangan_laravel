<?php

it('returns a successful response', function () {
    $this->get('/')->assertOk()->assertJsonPath('version', 'v1');
});

it('exposes the app config to the frontend', function () {
    $this->get($this->api('app/config'))
        ->assertOk()
        ->assertJsonStructure(['success', 'data' => ['name', 'quote' => ['message', 'author']]]);
});
