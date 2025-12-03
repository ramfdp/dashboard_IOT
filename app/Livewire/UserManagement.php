<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\WithPagination;
use App\Models\User;
// use Spatie\Permission\Models\Role; // Not needed - using simple role field
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Rules\SingleRoleConstraint;

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
            'role_id' => 'required|in:admin,user',
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
        $this->editRoleId = $user->role ?? '';

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
        // Custom validation for string role
        $this->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role_id' => 'required|in:admin,user'
        ]);

        try {
            // Create user with role string only (Spatie Permission tables removed)
            $userData = [
                'name' => $this->name,
                'email' => $this->email,
                'password' => Hash::make($this->password),
                'email_verified_at' => now(),
                'role' => $this->role_id, // Store role as string
            ];

            $user = User::create($userData);

            session()->flash('success_user', 'User berhasil ditambahkan dengan role: ' . ucfirst($this->role_id));

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
            'editRoleId' => 'required|in:admin,user',
        ]);

        try {
            $user = User::findOrFail($this->editUserId);

            $updateData = [
                'name' => $this->editName,
                'email' => $this->editEmail,
                'role' => $this->editRoleId, // Store role as string
            ];

            if (!empty($this->editPassword)) {
                $updateData['password'] = Hash::make($this->editPassword);
            }

            $user->update($updateData);

            session()->flash('success_user', 'User berhasil diupdate dengan role: ' . ucfirst($this->editRoleId));

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
            try {
                $relatedOvertimes = $user->overtimes()->count();

                if ($relatedOvertimes > 0) {
                    session()->flash('error_user', 'User tidak dapat dihapus karena memiliki ' . $relatedOvertimes . ' data lembur terkait.');
                    $this->closeDeleteModal();
                    return;
                }
            } catch (\Exception $relationError) {
                // If overtime relationship fails, try checking by employee_name
                Log::info('Overtime relationship check failed, trying by name: ' . $relationError->getMessage());
                
                try {
                    $overtimesByName = \App\Models\Overtime::where('employee_name', $user->name)->count();

                    if ($overtimesByName > 0) {
                        session()->flash('error_user', 'User tidak dapat dihapus karena memiliki ' . $overtimesByName . ' data lembur terkait.');
                        $this->closeDeleteModal();
                        return;
                    }
                } catch (\Exception $e) {
                    // If overtime check fails completely, continue anyway
                    Log::warning('Could not check overtime data: ' . $e->getMessage());
                }
            }

            // Delete the user (no need to cleanup Spatie tables - they don't exist)
            $user->delete();

            session()->flash('success_user', 'User "' . $user->name . '" berhasil dihapus.');

            $this->closeDeleteModal();
        } catch (\Illuminate\Database\QueryException $e) {
            // Handle database errors
            Log::error('Database error deleting user ID ' . $this->deleteUserId . ': ' . $e->getMessage());
            
            if (str_contains($e->getMessage(), 'foreign key constraint')) {
                session()->flash('error_user', 'User tidak dapat dihapus karena masih memiliki data terkait di sistem.');
            } else {
                session()->flash('error_user', 'Terjadi kesalahan database. Silakan coba lagi atau hubungi administrator.');
            }
            
            $this->closeDeleteModal();
        } catch (\Exception $e) {
            Log::error('Unexpected error deleting user ID ' . $this->deleteUserId . ': ' . $e->getMessage());
            session()->flash('error_user', 'Gagal menghapus user. Silakan coba lagi.');
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
        $query = User::query();

        // Apply search filter
        if ($this->search) {
            $query->where(function ($q) {
                $q->where('name', 'like', '%' . $this->search . '%')
                    ->orWhere('email', 'like', '%' . $this->search . '%');
            });
        }

        // Apply role filter
        if ($this->filterRole) {
            $query->where('role', $this->filterRole);
        }

        $users = $query->paginate(10);

        // Create roles array for filter dropdown
        $roles = collect([
            (object)['id' => 'admin', 'name' => 'Admin'],
            (object)['id' => 'user', 'name' => 'User']
        ]);

        return view('livewire.user-management', [
            'users' => $users,
            'roles' => $roles
        ]);
    }
}
