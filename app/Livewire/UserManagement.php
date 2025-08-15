<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\WithPagination;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class UserManagement extends Component
{
    use WithPagination;

    // Form properties
    public $name = '';
    public $email = '';
    public $password = '';
    public $role_id = '';

    // Modal properties
    public $showAddModal = false;
    public $showEditModal = false;
    public $showDeleteModal = false;

    // Edit properties
    public $editUserId = null;
    public $editName = '';
    public $editEmail = '';
    public $editPassword = '';
    public $editRoleId = '';

    // Delete properties
    public $deleteUserId = null;
    public $deleteUserName = '';

    // Search and filter
    public $search = '';
    public $filterRole = '';

    protected $queryString = ['search', 'filterRole'];

    protected function rules()
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
        ];

        if ($this->editUserId) {
            $rules['email'] = 'required|email|unique:users,email,' . $this->editUserId;
            $rules['password'] = 'nullable|string|min:8';
        }

        return $rules;
    }

    protected $messages = [
        'name.required' => 'Nama harus diisi.',
        'email.required' => 'Email harus diisi.',
        'email.email' => 'Format email tidak valid.',
        'email.unique' => 'Email sudah digunakan.',
        'password.required' => 'Password harus diisi.',
        'password.min' => 'Password minimal 8 karakter.',
        'role_id.required' => 'Role harus dipilih.',
        'role_id.exists' => 'Role tidak valid.',
    ];

    public function mount()
    {
        // Set default values
        $this->resetPage();
    }

    public function updatingSearch()
    {
        $this->resetPage();
    }

    public function updatingFilterRole()
    {
        $this->resetPage();
    }

    public function openAddModal()
    {
        $this->resetForm();
        $this->showAddModal = true;
    }

    public function closeAddModal()
    {
        $this->showAddModal = false;
        $this->resetForm();
    }

    public function openEditModal($userId)
    {
        $user = User::findOrFail($userId);

        $this->editUserId = $user->id;
        $this->editName = $user->name;
        $this->editEmail = $user->email;
        $this->editPassword = '';
        $this->editRoleId = $user->roles->first()->id ?? '';

        $this->showEditModal = true;
    }

    public function closeEditModal()
    {
        $this->showEditModal = false;
        $this->resetEditForm();
    }

    public function openDeleteModal($userId)
    {
        $user = User::findOrFail($userId);

        $this->deleteUserId = $user->id;
        $this->deleteUserName = $user->name;

        $this->showDeleteModal = true;
    }

    public function closeDeleteModal()
    {
        $this->showDeleteModal = false;
        $this->resetDeleteForm();
    }

    public function store()
    {
        $this->validate();

        try {
            // Create user with only the required fields that exist in the database
            $userData = [
                'name' => $this->name,
                'email' => $this->email,
                'password' => Hash::make($this->password),
                'email_verified_at' => now(), // Set email as verified
            ];

            $user = User::create($userData);

            // Assign role using Spatie Permission
            $role = Role::findOrFail($this->role_id);
            $user->assignRole($role);

            session()->flash('success_user', 'User berhasil ditambahkan.');

            $this->closeAddModal();
            $this->resetForm();
        } catch (\Exception $e) {
            Log::error('User creation failed: ' . $e->getMessage(), [
                'name' => $this->name,
                'email' => $this->email,
                'role_id' => $this->role_id,
                'trace' => $e->getTraceAsString()
            ]);
            session()->flash('error_user', 'Gagal menambahkan user: ' . $e->getMessage());
        }
    }

    public function update()
    {
        $this->validate([
            'editName' => 'required|string|max:255',
            'editEmail' => 'required|email|unique:users,email,' . $this->editUserId,
            'editPassword' => 'nullable|string|min:8',
            'editRoleId' => 'required|exists:roles,id',
        ]);

        try {
            $user = User::findOrFail($this->editUserId);

            $updateData = [
                'name' => $this->editName,
                'email' => $this->editEmail,
            ];

            if (!empty($this->editPassword)) {
                $updateData['password'] = Hash::make($this->editPassword);
            }

            $user->update($updateData);

            // Update role using Spatie Permission
            $role = Role::findOrFail($this->editRoleId);
            $user->syncRoles([$role]);

            session()->flash('success_user', 'User berhasil diupdate.');

            $this->closeEditModal();
        } catch (\Exception $e) {
            session()->flash('error_user', 'Gagal mengupdate user: ' . $e->getMessage());
        }
    }

    public function delete()
    {
        try {
            // Prevent self-deletion
            if ($this->deleteUserId == Auth::id()) {
                session()->flash('error_user', 'Tidak dapat menghapus akun sendiri.');
                $this->closeDeleteModal();
                return;
            }

            $user = User::findOrFail($this->deleteUserId);

            // Check for related records that might prevent deletion
            // Using try-catch in case the column doesn't exist yet
            try {
                $relatedOvertimes = $user->overtimes()->count();

                if ($relatedOvertimes > 0) {
                    session()->flash('error_user', 'User tidak dapat dihapus karena memiliki data lembur terkait (' . $relatedOvertimes . ' record).');
                    $this->closeDeleteModal();
                    return;
                }
            } catch (\Exception $relationError) {
                // If overtime relationship fails, check by employee_name
                Log::info('Overtime relationship check failed, checking by name: ' . $relationError->getMessage());
                $overtimesByName = \App\Models\Overtime::where('employee_name', $user->name)->count();

                if ($overtimesByName > 0) {
                    session()->flash('error_user', 'User tidak dapat dihapus karena memiliki data lembur terkait (' . $overtimesByName . ' record berdasarkan nama).');
                    $this->closeDeleteModal();
                    return;
                }
            }

            // Remove roles and permissions before deleting user (Spatie Permission)
            // Wrap in try-catch to handle missing permission tables gracefully
            try {
                $user->syncRoles([]);
                $user->syncPermissions([]);
            } catch (\Exception $permissionError) {
                // Log the error but continue with deletion
                Log::warning('Could not sync roles/permissions during user deletion: ' . $permissionError->getMessage());
            }

            // Delete the user
            $user->delete();

            session()->flash('success_user', 'User berhasil dihapus.');

            $this->closeDeleteModal();
        } catch (\Illuminate\Database\QueryException $e) {
            // Handle SQL constraint violations
            if ($e->getCode() === '23000') {
                session()->flash('error_user', 'User tidak dapat dihapus karena masih memiliki data terkait di sistem.');
            } elseif ($e->getCode() === '42S02') {
                session()->flash('error_user', 'Terjadi kesalahan konfigurasi database. Silahkan hubungi administrator.');
                Log::error('Missing table error during user deletion: ' . $e->getMessage());
            } else {
                Log::error('SQL error deleting user: ' . $e->getMessage());
                session()->flash('error_user', 'Terjadi kesalahan database saat menghapus user. Error: ' . $e->getCode());
            }
            $this->closeDeleteModal();
        } catch (\Exception $e) {
            Log::error('Unexpected error deleting user: ' . $e->getMessage());
            session()->flash('error_user', 'Gagal menghapus user: ' . $e->getMessage());
            $this->closeDeleteModal();
        }
    }

    private function resetForm()
    {
        $this->name = '';
        $this->email = '';
        $this->password = '';
        $this->role_id = '';
        $this->resetValidation();
    }

    private function resetEditForm()
    {
        $this->editUserId = null;
        $this->editName = '';
        $this->editEmail = '';
        $this->editPassword = '';
        $this->editRoleId = '';
        $this->resetValidation();
    }

    private function resetDeleteForm()
    {
        $this->deleteUserId = null;
        $this->deleteUserName = '';
    }

    public function render()
    {
        $query = User::with('roles');

        // Apply search filter
        if ($this->search) {
            $query->where(function ($q) {
                $q->where('name', 'like', '%' . $this->search . '%')
                    ->orWhere('email', 'like', '%' . $this->search . '%');
            });
        }

        // Apply role filter
        if ($this->filterRole) {
            $query->whereHas('roles', function ($q) {
                $q->where('id', $this->filterRole);
            });
        }

        $users = $query->paginate(10);
        $roles = Role::all();

        return view('livewire.user-management', [
            'users' => $users,
            'roles' => $roles
        ]);
    }
}
