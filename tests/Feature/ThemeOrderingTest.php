<?php

use App\Models\Theme;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

function makeTheme(string $eventType, string $name, array $attrs = []): Theme
{
    return Theme::create(array_merge([
        'name'       => $name,
        'slug'       => str($name)->slug()->toString(),
        'category'   => 'Floral',
        'event_type' => $eventType,
        'is_active'  => true,
    ], $attrs));
}

function orderOf(string $eventType): array
{
    return Theme::where('event_type', $eventType)->ordered()->pluck('sort_order', 'name')->all();
}

function adminUser(): User
{
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

    return tap(User::factory()->create())->assignRole('admin');
}

it('appends new themes to the end of their own invitation type', function () {
    makeTheme('wedding', 'W1');
    makeTheme('birthday', 'B1');
    makeTheme('wedding', 'W2');

    expect(orderOf('wedding'))->toBe(['W1' => 1, 'W2' => 2])
        ->and(orderOf('birthday'))->toBe(['B1' => 1]);
});

it('closes the gap when a theme is deleted', function () {
    makeTheme('wedding', 'W1');
    $w2 = makeTheme('wedding', 'W2');
    makeTheme('wedding', 'W3');

    $w2->delete();

    expect(orderOf('wedding'))->toBe(['W1' => 1, 'W3' => 2]);
});

it('moves a theme to the end of its new type when the type changes', function () {
    $w1 = makeTheme('wedding', 'W1');
    makeTheme('wedding', 'W2');
    makeTheme('birthday', 'B1');

    $w1->update(['event_type' => 'birthday']);

    expect(orderOf('wedding'))->toBe(['W2' => 1])
        ->and(orderOf('birthday'))->toBe(['B1' => 1, 'W1' => 2]);
});

it('lets an admin reorder one invitation type without touching others', function () {
    $w1 = makeTheme('wedding', 'W1');
    $w2 = makeTheme('wedding', 'W2');
    $w3 = makeTheme('wedding', 'W3');
    makeTheme('birthday', 'B1');
    makeTheme('birthday', 'B2');
    $before = Theme::find($w1->id)->only(['slug', 'name', 'event_type', 'updated_at']);

    $this->actingAs(adminUser())
        ->patchJson(route('admin.themes.reorder'), ['event_type' => 'wedding', 'ids' => [$w3->id, $w1->id, $w2->id]])
        ->assertOk();

    expect(orderOf('wedding'))->toBe(['W3' => 1, 'W1' => 2, 'W2' => 3])
        ->and(orderOf('birthday'))->toBe(['B1' => 1, 'B2' => 2])
        ->and(Theme::find($w1->id)->only(['slug', 'name', 'event_type', 'updated_at']))->toEqual($before);
});

it('rejects a reorder that is partial, duplicated or crosses types', function (callable $payload) {
    $w1 = makeTheme('wedding', 'W1');
    $w2 = makeTheme('wedding', 'W2');
    $b1 = makeTheme('birthday', 'B1');

    $this->actingAs(adminUser())
        ->patchJson(route('admin.themes.reorder'), ['event_type' => 'wedding', 'ids' => $payload($w1, $w2, $b1)])
        ->assertUnprocessable();

    expect(orderOf('wedding'))->toBe(['W1' => 1, 'W2' => 2]);
})->with([
    'partial'     => [fn ($w1, $w2, $b1) => [$w2->id]],
    'duplicate'   => [fn ($w1, $w2, $b1) => [$w2->id, $w2->id]],
    'cross type'  => [fn ($w1, $w2, $b1) => [$w2->id, $w1->id, $b1->id]],
]);

it('forbids non-admins from reordering', function () {
    $w1 = makeTheme('wedding', 'W1');

    $this->actingAs(User::factory()->create())
        ->patchJson(route('admin.themes.reorder'), ['event_type' => 'wedding', 'ids' => [$w1->id]])
        ->assertForbidden();
});

it('appends raw-inserted (seeded) themes after existing positions', function () {
    makeTheme('wedding', 'W1');
    makeTheme('wedding', 'W2');
    DB::table('themes')->insert(['name' => 'W0', 'slug' => 'w0', 'event_type' => 'wedding', 'created_at' => now(), 'updated_at' => now()]);

    Theme::resequenceAll();

    expect(orderOf('wedding'))->toBe(['W1' => 1, 'W2' => 2, 'W0' => 3]);
});

it('serves the public theme catalog in sort_order, not by popularity', function () {
    makeTheme('wedding', 'Popular', ['usage_count' => 999]);
    $quiet = makeTheme('wedding', 'Quiet', ['usage_count' => 0]);
    $popular = Theme::where('name', 'Popular')->first();

    Theme::reorder('wedding', [$quiet->id, $popular->id]);

    $this->get(route('themes.index'))
        ->assertInertia(fn ($page) => $page
            ->where('themes.0.name', 'Quiet')
            ->where('themes.1.name', 'Popular'));
});
