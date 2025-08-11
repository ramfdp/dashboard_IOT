<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Divisi extends Model
{
    use HasFactory;

    protected $table = 'divisions';

    protected $fillable = [
        'name',
        'description',
        'department_id',
        'status',
        'code'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $attributes = [
        'status' => 'active',
    ];

    /**
     * Relationship with Department (REMOVED - table doesn't exist)
     */
    // public function department()
    // {
    //     return $this->belongsTo(Department::class);
    // }

    /**
     * Relationship with Employees (REMOVED - table doesn't exist)
     */
    // public function employees()
    // {
    //     return $this->hasMany(Employee::class, 'division_id');
    // }

    /**
     * Scope for active divisions
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for inactive divisions
     */
    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    /**
     * Get employees count (REMOVED - relationship doesn't exist)
     */
    // public function getEmployeesCountAttribute()
    // {
    //     return $this->employees()->count();
    // }

    /**
     * Check if division is active
     */
    public function isActive()
    {
        return $this->status === 'active';
    }

    /**
     * Get department name
     */
    public function getDepartmentNameAttribute()
    {
        return $this->department?->name ?? 'No Department';
    }

    /**
     * Search divisions by name or code
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        });
    }

    /**
     * Get divisions by department
     */
    public function scopeByDepartment($query, $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }
}
