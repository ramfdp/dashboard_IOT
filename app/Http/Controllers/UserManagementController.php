<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Overtime;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    public function __construct()
    {
        $this->middleware('admin');
    }

    public function index()
    {
        $users = User::with('role')->get();
        $roles = Role::all();
        $departments = Department::all();
        $overtimes = Overtime::all();

        $cacheBuster = time();

        return view('pages.dashboard-v1', compact('users', 'roles', 'departments', 'overtimes', 'cacheBuster'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
        ]);
    
        $validated['password'] = Hash::make($validated['password']);
    
        // Buat user tanpa role_id dan role
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
        ]);
    
        // Assign role menggunakan Spatie
        $roleName = Role::find($validated['role_id'])->name;
        $user->assignRole($roleName);
        
        return redirect()->route('dashboard-v1')->with('success_user', 'User berhasil ditambahkan');
    }    

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'role_id' => 'required|exists:roles,id',
        ]);
    
        if ($request->filled('password')) {
            $validated['password'] = Hash::make($request->password);
        }
    
        // Hapus role_id dan role dari data yang akan diupdate
        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];
        
        if (isset($validated['password'])) {
            $updateData['password'] = $validated['password'];
        }
        
        // Update user data
        $user->update($updateData);
        
        // Sync role menggunakan Spatie
        $roleName = Role::find($validated['role_id'])->name;
        $user->syncRoles([$roleName]);
    
        return redirect()->route('dashboard-v1')->with('success_user', 'User berhasil diperbarui');
    }
    

    public function destroy(User $user)
    {
        // Prevent deleting yourself
        if ($user->id === auth()->id()) {
            return redirect()->route('dashboard-v1')->with('error', 'Anda tidak dapat menghapus akun yang sedang digunakan');
        }

        $user->delete();

        return redirect()->route('dashboard-v1')->with('error_user', 'User berhasil dihapus');
    }
}