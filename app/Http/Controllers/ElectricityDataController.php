<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\HistoryKwh;
use Carbon\Carbon;

class ElectricityDataController extends Controller
{
    /**
     * Get electricity data for different periods based on real database data
     */
    public function getDataByPeriod(Request $request)
    {
        $period = $request->get('period', 'harian');

        try {
            $currentMonth = Carbon::now('Asia/Jakarta')->month;
            $currentYear = Carbon::now('Asia/Jakarta')->year;

            // Get data based on the selected period from current month
            switch ($period) {
                case 'harian':
                    $records = HistoryKwh::whereMonth('waktu', $currentMonth)
                        ->whereYear('waktu', $currentYear)
                        ->whereDate('waktu', Carbon::today('Asia/Jakarta'))
                        ->orderBy('waktu', 'asc')
                        ->get();
                    break;

                case 'mingguan':
                    $startOfWeek = Carbon::now('Asia/Jakarta')->startOfWeek();
                    $endOfWeek = Carbon::now('Asia/Jakarta')->endOfWeek();
                    $records = HistoryKwh::whereMonth('waktu', $currentMonth)
                        ->whereYear('waktu', $currentYear)
                        ->whereBetween('waktu', [$startOfWeek, $endOfWeek])
                        ->orderBy('waktu', 'asc')
                        ->get();
                    break;

                case 'bulanan':
                    $records = HistoryKwh::whereMonth('waktu', $currentMonth)
                        ->whereYear('waktu', $currentYear)
                        ->orderBy('waktu', 'asc')
                        ->get();
                    break;

                default:
                    $records = HistoryKwh::whereMonth('waktu', $currentMonth)
                        ->whereYear('waktu', $currentYear)
                        ->whereDate('waktu', Carbon::today('Asia/Jakarta'))
                        ->orderBy('waktu', 'asc')
                        ->get();
            }

            if ($records->isEmpty()) {
                // Generate realistic demo data if no database records
                $data = $this->generateDemoDataForPeriod($period);
                $labels = $this->generateLabelsForPeriod($period, count($data));
                $source = 'demo';
                $total_records = count($data);
            } else {
                // Use real database records
                $data = $records->pluck('daya')->toArray();
                $labels = $this->generateLabelsFromRecords($records, $period);
                $source = 'database';
                $total_records = count($data);
            }

            return response()->json([
                'success' => true,
                'period' => $period,
                'data' => array_values($data),
                'labels' => array_values($labels),
                'total_records' => $total_records,
                'source' => $source,
                'current_month' => Carbon::now('Asia/Jakarta')->format('F Y'),
                'period_info' => $this->getPeriodInfo($period),
                'debug' => [
                    'db_records_found' => $records->count(),
                    'final_data_count' => count($data),
                    'period_requested' => $period,
                    'current_month' => $currentMonth,
                    'current_year' => $currentYear
                ]
            ]);
        } catch (\Exception $e) {
            // Fallback to demo data on error
            $fallbackData = $this->generateDemoDataForPeriod($period);

            return response()->json([
                'success' => true,
                'period' => $period,
                'data' => $fallbackData,
                'labels' => $this->generateLabelsForPeriod($period, count($fallbackData)),
                'total_records' => count($fallbackData),
                'source' => 'error_fallback',
                'current_month' => Carbon::now('Asia/Jakarta')->format('F Y'),
                'period_info' => $this->getPeriodInfo($period),
                'error_message' => $e->getMessage(),
                'debug' => [
                    'error_occurred' => true,
                    'period_requested' => $period
                ]
            ]);
        }
    }

    /**
     * Generate demo data based on period
     */
    private function generateDemoDataForPeriod($period)
    {
        switch ($period) {
            case 'harian':
                return $this->generateDemoHourlyData(24);
            case 'mingguan':
                return $this->generateDemoHourlyData(168); // 7 days * 24 hours
            case 'bulanan':
                return $this->generateDemoHourlyData(720); // 30 days * 24 hours
            default:
                return $this->generateDemoHourlyData(24);
        }
    }

    /**
     * Generate labels from actual database records
     */
    private function generateLabelsFromRecords($records, $period)
    {
        $labels = [];

        foreach ($records as $record) {
            $time = Carbon::parse($record->waktu)->setTimezone('Asia/Jakarta');

            switch ($period) {
                case 'harian':
                    $labels[] = $time->format('H:i');
                    break;
                case 'mingguan':
                    $labels[] = $time->format('D H:i');
                    break;
                case 'bulanan':
                    $labels[] = $time->format('d/m H:i');
                    break;
                default:
                    $labels[] = $time->format('H:i');
            }
        }

        return $labels;
    }

    /**
     * Get period information
     */
    private function getPeriodInfo($period)
    {
        $currentMonth = Carbon::now('Asia/Jakarta')->format('F Y');

        switch ($period) {
            case 'harian':
                return "Data konsumsi listrik hari ini (" . Carbon::now('Asia/Jakarta')->format('d F Y') . ")";
            case 'mingguan':
                return "Data konsumsi listrik minggu ini (bulan {$currentMonth})";
            case 'bulanan':
                return "Data konsumsi listrik bulan {$currentMonth}";
            default:
                return "Data konsumsi listrik periode {$period}";
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

            if ($hour >= 6 && $hour <= 18) {
                $power = 550 + rand(-30, 50); // Jam kerja 6 pagi - 6 sore (520-600W)
            } else {
                $power = 150 + rand(-30, 30);  // Malam hari (120-180W)
            }

            $data[] = max(100, $power); // Minimum 100W
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

    /**
     * Get current usage data (separate from period analysis)
     */
    public function getCurrentUsage(Request $request)
    {
        try {
            $currentTime = Carbon::now('Asia/Jakarta');

            // Get the latest record from today
            $latestRecord = HistoryKwh::whereDate('waktu', $currentTime->toDateString())
                ->orderBy('waktu', 'desc')
                ->first();

            // Get last 10 records for average calculation
            $recentRecords = HistoryKwh::whereDate('waktu', $currentTime->toDateString())
                ->orderBy('waktu', 'desc')
                ->take(10)
                ->get();

            if ($latestRecord && $recentRecords->isNotEmpty()) {
                $currentPower = $latestRecord->daya;
                $averagePower = $recentRecords->avg('daya');

                // Calculate kWh for today
                $todayRecords = HistoryKwh::whereDate('waktu', $currentTime->toDateString())
                    ->orderBy('waktu', 'asc')
                    ->get();

                $totalKwh = $this->calculateKwh($todayRecords);

                $source = 'database';
                $lastUpdate = Carbon::parse($latestRecord->waktu)->setTimezone('Asia/Jakarta');
            } else {
                // Fallback to realistic demo values
                $currentPower = $this->generateCurrentPowerDemo();
                $averagePower = $currentPower + rand(-20, 20);
                $totalKwh = $this->generateDemoKwh();
                $source = 'demo';
                $lastUpdate = $currentTime;
            }

            return response()->json([
                'success' => true,
                'current_power' => round($currentPower),
                'average_power' => round($averagePower),
                'total_kwh_today' => round($totalKwh, 2),
                'last_update' => $lastUpdate->format('H:i:s'),
                'date' => $currentTime->format('d F Y'),
                'source' => $source
            ]);
        } catch (\Exception $e) {
            // Return demo values on error
            $currentTime = Carbon::now('Asia/Jakarta');

            return response()->json([
                'success' => true,
                'current_power' => $this->generateCurrentPowerDemo(),
                'average_power' => $this->generateCurrentPowerDemo(),
                'total_kwh_today' => $this->generateDemoKwh(),
                'last_update' => $currentTime->format('H:i:s'),
                'date' => $currentTime->format('d F Y'),
                'source' => 'error_fallback',
                'error_message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Calculate kWh from power records
     */
    private function calculateKwh($records)
    {
        if ($records->isEmpty()) {
            return 0;
        }

        $totalWh = 0;
        $previousTime = null;

        foreach ($records as $record) {
            $currentTime = Carbon::parse($record->waktu);

            if ($previousTime) {
                $hoursDiff = $currentTime->diffInHours($previousTime);
                $totalWh += $record->daya * $hoursDiff;
            }

            $previousTime = $currentTime;
        }

        return $totalWh / 1000; // Convert Wh to kWh
    }

    /**
     * Generate current power demo based on time of day
     */
    private function generateCurrentPowerDemo()
    {
        $hour = Carbon::now('Asia/Jakarta')->hour;

        if ($hour >= 7 && $hour <= 18) {
            // Working hours
            return 550 + rand(-30, 50);
        } else {
            // Off hours
            return 150 + rand(-30, 30);
        }
    }

    /**
     * Get usage data based on selected period (untuk sinkronisasi dengan periode analisis)
     */
    public function getUsageByPeriod(Request $request)
    {
        $period = $request->get('period', 'harian');

        try {
            $currentTime = Carbon::now('Asia/Jakarta');
            $currentMonth = $currentTime->month;
            $currentYear = $currentTime->year;

            // Get data based on the selected period
            switch ($period) {
                case 'harian':
                    $records = HistoryKwh::whereDate('waktu', $currentTime->toDateString())
                        ->orderBy('waktu', 'asc')
                        ->get();
                    break;

                case 'mingguan':
                    $startOfWeek = $currentTime->startOfWeek();
                    $endOfWeek = $currentTime->endOfWeek();
                    $records = HistoryKwh::whereBetween('waktu', [$startOfWeek, $endOfWeek])
                        ->orderBy('waktu', 'asc')
                        ->get();
                    break;

                case 'bulanan':
                    $records = HistoryKwh::whereMonth('waktu', $currentMonth)
                        ->whereYear('waktu', $currentYear)
                        ->orderBy('waktu', 'asc')
                        ->get();
                    break;

                default:
                    $records = HistoryKwh::whereDate('waktu', $currentTime->toDateString())
                        ->orderBy('waktu', 'asc')
                        ->get();
            }

            if ($records->isNotEmpty()) {
                $maxPower = $records->max('daya');
                $minPower = $records->min('daya');
                $avgPower = $records->avg('daya');
                $latestRecord = $records->last();

                // Calculate kWh berdasarkan periode
                $totalKwh = $this->calculateKwh($records);
                $dailyKwh = $this->estimateDailyKwh($avgPower);
                $weeklyKwh = $dailyKwh * 7;
                $monthlyKwh = $dailyKwh * 30;

                $source = 'database';
                $lastUpdate = Carbon::parse($latestRecord->waktu)->setTimezone('Asia/Jakarta');
            } else {
                // Fallback to demo values
                $maxPower = $this->generateCurrentPowerDemo() + rand(50, 100);
                $minPower = $this->generateCurrentPowerDemo() - rand(20, 50);
                $avgPower = $this->generateCurrentPowerDemo();
                $totalKwh = $this->generateDemoKwh();
                $dailyKwh = $totalKwh;
                $weeklyKwh = $dailyKwh * 7;
                $monthlyKwh = $dailyKwh * 30;

                $source = 'demo';
                $lastUpdate = $currentTime;
            }

            return response()->json([
                'success' => true,
                'period' => $period,
                'max_power' => round($maxPower),
                'min_power' => round($minPower),
                'avg_power' => round($avgPower),
                'total_kwh' => round($totalKwh, 2),
                'daily_kwh' => round($dailyKwh, 2),
                'weekly_kwh' => round($weeklyKwh, 2),
                'monthly_kwh' => round($monthlyKwh, 2),
                'last_update' => $lastUpdate->format('H:i:s'),
                'period_info' => $this->getPeriodUsageInfo($period),
                'source' => $source,
                'total_records' => $records->count()
            ]);
        } catch (\Exception $e) {
            // Return demo values on error
            $currentTime = Carbon::now('Asia/Jakarta');
            $demoPower = $this->generateCurrentPowerDemo();

            return response()->json([
                'success' => true,
                'period' => $period,
                'max_power' => $demoPower + 100,
                'min_power' => $demoPower - 50,
                'avg_power' => $demoPower,
                'total_kwh' => $this->generateDemoKwh(),
                'daily_kwh' => $this->generateDemoKwh(),
                'weekly_kwh' => $this->generateDemoKwh() * 7,
                'monthly_kwh' => $this->generateDemoKwh() * 30,
                'last_update' => $currentTime->format('H:i:s'),
                'period_info' => $this->getPeriodUsageInfo($period),
                'source' => 'error_fallback',
                'error_message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get period usage information
     */
    private function getPeriodUsageInfo($period)
    {
        $currentTime = Carbon::now('Asia/Jakarta');

        switch ($period) {
            case 'harian':
                return "Data penggunaan listrik hari ini (" . $currentTime->format('d F Y') . ")";
            case 'mingguan':
                return "Data penggunaan listrik minggu ini (periode " . $currentTime->startOfWeek()->format('d') . "-" . $currentTime->endOfWeek()->format('d F Y') . ")";
            case 'bulanan':
                return "Data penggunaan listrik bulan " . $currentTime->format('F Y');
            default:
                return "Data penggunaan listrik periode {$period}";
        }
    }

    /**
     * Estimate daily kWh from average power
     */
    private function estimateDailyKwh($avgPower)
    {
        return ($avgPower * 24) / 1000; // Convert W*h to kWh
    }
}
