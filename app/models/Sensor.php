<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sensor extends Model
{
    use HasFactory;

    protected $fillable = [
        'temperature',
        'humidity'
    ];

    protected $casts = [
        'temperature' => 'float',
        'humidity' => 'float',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $attributes = [
        'status' => 'active',
    ];

    /**
     * Relationship with HistoryKwh
     */
    public function historyKwh()
    {
        return $this->hasMany(HistoryKwh::class);
    }

    /**
     * Scope for active sensors
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope by location
     */
    public function scopeByLocation($query, $location)
    {
        return $query->where('location', $location);
    }

    /**
     * Get latest reading
     */
    public function getLatestReading()
    {
        return $this->historyKwh()->latest('timestamp')->first();
    }

    /**
     * Check if sensor is online
     */
    public function isOnline()
    {
        $latestReading = $this->getLatestReading();

        if (!$latestReading) {
            return false;
        }

        // Consider online if reading is within last 5 minutes
        return $latestReading->timestamp->diffInMinutes(now()) <= 5;
    }

    /**
     * Update last reading
     */
    public function updateLastReading($value)
    {
        $this->update(['last_reading' => $value]);
    }

    /**
     * Check if value is within normal range
     */
    public function isValueNormal($value)
    {
        if ($this->min_value !== null && $value < $this->min_value) {
            return false;
        }

        if ($this->max_value !== null && $value > $this->max_value) {
            return false;
        }

        return true;
    }

    /**
     * Get sensor status with details
     */
    public function getDetailedStatus()
    {
        $latestReading = $this->getLatestReading();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'location' => $this->location,
            'status' => $this->status,
            'is_online' => $this->isOnline(),
            'last_reading' => $this->last_reading,
            'unit' => $this->unit,
            'latest_timestamp' => $latestReading?->timestamp,
            'is_value_normal' => $this->last_reading ? $this->isValueNormal($this->last_reading) : null
        ];
    }
}
