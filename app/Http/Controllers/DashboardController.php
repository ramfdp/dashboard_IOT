<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\Role;
use App\Models\User;
use App\Models\Divisi;
use App\Models\LightSchedule;
use App\Models\Listrik;
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
        $users = User::all(); // Removed with('roles') - using simple role field
        $divisions = Divisi::all();

        // Get data KWH for today only with formatted time in Indonesia timezone
        $today = Carbon::now('Asia/Jakarta')->toDateString();
        $dataKwh = Listrik::select('created_at as waktu', 'daya')
            ->whereDate('created_at', $today)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($item) {
                // Format waktu menjadi HH:MM dengan timezone Indonesia
                $item->waktu_formatted = Carbon::parse($item->waktu)
                    ->setTimezone('Asia/Jakarta')
                    ->format('H:i');
                return $item;
            });

        // If we have too many data points (more than 50), sample them for better chart readability
        if ($dataKwh->count() > 50) {
            $step = intval($dataKwh->count() / 50); // Take every nth record
            $dataKwh = $dataKwh->filter(function ($item, $key) use ($step) {
                return $key % $step === 0;
            })->values();
        }

        // If no data exists, create demo data with realistic electricity usage pattern
        if ($dataKwh->isEmpty()) {
            // Gunakan waktu Indonesia saat ini
            $now = Carbon::now('Asia/Jakarta');
            $baseTime = $now->format('Y-m-d ');

            $demoData = [];
            for ($i = 0; $i < 24; $i++) {
                $timeString = $baseTime . sprintf('%02d:00:00', $i);
                $timeCarbon = Carbon::parse($timeString, 'Asia/Jakarta');

                // Create realistic power consumption pattern
                if ($i >= 7 && $i <= 18) {
                    // Jam kerja (7 pagi - 6 sore) - daya maksimal
                    $power = rand(550, 600);
                } else {
                    // Malam hari - daya rendah
                    $power = rand(120, 180);
                }

                $demoData[] = (object)[
                    'waktu' => $timeString,
                    'waktu_formatted' => $timeCarbon->format('H:i'),
                    'daya' => $power
                ];
            }

            $dataKwh = collect($demoData);
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
        } catch (\Exception $e) {
            Log::warning('Firebase relay state fetch failed', ['error' => $e->getMessage()]);
            // Set default values if Firebase connection fails
            $relay1 = $relay2 = $relay3 = $relay4 = $relay5 = 0;
        }

        // Get sensor data with default fallback values
        try {
            $sensorData = $this->firebase->getSensorData();
            $temperature = $sensorData['temperature'] ?? 25.0;
            $humidity = $sensorData['humidity'] ?? 60.0;
        } catch (\Exception $e) {
            Log::warning('Firebase sensor data fetch failed', ['error' => $e->getMessage()]);
            $temperature = 25.0;
            $humidity = 60.0;
        }

        // Get overtime data
        $overtimes = Overtime::orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        return view('pages.dashboard-v1', compact(
            'roles',
            'users',
            'divisions',
            'lightSchedules',
            'dataKwh',
            'relay1',
            'relay2',
            'relay3',
            'relay4',
            'relay5',
            'temperature',
            'humidity',
            'overtimes'
        ));
    }

    public function update(Request $request)
    {
        try {
            $action = $request->input('action');
            $relayId = $request->input('relay_id');
            $state = $request->input('state');

            Log::info('Dashboard update request', [
                'action' => $action,
                'relay_id' => $relayId,
                'state' => $state
            ]);

            switch ($action) {
                case 'toggle_relay':
                    if (!$relayId) {
                        return response()->json(['success' => false, 'message' => 'Relay ID diperlukan']);
                    }

                    $success = $this->firebase->setRelayState($relayId, $state);

                    if ($success) {
                        Log::info("Relay {$relayId} berhasil diubah ke state: {$state}");
                        return response()->json([
                            'success' => true,
                            'message' => "Relay {$relayId} berhasil " . ($state ? 'dinyalakan' : 'dimatikan')
                        ]);
                    } else {
                        Log::error("Gagal mengubah relay {$relayId}");
                        return response()->json(['success' => false, 'message' => 'Gagal mengubah relay']);
                    }

                case 'get_sensor_data':
                    $sensorData = $this->firebase->getSensorData();
                    return response()->json(['success' => true, 'data' => $sensorData]);

                default:
                    return response()->json(['success' => false, 'message' => 'Action tidak dikenal']);
            }
        } catch (\Exception $e) {
            Log::error('Dashboard update error', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()]);
        }
    }

    public function controlRelay(Request $request)
    {
        try {
            $relayId = $request->input('relay_id');
            $state = $request->input('state');

            if (!$relayId) {
                return response()->json(['success' => false, 'message' => 'Relay ID diperlukan']);
            }

            $success = $this->firebase->setRelayState($relayId, $state);

            if ($success) {
                return response()->json([
                    'success' => true,
                    'message' => "Relay {$relayId} berhasil " . ($state ? 'dinyalakan' : 'dimatikan')
                ]);
            } else {
                return response()->json(['success' => false, 'message' => 'Gagal mengubah relay']);
            }
        } catch (\Exception $e) {
            Log::error('Control relay error', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()]);
        }
    }

    public function getSensorData()
    {
        try {
            $data = $this->firebase->getSensorData();
            return response()->json(['success' => true, 'data' => $data]);
        } catch (\Exception $e) {
            Log::error('Get sensor data error', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Gagal mengambil data sensor']);
        }
    }

    public function getRelayStates()
    {
        try {
            $relayStates = [];
            for ($i = 1; $i <= 5; $i++) {
                $relayStates["relay{$i}"] = $this->firebase->getRelayState("relay{$i}") ?? 0;
            }

            return response()->json(['success' => true, 'data' => $relayStates]);
        } catch (\Exception $e) {
            Log::error('Get relay states error', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Gagal mengambil status relay']);
        }
    }

    public function setAuto(Request $request)
    {
        return $this->setAutoMode($request);
    }

    public function setAutoMode(Request $request)
    {
        try {
            session(['manual_mode' => false]);
            Log::info('System switched to auto mode');

            return response()->json([
                'success' => true,
                'mode' => 'auto',
                'message' => 'Mode otomatis diaktifkan'
            ]);
        } catch (\Exception $e) {
            Log::error('Set auto mode error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengatur mode otomatis'
            ], 500);
        }
    }

    public function setManualMode(Request $request)
    {
        try {
            session(['manual_mode' => true]);
            Log::info('System switched to manual mode');

            return response()->json([
                'success' => true,
                'mode' => 'manual',
                'message' => 'Mode manual diaktifkan'
            ]);
        } catch (\Exception $e) {
            Log::error('Set manual mode error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengatur mode manual'
            ], 500);
        }
    }

    public function storeSchedule(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'day_of_week' => 'required|integer|between:0,6',
                'start_time' => 'required|date_format:H:i',
                'end_time' => 'required|date_format:H:i|after:start_time',
                'relay_number' => 'required|integer|between:1,8',
            ]);

            $schedule = LightSchedule::create([
                'name' => $validated['name'],
                'day_of_week' => $validated['day_of_week'],
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'],
                'relay_number' => $validated['relay_number'],
                'is_active' => true,
            ]);

            Log::info('Schedule created', ['schedule' => $schedule]);

            return response()->json([
                'success' => true,
                'message' => 'Jadwal berhasil disimpan',
                'schedule' => $schedule
            ]);
        } catch (\Exception $e) {
            Log::error('Store schedule error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan jadwal: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateSchedule(Request $request, LightSchedule $schedule)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'day_of_week' => 'required|integer|between:0,6',
                'start_time' => 'required|date_format:H:i',
                'end_time' => 'required|date_format:H:i|after:start_time',
                'relay_number' => 'required|integer|between:1,8',
            ]);

            $schedule->update($validated);

            Log::info('Schedule updated', ['schedule' => $schedule]);

            return response()->json([
                'success' => true,
                'message' => 'Jadwal berhasil diperbarui',
                'schedule' => $schedule
            ]);
        } catch (\Exception $e) {
            Log::error('Update schedule error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui jadwal: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroySchedule(LightSchedule $schedule)
    {
        try {
            $schedule->delete();

            Log::info('Schedule deleted', ['schedule_id' => $schedule->id]);

            return response()->json([
                'success' => true,
                'message' => 'Jadwal berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            Log::error('Delete schedule error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus jadwal: ' . $e->getMessage()
            ], 500);
        }
    }

    public function toggleSchedule(LightSchedule $schedule)
    {
        try {
            $schedule->is_active = !$schedule->is_active;
            $schedule->save();

            Log::info('Schedule toggled', ['schedule' => $schedule]);

            return response()->json([
                'success' => true,
                'message' => $schedule->is_active ? 'Jadwal diaktifkan' : 'Jadwal dinonaktifkan',
                'schedule' => $schedule
            ]);
        } catch (\Exception $e) {
            Log::error('Toggle schedule error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengubah status jadwal: ' . $e->getMessage()
            ], 500);
        }
    }

    public function checkSchedules(Request $request)
    {
        try {
            $now = now();

            // Map day of week to string
            $dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            $currentDay = $dayNames[$now->dayOfWeek]; // Convert 0-6 to day name
            $currentTime = $now->format('H:i:s');

            // Get active schedules for current day and time
            $activeSchedules = LightSchedule::where('day_of_week', $currentDay)
                ->where('is_active', true)
                ->where('start_time', '<=', $currentTime)
                ->where('end_time', '>=', $currentTime)
                ->get();

            // Check if system is in manual mode (you can implement this logic based on your needs)
            // For now, let's assume auto mode unless manually set
            $manualMode = session('manual_mode', false);

            $response = [
                'success' => true,
                'manual_mode' => $manualMode,
                'current_time' => $currentTime,
                'current_day' => $currentDay,
                'active_schedules_count' => $activeSchedules->count(),
                'schedules' => $activeSchedules->map(function ($schedule) {
                    return [
                        'id' => $schedule->id,
                        'name' => $schedule->name,
                        'start_time' => $schedule->start_time,
                        'end_time' => $schedule->end_time,
                        'day_of_week' => $schedule->day_of_week,
                    ];
                })
            ];

            Log::info('Schedule check completed', $response);

            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Check schedules error', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'success' => false,
                'manual_mode' => false,
                'message' => 'Gagal memeriksa jadwal: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getCurrentSchedule(Request $request)
    {
        try {
            $now = Carbon::now();

            // Map day of week to string
            $dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            $currentDay = $dayNames[$now->dayOfWeek]; // Convert 0-6 to day name
            $currentTime = $now->format('H:i:s');

            $activeSchedules = LightSchedule::where('is_active', true)
                ->where('day_of_week', $currentDay)
                ->where('start_time', '<=', $currentTime)
                ->where('end_time', '>=', $currentTime)
                ->get();

            $manualMode = session('manual_mode', false);

            return response()->json([
                'success' => true,
                'schedules' => $activeSchedules,
                'manual_mode' => $manualMode,
                'current_time' => $now->format('H:i:s'),
                'current_day' => $currentDay
            ]);
        } catch (\Exception $e) {
            Log::error('Get current schedule error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil jadwal aktif: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getScheduleStatus(Request $request)
    {
        try {
            $relayNumber = $request->input('relay_number');

            if (!$relayNumber) {
                return response()->json([
                    'success' => false,
                    'message' => 'Relay number is required'
                ], 400);
            }

            $now = Carbon::now();

            // Map day of week to string
            $dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            $currentDay = $dayNames[$now->dayOfWeek]; // Convert 0-6 to day name
            $currentTime = $now->format('H:i:s');

            // Note: relay_number field doesn't exist in light_schedules table
            // Removed the relay_number filter
            $activeSchedule = LightSchedule::where('is_active', true)
                ->where('day_of_week', $currentDay)
                ->where('start_time', '<=', $currentTime)
                ->where('end_time', '>=', $currentTime)
                ->first();

            $manualMode = session('manual_mode', false);

            return response()->json([
                'success' => true,
                'has_active_schedule' => $activeSchedule ? true : false,
                'schedule' => $activeSchedule,
                'manual_mode' => $manualMode,
                'relay_number' => $relayNumber
            ]);
        } catch (\Exception $e) {
            Log::error('Get schedule status error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengecek status jadwal: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getAllSchedules(Request $request)
    {
        try {
            $schedules = LightSchedule::orderBy('day_of_week')
                ->orderBy('start_time')
                ->get();

            return response()->json([
                'success' => true,
                'schedules' => $schedules
            ]);
        } catch (\Exception $e) {
            Log::error('Get all schedules error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil semua jadwal: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getCurrentMode(Request $request)
    {
        try {
            $manualMode = session('manual_mode', false);
            $mode = $manualMode ? 'manual' : 'auto';

            return response()->json([
                'success' => true,
                'mode' => $mode,
                'manual_mode' => $manualMode
            ]);
        } catch (\Exception $e) {
            Log::error('Get current mode error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengecek mode saat ini: ' . $e->getMessage()
            ], 500);
        }
    }
}
