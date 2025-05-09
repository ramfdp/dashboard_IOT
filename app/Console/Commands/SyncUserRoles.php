<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Role;

class UpdateUserRoles extends Command
{
    protected $signature = 'users:update-roles';
    protected $description = 'Update user role values based on role_id';

    public function handle()
    {
        $users = User::all();
        $this->info('Updating user roles...');
        
        foreach ($users as $user) {
            if ($user->role_id) {
                $role = Role::find($user->role_id);
                if ($role) {
                    // Update langsung ke kolom database jika menggunakan kolom 'role'
                    $user->role = $role->name;
                    $user->save();
                    
                    $this->info("Updated user {$user->name} with role {$role->name}");
                }
            }
        }
        
        $this->info('User roles have been updated!');
    }
}