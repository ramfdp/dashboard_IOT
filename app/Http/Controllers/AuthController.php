<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function showLoginForm()
    {
        return view('pages.login-v3'); // Sesuaikan dengan nama file Blade Anda
    }

    public function login(Request $request) // Pastikan ada parameter Request $request
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first(); // Pindahkan ke dalam metode

        if (Auth::attempt($request->only('email', 'password'))) {
            return redirect()->route('dashboard-v1');
        }

        return back()->withErrors(['email' => 'Email atau password salah']);
    }

    public function logout(Request $request) {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/login');
    }
}
