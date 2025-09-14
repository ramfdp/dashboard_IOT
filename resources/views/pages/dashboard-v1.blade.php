@extends('layouts.default')

@section('title', 'Dashboard')

@push('css')
    <link href="/assets/plugins/bootstrap-datepicker/dist/css/bootstrap-datepicker.css" rel="stylesheet" />
    <link href="/assets/plugins/gritter/css/jquery.gritter.css" rel="stylesheet" />
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css" rel="stylesheet" />
    <link href="/assets/css/indikator.css" rel="stylesheet" />
    <link href="/assets/css/dashboard-v1.css" rel=" stylesheet" />
    <link href="/assets/css/krakatau-modal-fixes.css" rel="stylesheet" />
    <link href="/assets/css/pln-calculator.css" rel="stylesheet" />
@endpush

@push('scripts')
    {{-- Essential Dashboard Scripts --}}
    <script src="/assets/plugins/gritter/js/jquery.gritter.js"></script>
    <script src="/assets/plugins/bootstrap-datepicker/dist/js/bootstrap-datepicker.js"></script>
    
    {{-- Chart.js for visualization --}}
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.2.1/dist/chart.min.js"></script>
    
    {{-- TensorFlow.js tidak diperlukan untuk Linear Regression --}}
    {{-- <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core@4.15.0/dist/tf-core.min.js" async defer></script> --}}
    {{-- <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter@4.15.0/dist/tf-converter.min.js" async defer></script> --}}
    {{-- <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-cpu@4.15.0/dist/tf-backend-cpu.min.js" async defer></script> --}}
    
    {{-- Electricity Calculation System --}}
    <script src="/assets/js/electricity-linear-regression-calculator.js" defer></script>
    <script src="/assets/js/linear-regression-integration.js" defer></script>
    <script src="/assets/js/krakatau-electricity-calculator.js" defer></script>
    
    {{-- Dashboard Integration --}}
    <script src="/assets/js/dashboard-electricity-integration.js" defer></script>
    <script src="/assets/js/dashboard-data-debug.js" defer></script>
    
    {{-- New Separated Components --}}
    <script src="/assets/js/dashboard-period-analysis.js" defer></script>
    <script src="/assets/js/dashboard-current-usage.js" defer></script>
    
    {{-- Core Dashboard Functions --}}
    <script src="/assets/js/logika-form-lembur.js"></script>
    <script type="module" src="/assets/js/overtime-control-fetch.js"></script>
    <script type="module" src="/assets/js/device-firebase-control.js"></script>
    <script src="/assets/js/LightScheduleManager.js"></script>
    <script src="/assets/js/ModeManager.js"></script>
    
    {{-- Initialize dashboard routes and debug data --}}
    <script>
        window.dashboardRoutes = {
            autoMode: '{{ route("dashboard.auto-mode") }}',
            manualMode: '{{ route("dashboard.manual-mode") }}'
        };
        
        // Pass debug data to JavaScript
        window.dashboardDebugData = {
            dataKwh: @json($dataKwh ?? []),
            labelsCount: @json(isset($dataKwh) ? $dataKwh->pluck('waktu')->count() : 0),
            valuesCount: @json(isset($dataKwh) ? $dataKwh->pluck('daya')->count() : 0)
        };
    </script>
    <script src="/assets/js/dashboard-mode-control.js"></script>
    
    {{-- Export functionality --}}
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
    <script src="/assets/js/export-analysis.js"></script>
    
    {{-- Firebase Integration --}}
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js" defer></script>
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js" defer></script>
    {{-- <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js" defer></script> --}}
    <script src="/assets/js/firebase-integration.js" defer></script>
    
    {{-- Auto PZEM Values Generator for PT Krakatau Sarana Property --}}
    <script src="/assets/js/auto-pzem-values.js" defer></script>
    
    {{-- Night Mode Simulation Indicator --}}
    <script src="/assets/js/night-mode-indicator.js" defer></script>
    
    {{-- PLN Tariff Calculator with Official Rates --}}
    <script src="/assets/js/pln-tariff-calculator.js" defer></script>
    
    {{-- PLN Calculator Integration with Monitoring System --}}
    <script src="/assets/js/pln-calculator-integration.js" defer></script>
    
    {{-- Real-time monitoring - loaded last --}}
    <script src="/assets/js/fetch-api-monitoring.js"></script>
@endpush

@section('content')
    <!-- BEGIN breadcrumb -->
    <ol class="breadcrumb float-xl-end">
        <li class="breadcrumb-item"><a href="javascript:;">Home</a></li>
        <li class="breadcrumb-item active">Dashboard</li>
    </ol>
    <!-- END breadcrumb -->
    
    <!-- BEGIN page-header -->
    <h1 class="page-header">
        Dashboard <small>Selamat Datang di IOT Smart Building Controller</small>
        
        <!-- Sync Status Indicators -->
        <div class="float-end">
            <small class="badge bg-secondary me-2" id="dbSyncStatus">
                <i class="fa fa-database"></i> DB: Waiting
            </small>
            <small class="badge bg-secondary" id="firebaseSyncStatus">
                <i class="fa fa-cloud"></i> Firebase: Waiting
            </small>
        </div>
    </h1>
    <!-- END page-header -->
    <!-- PZEM Monitoring (1 Row, 4 Kolom) -->
    <div class="row">
        <!-- Voltage -->
        <div class="col-md-3">
            <div class="widget widget-stats bg-primary">
                <div class="stats-icon"><i class="fa fa-bolt"></i></div>
                <div class="stats-info">
                    <h4>Tegangan (Voltage)</h4>
                    <p id="pzem-voltage">Memuat...</p>
                </div>
            </div>
        </div>

        <!-- Current -->
        <div class="col-md-3">
            <div class="widget widget-stats bg-success">
                <div class="stats-icon"><i class="fa fa-plug"></i></div>
                <div class="stats-info">
                    <h4>Arus (Current)</h4>
                    <p id="pzem-current">Memuat...</p>
                </div>
            </div>
        </div>

        <!-- Power -->
        <div class="col-md-3">
            <div class="widget widget-stats bg-warning">
                <div class="stats-icon"><i class="fa fa-lightbulb"></i></div>
                <div class="stats-info">
                    <h4>Daya Sensor PZEM</h4>
                    <p id="pzem-power">Memuat...</p>
                </div>
            </div>
        </div>

        <!-- Total Power -->
        <div class="col-md-3">
            <div class="widget widget-stats bg-danger">
                <div class="stats-icon"><i class="fa fa-tachometer-alt"></i></div>
                <div class="stats-info">
                    <h4>Total Penggunaan Lampu</h4>
                    <p id="total-listrik">Memuat...</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Monitoring Gauge Chart -->
    <div class="container-fluid">
        <div class="row">
            <div class="col-md-12">
                <div class="panel panel-inverse shadow-sm rounded-lg w-100 mb-4">
                    <div class="panel-heading d-flex justify-content-between align-items-center bg-black text-white p-3 rounded-top">
                        <h6 class="panel-title mb-0">
                            <i class="fa fa-chart-line me-2"></i>Penggunaan Listrik Hari Ini
                            <small class="text-muted ms-2">{{ \Carbon\Carbon::now('Asia/Jakarta')->format('d F Y') }}</small>
                        </h6>
                    </div>
                    <div class="panel-body p-4 bg-dark text-white rounded-bottom">
                        <div class="row" style="overflow-x: auto; background-color: #1e1e1e; border-radius: 8px;">
                            <canvas id="wattChart" 
                            data-labels='@json(isset($dataKwh) ? $dataKwh->pluck('waktu_formatted')->toArray() : [])'
                            data-values='@json(isset($dataKwh) ? $dataKwh->pluck('daya')->toArray() : [])'
                            width="1450" height="300" style="background-color: #1e1e1e;"></canvas>
                            
                            {{-- Chart canvas with data attributes for JavaScript processing --}}
                        </div>
                        <div class="row col-md-12 text-center mt-3 mb-2">
                            <button class="btn btn-primary" id="btnLihatPerhitungan" data-bs-toggle="modal" data-bs-target="#modalPerhitunganListrik">Lihat Perhitungan</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal untuk Perhitungan Listrik -->
    <div class="modal fade" id="modalPerhitunganListrik" tabindex="-1" aria-labelledby="modalPerhitunganListrikLabel" aria-hidden="true" data-bs-backdrop="true" data-bs-keyboard="true">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title" id="modalPerhitunganListrikLabel">
                        <i class="fa fa-chart-line me-2"></i>Analisis Penggunaan Listrik Lanjutan
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body bg-light">
                    <!-- Analysis Summary -->
                    <div class="alert alert-primary border-0 shadow-sm">
                        <h6><i class="fa fa-info-circle me-2"></i>Ringkasan Analisis</h6>
                        <div id="perhitunganSummary" class="text-dark"></div>
                    </div>

                    <!-- Period Selection Section -->
                    <div class="row mb-3">
                        <div class="col-md-12">
                            <div class="card border-0 shadow-sm">
                                <div class="card-header bg-info text-white">
                                    <h6 class="card-title mb-0"><i class="fa fa-calendar me-2"></i>Periode Analisis</h6>
                                </div>
                                <div class="card-body">
                                    <label for="periodePerhitungan" class="form-label fw-bold text-dark">Pilih Periode:</label>
                                    <select class="form-select" id="periodePerhitungan">
                                        <option value="harian" selected>Harian (Hari Ini)</option>
                                        <option value="mingguan">Mingguan (Minggu Ini)</option>
                                        <option value="bulanan">Bulanan (Bulan Ini)</option>
                                    </select>
                                    <small class="text-muted mt-2 d-block" id="periodeInfo">Data akan diambil dari database berdasarkan periode yang dipilih</small>
                                    <!-- Hidden algorithm selection - Linear Regression is used by default -->
                                    <div class="col-md-6 d-none">
                                        <label for="algorithmSelect">Algoritma Prediksi:</label>
                                        <select class="form-control" id="algorithmSelect">
                                            <option value="linear-regression" selected>Linear Regression</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Current Usage Section -->
                    <div class="row mb-3">
                        <div class="col-md-12">
                            <div class="card bg-primary text-white border-0 shadow-sm">
                                <div class="card-header">
                                    <h6 class="card-title mb-0"><i class="fa fa-bolt me-2"></i>Penggunaan Listrik</h6>
                                </div>
                                <div class="card-body">
                                    <div class="row text-center">
                                        <div class="col-4">
                                            <h4 id="currentPower" class="text-white">0 W</h4>
                                            <small class="text-light">Daya Sekarang</small>
                                        </div>
                                        <div class="col-4">
                                            <h4 id="averagePower" class="text-white">0 W</h4>
                                            <small class="text-light">Rata-rata Hari Ini</small>
                                        </div>
                                        <div class="col-4">
                                            <h4 id="todayKwh" class="text-white">0 kWh</h4>
                                            <small class="text-light">Total Hari Ini</small>
                                        </div>
                                    </div>
                                    <div class="text-center mt-2">
                                        <small id="lastUpdateTime" class="text-light">Update terakhir: --:--:--</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Period Analysis Chart -->
                    <div class="card border-0 shadow-sm mb-3">
                        <div class="card-header bg-info text-white">
                            <h6 class="card-title mb-0"><i class="fa fa-chart-area me-2"></i>Grafik Konsumsi Listrik</h6>
                        </div>
                        <div class="card-body bg-white">
                            <div class="chart-container" style="position: relative; height: 300px;">
                                <canvas id="electricityChart"></canvas>
                            </div>
                        </div>
                    </div>

                    <!-- Detailed Statistics -->
                    <div class="card border-0 shadow-sm mb-3">
                        <div class="card-header bg-secondary text-white">
                            <h6 class="card-title mb-0"><i class="fa fa-table me-2"></i>Statistik Detail</h6>
                        </div>
                        <div class="card-body bg-white">
                            <div class="row">
                                <div class="col-md-6">
                                    <table class="table table-sm table-borderless">
                                        <tbody>
                                            <tr><td class="text-dark fw-bold">Daya Puncak</td><td id="dayaTertinggi" class="text-primary fw-bold">0 W</td></tr>
                                            <tr><td class="text-dark fw-bold">Daya Minimum</td><td id="dayaTerendah" class="text-success fw-bold">0 W</td></tr>
                                            <tr><td class="text-dark fw-bold">Titik Data</td><td id="totalData" class="text-info fw-bold">0</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div class="col-md-6">
                                    <table class="table table-sm table-borderless">
                                        <tbody>
                                            <tr><td class="text-dark fw-bold">Energi Harian</td><td id="kwhHarian" class="text-warning fw-bold">0 kWh</td></tr>
                                            <tr><td class="text-dark fw-bold">Energi Mingguan</td><td id="kwhMingguan" class="text-info fw-bold">0 kWh</td></tr>
                                            <tr><td class="text-dark fw-bold">Energi Bulanan</td><td id="kwhBulanan" class="text-danger fw-bold">0 kWh</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Predictions -->
                    <div class="card border-0 shadow-sm mb-3">
                        <div class="card-header bg-success text-white">
                            <h6 class="card-title mb-0"><i class="fa fa-chart-line me-2"></i>Prediksi Konsumsi</h6>
                        </div>
                        <div class="card-body bg-white">
                            <div class="row">
                                <div class="col-md-8">
                                    <div class="form-group mb-2">
                                        <label for="periodePrediksi" class="form-label fw-bold text-dark">Horizon Prediksi:</label>
                                        <select class="form-select" id="periodePrediksi">
                                            <option value="1">Jam Berikutnya</option>
                                            <option value="6">6 Jam Berikutnya</option>
                                            <option value="24" selected>24 Jam Berikutnya</option>
                                            <option value="72">3 Hari Berikutnya</option>
                                        </select>
                                    </div>
                                    <div class="prediction-results">
                                        <p class="text-dark">Jam Berikutnya: <strong id="prediksiWatt" class="text-primary">-</strong></p>
                                        <p class="text-dark">Total Energi: <strong id="prediksiKwhHarian" class="text-success">-</strong></p>
                                    </div>
                                </div>
                                <div class="col-md-4 text-center">
                                    <div class="prediction-info">
                                        <div class="info-circle bg-light border border-primary p-3 rounded-circle d-inline-block position-relative" style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;">
                                            <i class="fas fa-chart-line text-primary" style="font-size: 1.5rem;"></i>
                                        </div>
                                        <small class="text-muted d-block mt-2">Prediksi Linear Regression</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Electricity Cost Estimation Section for Krakatau Sarana Property -->
                    <div class="card border-0 shadow-sm mb-3">
                        <div class="card-header bg-warning text-dark">
                            <h6 class="card-title mb-0 fw-bold">
                                <i class="fa fa-money-bill-wave me-2"></i>
                                Estimasi Biaya Listrik - Krakatau Sarana Property
                            </h6>
                        </div>
                        <div class="card-body bg-white">
                            <!-- PLN Tariff Selector -->
                            <div class="row mb-3">
                                <div class="col-md-12">
                                    <div class="alert alert-info border-0 shadow-sm">
                                        <div class="row align-items-center">
                                            <div class="col-md-8">
                                                <label for="tariffSelectModal" class="form-label fw-bold mb-2">
                                                    <i class="fa fa-bolt text-warning me-2"></i>Golongan Tarif PLN (Juli-September 2025)
                                                </label>
                                                <select id="tariffSelectModal" class="form-select">
                                                    <!-- Options will be populated by JavaScript -->
                                                </select>
                                                <small class="text-muted mt-1 d-block" id="tariffDescriptionModal">
                                                    Pilih golongan tarif sesuai klasifikasi PLN
                                                </small>
                                            </div>
                                            <div class="col-md-4">
                                                <div class="text-center">
                                                    <small class="text-muted d-block">Tarif Per kWh</small>
                                                    <div id="currentRateModal" class="h5 text-primary fw-bold">Rp 1.035,76</div>
                                                    <small class="text-muted">Resmi PLN</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Cost Calculator Input -->
                            {{-- <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Konsumsi Listrik (kWh)</label>
                                    <div class="input-group">
                                        <input type="number" id="kwhInputModal" class="form-control" 
                                               placeholder="Memuat data..." readonly min="0" step="0.01">
                                        <span class="input-group-text">kWh</span>
                                    </div>
                                    <small class="text-muted">
                                        <i class="fa fa-database"></i> Data dimuat otomatis dari database
                                    </small>
                                </div>
                                <div class="col-md-6">
                                    <div class="bg-light rounded p-3">
                                        <h6 class="fw-bold mb-3">Hasil Perhitungan:</h6>
                                        <div class="text-center mb-3">
                                            <small class="text-muted">Konsumsi Bulanan</small>
                                            <div id="displayKwhModal" class="h5 fw-bold text-primary">100 kWh</div>
                                        </div>
                                        <hr>
                                        <div class="d-flex justify-content-between align-items-center">
                                            <span class="fw-bold">Total Biaya:</span>
                                            <span id="totalCostModal" class="h5 text-success fw-bold">Rp 103.576</span>
                                        </div>
                                    </div>
                                </div>
                            </div> --}}

                            <!-- Cost Summary Cards -->
                            <div class="row mb-3">
                                <div class="col-md-3 col-sm-6 mb-2">
                                    <div class="card bg-primary text-white border-0 shadow-sm">
                                        <div class="card-body text-center p-2">
                                            <small class="text-light">Konsumsi Harian</small>
                                            <h6 id="costDailyKwh" class="mb-0 text-white fw-bold">-- kWh</h6>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3 col-sm-6 mb-2">
                                    <div class="card bg-success text-white border-0 shadow-sm">
                                        <div class="card-body text-center p-2">
                                            <small class="text-light">Biaya Harian</small>
                                            <h6 id="costDailyAmount" class="mb-0 text-white fw-bold">Rp --</h6>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3 col-sm-6 mb-2">
                                    <div class="card bg-info text-white border-0 shadow-sm">
                                        <div class="card-body text-center p-2">
                                            <small class="text-light">Konsumsi Bulanan</small>
                                            <h6 id="costMonthlyKwh" class="mb-0 text-white fw-bold">-- kWh</h6>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3 col-sm-6 mb-2">
                                    <div class="card bg-danger text-white border-0 shadow-sm">
                                        <div class="card-body text-center p-2">
                                            <small class="text-light">Estimasi Bulanan</small>
                                            <h6 id="costMonthlyAmount" class="mb-0 text-white fw-bold">Rp --</h6>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Detailed Cost Breakdown -->
                            <div class="cost-breakdown-container" style="display: none;" id="costBreakdownContainer">
                                <div class="card border-0 text-white shadow-sm">
                                    <div class="card-header bg-secondary text-white">
                                        <h6 class="mb-0">
                                            <i class="fa fa-list text-white me-2"></i>
                                            Rincian Biaya Bulanan
                                        </h6>
                                    </div>
                                    <div class="card-body bg-white">
                                        <div class="table-responsive">
                                            <table class="table table-sm table-borderless">
                                                <thead>
                                                    <tr class="border-bottom">
                                                        <th class="text-white fw-bold">Komponen Biaya</th>
                                                        <th class="text-white fw-bold">Detail</th>
                                                        <th class="text-end text-white fw-bold">Jumlah</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="costBreakdownTable" class="text-dark">
                                                    <!-- Populated by JavaScript -->
                                                </tbody>
                                            </table>
                                        </div>
                                        
                                        <!-- Total Cost Highlight -->
                                        <div class="text-center mt-3">
                                            <div class="alert alert-success border-0 shadow-sm">
                                                <h5 class="mb-1 text-success">
                                                    <i class="fa fa-calculator me-2"></i>
                                                    Total Estimasi Biaya Listrik
                                                </h5>
                                                <h3 id="totalCostHighlight" class="text-success fw-bold mb-0">Rp 0</h3>
                                                <small class="text-muted">per bulan</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Action Buttons -->
                            <div class="text-center mt-3">
                                <button type="button" class="btn btn-primary shadow-sm" id="calculateCostBtn">
                                    <i class="fa fa-calculator me-1"></i>
                                    Hitung Estimasi Biaya
                                </button>
                                <button type="button" class="btn btn-outline-secondary ms-2 shadow-sm" id="toggleCostDetailsBtn" style="display: none;">
                                    <i class="fa fa-eye me-1"></i>
                                    <span>Lihat Detail</span>
                                </button>
                            </div>
                            
                            <!-- Loading State -->
                            <div id="costCalculationLoading" class="text-center" style="display: none;">
                                <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                                <small class="text-muted">Menghitung biaya...</small>
                            </div>
                        </div>
                    </div>

                </div>
                <div class="modal-footer bg-light border-top">
                    <button type="button" class="btn btn-info shadow-sm" id="exportAnalysis">
                        <i class="fa fa-download me-2"></i>Export Analysis
                    </button>
                    <button type="button" class="btn btn-success shadow-sm" id="refreshAnalysis">
                        <i class="fa fa-refresh me-2"></i>Refresh
                    </button>
                    <button type="button" class="btn btn-secondary shadow-sm" data-bs-dismiss="modal">
                        <i class="fa fa-times me-2"></i>Close
                    </button>
                </div>
            </div>
        </div>
    </div>
    <!-- END Modal Perhitungan Listrik -->
    
    <!-- Jadwal Lampu -->
    <div class="row mb-4">
        <div class="col-md-12">
            <div class="card shadow-sm rounded p-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h4>Scheduler Lampu Kantor</h4>
                    <button id="manual-schedule-check" class="btn btn-sm btn-info">
                        <i class="fa fa-refresh"></i> Check Schedules Now
                    </button>
                </div>
                @if(session()->has('success_schedule'))
                    <div class="alert alert-success">{{ session('success_schedule') }}</div>
                @endif
                <form action="{{ route('dashboard.schedule.store') }}" method="POST" class="mb-4">
                    @csrf
                    <div class="row g-2 align-items-end">
                        <div class="col-md-2">
                            <label class="form-label">Nama Jadwal</label>
                            <input type="text" name="name" class="form-control" required placeholder="Contoh: Jadwal Pagi">
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">Hari</label>
                            <select name="day_of_week" class="form-select" required>
                                <option value="monday">Senin</option>
                                <option value="tuesday">Selasa</option>
                                <option value="wednesday">Rabu</option>
                                <option value="thursday">Kamis</option>
                                <option value="friday">Jumat</option>
                                <option value="saturday">Sabtu</option>
                                <option value="sunday">Minggu</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">Jam Mulai</label>
                            <input type="time" name="start_time" class="form-control" required>
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">Jam Selesai</label>
                            <input type="time" name="end_time" class="form-control" required>
                        </div>
                        <div class="col-md-4">
                            <button type="submit" class="btn btn-success w-100">Tambah Jadwal</button>
                        </div>
                    </div>
                </form>

                <div class="table-responsive">
                    <table class="table table-bordered table-sm">
                        <thead>
                            <tr>
                                <th>Nama Jadwal</th>
                                <th>Hari</th>
                                <th>Jam Mulai</th>
                                <th>Jam Selesai</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @if(isset($lightSchedules) && $lightSchedules->count() > 0)
                                @foreach($lightSchedules as $schedule)
                                <tr>
                                    <td>{{ $schedule->name }}</td>
                                    <td>{{ $schedule->day_name }}</td>
                                    <td>{{ date('H:i', strtotime($schedule->start_time)) }}</td>
                                    <td>{{ date('H:i', strtotime($schedule->end_time)) }}</td>
                                    <td>
                                        <form action="{{ route('dashboard.schedule.toggle', $schedule) }}" method="POST" style="display:inline-block;">
                                            @csrf
                                            @method('PATCH')
                                            <button type="submit" class="btn btn-sm {{ $schedule->is_active ? 'btn-success' : 'btn-secondary' }}">
                                                {{ $schedule->is_active ? 'Aktif' : 'Nonaktif' }}
                                            </button>
                                        </form>
                                    </td>
                                    <td>
                                        <form action="{{ route('dashboard.schedule.destroy', $schedule) }}" method="POST" style="display:inline-block;">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-sm btn-danger" onclick="return confirm('Hapus jadwal ini?')">Hapus</button>
                                        </form>
                                    </td>
                                </tr>
                                @endforeach
                            @else
                                <tr>
                                    <td colspan="6" class="text-center">Belum ada jadwal</td>
                                </tr>
                            @endif
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Device Control Section -->
    <div class="row mb-5">
        <div class="col-12">
            <div class="card shadow border-0">
                <div class="card-header bg-primary text-white">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-lightbulb me-2"></i>
                        Kontrol Perangkat Lampu
                    </h5>
                </div>
                <div class="card-body py-4">
                    <!-- Mode Status and Control -->
                    <div class="row mb-4">
                        <div class="col-12 text-center">
                            <div class="d-flex justify-content-center align-items-center flex-wrap gap-3">
                                <span id="mode-status"
                                    class="badge bg-success rounded-pill shadow"
                                    style="font-size: 1.1rem; padding: 0.6rem 1rem;">
                                        <i class="fas fa-clock me-1"></i>
                                        Mode Otomatis Aktif
                                </span>
                                <div class="btn-group" role="group">
                                    <button id="enable-auto-mode-btn" type="button" class="btn btn-sm btn-success">
                                        <i class="fa fa-robot me-1"></i> 
                                        <span class="btn-text">Mode Otomatis</span>
                                        <span class="btn-loading d-none">
                                            <i class="fa fa-spinner fa-spin me-1"></i> Mengaktifkan...
                                        </span>
                                    </button>
                                    <button id="enable-manual-mode-btn" type="button" class="btn btn-sm btn-warning">
                                        <i class="fa fa-hand-paper me-1"></i> 
                                        <span class="btn-text">Mode Manual</span>
                                        <span class="btn-loading d-none">
                                            <i class="fa fa-spinner fa-spin me-1"></i> Mengaktifkan...
                                        </span>
                                    </button>
                                </div>
                            </div>
                            <div class="mt-2">
                                <small class="text-muted">
                                    <i class="fas fa-info-circle me-1"></i>
                                    Mode manual: Kontrol perangkat secara manual. Mode otomatis: Sistem mengikuti jadwal yang telah ditentukan.
                                </small>
                            </div>
                        </div>
                    </div>

                    <hr class="my-4">

                    <form action="{{ route('dashboard.update') }}" method="POST">
                        @csrf

                        @if(session()->has('success_device'))
                            <div class="alert alert-success alert-dismissible fade show mb-4" role="alert">
                                <i class="fas fa-check-circle me-2"></i>
                                {{ session('success_device') }}
                                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                            </div>
                        @endif

                        <div class="row justify-content-center g-3">
                            <!-- Relay 1 -->
                            <div class="col-lg-3 col-md-4 col-sm-6">
                                <div class="card h-100 shadow-sm border-0 device-control-card">
                                    <div class="card-body text-center p-3">
                                        <div class="device-icon mb-2">
                                            <i class="fa fa-lightbulb text-warning fs-3"></i>
                                        </div>
                                        <h6 class="fw-bold mb-2 text-dark">Relay 1</h6>
                                        <div class="form-check form-switch d-flex justify-content-center">
                                            <input type="hidden" name="relay1" value="0">
                                            <input class="form-check-input device-switch" type="checkbox" name="relay1" value="1" {{ (isset($relay1) && $relay1 == 1) ? 'checked' : '' }}>
                                        </div>
                                        <div class="status-indicator mt-2">
                                            <small class="text-muted">Status: <span class="relay1-status">{{ (isset($relay1) && $relay1 == 1) ? 'ON' : 'OFF' }}</span></small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Relay 2 -->
                            <div class="col-lg-3 col-md-4 col-sm-6">
                                <div class="card h-100 shadow-sm border-0 device-control-card">
                                    <div class="card-body text-center p-3">
                                        <div class="device-icon mb-2">
                                            <i class="fa fa-lightbulb text-warning fs-3"></i>
                                        </div>
                                        <h6 class="fw-bold mb-2 text-dark">Relay 2</h6>
                                        <div class="form-check form-switch d-flex justify-content-center">
                                            <input type="hidden" name="relay2" value="0">
                                            <input class="form-check-input device-switch" type="checkbox" name="relay2" value="1" {{ (isset($relay2) && $relay2 == 1) ? 'checked' : '' }}>
                                        </div>
                                        <div class="status-indicator mt-2">
                                            <small class="text-muted">Status: <span class="relay2-status">{{ (isset($relay2) && $relay2 == 1) ? 'ON' : 'OFF' }}</span></small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Relay 3 -->
                            <div class="col-lg-3 col-md-4 col-sm-6">
                                <div class="card h-100 shadow-sm border-0 device-control-card">
                                    <div class="card-body text-center p-3">
                                        <div class="device-icon mb-2">
                                            <i class="fa fa-lightbulb text-warning fs-3"></i>
                                        </div>
                                        <h6 class="fw-bold mb-2 text-dark">Relay 3</h6>
                                        <div class="form-check form-switch d-flex justify-content-center">
                                            <input type="hidden" name="relay3" value="0">
                                            <input class="form-check-input device-switch" type="checkbox" name="relay3" value="1" {{ (isset($relay3) && $relay3 == 1) ? 'checked' : '' }}>
                                        </div>
                                        <div class="status-indicator mt-2">
                                            <small class="text-muted">Status: <span class="relay3-status">{{ (isset($relay3) && $relay3 == 1) ? 'ON' : 'OFF' }}</span></small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Relay 4 -->
                            <div class="col-lg-3 col-md-4 col-sm-6">
                                <div class="card h-100 shadow-sm border-0 device-control-card">
                                    <div class="card-body text-center p-3">
                                        <div class="device-icon mb-2">
                                            <i class="fa fa-lightbulb text-warning fs-3"></i>
                                        </div>
                                        <h6 class="fw-bold mb-2 text-dark">Relay 4</h6>
                                        <div class="form-check form-switch d-flex justify-content-center">
                                            <input type="hidden" name="relay4" value="0">
                                            <input class="form-check-input device-switch" type="checkbox" name="relay4" value="1" {{ (isset($relay4) && $relay4 == 1) ? 'checked' : '' }}>
                                        </div>
                                        <div class="status-indicator mt-2">
                                            <small class="text-muted">Status: <span class="relay4-status">{{ (isset($relay4) && $relay4 == 1) ? 'ON' : 'OFF' }}</span></small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Relay 5 -->
                            <div class="col-lg-3 col-md-4 col-sm-6">
                                <div class="card h-100 shadow-sm border-0 device-control-card">
                                    <div class="card-body text-center p-3">
                                        <div class="device-icon mb-2">
                                            <i class="fa fa-lightbulb text-warning fs-3"></i>
                                        </div>
                                        <h6 class="fw-bold mb-2 text-dark">Relay 5</h6>
                                        <div class="form-check form-switch d-flex justify-content-center">
                                            <input type="hidden" name="relay5" value="0">
                                            <input class="form-check-input device-switch" type="checkbox" name="relay5" value="1" {{ (isset($relay5) && $relay5 == 1) ? 'checked' : '' }}>
                                        </div>
                                        <div class="status-indicator mt-2">
                                            <small class="text-muted">Status: <span class="relay5-status">{{ (isset($relay5) && $relay5 == 1) ? 'ON' : 'OFF' }}</span></small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Relay 6 -->
                            <div class="col-lg-3 col-md-4 col-sm-6">
                                <div class="card h-100 shadow-sm border-0 device-control-card">
                                    <div class="card-body text-center p-3">
                                        <div class="device-icon mb-2">
                                            <i class="fa fa-lightbulb text-warning fs-3"></i>
                                        </div>
                                        <h6 class="fw-bold mb-2 text-dark">Relay 6</h6>
                                        <div class="form-check form-switch d-flex justify-content-center">
                                            <input type="hidden" name="relay6" value="0">
                                            <input class="form-check-input device-switch" type="checkbox" name="relay6" value="1" {{ (isset($relay6) && $relay6 == 1) ? 'checked' : '' }}>
                                        </div>
                                        <div class="status-indicator mt-2">
                                            <small class="text-muted">Status: <span class="relay6-status">{{ (isset($relay6) && $relay6 == 1) ? 'ON' : 'OFF' }}</span></small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Relay 7 -->
                            <div class="col-lg-3 col-md-4 col-sm-6">
                                <div class="card h-100 shadow-sm border-0 device-control-card">
                                    <div class="card-body text-center p-3">
                                        <div class="device-icon mb-2">
                                            <i class="fa fa-lightbulb text-warning fs-3"></i>
                                        </div>
                                        <h6 class="fw-bold mb-2 text-dark">Relay 7</h6>
                                        <div class="form-check form-switch d-flex justify-content-center">
                                            <input type="hidden" name="relay7" value="0">
                                            <input class="form-check-input device-switch" type="checkbox" name="relay7" value="1" {{ (isset($relay7) && $relay7 == 1) ? 'checked' : '' }}>
                                        </div>
                                        <div class="status-indicator mt-2">
                                            <small class="text-muted">Status: <span class="relay7-status">{{ (isset($relay7) && $relay7 == 1) ? 'ON' : 'OFF' }}</span></small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Relay 8 -->
                            <div class="col-lg-3 col-md-4 col-sm-6">
                                <div class="card h-100 shadow-sm border-0 device-control-card">
                                    <div class="card-body text-center p-3">
                                        <div class="device-icon mb-2">
                                            <i class="fa fa-lightbulb text-warning fs-3"></i>
                                        </div>
                                        <h6 class="fw-bold mb-2 text-dark">Relay 8</h6>
                                        <div class="form-check form-switch d-flex justify-content-center">
                                            <input type="hidden" name="relay8" value="0">
                                            <input class="form-check-input device-switch" type="checkbox" name="relay8" value="1" {{ (isset($relay8) && $relay8 == 1) ? 'checked' : '' }}>
                                        </div>
                                        <div class="status-indicator mt-2">
                                            <small class="text-muted">Status: <span class="relay8-status">{{ (isset($relay8) && $relay8 == 1) ? 'ON' : 'OFF' }}</span></small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Livewire Overtime Control Component -->
    @if(class_exists('App\Livewire\OvertimeControl'))
        @livewire('overtime-control')
    @endif
@endsection