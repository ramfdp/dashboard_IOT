<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'dept_id',
    ];

    // Relasi ke user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi ke department
    public function department()
    {
        return $this->belongsTo(Department::class, 'dept_id');
    }

    // Relasi ke overtime jika diperlukan
    public function overtimes()
    {
        return $this->hasMany(Overtime::class);
    }
}