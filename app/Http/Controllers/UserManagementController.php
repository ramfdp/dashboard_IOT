<?php

namespace App\Http\Controllers;

use App\Models\Overtime;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
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
        $overtimes = Overtime::all();

        $cacheBuster = time();

        return view('pages.management-user', compact('users', 'roles', 'overtimes', 'cacheBuster'));
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


    public function destroy($id)
    {
        try {
            $user = User::findOrFail($id);

            // Prevent deleting yourself
            if ($user->id === auth()->id()) {
                return redirect()->route('management-user')->with('error', 'Anda tidak dapat menghapus akun yang sedang digunakan');
            }

            // Check for related records that might prevent deletion
            $relatedOvertimes = $user->overtimes()->count();

            if ($relatedOvertimes > 0) {
                // Option 1: Prevent deletion if there are related records
                return redirect()->route('management-user')->with('error', 'User tidak dapat dihapus karena memiliki data lembur terkait (' . $relatedOvertimes . ' record)');

                // Option 2: Delete related records first (uncomment if you want this behavior)
                // $user->overtimes()->delete();
            }

            // Remove roles before deleting user (Spatie Permission)
            $user->syncRoles([]);
            $user->syncPermissions([]);

            // Delete the user
            $user->delete();

            return redirect()->route('management-user')->with('success', 'User berhasil dihapus');
        } catch (\Illuminate\Database\QueryException $e) {
            // Handle SQL constraint violations
            if ($e->getCode() === '23000') {
                return redirect()->route('management-user')->with('error', 'User tidak dapat dihapus karena masih memiliki data terkait di sistem');
            }

            Log::error('Error deleting user: ' . $e->getMessage());
            return redirect()->route('management-user')->with('error', 'Terjadi kesalahan saat menghapus user: ' . $e->getMessage());
        } catch (\Exception $e) {
            Log::error('Unexpected error deleting user: ' . $e->getMessage());
            return redirect()->route('management-user')->with('error', 'Terjadi kesalahan tidak terduga: ' . $e->getMessage());
        }
    }
}
