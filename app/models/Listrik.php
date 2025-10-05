<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Listrik extends Model
{
    use HasFactory;

    protected $table = 'listriks';

    protected $fillable = [
        'tegangan',
        'arus',
        'daya',
        'energi',
        'frekuensi',
        'power_factor'
    ];

    protected $casts = [
        'tegangan' => 'float',
        'arus' => 'float',
        'daya' => 'float',
        'energi' => 'float',
        'frekuensi' => 'float',
        'power_factor' => 'float',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $attributes = [
        // No default attributes needed
    ];

    /**
     * Scope by location (deprecated - lokasi field removed)
     */
    public function scopeByLokasi($query, $lokasi)
    {
        // Lokasi field has been removed, return all records
        return $query;
    }

    /**
     * Scope for active records (deprecated - status field removed)
     */
    public function scopeActive($query)
    {
        // Status field has been removed, return all records
        return $query;
    }

    /**
     * Get latest reading (lokasi field removed)
     */
    public static function getLatest()
    {
        return self::latest('created_at')->first();
    }

    /**
     * Get power consumption summary
     */
    public static function getPowerSummary()
    {
        $query = self::query();

        return [
            'total_power' => $query->sum('daya'),
            'avg_power' => $query->avg('daya'),
            'max_power' => $query->max('daya'),
            'total_energy' => $query->sum('energy'),
            'locations' => self::distinct()->pluck('lokasi')->toArray()
        ];
    }

    /**
     * Get readings for date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('timestamp', [$startDate, $endDate]);
    }

    /**
     * Get today's readings
     */
    public function scopeToday($query)
    {
        return $query->whereDate('timestamp', today());
    }

    /**
     * Get hourly average for today
     */
    public static function getHourlyAverageToday($lokasi = null)
    {
        $query = self::whereDate('timestamp', today());

        if ($lokasi) {
            $query->where('lokasi', $lokasi);
        }

        return $query->selectRaw('
            HOUR(timestamp) as hour,
            AVG(power) as avg_power,
            AVG(voltage) as avg_voltage,
            AVG(current) as avg_current
        ')
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();
    }
}
