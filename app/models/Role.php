<?php

namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    /**
     * Additional fillable attributes
     */
    protected $fillable = [
        'name',
        'guard_name',
        'description',
        'status'
    ];

    protected $attributes = [
        'status' => 'active',
        'guard_name' => 'web'
    ];

    /**
     * Scope for active roles
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Check if role is active
     */
    public function isActive()
    {
        return $this->status === 'active';
    }

    /**
     * Get users count for this role
     */
    public function getUsersCountAttribute()
    {
        return $this->getUsers()->count();
    }
}
