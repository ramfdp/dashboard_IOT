<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Spatie\Permission\Models\Role;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Buat role admin
        $adminRole = Role::firstOrCreate(
            ['name' => 'admin', 'guard_name' => 'web']
        );

        // Buat user admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'role' => 'admin' // Opsional, jika kamu pakai kolom 'role' di tabel users
            ]
        );

        // Assign role ke user
        $admin->assignRole($adminRole);
    }
}
