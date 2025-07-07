<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Http;
use Exception;

class CCTVCamera extends Model
{
    use HasFactory;

    protected $table = 'cctv_cameras';

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

    protected $casts = [
        'settings' => 'array',
        'last_online' => 'datetime',
        'is_recording' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $attributes = [
        'status' => 'active',
        'is_recording' => false,
        'sort_order' => 0
    ];

    /**
     * Scope for active cameras
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for ordered cameras
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc')->orderBy('name', 'asc');
    }

    /**
     * Check if camera is online
     */
    public function isOnline()
    {
        try {
            $response = Http::timeout(5)->get($this->url);
            
            if ($response->successful()) {
                $this->update(['last_online' => now()]);
                return true;
            }
            
            return false;
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Get camera status
     */
    public function getStatus()
    {
        $isOnline = $this->isOnline();
        
        return [
            'id' => $this->id,
            'name' => $this->name,
            'status' => $isOnline ? 'online' : 'offline',
            'last_online' => $this->last_online,
            'is_recording' => $this->is_recording
        ];
    }

    /**
     * Get formatted URL with timestamp
     */
    public function getUrlWithTimestamp()
    {
        return $this->url . '?t=' . now()->timestamp;
    }

    /**
     * Test camera connection
     */
    public function testConnection()
    {
        try {
            $startTime = microtime(true);
            $response = Http::timeout(10)->get($this->url);
            $endTime = microtime(true);
            
            $responseTime = round(($endTime - $startTime) * 1000, 2);
            
            return [
                'success' => $response->successful(),
                'status_code' => $response->status(),
                'response_time' => $responseTime,
                'message' => $response->successful() ? 'Connection successful' : 'Connection failed'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'status_code' => 0,
                'response_time' => 0,
                'message' => 'Connection error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get camera settings
     */
    public function getSettings($key = null, $default = null)
    {
        if ($key) {
            return data_get($this->settings, $key, $default);
        }
        
        return $this->settings ?? [];
    }

    /**
     * Update camera settings
     */
    public function updateSettings($key, $value = null)
    {
        $settings = $this->settings ?? [];
        
        if (is_array($key)) {
            $settings = array_merge($settings, $key);
        } else {
            $settings[$key] = $value;
        }
        
        $this->update(['settings' => $settings]);
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
     * Get all active cameras ordered
     */
    public static function getActiveCameras()
    {
        return self::active()->ordered()->get();
    }

    /**
     * Get online cameras count
     */
    public static function getOnlineCount()
    {
        $cameras = self::active()->get();
        $onlineCount = 0;
        
        foreach ($cameras as $camera) {
            if ($camera->isOnline()) {
                $onlineCount++;
            }
        }
        
        return $onlineCount;
    }

    /**
     * Get system statistics
     */
    public static function getSystemStats()
    {
        $totalCameras = self::active()->count();
        $onlineCount = self::getOnlineCount();
        $recordingCount = self::where('is_recording', true)->count();
        
        return [
            'total_cameras' => $totalCameras,
            'online_cameras' => $onlineCount,
            'offline_cameras' => $totalCameras - $onlineCount,
            'recording_cameras' => $recordingCount,
            'system_status' => $onlineCount > 0 ? 'active' : 'inactive'
        ];
    }
}