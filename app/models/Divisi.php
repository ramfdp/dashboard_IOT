<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Divisi extends Model
{
    use HasFactory;

    // Nama tabel
    protected $table = 'divisions';

    // Kolom yang dapat diisi
    protected $fillable = [
        'nama_divisi',
    ];

    /**
     * Relasi: Divisi memiliki banyak Karyawan
     */
    public function karyawans()
    {
        return $this->hasMany(Karyawan::class, 'divisi_id', 'id');
    }
}
