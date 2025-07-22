<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LightSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'device_type',
        'day_of_week',
        'start_time',
        'end_time',
        'is_active'
    ];

    protected $casts = [
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'is_active' => 'boolean'
    ];

    // Get human readable day names
    public function getDayNameAttribute()
    {
        $days = [
            'monday' => 'Senin',
            'tuesday' => 'Selasa',
            'wednesday' => 'Rabu',
            'thursday' => 'Kamis',
            'friday' => 'Jumat',
            'saturday' => 'Sabtu',
            'sunday' => 'Minggu'
        ];

        return $days[$this->day_of_week] ?? $this->day_of_week;
    }

    // Get device name
    public function getDeviceNameAttribute()
    {
        $devices = [
            'relay1' => 'Lampu ITMS 1',
            'relay2' => 'Lampu ITMS 2'
        ];

        return $devices[$this->device_type] ?? $this->device_type;
    }
}
