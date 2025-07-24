<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
use App\Services\FirebaseService;
use Illuminate\Support\Facades\Log;

class LightSchedule extends Model
{
    use HasFactory;

    protected $table = 'light_schedules';

    protected $fillable = [
        'name',
        'day_of_week',
        'start_time',
        'end_time',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $attributes = [
        'is_active' => true
    ];

    protected static function booted()
    {
        // Sync to Firebase whenever a schedule is created or updated
        static::saved(function ($schedule) {
            $schedule->syncToFirebase();
        });

        // Remove from Firebase when deleted
        static::deleted(function ($schedule) {
            $schedule->removeFromFirebase();
        });
    }

    /**
     * Sync schedule to Firebase
     */
    public function syncToFirebase()
    {
        try {
            $firebaseService = app(FirebaseService::class);

            $scheduleData = [
                'id' => $this->id,
                'name' => $this->name,
                'device_type' => $this->device_type,
                'day_of_week' => $this->day_of_week,
                'start_time' => $this->start_time,
                'end_time' => $this->end_time,
                'is_active' => $this->is_active,
                'created_at' => $this->created_at->toISOString(),
                'updated_at' => $this->updated_at->toISOString()
            ];

            $firebaseService->setSchedule($this->id, $scheduleData);
            Log::info("Schedule {$this->id} synced to Firebase");
        } catch (\Exception $e) {
            Log::error("Failed to sync schedule {$this->id} to Firebase: " . $e->getMessage());
        }
    }

    /**
     * Remove schedule from Firebase
     */
    public function removeFromFirebase()
    {
        try {
            $firebaseService = app(FirebaseService::class);
            $firebaseService->deleteSchedule($this->id);
            Log::info("Schedule {$this->id} removed from Firebase");
        } catch (\Exception $e) {
            Log::error("Failed to remove schedule {$this->id} from Firebase: " . $e->getMessage());
        }
    }
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
     * Scope by day of week
     */
    public function scopeByDayOfWeek($query, $dayOfWeek)
    {
        return $query->where('day_of_week', $dayOfWeek);
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
        $currentDayName = strtolower($now->englishDayOfWeek); // monday, tuesday, etc.

        // Check if today matches the scheduled day
        if ($this->day_of_week !== $currentDayName) {
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
        $currentDayName = strtolower($now->englishDayOfWeek);

        // If this is the scheduled day and time hasn't passed yet
        if ($this->day_of_week === $currentDayName && $now->format('H:i:s') < $this->start_time) {
            return $now->copy()->setTimeFromTimeString($this->start_time);
        }

        // Find next occurrence of the scheduled day
        $daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        $currentDayIndex = array_search($currentDayName, $daysOfWeek);
        $scheduleDayIndex = array_search($this->day_of_week, $daysOfWeek);

        $daysToAdd = ($scheduleDayIndex - $currentDayIndex + 7) % 7;
        if ($daysToAdd === 0) {
            $daysToAdd = 7; // Next week
        }

        return $now->addDays($daysToAdd)->setTimeFromTimeString($this->start_time);
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

    /**
     * Get human readable day name
     */
    public function getDayNameAttribute()
    {
        return ucfirst($this->day_of_week);
    }

    /**
     * Get device name - now controls all lights
     */
    public function getDeviceNameAttribute()
    {
        return 'Semua Lampu (ITMS 1 & 2)';
    }
}
