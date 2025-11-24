<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
            // Query from listrik table (primary source after optimization)
            $latestData = Listrik::orderBy('created_at', 'desc')->first();

            if ($latestData) {
                $kwh = $this->calculateKwhFromListrik($latestData);

                return response()->json([
                    'success' => true,
                    'kwh' => $kwh,
                    'timestamp' => $latestData->created_at,
                    'source' => 'listrik_table',
                    'raw_data' => [
                        'daya' => $latestData->daya ?? 0,
                        'arus' => $latestData->arus ?? 0,
                        'tegangan' => $latestData->tegangan ?? 220
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
                'kwh' => 0,
                'trace' => config('app.debug') ? $e->getTraceAsString() : null
            ], 500);
        }
    }

    /**
     * Get current month's total kWh data for PLN calculator
     * Returns actual database total for the current month only
     */
    public function getMonthlyKwhData()
    {
        try {
            $startOfMonth = Carbon::now()->startOfMonth();
            $now = Carbon::now();

            // Get all data from current month
            $monthlyData = Listrik::whereBetween('created_at', [$startOfMonth, $now])
                ->selectRaw('
                    SUM(daya) as total_power_watts,
                    COUNT(*) as data_points,
                    MIN(created_at) as start_date,
                    MAX(created_at) as end_date
                ')
                ->first();

            if ($monthlyData && $monthlyData->total_power_watts > 0 && $monthlyData->data_points > 0) {
                // Calculate actual kWh from accumulated data
                // Each data point represents a moment in time
                // Assuming data is collected every X seconds, we calculate average power first
                $avgPowerWatts = $monthlyData->total_power_watts / $monthlyData->data_points;
                $avgPowerKw = $avgPowerWatts / 1000;

                // Calculate hours elapsed in current month
                $startDate = Carbon::parse($monthlyData->start_date);
                $endDate = Carbon::parse($monthlyData->end_date);
                $hoursElapsed = $startDate->diffInHours($endDate);

                if ($hoursElapsed == 0) {
                    $hoursElapsed = 1; // Minimum 1 hour
                }

                // Calculate actual kWh consumed so far this month
                $monthlyKwh = $avgPowerKw * $hoursElapsed;

                return response()->json([
                    'success' => true,
                    'monthly_kwh' => round($monthlyKwh, 2),
                    'avg_power_watts' => round($avgPowerWatts, 2),
                    'data_points' => $monthlyData->data_points,
                    'hours_elapsed' => $hoursElapsed,
                    'period' => [
                        'start' => $startOfMonth->toDateString(),
                        'current' => $now->toDateString(),
                        'month' => $now->format('F Y')
                    ],
                    'source' => 'database_current_month'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'No electricity data found for current month',
                'monthly_kwh' => 0
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving monthly data: ' . $e->getMessage(),
                'monthly_kwh' => 0,
                'trace' => config('app.debug') ? $e->getTraceAsString() : null
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

            $hourlyData = Listrik::whereDate('created_at', $today)
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
                'message' => 'Error retrieving hourly data: ' . $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTraceAsString() : null
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

            // Query from listrik table (primary source after optimization)
            $monthlyData = Listrik::whereBetween('created_at', [$startOfMonth, $endOfMonth])
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
                    'source' => 'listrik_table'
                ]);
            }

            // Fallback to latest data if no monthly data
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
                    'source' => 'listriks_table_fallback'
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
                'monthly_kwh' => 0,
                'trace' => config('app.debug') ? $e->getTraceAsString() : null
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

            $dailyData = Listrik::whereBetween('created_at', [$startOfMonth, $endOfMonth])
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
                'message' => 'Error retrieving daily summary: ' . $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTraceAsString() : null
            ], 500);
        }
    }
}
