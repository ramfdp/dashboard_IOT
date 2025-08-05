<?php

namespace App\Services;

use App\Models\HistoryKwh;
use Carbon\Carbon;
use Illuminate\Support\Collection;

/**
 * Layanan Prediksi Penggunaan Listrik Lanjutan
 * 
 * Layanan ini menyediakan analisis dan prediksi konsumsi listrik yang canggih
 * menggunakan berbagai algoritma termasuk Regresi Linear, Analisis Tren Musiman,
 * dan Pengenalan Pola Beban.
 */
class ElectricityPredictionService
{
    private $minDataPoints = 7; // Minimum titik data untuk analisis
    private $maxDataPoints = 168; // Maksimum jam untuk analisis (1 minggu)

    /**
     * Dapatkan analisis penggunaan listrik yang komprehensif
     */
    public function getUsageAnalysis($location = null, $days = 7): array
    {
        $data = $this->getHistoricalData($location, $days);

        if ($data->count() < $this->minDataPoints) {
            return $this->getEmptyAnalysis();
        }

        return [
            'statistik_saat_ini' => $this->getCurrentStats($data),
            'tren' => $this->getTrendAnalysis($data),
            'prediksi' => $this->getPredictions($data),
            'metrik_efisiensi' => $this->getEfficiencyMetrics($data),
            'pola_beban' => $this->getLoadPatterns($data),
            'rekomendasi' => $this->getRecommendations($data)
        ];
    }

    /**
     * Regresi Linear Lanjutan dengan penyesuaian musiman
     */
    public function linearRegressionPrediction(Collection $data, int $hoursAhead = 24): array
    {
        $points = $data->map(function ($item, $index) {
            return [
                'x' => $index,
                'y' => $item->daya ?? $item->power ?? 0,
                'hour' => Carbon::parse($item->timestamp ?? $item->created_at)->hour,
                'day_of_week' => Carbon::parse($item->timestamp ?? $item->created_at)->dayOfWeek
            ];
        })->values();

        $n = $points->count();
        if ($n < 3) return ['error' => 'Data tidak cukup untuk prediksi'];

        // Hitung koefisien regresi linear
        $sumX = $points->sum('x');
        $sumY = $points->sum('y');
        $sumXY = $points->sum(fn($p) => $p['x'] * $p['y']);
        $sumX2 = $points->sum(fn($p) => $p['x'] * $p['x']);

        $slope = ($n * $sumXY - $sumX * $sumY) / ($n * $sumX2 - $sumX * $sumX);
        $intercept = ($sumY - $slope * $sumX) / $n;

        // Hitung koefisien korelasi (R²)
        $meanY = $sumY / $n;
        $ssTotal = $points->sum(fn($p) => pow($p['y'] - $meanY, 2));
        $ssResidual = $points->sum(fn($p) => pow($p['y'] - ($slope * $p['x'] + $intercept), 2));
        $rSquared = 1 - ($ssResidual / $ssTotal);

        // Buat prediksi dengan penyesuaian musiman
        $predictions = [];
        $currentHour = Carbon::now()->hour;
        $currentDay = Carbon::now()->dayOfWeek;

        for ($i = 1; $i <= $hoursAhead; $i++) {
            $x = $n + $i - 1;
            $basePrediction = $slope * $x + $intercept;

            // Terapkan pola per jam dan harian
            $hourFactor = $this->getHourlyLoadFactor(($currentHour + $i) % 24);
            $dayFactor = $this->getDailyLoadFactor(($currentDay + intval($i / 24)) % 7);

            $adjustedPrediction = $basePrediction * $hourFactor * $dayFactor;
            $adjustedPrediction = max(0, $adjustedPrediction); // Pastikan nilai positif

            $predictions[] = [
                'jam' => $i,
                'daya_prediksi' => round($adjustedPrediction, 2),
                'energi_prediksi' => round($adjustedPrediction / 1000, 4), // Konversi ke kWh
                'kepercayaan' => $this->calculateConfidence($rSquared, $i)
            ];
        }

        return [
            'algoritma' => 'Regresi Linear Lanjutan',
            'kemiringan' => round($slope, 4),
            'intersep' => round($intercept, 2),
            'r_kuadrat' => round($rSquared, 4),
            'akurasi' => $this->getAccuracyLevel($rSquared),
            'prediksi' => $predictions,
            'ringkasan' => [
                'daya_jam_depan' => $predictions[0]['daya_prediksi'] ?? 0,
                'energi_24jam_depan' => round(array_sum(array_column($predictions, 'daya_prediksi')) / 1000, 2),
                'rata_kepercayaan' => round(array_sum(array_column($predictions, 'kepercayaan')) / count($predictions), 2)
            ]
        ];
    }

    /**
     * Analisis tren musiman menggunakan rata-rata bergerak
     */
    public function getSeasonalTrends(Collection $data): array
    {
        $hourlyAverages = $data->groupBy(function ($item) {
            return Carbon::parse($item->timestamp ?? $item->created_at)->hour;
        })->map(function ($group) {
            return round($group->avg('daya') ?? $group->avg('power') ?? 0, 2);
        });

        $dailyAverages = $data->groupBy(function ($item) {
            return Carbon::parse($item->timestamp ?? $item->created_at)->dayOfWeek;
        })->map(function ($group) {
            return round($group->avg('daya') ?? $group->avg('power') ?? 0, 2);
        });

        return [
            'pola_per_jam' => $hourlyAverages->toArray(),
            'pola_harian' => $dailyAverages->toArray(),
            'jam_puncak' => $this->findPeakHours($hourlyAverages),
            'jam_konsumsi_rendah' => $this->findLowConsumptionHours($hourlyAverages),
            'akhir_pekan_vs_hari_kerja' => $this->compareWeekendWeekday($data)
        ];
    }

    /**
     * Analisis efisiensi energi
     */
    public function getEfficiencyMetrics(Collection $data): array
    {
        $powerReadings = $data->pluck('daya')->filter()->values();
        if ($powerReadings->isEmpty()) {
            $powerReadings = $data->pluck('power')->filter()->values();
        }

        if ($powerReadings->isEmpty()) {
            return ['error' => 'Tidak ada data daya tersedia'];
        }

        $mean = $powerReadings->avg();
        $std = $this->calculateStandardDeviation($powerReadings, $mean);
        $cv = $std / $mean; // Koefisien variasi

        return [
            'daya_rata_rata' => round($mean, 2),
            'deviasi_standar' => round($std, 2),
            'koefisien_variasi' => round($cv, 4),
            'rating_stabilitas' => $this->getStabilityRating($cv),
            'skor_efisiensi_energi' => $this->calculateEfficiencyScore($data),
            'faktor_beban' => $this->calculateLoadFactor($powerReadings),
            'faktor_permintaan' => $this->calculateDemandFactor($powerReadings)
        ];
    }

    /**
     * Buat rekomendasi yang dapat ditindaklanjuti
     */
    public function getRecommendations(Collection $data): array
    {
        $metrics = $this->getEfficiencyMetrics($data);
        $patterns = $this->getSeasonalTrends($data);
        $recommendations = [];

        // Rekomendasi efisiensi energi
        if ($metrics['koefisien_variasi'] > 0.3) {
            $recommendations[] = [
                'tipe' => 'efisiensi',
                'prioritas' => 'tinggi',
                'judul' => 'Variabilitas Daya Tinggi Terdeteksi',
                'deskripsi' => 'Konsumsi daya Anda menunjukkan variabilitas tinggi. Pertimbangkan menerapkan strategi penyeimbangan beban.',
                'tindakan' => 'Pasang sistem manajemen beban otomatis atau tinjau jadwal peralatan.'
            ];
        }

        // Rekomendasi jam puncak
        $peakHours = $patterns['jam_puncak'] ?? [];
        if (count($peakHours) > 0) {
            $recommendations[] = [
                'tipe' => 'optimasi_biaya',
                'prioritas' => 'sedang',
                'judul' => 'Optimasi Penggunaan Jam Puncak',
                'deskripsi' => 'Konsumsi puncak terdeteksi selama jam: ' . implode(', ', $peakHours),
                'tindakan' => 'Pindahkan beban non-kritis ke jam off-peak untuk mengurangi biaya listrik.'
            ];
        }

        // Rekomendasi faktor beban
        if (($metrics['faktor_beban'] ?? 0) < 0.6) {
            $recommendations[] = [
                'tipe' => 'kapasitas',
                'prioritas' => 'sedang',
                'judul' => 'Faktor Beban Rendah',
                'deskripsi' => 'Sistem listrik Anda kurang dimanfaatkan. Faktor beban saat ini: ' . round($metrics['faktor_beban'] * 100, 1) . '%',
                'tindakan' => 'Pertimbangkan penyeimbangan beban atau konsolidasi peralatan untuk meningkatkan efisiensi.'
            ];
        }

        return $recommendations;
    }

    /**
     * Metode pembantu privat
     */
    private function getHistoricalData($location = null, $days = 7): Collection
    {
        $query = HistoryKwh::where('timestamp', '>=', Carbon::now()->subDays($days))
            ->orderBy('timestamp', 'asc');

        if ($location) {
            $query->where('location', $location);
        }

        return $query->get();
    }

    private function getCurrentStats(Collection $data): array
    {
        $latest = $data->last();
        $powerData = $data->pluck('daya')->filter();
        if ($powerData->isEmpty()) {
            $powerData = $data->pluck('power')->filter();
        }

        return [
            'daya_saat_ini' => $latest->daya ?? $latest->power ?? 0,
            'tegangan_saat_ini' => $latest->tegangan ?? $latest->voltage ?? 0,
            'arus_saat_ini' => $latest->arus ?? $latest->current ?? 0,
            'daya_rata_rata_24jam' => round($powerData->avg(), 2),
            'daya_maksimal_24jam' => round($powerData->max(), 2),
            'daya_minimal_24jam' => round($powerData->min(), 2),
            'total_energi_24jam' => round($powerData->sum() / 1000, 2), // Konversi ke kWh
            'terakhir_diperbarui' => $latest->timestamp ?? $latest->created_at
        ];
    }

    private function getTrendAnalysis(Collection $data): array
    {
        $recent = $data->take(-24); // 24 jam terakhir
        $previous = $data->take(-48)->skip(-24); // 24 jam sebelumnya

        $recentAvg = $recent->avg('daya') ?? $recent->avg('power') ?? 0;
        $previousAvg = $previous->avg('daya') ?? $previous->avg('power') ?? 0;

        $trendDirection = $recentAvg > $previousAvg ? 'meningkat' : 'menurun';
        $trendPercentage = $previousAvg > 0 ? (($recentAvg - $previousAvg) / $previousAvg) * 100 : 0;

        return [
            'arah' => $trendDirection,
            'persentase_perubahan' => round($trendPercentage, 2),
            'stabil' => abs($trendPercentage) < 5,
            'rata_rata_terkini' => round($recentAvg, 2),
            'rata_rata_sebelumnya' => round($previousAvg, 2)
        ];
    }

    private function getPredictions(Collection $data): array
    {
        $linearPrediction = $this->linearRegressionPrediction($data, 24);
        $seasonalPrediction = $this->getSeasonalTrends($data);

        return [
            'regresi_linear' => $linearPrediction,
            'prakiraan_musiman' => $seasonalPrediction,
            'tingkat_kepercayaan' => $this->calculateOverallConfidence($data)
        ];
    }

    private function getLoadPatterns(Collection $data): array
    {
        return [
            'jam_kerja' => $this->getBusinessHoursPattern($data),
            'jam_non_kerja' => $this->getOffHoursPattern($data),
            'pola_akhir_pekan' => $this->getWeekendPattern($data),
            'variasi_musiman' => $this->getSeasonalVariation($data)
        ];
    }

    private function getHourlyLoadFactor(int $hour): float
    {
        // Pola beban industri berdasarkan operasi bisnis tipikal
        $patterns = [
            0 => 0.3,   // 00:00 - Malam
            1 => 0.25,  // 01:00 - Dini hari
            2 => 0.2,   // 02:00 - Dini hari
            3 => 0.2,   // 03:00 - Dini hari
            4 => 0.25,  // 04:00 - Subuh
            5 => 0.4,   // 05:00 - Pagi
            6 => 0.6,   // 06:00 - Pagi
            7 => 0.8,   // 07:00 - Pagi
            8 => 0.95,  // 08:00 - Jam kerja mulai
            9 => 1.0,   // 09:00 - Puncak pagi
            10 => 0.95, // 10:00 - Operasional penuh
            11 => 0.9,  // 11:00 - Sebelum makan siang
            12 => 0.85, // 12:00 - Istirahat makan siang
            13 => 0.9,  // 13:00 - Setelah makan siang
            14 => 1.0,  // 14:00 - Puncak siang
            15 => 0.95, // 15:00 - Sore aktif
            16 => 0.9,  // 16:00 - Sore
            17 => 0.8,  // 17:00 - Jam pulang kerja
            18 => 0.6,  // 18:00 - Malam (AC, keamanan)
            19 => 0.4,  // 19:00 - Malam
            20 => 0.35, // 20:00 - Malam
            21 => 0.3,  // 21:00 - Malam
            22 => 0.28, // 22:00 - Malam
            23 => 0.25  // 23:00 - Malam
        ];

        return $patterns[$hour] ?? 0.5;
    }

    private function getDailyLoadFactor(int $dayOfWeek): float
    {
        // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
        $patterns = [
            0 => 0.3, // Minggu
            1 => 1.0, // Senin
            2 => 1.0, // Selasa
            3 => 1.0, // Rabu
            4 => 1.0, // Kamis
            5 => 0.9, // Jumat
            6 => 0.4  // Sabtu
        ];

        return $patterns[$dayOfWeek] ?? 0.8;
    }

    private function calculateConfidence(float $rSquared, int $hoursAhead): float
    {
        $baseConfidence = $rSquared * 100;
        $decayFactor = 1 - ($hoursAhead * 0.02); // Kepercayaan menurun seiring waktu
        return max(0, min(100, $baseConfidence * $decayFactor));
    }

    private function getAccuracyLevel(float $rSquared): string
    {
        if ($rSquared >= 0.9) return 'Sangat Baik';
        if ($rSquared >= 0.8) return 'Baik';
        if ($rSquared >= 0.7) return 'Cukup';
        if ($rSquared >= 0.5) return 'Buruk';
        return 'Sangat Buruk';
    }

    private function calculateStandardDeviation(Collection $data, float $mean): float
    {
        $variance = $data->map(fn($value) => pow($value - $mean, 2))->avg();
        return sqrt($variance);
    }

    private function getStabilityRating(float $cv): string
    {
        if ($cv <= 0.1) return 'Sangat Stabil';
        if ($cv <= 0.2) return 'Stabil';
        if ($cv <= 0.3) return 'Sedang';
        if ($cv <= 0.5) return 'Bervariasi';
        return 'Sangat Bervariasi';
    }

    private function calculateEfficiencyScore(Collection $data): float
    {
        // Skor efisiensi yang disederhanakan berdasarkan konsistensi beban dan faktor daya
        $powerData = $data->pluck('daya')->filter();
        if ($powerData->isEmpty()) {
            $powerData = $data->pluck('power')->filter();
        }

        if ($powerData->isEmpty()) return 0;

        $mean = $powerData->avg();
        $std = $this->calculateStandardDeviation($powerData, $mean);
        $cv = $std / $mean;

        // Skor dari 0-100, CV lebih rendah = efisiensi lebih tinggi
        return max(0, min(100, (1 - $cv) * 100));
    }

    private function calculateLoadFactor(Collection $powerData): float
    {
        if ($powerData->isEmpty()) return 0;

        $avgLoad = $powerData->avg();
        $maxLoad = $powerData->max();

        return $maxLoad > 0 ? $avgLoad / $maxLoad : 0;
    }

    private function calculateDemandFactor(Collection $powerData): float
    {
        if ($powerData->isEmpty()) return 0;

        $maxDemand = $powerData->max();
        $connectedLoad = $maxDemand * 1.2; // Asumsi margin keamanan 20%

        return $connectedLoad > 0 ? $maxDemand / $connectedLoad : 0;
    }

    private function findPeakHours(Collection $hourlyAverages): array
    {
        $threshold = $hourlyAverages->avg() * 1.2; // 20% di atas rata-rata
        return $hourlyAverages->filter(fn($avg) => $avg > $threshold)->keys()->toArray();
    }

    private function findLowConsumptionHours(Collection $hourlyAverages): array
    {
        $threshold = $hourlyAverages->avg() * 0.5; // 50% di bawah rata-rata
        return $hourlyAverages->filter(fn($avg) => $avg < $threshold)->keys()->toArray();
    }

    private function compareWeekendWeekday(Collection $data): array
    {
        $weekday = $data->filter(function ($item) {
            $day = Carbon::parse($item->timestamp ?? $item->created_at)->dayOfWeek;
            return $day >= 1 && $day <= 5; // Senin sampai Jumat
        });

        $weekend = $data->filter(function ($item) {
            $day = Carbon::parse($item->timestamp ?? $item->created_at)->dayOfWeek;
            return $day == 0 || $day == 6; // Minggu atau Sabtu
        });

        $weekdayAvg = $weekday->avg('daya') ?? $weekday->avg('power') ?? 0;
        $weekendAvg = $weekend->avg('daya') ?? $weekend->avg('power') ?? 0;

        return [
            'rata_rata_hari_kerja' => round($weekdayAvg, 2),
            'rata_rata_akhir_pekan' => round($weekendAvg, 2),
            'persentase_pengurangan_akhir_pekan' => $weekdayAvg > 0 ? round((1 - $weekendAvg / $weekdayAvg) * 100, 2) : 0
        ];
    }

    private function getBusinessHoursPattern(Collection $data): array
    {
        $businessHours = $data->filter(function ($item) {
            $hour = Carbon::parse($item->timestamp ?? $item->created_at)->hour;
            return $hour >= 8 && $hour <= 17; // 8 pagi sampai 5 sore
        });

        return [
            'rata_rata_daya' => round($businessHours->avg('daya') ?? $businessHours->avg('power') ?? 0, 2),
            'daya_puncak' => round($businessHours->max('daya') ?? $businessHours->max('power') ?? 0, 2),
            'rentang_jam' => '08:00 - 17:00'
        ];
    }

    private function getOffHoursPattern(Collection $data): array
    {
        $offHours = $data->filter(function ($item) {
            $hour = Carbon::parse($item->timestamp ?? $item->created_at)->hour;
            return $hour < 8 || $hour > 17;
        });

        return [
            'rata_rata_daya' => round($offHours->avg('daya') ?? $offHours->avg('power') ?? 0, 2),
            'daya_puncak' => round($offHours->max('daya') ?? $offHours->max('power') ?? 0, 2),
            'rentang_jam' => '18:00 - 07:59'
        ];
    }

    private function getWeekendPattern(Collection $data): array
    {
        $weekend = $data->filter(function ($item) {
            $day = Carbon::parse($item->timestamp ?? $item->created_at)->dayOfWeek;
            return $day == 0 || $day == 6;
        });

        return [
            'rata_rata_daya' => round($weekend->avg('daya') ?? $weekend->avg('power') ?? 0, 2),
            'daya_puncak' => round($weekend->max('daya') ?? $weekend->max('power') ?? 0, 2),
            'ukuran_sampel' => $weekend->count()
        ];
    }

    private function getSeasonalVariation(Collection $data): array
    {
        // Untuk saat ini, variasi bulanan yang disederhanakan
        $monthly = $data->groupBy(function ($item) {
            return Carbon::parse($item->timestamp ?? $item->created_at)->month;
        })->map(function ($group) {
            return round($group->avg('daya') ?? $group->avg('power') ?? 0, 2);
        });

        return [
            'rata_rata_bulanan' => $monthly->toArray(),
            'bulan_tertinggi' => $monthly->keys()->first(),
            'bulan_terendah' => $monthly->keys()->last()
        ];
    }

    private function calculateOverallConfidence(Collection $data): float
    {
        $dataQuality = min(100, ($data->count() / $this->maxDataPoints) * 100);
        $consistency = $this->getEfficiencyMetrics($data)['energy_efficiency_score'] ?? 50;

        return round(($dataQuality + $consistency) / 2, 2);
    }

    private function getEmptyAnalysis(): array
    {
        return [
            'error' => 'Data tidak cukup untuk analisis',
            'message' => 'Membutuhkan setidaknya ' . $this->minDataPoints . ' titik data untuk analisis yang handal',
            'recommendations' => [
                [
                    'type' => 'pengumpulan_data',
                    'priority' => 'tinggi',
                    'title' => 'Data Tidak Cukup',
                    'description' => 'Tidak ada cukup data historis untuk analisis yang akurat',
                    'action' => 'Lanjutkan pengumpulan data setidaknya selama 7 hari untuk mengaktifkan prediksi'
                ]
            ]
        ];
    }
}
