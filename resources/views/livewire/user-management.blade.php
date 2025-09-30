<div>
    <div class="row justify-content-center mt-4 mb-4">
        <div class="col-md-12">
            <div class="card">
                <div class="card-header">
                    <h4 class="float-start">Manajemen User</h4>
                    <button type="button" class="btn btn-primary float-end" wire:click="openAddModal">
                        <i class="fas fa-plus"></i> Tambah User
                    </button>
                </div>

                <div class="card-body">
                    <!-- Flash Messages -->
                    @if (session()->has('success_user'))
                        <div class="alert alert-success alert-dismissible fade show" role="alert">
                            {{ session('success_user') }}
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        </div>
                    @endif

                    @if (session()->has('error_user'))
                        <div class="alert alert-danger alert-dismissible fade show" role="alert">
                            {{ session('error_user') }}
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        </div>
                    @endif

                    <!-- Search and Filter -->
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="user_search" class="form-label visually-hidden">Cari User</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-search"></i></span>
                                <input type="text" 
                                       id="user_search" 
                                       name="search"
                                       autocomplete="off"
                                       class="form-control" 
                                       placeholder="Cari nama atau email..." 
                                       wire:model.live="search">
                            </div>
                        </div>
                        <div class="col-md-3">
                            <label for="role_filter" class="form-label visually-hidden">Filter Role</label>
                            <select id="role_filter" 
                                    name="filterRole"
                                    autocomplete="off"
                                    class="form-select" 
                                    wire:model.live="filterRole">
                                <option value="">Semua Role</option>
                                @foreach($roles as $role)
                                    <option value="{{ $role->id }}">{{ ucfirst($role->name) }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-3">
                            @if($search || $filterRole)
                                <button type="button" 
                                        class="btn btn-secondary" 
                                        wire:click="$set('search', '')" 
                                        wire:click="$set('filterRole', '')"
                                        aria-label="Reset Filter">
                                    <i class="fas fa-times"></i> Reset Filter
                                </button>
                            @endif
                        </div>
                    </div>

                    <!-- Users Table -->
                    <div class="table-responsive">
                        <table class="table table-bordered table-striped">
                            <thead class="table-dark">
                                <tr>
                                    <th width="5%">#</th>
                                    <th width="25%">Nama</th>
                                    <th width="25%">Email</th>
                                    <th width="15%">Role</th>
                                    <th width="15%">Tanggal Dibuat</th>
                                    <th width="15%">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($users as $key => $user)
                                    <tr>
                                        <td>{{ $users->firstItem() + $key }}</td>
                                        <td>{{ $user->name }}</td>
                                        <td>{{ $user->email }}</td>
                                        <td>
                                            @if($user->role)
                                                <span class="badge {{ $user->role === 'admin' ? 'bg-primary' : 'bg-info' }}">{{ ucfirst($user->role) }}</span>
                                            @else
                                                <span class="badge bg-secondary">No Role</span>
                                            @endif
                                        </td>
                                        <td>{{ $user->created_at->format('d M Y H:i') }}</td>
                                        <td>
                                            <div class="btn-group" role="group">
                                                <button type="button" class="btn btn-sm btn-info" wire:click="openEditModal({{ $user->id }})">
                                                    <i class="fas fa-edit"></i> Edit
                                                </button>
                                                
                                                @if(auth()->id() !== $user->id)
                                                    <button type="button" class="btn btn-sm btn-danger" wire:click="openDeleteModal({{ $user->id }})">
                                                        <i class="fas fa-trash"></i> Hapus
                                                    </button>
                                                @endif
                                            </div>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="6" class="text-center">
                                            @if($search || $filterRole)
                                                Tidak ada user yang sesuai dengan pencarian.
                                            @else
                                                Belum ada user.
                                            @endif
                                        </td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    <div class="d-flex justify-content-center">
                        {{ $users->links() }}
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Add User Modal -->
    @if($showAddModal)
        <div class="modal fade show" style="display: block;" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-user-plus"></i> Tambah User Baru
                        </h5>
                        <button type="button" class="btn-close" wire:click="closeAddModal" aria-label="Close Add User Modal"></button>
                    </div>
                    <form wire:submit.prevent="store">
                        <div class="modal-body">
                            <div class="mb-3">
                                <label for="add_name" class="form-label">Nama <span class="text-danger">*</span></label>
                                <input type="text" 
                                       id="add_name" 
                                       name="name"
                                       autocomplete="name"
                                       class="form-control @error('name') is-invalid @enderror" 
                                       wire:model="name" 
                                       placeholder="Masukkan nama lengkap">
                                @error('name') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>

                            <div class="mb-3">
                                <label for="add_email" class="form-label">Email <span class="text-danger">*</span></label>
                                <input type="email" 
                                       id="add_email" 
                                       name="email"
                                       autocomplete="email"
                                       class="form-control @error('email') is-invalid @enderror" 
                                       wire:model="email" 
                                       placeholder="user@example.com">
                                @error('email') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>

                            <div class="mb-3">
                                <label for="add_password" class="form-label">Password <span class="text-danger">*</span></label>
                                <input type="password" 
                                       id="add_password" 
                                       name="password"
                                       autocomplete="new-password"
                                       class="form-control @error('password') is-invalid @enderror" 
                                       wire:model="password" 
                                       placeholder="Minimal 8 karakter">
                                @error('password') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>

                            <div class="mb-3">
                                <label for="add_role_id" class="form-label">Role <span class="text-danger">*</span></label>
                                <select id="add_role_id" 
                                        name="role_id"
                                        autocomplete="off"
                                        class="form-select @error('role_id') is-invalid @enderror" 
                                        wire:model="role_id">
                                    <option value="">Pilih Role</option>
                                    @foreach($roles as $role)
                                        <option value="{{ $role->id }}">{{ ucfirst($role->name) }}</option>
                                    @endforeach
                                </select>
                                @error('role_id') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" wire:click="closeAddModal">
                                <i class="fas fa-times"></i> Batal
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Simpan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <div class="modal-backdrop fade show"></div>
    @endif

    <!-- Edit User Modal -->
    @if($showEditModal)
        <div class="modal fade show" style="display: block;" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-user-edit"></i> Edit User
                        </h5>
                        <button type="button" class="btn-close" wire:click="closeEditModal" aria-label="Close Edit User Modal"></button>
                    </div>
                    <form wire:submit.prevent="update">
                        <div class="modal-body">
                            <div class="mb-3">
                                <label for="edit_name" class="form-label">Nama <span class="text-danger">*</span></label>
                                <input type="text" 
                                       id="edit_name" 
                                       name="editName"
                                       autocomplete="name"
                                       class="form-control @error('editName') is-invalid @enderror" 
                                       wire:model="editName" 
                                       placeholder="Masukkan nama lengkap">
                                @error('editName') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>

                            <div class="mb-3">
                                <label for="edit_email" class="form-label">Email <span class="text-danger">*</span></label>
                                <input type="email" 
                                       id="edit_email" 
                                       name="editEmail"
                                       autocomplete="email"
                                       class="form-control @error('editEmail') is-invalid @enderror" 
                                       wire:model="editEmail" 
                                       placeholder="user@example.com">
                                @error('editEmail') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>

                            <div class="mb-3">
                                <label for="edit_password" class="form-label">Password</label>
                                <input type="password" 
                                       id="edit_password" 
                                       name="editPassword"
                                       autocomplete="new-password"
                                       class="form-control @error('editPassword') is-invalid @enderror" 
                                       wire:model="editPassword" 
                                       placeholder="Kosongkan jika tidak ingin mengubah">
                                <small class="form-text text-muted">Kosongkan jika tidak ingin mengubah password.</small>
                                @error('editPassword') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>

                            <div class="mb-3">
                                <label for="edit_role_id" class="form-label">Role <span class="text-danger">*</span></label>
                                <select id="edit_role_id" 
                                        name="editRoleId"
                                        autocomplete="off"
                                        class="form-select @error('editRoleId') is-invalid @enderror" 
                                        wire:model="editRoleId">
                                    <option value="">Pilih Role</option>
                                    @foreach($roles as $role)
                                        <option value="{{ $role->id }}">{{ ucfirst($role->name) }}</option>
                                    @endforeach
                                </select>
                                @error('editRoleId') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" wire:click="closeEditModal">
                                <i class="fas fa-times"></i> Batal
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Update
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <div class="modal-backdrop fade show"></div>
    @endif

    <!-- Delete Confirmation Modal -->
    @if($showDeleteModal)
        <div class="modal fade show" style="display: block;" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title text-danger">
                            <i class="fas fa-exclamation-triangle"></i> Konfirmasi Hapus
                        </h5>
                        <button type="button" class="btn-close" wire:click="closeDeleteModal" aria-label="Close Delete Confirmation Modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-warning">
                            <i class="fas fa-warning"></i>
                            <strong>Peringatan!</strong> Tindakan ini tidak dapat dibatalkan.
                        </div>
                        <p>Anda yakin ingin menghapus user <strong>{{ $deleteUserName }}</strong>?</p>
                        <p class="text-muted">Semua data yang terkait dengan user ini akan ikut terhapus.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" wire:click="closeDeleteModal">
                            <i class="fas fa-times"></i> Batal
                        </button>
                        <button type="button" class="btn btn-danger" wire:click="delete">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-backdrop fade show"></div>
    @endif

    <style>
    .modal.show {
        background: rgba(0, 0, 0, 0.5);
    }

    .table th {
        background-color: #343a40;
        color: white;
        border-color: #454d55;
    }

    .btn-group .btn {
        margin-right: 0;
    }

    .alert-dismissible .btn-close {
        padding: 0.5rem;
    }

    .badge {
        font-size: 0.75em;
    }

    .form-label span.text-danger {
        font-weight: bold;
    }

    .modal-backdrop.show {
        opacity: 0.5;
    }

    .visually-hidden {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
    }
    </style>
</div>
