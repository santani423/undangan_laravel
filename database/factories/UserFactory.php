<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Every user is a customer unless a role state says otherwise.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (User $user) {
            if ($user->roles()->doesntExist()) {
                $user->assignRole(Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']));
            }
        });
    }

    /**
     * Create the user as an admin (or another role) instead of a customer.
     */
    public function admin(string $role = 'admin'): static
    {
        return $this->afterCreating(function (User $user) use ($role) {
            $user->syncRoles([Role::firstOrCreate(['name' => $role, 'guard_name' => 'web'])]);
        });
    }

    /**
     * Create the user without any role.
     */
    public function withoutRole(): static
    {
        return $this->afterCreating(fn (User $user) => $user->syncRoles([]));
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
