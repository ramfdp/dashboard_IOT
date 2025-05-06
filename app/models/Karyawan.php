<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Karyawan extends Model
{
    use HasFactory;

    // Nama tabel
    protected $table = 'karyawan';

    // Kolom yang dapat diisi
    protected $fillable = [
        'nama_karyawan',
        'divisi_id',
    ];

    /**
     * Relasi: Karyawan milik satu Divisi
     */
    public function divisi()
    {
        return $this->belongsTo(Divisi::class, 'divisi_id', 'id');
    }
}
