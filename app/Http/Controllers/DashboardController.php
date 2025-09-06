<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use App\models\Role;
use App\models\User;
use App\models\Divisi;
use App\models\LightSchedule;
use App\models\HistoryKwh;
use App\models\Overtime;
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
        $divisions = Divisi::all();

        // Get data KWH with formatted time in Indonesia timezone
        $dataKwh = HistoryKwh::select('waktu', 'daya')
            ->orderBy('waktu', 'asc')
            ->get()
            ->map(function ($item) {
                // Format waktu menjadi HH:MM dengan timezone Indonesia
                $item->waktu_formatted = Carbon::parse($item->waktu)
                    ->setTimezone('Asia/Jakarta')
                    ->format('H:i');
                return $item;
            });

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
                if ($i >= 6 && $i <= 8) {
                    // Morning peak (office start)
                    $power = rand(150, 250);
                } elseif ($i >= 9 && $i <= 17) {
                    // Office hours
                    $power = rand(200, 300);
                } elseif ($i >= 18 && $i <= 22) {
                    // Evening
                    $power = rand(100, 180);
                } else {
                    // Night/early morning
                    $power = rand(50, 120);
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
}
