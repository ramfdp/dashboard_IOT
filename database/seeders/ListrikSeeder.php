<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Listrik;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ListrikSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Generate data from July 14, 2025 to December 2, 2025
     */
    public function run(): void
    {
        // Clear existing data first
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Listrik::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $startDate = Carbon::create(2025, 7, 14, 0, 0, 0); // 14 Juli 2025
        $endDate = Carbon::create(2025, 12, 2, 23, 59, 59); // 2 Desember 2025

        $this->command->info("🔄 Generating realistic PZEM sensor data from {$startDate->format('d M Y')} to {$endDate->format('d M Y')}...");

        $totalRecords = 0;
        $batchSize = 1000;
        $batch = [];

        // Generate data every 5 minutes for 2 months
        $currentDate = $startDate->copy();

        while ($currentDate <= $endDate) {
            $sensorData = $this->generateRealisticPZEMData($currentDate);

            $batch[] = [
                'tegangan' => $sensorData['tegangan'],
                'arus' => $sensorData['arus'],
                'daya' => $sensorData['daya'],
                'energi' => $sensorData['energi'],
                'frekuensi' => $sensorData['frekuensi'],
                'power_factor' => $sensorData['power_factor'],
                'created_at' => $currentDate->toDateTimeString(),
                'updated_at' => $currentDate->toDateTimeString(),
            ];

            // Insert in batches for better performance
            if (count($batch) >= $batchSize) {
                Listrik::insert($batch);
                $totalRecords += count($batch);
                $this->command->info("📊 Inserted {$totalRecords} records... ({$currentDate->format('d M Y H:i')})");
                $batch = [];
            }

            // Increment by 5 minutes
            $currentDate->addMinutes(5);
        }

        // Insert remaining batch
        if (!empty($batch)) {
            Listrik::insert($batch);
            $totalRecords += count($batch);
        }

        $this->command->info("✅ Successfully generated {$totalRecords} PZEM sensor records!");
        $this->command->info("📅 Period: 14 July 2025 - 2 December 2025");
        $this->command->info("⏱️  Interval: Every 5 minutes");
    }

    /**
     * Generate realistic PZEM sensor data based on time patterns
     */
    private function generateRealisticPZEMData($dateTime): array
    {
        $hour = $dateTime->hour;
        $dayOfWeek = $dateTime->dayOfWeek; // 0=Sunday, 1=Monday, etc.
        $isWeekend = in_array($dayOfWeek, [0, 6]); // Sunday or Saturday

        // Base voltage (Indonesia standard)
        $baseVoltage = 220;
        $voltage = $baseVoltage + mt_rand(-10, 10) + (sin($hour * pi() / 12) * 5);

        // Current and power patterns based on time and day
        if ($isWeekend) {
            // Weekend - lower consumption
            if ($hour >= 0 && $hour < 6) {
                // Night: 0.5-2A
                $current = mt_rand(50, 200) / 100;
            } elseif ($hour >= 6 && $hour < 9) {
                // Morning: 1-4A
                $current = mt_rand(100, 400) / 100;
            } elseif ($hour >= 9 && $hour < 18) {
                // Day: 2-6A
                $current = mt_rand(200, 600) / 100;
            } elseif ($hour >= 18 && $hour < 22) {
                // Evening: 3-8A
                $current = mt_rand(300, 800) / 100;
            } else {
                // Late night: 1-3A
                $current = mt_rand(100, 300) / 100;
            }
        } else {
            // Weekday - higher consumption (office hours)
            if ($hour >= 0 && $hour < 6) {
                // Night: 1-3A
                $current = mt_rand(100, 300) / 100;
            } elseif ($hour >= 6 && $hour < 9) {
                // Morning: 2-6A
                $current = mt_rand(200, 600) / 100;
            } elseif ($hour >= 9 && $hour < 17) {
                // Office hours: 5-12A (AC, computers, lights)
                $current = mt_rand(500, 1200) / 100;
            } elseif ($hour >= 17 && $hour < 22) {
                // Evening: 4-10A
                $current = mt_rand(400, 1000) / 100;
            } else {
                // Late night: 1.5-4A
                $current = mt_rand(150, 400) / 100;
            }
        }

        // Add some randomness
        $current *= (mt_rand(85, 115) / 100);

        // Power calculation (P = V * I * PF)
        $powerFactor = mt_rand(80, 90) / 100; // 0.80-0.90 typical for mixed loads
        $power = $voltage * $current * $powerFactor;

        // Energy calculation (accumulated kWh)
        // Calculate energy for 5-minute interval
        $energyIncrement = ($power * 5) / (60 * 1000); // Convert to kWh for 5 minutes
        $baseEnergy = mt_rand(1000, 50000) / 1000; // Random base energy

        // Frequency (Indonesia standard 50Hz with small variations)
        $frequency = 50.0 + (mt_rand(-5, 5) / 10);

        return [
            'tegangan' => round($voltage, 1),
            'arus' => round($current, 2),
            'daya' => round($power, 0),
            'energi' => round($baseEnergy + $energyIncrement, 3),
            'frekuensi' => round($frequency, 1),
            'power_factor' => round($powerFactor, 2)
        ];
    }
}
