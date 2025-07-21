@extends('layouts.default')

@section('title', 'Dashboard')

@push('css')
    <link href="/assets/plugins/jvectormap-next/jquery-jvectormap.css" rel="stylesheet" />
    <link href="/assets/plugins/bootstrap-datepicker/dist/css/bootstrap-datepicker.css" rel="stylesheet" />
    <link href="/assets/plugins/gritter/css/jquery.gritter.css" rel="stylesheet" />
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css" rel="stylesheet" />
    <link href="/assets/css/indikator.css" rel="stylesheet" />
@endpush

@push('scripts')
    <script src="/assets/plugins/gritter/js/jquery.gritter.js"></script>
    <script src="/assets/plugins/flot/source/jquery.canvaswrapper.js"></script>
    <script src="/assets/plugins/flot/source/jquery.colorhelpers.js"></script>
    <script src="/assets/plugins/flot/source/jquery.flot.js"></script>
    <script src="/assets/plugins/flot/source/jquery.flot.saturated.js"></script>
    <script src="/assets/plugins/flot/source/jquery.flot.browser.js"></script>
    <script src="/assets/plugins/flot/source/jquery.flot.drawSeries.js"></script>
    <script src="/assets/plugins/flot/source/jquery.flot.uiConstants.js"></script>
    <script src="/assets/plugins/flot/source/jquery.flot.time.js"></script>
    <script src="/assets/plugins/flot/source/jquery.flot.resize.js"></script>
    <script src="/assets/plugins/flot/source/jquery.flot.pie.js"></script>
    <script src="/assets/plugins/flot/source/jquery.flot.crosshair.js"></script>
    <script src="/assets/plugins/flot/source/jquery.flot.categories.js"></script>
    <script src="/assets/plugins/flot/source/jquery.flot.navigate.js"></script>
    <script src="/assets/plugins/flot/source/jquery.flot.touchNavigate.js"></script>
    <script src="/assets/plugins/flot/source/jquery.flot.hover.js"></script>
    <script src="/assets/plugins/flot/source/jquery.flot.touch.js"></script>
    <script src="/assets/plugins/flot/source/jquery.flot.selection.js"></script>
    <script src="/assets/plugins/flot/source/jquery.flot.symbol.js"></script>
    <script src="/assets/plugins/flot/source/jquery.flot.legend.js"></script>
    <script src="/assets/plugins/jquery-sparkline/jquery.sparkline.min.js"></script>
    <script src="/assets/plugins/jvectormap-next/jquery-jvectormap.min.js"></script>
    <script src="/assets/plugins/jvectormap-content/world-mill.js"></script>
    <script src="/assets/plugins/bootstrap-datepicker/dist/js/bootstrap-datepicker.js"></script>
    <script src="/assets/js/demo/dashboard.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    {{-- <script src="/assets/js/random-gen-moni.js"></script> --}}
    <script src="/assets/js/perhitung-grafik-moni.js"></script>
    <script src="/assets/js/logika-controling.js"></script>
    <script src="/assets/js/logika-form-lembur.js"></script>
    <script src="/assets/js/realtime-charts-update.js"></script>
    <script src="/assets/js/logika-perangkat.js"></script>
    {{-- <script src="/assets/js/logika-form-lembur2.js"></script> --}}
    <script src="/assets/js/logika-user-management.js"></script>
    <script src="/assets/js/fetch-api-monitoring.js"></script>
    <script type="module" src="/assets/js/overtime-control-fetch.js"></script>
@endpush

@section('content')
    <!-- BEGIN breadcrumb -->
    <ol class="breadcrumb float-xl-end">
        <li class="breadcrumb-item"><a href="javascript:;">Home</a></li>
        <li class="breadcrumb-item active">Dashboard</li>
    </ol>
    <!-- END breadcrumb -->
    
    <!-- BEGIN page-header -->
    <h1 class="page-header">Dashboard <small>Selamat Datang di IOT Smart Building Controller</small></h1>
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
                    <h4>Total Penggunaan Listrik</h4>
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
                        <h6 class="panel-title mb-0">Penggunaan Listrik</h6>
                    </div>
                    <div class="panel-body p-4 bg-dark text-white rounded-bottom">
                        <div class="row" style="overflow-x: auto; background-color: #1e1e1e; border-radius: 8px;">
                            <canvas id="wattChart" 
                            data-labels='@json($dataKwh->pluck('waktu')->toArray())'
                            data-values='@json($dataKwh->pluck('daya')->toArray())'
                            width="1450" height="300" style="background-color: #1e1e1e;"></canvas>
                        </div>
                        <div class="row col-md-12 text-center mt-3 mb-2">
                            <button class="btn btn-primary" id="btnLihatPerhitungan">Lihat Perhitungan</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal untuk Perhitungan Listrik -->
    <div class="modal fade" id="modalPerhitunganListrik" tabindex="-1" aria-labelledby="modalPerhitunganListrikLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content bg-dark text-white">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalPerhitunganListrikLabel">Perhitungan Penggunaan Listrik</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-info">
                        <h6>Ringkasan Penggunaan</h6>
                        <div id="perhitunganSummary"></div>
                    </div>

                    <div class="form-group mb-3">
                        <label for="periodePerhitungan">Pilih Periode Perhitungan:</label>
                        <select class="form-control" id="periodePerhitungan">
                            <option value="harian" selected>Harian</option>
                            <option value="mingguan">Mingguan</option>
                            <option value="bulanan">Bulanan</option>
                        </select>
                    </div>

                    <div class="card bg-primary text-white mb-3">
                        <div class="card-body">
                            <h5 class="card-title">Total Penggunaan Listrik</h5>
                            <div class="row text-center">
                                <div class="col-6">
                                    <h3 id="totalWatt">0 Watt</h3>
                                    <p>Daya Rata-rata</p>
                                </div>
                                <div class="col-6">
                                    <h3 id="totalKwh">0 kWh</h3>
                                    <p id="periodeLabel">per hari</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card bg-secondary text-white mb-3">
                        <div class="card-body">
                            <h6 class="card-title">Informasi Detail</h6>
                            <table class="table table-dark table-sm">
                                <tbody>
                                    <tr><td>Daya Tertinggi</td><td id="dayaTertinggi">0 Watt</td></tr>
                                    <tr><td>Daya Terendah</td><td id="dayaTerendah">0 Watt</td></tr>
                                    <tr><td>Total Data</td><td id="totalData">0 titik data</td></tr>
                                    <tr><td>Energi (Harian)</td><td id="kwhHarian">0 kWh</td></tr>
                                    <tr><td>Energi (Mingguan)</td><td id="kwhMingguan">0 kWh</td></tr>
                                    <tr><td>Energi (Bulanan)</td><td id="kwhBulanan">0 kWh</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="card bg-success text-white">
                        <div class="card-body">
                            <h6 class="card-title mb-2">Prediksi Konsumsi Berikutnya</h6>

                            <!-- Dropdown Pilih Prediksi -->
                            <div class="form-group mb-2">
                                <label for="periodePrediksi">Pilih Periode Prediksi:</label>
                                <select class="form-control" id="periodePrediksi">
                                    <option value="harian" selected>Harian</option>
                                    <option value="mingguan">Mingguan</option>
                                    <option value="bulanan">Bulanan</option>
                                </select>
                            </div>

                            <!-- Hasil Prediksi -->
                            <div class="text-center">
                                <p>Prediksi daya selanjutnya: <strong id="prediksiWatt">-</strong></p>
                                <p>Estimasi energi: <strong id="prediksiKwhHarian">-</strong></p>
                            </div>
                        </div>
                    </div>

                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
                </div>
            </div>
        </div>
    </div>
    <!-- END Modal Perhitungan Listrik -->
    
    <!-- BEGIN row kontrol perangkat -->
    <div class="row mb-4">
        <div class="col text-center">
            <span id="mode-status"
                class="badge bg-success rounded-pill shadow"
                style="font-size: 1.25rem; padding: 0.75rem 1.25rem;">
                    Mode Otomatis Aktif
            </span>
        </div>
    </div>

    <form action="{{ route('dashboard.update') }}" method="POST">
        @csrf

        @if(session('success_device'))
            <div class="alert alert-success">
                {{ session('success_device') }}
            </div>
        @endif

        <div class="row g-4">
            <!-- Lampu ITMS 1 -->
            <div class="col-md-4">
                <div class="card shadow-sm rounded p-4 text-center">
                    <label class="fw-bold fs-5 mb-3">Lampu ITMS 1</label>
                    <div class="d-flex justify-content-center align-items-center gap-3">
                        <i class="fa fa-lightbulb text-primary fs-3"></i>
                        <div class="form-check form-switch">
                            <input type="hidden" name="relay1" value="0">
                            <input class="form-check-input device-switch" type="checkbox" name="relay1" value="1" {{ $relay1 == 1 ? 'checked' : '' }}>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Lampu ITMS 2 -->
            <div class="col-md-4">
                <div class="card shadow-sm rounded p-4 text-center">
                    <label class="fw-bold fs-5 mb-3">Lampu ITMS 2</label>
                    <div class="d-flex justify-content-center align-items-center gap-3">
                        <i class="fa fa-lightbulb text-primary fs-3"></i>
                        <div class="form-check form-switch">
                            <input type="hidden" name="relay2" value="0">
                            <input class="form-check-input device-switch" type="checkbox" name="relay2" value="1" {{ $relay2 == 1 ? 'checked' : '' }}>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Mode SOS -->
            <div class="col-md-4">
                <div class="card shadow-sm rounded p-4 text-center">
                    <label class="fw-bold fs-5 mb-3">Mode SOS</label>
                    <div class="d-flex justify-content-center align-items-center gap-3">
                        <i class="fa fa-bell text-danger fs-3"></i>
                        <div class="form-check form-switch">
                            <input type="hidden" name="sos" value="0">
                            <input class="form-check-input device-switch" type="checkbox" name="sos" value="1" {{ ($sos ?? 0) == 1 ? 'checked' : '' }}>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row mt-5">
            <div class="col-md-12 text-center">
                <button class="btn btn-primary btn-lg px-5 py-3 shadow fw-bold w-100" type="submit">
                    Nyalakan Mode SOS
                </button>
            </div>
        </div>
    </form>

    <!-- BEGIN Enhanced Form Lembur Section -->
    <div class="row">
        <div class="col-md-12">
            <div class="panel panel-inverse">
                <div class="panel-heading">
                    <h1 class="page-header">Timer Lembur</h1>
                </div>

                <div class="panel-body">
                    @if(session('success_overtime'))
                        <div class="alert alert-success">
                            {{ session('success_overtime') }}
                        </div>
                    @endif
                    
                    <form action="{{ route('overtime.store') }}" method="POST" id="overtime-form">
                        @csrf

                        <div class="row mb-3">
                            <div class="col-md-6">
                                <div class="form-group mb-3">
                                    <label for="division_name" class="form-label">Divisi</label>
                                    <input type="text" name="division_name" id="division_name" class="form-control @error('division_name') is-invalid @enderror" required>
                                    @error('division_name')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="form-group mb-3">
                                    <label for="employee_name" class="form-label">Nama Karyawan</label>
                                    <input type="text" name="employee_name" id="employee_name" class="form-control @error('employee_name') is-invalid @enderror" required>
                                    @error('employee_name')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row mb-3">
                            <div class="col-md-4">
                                <div class="form-group mb-3">
                                    <label for="overtime_date" class="form-label">Tanggal Lembur</label>
                                    <input type="date" name="overtime_date" id="overtime_date" class="form-control @error('overtime_date') is-invalid @enderror" value="{{ old('overtime_date', date('Y-m-d')) }}" required>
                                    @error('overtime_date')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <div class="col-md-4">
                                <div class="form-group mb-3">
                                    <label for="start_time" class="form-label">Waktu Mulai</label>
                                    <input type="time" name="start_time" id="start_time" class="form-control @error('start_time') is-invalid @enderror" value="{{ old('start_time') }}" required>
                                    @error('start_time')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <div class="col-md-4">
                                <div class="form-group mb-3">
                                    <label for="end_time" class="form-label">Waktu Selesai</label>
                                    <input type="time" name="end_time" id="end_time" class="form-control @error('end_time') is-invalid @enderror" value="{{ old('end_time') }}">
                                    @error('end_time')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                    <div class="form-text">Kosongkan jika akan diatur otomatis atau manual cut-off</div>
                                </div>
                            </div>
                        </div>

                        <div class="form-group mb-3">
                            <label for="notes" class="form-label">Catatan</label>
                            <textarea name="notes" id="notes" class="form-control @error('notes') is-invalid @enderror" rows="3" placeholder="Catatan tambahan (opsional)">{{ old('notes') }}</textarea>
                            @error('notes')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group mb-4">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Simpan
                            </button>
                            <a href="{{ route('overtime.index') }}" class="btn btn-secondary">
                                <i class="fas fa-arrow-left"></i> Kembali
                            </a>
                        </div>
                    </form>

                    <hr>

                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h4>Daftar Lembur</h4>
                        <div class="btn-group">
                            <button type="button" class="btn btn-info btn-sm" onclick="updateLemburStatusDanRelay()">
                                <i class="fas fa-sync"></i> Refresh
                            </button>
                            <button type="button" class="btn btn-warning btn-sm" onclick="resetToAutoMode()">
                                <i class="fas fa-magic"></i> Reset Auto Mode
                            </button>
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table class="table table-bordered table-striped table-hover">
                            <thead class="table-dark">
                                <tr>
                                    <th width="5%">No</th>
                                    <th width="12%">Divisi</th>
                                    <th width="12%">Nama Karyawan</th>
                                    <th width="10%">Tanggal</th>
                                    <th width="8%">Mulai</th>
                                    <th width="8%">Selesai</th>
                                    <th width="8%">Durasi</th>
                                    <th width="10%">Status</th>
                                    <th width="12%">Catatan</th>
                                    <th width="15%">Aksi</th>
                                </tr>
                            </thead>
                            <tbody id="lembur-tbody">
                                @forelse($overtimes as $index => $ot)
                                    <tr>
                                        <td>{{ $index + 1 }}</td>
                                        <td>{{ $ot->division_name }}</td>
                                        <td>{{ $ot->employee_name }}</td>
                                        <td>{{ \Carbon\Carbon::parse($ot->overtime_date)->format('d-m-Y') }}</td>
                                        <td>{{ \Carbon\Carbon::parse($ot->start_time)->format('H:i') }}</td>
                                        <td>{{ $ot->end_time ? \Carbon\Carbon::parse($ot->end_time)->format('H:i') : '-' }}</td>
                                        <td>{{ $ot->duration ? $ot->duration . ' menit' : '-' }}</td>
                                        <td>
                                            @if ($ot->status == 0)
                                                <span class="badge bg-secondary">Belum Mulai</span>
                                            @elseif ($ot->status == 1)
                                                <span class="badge bg-warning text-dark">Sedang Berjalan</span>
                                            @else
                                                <span class="badge bg-success">Selesai</span>
                                            @endif
                                        </td>
                                        <td>{{ $ot->notes ?? '-' }}</td>
                                        <td>
                                            <div class="btn-group-vertical" role="group">
                                                <div class="btn-group mb-1">
                                                    <button type="button" class="btn btn-sm btn-primary" onclick="editOvertime({{ $ot->id }})" title="Edit">
                                                        <i class="fas fa-edit"></i>
                                                    </button>
                                                    <button type="button" class="btn btn-sm btn-danger" onclick="deleteOvertime({{ $ot->id }})" title="Delete">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                                <div class="btn-group">
                                                    @if ($ot->status == 1)
                                                        <button type="button" class="btn btn-sm btn-warning" onclick="cutOffOvertime({{ $ot->id }})" title="Cut-off">
                                                            <i class="fas fa-stop"></i>
                                                        </button>
                                                    @elseif ($ot->status == 0)
                                                        <button type="button" class="btn btn-sm btn-success" onclick="startOvertime({{ $ot->id }})" title="Start">
                                                            <i class="fas fa-play"></i>
                                                        </button>
                                                    @endif
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="10" class="text-center">Belum ada data lembur.</td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination jika diperlukan -->
                    @if(method_exists($overtimes, 'links'))
                        <div class="mt-3">
                            {{ $overtimes->links() }}
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <!-- Modal untuk konfirmasi cut-off -->
    <div class="modal fade" id="cutOffModal" tabindex="-1" aria-labelledby="cutOffModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="cutOffModalLabel">Konfirmasi Cut-off Lembur</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>Apakah Anda yakin ingin menghentikan lembur ini sekarang?</p>
                    <p class="text-muted">Waktu selesai akan diatur ke waktu saat ini dan status akan berubah menjadi "Selesai".</p>
                    <form id="cutOffForm">
                        <div class="mb-3">
                            <label for="cutoff_reason" class="form-label">Alasan Cut-off</label>
                            <textarea class="form-control" id="cutoff_reason" name="cutoff_reason" rows="3" placeholder="Alasan menghentikan lembur lebih awal..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="button" class="btn btn-warning" onclick="confirmCutOff()">Ya, Hentikan</button>
                </div>
            </div>
        </div>
    </div>
    <!-- END Enhanced Form Lembur Section -->

    <!-- CSS untuk Indikator -->
    <style>
        .indicator {
            transition: background-color 0.3s ease; 
        }
    </style>
    
<!-- User Management Section -->
@if(auth()->user()->getRoleNames()->first() != 'user')
    <div class="row justify-content-center mt-4 mb-4">
        <div class="row justify-content-center mt-4 mb-4">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        <h4 class="float-start">Manajemen User</h4>
                        <button type="button" class="btn btn-primary float-end" data-bs-toggle="modal" data-bs-target="#addUserModal">
                            Tambah User
                        </button>
                    </div>

                    <div class="card-body">
                        @if(session('success_user'))
                            <div class="alert alert-success" role="alert">
                                {{ session('success_user') }}
                            </div>
                        @endif

                        @if(session('error_user'))
                            <div class="alert alert-danger" role="alert">
                                {{ session('error_user') }}
                            </div>
                        @endif

                        <div class="table-responsive">
                            <table class="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Nama</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Tanggal Dibuat</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($users as $key => $user)
                                    <tr>
                                        <td>{{ $key + 1 }}</td>
                                        <td>{{ $user->name }}</td>
                                        <td>{{ $user->email }}</td>
                                        <td>{{ $user->getRoleNames()->first() ?? 'No Role' }}</td>
                                        <td>{{ $user->created_at->format('d M Y H:i') }}</td>
                                        <td>
                                            <button type="button" class="btn btn-sm btn-info edit-btn" 
                                                data-bs-toggle="modal" 
                                                data-bs-target="#editUserModal" 
                                                data-id="{{ $user->id }}"
                                                data-name="{{ $user->name }}"
                                                data-email="{{ $user->email }}"
                                                data-role="{{ $user->roles->first()->id ?? '' }}"
                                                data-role-name="{{ $user->getRoleNames()->first() ?? '' }}">
                                                Edit
                                            </button>
                                            
                                            @if(auth()->id() !== $user->id)
                                            <button type="button" class="btn btn-sm btn-danger delete-btn"
                                                data-bs-toggle="modal"
                                                data-bs-target="#deleteUserModal"
                                                data-id="{{ $user->id }}"
                                                data-name="{{ $user->name }}">
                                                Hapus
                                            </button>
                                            @endif
                                        </td>
                                    </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Add User Modal -->
    <div class="modal fade" id="addUserModal" tabindex="-1" aria-labelledby="addUserModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="addUserModalLabel">Tambah User Baru</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form action="{{ route('user-management.store') }}" method="POST">
                    @csrf
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="name" class="form-label">Nama</label>
                            <input type="text" class="form-control" id="name" name="name" required>
                        </div>
                        <div class="mb-3">
                            <label for="email" class="form-label">Email</label>
                            <input type="email" class="form-control" id="email" name="email" required>
                        </div>
                        <div class="mb-3">
                            <label for="password" class="form-label">Password</label>
                            <input type="password" class="form-control" id="password" name="password" required>
                        </div>
                        <div class="mb-3">
                            <label for="role_id" class="form-label">Role</label>
                            <select class="form-select" id="role_id" name="role_id" required>
                                @foreach($roles as $role)
                                    <option value="{{ $role->id }}">{{ $role->name }}</option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                        <button type="submit" class="btn btn-primary">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Edit User Modal -->
    <div class="modal fade" id="editUserModal" tabindex="-1" aria-labelledby="editUserModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="editUserModalLabel">Edit User</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form id="editUserForm" method="POST">
                    @csrf
                    @method('PUT')
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="edit_name" class="form-label">Nama</label>
                            <input type="text" class="form-control" id="edit_name" name="name" required>
                        </div>
                        <div class="mb-3">
                            <label for="edit_email" class="form-label">Email</label>
                            <input type="email" class="form-control" id="edit_email" name="email" required>
                        </div>
                        <div class="mb-3">
                            <label for="edit_password" class="form-label">Password (Kosongkan jika tidak ingin mengubah)</label>
                            <input type="password" class="form-control" id="edit_password" name="password">
                        </div>
                        <div class="mb-3">
                            <label for="edit_role_id" class="form-label">Role</label>
                            <select class="form-select" id="edit_role_id" name="role_id" required>
                                @foreach($roles as $role)
                                    <option value="{{ $role->id }}">{{ $role->name }}</option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                        <button type="submit" class="btn btn-primary">Update</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Delete User Modal -->
    <div class="modal fade" id="deleteUserModal" tabindex="-1" aria-labelledby="deleteUserModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="deleteUserModalLabel">Konfirmasi Hapus</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>Anda yakin ingin menghapus user <span id="delete_user_name"></span>?</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <form id="deleteUserForm" method="POST">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="btn btn-danger">Hapus</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
@endif
@endsection