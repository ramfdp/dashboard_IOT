<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Overtime extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'division_name',
        'employee_name',
        'overtime_date',
        'start_time',
        'end_time',
        'duration',
        'status',
        'notes',
        'approved_by',
        'approved_at',
        'light_selection'
    ];

    protected $casts = [
        'overtime_date' => 'date',
        'approved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $attributes = [
        'status' => 0, // 0: pending, 1: running, 2: completed
    ];

    /**
     * Status constants
     */
    const STATUS_PENDING = 0;
    const STATUS_RUNNING = 1;
    const STATUS_COMPLETED = 2;

    /**
     * Relationship with Employee
     */
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Relationship with User (approved by)
     */
    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Scope for active overtime
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', [self::STATUS_PENDING, self::STATUS_RUNNING]);
    }

    /**
     * Scope for completed overtime
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    /**
     * Scope for running overtime
     */
    public function scopeRunning($query)
    {
        return $query->where('status', self::STATUS_RUNNING);
    }

    /**
     * Scope for pending overtime
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Check if overtime is currently active
     */
    public function isActive()
    {
        if ($this->status === self::STATUS_RUNNING) {
            return true;
        }

        if ($this->status === self::STATUS_PENDING) {
            $now = Carbon::now();
            $startTime = Carbon::createFromFormat('Y-m-d H:i:s', $this->overtime_date . ' ' . $this->start_time);

            return $now->gte($startTime);
        }

        return false;
    }

    /**
     * Calculate duration in hours
     */
    public function calculateDuration()
    {
        if (!$this->start_time || !$this->end_time) {
            return null;
        }

        $start = Carbon::createFromFormat('H:i:s', $this->start_time);
        $end = Carbon::createFromFormat('H:i:s', $this->end_time);

        if ($end->lt($start)) {
            $end->addDay();
        }

        return $start->diffInMinutes($end) / 60;
    }

    /**
     * Get status text
     */
    public function getStatusTextAttribute()
    {
        switch ($this->status) {
            case self::STATUS_PENDING:
                return 'Belum Mulai';
            case self::STATUS_RUNNING:
                return 'Sedang Berjalan';
            case self::STATUS_COMPLETED:
                return 'Selesai';
            default:
                return 'Unknown';
        }
    }

    /**
     * Get formatted duration
     */
    public function getFormattedDurationAttribute()
    {
        if (!$this->duration) {
            return '-';
        }

        $hours = floor($this->duration);
        $minutes = ($this->duration - $hours) * 60;

        return sprintf('%d jam %d menit', $hours, $minutes);
    }

    /**
     * Start overtime
     */
    public function start()
    {
        $this->update(['status' => self::STATUS_RUNNING]);
    }

    /**
     * Complete overtime
     */
    public function complete($endTime = null)
    {
        $endTime = $endTime ?: Carbon::now()->format('H:i:s');
        $duration = $this->calculateDuration();

        $this->update([
            'status' => self::STATUS_COMPLETED,
            'end_time' => $endTime,
            'duration' => $duration
        ]);
    }

    /**
     * Search overtime records
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('employee_name', 'like', "%{$search}%")
                ->orWhere('division_name', 'like', "%{$search}%")
                ->orWhere('notes', 'like', "%{$search}%");
        });
    }

    /**
     * Filter by date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('overtime_date', [$startDate, $endDate]);
    }

    /**
     * Get today's overtime
     */
    public function scopeToday($query)
    {
        return $query->whereDate('overtime_date', Carbon::today());
    }
}
