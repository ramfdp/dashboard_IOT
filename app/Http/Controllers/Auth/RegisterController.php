<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use Exception;

class RegisterController extends Controller
{
    public function register(Request $request)
    {
        // Validasi data input
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => [
                'required',
                'string',
                'confirmed',
                Password::min(8)->mixedCase()->letters()->numbers()->symbols()
            ],
            'agreement' => 'accepted'
        ]);

        try {
            // Simpan user baru ke database
            $user = User::create([
                'name' => $request->first_name . ' ' . $request->last_name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            // Jika ingin login otomatis setelah registrasi, gunakan ini:
            Auth::login($user);
            return redirect()->route('dashboard-v1');

            return redirect('/login')->with('success', 'Account created successfully! Please login.');

        } catch (Exception $e) {
            return back()->withErrors(['error' => 'Failed to create account. ' . $e->getMessage()]);
        }
    }
}
