<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HistoryKwh extends Model
{
    use HasFactory;

    protected $table = 'histori_kwh';

    protected $fillable = [
        'voltage',
        'current',
        'power',
        'energy',
        'frequency',
        'pf',
        'location',
        'sensor_id',
        'timestamp',
        'created_at'
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

    /**
     * Relationship with Sensor
     */
    public function sensor()
    {
        return $this->belongsTo(Sensor::class);
    }

    /**
     * Scope for latest records
     */
    public function scopeLatest($query, $limit = 10)
    {
        return $query->orderBy('timestamp', 'desc')->limit($limit);
    }

    /**
     * Scope by location
     */
    public function scopeByLocation($query, $location)
    {
        return $query->where('location', $location);
    }

    /**
     * Scope by date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('timestamp', [$startDate, $endDate]);
    }

    /**
     * Get today's records
     */
    public function scopeToday($query)
    {
        return $query->whereDate('timestamp', today());
    }

    /**
     * Get records for this month
     */
    public function scopeThisMonth($query)
    {
        return $query->whereMonth('timestamp', now()->month)
            ->whereYear('timestamp', now()->year);
    }

    /**
     * Calculate average power for period
     */
    public static function averagePowerForPeriod($startDate, $endDate, $location = null)
    {
        $query = self::whereBetween('timestamp', [$startDate, $endDate]);

        if ($location) {
            $query->where('location', $location);
        }

        return $query->avg('power');
    }

    /**
     * Get total energy consumption
     */
    public static function totalEnergyForPeriod($startDate, $endDate, $location = null)
    {
        $query = self::whereBetween('timestamp', [$startDate, $endDate]);

        if ($location) {
            $query->where('location', $location);
        }

        return $query->sum('energy');
    }

    /**
     * Get power usage statistics
     */
    public static function getPowerStats($location = null)
    {
        $query = self::query();

        if ($location) {
            $query->where('location', $location);
        }

        return [
            'max_power' => $query->max('power'),
            'min_power' => $query->min('power'),
            'avg_power' => $query->avg('power'),
            'total_energy' => $query->sum('energy'),
            'last_reading' => $query->latest('timestamp')->first()
        ];
    }
}
