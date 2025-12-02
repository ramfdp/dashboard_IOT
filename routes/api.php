<?php

use App\Http\Controllers\SensorController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PowerUsageController;
use App\Http\Controllers\ListrikController;
use App\Http\Controllers\ElectricityAnalysisController;
use App\Http\Controllers\ElectricityDataController;
use App\Http\Controllers\Api\ElectricityDataController as ApiElectricityDataController;
use App\Http\Controllers\ProxyController;


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

// Proxy untuk bypass CORS - fetch data dari API eksternal
Route::get('/proxy/rama-json', [ProxyController::class, 'getRamaJson']);

Route::get('/power-usage', [PowerUsageController::class, 'getPowerUsage']);
Route::get('/listrik', [ListrikController::class, 'index']);
Route::post('/listrik', [ListrikController::class, 'store']);
Route::get('/listrik/chart-data/today', [ListrikController::class, 'getTodayChartData']);
Route::get('/listrik/{id}', [ListrikController::class, 'show']);
Route::put('/listrik/{id}', [ListrikController::class, 'update']);
Route::delete('/listrik/{id}', [ListrikController::class, 'destroy']);

// Schedule checking routes
Route::post('/check-schedules', [\App\Http\Controllers\DashboardController::class, 'checkSchedules']);
Route::get('/test/schedule-check', [\App\Http\Controllers\DashboardController::class, 'checkSchedules']);

// Schedule management routes
Route::prefix('schedules')->group(function () {
    Route::get('/', [\App\Http\Controllers\DashboardController::class, 'getAllSchedules']);
    Route::get('/current', [\App\Http\Controllers\DashboardController::class, 'getCurrentSchedule']);
    Route::get('/status', [\App\Http\Controllers\DashboardController::class, 'getScheduleStatus']);
    Route::post('/', [\App\Http\Controllers\DashboardController::class, 'storeSchedule']);
    Route::put('/{schedule}', [\App\Http\Controllers\DashboardController::class, 'updateSchedule']);
    Route::delete('/{schedule}', [\App\Http\Controllers\DashboardController::class, 'destroySchedule']);
    Route::patch('/{schedule}/toggle', [\App\Http\Controllers\DashboardController::class, 'toggleSchedule']);
});

// Mode control routes
Route::prefix('mode')->group(function () {
    Route::get('/current', [\App\Http\Controllers\DashboardController::class, 'getCurrentMode']);
    Route::post('/auto', [\App\Http\Controllers\DashboardController::class, 'setAutoMode']);
    Route::post('/manual', [\App\Http\Controllers\DashboardController::class, 'setManualMode']);
    Route::post('/set-auto', [\App\Http\Controllers\DashboardController::class, 'setAuto']); // alias
});

// Dashboard API routes
Route::prefix('dashboard')->group(function () {
    Route::post('/update', [\App\Http\Controllers\DashboardController::class, 'update']);
    Route::post('/control-relay', [\App\Http\Controllers\DashboardController::class, 'controlRelay']);
    Route::get('/sensor-data', [\App\Http\Controllers\DashboardController::class, 'getSensorData']);
    Route::get('/relay-states', [\App\Http\Controllers\DashboardController::class, 'getRelayStates']);
});

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
    Route::get('/current-usage', [ElectricityDataController::class, 'getCurrentUsage']);
    Route::get('/usage-by-period', [ElectricityDataController::class, 'getUsageByPeriod']);
});


Route::post('/real-time-power', [App\Http\Controllers\RealTimePowerController::class, 'store']);
Route::get('/real-time-power/latest', [App\Http\Controllers\RealTimePowerController::class, 'getLatest']);


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
    Route::get('/monthly-kwh-data', [ApiElectricityDataController::class, 'getMonthlyKwhData']);
    Route::get('/monthly-kwh-consumption', [ApiElectricityDataController::class, 'getMonthlyKwhConsumption']);
    Route::get('/hourly-consumption', [ApiElectricityDataController::class, 'getHourlyConsumption']);
    Route::get('/daily-summary', [ApiElectricityDataController::class, 'getDailySummary']);
});

// User Management API Routes
Route::prefix('users')->group(function () {
    Route::get('/', [App\Http\Controllers\Api\UserController::class, 'index']);
    Route::post('/', [App\Http\Controllers\Api\UserController::class, 'store']);
    Route::get('/statistics', [App\Http\Controllers\Api\UserController::class, 'statistics']);
    Route::get('/{id}', [App\Http\Controllers\Api\UserController::class, 'show']);
    Route::put('/{id}', [App\Http\Controllers\Api\UserController::class, 'update']);
    Route::delete('/{id}', [App\Http\Controllers\Api\UserController::class, 'destroy']);
});

// Additional Sensor API Routes (completing existing sensor routes)
Route::prefix('sensors')->group(function () {
    Route::get('/', [SensorController::class, 'index']);
    Route::get('/summary', [SensorController::class, 'summary']);
});
