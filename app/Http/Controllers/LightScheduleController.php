<?php

namespace App\Http\Controllers;

use App\Models\LightSchedule;
use App\Services\FirebaseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class LightScheduleController extends Controller
{
    protected $firebase;

    public function __construct(FirebaseService $firebase)
    {
        $this->firebase = $firebase;
    }

    public function index()
    {
        $lightSchedules = LightSchedule::orderBy('day_of_week')
            ->orderBy('start_time')
            ->get()
            ->map(function ($schedule) {
                $schedule->device_name = $this->getDeviceName($schedule->device_type);
                $schedule->day_name = $this->getDayName($schedule->day_of_week);
                return $schedule;
            });

        return view('pages.dashboard-v1', compact('lightSchedules'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'device_type' => 'required|in:relay1,relay2',
            'day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        try {
            // Create schedule in database
            $schedule = LightSchedule::create([
                'name' => $request->name,
                'device_type' => $request->device_type,
                'day_of_week' => $request->day_of_week,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'is_active' => true,
            ]);

            // Sync to Firebase using FirebaseService
            $this->syncScheduleToFirebase($schedule);

            return back()->with('success_schedule', 'Jadwal berhasil ditambahkan!');
        } catch (\Exception $e) {
            Log::error('Error creating schedule: ' . $e->getMessage());
            return back()->with('error_schedule', 'Gagal menambahkan jadwal!');
        }
    }

    public function toggle(LightSchedule $schedule)
    {
        try {
            $schedule->update(['is_active' => !$schedule->is_active]);

            // Sync to Firebase using FirebaseService
            $this->syncScheduleToFirebase($schedule);

            $status = $schedule->is_active ? 'diaktifkan' : 'dinonaktifkan';
            return back()->with('success_schedule', "Jadwal berhasil {$status}!");
        } catch (\Exception $e) {
            Log::error('Error toggling schedule: ' . $e->getMessage());
            return back()->with('error_schedule', 'Gagal mengubah status jadwal!');
        }
    }

    public function destroy(LightSchedule $schedule)
    {
        try {
            // Remove from Firebase using FirebaseService
            $this->removeScheduleFromFirebase($schedule->id);

            // Delete from database
            $schedule->delete();

            return back()->with('success_schedule', 'Jadwal berhasil dihapus!');
        } catch (\Exception $e) {
            Log::error('Error deleting schedule: ' . $e->getMessage());
            return back()->with('error_schedule', 'Gagal menghapus jadwal!');
        }
    }

    public function checkSchedules()
    {
        try {
            $now = Carbon::now();
            $currentDay = strtolower($now->format('l')); // monday, tuesday, etc.
            $currentTime = $now->format('H:i');

            // Get all active schedules for today
            $todaySchedules = LightSchedule::where('is_active', true)
                ->where('day_of_week', $currentDay)
                ->get();

            $devicesToTurnOn = [];
            $devicesToTurnOff = ['relay1', 'relay2']; // Start with all devices to turn off

            foreach ($todaySchedules as $schedule) {
                // Check if current time is within schedule time range
                if ($currentTime >= $schedule->start_time && $currentTime <= $schedule->end_time) {
                    $devicesToTurnOn[] = $schedule->device_type;
                    // Remove from turn off list if it should be on
                    $devicesToTurnOff = array_diff($devicesToTurnOff, [$schedule->device_type]);
                }
            }

            // Turn on devices that should be on
            foreach ($devicesToTurnOn as $device) {
                $this->controlDevice($device, 'on');
            }

            // Turn off devices that should be off
            foreach ($devicesToTurnOff as $device) {
                $this->controlDevice($device, 'off');
            }

            Log::info("Schedule check completed. Devices ON: " . implode(', ', $devicesToTurnOn) .
                ". Devices OFF: " . implode(', ', $devicesToTurnOff));
        } catch (\Exception $e) {
            Log::error('Error checking schedules: ' . $e->getMessage());
        }
    }

    private function syncScheduleToFirebase($schedule)
    {
        try {
            $scheduleData = [
                'id' => $schedule->id,
                'name' => $schedule->name,
                'device_type' => $schedule->device_type,
                'day_of_week' => $schedule->day_of_week,
                'start_time' => $schedule->start_time,
                'end_time' => $schedule->end_time,
                'is_active' => $schedule->is_active,
                'created_at' => $schedule->created_at->toISOString(),
                'updated_at' => $schedule->updated_at->toISOString(),
            ];

            // Use Firebase service to sync schedule data
            $this->firebase->setSchedule($schedule->id, $scheduleData);

            Log::info("Schedule {$schedule->id} synced to Firebase successfully");
        } catch (\Exception $e) {
            Log::error('Firebase sync error: ' . $e->getMessage());
            // Don't throw exception to avoid breaking the main functionality
        }
    }

    private function removeScheduleFromFirebase($scheduleId)
    {
        try {
            // Use Firebase service to delete schedule
            $this->firebase->deleteSchedule($scheduleId);

            Log::info("Schedule {$scheduleId} removed from Firebase successfully");
        } catch (\Exception $e) {
            Log::error('Firebase delete error: ' . $e->getMessage());
            // Don't throw exception to avoid breaking the main functionality
        }
    }

    private function controlDevice($deviceType, $action)
    {
        try {
            $value = ($action === 'on') ? 1 : 0;

            // Use Firebase service to control the device
            $this->firebase->setRelayState($deviceType, $value);

            Log::info("Device {$deviceType} turned {$action} by schedule");
        } catch (\Exception $e) {
            Log::error('Device control error: ' . $e->getMessage());
        }
    }

    private function getDeviceName($deviceType)
    {
        $names = [
            'relay1' => 'Lampu ITMS 1',
            'relay2' => 'Lampu ITMS 2',
        ];

        return $names[$deviceType] ?? $deviceType;
    }

    private function getDayName($dayOfWeek)
    {
        $days = [
            'monday' => 'Senin',
            'tuesday' => 'Selasa',
            'wednesday' => 'Rabu',
            'thursday' => 'Kamis',
            'friday' => 'Jumat',
            'saturday' => 'Sabtu',
            'sunday' => 'Minggu',
        ];

        return $days[$dayOfWeek] ?? $dayOfWeek;
    }
}
