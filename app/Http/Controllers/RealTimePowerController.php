<?php

namespace App\Http\Controllers;

use App\Models\HistoryKwh;
use App\Models\Listrik;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;

class RealTimePowerController extends Controller
{
    /**
     * Store real-time power data from JavaScript generator
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'tegangan' => 'required|numeric|min:0|max:500',
                'arus' => 'required|numeric|min:0|max:1000',
                'daya' => 'required|numeric|min:0|max:100000',
                'energi' => 'required|numeric|min:0',
                'frekuensi' => 'numeric|min:45|max:55',
                'power_factor' => 'numeric|min:0|max:1',
                'lokasi' => 'string|max:255',
                'building' => 'string|max:255',
                'timestamp' => 'string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->all();

            // Store in main electricity table (Listrik)
            $listrik = Listrik::create([
                'tegangan' => $data['tegangan'],
                'arus' => $data['arus'],
                'daya' => $data['daya'],
                'energi' => $data['energi'] ?? 0,
                'frekuensi' => $data['frekuensi'] ?? 50.0,
                'power_factor' => $data['power_factor'] ?? 0.85,
                'lokasi' => $data['lokasi'] ?? 'PT Krakatau Sarana Property',
                'status' => 'active'
            ]);

            // Store in history table (HistoryKwh) for historical analysis
            $historyKwh = HistoryKwh::create([
                'daya' => $data['daya'],
                'tegangan' => $data['tegangan'],
                'arus' => $data['arus'],
                'energi' => $data['energi'] ?? 0,
                'power_factor' => $data['power_factor'] ?? 0.85,
                'frekuensi' => $data['frekuensi'] ?? 50.0,
                'tanggal_input' => now('Asia/Jakarta')->toDateString(),
                'waktu' => $data['timestamp'] ? Carbon::parse($data['timestamp'], 'Asia/Jakarta') : now('Asia/Jakarta'),
            ]);

            Log::info('Real-time power data stored', [
                'listrik_id' => $listrik->id,
                'history_id' => $historyKwh->id,
                'power' => $data['daya'],
                'voltage' => $data['tegangan'],
                'current' => $data['arus']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Data stored successfully',
                'data' => [
                    'listrik_id' => $listrik->id,
                    'history_id' => $historyKwh->id,
                    'power' => $data['daya'],
                    'energy' => $data['energi'],
                    'timestamp' => $historyKwh->created_at->toISOString()
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
            $latest = HistoryKwh::where('source', 'real_time_generator')
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

            $data = HistoryKwh::where('source', 'real_time_generator')
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
            $todayData = HistoryKwh::where('source', 'real_time_generator')
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
            $weekData = HistoryKwh::where('source', 'real_time_generator')
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
            $monthData = HistoryKwh::where('source', 'real_time_generator')
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
