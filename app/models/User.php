<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    
    // Alias assignRole dari trait agar bisa dioverride
    use HasRoles {
        HasRoles::assignRole as traitAssignRole;
    }

    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Relasi dengan tabel roles
     */
    public function role()
    {
        return $this->belongsTo(\Spatie\Permission\Models\Role::class, 'role_id');
    }

    /**
     * Boot function untuk sinkronisasi role_id saat role diubah
     */
    protected static function boot()
    {
        parent::boot();

        static::updated(function ($user) {
            $roleName = $user->getRoleNames()->first();
            if ($roleName) {
                $role = \Spatie\Permission\Models\Role::where('name', $roleName)->first();
                if ($role && $user->role_id != $role->id) {
                    $user->role_id = $role->id;
                    $user->saveQuietly(); // Cegah infinite loop
                }
            }
        });
    }

    /**
     * Override method assignRole agar juga mengupdate role_id
     */
    public function assignRole(...$roles)
    {
        // Panggil method asli dari trait
        $result = $this->traitAssignRole(...$roles);

        // Update role_id sesuai role yang diassign
        $roleName = $this->getRoleNames()->first();
        if ($roleName) {
            $role = \Spatie\Permission\Models\Role::where('name', $roleName)->first();
            if ($role && $this->role_id != $role->id) {
                $this->role_id = $role->id;
                $this->saveQuietly();
            }
        }

        return $result;
    }

    /**
     * Custom method untuk mendapatkan nama role efektif
     */
    public function getEffectiveRoleName()
    {
        $spatieRole = $this->getRoleNames()->first();
        if ($spatieRole) {
            return $spatieRole;
        }

        if ($this->role) {
            return $this->role->name;
        }

        return 'No Role';
    }

    public function isAdmin()
    {
        return $this->hasRole('admin');
    }

    public function isUser()
    {
        return $this->hasRole('user');
    }
}
