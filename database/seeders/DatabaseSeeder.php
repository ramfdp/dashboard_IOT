<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            AdminSeeder::class,
            AdminUserSeeder::class,
            ListrikSeeder::class, // Generate PZEM sensor data
        ]);
    }
}
