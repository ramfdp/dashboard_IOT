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
    use App\Http\Controllers\KaryawanController;
    use App\Http\Controllers\RelayController;
    use App\Http\Controllers\CCTVController;
    use App\Http\Controllers\LightScheduleController;




    Route::get('/', function () {
        return redirect('/login/v3');
    });
    Route::get('/dashboard/v1', [DashboardController::class, 'index'])
        ->middleware('role:admin|user')
        ->name('dashboard-v1');

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/dashboard/update', [DashboardController::class, 'update'])->name('dashboard.update');

    // Light schedule routes
    Route::post('/dashboard/schedule', [DashboardController::class, 'storeSchedule'])->name('dashboard.schedule.store');
    Route::put('/dashboard/schedule/{schedule}', [DashboardController::class, 'updateSchedule'])->name('dashboard.schedule.update');
    Route::delete('/dashboard/schedule/{schedule}', [DashboardController::class, 'destroySchedule'])->name('dashboard.schedule.destroy');
    Route::patch('/dashboard/schedule/{schedule}/toggle', [DashboardController::class, 'toggleSchedule'])->name('dashboard.schedule.toggle');
    Route::get('/sensor/data', [SensorController::class, 'index']);
    Route::middleware(['auth', 'admin'])->group(function () {
        Route::get('/dashboard', [UserController::class, 'index'])->name('dashboard');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
    });

    Route::prefix('karyawan')->name('karyawan.')->group(function () {
        Route::get('/', [KaryawanController::class, 'index'])->name('index');
        Route::get('/data', [KaryawanController::class, 'getData'])->name('getData');
        Route::post('/store', [KaryawanController::class, 'store'])->name('store');
        Route::delete('/{id}', [KaryawanController::class, 'destroy'])->name('destroy');
    });

    Route::get('/get-karyawan-by-division/{divisionId}', [DashboardController::class, 'getKaryawanByDivision']);
    Route::get('/get-karyawan/{division_id}', [KaryawanController::class, 'getKaryawanByDivisi']);
    Route::get('/sensor/summary', [SensorController::class, 'summary']);

    Route::prefix('relay')->name('relay.')->group(function () {
        Route::get('/', [RelayController::class, 'index'])->name('index');
        Route::post('/update', [RelayController::class, 'update'])->name('update');
    });

    Route::prefix('cctv')->name('cctv.')->group(function () {

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
    Route::get('/form/elements', 'MainController@formElements')->name('form-elements');
    Route::get('/form/plugins', 'MainController@formPlugins')->name('form-plugins');
    Route::get('/form/slider-switcher', 'MainController@formSliderSwitcher')->name('form-slider-switcher');
    Route::get('/form/validation', 'MainController@formValidation')->name('form-validation');
    Route::get('/form/wizards', 'MainController@formWizards')->name('form-wizards');
    Route::get('/form/wysiwyg', 'MainController@formWysiwyg')->name('form-wysiwyg');
    Route::get('/form/x-editable', 'MainController@formXEditable')->name('form-x-editable');
    Route::get('/form/multiple-file-upload', 'MainController@formMultipleFileUpload')->name('form-multiple-file-upload');
    Route::get('/form/summernote', 'MainController@formSummernote')->name('form-summernote');
    Route::get('/form/dropzone', 'MainController@formDropzone')->name('form-dropzone');

    Route::get('/table/basic', 'MainController@tableBasic')->name('table-basic');
    Route::get('/table/manage/default', 'MainController@tableManageDefault')->name('table-manage-default');
    Route::get('/table/manage/buttons', 'MainController@tableManageButtons')->name('table-manage-buttons');
    Route::get('/table/manage/colreorder', 'MainController@tableManageColreorder')->name('table-manage-colreorder');
    Route::get('/table/manage/fixed-column', 'MainController@tableManageFixedColumn')->name('table-manage-fixed-column');
    Route::get('/table/manage/fixed-header', 'MainController@tableManageFixedHeader')->name('table-manage-fixed-header');
    Route::get('/table/manage/keytable', 'MainController@tableManageKeytable')->name('table-manage-keytable');
    Route::get('/table/manage/responsive', 'MainController@tableManageResponsive')->name('table-manage-responsive');
    Route::get('/table/manage/rowreorder', 'MainController@tableManageRowreorder')->name('table-manage-rowreorder');
    Route::get('/table/manage/scroller', 'MainController@tableManageScroller')->name('table-manage-scroller');
    Route::get('/table/manage/select', 'MainController@tableManageSelect')->name('table-manage-select');
    Route::get('/table/manage/combine', 'MainController@tableManageCombine')->name('table-manage-combine');

    Route::get('/chart/flot', 'MainController@chartFlot')->name('chart-flot');
    Route::get('/chart/js', 'MainController@chartJs')->name('chart-js');
    Route::get('/chart/d3', 'MainController@chartD3')->name('chart-d3');
    Route::get('/chart/apex', 'MainController@chartApex')->name('chart-apex');

    Route::get('/page-option/page-blank', 'MainController@pageBlank')->name('page-blank');

    Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.post');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/listrik/detail/{id}', [ListrikController::class, 'detail'])->name('listrik.detail');

    Route::prefix('overtime')->name('overtime.')->group(function () {
        Route::get('/', [OvertimeController::class, 'index'])->name('index');
        Route::get('/create', [OvertimeController::class, 'create'])->name('create');
        Route::post('/', [OvertimeController::class, 'store'])->name('store');
        Route::get('/status-check', [OvertimeController::class, 'updateOvertimeStatusesAjax'])->name('status-check');
        Route::get('/{id}/edit', [OvertimeController::class, 'edit'])->name('edit');
        Route::put('/{id}/update', [OvertimeController::class, 'update'])->name('update');
        Route::delete('/{id}', [OvertimeController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/cutoff', [OvertimeController::class, 'cutoff'])->name('cutoff');
        Route::post('/{id}/start', [OvertimeController::class, 'start'])->name('start');
    });
    Route::post('/dashboard/auto', [DashboardController::class, 'setAuto'])->name('dashboard.auto');

    Route::post('/listrik', [ListrikController::class, 'store']);
    Route::get('/listrik/{lokasi}', [ListrikController::class, 'getData']);

    Route::get('/login/v3', 'MainController@loginV3')->name('login-v3');
    Route::get('/register/v3', 'MainController@registerV3')->name('register-v3');

    Route::get('/helper/css', 'MainController@helperCSS')->name('helper-css');

    Route::get('/history-kwh', [HistoryKwhController::class, 'index'])->name('history-kwh.index');
    Route::get('/history-kwh/latest', [HistoryKwhController::class, 'latest'])->name('history-kwh.latest');

    Route::middleware(['auth', 'role:admin|superadmin'])->prefix('user-management')->group(function () {
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
