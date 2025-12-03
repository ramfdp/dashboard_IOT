<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Get all users
     */
    public function index()
    {
        $users = User::all(); // Removed with('roles') - using simple role field

        $userData = $users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role ?? 'user',
                'created_at' => $user->created_at->format('Y-m-d H:i:s')
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $userData
        ]);
    }

    /**
     * Create new user
     */
    public function store(Request $request)
    {
        // Custom validation untuk role yang case-insensitive
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|string'
        ]);

        // Validasi role secara manual dengan case-insensitive
        $normalizedRole = strtolower($request->role);
        if (!in_array($normalizedRole, ['admin', 'user'])) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => ['role' => ['Role harus admin atau user']]
            ], 422);
        }

        try {

            // Get the correct role_id from roles table
            $role = \Spatie\Permission\Models\Role::where('name', $normalizedRole)->first();
            $roleId = $role ? $role->id : null;

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $normalizedRole,
                'role_id' => $roleId,
            ]);

            // Assign role using Spatie Permission
            $user->assignRole($normalizedRole);

            return response()->json([
                'success' => true,
                'message' => 'User berhasil ditambahkan',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $normalizedRole
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show specific user
     */
    public function show($id)
    {
        $user = User::find($id); // Removed with('roles') - using simple role field

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role ?? 'user',
                'created_at' => $user->created_at->format('Y-m-d H:i:s')
            ]
        ]);
    }

    /**
     * Update user
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        // Custom validation
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:8',
            'role' => 'required|string'
        ]);

        // Validasi role secara manual dengan case-insensitive
        $normalizedRole = strtolower($request->role);
        if (!in_array($normalizedRole, ['admin', 'user'])) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => ['role' => ['Role harus admin atau user']]
            ], 422);
        }

        try {
            // Get the correct role_id from roles table
            $role = \Spatie\Permission\Models\Role::where('name', $normalizedRole)->first();
            $roleId = $role ? $role->id : null;

            $updateData = [
                'name' => $request->name,
                'email' => $request->email,
                'role' => $normalizedRole,
                'role_id' => $roleId,
            ];

            // Update password if provided
            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($request->password);
            }

            $user->update($updateData);

            // Update role
            $user->syncRoles([$normalizedRole]);

            // Refresh user data from database to ensure we get updated values
            $user->refresh();

            return response()->json([
                'success' => true,
                'message' => 'User berhasil diupdate',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete user
     */
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        // Prevent deleting own account if authenticated
        if (auth('api')->check() && auth('api')->id() == $id) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat menghapus akun sendiri'
            ], 403);
        }

        try {
            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'User berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user statistics
     */
    public function statistics()
    {
        try {
            $totalUsers = User::count();
            $adminCount = User::role('admin')->count();
            $userCount = User::role('user')->count();
            $recentUsers = User::latest()->take(5)->get(['id', 'name', 'email', 'created_at']);

            return response()->json([
                'success' => true,
                'data' => [
                    'total_users' => $totalUsers,
                    'admin_count' => $adminCount,
                    'user_count' => $userCount,
                    'recent_users' => $recentUsers
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting statistics: ' . $e->getMessage()
            ], 500);
        }
    }
}
