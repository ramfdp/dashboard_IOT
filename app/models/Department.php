<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $table = 'departments';
    
    protected $fillable = [
        'nama_departemen',
    ];
    
    // Relasi ke tabel overtime
    public function overtimes()
    {
        return $this->hasMany(Overtime::class, 'department_id');
    }
}