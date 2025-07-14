<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Overtime extends Model
{
    use HasFactory;

    protected $table = 'overtimes';

    protected $fillable = [
        'division_name',
        'employee_name',
        'overtime_date',
        'start_time',
        'end_time',
        'duration',
        'status',
        'notes',
    ];

    protected $casts = [
        'overtime_date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'status' => 'integer',
        'duration' => 'integer',
    ];

    public function getStatusLabelAttribute()
    {
        return match ($this->status) {
            0 => 'Belum Mulai',
            1 => 'Sedang Berjalan',
            2 => 'Selesai',
            default => 'Tidak Diketahui',
        };
    }

    public function getStatusBadgeClassAttribute()
    {
        return match ($this->status) {
            0 => 'secondary',
            1 => 'warning',
            2 => 'success',
            default => 'dark',
        };
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }
}
