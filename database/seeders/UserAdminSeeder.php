<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

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
        
        // Membuat permission jika diperlukan
        Permission::firstOrCreate(['name' => 'create users']);
        Permission::firstOrCreate(['name' => 'edit users']);
        Permission::firstOrCreate(['name' => 'delete users']);

        // Memberikan permission ke role admin
        $adminRole->givePermissionTo('create users');
        $adminRole->givePermissionTo('edit users');
        $adminRole->givePermissionTo('delete users');

        // Menambahkan role admin ke semua user yang ada
        $users = User::all();
        foreach ($users as $user) {
            $user->assignRole('admin');
        }
    }
}