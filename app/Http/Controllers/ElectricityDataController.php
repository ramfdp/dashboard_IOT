<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\HistoryKwh;
use Carbon\Carbon;

class ElectricityDataController extends Controller
{
    /**
     * Get electricity data for different periods
     */
    public function getDataByPeriod(Request $request)
    {
        $period = $request->get('period', 'harian');

        try {
            // ALWAYS get ALL available data from database
            $records = HistoryKwh::orderBy('created_at', 'desc')->get();

            if ($records->isEmpty()) {
                // Generate demo data if no database records (maintain 30 records)
                $data = $this->generateDemoHourlyData(30);
                $labels = $this->generateLabelsForPeriod($period, 30);
                $source = 'demo';
            } else {
                // Use ALL database records (e.g., all 30 records)
                $data = $records->pluck('daya')->reverse()->values()->toArray();
                $labels = $this->generateLabelsForPeriod($period, count($data));
                $source = 'database';
            }

            return response()->json([
                'success' => true,
                'period' => $period,
                'data' => $data,
                'labels' => $labels,
                'total_records' => count($data), // Always same count (e.g., 30)
                'source' => $source,
                'interpretation' => $this->getPeriodInterpretation($period, count($data))
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'period' => $period,
                'data' => $this->generateDemoHourlyData(30),
                'labels' => $this->generateLabelsForPeriod($period, 30),
                'source' => 'error_fallback',
                'total_records' => 30
            ]);
        }
    }

    /**
     * Generate labels based on period interpretation but keep same data count
     */
    private function generateLabelsForPeriod($period, $dataCount)
    {
        $labels = [];

        switch ($period) {
            case 'harian':
                // Interpret data points as hours (if 30 points = last 30 hours)
                for ($i = $dataCount - 1; $i >= 0; $i--) {
                    $time = Carbon::now()->subHours($i);
                    $labels[] = $time->format('H:i');
                }
                break;

            case 'mingguan':
                // Interpret data points as hourly readings over time
                // But label them to represent weekly context
                for ($i = $dataCount - 1; $i >= 0; $i--) {
                    $time = Carbon::now()->subHours($i);
                    $labels[] = $time->format('d/m H:i');
                }
                break;

            case 'bulanan':
                // Interpret data points as readings over longer time
                for ($i = $dataCount - 1; $i >= 0; $i--) {
                    $time = Carbon::now()->subHours($i);
                    $labels[] = $time->format('d/m H:i');
                }
                break;

            default:
                // Default hourly labels
                for ($i = $dataCount - 1; $i >= 0; $i--) {
                    $time = Carbon::now()->subHours($i);
                    $labels[] = $time->format('H:i');
                }
        }

        return $labels;
    }

    /**
     * Get period interpretation explanation
     */
    private function getPeriodInterpretation($period, $dataCount)
    {
        switch ($period) {
            case 'harian':
                return "Viewing {$dataCount} data points as hourly readings for daily analysis";
            case 'mingguan':
                return "Viewing {$dataCount} data points in weekly context (recent readings)";
            case 'bulanan':
                return "Viewing {$dataCount} data points in monthly context (recent readings)";
            default:
                return "Viewing {$dataCount} data points as hourly readings";
        }
    }

    /**
     * Generate demo hourly data pattern
     */
    private function generateDemoHourlyData($hours = 24)
    {
        $data = [];
        for ($i = 0; $i < $hours; $i++) {
            $hour = $i % 24;

            if ($hour >= 7 && $hour <= 9) {
                $power = 180 + rand(-30, 80); // Morning peak
            } else if ($hour >= 10 && $hour <= 16) {
                $power = 220 + rand(-30, 80); // Work hours
            } else if ($hour >= 17 && $hour <= 21) {
                $power = 140 + rand(-30, 60); // Evening
            } else {
                $power = 60 + rand(-20, 40);  // Night
            }

            $data[] = max(30, $power); // Minimum 30W
        }
        return $data;
    }

    /**
     * Generate hourly labels
     */
    private function generateHourlyLabels($hours = 24)
    {
        $labels = [];
        for ($i = 0; $i < $hours; $i++) {
            $hour = $i % 24;
            $labels[] = sprintf('%02d:00', $hour);
        }
        return $labels;
    }

    /**
     * Generate daily labels
     */
    private function generateDailyLabels($days = 7)
    {
        $labels = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $labels[] = $date->format('d/m');
        }
        return $labels;
    }

    /**
     * Group hourly data into daily averages
     */
    private function groupDataByDay($hourlyData, $days = 7)
    {
        $dailyData = [];
        $hoursPerDay = 24;

        for ($day = 0; $day < $days; $day++) {
            $dayStart = $day * $hoursPerDay;
            $dayEnd = min(($day + 1) * $hoursPerDay, count($hourlyData));

            $dayData = array_slice($hourlyData, $dayStart, $dayEnd - $dayStart);
            $dailyAvg = array_sum($dayData) / count($dayData);
            $dailyData[] = round($dailyAvg);
        }

        return $dailyData;
    }
}
