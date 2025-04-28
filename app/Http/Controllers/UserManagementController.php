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
        $users = User::with('roles')->get();
        $roles = Role::all();
        $departments = Department::all();
        $overtimes = Overtime::all();
    
        return view('pages.dashboard-v1', compact('users', 'roles', 'departments', 'overtimes'));
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
    
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role_id' => $validated['role_id'],
            'role' => Role::find($validated['role_id'])->name, // <-- tambahkan ini
        ]);
    
        // Assign role ke user
        $roleName = Role::find($validated['role_id'])->name;
        $user->assignRole($roleName);
        return redirect()->route('user-management')->with('success', 'User berhasil ditambahkan');
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
    
        // Update role name juga supaya sinkron
        $validated['role'] = Role::find($validated['role_id'])->name;
    
        $user->update($validated);
    
        return redirect()->route('user-management')->with('success', 'User berhasil diperbarui');
    }    
    

    public function destroy(User $user)
    {
        // Prevent deleting yourself
        if ($user->id === auth()->id()) {
            return redirect()->route('user-management')->with('error', 'Anda tidak dapat menghapus akun yang sedang digunakan');
        }

        $user->delete();

        return redirect()->route('user-management')->with('success', 'User berhasil dihapus');
    }
}