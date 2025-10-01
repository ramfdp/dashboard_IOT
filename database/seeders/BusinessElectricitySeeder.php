<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Listrik;
use Carbon\Carbon;

class BusinessElectricitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Generate data dari 14 Juli hingga 14 September 2025
     * Interval tiap 3 detik untuk simulate real-time monitoring
     * Max daya 660W untuk bisnis menengah
     */
    public function run(): void
    {
        echo "Mulai generate data listrik bisnis menengah (Max 660W)...\n";
        echo "Periode: 14 Juli 2025 - 14 September 2025\n";
        echo "Interval: 3 detik (simulate real-time)\n\n";

        // Tanggal mulai dan akhir
        $startDate = Carbon::create(2025, 7, 14, 0, 0, 0);
        $endDate = Carbon::create(2025, 9, 14, 23, 59, 59);

        $data = [];
        $energyAccumulator = 0; // Akumulasi energi dalam kWh
        $batchCount = 0;
        $totalRecords = 0;

        // Hitung total hari
        $totalDays = $startDate->diffInDays($endDate) + 1;
        echo "Total hari: {$totalDays} hari\n";

        // Loop untuk setiap hari
        for ($date = $startDate->copy(); $date <= $endDate; $date->addDay()) {

            echo "Processing: " . $date->format('d/m/Y') . "...";

            // Generate data tiap 3 detik dalam sehari
            // 24 jam x 60 menit x 60 detik / 3 detik = 28,800 records per hari
            $secondsInDay = 24 * 60 * 60; // 86,400 detik
            $interval = 3; // 3 detik
            $recordsPerDay = intval($secondsInDay / $interval); // 28,800 records

            for ($i = 0; $i < $recordsPerDay; $i++) {
                // Timestamp dengan interval 3 detik
                $timestamp = $date->copy()->addSeconds($i * $interval);

                // Skip jika melebihi end date
                if ($timestamp > $endDate) {
                    break;
                }

                $hour = $timestamp->hour;
                $minute = $timestamp->minute;

                // Pola konsumsi bisnis menengah berdasarkan jam:
                if ($hour >= 0 && $hour < 6) {
                    // Dini hari - minimal (30-80W) - sistem standby, keamanan
                    $basePower = rand(30, 80);
                } elseif ($hour >= 6 && $hour < 8) {
                    // Pagi awal - persiapan (80-150W) - cleaning service, persiapan
                    $basePower = rand(80, 150);
                } elseif ($hour >= 8 && $hour < 12) {
                    // Pagi-siang aktif (200-500W) - full operation
                    $basePower = rand(200, 500);
                } elseif ($hour >= 12 && $hour < 14) {
                    // Lunch time - peak (300-660W) - AC full, kitchen, semua aktif
                    $basePower = rand(300, 660);
                } elseif ($hour >= 14 && $hour < 18) {
                    // Siang-sore aktif (250-550W) - operasional normal
                    $basePower = rand(250, 550);
                } elseif ($hour >= 18 && $hour < 22) {
                    // Sore-malam (150-400W) - overtime, cleaning
                    $basePower = rand(150, 400);
                } else {
                    // Malam (50-120W) - security, minimal lighting
                    $basePower = rand(50, 120);
                }

                // Tambah variasi random ±15% untuk simulate fluktuasi normal
                $variation = rand(-15, 15) / 100;
                $daya = $basePower * (1 + $variation);

                // Pastikan tidak melebihi 660W dan minimal 25W
                $daya = min(660, max(25, round($daya, 2)));

                // Tegangan PLN Indonesia: 220V ±5% (bisnis biasanya lebih stabil)
                $tegangan = rand(209, 231) + (rand(0, 99) / 100);
                $tegangan = round($tegangan, 2);

                // Power Factor bisnis menengah: 0.88-0.96 (lebih baik dari rumahan)
                $powerFactor = (rand(880, 960) / 1000);
                $powerFactor = round($powerFactor, 3);

                // Hitung arus berdasarkan P = V * I * PF
                $arus = $daya / ($tegangan * $powerFactor);
                $arus = round($arus, 3);

                // Frekuensi PLN Indonesia: 50Hz ±0.5% (bisnis lebih stabil)
                $frekuensi = rand(4975, 5025) / 100;
                $frekuensi = round($frekuensi, 2);

                // Energi akumulatif (kWh) - interval 3 detik = 0.000833 jam
                $timeInterval = 3 / 3600; // Convert 3 detik ke jam
                $energyIncrement = ($daya / 1000) * $timeInterval;
                $energyAccumulator += $energyIncrement;

                $data[] = [
                    'lokasi' => 'Main Panel',
                    'tegangan' => $tegangan,
                    'arus' => $arus,
                    'daya' => $daya,
                    'energi' => round($energyAccumulator, 6),
                    'frekuensi' => $frekuensi,
                    'power_factor' => $powerFactor,
                    'status' => 'active',
                    'metadata' => json_encode([
                        'sensor_type' => 'PZEM-004T',
                        'location_detail' => 'Panel Listrik Utama Bisnis',
                        'business_hours' => ($hour >= 8 && $hour <= 18),
                        'generated_by' => 'BusinessElectricitySeeder'
                    ]),
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ];

                $totalRecords++;

                // Insert batch setiap 1000 records untuk performa optimal
                if (count($data) >= 1000) {
                    Listrik::insert($data);
                    $batchCount++;
                    echo ".";
                    $data = [];
                }
            }

            echo " ✓ (" . number_format($recordsPerDay) . " records)\n";
        }

        // Insert sisa data
        if (!empty($data)) {
            Listrik::insert($data);
            $batchCount++;
        }

        // Statistik final
        $finalCount = Listrik::count();
        $avgPower = Listrik::avg('daya');
        $maxPower = Listrik::max('daya');
        $minPower = Listrik::min('daya');
        $totalEnergy = Listrik::max('energi');

        echo "\n=== SEEDER COMPLETED ===\n";
        echo "Periode: 14 Juli - 14 September 2025\n";
        echo "Total Records: " . number_format($finalCount) . "\n";
        echo "Batches Inserted: {$batchCount}\n";
        echo "Min Power: " . round($minPower, 2) . " W\n";
        echo "Average Power: " . round($avgPower, 2) . " W\n";
        echo "Max Power: " . round($maxPower, 2) . " W (≤660W ✓)\n";
        echo "Total Energy: " . round($totalEnergy, 2) . " kWh\n";
        echo "Interval: 3 detik (real-time simulation)\n";
        echo "========================\n";
    }
}
