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


    Route::get('/', function () {
        return redirect('/login/v3');
    });
    Route::get('/dashboard/v1', [DashboardController::class, 'index'])
        ->middleware('role:admin|user')
        ->name('dashboard-v1');

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/dashboard/update', [DashboardController::class, 'update'])->name('dashboard.update');


    Route::get('/sensor/data', [SensorController::class, 'index']);
    Route::middleware(['auth', 'admin'])->group(function () {
        Route::get('/dashboard', [UserController::class, 'index'])->name('dashboard');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
    });

    Route::get('/get-karyawan-by-division/{divisionId}', [DashboardController::class, 'getKaryawanByDivision']);
    Route::get('/get-karyawan/{division_id}', [KaryawanController::class, 'getKaryawanByDivisi']);
    Route::get('/karyawan', [KaryawanController::class, 'index'])->name('karyawan.index');
    Route::get('/karyawan/data', [KaryawanController::class, 'getData'])->name('karyawan.getData');
  
    Route::get('/karyawan', [KaryawanController::class, 'index'])->name('karyawan.index');
    Route::get('/karyawan/data', [KaryawanController::class, 'getData'])->name('karyawan.getData');
    Route::get('/karyawan', [KaryawanController::class, 'index'])->name('karyawan.index');
    Route::get('/karyawan/data', [KaryawanController::class, 'getData'])->name('karyawan.getData');
    Route::post('/karyawan/store', [KaryawanController::class, 'store'])->name('karyawan.store');
    Route::delete('/karyawan/{id}', [KaryawanController::class, 'destroy'])->name('karyawan.destroy');

    Route::get('/sensor/summary', [SensorController::class, 'summary']);

    Route::get('/karyawan', [KaryawanController::class, 'index'])->name('karyawan.index');
    Route::get('/karyawan/data', [KaryawanController::class, 'getData']);
    Route::get('/get-karyawan/{divisiId}', [KaryawanController::class, 'getKaryawanByDivisi']);
    Route::get('/karyawan/data', [KaryawanController::class, 'getData'])->name('karyawan.getData');

    //Relay dan Firebase Routes
    Route::get('/relay', [RelayController::class, 'index']);
    Route::post('/relay/update', [RelayController::class, 'update'])->name('relay.update');
    Route::get('/dashboard', [RelayController::class, 'index']);
    


    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::resource('users', UserController::class);
    Route::put('/users/{id}', [UserController::class, 'update'])->name('users.update');
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

    Route::get('/pos/customer-order', 'MainController@posCustomerOrder')->name('pos-customer-order');
    Route::get('/pos/kitchen-order', 'MainController@posKitchenOrder')->name('pos-kitchen-order');
    Route::get('/pos/counter-checkout', 'MainController@posCounterCheckout')->name('pos-counter-checkout');
    Route::get('/pos/table-booking', 'MainController@posTableBooking')->name('pos-table-booking');
    Route::get('/pos/menu-stock', 'MainController@posMenuStock')->name('pos-menu-stock');

    Route::get('/email-template/system', 'MainController@emailTemplateSystem')->name('email-template-system');
    Route::get('/email-template/newsletter', 'MainController@emailTemplateNewsletter')->name('email-template-newsletter');

    Route::get('/chart/flot', 'MainController@chartFlot')->name('chart-flot');
    Route::get('/chart/js', 'MainController@chartJs')->name('chart-js');
    Route::get('/chart/d3', 'MainController@chartD3')->name('chart-d3');
    Route::get('/chart/apex', 'MainController@chartApex')->name('chart-apex');

    Route::get('/calendar', 'MainController@calendar')->name('calendar');

    Route::get('/map/vector', 'MainController@mapVector')->name('map-vector');
    Route::get('/map/google', 'MainController@mapGoogle')->name('map-google');

    Route::get('/gallery/v1', 'MainController@galleryV1')->name('gallery-v1');
    Route::get('/gallery/v2', 'MainController@galleryV2')->name('gallery-v2');

    Route::get('/page-option/page-blank', 'MainController@pageBlank')->name('page-blank');
    Route::get('/page-option/page-with-footer', 'MainController@pageWithFooter')->name('page-with-footer');
    Route::get('/page-option/page-with-fixed-footer', 'MainController@pageWithFixedFooter')->name('page-with-fixed-footer');
    Route::get('/page-option/page-without-sidebar', 'MainController@pageWithoutSidebar')->name('page-without-sidebar');
    Route::get('/page-option/page-with-right-sidebar', 'MainController@pageWithRightSidebar')->name('page-with-right-sidebar');
    Route::get('/page-option/page-with-minified-sidebar', 'MainController@pageWithMinifiedSidebar')->name('page-with-minified-sidebar');
    Route::get('/page-option/page-with-two-sidebar', 'MainController@pageWithTwoSidebar')->name('page-with-two-sidebar');
    Route::get('/page-option/page-full-height', 'MainController@pageFullHeight')->name('page-full-height');
    Route::get('/page-option/page-with-wide-sidebar', 'MainController@pageWithWideSidebar')->name('page-with-wide-sidebar');
    Route::get('/page-option/page-with-light-sidebar', 'MainController@pageWithLightSidebar')->name('page-with-light-sidebar');
    Route::get('/page-option/page-with-mega-menu', 'MainController@pageWithMegaMenu')->name('page-with-mega-menu');
    Route::get('/page-option/page-with-top-menu', 'MainController@pageWithTopMenu')->name('page-with-top-menu');
    Route::get('/page-option/page-with-boxed-layout', 'MainController@pageWithBoxedLayout')->name('page-with-boxed-layout');
    Route::get('/page-option/page-with-mixed-menu', 'MainController@pageWithMixedMenu')->name('page-with-mixed-menu');
    Route::get('/page-option/boxed-layout-with-mixed-menu', 'MainController@boxedLayoutWithMixedMenu')->name('boxed-layout-with-mixed-menu');
    Route::get('/page-option/page-with-transparent-sidebar', 'MainController@pageWithTransparentSidebar')->name('page-with-transparent-sidebar');
    Route::get('/page-option/page-with-search-sidebar', 'MainController@pageWithSearchSidebar')->name('page-with-search-sidebar');
    Route::get('/page-option/page-with-hover-sidebar', 'MainController@pageWithHoverSidebar')->name('page-with-hover-sidebar');

    Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.post');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/listrik/detail/{id}', [ListrikController::class, 'detail'])->name('listrik.detail');

    Route::get('/overtime', [OvertimeController::class, 'index'])->name('overtime.index');
    Route::get('/overtime/create', [OvertimeController::class, 'create'])->name('overtime.create');
    Route::post('/overtime', [OvertimeController::class, 'store'])->name('overtime.store');
    Route::delete('/overtime/{id}', [OvertimeController::class, 'destroy'])->name('overtime.destroy');    

    Route::post('/listrik', [ListrikController::class, 'store']);
    Route::get('/listrik/{lokasi}', [ListrikController::class, 'getData']);

    Route::get('/login/v3', 'MainController@loginV3')->name('login-v3');
    Route::get('/register/v3', 'MainController@registerV3')->name('register-v3');

    Route::get('/helper/css', 'MainController@helperCSS')->name('helper-css');

    Route::get('/history-kwh', [HistoryKwhController::class, 'index'])->name('history-kwh.index');
    Route::get('/history-kwh/latest', [HistoryKwhController::class, 'latest'])->name('history-kwh.latest');

    Route::prefix('user-management')->middleware(['auth'])->group(function () {
        Route::get('/', [UserManagementController::class, 'index'])->name('user-management');
        Route::post('/', [UserManagementController::class, 'store'])->name('user-management.store');
        Route::put('/{user}', [UserManagementController::class, 'update'])->name('user-management.update');
        Route::delete('/{user}', [UserManagementController::class, 'destroy'])->name('user-management.destroy');
    });
    
    Route::middleware(['auth', 'role:admin|superadmin'])->group(function () {
        Route::resource('user-management', 'UserManagementController');
    });