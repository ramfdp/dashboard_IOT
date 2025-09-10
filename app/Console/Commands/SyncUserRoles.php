<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\DB;

class SyncUserRoles extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'users:sync-roles {--force : Force sync even if data might be lost}';

    /**
     * The console command description.
     */
    protected $description = 'Synchronize user role_id with Spatie Permission roles (enforce single role constraint)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔄 Starting role synchronization...');
        
        $users = User::with(['roles', 'role'])->get();
        $totalUsers = $users->count();
        
        if ($totalUsers === 0) {
            $this->warn('No users found in the database.');
            return;
        }
        
        $this->info("📊 Found {$totalUsers} users to process.");
        
        $syncedCount = 0;
        $multipleRolesCount = 0;
        $noRoleCount = 0;
        $errorCount = 0;
        
        $this->withProgressBar($users, function ($user) use (&$syncedCount, &$multipleRolesCount, &$noRoleCount, &$errorCount) {
            try {
                $spatieRoles = $user->roles;
                $directRole = $user->role;
                
                if ($spatieRoles->count() > 1) {
                    // User has multiple roles - need to decide which one to keep
                    $multipleRolesCount++;
                    
                    if (!$this->option('force')) {
                        $this->newLine();
                        $this->warn("⚠️  User '{$user->name}' ({$user->email}) has multiple roles:");
                        foreach ($spatieRoles as $role) {
                            $this->line("   - {$role->name}");
                        }
                        
                        if ($directRole) {
                            $this->info("   Current role_id points to: {$directRole->name}");
                            $this->info("   Keeping role_id assignment and syncing Spatie Permission...");
                            $user->syncRoles([$directRole]);
                            $syncedCount++;
                        } else {
                            $this->info("   Taking first Spatie role: {$spatieRoles->first()->name}");
                            $user->update(['role_id' => $spatieRoles->first()->id]);
                            $user->syncRoles([$spatieRoles->first()]);
                            $syncedCount++;
                        }
                    } else {
                        // Force mode: take first role or role_id preference
                        $keepRole = $directRole ?: $spatieRoles->first();
                        $user->update(['role_id' => $keepRole->id]);
                        $user->syncRoles([$keepRole]);
                        $syncedCount++;
                    }
                    
                } elseif ($spatieRoles->count() === 1) {
                    // User has exactly one Spatie role
                    $spatieRole = $spatieRoles->first();
                    
                    if (!$directRole || $directRole->id !== $spatieRole->id) {
                        // role_id doesn't match Spatie role - sync it
                        $user->update(['role_id' => $spatieRole->id]);
                        $syncedCount++;
                    }
                    
                } elseif ($directRole) {
                    // User has role_id but no Spatie roles
                    $user->syncRoles([$directRole]);
                    $syncedCount++;
                    
                } else {
                    // User has no roles at all
                    $noRoleCount++;
                    $this->newLine();
                    $this->warn("⚠️  User '{$user->name}' ({$user->email}) has no roles assigned.");
                    
                    // Assign default 'user' role
                    $defaultRole = Role::where('name', 'user')->first();
                    if ($defaultRole) {
                        $user->update(['role_id' => $defaultRole->id]);
                        $user->syncRoles([$defaultRole]);
                        $this->info("   ✅ Assigned default 'user' role.");
                        $syncedCount++;
                    } else {
                        $this->error("   ❌ Default 'user' role not found!");
                        $errorCount++;
                    }
                }
                
            } catch (\Exception $e) {
                $errorCount++;
                $this->newLine();
                $this->error("❌ Error processing user '{$user->name}': " . $e->getMessage());
            }
        });
        
        $this->newLine();
        $this->newLine();
        $this->info('📋 Synchronization Summary:');
        $this->info("   ✅ Users synced: {$syncedCount}");
        $this->info("   ⚠️  Users with multiple roles: {$multipleRolesCount}");
        $this->info("   📭 Users with no roles (fixed): {$noRoleCount}");
        $this->info("   ❌ Errors: {$errorCount}");
        
        // Verification step
        $this->newLine();
        $this->info('🔍 Verification...');
        
        // Count users with multiple Spatie roles
        $inconsistentUsers = DB::table('model_has_roles')
            ->select('model_id')
            ->where('model_type', 'App\\Models\\User')
            ->groupBy('model_id')
            ->havingRaw('COUNT(*) > 1')
            ->count();
        
        $usersWithoutDirectRole = User::whereNull('role_id')->count();
        $usersWithoutSpatieRole = User::doesntHave('roles')->count();
        
        if ($inconsistentUsers > 0) {
            $this->warn("⚠️  {$inconsistentUsers} users still have multiple Spatie roles!");
        }
        
        if ($usersWithoutDirectRole > 0) {
            $this->warn("⚠️  {$usersWithoutDirectRole} users have no role_id set!");
        }
        
        if ($usersWithoutSpatieRole > 0) {
            $this->warn("⚠️  {$usersWithoutSpatieRole} users have no Spatie roles!");
        }
        
        if ($inconsistentUsers === 0 && $usersWithoutDirectRole === 0 && $usersWithoutSpatieRole === 0) {
            $this->info('✅ All users now have exactly one role! Single role constraint is enforced.');
        }
        
        $this->newLine();
        $this->info('🎉 Role synchronization completed!');
        
        return 0;
    }
}