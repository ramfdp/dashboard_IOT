<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Models\Overtime;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('roles')->get();
        $roles = Role::all();
        $overtimes = Overtime::with('user')->get();
        return view('pages.dashboard-v1', compact('users', 'roles', 'overtimes'));
    }
    

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'role' => 'required|exists:roles,name',
        ]);

        $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
        'role' => $request->role,
        ]);

        $user->assignRole($validated['role']);

        return redirect()->route('users.index')->with('success', 'User berhasil ditambahkan!');
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }
        
        $user->delete();
        
        return redirect()->back()->with('success', 'User berhasil dihapus.');
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $request->validate([
            'role' => 'required|exists:roles,name'
        ]);
        
        $user->syncRoles([$request->role]);
        
        return redirect()->back()->with('success', 'Role user berhasil diperbarui.');
    }
}
