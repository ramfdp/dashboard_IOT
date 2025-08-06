@extends('layouts.default')

@section('title', 'Dashboard')

@push('css')
    <link href="/assets/plugins/bootstrap-datepicker/dist/css/bootstrap-datepicker.css" rel="stylesheet" />
    <link href="/assets/plugins/gritter/css/jquery.gritter.css" rel="stylesheet" />
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css" rel="stylesheet" />
    <link href="/assets/css/indikator.css" rel="stylesheet" />
    <link href="/assets/css/dashboard-v1.css" rel="stylesheet" />
    <link href="/assets/css/advanced-electricity-calculator.css" rel="stylesheet" />
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
    <script src="/assets/plugins/bootstrap-datepicker/dist/js/bootstrap-datepicker.js"></script>
    <script src="/assets/js/demo/dashboard.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    {{-- TensorFlow.js - Only core modules for optimized loading --}}
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core@4.15.0/dist/tf-core.min.js" async defer></script>
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter@4.15.0/dist/tf-converter.min.js" async defer></script>
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-cpu@4.15.0/dist/tf-backend-cpu.min.js" async defer></script>
    
    {{-- Advanced electricity calculator for analysis and export functionality --}}
    <script src="/assets/js/advanced-electricity-calculator.js" async defer></script>
    
    <script src="/assets/js/logika-form-lembur.js"></script>
    <script src="/assets/js/fetch-api-monitoring.js"></script>
    {{-- Firebase scripts for device and overtime control --}}
    <script type="module" src="/assets/js/overtime-control-fetch.js"></script>
    <script type="module" src="/assets/js/device-firebase-control.js"></script>
    <script src="/assets/js/LightScheduleManager.js"></script>
    <script src="/assets/js/ModeManager.js"></script>
    
    {{-- Initialize dashboard routes for mode control --}}
    <script>
        window.dashboardRoutes = {
            autoMode: '{{ route("dashboard.auto-mode") }}',
            manualMode: '{{ route("dashboard.manual-mode") }}'
        };
    </script>
    <script src="/assets/js/dashboard-mode-control.js"></script>
    
    {{-- Analysis Export Functionality --}}
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize electricity usage chart
            initializeElectricityChart();

            // Mock prediction data for demonstration
            const mockPredictionData = {
                next_hour_power: 771.17,
                next_24h_energy: 14.17,
                average_confidence: 0.85 // 85% confidence
            };

            // Initialize electricity usage chart
            function initializeElectricityChart() {
                const canvas = document.getElementById('wattChart');
                if (!canvas) {
                    console.error('Canvas wattChart tidak ditemukan');
                    return;
                }

                // Get data from canvas attributes
                const labels = JSON.parse(canvas.dataset.labels || '[]');
                const values = JSON.parse(canvas.dataset.values || '[]').map(parseFloat);

                // If no data, create sample data for demonstration
                if (labels.length === 0 || values.length === 0) {
                    const now = new Date();
                    const sampleLabels = [];
                    const sampleValues = [];
                    
                    for (let i = 23; i >= 0; i--) {
                        const time = new Date(now.getTime() - (i * 60 * 60 * 1000));
                        sampleLabels.push(time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
                        // Generate realistic power usage data (office hours pattern)
                        const hour = time.getHours();
                        let baseLoad = 200; // Base load
                        if (hour >= 8 && hour <= 17) {
                            baseLoad = 600 + Math.random() * 200; // Business hours
                        } else if (hour >= 18 && hour <= 22) {
                            baseLoad = 400 + Math.random() * 100; // Evening
                        } else {
                            baseLoad = 100 + Math.random() * 50; // Night/early morning
                        }
                        sampleValues.push(Math.round(baseLoad));
                    }
                    
                    labels.length = 0;
                    values.length = 0;
                    labels.push(...sampleLabels);
                    values.push(...sampleValues);
                }

                const ctx = canvas.getContext('2d');
                
                // Create gradient
                const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, 'rgba(0, 255, 136, 0.3)');
                gradient.addColorStop(1, 'rgba(0, 255, 136, 0.05)');

                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Daya Aktual (W)',
                            data: values,
                            borderColor: '#00ff88',
                            backgroundColor: gradient,
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: '#00ff88',
                            pointBorderColor: '#ffffff',
                            pointBorderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top',
                                labels: {
                                    color: '#ffffff',
                                    font: {
                                        size: 12
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                ticks: {
                                    color: '#ffffff',
                                    maxTicksLimit: 12
                                },
                                grid: {
                                    color: 'rgba(255,255,255,0.1)'
                                },
                                title: {
                                    display: true,
                                    text: 'Waktu',
                                    color: '#ffffff'
                                }
                            },
                            y: {
                                ticks: {
                                    color: '#ffffff',
                                    callback: function(value) {
                                        return value + ' W';
                                    }
                                },
                                grid: {
                                    color: 'rgba(255,255,255,0.1)'
                                },
                                title: {
                                    display: true,
                                    text: 'Daya (Watt)',
                                    color: '#ffffff'
                                }
                            }
                        },
                        animation: {
                            duration: 1000,
                            easing: 'easeInOutQuart'
                        }
                    }
                });

                console.log('Chart initialized with', values.length, 'data points');
            }

            // Initialize prediction display
            function updatePredictionDisplay() {
                // Update prediction values
                document.getElementById('prediksiWatt').textContent = `${mockPredictionData.next_hour_power} Watt`;
                document.getElementById('prediksiKwhHarian').textContent = `${mockPredictionData.next_24h_energy} kWh`;
                
                // Update confidence level
                const confidencePercent = Math.round(mockPredictionData.average_confidence * 100);
                document.getElementById('confidenceLevel').textContent = `${confidencePercent}%`;
                document.getElementById('confidencePercentage').textContent = `${confidencePercent}%`;
                
                // Update confidence indicator color
                const confidenceElement = document.getElementById('confidenceLevel');
                if (confidenceElement) {
                    confidenceElement.className = 'badge ';
                    if (confidencePercent >= 80) {
                        confidenceElement.className += 'bg-success';
                    } else if (confidencePercent >= 60) {
                        confidenceElement.className += 'bg-warning';
                    } else {
                        confidenceElement.className += 'bg-danger';
                    }
                }
            }

            // Initialize when modal is opened
            document.getElementById('btnLihatPerhitungan')?.addEventListener('click', function() {
                setTimeout(() => {
                    updatePredictionDisplay();
                }, 500); // Small delay to ensure modal is fully loaded
            });

            // Export Analysis functionality
            document.getElementById('exportAnalysis')?.addEventListener('click', function() {
                const analysisData = {
                    timestamp: new Date().toISOString(),
                    periode: document.getElementById('periodePerhitungan')?.value || 'harian',
                    statistik: {
                        totalWatt: document.getElementById('totalWatt')?.textContent || '0 W',
                        totalKwh: document.getElementById('totalKwh')?.textContent || '0 kWh',
                        dayaTertinggi: document.getElementById('dayaTertinggi')?.textContent || '0 W',
                        dayaTerendah: document.getElementById('dayaTerendah')?.textContent || '0 W',
                        totalData: document.getElementById('totalData')?.textContent || '0',
                        kwhHarian: document.getElementById('kwhHarian')?.textContent || '0 kWh',
                        kwhMingguan: document.getElementById('kwhMingguan')?.textContent || '0 kWh',
                        kwhBulanan: document.getElementById('kwhBulanan')?.textContent || '0 kWh'
                    },
                    prediksi: {
                        prediksiWatt: document.getElementById('prediksiWatt')?.textContent || '-',
                        prediksiKwhHarian: document.getElementById('prediksiKwhHarian')?.textContent || '-',
                        confidenceLevel: document.getElementById('confidenceLevel')?.textContent || '-',
                        confidencePercentage: document.getElementById('confidencePercentage')?.textContent || '--%'
                    }
                };

                // Create and download CSV
                const csvContent = generateCSVContent(analysisData);
                downloadCSV(csvContent, `analisis_listrik_${new Date().toISOString().split('T')[0]}.csv`);
            });

            function generateCSVContent(data) {
                const csv = [];
                csv.push('Laporan Analisis Penggunaan Listrik');
                csv.push(`Tanggal Export,${data.timestamp}`);
                csv.push(`Periode Analisis,${data.periode}`);
                csv.push('');
                csv.push('STATISTIK PENGGUNAAN');
                csv.push(`Rata-rata Daya,${data.statistik.totalWatt}`);
                csv.push(`Total Energi,${data.statistik.totalKwh}`);
                csv.push(`Daya Puncak,${data.statistik.dayaTertinggi}`);
                csv.push(`Daya Minimum,${data.statistik.dayaTerendah}`);
                csv.push(`Jumlah Data,${data.statistik.totalData}`);
                csv.push(`Energi Harian,${data.statistik.kwhHarian}`);
                csv.push(`Energi Mingguan,${data.statistik.kwhMingguan}`);
                csv.push(`Energi Bulanan,${data.statistik.kwhBulanan}`);
                csv.push('');
                csv.push('PREDIKSI CERDAS');
                csv.push(`Prediksi Jam Berikutnya,${data.prediksi.prediksiWatt}`);
                csv.push(`Prediksi Total Energi,${data.prediksi.prediksiKwhHarian}`);
                csv.push(`Tingkat Confidence,${data.prediksi.confidenceLevel}`);
                csv.push(`Persentase Confidence,${data.prediksi.confidencePercentage}`);
                
                return csv.join('\n');
            }

            function downloadCSV(csvContent, filename) {
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                if (link.download !== undefined) {
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', filename);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }
        });
    </script>
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
        <div class="modal-dialog modal-lg">
            <div class="modal-content bg-dark text-white">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalPerhitunganListrikLabel">
                        <i class="fa fa-chart-line me-2"></i>Analisis Penggunaan Listrik Lanjutan
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <!-- Analysis Summary -->
                    <div class="alert alert-info">
                        <h6><i class="fa fa-info-circle me-2"></i>Ringkasan Analisis</h6>
                        <div id="perhitunganSummary"></div>
                    </div>

                    <!-- Period Selection -->
                    <div class="row mb-3">
                        <div class="col-md-12">
                            <label for="periodePerhitungan">Periode Analisis:</label>
                            <select class="form-control" id="periodePerhitungan">
                                <option value="harian" selected>Harian (24 jam)</option>
                                <option value="mingguan">Mingguan (7 hari)</option>
                                <option value="bulanan">Bulanan (30 hari)</option>
                            </select>
                        </div>
                        <!-- Hidden algorithm selection - KNN is used by default -->
                        <div class="col-md-6 d-none">
                            <label for="algorithmSelect">Algoritma Prediksi:</label>
                            <select class="form-control" id="algorithmSelect">
                                <option value="knn" selected>K-Nearest Neighbors (KNN)</option>
                            </select>
                        </div>
                    </div>

                    <!-- Statistics Cards -->
                    <div class="row mb-3">
                        <div class="col-md-12">
                            <div class="card bg-primary text-white">
                                <div class="card-body">
                                    <h6 class="card-title"><i class="fa fa-bolt me-2"></i>Penggunaan Saat Ini</h6>
                                    <div class="row text-center">
                                        <div class="col-6">
                                            <h4 id="totalWatt">0 W</h4>
                                            <small>Rata-rata Daya</small>
                                        </div>
                                        <div class="col-6">
                                            <h4 id="totalKwh">0 kWh</h4>
                                            <small id="periodeLabel">per hari</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Hidden Efficiency Metrics -->
                        <div class="col-md-6 d-none">
                            <div class="card bg-info text-white">
                                <div class="card-body">
                                    <h6 class="card-title"><i class="fa fa-chart-bar me-2"></i>Metrik Efisiensi</h6>
                                    <div id="efficiencyMetrics">
                                        <div class="text-center">
                                            <small>Calculating...</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Detailed Statistics -->
                    <div class="card bg-secondary text-white mb-3">
                        <div class="card-body">
                            <h6 class="card-title"><i class="fa fa-table me-2"></i>Statistik Detail</h6>
                            <div class="row">
                                <div class="col-md-6">
                                    <table class="table table-dark table-sm">
                                        <tbody>
                                            <tr><td>Daya Puncak</td><td id="dayaTertinggi">0 W</td></tr>
                                            <tr><td>Daya Minimum</td><td id="dayaTerendah">0 W</td></tr>
                                            <tr><td>Titik Data</td><td id="totalData">0</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div class="col-md-6">
                                    <table class="table table-dark table-sm">
                                        <tbody>
                                            <tr><td>Energi Harian</td><td id="kwhHarian">0 kWh</td></tr>
                                            <tr><td>Energi Mingguan</td><td id="kwhMingguan">0 kWh</td></tr>
                                            <tr><td>Energi Bulanan</td><td id="kwhBulanan">0 kWh</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Predictions -->
                    <div class="card bg-success text-white mb-3">
                        <div class="card-body">
                            <h6 class="card-title"><i class="fa fa-crystal-ball me-2"></i>Prediksi Cerdas</h6>
                            <div class="row">
                                <div class="col-md-8">
                                    <div class="form-group mb-2">
                                        <label for="periodePrediksi">Horizon Prediksi:</label>
                                        <select class="form-control" id="periodePrediksi">
                                            <option value="1">Jam Berikutnya</option>
                                            <option value="6">6 Jam Berikutnya</option>
                                            <option value="24" selected>24 Jam Berikutnya</option>
                                            <option value="72">3 Hari Berikutnya</option>
                                        </select>
                                    </div>
                                    <div class="prediction-results">
                                        <p>Jam Berikutnya: <strong id="prediksiWatt">-</strong></p>
                                        <p>Total Energi: <strong id="prediksiKwhHarian">-</strong></p>
                                        <p>Confidence: <span id="confidenceLevel" class="badge">-</span></p>
                                    </div>
                                </div>
                                <div class="col-md-4 text-center">
                                    <div class="prediction-gauge">
                                        <div class="confidence-indicator" id="confidenceIndicator">
                                            <div class="confidence-circle">
                                                <span id="confidencePercentage">--%</span>
                                            </div>
                                            <small>Confidence Prediksi</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-info" id="exportAnalysis">
                        <i class="fa fa-download me-2"></i>Export Analysis
                    </button>
                    <button type="button" class="btn btn-success" id="refreshAnalysis">
                        <i class="fa fa-refresh me-2"></i>Refresh
                    </button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
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

<!-- User Management Section -->
@if(auth()->check() && auth()->user()->getRoleNames()->first() && auth()->user()->getRoleNames()->first() != 'user')
    @livewire('user-management')
@endif
@endsection