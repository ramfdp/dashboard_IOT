<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\Role;
use App\Models\User;
use App\Models\Department;
use App\Models\Karyawan;
use App\Models\Divisi;
use App\Models\LightSchedule;
use App\Models\HistoryKwh;
use App\Models\Overtime;
use App\Services\FirebaseService;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    protected $firebase;

    public function __construct(FirebaseService $firebase)
    {
        $this->firebase = $firebase;
    }

    public function index()
    {
        $roles = Role::all();
        $users = User::with('role')->get();
        $departments = Department::all();
        $karyawans = Karyawan::all();
        $divisions = Divisi::all();

        // Get data KWH
        $dataKwh = HistoryKwh::select('waktu', 'daya')
            ->orderBy('waktu', 'asc')
            ->get();

        // If no data exists, create empty collection with default structure
        if ($dataKwh->isEmpty()) {
            $dataKwh = collect([
                (object)['waktu' => date('H:i:s'), 'daya' => 0]
            ]);
        }

        // Get light schedules
        $lightSchedules = LightSchedule::orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        // Get relay states with default fallback values
        try {
            $relay1 = $this->firebase->getRelayState('relay1') ?? 0;
            $relay2 = $this->firebase->getRelayState('relay2') ?? 0;
            $relay3 = $this->firebase->getRelayState('relay3') ?? 0;
            $relay4 = $this->firebase->getRelayState('relay4') ?? 0;
            $relay5 = $this->firebase->getRelayState('relay5') ?? 0;
            $relay6 = $this->firebase->getRelayState('relay6') ?? 0;
            $relay7 = $this->firebase->getRelayState('relay7') ?? 0;
            $relay8 = $this->firebase->getRelayState('relay8') ?? 0;
        } catch (\Exception $e) {
            // If Firebase fails, set default values
            $relay1 = 0;
            $relay2 = 0;
            $relay3 = 0;
            $relay4 = 0;
            $relay5 = 0;
            $relay6 = 0;
            $relay7 = 0;
            $relay8 = 0;
        }

        // Kirim semua data ke view
        return view('pages.dashboard-v1', compact(
            'roles',
            'users',
            'departments',
            'karyawans',
            'divisions',
            'dataKwh',
            'lightSchedules',
            'relay1',
            'relay2',
            'relay3',
            'relay4',
            'relay5',
            'relay6',
            'relay7',
            'relay8'
        ));
    }

    public function update(Request $request)
    {
        $relay1 = $request->input('relay1', 0);
        $relay2 = $request->input('relay2', 0);
        $relay3 = $request->input('relay3', 0);
        $relay4 = $request->input('relay4', 0);
        $relay5 = $request->input('relay5', 0);
        $relay6 = $request->input('relay6', 0);
        $relay7 = $request->input('relay7', 0);
        $relay8 = $request->input('relay8', 0);

        // Use batch update for better performance
        $this->firebase->setBatchRelayStates([
            'relay1' => $relay1,
            'relay2' => $relay2,
            'relay3' => $relay3,
            'relay4' => $relay4,
            'relay5' => $relay5,
            'relay6' => $relay6,
            'relay7' => $relay7,
            'relay8' => $relay8,
            'manualMode' => true
        ]);

        // Log manual control action
        Log::info("Manual device control - relay1: {$relay1}, relay2: {$relay2}");

        return back()->with('success_device', 'Perangkat diperbarui secara manual.');
    }

    public function setAutoMode()
    {
        try {
            // Set auto mode in Firebase (clear manual mode)
            $this->firebase->setAutoMode();

            // Also clear any current relay manual states for clean transition
            $this->firebase->setBatchRelayStates([
                'manualMode' => false
            ]);

            Log::info("Device switched to automatic mode - manual mode cleared");

            // Check if this is an AJAX request
            if (request()->expectsJson() || request()->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Mode otomatis berhasil diaktifkan! Jadwal akan mengontrol perangkat secara otomatis.',
                    'mode' => 'auto',
                    'timestamp' => now()->toISOString()
                ]);
            }

            return back()->with('success_device', 'Mode otomatis berhasil diaktifkan! Jadwal akan mengontrol perangkat secara otomatis.');
        } catch (\Exception $e) {
            Log::error('Failed to set auto mode: ' . $e->getMessage());

            // Check if this is an AJAX request
            if (request()->expectsJson() || request()->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal mengaktifkan mode otomatis: ' . $e->getMessage(),
                    'error' => $e->getMessage()
                ], 500);
            }

            return back()->with('error_device', 'Gagal mengaktifkan mode otomatis: ' . $e->getMessage());
        }
    }

    public function setManualMode()
    {
        try {
            // Set manual mode in Firebase
            $this->firebase->setManualMode(true);

            Log::info("Device switched to manual mode - automatic schedules suspended");

            // Check if this is an AJAX request
            if (request()->expectsJson() || request()->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Mode manual berhasil diaktifkan! Anda dapat mengontrol perangkat secara manual.',
                    'mode' => 'manual',
                    'timestamp' => now()->toISOString()
                ]);
            }

            return back()->with('success_device', 'Mode manual berhasil diaktifkan! Anda dapat mengontrol perangkat secara manual.');
        } catch (\Exception $e) {
            Log::error('Failed to set manual mode: ' . $e->getMessage());

            // Check if this is an AJAX request
            if (request()->expectsJson() || request()->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal mengaktifkan mode manual: ' . $e->getMessage(),
                    'error' => $e->getMessage()
                ], 500);
            }

            return back()->with('error_device', 'Gagal mengaktifkan mode manual: ' . $e->getMessage());
        }
    }

    public function checkSchedules()
    {
        try {
            // Check if device is in manual mode
            $isManualMode = $this->firebase->getManualMode();

            if ($isManualMode) {
                Log::info("Skipping schedule check - device is in manual mode");
                return response()->json([
                    'success' => true,
                    'message' => 'Schedule check skipped - device in manual mode',
                    'manual_mode' => true
                ]);
            }

            // Check for active overtime - if any exists, skip schedule control
            $activeOvertimes = Overtime::where(function ($query) {
                $query->where('status', Overtime::STATUS_RUNNING)
                    ->orWhere(function ($subQuery) {
                        $subQuery->where('status', Overtime::STATUS_PENDING)
                            ->whereDate('overtime_date', Carbon::today())
                            ->whereTime('start_time', '<=', Carbon::now()->format('H:i:s'));
                    });
            })->exists();

            if ($activeOvertimes) {
                Log::info("Skipping schedule check - active overtime detected");
                return response()->json([
                    'success' => true,
                    'message' => 'Schedule check skipped - active overtime in progress',
                    'active_devices' => ['relay1', 'relay2', 'relay3', 'relay4', 'relay5', 'relay6', 'relay7', 'relay8'], // Overtime keeps all lights on
                    'inactive_devices' => [],
                    'manual_mode' => false,
                    'overtime_active' => true
                ]);
            }

            $now = Carbon::now();
            $currentDay = strtolower($now->format('l')); // monday, tuesday, etc.
            $currentTime = $now->format('H:i:s');

            Log::info("Checking schedules for {$currentDay} at {$currentTime}");

            // Get all active schedules for today
            $todaySchedules = LightSchedule::where('is_active', true)
                ->where('day_of_week', $currentDay)
                ->get();

            // Default: all lights off
            $shouldLightsBeOn = false;

            foreach ($todaySchedules as $schedule) {
                // Handle overnight schedules (end_time < start_time)
                if ($schedule->end_time < $schedule->start_time) {
                    $shouldBeOn = ($currentTime >= $schedule->start_time || $currentTime <= $schedule->end_time);
                } else {
                    // Normal schedule (same day)
                    $shouldBeOn = ($currentTime >= $schedule->start_time && $currentTime <= $schedule->end_time);
                }

                if ($shouldBeOn) {
                    $shouldLightsBeOn = true;
                    Log::info("Schedule '{$schedule->name}' is active - turning ON all lights");
                    break; // One active schedule is enough to turn on all lights
                }
            }

            // Control both relays together using batch update for better performance
            // Don't override manual mode when in auto mode
            $relayState = $shouldLightsBeOn ? 1 : 0;

            Log::info("Attempting to set Firebase relays - all 8 relays: {$relayState}");

            $firebaseResult = $this->firebase->setBatchRelayStates([
                'relay1' => $relayState,
                'relay2' => $relayState,
                'relay3' => $relayState,
                'relay4' => $relayState,
                'relay5' => $relayState,
                'relay6' => $relayState,
                'relay7' => $relayState,
                'relay8' => $relayState
            ]);

            if ($firebaseResult === false) {
                Log::error("Failed to update Firebase relay states!");
            } else {
                Log::info("Successfully updated Firebase relay states");
            }

            $activeDevices = $shouldLightsBeOn ? ['relay1', 'relay2', 'relay3', 'relay4', 'relay5', 'relay6', 'relay7', 'relay8'] : [];
            $inactiveDevices = $shouldLightsBeOn ? [] : ['relay1', 'relay2', 'relay3', 'relay4', 'relay5', 'relay6', 'relay7', 'relay8'];

            Log::info("Schedule check completed. All lights: " . ($shouldLightsBeOn ? 'ON' : 'OFF'));

            return response()->json([
                'success' => true,
                'message' => 'Schedules checked successfully',
                'active_devices' => $activeDevices,
                'inactive_devices' => $inactiveDevices,
                'manual_mode' => false
            ]);
        } catch (\Exception $e) {
            Log::error('Error checking schedules: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error checking schedules: ' . $e->getMessage()
            ], 500);
        }
    }

    // Traditional schedule management methods

    public function storeSchedule(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|max:255',
                'day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
                'start_time' => 'required|date_format:H:i',
                'end_time' => 'required|date_format:H:i|after:start_time',
            ]);

            LightSchedule::create($request->only(['name', 'day_of_week', 'start_time', 'end_time']));

            return back()->with('success_schedule', 'Jadwal lampu berhasil ditambahkan. Semua lampu akan dikontrol bersamaan.');
        } catch (\Exception $e) {
            Log::error('Error creating schedule: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal menambahkan jadwal: ' . $e->getMessage()]);
        }
    }

    public function updateSchedule(Request $request, LightSchedule $schedule)
    {
        try {
            $request->validate([
                'name' => 'required|max:255',
                'day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
                'start_time' => 'required|date_format:H:i',
                'end_time' => 'required|date_format:H:i|after:start_time',
            ]);

            $schedule->update($request->only(['name', 'day_of_week', 'start_time', 'end_time']));

            return back()->with('success_schedule', 'Jadwal berhasil diperbarui');
        } catch (\Exception $e) {
            Log::error('Error updating schedule: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal memperbarui jadwal: ' . $e->getMessage()]);
        }
    }

    public function destroySchedule(LightSchedule $schedule)
    {
        try {
            $schedule->delete();
            return back()->with('success_schedule', 'Jadwal berhasil dihapus');
        } catch (\Exception $e) {
            Log::error('Error deleting schedule: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal menghapus jadwal: ' . $e->getMessage()]);
        }
    }

    public function toggleSchedule(LightSchedule $schedule)
    {
        try {
            $schedule->update(['is_active' => !$schedule->is_active]);
            return back()->with('success_schedule', 'Status jadwal berhasil diubah');
        } catch (\Exception $e) {
            Log::error('Error toggling schedule: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal mengubah status jadwal: ' . $e->getMessage()]);
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
}
