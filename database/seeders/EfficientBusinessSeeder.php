<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Listrik;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class EfficientBusinessSeeder extends Seeder
{
    /**
     * Generate realistic business electricity data
     * Periode: 14 Juli - 14 September 2025
     * Interval: setiap 30 detik (lebih realistis untuk monitoring bisnis)
     * Max daya: 660W untuk bisnis menengah
     */
    public function run(): void
    {
        echo "Generate data listrik bisnis menengah...\n";
        echo "Periode: 14 Juli - 14 September 2025\n";
        echo "Interval: 30 detik\n";
        echo "Max daya: 660W\n\n";

        // Disable query log untuk performa
        DB::disableQueryLog();

        $startDate = Carbon::create(2025, 7, 14, 0, 0, 0);
        $endDate = Carbon::create(2025, 9, 14, 23, 59, 59);

        $energyAccumulator = 0;
        $totalRecords = 0;

        // Generate dengan interval 30 detik
        $currentTime = $startDate->copy();

        while ($currentTime <= $endDate) {
            $data = [];

            // Process 1 hari sekaligus untuk efisiensi
            $dayStart = $currentTime->copy()->startOfDay();
            $dayEnd = $currentTime->copy()->endOfDay();

            echo "Processing: " . $dayStart->format('d/m/Y') . "...";

            $dayTime = $dayStart->copy();
            while ($dayTime <= $dayEnd && $dayTime <= $endDate) {
                $hour = $dayTime->hour;

                // Pola konsumsi bisnis yang realistis
                if ($hour >= 0 && $hour < 6) {
                    $basePower = rand(30, 80); // Standby
                } elseif ($hour >= 6 && $hour < 8) {
                    $basePower = rand(80, 180); // Persiapan
                } elseif ($hour >= 8 && $hour < 12) {
                    $basePower = rand(200, 500); // Aktif pagi
                } elseif ($hour >= 12 && $hour < 14) {
                    $basePower = rand(350, 660); // Peak lunch
                } elseif ($hour >= 14 && $hour < 18) {
                    $basePower = rand(250, 550); // Aktif sore
                } elseif ($hour >= 18 && $hour < 22) {
                    $basePower = rand(120, 350); // Overtime
                } else {
                    $basePower = rand(40, 100); // Malam
                }

                // Variasi ±12%
                $variation = rand(-12, 12) / 100;
                $daya = $basePower * (1 + $variation);
                $daya = min(660, max(25, round($daya, 2)));

                // Parameter electrical yang realistis
                $tegangan = rand(215, 225) + (rand(0, 99) / 100);
                $powerFactor = (rand(880, 955) / 1000);
                $arus = round($daya / ($tegangan * $powerFactor), 3);
                $frekuensi = round(rand(4985, 5015) / 100, 2);

                // Energy increment (30 detik = 1/120 jam)
                $energyIncrement = ($daya / 1000) * (30 / 3600);
                $energyAccumulator += $energyIncrement;

                $data[] = [
                    'lokasi' => 'Main Panel',
                    'tegangan' => round($tegangan, 2),
                    'arus' => $arus,
                    'daya' => $daya,
                    'energi' => round($energyAccumulator, 4),
                    'frekuensi' => $frekuensi,
                    'power_factor' => round($powerFactor, 3),
                    'status' => 'active',
                    'metadata' => json_encode([
                        'sensor_type' => 'PZEM-004T',
                        'business_type' => 'medium_business',
                        'max_power' => '660W'
                    ]),
                    'created_at' => $dayTime->toDateTimeString(),
                    'updated_at' => $dayTime->toDateTimeString(),
                ];

                $dayTime->addSeconds(30); // Interval 30 detik
                $totalRecords++;

                // Insert batch setiap 500 records
                if (count($data) >= 500) {
                    DB::table('listriks')->insert($data);
                    echo ".";
                    $data = [];
                }
            }

            // Insert sisa data hari ini
            if (!empty($data)) {
                DB::table('listriks')->insert($data);
            }

            $recordsToday = 24 * 60 * 2; // 24 jam x 60 menit x 2 (tiap 30 detik)
            echo " ✓ (~{$recordsToday} records)\n";

            $currentTime->addDay();
        }

        // Statistik final
        $stats = DB::table('listriks')->selectRaw('
            COUNT(*) as total,
            ROUND(AVG(daya), 2) as avg_power,
            ROUND(MIN(daya), 2) as min_power,
            ROUND(MAX(daya), 2) as max_power,
            ROUND(MAX(energi), 2) as total_energy
        ')->first();

        echo "\n=== SEEDER COMPLETED ===\n";
        echo "Total Records: " . number_format($stats->total) . "\n";
        echo "Min Power: {$stats->min_power} W\n";
        echo "Average Power: {$stats->avg_power} W\n";
        echo "Max Power: {$stats->max_power} W (≤660W ✓)\n";
        echo "Total Energy: {$stats->total_energy} kWh\n";
        echo "Period: 14 Jul - 14 Sep 2025\n";
        echo "Interval: 30 seconds\n";
        echo "========================\n";
    }
}
