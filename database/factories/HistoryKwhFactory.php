<?php

namespace Database\Factories;

use App\Models\HistoryKwh;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

/**
 * Factory untuk generate data KWH dengan pola jam kerja perusahaan
 */
class HourlyHistoryKwhFactory extends Factory
{
    protected $model = HistoryKwh::class;

    /**
     * Default state untuk data perusahaan BUMN
     */
    public function definition(): array
    {
        // Parameter dasar perusahaan besar
        $tegangan = $this->faker->randomFloat(2, 375, 390); // 3-phase industrial
        $minKW = 15;
        $maxKW = 100;
        $daya = $this->faker->randomFloat(3, $minKW, $maxKW);
        $powerFactor = $this->faker->randomFloat(3, 0.85, 0.95);
        
        // Hitung arus (3-phase: I = P / (V × √3 × cos φ))
        $arus = ($daya * 1000) / ($tegangan * sqrt(3) * $powerFactor);
        
        return [
            'tegangan' => $tegangan,
            'arus' => round($arus, 2),
            'daya' => round($daya, 3),
            'energi' => $this->faker->randomFloat(2, 5000, 15000),
            'frekuensi' => $this->faker->randomFloat(2, 49.95, 50.05),
            'power_factor' => $powerFactor,
            'tanggal_input' => now(),
        ];
    }

    /**
     * State untuk jam kerja peak (08:00 - 17:00)
     */
    public function workingHours(): static
    {
        return $this->state(function (array $attributes) {
            $tegangan = $this->faker->randomFloat(2, 370, 385); // Voltage drop saat peak
            $daya = $this->faker->randomFloat(3, 70, 100); // High load: 70-100kW
            $powerFactor = $this->faker->randomFloat(3, 0.85, 0.92);
            $arus = ($daya * 1000) / ($tegangan * sqrt(3) * $powerFactor);
            
            return [
                'tegangan' => $tegangan,
                'arus' => round($arus, 2),
                'daya' => round($daya, 3),
                'energi' => $this->faker->randomFloat(2, 8000, 25000), // Higher energy
                'power_factor' => $powerFactor,
            ];
        });
    }

    /**
     * State untuk jam malam (22:00 - 06:00)
     */
    public function nightHours(): static
    {
        return $this->state(function (array $attributes) {
            $tegangan = $this->faker->randomFloat(2, 378, 392); // Stable voltage
            $daya = $this->faker->randomFloat(3, 15, 30); // Low load: 15-30kW
            $powerFactor = $this->faker->randomFloat(3, 0.88, 0.96);
            $arus = ($daya * 1000) / ($tegangan * sqrt(3) * $powerFactor);
            
            return [
                'tegangan' => $tegangan,
                'arus' => round($arus, 2),
                'daya' => round($daya, 3),
                'energi' => $this->faker->randomFloat(2, 5000, 12000), // Lower energy
                'power_factor' => $powerFactor,
            ];
        });
    }

    /**
     * State untuk weekend
     */
    public function weekend(): static
    {
        return $this->state(function (array $attributes) {
            $tegangan = $this->faker->randomFloat(2, 380, 395); // Excellent voltage
            $daya = $this->faker->randomFloat(3, 12, 35); // Minimal load: 12-35kW
            $powerFactor = $this->faker->randomFloat(3, 0.90, 0.97);
            $arus = ($daya * 1000) / ($tegangan * sqrt(3) * $powerFactor);
            
            return [
                'tegangan' => $tegangan,
                'arus' => round($arus, 2),
                'daya' => round($daya, 3),
                'energi' => $this->faker->randomFloat(2, 3000, 10000), // Weekend energy
                'power_factor' => $powerFactor,
            ];
        });
    }

    /**
     * State untuk peak hour tertentu (14:00 - puncak tertinggi)
     */
    public function peakHour(): static
    {
        return $this->state(function (array $attributes) {
            $tegangan = $this->faker->randomFloat(2, 368, 382); // Voltage drop at peak
            $daya = $this->faker->randomFloat(3, 90, 100); // Maximum load: 90-100kW
            $powerFactor = $this->faker->randomFloat(3, 0.83, 0.90); // Lower PF at peak
            $arus = ($daya * 1000) / ($tegangan * sqrt(3) * $powerFactor);
            
            return [
                'tegangan' => $tegangan,
                'arus' => round($arus, 2),
                'daya' => round($daya, 3),
                'energi' => $this->faker->randomFloat(2, 10000, 30000), // Peak energy
                'power_factor' => $powerFactor,
            ];
        });
    }

    /**
     * Method untuk generate data dengan jam spesifik
     */
    public function forHour(int $hour): static
    {
        return $this->state(function (array $attributes) use ($hour) {
            $today = Carbon::today()->addHours($hour);
            
            // Tentukan load factor berdasarkan jam
            $loadFactor = $this->getLoadFactorForHour($hour);
            
            $tegangan = $this->faker->randomFloat(2, 375, 390);
            $minKW = 15;
            $maxKW = 100;
            $targetDaya = $minKW + (($maxKW - $minKW) * $loadFactor);
            $powerFactor = $this->faker->randomFloat(3, 0.85, 0.95);
            $arus = ($targetDaya * 1000) / ($tegangan * sqrt(3) * $powerFactor);
            
            return [
                'tegangan' => $tegangan,
                'arus' => round($arus, 2),
                'daya' => round($targetDaya, 3),
                'energi' => $this->faker->randomFloat(2, 5000 + ($hour * 500), 15000 + ($hour * 800)),
                'power_factor' => $powerFactor,
                'tanggal_input' => $today,
            ];
        });
    }

    /**
     * Load factor berdasarkan jam (0-23)
     */
    private function getLoadFactorForHour(int $hour): float
    {
        $patterns = [
            0 => 0.18, 1 => 0.16, 2 => 0.15, 3 => 0.15, 4 => 0.17, 5 => 0.25,
            6 => 0.40, 7 => 0.65, 8 => 0.85, 9 => 0.92, 10 => 0.88, 11 => 0.90,
            12 => 0.75, 13 => 0.87, 14 => 0.95, 15 => 0.90, 16 => 0.82, 17 => 0.70,
            18 => 0.50, 19 => 0.35, 20 => 0.30, 21 => 0.25, 22 => 0.22, 23 => 0.20
        ];
        
        return $patterns[$hour] ?? 0.5;
    }
}