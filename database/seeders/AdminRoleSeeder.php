<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;

class AdminRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Membuat role admin jika belum ada
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        
        // Menambahkan role admin ke semua user yang ada
        $users = User::all();
        foreach ($users as $user) {
            $user->assignRole('admin');
        }
    }
}