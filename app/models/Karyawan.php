<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Karyawan extends Model
{
    use HasFactory;

    protected $table = 'karyawan';

    protected $fillable = [
        'nama',
        'divisi_id',
        'jabatan',
        'email',
        'telepon',
        'alamat',
        'status',
        'tanggal_masuk'
    ];

    protected $casts = [
        'tanggal_masuk' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $attributes = [
        'status' => 'aktif',
    ];

    /**
     * Relationship with Divisi
     */
    public function divisi()
    {
        return $this->belongsTo(Divisi::class);
    }

    /**
     * Scope for active employees
     */
    public function scopeAktif($query)
    {
        return $query->where('status', 'aktif');
    }

    /**
     * Get divisi name
     */
    public function getDivisiNameAttribute()
    {
        return $this->divisi?->name ?? 'Tidak ada divisi';
    }

    /**
     * Search karyawan
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('nama', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('jabatan', 'like', "%{$search}%");
        });
    }

    /**
     * Get karyawan by divisi
     */
    public function scopeByDivisi($query, $divisiId)
    {
        return $query->where('divisi_id', $divisiId);
    }
}
