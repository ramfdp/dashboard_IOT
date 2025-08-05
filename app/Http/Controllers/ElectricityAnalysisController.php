<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ElectricityPredictionService;
use App\Models\HistoryKwh;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ElectricityAnalysisController extends Controller
{
    protected $predictionService;

    public function __construct(ElectricityPredictionService $predictionService)
    {
        $this->predictionService = $predictionService;
    }

    /**
     * Get comprehensive electricity usage analysis
     */
    public function getUsageAnalysis(Request $request)
    {
        try {
            $location = $request->get('location');
            $days = $request->get('days', 7);
            $algorithm = $request->get('algorithm', 'linear_regression');

            $analysis = $this->predictionService->getUsageAnalysis($location, $days);

            return response()->json([
                'success' => true,
                'data' => $analysis,
                'meta' => [
                    'lokasi' => $location,
                    'hari_dianalisis' => $days,
                    'waktu_analisis' => now(),
                    'algoritma_digunakan' => $algorithm
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Kesalahan dalam analisis listrik: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Analisis gagal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get predictions using linear regression
     */
    public function getPredictions(Request $request)
    {
        try {
            $request->validate([
                'location' => 'nullable|string',
                'hours_ahead' => 'integer|min:1|max:168',
                'algorithm' => 'string|in:linear_regression,seasonal,ensemble'
            ]);

            $location = $request->get('location');
            $hoursAhead = $request->get('hours_ahead', 24);
            $algorithm = $request->get('algorithm', 'linear_regression');

            // Get historical data
            $data = $this->getHistoricalData($location, 7);

            if ($data->count() < 5) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data tidak cukup untuk prediksi. Membutuhkan setidaknya 5 titik data.',
                    'titik_data_tersedia' => $data->count()
                ], 400);
            }

            // Generate predictions based on algorithm
            $predictions = match ($algorithm) {
                'linear_regression' => $this->predictionService->linearRegressionPrediction($data, $hoursAhead),
                'seasonal' => $this->predictionService->getSeasonalTrends($data),
                'ensemble' => $this->getEnsemblePrediction($data, $hoursAhead),
                default => $this->predictionService->linearRegressionPrediction($data, $hoursAhead)
            };

            return response()->json([
                'success' => true,
                'algorithm' => $algorithm,
                'prediksi' => $predictions,
                'meta' => [
                    'titik_data_digunakan' => $data->count(),
                    'horizon_prediksi' => $hoursAhead,
                    'dibuat_pada' => now()
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Kesalahan dalam membuat prediksi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Prediksi gagal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get real-time efficiency metrics
     */
    public function getEfficiencyMetrics(Request $request)
    {
        try {
            $location = $request->get('location');
            $period = $request->get('period', 'day'); // day, week, month

            $data = $this->getHistoricalDataByPeriod($location, $period);

            if ($data->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No data available for efficiency analysis'
                ], 404);
            }

            $metrics = $this->predictionService->getEfficiencyMetrics($data);

            return response()->json([
                'success' => true,
                'efficiency_metrics' => $metrics,
                'period_analyzed' => $period,
                'data_points' => $data->count(),
                'analysis_date' => now()
            ]);
        } catch (\Exception $e) {
            Log::error('Error calculating efficiency metrics: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Efficiency analysis failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get load patterns analysis
     */
    public function getLoadPatterns(Request $request)
    {
        try {
            $location = $request->get('location');
            $days = $request->get('days', 14);

            $data = $this->getHistoricalData($location, $days);

            if ($data->count() < 24) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient data for load pattern analysis. Need at least 24 hours of data.'
                ], 400);
            }

            $patterns = $this->analyzeLoadPatterns($data);

            return response()->json([
                'success' => true,
                'load_patterns' => $patterns,
                'analysis_period' => $days . ' days',
                'data_points' => $data->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Error analyzing load patterns: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Load pattern analysis failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get optimization recommendations
     */
    public function getRecommendations(Request $request)
    {
        try {
            $location = $request->get('location');
            $data = $this->getHistoricalData($location, 7);

            $recommendations = $this->predictionService->getRecommendations($data);

            return response()->json([
                'success' => true,
                'recommendations' => $recommendations,
                'generated_at' => now(),
                'based_on_data_points' => $data->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Error generating recommendations: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Recommendation generation failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Compare multiple prediction algorithms
     */
    public function compareAlgorithms(Request $request)
    {
        try {
            $location = $request->get('location');
            $hoursAhead = $request->get('hours_ahead', 24);

            $data = $this->getHistoricalData($location, 7);

            if ($data->count() < 10) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient data for algorithm comparison'
                ], 400);
            }

            $algorithms = [
                'linear_regression' => $this->predictionService->linearRegressionPrediction($data, $hoursAhead),
                'seasonal_trends' => $this->predictionService->getSeasonalTrends($data),
                'efficiency_metrics' => $this->predictionService->getEfficiencyMetrics($data)
            ];

            // Calculate performance metrics for each algorithm
            $comparison = [];
            foreach ($algorithms as $name => $result) {
                if (!isset($result['error'])) {
                    $comparison[$name] = [
                        'algorithm' => $name,
                        'result' => $result,
                        'confidence' => $this->calculateAlgorithmConfidence($result),
                        'accuracy_score' => $this->calculateAccuracyScore($result)
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'algorithm_comparison' => $comparison,
                'best_algorithm' => $this->getBestAlgorithm($comparison),
                'data_points_used' => $data->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Error comparing algorithms: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Algorithm comparison failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export detailed analysis report
     */
    public function exportAnalysisReport(Request $request)
    {
        try {
            $location = $request->get('location');
            $format = $request->get('format', 'json');

            $fullAnalysis = $this->predictionService->getUsageAnalysis($location, 30);

            switch ($format) {
                case 'csv':
                    return $this->exportToCsv($fullAnalysis);
                case 'pdf':
                    return $this->exportToPdf($fullAnalysis);
                default:
                    return response()->json([
                        'success' => true,
                        'report' => $fullAnalysis,
                        'format' => 'json',
                        'generated_at' => now()
                    ]);
            }
        } catch (\Exception $e) {
            Log::error('Error exporting analysis report: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Report export failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Private helper methods
     */
    private function getHistoricalData($location = null, $days = 7)
    {
        $query = HistoryKwh::where('timestamp', '>=', Carbon::now()->subDays($days))
            ->orderBy('timestamp', 'asc');

        if ($location) {
            $query->where('location', $location);
        }

        return $query->get();
    }

    private function getHistoricalDataByPeriod($location = null, $period = 'day')
    {
        $startDate = match ($period) {
            'day' => Carbon::now()->subDay(),
            'week' => Carbon::now()->subWeek(),
            'month' => Carbon::now()->subMonth(),
            default => Carbon::now()->subDay()
        };

        $query = HistoryKwh::where('timestamp', '>=', $startDate)
            ->orderBy('timestamp', 'asc');

        if ($location) {
            $query->where('location', $location);
        }

        return $query->get();
    }

    private function getEnsemblePrediction($data, $hoursAhead)
    {
        // Combine multiple prediction methods
        $linearResult = $this->predictionService->linearRegressionPrediction($data, $hoursAhead);
        $seasonalResult = $this->predictionService->getSeasonalTrends($data);

        // Weight the predictions based on their confidence
        $ensemble = [
            'algorithm' => 'Ensemble (Linear + Seasonal)',
            'components' => [
                'linear_regression' => $linearResult,
                'seasonal_trends' => $seasonalResult
            ],
            'combined_prediction' => $this->combineAlgorithmResults($linearResult, $seasonalResult),
            'confidence' => $this->calculateEnsembleConfidence($linearResult, $seasonalResult)
        ];

        return $ensemble;
    }

    private function analyzeLoadPatterns($data)
    {
        $hourlyPatterns = $data->groupBy(function ($item) {
            return Carbon::parse($item->timestamp)->hour;
        })->map(function ($group) {
            return [
                'average_power' => round($group->avg('daya') ?? $group->avg('power') ?? 0, 2),
                'max_power' => round($group->max('daya') ?? $group->max('power') ?? 0, 2),
                'min_power' => round($group->min('daya') ?? $group->min('power') ?? 0, 2),
                'data_points' => $group->count()
            ];
        });

        $dailyPatterns = $data->groupBy(function ($item) {
            return Carbon::parse($item->timestamp)->dayOfWeek;
        })->map(function ($group) {
            return [
                'average_power' => round($group->avg('daya') ?? $group->avg('power') ?? 0, 2),
                'peak_power' => round($group->max('daya') ?? $group->max('power') ?? 0, 2),
                'data_points' => $group->count()
            ];
        });

        return [
            'hourly_patterns' => $hourlyPatterns,
            'daily_patterns' => $dailyPatterns,
            'peak_hours' => $this->findPeakHours($hourlyPatterns),
            'off_peak_hours' => $this->findOffPeakHours($hourlyPatterns),
            'weekday_vs_weekend' => $this->compareWeekdayWeekend($data)
        ];
    }

    private function findPeakHours($hourlyPatterns)
    {
        $averagePower = collect($hourlyPatterns)->avg('average_power');
        $threshold = $averagePower * 1.2; // 20% above average

        return collect($hourlyPatterns)
            ->filter(fn($pattern) => $pattern['average_power'] > $threshold)
            ->keys()
            ->toArray();
    }

    private function findOffPeakHours($hourlyPatterns)
    {
        $averagePower = collect($hourlyPatterns)->avg('average_power');
        $threshold = $averagePower * 0.7; 

        return collect($hourlyPatterns)
            ->filter(fn($pattern) => $pattern['average_power'] < $threshold)
            ->keys()
            ->toArray();
    }

    private function compareWeekdayWeekend($data)
    {
        $weekdays = $data->filter(function ($item) {
            $day = Carbon::parse($item->timestamp)->dayOfWeek;
            return $day >= 1 && $day <= 5;
        });

        $weekends = $data->filter(function ($item) {
            $day = Carbon::parse($item->timestamp)->dayOfWeek;
            return $day == 0 || $day == 6;
        });

        return [
            'weekday_average' => round($weekdays->avg('daya') ?? $weekdays->avg('power') ?? 0, 2),
            'weekend_average' => round($weekends->avg('daya') ?? $weekends->avg('power') ?? 0, 2),
            'efficiency_difference' => $this->calculateEfficiencyDifference($weekdays, $weekends)
        ];
    }

    private function calculateAlgorithmConfidence($result)
    {
        if (isset($result['r_squared'])) {
            return $result['r_squared'] * 100;
        }

        if (isset($result['accuracy_level'])) {
            return match ($result['accuracy_level']) {
                'Excellent' => 95,
                'Good' => 80,
                'Fair' => 65,
                'Poor' => 40,
                default => 30
            };
        }

        return 50; // Default confidence
    }

    private function calculateAccuracyScore($result)
    {
        // Simplified accuracy scoring based on available metrics
        $score = 50; // Base score

        if (isset($result['r_squared'])) {
            $score = $result['r_squared'] * 100;
        }

        if (isset($result['coefficient_of_variation'])) {
            // Lower CV = higher accuracy
            $cvScore = max(0, 100 - ($result['coefficient_of_variation'] * 100));
            $score = ($score + $cvScore) / 2;
        }

        return round($score, 2);
    }

    private function getBestAlgorithm($comparison)
    {
        if (empty($comparison)) {
            return null;
        }

        $best = collect($comparison)->sortByDesc('accuracy_score')->first();

        return [
            'algorithm' => $best['algorithm'],
            'accuracy_score' => $best['accuracy_score'],
            'confidence' => $best['confidence']
        ];
    }

    private function combineAlgorithmResults($linear, $seasonal)
    {
        // Simple ensemble: weighted average based on confidence
        $linearWeight = $linear['r_squared'] ?? 0.5;
        $seasonalWeight = 0.5;

        $totalWeight = $linearWeight + $seasonalWeight;

        if ($totalWeight == 0) {
            return ['error' => 'Cannot combine results'];
        }

        return [
            'combined_confidence' => ($linearWeight + $seasonalWeight) / 2,
            'prediction_method' => 'Weighted ensemble of linear regression and seasonal analysis',
            'weights' => [
                'linear_regression' => $linearWeight / $totalWeight,
                'seasonal_trends' => $seasonalWeight / $totalWeight
            ]
        ];
    }

    private function calculateEnsembleConfidence($linear, $seasonal)
    {
        $linearConf = $linear['r_squared'] ?? 0;
        $seasonalConf = 0.7; // Estimated seasonal confidence

        return ($linearConf + $seasonalConf) / 2;
    }

    private function calculateEfficiencyDifference($weekdays, $weekends)
    {
        $weekdayAvg = $weekdays->avg('daya') ?? $weekdays->avg('power') ?? 0;
        $weekendAvg = $weekends->avg('daya') ?? $weekends->avg('power') ?? 0;

        if ($weekdayAvg == 0) return 0;

        return round((($weekdayAvg - $weekendAvg) / $weekdayAvg) * 100, 2);
    }

    private function exportToCsv($data)
    {
        // Implement CSV export logic
        $filename = 'electricity_analysis_' . now()->format('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"'
        ];

        // Convert data to CSV format
        $csvData = $this->convertToCSV($data);

        return response($csvData, 200, $headers);
    }

    private function exportToPdf($data)
    {
        // Implement PDF export logic (would require a PDF library like DomPDF)
        return response()->json([
            'message' => 'PDF export not yet implemented',
            'alternative' => 'Use JSON or CSV format for now'
        ]);
    }

    private function convertToCSV($data)
    {
        // Simple CSV conversion - you can enhance this
        $csv = "Analysis Type,Value,Unit,Timestamp\n";

        if (isset($data['current_stats'])) {
            foreach ($data['current_stats'] as $key => $value) {
                $csv .= "$key,$value,Various," . now() . "\n";
            }
        }

        return $csv;
    }
}
