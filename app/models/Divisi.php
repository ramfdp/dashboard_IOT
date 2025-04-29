<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Karyawan;

class Divisi extends Model
{
    use HasFactory;

    protected $table = 'divisions';
    protected $fillable = ['nama_divisi'];

    // Relasi: satu divisi memiliki banyak karyawan
    public function karyawans()
    {
        return $this->hasMany(Karyawan::class, 'division_id');
    }
}
