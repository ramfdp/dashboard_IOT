<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Karyawan extends Model
{
    use HasFactory;

    // Tentukan nama tabel yang digunakan
    protected $table = 'karyawan';

    // Tentukan kolom-kolom yang bisa diisi
    protected $fillable = [
        'id',
        'nama_karyawan',
        'divisi_id',  // pastikan ada kolom 'divisi_id' di tabel karyawan
    ];

    /**
     * Definisikan relasi ke model Divisi
     */
    public function divisi()
    {
        return $this->belongsTo(Divisi::class);
    }
}
