<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Role;

class AssignAdminRole extends Command
{
    protected $signature = 'admin:assign {user_id}';
    protected $description = 'Assign admin role to user';

    public function handle()
    {
        $userId = $this->argument('user_id');

        $user = User::find($userId);
        if (!$user) {
            $this->error("User with ID {$userId} not found");
            return;
        }

        $adminRole = Role::where('name', 'admin')->first();
        if (!$adminRole) {
            $this->error("Admin role not found");
            return;
        }

        // Remove existing roles first
        $user->roles()->detach();

        // Assign admin role
        $user->assignRole($adminRole);

        $this->info("Admin role assigned to user: {$user->name}");

        // Verify
        $this->line("Verification:");
        $this->line("  hasRole('admin'): " . ($user->hasRole('admin') ? 'TRUE' : 'FALSE'));
        $this->line("  getRoleNames(): " . $user->getRoleNames()->implode(', '));
    }
}
