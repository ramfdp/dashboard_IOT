<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SensorController;
use App\Http\Controllers\HistoryKwhController;
use App\Http\Controllers\ListrikController;
use App\Http\Controllers\OvertimeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\RelayController;
use App\Http\Controllers\CCTVController;
use App\Http\Controllers\MainController;


Route::get('/', function () {
    return redirect('/login/v3');
});
Route::get('/dashboard/v1', [DashboardController::class, 'index'])
    ->middleware('auth') // Changed from 'role:admin|user' to simple 'auth'
    ->name('dashboard-v1');

Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
Route::post('/dashboard/update', [DashboardController::class, 'update'])->name('dashboard.update');
Route::post('/dashboard/auto-mode', [DashboardController::class, 'setAutoMode'])->name('dashboard.auto-mode');
Route::post('/dashboard/manual-mode', [DashboardController::class, 'setManualMode'])->name('dashboard.manual-mode');

// Light schedule routes
Route::post('/dashboard/schedule', [DashboardController::class, 'storeSchedule'])->name('dashboard.schedule.store');
Route::put('/dashboard/schedule/{schedule}', [DashboardController::class, 'updateSchedule'])->name('dashboard.schedule.update');
Route::delete('/dashboard/schedule/{schedule}', [DashboardController::class, 'destroySchedule'])->name('dashboard.schedule.destroy');
Route::patch('/dashboard/schedule/{schedule}/toggle', [DashboardController::class, 'toggleSchedule'])->name('dashboard.schedule.toggle');
Route::get('/sensor/data', [SensorController::class, 'index']);

Route::get('/sensor/summary', [SensorController::class, 'summary']);

Route::middleware('auth')->prefix('relay')->name('relay.')->group(function () {
    Route::get('/', [RelayController::class, 'index'])->name('index');
    Route::post('/update', [RelayController::class, 'update'])->name('update');
});

Route::middleware('auth')->prefix('cctv')->name('cctv.')->group(function () {

    Route::get('/', [CCTVController::class, 'index'])->name('dashboard');

    // Camera management
    Route::get('/camera/{id}', [CCTVController::class, 'show'])->name('camera.show');
    Route::put('/camera/{id}', [CCTVController::class, 'update'])->name('camera.update');

    // API endpoints for AJAX calls
    Route::post('/check-status', [CCTVController::class, 'checkStatus'])->name('check.status');
    Route::get('/all-status', [CCTVController::class, 'getAllStatus'])->name('all.status');
    Route::post('/refresh', [CCTVController::class, 'refresh'])->name('refresh');
    Route::get('/stats', [CCTVController::class, 'getStats'])->name('stats');
    Route::post('/test-connection', [CCTVController::class, 'testConnection'])->name('test.connection');
});

Route::middleware(['auth', 'admin'])->prefix('users')->name('users.')->group(function () {
    Route::get('/', [UserController::class, 'index'])->name('index');
    Route::post('/', [UserController::class, 'store'])->name('store');
    Route::put('/{id}', [UserController::class, 'update'])->name('update');
    Route::resource('/', UserController::class)->except(['index', 'store', 'update']);
});

// Management User Routes
Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/management-user', [UserManagementController::class, 'index'])->name('management-user');
    Route::post('/management-user', [UserManagementController::class, 'store'])->name('management-user.store');
    Route::put('/management-user/{id}', [UserManagementController::class, 'update'])->name('management-user.update');
    Route::delete('/management-user/{id}', [UserManagementController::class, 'destroy'])->name('management-user.destroy');
});
Route::get('/form/elements', [MainController::class, 'formElements'])->name('form-elements');
Route::get('/form/plugins', [MainController::class, 'formPlugins'])->name('form-plugins');
Route::get('/form/slider-switcher', [MainController::class, 'formSliderSwitcher'])->name('form-slider-switcher');
Route::get('/form/validation', [MainController::class, 'formValidation'])->name('form-validation');
Route::get('/form/wizards', [MainController::class, 'formWizards'])->name('form-wizards');
Route::get('/form/wysiwyg', [MainController::class, 'formWysiwyg'])->name('form-wysiwyg');
Route::get('/form/x-editable', [MainController::class, 'formXEditable'])->name('form-x-editable');
Route::get('/form/multiple-file-upload', [MainController::class, 'formMultipleFileUpload'])->name('form-multiple-file-upload');
Route::get('/form/summernote', [MainController::class, 'formSummernote'])->name('form-summernote');
Route::get('/form/dropzone', [MainController::class, 'formDropzone'])->name('form-dropzone');

Route::middleware('auth')->group(function () {
    Route::get('/table/basic', [MainController::class, 'tableBasic'])->name('table-basic');
    Route::get('/table/manage/default', [MainController::class, 'tableManageDefault'])->name('table-manage-default');
    Route::get('/table/manage/buttons', [MainController::class, 'tableManageButtons'])->name('table-manage-buttons');
    Route::get('/table/manage/colreorder', [MainController::class, 'tableManageColreorder'])->name('table-manage-colreorder');
    Route::get('/table/manage/fixed-column', [MainController::class, 'tableManageFixedColumn'])->name('table-manage-fixed-column');
    Route::get('/table/manage/fixed-header', [MainController::class, 'tableManageFixedHeader'])->name('table-manage-fixed-header');
    Route::get('/table/manage/keytable', [MainController::class, 'tableManageKeytable'])->name('table-manage-keytable');
    Route::get('/table/manage/responsive', [MainController::class, 'tableManageResponsive'])->name('table-manage-responsive');
    Route::get('/table/manage/rowreorder', [MainController::class, 'tableManageRowreorder'])->name('table-manage-rowreorder');
    Route::get('/table/manage/scroller', [MainController::class, 'tableManageScroller'])->name('table-manage-scroller');
    Route::get('/table/manage/select', [MainController::class, 'tableManageSelect'])->name('table-manage-select');
    Route::get('/table/manage/combine', [MainController::class, 'tableManageCombine'])->name('table-manage-combine');
});

Route::get('/chart/flot', [MainController::class, 'chartFlot'])->name('chart-flot');
Route::get('/chart/js', [MainController::class, 'chartJs'])->name('chart-js');
Route::get('/chart/d3', [MainController::class, 'chartD3'])->name('chart-d3');
Route::get('/chart/apex', [MainController::class, 'chartApex'])->name('chart-apex');

Route::get('/page-option/page-blank', [MainController::class, 'pageBlank'])->name('page-blank');

Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.post');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
Route::get('/listrik/detail/{id}', [ListrikController::class, 'detail'])->name('listrik.detail');

Route::middleware('auth')->prefix('overtime')->name('overtime.')->group(function () {
    Route::get('/', [OvertimeController::class, 'index'])->name('index');
    Route::get('/create', [OvertimeController::class, 'create'])->name('create');
    Route::post('/', [OvertimeController::class, 'store'])->name('store');
    Route::get('/status-check', [OvertimeController::class, 'updateOvertimeStatusesAjax'])->name('status-check');
    Route::get('/{id}/edit', [OvertimeController::class, 'edit'])->name('edit');
    Route::put('/{id}/update', [OvertimeController::class, 'update'])->name('update');
    Route::delete('/{id}', [OvertimeController::class, 'destroy'])->name('destroy');
    Route::post('/{id}/cutoff', [OvertimeController::class, 'cutoff'])->name('cutoff');
    Route::post('/{id}/start', [OvertimeController::class, 'start'])->name('start');
    Route::post('/{id}/auto-start', [OvertimeController::class, 'autoStart'])->name('auto-start');
    Route::post('/{id}/auto-complete', [OvertimeController::class, 'autoComplete'])->name('auto-complete');
});
Route::post('/dashboard/auto', [DashboardController::class, 'setAuto'])->name('dashboard.auto');

Route::post('/listrik', [ListrikController::class, 'store']);
Route::get('/listrik/{lokasi}', [ListrikController::class, 'getData']);

Route::get('/login/v3', [MainController::class, 'loginV3'])->name('login-v3');
Route::get('/register/v3', [MainController::class, 'registerV3'])->name('register-v3');

Route::get('/helper/css', [MainController::class, 'helperCSS'])->name('helper-css');

Route::get('/history-kwh', [HistoryKwhController::class, 'index'])->name('history-kwh.index');
Route::get('/history-kwh/latest', [HistoryKwhController::class, 'latest'])->name('history-kwh.latest');

Route::middleware(['auth', 'admin'])->prefix('user-management')->group(function () { // Changed from 'role:admin|superadmin'
    Route::get('/', [UserManagementController::class, 'index'])->name('user-management.index');
    Route::post('/', [UserManagementController::class, 'store'])->name('user-management.store');
    Route::put('/{user}', [UserManagementController::class, 'update'])->name('user-management.update');
    Route::delete('/{user}', [UserManagementController::class, 'destroy'])->name('user-management.destroy');
});

// Schedule management routes
Route::prefix('dashboard-v1/schedule')->name('dashboard.schedule.v1.')->group(function () {
    Route::post('/', [DashboardController::class, 'storeSchedule'])->name('store');
    Route::patch('/{schedule}/toggle', [DashboardController::class, 'toggleSchedule'])->name('toggle');
    Route::delete('/{schedule}', [DashboardController::class, 'destroySchedule'])->name('destroy');
});

// API route for schedule checking (can be called by cron job)
Route::post('/api/check-schedules', [DashboardController::class, 'checkSchedules'])->name('api.schedules.check');

// Test route for schedule debugging
Route::get('/test/schedule-check', [DashboardController::class, 'checkSchedules'])->name('test.schedule-check');
