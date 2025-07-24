<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'employee_id',
        'position',
        'department_id',
        'division_id',
        'status',
        'hire_date',
        'salary',
        'address'
    ];

    protected $casts = [
        'hire_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $attributes = [
        'status' => 'active',
    ];

    /**
     * Relationship with Department
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Relationship with Division
     */
    public function division()
    {
        return $this->belongsTo(Divisi::class, 'division_id');
    }

    /**
     * Relationship with User (if employee has a user account)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relationship with Overtime records
     */
    public function overtimes()
    {
        return $this->hasMany(Overtime::class);
    }

    /**
     * Scope for active employees
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for inactive employees
     */
    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    /**
     * Get full name attribute
     */
    public function getFullNameAttribute()
    {
        return $this->name;
    }

    /**
     * Check if employee is active
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
     * Get division name
     */
    public function getDivisionNameAttribute()
    {
        return $this->division?->name ?? 'No Division';
    }

    /**
     * Search employees
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('employee_id', 'like', "%{$search}%")
                ->orWhere('position', 'like', "%{$search}%");
        });
    }

    /**
     * Get employees by department
     */
    public function scopeByDepartment($query, $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

    /**
     * Get employees by division
     */
    public function scopeByDivision($query, $divisionId)
    {
        return $query->where('division_id', $divisionId);
    }
}
