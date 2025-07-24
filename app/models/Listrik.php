<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Listrik extends Model
{
    use HasFactory;

    protected $table = 'listriks';

    protected $fillable = [
        'lokasi',
        'voltage',
        'current',
        'power',
        'energy',
        'frequency',
        'pf',
        'timestamp',
        'status'
    ];

    protected $casts = [
        'voltage' => 'float',
        'current' => 'float',
        'power' => 'float',
        'energy' => 'float',
        'frequency' => 'float',
        'pf' => 'float',
        'timestamp' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $attributes = [
        'status' => 'active',
    ];

    /**
     * Scope by location
     */
    public function scopeByLokasi($query, $lokasi)
    {
        return $query->where('lokasi', $lokasi);
    }

    /**
     * Scope for active records
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Get latest reading by location
     */
    public static function getLatestByLokasi($lokasi)
    {
        return self::where('lokasi', $lokasi)
            ->latest('timestamp')
            ->first();
    }

    /**
     * Get power consumption summary
     */
    public static function getPowerSummary($lokasi = null)
    {
        $query = self::query();

        if ($lokasi) {
            $query->where('lokasi', $lokasi);
        }

        return [
            'total_power' => $query->sum('power'),
            'avg_power' => $query->avg('power'),
            'max_power' => $query->max('power'),
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
