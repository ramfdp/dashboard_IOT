<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HistoryKwh;
use App\Models\Listrik;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ElectricityDataController extends Controller
{
    /**
     * Get latest kWh data for PLN calculator
     */
    public function getLatestKwhData()
    {
        try {
            // Get latest data from histori_kwh table
            $latestData = HistoryKwh::orderBy('created_at', 'desc')->first();

            if ($latestData) {
                $kwh = $this->calculateDailyKwh($latestData);

                return response()->json([
                    'success' => true,
                    'kwh' => $kwh,
                    'timestamp' => $latestData->created_at,
                    'source' => 'database',
                    'raw_data' => [
                        'daya' => $latestData->daya,
                        'arus' => $latestData->arus,
                        'tegangan' => $latestData->tegangan
                    ]
                ]);
            }

            // Fallback to listriks table if histori_kwh is empty
            $listrikData = Listrik::orderBy('created_at', 'desc')->first();

            if ($listrikData) {
                $kwh = $this->calculateKwhFromListrik($listrikData);

                return response()->json([
                    'success' => true,
                    'kwh' => $kwh,
                    'timestamp' => $listrikData->created_at,
                    'source' => 'listriks_table',
                    'raw_data' => [
                        'daya' => $listrikData->daya ?? 0,
                        'arus' => $listrikData->arus ?? 0,
                        'tegangan' => $listrikData->tegangan ?? 220
                    ]
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'No electricity data found',
                'kwh' => 0
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving electricity data: ' . $e->getMessage(),
                'kwh' => 0
            ], 500);
        }
    }

    /**
     * Calculate daily kWh from history data
     */
    private function calculateDailyKwh($data)
    {
        $daya = floatval($data->daya ?? 0); // Watts

        if ($daya <= 0) {
            return 0;
        }

        // Convert watts to kW and estimate daily consumption
        $dayaKw = $daya / 1000;

        // For estimation, assume current power consumption for full day
        $dailyKwh = $dayaKw * 24;

        return round($dailyKwh, 2);
    }

    /**
     * Calculate kWh from Listrik table data
     */
    private function calculateKwhFromListrik($data)
    {
        $daya = floatval($data->daya ?? 0);

        if ($daya <= 0) {
            return 0;
        }

        $dayaKw = $daya / 1000;
        $dailyKwh = $dayaKw * 24;

        return round($dailyKwh, 2);
    }

    /**
     * Get hourly consumption data for charts
     */
    public function getHourlyConsumption()
    {
        try {
            $today = Carbon::today();

            $hourlyData = HistoryKwh::whereDate('created_at', $today)
                ->select(
                    DB::raw('HOUR(created_at) as hour'),
                    DB::raw('AVG(daya) as avg_power'),
                    DB::raw('COUNT(*) as data_points')
                )
                ->groupBy(DB::raw('HOUR(created_at)'))
                ->orderBy('hour')
                ->get();

            $chartData = [];
            for ($hour = 0; $hour < 24; $hour++) {
                $hourData = $hourlyData->firstWhere('hour', $hour);

                if ($hourData) {
                    $avgPowerKw = $hourData->avg_power / 1000;
                    $kwh = $avgPowerKw; // 1 hour consumption
                } else {
                    $kwh = 0;
                }

                $chartData[] = [
                    'hour' => sprintf('%02d:00', $hour),
                    'kwh' => round($kwh, 2),
                    'data_points' => $hourData ? $hourData->data_points : 0
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $chartData,
                'total_kwh' => array_sum(array_column($chartData, 'kwh'))
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving hourly data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get monthly kWh consumption for PLN calculator
     */
    public function getMonthlyKwhConsumption()
    {
        try {
            $startOfMonth = Carbon::now()->startOfMonth();
            $endOfMonth = Carbon::now()->endOfMonth();

            // Get all data for current month
            $monthlyData = HistoryKwh::whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->selectRaw('
                    AVG(daya) as avg_power_watts,
                    COUNT(*) as data_points,
                    MIN(created_at) as start_date,
                    MAX(created_at) as end_date
                ')
                ->first();

            if ($monthlyData && $monthlyData->avg_power_watts > 0) {
                // Calculate actual hours of data collection
                $startDate = Carbon::parse($monthlyData->start_date);
                $endDate = Carbon::parse($monthlyData->end_date);
                $actualHours = $startDate->diffInHours($endDate);

                if ($actualHours == 0) {
                    $actualHours = 24; // Default to 24 hours if same day
                }

                // Convert average watts to kWh for the actual time period
                $avgPowerKw = $monthlyData->avg_power_watts / 1000;
                $actualKwh = $avgPowerKw * $actualHours;

                // Estimate full month consumption (30 days)
                $daysInMonth = Carbon::now()->daysInMonth;
                $hoursInMonth = $daysInMonth * 24;
                $monthlyKwh = $avgPowerKw * $hoursInMonth;

                return response()->json([
                    'success' => true,
                    'monthly_kwh' => round($monthlyKwh, 2),
                    'actual_kwh' => round($actualKwh, 2),
                    'avg_power_watts' => round($monthlyData->avg_power_watts, 2),
                    'avg_power_kw' => round($avgPowerKw, 3),
                    'data_points' => $monthlyData->data_points,
                    'period' => [
                        'start' => $startOfMonth->toDateString(),
                        'end' => $endOfMonth->toDateString(),
                        'days_in_month' => $daysInMonth,
                        'actual_hours' => $actualHours
                    ],
                    'calculation_method' => 'monthly_average_projection',
                    'source' => 'database'
                ]);
            }

            // Fallback to listriks table if no history data
            $listrikData = Listrik::orderBy('created_at', 'desc')->first();

            if ($listrikData && $listrikData->daya > 0) {
                $avgPowerKw = $listrikData->daya / 1000;
                $daysInMonth = Carbon::now()->daysInMonth;
                $monthlyKwh = $avgPowerKw * $daysInMonth * 24;

                return response()->json([
                    'success' => true,
                    'monthly_kwh' => round($monthlyKwh, 2),
                    'actual_kwh' => round($avgPowerKw * 24, 2),
                    'avg_power_watts' => $listrikData->daya,
                    'avg_power_kw' => round($avgPowerKw, 3),
                    'data_points' => 1,
                    'period' => [
                        'start' => $startOfMonth->toDateString(),
                        'end' => $endOfMonth->toDateString(),
                        'days_in_month' => $daysInMonth,
                        'actual_hours' => 24
                    ],
                    'calculation_method' => 'single_point_projection',
                    'source' => 'listriks_table'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'No electricity consumption data available for current month',
                'monthly_kwh' => 0
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error calculating monthly consumption: ' . $e->getMessage(),
                'monthly_kwh' => 0
            ], 500);
        }
    }

    /**
     * Get daily summary for current month
     */
    public function getDailySummary()
    {
        try {
            $startOfMonth = Carbon::now()->startOfMonth();
            $endOfMonth = Carbon::now()->endOfMonth();

            $dailyData = HistoryKwh::whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('AVG(daya) as avg_power'),
                    DB::raw('MAX(daya) as max_power'),
                    DB::raw('MIN(daya) as min_power')
                )
                ->groupBy(DB::raw('DATE(created_at)'))
                ->orderBy('date')
                ->get();

            $summary = $dailyData->map(function ($day) {
                $avgPowerKw = $day->avg_power / 1000;
                $dailyKwh = $avgPowerKw * 24;

                return [
                    'date' => $day->date,
                    'kwh' => round($dailyKwh, 2),
                    'avg_power' => round($day->avg_power, 1),
                    'max_power' => round($day->max_power, 1),
                    'min_power' => round($day->min_power, 1)
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $summary,
                'total_kwh' => $summary->sum('kwh'),
                'period' => [
                    'start' => $startOfMonth->toDateString(),
                    'end' => $endOfMonth->toDateString()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving daily summary: ' . $e->getMessage()
            ], 500);
        }
    }
}
