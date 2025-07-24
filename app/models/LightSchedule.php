<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class LightSchedule extends Model
{
    use HasFactory;

    protected $table = 'light_schedules';

    protected $fillable = [
        'name',
        'start_time',
        'end_time',
        'days',
        'device_id',
        'is_active',
        'location',
        'description',
        'created_by'
    ];

    protected $casts = [
        'days' => 'array',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $attributes = [
        'is_active' => true,
        'days' => '[]'
    ];

    /**
     * Relationship with User (created by)
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope for active schedules
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for inactive schedules
     */
    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }

    /**
     * Scope by device
     */
    public function scopeByDevice($query, $deviceId)
    {
        return $query->where('device_id', $deviceId);
    }

    /**
     * Scope by location
     */
    public function scopeByLocation($query, $location)
    {
        return $query->where('location', $location);
    }

    /**
     * Check if schedule should be active now
     */
    public function shouldBeActiveNow()
    {
        if (!$this->is_active) {
            return false;
        }

        $now = Carbon::now();
        $currentDay = $now->dayOfWeek; // 0 = Sunday, 1 = Monday, etc.

        // Check if today is in the scheduled days
        if (!empty($this->days) && !in_array($currentDay, $this->days)) {
            return false;
        }

        $currentTime = $now->format('H:i:s');

        // Handle overnight schedules (end_time < start_time)
        if ($this->end_time < $this->start_time) {
            return $currentTime >= $this->start_time || $currentTime <= $this->end_time;
        }

        // Normal schedule (same day)
        return $currentTime >= $this->start_time && $currentTime <= $this->end_time;
    }

    /**
     * Get next activation time
     */
    public function getNextActivationTime()
    {
        if (!$this->is_active) {
            return null;
        }

        $now = Carbon::now();
        $currentDay = $now->dayOfWeek;

        // If schedule has specific days
        if (!empty($this->days)) {
            $nextDay = null;

            // Find next scheduled day
            for ($i = 0; $i < 7; $i++) {
                $checkDay = ($currentDay + $i) % 7;
                if (in_array($checkDay, $this->days)) {
                    $nextDay = $checkDay;
                    break;
                }
            }

            if ($nextDay !== null) {
                $daysToAdd = ($nextDay - $currentDay + 7) % 7;
                if ($daysToAdd === 0 && $now->format('H:i:s') >= $this->start_time) {
                    $daysToAdd = 7; // Next week
                }

                return $now->addDays($daysToAdd)->setTimeFromTimeString($this->start_time);
            }
        }

        // Daily schedule
        $nextActivation = $now->copy()->setTimeFromTimeString($this->start_time);

        if ($nextActivation <= $now) {
            $nextActivation->addDay();
        }

        return $nextActivation;
    }

    /**
     * Toggle schedule status
     */
    public function toggle()
    {
        $this->update(['is_active' => !$this->is_active]);
        return $this->is_active;
    }

    /**
     * Get formatted days
     */
    public function getFormattedDaysAttribute()
    {
        if (empty($this->days)) {
            return 'Daily';
        }

        $dayNames = [
            0 => 'Sunday',
            1 => 'Monday',
            2 => 'Tuesday',
            3 => 'Wednesday',
            4 => 'Thursday',
            5 => 'Friday',
            6 => 'Saturday'
        ];

        $selectedDays = array_map(function ($day) use ($dayNames) {
            return $dayNames[$day] ?? '';
        }, $this->days);

        return implode(', ', $selectedDays);
    }

    /**
     * Get all active schedules that should be running now
     */
    public static function getCurrentlyActiveSchedules()
    {
        return self::active()->get()->filter(function ($schedule) {
            return $schedule->shouldBeActiveNow();
        });
    }

    /**
     * Get schedules by time range
     */
    public function scopeByTimeRange($query, $startTime, $endTime)
    {
        return $query->where(function ($q) use ($startTime, $endTime) {
            $q->whereBetween('start_time', [$startTime, $endTime])
                ->orWhereBetween('end_time', [$startTime, $endTime])
                ->orWhere(function ($q2) use ($startTime, $endTime) {
                    $q2->where('start_time', '<=', $startTime)
                        ->where('end_time', '>=', $endTime);
                });
        });
    }
}
