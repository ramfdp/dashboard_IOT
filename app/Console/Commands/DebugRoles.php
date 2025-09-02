<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Role;

class DebugRoles extends Command
{
    protected $signature = 'debug:roles';
    protected $description = 'Debug roles and user permissions';

    public function handle()
    {
        $this->info('=== ROLES ===');
        $roles = Role::all();
        foreach ($roles as $role) {
            $this->line("ID: {$role->id}, Name: {$role->name}, Guard: {$role->guard_name}");
        }

        $this->info("\n=== USERS ===");
        $users = User::with('roles')->get();
        foreach ($users as $user) {
            $this->line("User: {$user->name} (ID: {$user->id})");
            $this->line("  Email: {$user->email}");
            $this->line("  Role ID (column): {$user->role_id}");
            
            // Check roles via Spatie
            $roleNames = $user->roles->pluck('name')->toArray();
            $this->line("  Spatie Roles: " . implode(', ', $roleNames));
            
            // Check methods
            try {
                $hasAdmin = $user->hasRole('admin');
                $this->line("  hasRole('admin'): " . ($hasAdmin ? 'TRUE' : 'FALSE'));
            } catch (\Exception $e) {
                $this->error("  hasRole('admin'): ERROR - " . $e->getMessage());
            }
            
            try {
                $isAdmin = $user->isAdmin();
                $this->line("  isAdmin(): " . ($isAdmin ? 'TRUE' : 'FALSE'));
            } catch (\Exception $e) {
                $this->error("  isAdmin(): ERROR - " . $e->getMessage());
            }
            
            $this->line("---");
        }

        $this->info("\n=== MODEL_HAS_ROLES TABLE ===");
        try {
            $modelHasRoles = DB::table('model_has_roles')->get();
            foreach ($modelHasRoles as $mhr) {
                $this->line("Role ID: {$mhr->role_id}, Model: {$mhr->model_type}, Model ID: {$mhr->model_id}");
            }
        } catch (\Exception $e) {
            $this->error("Error reading model_has_roles: " . $e->getMessage());
        }
    }
}
