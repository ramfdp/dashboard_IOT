<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\HistoryKwh;
use Carbon\Carbon;

class HistoryKwhSeeder extends Seeder
{
    /**
     * Generate data untuk 24 jam dengan interval 1 jam (00:00 - 23:00)
     */
    public function run(): void
    {
        // Hapus data existing
        HistoryKwh::truncate();

        // Tanggal hari ini sebagai base
        $baseDate = Carbon::today(); // Start from 00:00 today
        $cumulativeEnergy = 5000; // Starting energy untuk perusahaan

        // Generate data untuk 24 jam (00:00 - 23:00)
        for ($hour = 0; $hour < 24; $hour++) {
            $currentTime = $baseDate->copy()->addHours($hour);
            
            // Tentukan apakah hari kerja atau weekend
            $isWeekend = $currentTime->isWeekend();
            
            // Dapatkan load factor berdasarkan jam
            $loadFactor = $this->getHourlyLoadFactor($hour, $isWeekend);
            
            // Parameter dasar untuk perusahaan BUMN
            $baseTegangan = 380; // Volt (3-phase)
            $minKW = 15;  // Minimum load
            $maxKW = 100; // Maximum load
            $basePowerFactor = 0.88;
            
            // Hitung nilai-nilai listrik
            $targetDaya = $minKW + (($maxKW - $minKW) * $loadFactor);
            
            // Tambahkan variasi realistis
            $tegangan = $baseTegangan + rand(-8, 12); // 372-392V
            $powerFactor = $basePowerFactor + (rand(-3, 7) / 100); // 0.85-0.95
            $frekuensi = 50 + (rand(-2, 2) / 100); // 49.98-50.02 Hz
            
            // Hitung arus berdasarkan daya (3-phase: P = V × I × √3 × cos φ)
            $arus = ($targetDaya * 1000) / ($tegangan * sqrt(3) * $powerFactor);
            $arus = $arus + (rand(-50, 50) / 100); // Tambah variasi
            
            // Recalculate daya aktual
            $daya = ($tegangan * $arus * sqrt(3) * $powerFactor) / 1000;
            $daya = max($minKW, min($daya, $maxKW)); // Batasi range
            
            // Update energi kumulatif
            $energyConsumption = $daya; // kWh untuk 1 jam
            $cumulativeEnergy += $energyConsumption;
            
            // Buat record
            HistoryKwh::create([
                'tegangan' => round($tegangan, 2),
                'arus' => round($arus, 2),
                'daya' => round($daya, 3),
                'energi' => round($cumulativeEnergy, 2),
                'frekuensi' => round($frekuensi, 2),
                'power_factor' => round($powerFactor, 3),
                'tanggal_input' => $currentTime->format('Y-m-d H:i:s'),
                'waktu' => $currentTime->format('H:i:s'), // Tambah kolom waktu
                'created_at' => $currentTime,
                'updated_at' => $currentTime,
            ]);
        }
        
        $this->command->info("✅ Data berhasil di-generate untuk 24 jam dengan " . HistoryKwh::count() . " records");
        $this->command->info("📊 Rentang waktu: " . $baseDate->format('Y-m-d') . " 00:00 - 23:00");
    }
    
    /**
     * Dapatkan load factor berdasarkan jam untuk perusahaan BUMN
     */
    private function getHourlyLoadFactor($hour, $isWeekend = false)
    {
        if ($isWeekend) {
            return $this->getWeekendLoadFactor($hour);
        }
        
        // Pola beban hari kerja perusahaan (dalam decimal 0-1)
        $workdayPattern = [
            0  => 0.18,  // 00:00 - Malam (sistem security, server) → ~18kW
            1  => 0.16,  // 01:00 - Dini hari (load minimum) → ~16kW
            2  => 0.15,  // 02:00 - Dini hari (paling rendah) → ~15kW
            3  => 0.15,  // 03:00 - Dini hari → ~15kW
            4  => 0.17,  // 04:00 - Subuh (prep cleaning) → ~17kW
            5  => 0.25,  // 05:00 - Pagi (cleaning crew) → ~25kW
            6  => 0.40,  // 06:00 - Pagi (warm up building) → ~40kW
            7  => 0.65,  // 07:00 - Kedatangan staff → ~65kW
            8  => 0.85,  // 08:00 - Jam kerja mulai → ~85kW
            9  => 0.92,  // 09:00 - Peak pagi → ~92kW
            10 => 0.88,  // 10:00 - Operasional penuh → ~88kW
            11 => 0.90,  // 11:00 - Pre-lunch peak → ~90kW
            12 => 0.75,  // 12:00 - Lunch break → ~75kW
            13 => 0.87,  // 13:00 - Setelah lunch → ~87kW
            14 => 0.95,  // 14:00 - Peak siang → ~95kW (tertinggi)
            15 => 0.90,  // 15:00 - Sore aktif → ~90kW
            16 => 0.82,  // 16:00 - Sore → ~82kW
            17 => 0.70,  // 17:00 - Pulang kerja → ~70kW
            18 => 0.50,  // 18:00 - Malam (AC, security) → ~50kW
            19 => 0.35,  // 19:00 - Malam → ~35kW
            20 => 0.30,  // 20:00 - Malam → ~30kW
            21 => 0.25,  // 21:00 - Malam → ~25kW
            22 => 0.22,  // 22:00 - Malam → ~22kW
            23 => 0.20,  // 23:00 - Malam → ~20kW
        ];
        
        return $workdayPattern[$hour] ?? 0.5;
    }
    
    /**
     * Load factor untuk weekend
     */
    private function getWeekendLoadFactor($hour)
    {
        // Pola weekend - hanya sistem esensial
        $weekendPattern = [
            0  => 0.15,  // 00:00 → ~15kW
            1  => 0.13,  // 01:00 → ~13kW
            2  => 0.12,  // 02:00 → ~12kW (terendah)
            3  => 0.12,  // 03:00 → ~12kW
            4  => 0.14,  // 04:00 → ~14kW
            5  => 0.16,  // 05:00 → ~16kW
            6  => 0.18,  // 06:00 → ~18kW
            7  => 0.22,  // 07:00 → ~22kW
            8  => 0.28,  // 08:00 → ~28kW
            9  => 0.32,  // 09:00 → ~32kW
            10 => 0.30,  // 10:00 → ~30kW
            11 => 0.28,  // 11:00 → ~28kW
            12 => 0.25,  // 12:00 → ~25kW
            13 => 0.28,  // 13:00 → ~28kW
            14 => 0.35,  // 14:00 → ~35kW (peak weekend)
            15 => 0.32,  // 15:00 → ~32kW
            16 => 0.28,  // 16:00 → ~28kW
            17 => 0.25,  // 17:00 → ~25kW
            18 => 0.22,  // 18:00 → ~22kW
            19 => 0.20,  // 19:00 → ~20kW
            20 => 0.18,  // 20:00 → ~18kW
            21 => 0.16,  // 21:00 → ~16kW
            22 => 0.15,  // 22:00 → ~15kW
            23 => 0.15,  // 23:00 → ~15kW
        ];
        
        return $weekendPattern[$hour] ?? 0.2;
    }
}