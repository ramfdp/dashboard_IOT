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
    {{-- Commented out to prevent conflicts with device-firebase-control.js --}}
    {{-- <script src="/assets/js/logika-controling.js"></script> --}}
    <script src="/assets/js/logika-form-lembur.js"></script>
    {{-- <script src="/assets/js/realtime-charts-update.js"></script> --}}
    {{-- Commented out to prevent conflicts with device-firebase-control.js --}}
    {{-- <script src="/assets/js/logika-perangkat.js"></script> --}}
    {{-- <script src="/assets/js/logika-form-lembur2.js"></script> --}}
    {{-- User management now handled by Livewire component --}}
    {{-- <script src="/assets/js/logika-user-management.js"></script> --}}
    <script src="/assets/js/fetch-api-monitoring.js"></script>
    {{-- Firebase scripts for device and overtime control --}}
    <script type="module" src="/assets/js/overtime-control-fetch.js"></script>
    <script type="module" src="/assets/js/device-firebase-control.js"></script>
    {{-- Temporarily disabled to prevent conflicts: <script type="module" src="/assets/js/LightSchedule.js"></script> --}}
    <script src="/assets/js/LightScheduleManager.js"></script>
    <script src="/assets/js/ModeManager.js"></script>
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
                            data-labels='@json(isset($dataKwh) ? $dataKwh->pluck('waktu')->toArray() : [])'
                            data-values='@json(isset($dataKwh) ? $dataKwh->pluck('daya')->toArray() : [])'
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
            <div class="mt-2">
                <form action="{{ route('dashboard.auto-mode') }}" method="POST" style="display: inline;">
                    @csrf
                    <button type="submit" class="btn btn-sm btn-primary">
                        <i class="fa fa-robot"></i> Aktifkan Mode Otomatis
                    </button>
                </form>
            </div>
        </div>
    </div>

    <!-- Jadwal Lampu -->
    <div class="row mb-4">
        <div class="col-md-12">
            <div class="card shadow-sm rounded p-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h4>Scheduler Lampu Kantor (Semua Lampu)</h4>
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

    <form action="{{ route('dashboard.update') }}" method="POST">
        @csrf

        @if(session()->has('success_device'))
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
                            <input class="form-check-input device-switch" type="checkbox" name="relay1" value="1" {{ (isset($relay1) && $relay1 == 1) ? 'checked' : '' }}>
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
                            <input class="form-check-input device-switch" type="checkbox" name="relay2" value="1" {{ (isset($relay2) && $relay2 == 1) ? 'checked' : '' }}>
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
                            <input class="form-check-input device-switch" type="checkbox" name="sos" value="1" {{ (isset($sos) && $sos == 1) ? 'checked' : '' }}>
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

    <!-- Livewire Overtime Control Component -->
    @if(class_exists('App\Livewire\OvertimeControl'))
        @livewire('overtime-control')
    @endif

    <!-- CSS untuk Indikator -->
    <style>
        .indicator {
            transition: background-color 0.3s ease; 
        }
    </style>
    
<!-- User Management Section -->
@if(auth()->check() && auth()->user()->getRoleNames()->first() && auth()->user()->getRoleNames()->first() != 'user')
    @livewire('user-management')
@endif
@endsection