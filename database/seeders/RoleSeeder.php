<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run()
    {
        // Roles yang ingin ditambahkan
        $roles = ['admin', 'user', 'manager', 'supervisor'];
        
        foreach ($roles as $roleName) {
            // Cek apakah role sudah ada, jika belum maka buat
            if (!Role::where('name', $roleName)->exists()) {
                Role::create(['name' => $roleName, 'guard_name' => 'web']);
            }
        }
    }
}