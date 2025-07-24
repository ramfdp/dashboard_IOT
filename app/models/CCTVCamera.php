<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class CCTVCamera extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'cctv_cameras';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'url',
        'description',
        'location',
        'status',
        'ip_address',
        'port',
        'settings',
        'last_online',
        'is_recording',
        'sort_order'
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'settings' => 'array',
        'last_online' => 'datetime',
        'is_recording' => 'boolean',
        'sort_order' => 'integer',
        'port' => 'integer'
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [];

    /**
     * Scope to get active cameras
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope to get cameras ordered by sort_order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc')->orderBy('name', 'asc');
    }

    /**
     * Get active cameras
     */
    public static function getActiveCameras()
    {
        return self::active()->ordered()->get();
    }

    /**
     * Get system statistics
     */
    public static function getSystemStats()
    {
        $total = self::count();
        $active = self::where('status', 'active')->count();
        $recording = self::where('is_recording', true)->count();
        $maintenance = self::where('status', 'maintenance')->count();
        $offline = self::where('status', 'inactive')->count();

        return [
            'total_cameras' => $total,
            'active_cameras' => $active,
            'recording_cameras' => $recording,
            'maintenance_cameras' => $maintenance,
            'offline_cameras' => $offline,
            'online_percentage' => $total > 0 ? round(($active / $total) * 100, 2) : 0,
            'recording_percentage' => $total > 0 ? round(($recording / $total) * 100, 2) : 0
        ];
    }

    /**
     * Check if camera is online
     */
    public function isOnline()
    {
        if (!$this->last_online) {
            return false;
        }

        // Consider camera online if last_online is within 5 minutes
        return $this->last_online->diffInMinutes(now()) <= 5;
    }

    /**
     * Update last online timestamp
     */
    public function updateLastOnline()
    {
        $this->update(['last_online' => now()]);
    }

    /**
     * Start recording
     */
    public function startRecording()
    {
        $this->update(['is_recording' => true]);
    }

    /**
     * Stop recording
     */
    public function stopRecording()
    {
        $this->update(['is_recording' => false]);
    }

    /**
     * Set camera status
     */
    public function setStatus($status)
    {
        $validStatuses = ['active', 'inactive', 'maintenance'];

        if (in_array($status, $validStatuses)) {
            $this->update(['status' => $status]);
        }
    }

    /**
     * Get formatted status
     */
    public function getFormattedStatusAttribute()
    {
        $statusMap = [
            'active' => 'Active',
            'inactive' => 'Inactive',
            'maintenance' => 'Maintenance'
        ];

        return $statusMap[$this->status] ?? 'Unknown';
    }

    /**
     * Get status badge class
     */
    public function getStatusBadgeClassAttribute()
    {
        $classMap = [
            'active' => 'success',
            'inactive' => 'danger',
            'maintenance' => 'warning'
        ];

        return $classMap[$this->status] ?? 'secondary';
    }

    /**
     * Get camera URL with fallback
     */
    public function getCameraUrlAttribute()
    {
        return $this->url ?: '#';
    }

    /**
     * Accessor for getting online status
     */
    public function getIsOnlineAttribute()
    {
        return $this->isOnline();
    }

    /**
     * Boot method for model events
     */
    protected static function boot()
    {
        parent::boot();

        // Set default sort order when creating
        static::creating(function ($camera) {
            if (is_null($camera->sort_order)) {
                $maxOrder = self::max('sort_order') ?? 0;
                $camera->sort_order = $maxOrder + 1;
            }
        });
    }
}
