<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Overtime extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'department_id',
        'overtime_date',
        'start_time',
        'end_time',
        'notes',
        'duration',
        'status'
    ];

    // Relasi ke employee
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    // Relasi ke department
    public function department()
    {
        return $this->belongsTo(Department::class);
    }
}