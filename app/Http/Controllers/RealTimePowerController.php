<?php

namespace App\Http\Controllers;

use App\Models\Listrik;
use App\Services\FirebaseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;

class RealTimePowerController extends Controller
{
    protected $firebase;

    public function __construct(FirebaseService $firebase)
    {
        $this->firebase = $firebase;
    }

    public function store(Request $request)
    {
        try {
            // Try multiple methods to get the data
            $data = [];

            // Method 1: Check if JSON
            if ($request->isJson()) {
                $data = $request->json()->all();
            }

            // Method 2: Try regular all()
            if (empty($data)) {
                $data = $request->all();
            }

            // Method 3: Try to parse raw input
            if (empty($data)) {
                $rawInput = $request->getContent();
                if (!empty($rawInput)) {
                    $decoded = json_decode($rawInput, true);
                    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                        $data = $decoded;
                    }
                }
            }

            // Method 4: Try input() method for each field
            if (empty($data)) {
                $data = [
                    'tegangan' => $request->input('tegangan'),
                    'arus' => $request->input('arus'),
                    'daya' => $request->input('daya'),
                    'energi' => $request->input('energi'),
                    'frekuensi' => $request->input('frekuensi'),
                    'power_factor' => $request->input('power_factor'),
                    'timestamp' => $request->input('timestamp'),
                ];
                // Remove null values
                $data = array_filter($data, function ($value) {
                    return $value !== null;
                });
            }

            // Log incoming request for debugging
            Log::info('Real-time power data received', [
                'data' => $data,
                'content_type' => $request->header('Content-Type'),
                'method' => $request->method(),
                'has_json' => $request->isJson(),
                'raw_length' => strlen($request->getContent())
            ]);

            // Validate required fields
            $validator = Validator::make($data, [
                'tegangan' => 'required|numeric',
                'arus' => 'required|numeric',
                'daya' => 'required|numeric',
            ]);

            if ($validator->fails()) {
                Log::error('Validation failed for real-time power', [
                    'errors' => $validator->errors()->toArray(),
                    'data' => $data,
                    'all_headers' => $request->headers->all()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Store in main electricity table (Listrik) only - optimized single write
            $listrik = Listrik::create([
                'tegangan' => $data['tegangan'],
                'arus' => $data['arus'],
                'daya' => $data['daya'],
                'energi' => $data['energi'] ?? 0,
                'frekuensi' => $data['frekuensi'] ?? 50.0,
                'power_factor' => $data['power_factor'] ?? 0.85,
                'status' => 'active',
                'tanggal_input' => now('Asia/Jakarta')->toDateString(),
                'waktu' => $data['timestamp'] ? Carbon::parse($data['timestamp'], 'Asia/Jakarta') : now('Asia/Jakarta'),
            ]);

            // Push to Firebase real-time database
            try {
                $this->firebase->setSensorData([
                    'current' => $data['arus'],
                    'energi' => $data['energi'] ?? 0,
                    'frekuensi' => $data['frekuensi'] ?? 50.0,
                    'lastUpdated' => now('Asia/Jakarta')->toISOString(),
                    'power' => $data['daya'],
                    'power_factor' => $data['power_factor'] ?? 0.85,
                    'timestamp' => now('Asia/Jakarta')->toISOString(),
                    'voltage' => $data['tegangan']
                ]);
                Log::info('Data pushed to Firebase successfully', ['power' => $data['daya']]);
            } catch (\Exception $e) {
                // Log error but don't fail the request if Firebase push fails
                Log::error('Failed to push data to Firebase', [
                    'error' => $e->getMessage(),
                    'data' => $data
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Data stored successfully',
                'data' => [
                    'id' => $listrik->id,
                    'power' => $data['daya'],
                    'energy' => $data['energi'],
                    'timestamp' => $listrik->created_at->toISOString()
                ]
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error storing real-time power data', [
                'error' => $e->getMessage(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to store data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get latest real-time data
     */
    public function getLatest()
    {
        try {
            $latest = Listrik::where('source', 'real_time_generator')
                ->orderBy('created_at', 'desc')
                ->first();

            if (!$latest) {
                return response()->json([
                    'success' => false,
                    'message' => 'No real-time data found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $latest->id,
                    'daya' => $latest->daya,
                    'tegangan' => $latest->tegangan,
                    'arus' => $latest->arus,
                    'energi' => $latest->energi,
                    'power_factor' => $latest->power_factor,
                    'lokasi' => $latest->lokasi,
                    'timestamp' => $latest->timestamp,
                    'created_at' => $latest->created_at,
                    'metadata' => json_decode($latest->metadata, true)
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting latest real-time data', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get latest data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get real-time data for specific time range
     */
    public function getDataRange(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
                'limit' => 'integer|min:1|max:1000'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $startDate = Carbon::parse($request->start_date);
            $endDate = Carbon::parse($request->end_date);
            $limit = $request->get('limit', 100);

            $data = Listrik::where('source', 'real_time_generator')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'daya' => $item->daya,
                        'tegangan' => $item->tegangan,
                        'arus' => $item->arus,
                        'energi' => $item->energi,
                        'power_factor' => $item->power_factor,
                        'lokasi' => $item->lokasi,
                        'timestamp' => $item->timestamp,
                        'created_at' => $item->created_at,
                        'metadata' => json_decode($item->metadata, true)
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $data,
                'count' => $data->count(),
                'range' => [
                    'start' => $startDate->toISOString(),
                    'end' => $endDate->toISOString()
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting real-time data range', [
                'error' => $e->getMessage(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get data range',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get statistics for PT Krakatau Sarana Property
     */
    public function getKrakatauStats()
    {
        try {
            $today = Carbon::today();
            $thisWeek = Carbon::now()->startOfWeek();
            $thisMonth = Carbon::now()->startOfMonth();

            // Today's statistics
            $todayData = Listrik::where('source', 'real_time_generator')
                ->whereDate('created_at', $today)
                ->selectRaw('
                    AVG(daya) as avg_power,
                    MAX(daya) as max_power,
                    MIN(daya) as min_power,
                    MAX(energi) - MIN(energi) as energy_consumed,
                    COUNT(*) as data_points
                ')
                ->first();

            // This week's statistics
            $weekData = Listrik::where('source', 'real_time_generator')
                ->where('created_at', '>=', $thisWeek)
                ->selectRaw('
                    AVG(daya) as avg_power,
                    MAX(daya) as max_power,
                    MIN(daya) as min_power,
                    MAX(energi) - MIN(energi) as energy_consumed,
                    COUNT(*) as data_points
                ')
                ->first();

            // This month's statistics
            $monthData = Listrik::where('source', 'real_time_generator')
                ->where('created_at', '>=', $thisMonth)
                ->selectRaw('
                    AVG(daya) as avg_power,
                    MAX(daya) as max_power,
                    MIN(daya) as min_power,
                    MAX(energi) - MIN(energi) as energy_consumed,
                    COUNT(*) as data_points
                ')
                ->first();

            return response()->json([
                'success' => true,
                'building' => 'PT Krakatau Sarana Property',
                'statistics' => [
                    'today' => [
                        'avg_power' => round($todayData->avg_power ?? 0, 2),
                        'max_power' => round($todayData->max_power ?? 0, 2),
                        'min_power' => round($todayData->min_power ?? 0, 2),
                        'energy_consumed' => round($todayData->energy_consumed ?? 0, 4),
                        'data_points' => $todayData->data_points ?? 0
                    ],
                    'this_week' => [
                        'avg_power' => round($weekData->avg_power ?? 0, 2),
                        'max_power' => round($weekData->max_power ?? 0, 2),
                        'min_power' => round($weekData->min_power ?? 0, 2),
                        'energy_consumed' => round($weekData->energy_consumed ?? 0, 4),
                        'data_points' => $weekData->data_points ?? 0
                    ],
                    'this_month' => [
                        'avg_power' => round($monthData->avg_power ?? 0, 2),
                        'max_power' => round($monthData->max_power ?? 0, 2),
                        'min_power' => round($monthData->min_power ?? 0, 2),
                        'energy_consumed' => round($monthData->energy_consumed ?? 0, 4),
                        'data_points' => $monthData->data_points ?? 0
                    ]
                ],
                'generated_at' => now()->toISOString()
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting Krakatau statistics', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reset energy counter (for testing purposes)
     */
    public function resetEnergyCounter()
    {
        try {
            // This would typically reset the energy counter in your hardware
            // For now, we'll just log the reset action

            Log::info('Energy counter reset requested for PT Krakatau Sarana Property');

            return response()->json([
                'success' => true,
                'message' => 'Energy counter reset successfully',
                'reset_at' => now()->toISOString()
            ]);
        } catch (\Exception $e) {
            Log::error('Error resetting energy counter', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to reset energy counter',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
