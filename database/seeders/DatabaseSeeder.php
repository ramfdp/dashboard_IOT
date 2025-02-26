<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        User::create([
            'name' => 'Dummy User',
            'email' => 'dummy@example.com',
            'password' => bcrypt('password123'),
        ]);
    }
}