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
    <script src="/assets/js/perhitung-grafik-moni.js"></script>
    <script src="/assets/js/logika-form-lembur.js"></script>
    <script src="/assets/js/fetch-api-monitoring.js"></script>
    {{-- Firebase scripts for device and overtime control --}}
    <script type="module" src="/assets/js/overtime-control-fetch.js"></script>
    <script type="module" src="/assets/js/device-firebase-control.js"></script>
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

                        <div class="row justify-content-center g-4">
                            <!-- Lampu ITMS 1 -->
                            <div class="col-lg-5 col-md-6">
                                <div class="card h-100 shadow-sm border-0 device-control-card">
                                    <div class="card-body text-center p-4">
                                        <div class="device-icon mb-3">
                                            <i class="fa fa-lightbulb text-warning fs-1"></i>
                                        </div>
                                        <h6 class="fw-bold mb-3 text-dark">Lampu ITMS 1</h6>
                                        <div class="form-check form-switch d-flex justify-content-center">
                                            <input type="hidden" name="relay1" value="0">
                                            <input class="form-check-input device-switch fs-5" type="checkbox" name="relay1" value="1" {{ (isset($relay1) && $relay1 == 1) ? 'checked' : '' }}>
                                        </div>
                                        <div class="status-indicator mt-3">
                                            <small class="text-muted">Status: <span class="relay1-status">{{ (isset($relay1) && $relay1 == 1) ? 'ON' : 'OFF' }}</span></small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Lampu ITMS 2 -->
                            <div class="col-lg-5 col-md-6">
                                <div class="card h-100 shadow-sm border-0 device-control-card">
                                    <div class="card-body text-center p-4">
                                        <div class="device-icon mb-3">
                                            <i class="fa fa-lightbulb text-warning fs-1"></i>
                                        </div>
                                        <h6 class="fw-bold mb-3 text-dark">Lampu ITMS 2</h6>
                                        <div class="form-check form-switch d-flex justify-content-center">
                                            <input type="hidden" name="relay2" value="0">
                                            <input class="form-check-input device-switch fs-5" type="checkbox" name="relay2" value="1" {{ (isset($relay2) && $relay2 == 1) ? 'checked' : '' }}>
                                        </div>
                                        <div class="status-indicator mt-3">
                                            <small class="text-muted">Status: <span class="relay2-status">{{ (isset($relay2) && $relay2 == 1) ? 'ON' : 'OFF' }}</span></small>
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

    <!-- CSS untuk Indikator dan Device Controls -->
    <style>
        .indicator {
            transition: background-color 0.3s ease; 
        }

        .device-control-card {
            transition: all 0.3s ease;
            border: 2px solid transparent;
        }

        .device-control-card:hover {
            transform: translateY(-5px);
            border-color: #007bff;
            box-shadow: 0 8px 25px rgba(0,123,255,0.15) !important;
        }

        .device-switch {
            width: 3rem !important;
            height: 1.5rem !important;
            cursor: pointer;
        }

        .device-switch:checked {
            background-color: #28a745 !important;
            border-color: #28a745 !important;
        }

        .device-icon {
            transition: color 0.3s ease;
        }

        .card-header {
            border-radius: 0.5rem 0.5rem 0 0 !important;
        }

        .device-control-card .card-body {
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        }

        .mode-status-display .badge {
            transition: all 0.3s ease;
        }

        .relay1-status, .relay2-status {
            font-weight: 600;
            text-transform: uppercase;
        }

        @media (max-width: 768px) {
            .device-control-card {
                margin-bottom: 1rem;
            }
        }

        .btn-loading {
            transition: all 0.3s ease;
        }
    </style>

    <!-- AJAX Auto Mode Script -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const enableAutoModeBtn = document.getElementById('enable-auto-mode-btn');
            const enableManualModeBtn = document.getElementById('enable-manual-mode-btn');
            const modeStatus = document.getElementById('mode-status');
            
            // Auto Mode Button Handler
            if (enableAutoModeBtn) {
                enableAutoModeBtn.addEventListener('click', function() {
                    activateMode('auto', this);
                });
            }
            
            // Manual Mode Button Handler
            if (enableManualModeBtn) {
                enableManualModeBtn.addEventListener('click', function() {
                    activateMode('manual', this);
                });
            }
            
            // Generic mode activation function
            function activateMode(mode, buttonElement) {
                // Disable both buttons and show loading state
                enableAutoModeBtn.disabled = true;
                enableManualModeBtn.disabled = true;
                
                const btnText = buttonElement.querySelector('.btn-text');
                const btnLoading = buttonElement.querySelector('.btn-loading');
                
                btnText.classList.add('d-none');
                btnLoading.classList.remove('d-none');
                
                // Get CSRF token
                const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || 
                             document.querySelector('input[name="_token"]')?.value;
                
                // Determine the endpoint and request data
                const endpoint = mode === 'auto' ? '{{ route("dashboard.auto-mode") }}' : '{{ route("dashboard.manual-mode") }}';
                
                // Make AJAX request
                fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': token,
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({})
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Update mode status based on response
                        if (mode === 'auto') {
                            modeStatus.innerHTML = '<i class="fas fa-clock me-1"></i>Mode Otomatis Aktif';
                            modeStatus.className = 'badge bg-success rounded-pill shadow';
                            
                            // Update button states
                            enableAutoModeBtn.className = 'btn btn-sm btn-success';
                            enableManualModeBtn.className = 'btn btn-sm btn-outline-warning';
                            
                            // Reset device states if available
                            if (window.resetDeviceToAutoMode) {
                                window.resetDeviceToAutoMode();
                            }
                        } else {
                            modeStatus.innerHTML = '<i class="fas fa-hand-paper me-1"></i>Mode Manual Aktif';
                            modeStatus.className = 'badge bg-warning rounded-pill shadow';
                            
                            // Update button states
                            enableAutoModeBtn.className = 'btn btn-sm btn-outline-success';
                            enableManualModeBtn.className = 'btn btn-sm btn-warning';
                            
                            // Start manual mode timer if available
                            if (window.startManualModeTimeout) {
                                window.startManualModeTimeout();
                            }
                        }
                        
                        // Show success message
                        showNotification('success', data.message || `Mode ${mode === 'auto' ? 'otomatis' : 'manual'} berhasil diaktifkan!`);
                        
                        // Notify mode manager if available
                        if (window.modeManager) {
                            window.modeManager.checkCurrentMode();
                        }
                        
                        console.log(`${mode} mode activated successfully`);
                    } else {
                        throw new Error(data.message || 'Failed to activate mode');
                    }
                })
                .catch(error => {
                    console.error(`Error activating ${mode} mode:`, error);
                    showNotification('error', `Gagal mengaktifkan mode ${mode === 'auto' ? 'otomatis' : 'manual'}. Silakan coba lagi.`);
                })
                .finally(() => {
                    // Re-enable buttons and hide loading states
                    enableAutoModeBtn.disabled = false;
                    enableManualModeBtn.disabled = false;
                    
                    // Reset all button loading states
                    document.querySelectorAll('.btn-text').forEach(el => el.classList.remove('d-none'));
                    document.querySelectorAll('.btn-loading').forEach(el => el.classList.add('d-none'));
                });
            }
            
            // Notification function
            function showNotification(type, message) {
                // Remove existing notifications
                const existingNotifications = document.querySelectorAll('.mode-notification');
                existingNotifications.forEach(notification => notification.remove());
                
                // Create notification
                const notification = document.createElement('div');
                notification.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show mode-notification`;
                notification.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
                
                notification.innerHTML = `
                    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                `;
                
                document.body.appendChild(notification);
                
                // Auto remove after 4 seconds
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 4000);
            }
        });
    </script>
    
<!-- User Management Section -->
@if(auth()->check() && auth()->user()->getRoleNames()->first() && auth()->user()->getRoleNames()->first() != 'user')
    @livewire('user-management')
@endif
@endsection