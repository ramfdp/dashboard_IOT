<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Listrik;
use Carbon\Carbon;

class RealisticListrikSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        echo "Mulai generate data listrik yang realistis...\n";

        // Generate data untuk 7 hari terakhir
        $startDate = Carbon::now()->subDays(7);
        $endDate = Carbon::now();

        $data = [];
        $energyAccumulator = 0; // Untuk menghitung akumulasi energi

        // Loop untuk setiap hari
        for ($date = $startDate->copy(); $date <= $endDate; $date->addDay()) {

            // Generate 24-48 data points per hari (setiap 30 menit sampai 1 jam)
            $pointsPerDay = rand(24, 48);

            for ($i = 0; $i < $pointsPerDay; $i++) {
                // Waktu random dalam hari tersebut
                $timestamp = $date->copy()->addMinutes(rand(0, 1439)); // 1439 = 24*60-1

                // Generate data berdasarkan pola konsumsi listrik rumah tangga
                $hour = $timestamp->hour;

                // Pola konsumsi berdasarkan jam:
                // 00:00-06:00 = rendah (50-150W) - malam hari
                // 06:00-09:00 = sedang (200-400W) - pagi hari 
                // 09:00-17:00 = rendah-sedang (100-300W) - siang hari
                // 17:00-23:00 = tinggi (300-800W) - sore/malam aktif

                if ($hour >= 0 && $hour < 6) {
                    // Malam hari - konsumsi rendah
                    $basePower = rand(50, 150);
                } elseif ($hour >= 6 && $hour < 9) {
                    // Pagi hari - konsumsi sedang
                    $basePower = rand(200, 400);
                } elseif ($hour >= 9 && $hour < 17) {
                    // Siang hari - konsumsi rendah-sedang
                    $basePower = rand(100, 300);
                } else {
                    // Sore/malam - konsumsi tinggi
                    $basePower = rand(300, 800);
                }

                // Tambah variasi random ±20%
                $variation = rand(-20, 20) / 100;
                $daya = $basePower * (1 + $variation);
                $daya = max(10, round($daya, 2)); // Minimal 10W

                // Tegangan PLN Indonesia: 220V ±10%
                $tegangan = rand(198, 242) + (rand(0, 99) / 100);
                $tegangan = round($tegangan, 2);

                // Hitung arus berdasarkan P = V * I * PF
                $powerFactor = rand(85, 95) / 100; // PF antara 0.85-0.95
                $arus = $daya / ($tegangan * $powerFactor);
                $arus = round($arus, 3);

                // Frekuensi PLN Indonesia: 50Hz ±1%
                $frekuensi = rand(4950, 5050) / 100;
                $frekuensi = round($frekuensi, 2);

                // Energi akumulatif (kWh)
                $timeInterval = 0.5; // Asumsi 30 menit interval
                $energyIncrement = ($daya / 1000) * $timeInterval; // Convert W to kWh
                $energyAccumulator += $energyIncrement;

                $data[] = [
                    'lokasi' => 'Main Panel',
                    'tegangan' => $tegangan,
                    'arus' => $arus,
                    'daya' => $daya,
                    'energi' => round($energyAccumulator, 4),
                    'frekuensi' => $frekuensi,
                    'power_factor' => round($powerFactor, 3),
                    'status' => 'active',
                    'metadata' => json_encode([
                        'sensor_type' => 'PZEM-004T',
                        'location_detail' => 'Panel Listrik Utama',
                        'generated_by' => 'RealisticListrikSeeder'
                    ]),
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ];

                // Insert batch setiap 100 records untuk performa
                if (count($data) >= 100) {
                    Listrik::insert($data);
                    echo "Inserted batch, total energi: " . round($energyAccumulator, 2) . " kWh\n";
                    $data = [];
                }
            }
        }

        // Insert sisa data
        if (!empty($data)) {
            Listrik::insert($data);
        }

        $totalRecords = Listrik::count();
        $avgPower = Listrik::avg('daya');
        $maxPower = Listrik::max('daya');
        $totalEnergy = Listrik::max('energi');

        echo "\n=== SEEDER COMPLETED ===\n";
        echo "Total Records: {$totalRecords}\n";
        echo "Average Power: " . round($avgPower, 2) . " W\n";
        echo "Max Power: " . round($maxPower, 2) . " W\n";
        echo "Total Energy: " . round($totalEnergy, 4) . " kWh\n";
        echo "Data Range: " . $startDate->format('d/m/Y') . " - " . $endDate->format('d/m/Y') . "\n";
        echo "========================\n";
    }
}
