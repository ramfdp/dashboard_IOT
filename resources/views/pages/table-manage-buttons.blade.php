@extends('layouts.default')

@section('title', 'History Data Listrik')

@push('css')
    <link href="/assets/plugins/bootstrap-datepicker/dist/css/bootstrap-datepicker.css" rel="stylesheet" />
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css" rel="stylesheet" />
    <style>
        .history-stats-card {
            border-radius: 10px;
            transition: transform 0.2s ease-in-out;
        }
        .history-stats-card:hover {
            transform: translateY(-5px);
        }
        .filter-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            color: white;
        }
        .history-table {
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .btn-filter {
            background: linear-gradient(45deg, #28a745, #20c997);
            border: none;
            border-radius: 25px;
        }
        .btn-download {
            background: linear-gradient(45deg, #007bff, #6f42c1);
            border: none;
            border-radius: 25px;
        }
        
        /* Table alignment styling */
        #historyTable {
            table-layout: fixed;
        }
        #historyTable th,
        #historyTable td {
            text-align: center !important;
            vertical-align: middle !important;
            padding: 12px 8px;
            word-wrap: break-word;
        }
        #historyTable tbody tr:hover {
            background-color: #f8f9fa;
        }
    </style>
@endpush

@push('scripts')
    {{-- History Listrik Handler --}}
    <script src="/assets/js/history-listrik-handler.js"></script>
@endpush

@section('content')
    <!-- BEGIN breadcrumb -->
    <ol class="breadcrumb float-xl-end">
        <li class="breadcrumb-item"><a href="{{ route('dashboard-v1') }}">Dashboard</a></li>
        <li class="breadcrumb-item active">History Data Listrik</li>
    </ol>
    <!-- END breadcrumb -->
    
    <!-- BEGIN page-header -->
    <h1 class="page-header">
        <i class="fas fa-history me-3"></i>History Data Listrik 
        <small>Data historis konsumsi listrik dengan filter dan analisis lengkap</small>
    </h1>
    <!-- END page-header -->

    <!-- Filter Section -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="card shadow border-0 filter-section">
                <div class="card-body py-4">
                    <h5 class="card-title mb-4">
                        <i class="fas fa-filter me-2"></i>Filter Data History
                    </h5>
                    <div class="row">
                        <div class="col-md-3">
                            <label class="form-label">Filter Bulan:</label>
                            <select class="form-select" id="filterBulan">
                                <option value="">Semua Bulan</option>
                                <option value="01">Januari</option>
                                <option value="02">Februari</option>
                                <option value="03">Maret</option>
                                <option value="04">April</option>
                                <option value="05">Mei</option>
                                <option value="06">Juni</option>
                                <option value="07">Juli</option>
                                <option value="08">Agustus</option>
                                <option value="09">September</option>
                                <option value="10">Oktober</option>
                                <option value="11">November</option>
                                <option value="12">Desember</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Filter Tahun:</label>
                            <select class="form-select" id="filterTahun">
                                <option value="">Semua Tahun</option>
                                @for($i = date('Y'); $i >= 2020; $i--)
                                    <option value="{{ $i }}">{{ $i }}</option>
                                @endfor
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">&nbsp;</label>
                            <div>
                                <button type="button" class="btn btn-download text-white w-100" id="btnDownloadHistory">
                                    <i class="fa fa-download me-2"></i>Download CSV
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Statistics Summary -->
    <div class="row mb-4">
        <div class="col-lg-3 col-md-6 mb-3">
            <div class="card bg-primary text-white history-stats-card">
                <div class="card-body text-center">
                    <div class="d-flex align-items-center justify-content-center">
                        <i class="fas fa-database fs-1 me-3"></i>
                        <div>
                            <h6 class="mb-0">Total Records</h6>
                            <h3 class="mb-0" id="totalRecords">0</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
            <div class="card bg-success text-white history-stats-card">
                <div class="card-body text-center">
                    <div class="d-flex align-items-center justify-content-center">
                        <i class="fas fa-bolt fs-1 me-3"></i>
                        <div>
                            <h6 class="mb-0">Avg Power (W)</h6>
                            <h3 class="mb-0" id="avgPower">0</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
            <div class="card bg-warning text-white history-stats-card">
                <div class="card-body text-center">
                    <div class="d-flex align-items-center justify-content-center">
                        <i class="fas fa-fire fs-1 me-3"></i>
                        <div>
                            <h6 class="mb-0">Total Energy (kWh)</h6>
                            <h3 class="mb-0" id="totalEnergy">0</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
            <div class="card bg-danger text-white history-stats-card">
                <div class="card-body text-center">
                    <div class="d-flex align-items-center justify-content-center">
                        <i class="fas fa-chart-line fs-1 me-3"></i>
                        <div>
                            <h6 class="mb-0">Peak Power (W)</h6>
                            <h3 class="mb-0" id="peakPower">0</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- History Data Table -->
    <div class="row">
        <div class="col-12">
            <div class="card shadow border-0 history-table">
                <div class="card-header bg-dark text-white">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-table me-2"></i>History Data Listrik
                        <span class="badge bg-info ms-2" id="periodBadge">Loading...</span>
                    </h5>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-striped table-hover mb-0" id="historyTable">
                            <thead class="table-dark">
                                <tr>
                                    <th class="text-center" style="width: 60px;">No</th>
                                    <th class="text-center" style="width: 180px;">
                                        <i class="fas fa-calendar me-1"></i>Tanggal & Waktu
                                    </th>
                                    <th class="text-center" style="width: 120px;">
                                        <i class="fas fa-plug me-1"></i>Voltage (V)
                                    </th>
                                    <th class="text-center" style="width: 120px;">
                                        <i class="fas fa-tachometer-alt me-1"></i>Current (A)
                                    </th>
                                    <th class="text-center" style="width: 120px;">
                                        <i class="fas fa-bolt me-1"></i>Power (W)
                                    </th>
                                    <th class="text-center" style="width: 130px;">
                                        <i class="fas fa-fire me-1"></i>Energi (kWh)
                                    </th>
                                    <th class="text-center" style="width: 130px;">
                                        <i class="fas fa-wave-square me-1"></i>Frekuensi (Hz)
                                    </th>
                                    <th class="text-center" style="width: 120px;">
                                        <i class="fas fa-percentage me-1"></i>Power Factor
                                    </th>
                                </tr>
                            </thead>
                            <tbody id="historyTableBody">
                                <tr>
                                    <td colspan="8" class="text-center py-5">
                                        <div class="spinner-border text-primary me-3" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                        </div>
                                        <span class="text-muted">Memuat data history...</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Pagination Footer -->
                <div class="card-footer bg-light">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="text-muted" id="paginationInfo">Menampilkan 0 dari 0 records</span>
                        </div>
                        <nav aria-label="History pagination">
                            <ul class="pagination pagination-sm mb-0" id="historyPagination">
                                <!-- Pagination will be generated by JavaScript -->
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Info Cards -->
    <div class="row mt-4">
        <div class="col-md-4">
            <div class="card border-primary">
                <div class="card-body text-center">
                    <i class="fas fa-info-circle text-primary fs-2 mb-2"></i>
                    <h6 class="text-primary">Informasi</h6>
                    <small class="text-muted">Data menampilkan maksimal 100 records per halaman dengan pagination otomatis</small>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card border-success">
                <div class="card-body text-center">
                    <i class="fas fa-download text-success fs-2 mb-2"></i>
                    <h6 class="text-success">Download CSV</h6>
                    <small class="text-muted">Download akan mengambil SEMUA data pada periode yang dipilih (bisa ribuan records)</small>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card border-info">
                <div class="card-body text-center">
                    <i class="fas fa-clock text-info fs-2 mb-2"></i>
                    <h6 class="text-info">Real-time</h6>
                    <small class="text-muted">Data tersinkronisasi dengan sensor IoT dan Firebase secara real-time</small>
                </div>
            </div>
        </div>
    </div>
@endsection