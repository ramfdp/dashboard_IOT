<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Overtime extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_name',
        'division_name',
        'overtime_date',
        'start_time',
        'end_time',
        'duration',
        'status',
        'notes',
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