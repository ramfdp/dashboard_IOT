<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Cek apakah pengguna sudah login
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        // Ambil role pengguna saat ini
        $userRole = auth()->user()->getRoleNames()->first();
        
        // Jika pengguna memiliki role 'user' dan mencoba mengakses user management
        if ($userRole == 'user' && $request->is('user-management*')) {
            return redirect()->route('dashboard')->with('error', 'Anda tidak memiliki akses ke halaman ini');
        }
        
        // Jika ada role yang diperbolehkan, cek apakah pengguna memiliki salah satu dari role tersebut
        if (!empty($roles) && !in_array($userRole, $roles)) {
            return redirect()->route('dashboard')->with('error', 'Anda tidak memiliki akses ke halaman ini');
        }

        return $next($request);
    }
}