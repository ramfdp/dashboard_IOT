<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Role;

class AssignUserRole extends Command
{
    protected $signature = 'user:assign {user_id}';
    protected $description = 'Assign user role to user';

    public function handle()
    {
        $userId = $this->argument('user_id');

        $user = User::find($userId);
        if (!$user) {
            $this->error("User with ID {$userId} not found");
            return;
        }

        // Update role field directly (no longer using Spatie Permission)
        $user->update(['role' => 'user']);

        $this->info("User role assigned to user: {$user->name}");

        // Verify
        $this->line("Verification:");
        $this->line("  hasRole('user'): " . ($user->hasRole('user') ? 'TRUE' : 'FALSE'));
        $this->line("  getRoleNames(): " . $user->getRoleNames()->implode(', '));
    }
}
