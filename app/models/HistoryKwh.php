<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HistoryKwh extends Model
{
    use HasFactory;

    protected $table = 'histori_kwh';

    protected $fillable = [
        'tegangan',
        'arus',
        'daya',
        'energi',
        'frekuensi',
        'power_factor',
        'tanggal_input'
    ];

    public $timestamps = false; // Pastikan timestamps dinonaktifkan jika tidak ada kolom `created_at` dan `updated_at`
    
    // Jika menggunakan timestamp manual, tambahkan ini:
    protected $casts = [
        'tanggal_input' => 'datetime',
    ];
}
