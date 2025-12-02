<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RealisticListrikSeeder extends Seeder
{
    public function run(): void
    {
        echo "🚀 Starting Realistic Listrik Seeder...\n";
        echo "📊 Generating data with 10-second intervals\n";
        echo "⏱️  Following exact rules from support-pzem.js\n\n";

        $intervalSeconds = 10;

        $startDate = Carbon::create(2025, 7, 14, 0, 0, 0, 'Asia/Jakarta');
        $endDate = Carbon::now('Asia/Jakarta');

        $daysToGenerate = $startDate->diffInDays($endDate);

        echo "📅 Period: {$startDate->format('Y-m-d H:i:s')} to {$endDate->format('Y-m-d H:i:s')}\n";
        echo "🔢 Total days: {$daysToGenerate}\n";
        echo "⏰ Interval: {$intervalSeconds} seconds\n";

        $totalSeconds = $startDate->diffInSeconds($endDate);
        $totalRecords = $totalSeconds / $intervalSeconds;

        echo "📈 Estimated records: " . number_format($totalRecords) . "\n";
        echo "💾 Starting data generation...\n\n";

        $currentTime = $startDate->copy();
        $batchSize = 500;
        $batch = [];
        $recordCount = 0;
        $batchCount = 0;

        while ($currentTime <= $endDate) {
            $data = $this->generateRealisticData($currentTime);
            $batch[] = $data;
            $recordCount++;

            // Insert batch setiap 500 records
            if (count($batch) >= $batchSize) {
                DB::table('listriks')->insert($batch);
                $batchCount++;

                $progress = ($recordCount / $totalRecords) * 100;
                echo sprintf(
                    "✅ Batch %d inserted (%s records) - Progress: %.1f%%\n",
                    $batchCount,
                    number_format($recordCount),
                    $progress
                );

                $batch = [];
            }

            // Increment waktu dengan interval 10 detik
            $currentTime->addSeconds($intervalSeconds);
        }

        // Insert sisa batch
        if (count($batch) > 0) {
            DB::table('listriks')->insert($batch);
            $batchCount++;
            echo "✅ Final batch inserted\n";
        }

        echo "\n";
        echo "🎉 Seeder completed successfully!\n";
        echo "📊 Total records generated: " . number_format($recordCount) . "\n";
        echo "📦 Total batches: {$batchCount}\n";
        echo "⏱️  Average per day: " . number_format($recordCount / $daysToGenerate) . " records\n";
        echo "⏱️  Per hour: " . number_format($recordCount / ($daysToGenerate * 24)) . " records\n";

        $this->showStatistics();
    }

    private function generateRealisticData(Carbon $datetime): array
    {
        $hour = (int) $datetime->format('H');
        $minute = (int) $datetime->format('i');
        $dayOfWeek = (int) $datetime->format('w');
        $isWeekend = ($dayOfWeek === 0 || $dayOfWeek === 6);

        $voltage = 0;
        $current = 0;
        $power = 0;

        if ($isWeekend) {
            $voltage = 375 + (mt_rand(0, 1000) / 1000) * 5;
            $current = 0.3 + (mt_rand(0, 1000) / 1000) * 0.2;
            $power = 200 + (mt_rand(0, 1000) / 1000) * 50;
        } else {
            if (($hour >= 8 && $hour < 12) || ($hour >= 14 && $hour < 18)) {
                $voltage = 221 + (mt_rand(0, 1000) / 1000) * 2;
                $current = 13.5 + (mt_rand(0, 1000) / 1000) * 2.1;
                $power = $voltage * $current;

                $variation = ((mt_rand(0, 1000) / 1000) - 0.5) * 200;
                $power = $power + $variation;
            } elseif ($hour >= 12 && $hour < 14) {
                $voltage = 220 + (mt_rand(0, 1000) / 1000) * 2;
                $current = 8.5 + (mt_rand(0, 1000) / 1000) * 2.0;
                $power = $voltage * $current;

                $variation = ((mt_rand(0, 1000) / 1000) - 0.5) * 100;
                $power = $power + $variation;
            } elseif ($hour >= 18 || $hour < 8) {
                $voltage = 350 + (mt_rand(0, 1000) / 1000) * 20;
                $current = 0.6 + (mt_rand(0, 1000) / 1000) * 0.3;
                $power = 200 + (mt_rand(0, 1000) / 1000) * 100;
            } else {
                $voltage = 220 + (mt_rand(0, 1000) / 1000) * 2;
                $current = 7.3 + (mt_rand(0, 1000) / 1000) * 1.5;
                $power = $voltage * $current;

                $variation = ((mt_rand(0, 1000) / 1000) - 0.5) * 150;
                $power = $power + $variation;
            }
        }

        // Validasi current range (kecuali malam hari)
        if (($hour >= 8 && $hour < 18) && !$isWeekend) {
            $current = max(7.3, min(15.6, $current));
        }

        // Validasi voltage berdasarkan kondisi beban
        if ($isWeekend || ($hour >= 18 || $hour < 8)) {
            $voltage = max(350, min(380, $voltage));
        } else if (($hour >= 8 && $hour < 18) && !$isWeekend) {
            $voltage = max(220, min(223, $voltage));
        }

        // Recalculate power untuk jam kerja
        if (($hour >= 8 && $hour < 18) && !$isWeekend) {
            $power = $voltage * $current;
        }

        $hoursElapsed = $hour + ($minute / 60);
        $dailyTarget = 269.33; // kWh per hari
        $currentDayProgress = ($power / 1000) * ($hoursElapsed / 24);
        $energi = $currentDayProgress * ($dailyTarget / (($power / 1000) * 24));

        $frekuensi = 50 + ((mt_rand(0, 1000) / 1000) - 0.5) * 0.5; 
        $powerFactor = 0.85 + (mt_rand(0, 1000) / 1000) * 0.10; 

        return [
            'lokasi' => 'PT Krakatau Sarana Property',
            'tegangan' => round($voltage, 1),
            'arus' => round($current, 2),
            'daya' => round($power),
            'energi' => round($energi, 4),
            'frekuensi' => round($frekuensi, 2),
            'power_factor' => round($powerFactor, 3),
            'listrik' => null,
            'ac' => null,
            'lampu' => null,
            'status' => 'active',
            'source' => 'seeder_realistic_10s',
            'metadata' => json_encode([
                'day_type' => $isWeekend ? 'weekend' : 'weekday',
                'period' => $this->getPeriodName($hour, $isWeekend),
                'interval' => '10_seconds',
                'generator' => 'RealisticListrikSeeder_v2.0',
                'voltage_mode' => ($isWeekend || ($hour >= 18 || $hour < 8)) ? 'high_voltage_no_load' : 'normal_voltage_loaded'
            ]),
            'sensor_timestamp' => $datetime->toDateTimeString(),
            'created_at' => $datetime->toDateTimeString(),
            'updated_at' => $datetime->toDateTimeString(),
        ];
    }

    /**
     * Get period name for metadata
     */
    private function getPeriodName(int $hour, bool $isWeekend): string
    {
        if ($isWeekend) {
            return 'weekend_minimal';
        }

        if (($hour >= 8 && $hour < 12) || ($hour >= 14 && $hour < 18)) {
            return 'working_hours_peak';
        } elseif ($hour >= 12 && $hour < 14) {
            return 'lunch_break_reduced';
        } elseif ($hour >= 18 || $hour < 6) {
            return 'night_mode_minimal';
        } else {
            return 'transition_preparation';
        }
    }

    /**
     * Show statistics of generated data
     */
    private function showStatistics(): void
    {
        echo "\n📊 Data Statistics:\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

        $stats = DB::table('listriks')
            ->select([
                DB::raw('COUNT(*) as total_records'),
                DB::raw('AVG(tegangan) as avg_voltage'),
                DB::raw('AVG(arus) as avg_current'),
                DB::raw('AVG(daya) as avg_power'),
                DB::raw('SUM(energi) as total_energy'),
                DB::raw('MAX(daya) as max_power'),
                DB::raw('MIN(daya) as min_power'),
                DB::raw('AVG(frekuensi) as avg_frequency'),
                DB::raw('AVG(power_factor) as avg_power_factor'),
            ])
            ->where('source', 'seeder_realistic_10s')
            ->first();

        if ($stats) {
            echo sprintf("Total Records    : %s\n", number_format($stats->total_records));
            echo sprintf("Average Voltage  : %.1f V\n", $stats->avg_voltage);
            echo sprintf("Average Current  : %.2f A\n", $stats->avg_current);
            echo sprintf("Average Power    : %.0f W\n", $stats->avg_power);
            echo sprintf("Peak Power       : %.0f W\n", $stats->max_power);
            echo sprintf("Minimum Power    : %.0f W\n", $stats->min_power);
            echo sprintf("Total Energy     : %.2f kWh\n", $stats->total_energy);
            echo sprintf("Avg Frequency    : %.2f Hz\n", $stats->avg_frequency);
            echo sprintf("Avg Power Factor : %.3f\n", $stats->avg_power_factor);
        }

        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

        // Show period distribution
        echo "\n📈 Period Distribution:\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

        $periods = DB::table('listriks')
            ->select([
                DB::raw("JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.period')) as period"),
                DB::raw('COUNT(*) as count'),
                DB::raw('AVG(daya) as avg_power'),
            ])
            ->where('source', 'seeder_realistic_10s')
            ->whereNotNull('metadata')
            ->groupBy('period')
            ->orderBy('avg_power', 'desc')
            ->get();

        foreach ($periods as $period) {
            echo sprintf(
                "%-30s : %6s records (avg: %5.0f W)\n",
                $period->period ?: 'unknown',
                number_format($period->count),
                $period->avg_power
            );
        }

        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

        // Show hourly distribution
        echo "\n⏰ Hourly Average Power:\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

        $hourly = DB::table('listriks')
            ->select([
                DB::raw('HOUR(sensor_timestamp) as hour'),
                DB::raw('AVG(daya) as avg_power'),
                DB::raw('COUNT(*) as count'),
            ])
            ->where('source', 'seeder_realistic_10s')
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        foreach ($hourly as $h) {
            $hour = str_pad($h->hour, 2, '0', STR_PAD_LEFT);
            echo sprintf(
                "%s:00 - %s:59  : %5.0f W (%s records)\n",
                $hour,
                $hour,
                $h->avg_power,
                number_format($h->count)
            );
        }

        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    }
}
