<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class EnsureSingleRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check()) {
            $user = Auth::user();
            
            // Check if user has multiple Spatie roles
            $spatieRoleCount = $user->roles()->count();
            
            if ($spatieRoleCount > 1) {
                Log::warning("User {$user->id} ({$user->email}) has multiple roles", [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'spatie_roles' => $user->roles->pluck('name')->toArray(),
                    'direct_role' => $user->role?->name,
                    'action' => 'auto_sync_triggered'
                ]);
                
                // Auto-fix: Keep the direct role if available, otherwise keep first Spatie role
                $keepRole = $user->role ?: $user->roles()->first();
                
                if ($keepRole) {
                    $user->syncRoles([$keepRole]);
                    Log::info("Auto-synced user {$user->id} to single role: {$keepRole->name}");
                }
            }
            
            // Check if role_id and Spatie roles are consistent
            $directRole = $user->role;
            $spatieRole = $user->roles()->first();
            
            if ($directRole && $spatieRole && $directRole->id !== $spatieRole->id) {
                Log::warning("User {$user->id} has inconsistent roles", [
                    'user_id' => $user->id,
                    'direct_role' => $directRole->name,
                    'spatie_role' => $spatieRole->name,
                    'action' => 'sync_to_direct_role'
                ]);
                
                // Sync to direct role (role_id takes precedence)
                $user->syncRoles([$directRole]);
            }
        }
        
        return $next($request);
    }
}
