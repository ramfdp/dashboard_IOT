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
        'tanggal_input',
        'waktu', // Tambahkan kolom waktu
    ];

    // Aktifkan timestamps untuk created_at dan updated_at
    public $timestamps = true;
    
    protected $casts = [
        'tanggal_input' => 'datetime',
        'waktu' => 'string',
        'tegangan' => 'decimal:2',
        'arus' => 'decimal:2',
        'daya' => 'decimal:3',
        'energi' => 'decimal:2',
        'frekuensi' => 'decimal:2',
        'power_factor' => 'decimal:3',
    ];
}