<?php

use App\Http\Controllers\SensorController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PowerUsageController;
use App\Http\Controllers\ListrikController;
use App\Http\Controllers\HistoryKwhController;
use App\Http\Controllers\ElectricityAnalysisController;
use App\Http\Controllers\ElectricityDataController;
use App\Http\Controllers\Api\ElectricityDataController as ApiElectricityDataController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/sensor', [SensorController::class, 'store']);
Route::get('/sensor/latest', [SensorController::class, 'latest']);
Route::get('/power-usage', [PowerUsageController::class, 'getPowerUsage']);
Route::get('/listrik', [ListrikController::class, 'index']);
Route::post('/listrik', [ListrikController::class, 'store']);
Route::get('/listrik/{id}', [ListrikController::class, 'show']);
Route::put('/listrik/{id}', [ListrikController::class, 'update']);
Route::delete('/listrik/{id}', [ListrikController::class, 'destroy']);
Route::get('/fetch-store-pzem', [HistoryKwhController::class, 'fetchFromFirebase']);

// History data routes untuk dashboard
Route::prefix('history')->group(function () {
    Route::get('/filtered', [HistoryKwhController::class, 'getFilteredHistory']);
    Route::get('/download', [HistoryKwhController::class, 'getAllHistoryForDownload']);
});

// Schedule checking routes
Route::post('/check-schedules', [\App\Http\Controllers\DashboardController::class, 'checkSchedules']);
Route::get('/test/schedule-check', [\App\Http\Controllers\DashboardController::class, 'checkSchedules']);

// Advanced Electricity Analysis Routes
Route::prefix('electricity')->group(function () {
    Route::get('/analysis', [ElectricityAnalysisController::class, 'getUsageAnalysis']);
    Route::get('/predictions', [ElectricityAnalysisController::class, 'getPredictions']);
    Route::get('/efficiency', [ElectricityAnalysisController::class, 'getEfficiencyMetrics']);
    Route::get('/load-patterns', [ElectricityAnalysisController::class, 'getLoadPatterns']);
    Route::get('/recommendations', [ElectricityAnalysisController::class, 'getRecommendations']);
    Route::get('/compare-algorithms', [ElectricityAnalysisController::class, 'compareAlgorithms']);
    Route::get('/export-report', [ElectricityAnalysisController::class, 'exportAnalysisReport']);

    // Real database data endpoints
    Route::get('/data/{period}', [ElectricityDataController::class, 'getDataByPeriod']);
    Route::get('/data', [ElectricityDataController::class, 'getDataByPeriod']);
});

// Real-time Power API for auto-generated data
Route::post('/real-time-power', [App\Http\Controllers\RealTimePowerController::class, 'store']);
Route::get('/real-time-power/latest', [App\Http\Controllers\RealTimePowerController::class, 'getLatest']);

// Real-time Power Generation Routes for PT Krakatau Sarana Property
Route::prefix('realtime-power')->group(function () {
    Route::post('/store', [App\Http\Controllers\RealTimePowerController::class, 'store']);
    Route::get('/latest', [App\Http\Controllers\RealTimePowerController::class, 'getLatest']);
    Route::get('/range', [App\Http\Controllers\RealTimePowerController::class, 'getDataRange']);
    Route::get('/krakatau-stats', [App\Http\Controllers\RealTimePowerController::class, 'getKrakatauStats']);
    Route::post('/reset-energy', [App\Http\Controllers\RealTimePowerController::class, 'resetEnergyCounter']);
});

// PLN Tariff Calculator API Routes
Route::prefix('pln')->group(function () {
    Route::get('/latest-kwh-data', [ApiElectricityDataController::class, 'getLatestKwhData']);
    Route::get('/monthly-kwh-consumption', [ApiElectricityDataController::class, 'getMonthlyKwhConsumption']);
    Route::get('/hourly-consumption', [ApiElectricityDataController::class, 'getHourlyConsumption']);
    Route::get('/daily-summary', [ApiElectricityDataController::class, 'getDailySummary']);
});
