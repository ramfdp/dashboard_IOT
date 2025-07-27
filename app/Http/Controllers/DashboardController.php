<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Department;
use App\Models\Karyawan;
use App\Models\Divisi;
use App\Models\LightSchedule;
use Spatie\Permission\Models\Role;
use App\Models\HistoryKwh;
use App\Services\FirebaseService;
use Carbon\Carbon;
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
        // Ambil data roles
        $roles = Role::all();

        // Ambil data users beserta roles
        $users = User::with('roles')->get();

        // Ambil data departments
        $departments = Department::all();

        // Ambil data karyawan dengan relasi divisi
        $karyawans = Karyawan::with('divisi')->get();

        // Ambil data divisions
        $divisions = Divisi::all();

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
        } catch (\Exception $e) {
            // If Firebase fails, set default values
            $relay1 = 0;
            $relay2 = 0;
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
            'relay2'
        ));
    }

    public function update(Request $request)
    {
        $relay1 = $request->input('relay1', 0);
        $relay2 = $request->input('relay2', 0);

        // Use batch update for better performance
        $this->firebase->setBatchRelayStates([
            'relay1' => $relay1,
            'relay2' => $relay2,
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

    // Light schedule methods
    public function storeSchedule(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        LightSchedule::create($request->only(['name', 'day_of_week', 'start_time', 'end_time']));

        return back()->with('success_schedule', 'Jadwal lampu berhasil ditambahkan. Semua lampu akan dikontrol bersamaan.');
    }

    public function updateSchedule(Request $request, LightSchedule $schedule)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'is_active' => 'boolean'
        ]);

        $schedule->update($request->only(['name', 'day_of_week', 'start_time', 'end_time', 'is_active']));

        return back()->with('success_schedule', 'Jadwal lampu berhasil diperbarui.');
    }

    public function destroySchedule(LightSchedule $schedule)
    {
        $schedule->delete();

        return back()->with('success_schedule', 'Jadwal lampu berhasil dihapus.');
    }

    public function toggleSchedule(LightSchedule $schedule)
    {
        $schedule->update(['is_active' => !$schedule->is_active]);

        return back()->with('success_schedule', 'Status jadwal berhasil diubah.');
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
            $this->firebase->setBatchRelayStates([
                'relay1' => $relayState,
                'relay2' => $relayState
            ]);

            $activeDevices = $shouldLightsBeOn ? ['relay1', 'relay2'] : [];
            $inactiveDevices = $shouldLightsBeOn ? [] : ['relay1', 'relay2'];

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
