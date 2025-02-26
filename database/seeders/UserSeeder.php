<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Jalankan seeder.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Admin',
                'email' => 'admin@gmail.com',
                'password' => 'admin123',
            ],
            [
                'name' => 'Budi Sales',
                'email' => 'budi.sales@gmail.com',
                'password' => 'sales123',
            ],
            [
                'name' => 'Agus Superintendent',
                'email' => 'agus.superintendent@gmail.com',
                'password' => 'super123',
            ],
            [
                'name' => 'Ratna Manager',
                'email' => 'ratna.manager@gmail.com',
                'password' => 'manager123',
            ],
        ];

        User::factory()->count(10)->create();

        foreach ($users as $user) {
            User::firstOrCreate(
                ['email' => $user['email']], // Cek apakah email sudah ada
                [
                    'name' => $user['name'],
                    'password' => Hash::make($user['password']),
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }
    }
}
