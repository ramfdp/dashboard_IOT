<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'role', // Tambahkan kolom ini ke fillable
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function isAdmin()
    {
        return $this->hasRole('admin');
    }
    
    // Tambahkan method untuk sinkronisasi role
    public function syncRoleWithPermission()
    {
        if ($this->role_id) {
            $roleName = Role::find($this->role_id)->name;
            $this->syncRoles([$roleName]);
            $this->role = $roleName;
            $this->save();
        }
    }
}