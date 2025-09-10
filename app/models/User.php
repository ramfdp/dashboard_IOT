<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Spatie\Permission\Models\Role as SpatieRole;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'email_verified_at'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Relationship with Department
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Relationship with Role
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Relationship with Overtime records
     */
    public function overtimes()
    {
        return $this->hasMany(Overtime::class, 'employee_id');
    }

    /**
     * Override assignRole to enforce single role constraint
     * Automatically updates role_id when using Spatie Permission
     */
    public function assignRole(...$roles)
    {
        // Clear existing roles first to ensure single role
        $this->syncRoles([]);
        
        // Get the first role (since we only allow one)
        $role = collect($roles)->first();
        
        if ($role) {
            // Assign the role using Spatie Permission
            parent::assignRole($role);
            
            // Update the role_id column to maintain consistency
            if (is_string($role)) {
                $roleModel = Role::where('name', $role)->first();
            } elseif (is_object($role) && isset($role->id)) {
                $roleModel = $role;
            } else {
                $roleModel = Role::find($role);
            }
            
            if ($roleModel && isset($roleModel->id)) {
                $this->update(['role_id' => $roleModel->id]);
            }
        }
        
        return $this;
    }

    /**
     * Override syncRoles to enforce single role constraint
     */
    public function syncRoles(...$roles)
    {
        $role = collect($roles)->flatten()->first();
        
        if ($role) {
            // Sync with single role
            parent::syncRoles([$role]);
            
            // Update the role_id column to maintain consistency
            if (is_string($role)) {
                $roleModel = Role::where('name', $role)->first();
            } elseif (is_object($role) && isset($role->id)) {
                $roleModel = $role;
            } else {
                $roleModel = Role::find($role);
            }
            
            if ($roleModel && isset($roleModel->id)) {
                $this->update(['role_id' => $roleModel->id]);
            }
        } else {
            // Clear all roles
            parent::syncRoles([]);
            $this->update(['role_id' => null]);
        }
        
        return $this;
    }

    /**
     * Boot method to sync role_id when role changes
     */
    protected static function boot()
    {
        parent::boot();

        static::updated(function ($user) {
            // If role_id was updated directly, sync with Spatie Permission
            if ($user->isDirty('role_id') && $user->role_id) {
                $role = Role::find($user->role_id);
                if ($role) {
                    // Use parent syncRoles method to avoid infinite loop
                    $user->roles()->sync([$role->id]);
                }
            }
        });
    }

    /**
     * Check if user is admin
     */
    public function isAdmin()
    {
        return $this->hasRole('admin') || $this->role?->name === 'admin';
    }

    /**
     * Get user's department name
     */
    public function getDepartmentNameAttribute()
    {
        return $this->department?->name ?? 'No Department';
    }

    /**
     * Get user's role name
     */
    public function getRoleNameAttribute()
    {
        return $this->role?->name ?? 'No Role';
    }

    /**
     * Get the single role assigned to this user
     */
    public function getSingleRole()
    {
        return $this->role ?? $this->roles()->first();
    }

    /**
     * Check if user has specific role (enhanced version)
     */
    public function hasRole($role, $guardName = null): bool
    {
        // Check using direct relationship first (faster)
        if ($this->role && (
            (is_string($role) && $this->role->name === $role) ||
            (is_object($role) && $this->role->id === $role->id)
        )) {
            return true;
        }
        
        // Fallback to Spatie Permission check
        return parent::hasRole($role, $guardName);
    }

    /**
     * Search users by name, email, or username
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%");
        });
    }

    /**
     * Get users by role
     */
    public function scopeByRole($query, $roleId)
    {
        return $query->where('role_id', $roleId);
    }

    /**
     * Get users by role name
     */
    public function scopeByRoleName($query, $roleName)
    {
        return $query->whereHas('role', function ($q) use ($roleName) {
            $q->where('name', $roleName);
        });
    }

    /**
     * Validation rule for ensuring single role assignment
     */
    public static function validateSingleRole($userId = null, $roleId = null)
    {
        $rules = [
            'role_id' => 'required|exists:roles,id'
        ];
        
        if ($userId && $roleId) {
            // Additional validation can be added here if needed
            // For example, checking if role change is allowed for this user
        }
        
        return $rules;
    }

    /**
     * Force sync role_id with Spatie Permission roles
     * Useful for data migration or cleanup
     */
    public function forceSyncRole()
    {
        $spatieRole = $this->roles()->first();
        
        if ($spatieRole) {
            $this->update(['role_id' => $spatieRole->id]);
        } elseif ($this->role_id) {
            $role = Role::find($this->role_id);
            if ($role) {
                parent::syncRoles([$role]);
            }
        }
        
        return $this;
    }
}
