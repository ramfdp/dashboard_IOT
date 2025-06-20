# Dashboard View (dashboard-v1.blade.php)

```php
@extends('layouts.default')

@section('title', 'Dashboard')

@push('css')
    <link href="/assets/plugins/jvectormap-next/jquery-jvectormap.css" rel="stylesheet" />
    <link href="/assets/plugins/bootstrap-datepicker/dist/css/bootstrap-datepicker.css" rel="stylesheet" />
    <link href="/assets/plugins/gritter/css/jquery.gritter.css" rel="stylesheet" />
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css" rel="stylesheet" />
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
    
    <!-- SECTION: Parameter Penggunaan -->
    <div class="row">
        <div class="col-xl-4 col-md-6">
            <div class="widget widget-stats bg-blue">
                <div class="stats-icon"><i class="fa fa-lightbulb"></i></div>
                <div class="stats-info">
                    <h4>Total Penggunaan Lampu</h4>
                    <p id="lampu-value">0 KWh</p>
                </div>
            </div>
        </div>

        <div class="col-xl-4 col-md-6">
            <div class="widget widget-stats bg-blue">
                <div class="stats-icon"><i class="fa fa-thermometer-half"></i></div>
                <div class="stats-info">
                    <h4>Suhu Ruangan</h4>
                    <p id="suhu-value">0 °C</p>
                </div>
            </div>
        </div>

        <div class="col-xl-4 col-md-6">
            <div class="widget widget-stats bg-info">
                <div class="stats-icon"><i class="fa fa-snowflake"></i></div>
                <div class="stats-info">
                    <h4>Total Penggunaan Pendingin Ruangan</h4>
                    <p id="ac-value">0 KWh</p>
                </div>
            </div>
        </div>

        <div class="col-xl-4 col-md-6">
            <div class="widget widget-stats bg-orange">
                <div class="stats-icon"><i class="fa fa-bolt"></i></div>
                <div class="stats-info">
                    <h4>Total Penggunaan Listrik</h4>
                    <p id="listrik-value">0 KWh</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        function getRandomFloat(min, max, decimals = 2) {
            const str = (Math.random() * (max - min) + min).toFixed(decimals);
            return parseFloat(str);
        }

        function updateSimulasiData() {
            const lampuUsage = getRandomFloat(120, 250); // dalam KWh
            const acUsage = getRandomFloat(200, 400); // dalam KWh
            const electricityUsage = lampuUsage + acUsage + getRandomFloat(50, 150); // total
            const suhu = getRandomFloat(25, 31); // suhu ruangan

            document.getElementById('lampu-value').textContent = lampuUsage + ' KWh';
            document.getElementById('ac-value').textContent = acUsage + ' KWh';
            document.getElementById('listrik-value').textContent = electricityUsage.toFixed(2) + ' KWh';
            document.getElementById('suhu-value').textContent = suhu + ' °C';
        }

        // Panggil pertama kali
        updateSimulasiData();

        // Perbarui setiap 1 menit
        setInterval(updateSimulasiData, 60000);
    </script>


    <!-- END SECTION: Parameter Penggunaan -->

    <!-- Monitoring Gauge Chart -->
    <div class="container-fluid">
        <div class="row">
            <div class="col-md-12">
                <div class="panel panel-inverse shadow-sm rounded-lg w-100 mb-4">
                    <div class="panel-heading d-flex justify-content-between align-items-center bg-black text-white p-3 rounded-top">
                        <h6 class="panel-title mb-0">Penggunaan Listrik</h6>
                    </div>
                    <div class="panel-body p-4 bg-dark text-white rounded-bottom">
                        <!-- Scrollable Chart -->
                        <div class="row" style="overflow-x: auto; background-color: #1e1e1e; border-radius: 8px;">
                            <canvas id="wattChart" width="1450" height="300" style="background-color: #1e1e1e;"></canvas>
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
                    
                    <div class="card bg-secondary text-white">
                        <div class="card-body">
                            <h6 class="card-title">Informasi Detail</h6>
                            <div class="table-responsive">
                                <table class="table table-dark table-sm">
                                    <tbody id="detailPenggunaan">
                                        <tr>
                                            <td>Daya Tertinggi</td>
                                            <td id="dayaTertinggi">0 Watt</td>
                                        </tr>
                                        <tr>
                                            <td>Daya Terendah</td>
                                            <td id="dayaTerendah">0 Watt</td>
                                        </tr>
                                        <tr>
                                            <td>Total Data</td>
                                            <td id="totalData">0 titik data</td>
                                        </tr>
                                        <tr>
                                            <td>Energi (Harian)</td>
                                            <td id="kwhHarian">0 kWh</td>
                                        </tr>
                                        <tr>
                                            <td>Energi (Mingguan)</td>
                                            <td id="kwhMingguan">0 kWh</td>
                                        </tr>
                                        <tr>
                                            <td>Energi (Bulanan)</td>
                                            <td id="kwhBulanan">0 kWh</td>
                                        </tr>
                                    </tbody>
                                </table>
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

    <script>
    document.addEventListener('DOMContentLoaded', function () {
        const ctx = document.getElementById('wattChart').getContext('2d');

        const gradWatt = ctx.createLinearGradient(0, 0, 0, 300);
        gradWatt.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
        gradWatt.addColorStop(1, 'rgba(255, 255, 255, 0)');

        const labels = @json($dataKwh->pluck('waktu')->toArray());
        const dataValues = @json($dataKwh->pluck('daya')->toArray());

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Daya (Watt)',
                    data: dataValues,
                    fill: true,
                    backgroundColor: gradWatt,
                    borderColor: '#ffffff',
                    pointBackgroundColor: '#ffffff',
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true, backgroundColor: '#333', titleColor: '#fff', bodyColor: '#fff' }
                },
                scales: {
                    x: {
                        ticks: { color: '#fff' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    y: {
                        ticks: { color: '#fff' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                }
            }
        });

        // Script untuk perhitungan listrik
        const btnLihatPerhitungan = document.getElementById('btnLihatPerhitungan');
        const modalPerhitunganListrik = new bootstrap.Modal(document.getElementById('modalPerhitunganListrik'));
        const periodePerhitungan = document.getElementById('periodePerhitungan');
        
        // Fungsi untuk menghitung penggunaan listrik berdasarkan periode
        function hitungPenggunaanListrik(periode = 'harian') {
            // Ambil data dari grafik
            const dayaValues = dataValues.map(d => parseFloat(d));
            
            // Hitung statistik dasar
            const rataDaya = dayaValues.reduce((a, b) => a + b, 0) / dayaValues.length;
            const dayaTertinggi = Math.max(...dayaValues);
            const dayaTerendah = Math.min(...dayaValues);
            
            // Konversi ke kWh berdasarkan periode
            let kwhValue = 0;
            let periodeText = '';
            
            switch(periode) {
                case 'harian':
                    kwhValue = (rataDaya * 24) / 1000;
                    periodeText = 'per hari';
                    break;
                case 'mingguan':
                    kwhValue = (rataDaya * 24 * 7) / 1000;
                    periodeText = 'per minggu';
                    break;
                case 'bulanan':
                    kwhValue = (rataDaya * 24 * 30) / 1000; // asumsi 30 hari dalam sebulan
                    periodeText = 'per bulan';
                    break;
            }
            
            // Tampilkan hasil perhitungan
            document.getElementById('totalWatt').textContent = `${rataDaya.toFixed(2)} Watt`;
            document.getElementById('totalKwh').textContent = `${kwhValue.toFixed(2)} kWh`;
            document.getElementById('periodeLabel').textContent = periodeText;
            document.getElementById('dayaTertinggi').textContent = `${dayaTertinggi.toFixed(2)} Watt`;
            document.getElementById('dayaTerendah').textContent = `${dayaTerendah.toFixed(2)} Watt`;
            document.getElementById('totalData').textContent = `${dayaValues.length} titik data`;
            
            // Hitung dan tampilkan energi untuk semua periode
            const kwhHarian = (rataDaya * 24) / 1000;
            const kwhMingguan = kwhHarian * 7;
            const kwhBulanan = kwhHarian * 30;
            
            document.getElementById('kwhHarian').textContent = `${kwhHarian.toFixed(2)} kWh`;
            document.getElementById('kwhMingguan').textContent = `${kwhMingguan.toFixed(2)} kWh`;
            document.getElementById('kwhBulanan').textContent = `${kwhBulanan.toFixed(2)} kWh`;
            
            // Tampilkan ringkasan sesuai periode
            const perhitunganSummary = document.getElementById('perhitunganSummary');
            perhitunganSummary.innerHTML = `
                <p>Berdasarkan data penggunaan listrik pada grafik, rata-rata penggunaan daya adalah 
                <strong>${rataDaya.toFixed(2)} Watt</strong>. Dengan asumsi penggunaan selama 24 jam, 
                estimasi konsumsi energi adalah <strong>${kwhValue.toFixed(2)} kWh ${periodeText}</strong>.</p>
            `;
        }
        
        // Event listener untuk dropdown periode
        periodePerhitungan.addEventListener('change', function() {
            hitungPenggunaanListrik(this.value);
        });
        
        // Event listener untuk tombol lihat perhitungan
        btnLihatPerhitungan.addEventListener('click', function() {
            hitungPenggunaanListrik(periodePerhitungan.value);
            modalPerhitunganListrik.show();
        });
    });
    </script>

    <!-- BEGIN row -->
    <div class="container-fluid mt-4">
        <div class="row">
            <!-- BEGIN COL-12 -->
            <div class="col-md-12">
                <div class="panel panel-inverse shadow-sm rounded-lg w-100 mb-4" data-sortable-id="index-9">
                    <div class="panel-heading d-flex justify-content-between align-items-center bg-dark text-white p-3 rounded-top">
                        <h4 class="panel-title mb-0">Perangkat</h4>
                        <select class="form-select w-auto bg-light border-0" id="building-select">
                            <option value="cm1">ITMS</option>
                            <option value="cm2">HR</option>
                            <option value="cm3">---</option>
                            <option value="sportcenter">---</option>
                        </select>
                    </div>
                    <div class="panel-body p-4">
                        <div id="device-container">
                            <!-- Perangkat ITMS -->
                            <div class="device-group" data-building="cm1">
                                <label class="device-title mb-3">Lampu</label>

                                <div class="device-row d-flex justify-content-between gap-4 mb-4">
                                    <div class="device-container d-flex flex-column align-items-start">
                                        <label class="device-label">Lampu ITMS 1</label>
                                        <div class="d-flex align-items-center gap-3">
                                            <i class="fa fa-lightbulb text-primary fs-4"></i>
                                            <div class="form-check form-switch">
                                                <input class="form-check-input device-switch" type="checkbox">
                                            </div>
                                            <div class="indicator"></div>
                                        </div>
                                    </div>

                                    <div class="device-container d-flex flex-column align-items-start">
                                        <label class="device-label">Lampu ITMS 2</label>
                                        <div class="d-flex align-items-center gap-3">
                                            <i class="fa fa-lightbulb text-primary fs-4"></i>
                                            <div class="form-check form-switch">
                                                <input class="form-check-input device-switch" type="checkbox">
                                            </div>
                                            <div class="indicator"></div>
                                        </div>
                                    </div>

                                    <div class="device-container d-flex flex-column align-items-start">
                                        <label class="device-label">Lampu ITMS 3</label>
                                        <div class="d-flex align-items-center gap-3">
                                            <i class="fa fa-lightbulb text-primary fs-4"></i>
                                            <div class="form-check form-switch">
                                                <input class="form-check-input device-switch" type="checkbox">
                                            </div>
                                            <div class="indicator"></div>
                                        </div>
                                    </div>
                                </div>

                                <label class="device-title mb-3">AC</label>

                                <div class="device-row d-flex justify-content-between gap-4">
                                    <div class="device-container d-flex flex-column align-items-start">
                                        <label class="device-label">AC ITMS 1</label>
                                        <div class="d-flex align-items-center gap-3">
                                            <i class="fa fa-snowflake text-primary fs-4"></i>
                                            <div class="form-check form-switch">
                                                <input class="form-check-input device-switch" type="checkbox">
                                            </div>
                                            <div class="indicator"></div>
                                        </div>
                                    </div>

                                    <div class="device-container d-flex flex-column align-items-start">
                                        <label class="device-label">AC ITMS 2</label>
                                        <div class="d-flex align-items-center gap-3">
                                            <i class="fa fa-snowflake text-primary fs-4"></i>
                                            <div class="form-check form-switch">
                                                <input class="form-check-input device-switch" type="checkbox">
                                            </div>
                                            <div class="indicator"></div>
                                        </div>
                                    </div>

                                    <div class="device-container d-flex flex-column align-items-start">
                                        <label class="device-label">AC ITMS 3</label>
                                        <div class="d-flex align-items-center gap-3">
                                            <i class="fa fa-snowflake text-primary fs-4"></i>
                                            <div class="form-check form-switch">
                                                <input class="form-check-input device-switch" type="checkbox">
                                            </div>
                                            <div class="indicator"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Perangkat HC -->
                            <div class="device-group d-none" data-building="sportcenter">
                                <h5 class="mb-3">HC</h5>
                                <div class="d-flex align-items-center">
                                    <i class="fa fa-snowflake text-primary fs-4"></i>
                                    <span class="ms-2">AC HC</span>
                                    <div class="form-check form-switch ms-3">
                                        <input class="form-check-input device-switch" type="checkbox" id="hc-ac">
                                    </div>
                                    <div id="hc-ac-indicator" class="indicator ms-2"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- END COL-12 -->
        </div>
    </div>
    <!-- END row -->

    <!-- JavaScript untuk Logika -->
    <script>
    document.addEventListener("DOMContentLoaded", function () {
        const buildingSelect = document.getElementById("building-select");
        const deviceGroups = document.querySelectorAll(".device-group");

        // Fungsi untuk memperbarui tampilan perangkat berdasarkan ruangan yang dipilih
        function updateDevices(selectedBuilding) {
            deviceGroups.forEach(group => {
                if (group.getAttribute("data-building") === selectedBuilding) {
                    group.classList.remove("d-none");
                } else {
                    group.classList.add("d-none");
                }
            });
        }

        // Event listener untuk perubahan dropdown
        buildingSelect.addEventListener("change", function () {
            updateDevices(this.value);
        });

        // Event listener untuk switch (ubah warna indikator)
        document.querySelectorAll(".device-switch").forEach(switchElement => {
            switchElement.addEventListener("change", function () {
                // Cari indikator terdekat dalam container yang sama
                const indicator = this.closest(".d-flex").querySelector(".indicator");
                if (indicator) {
                    indicator.style.backgroundColor = this.checked ? "green" : "grey";
                }
            });
        });

        // Set awal (tampilkan perangkat dari ruangan pertama)
        updateDevices(buildingSelect.value);
    });
    </script>

    <!-- CSS untuk Indikator -->
    <style>
    .indicator {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: grey;
        transition: background-color 0.3s ease;
    }

    .device-container {
        margin-bottom: 20px; /* Kasih jarak antar perangkat */
    }

    .device-title {
        font-size: 18px;
        font-weight: bold;
        background-color: #343a40;
        color: white;
        padding: 8px 15px;
        width: 100%; /* Biar selebar parent-nya */
        text-align: center; /* Biar teks tetap di tengah */
        border-radius: 5px;
        display: block;
        margin-bottom: 15px; /* Tambahin jarak antara label dan elemen di bawahnya */
    }

    .device-label {
        font-size: 14px;
        font-weight: bold;
        background-color: #343a40; /* Warna gelap selaras dengan dashboard */
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        width: 100%; /* Biar selebar parent-nya */
        text-align: center; /* Biar teks tetap di tengah */
        display: block;
        margin-bottom: 8px; /* Tambahin jarak antara label dan elemen di bawahnya */
    }
    </style>

<!-- BEGIN Form Lembur Section 1 -->
<div class="row">
    <div class="col-md-12">
        <h1 class="page-header">timer lembur</h1>

        <div class="panel panel-inverse">
            <div class="panel-heading">
                <h4 class="panel-title">Form Input timer Lembur</h4>
            </div>

            <div class="panel-body">
                @if(session('success'))
                    <div class="alert alert-success">
                        {{ session('success') }}
                    </div>
                @endif

                <form action="{{ route('overtime.store') }}" method="POST">
                    @csrf

                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="form-group mb-3">
                                <label for="division_id" class="form-label">Divisi</label>
                                <select name="division_id" id="division_id" class="form-select @error('division_id') is-invalid @enderror" required>
                                    <option value="">Pilih Divisi</option>
                                    @foreach($divisions as $div)
                                        <option value="{{ $div->id }}">{{ $div->nama_divisi }}</option>
                                    @endforeach
                                </select>
                                @error('division_id')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="form-group mb-3">
                                <label for="employee_id" class="form-label">Karyawan</label>
                                <select name="employee_id" id="employee_id" class="form-select @error('employee_id') is-invalid @enderror" required>
                                    <option value="">Pilih Karyawan</option>
                                </select>
                                @error('employee_id')
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
                                <label for="end_time" class="form-label">Waktu Selesai (Opsional)</label>
                                <input type="time" name="end_time" id="end_time" class="form-control @error('end_time') is-invalid @enderror" value="{{ old('end_time') }}">
                                @error('end_time')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>

                    <div class="form-group mb-3">
                        <label for="notes" class="form-label">Catatan</label>
                        <textarea name="notes" id="notes" class="form-control @error('notes') is-invalid @enderror" rows="3">{{ old('notes') }}</textarea>
                        @error('notes')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="form-group">
                        <button type="submit" class="btn btn-primary">Simpan</button>
                        <a href="{{ route('overtime.index') }}" class="btn btn-secondary">Kembali</a>
                    </div>

                </form>
            </div>
        </div>
    </div>
</div>
<!-- END Form Lembur Section 1 -->

@push('scripts')
<script>
    $(document).ready(function () {
        $('#division_id').on('change', function () {
            var divisionId = $(this).val();
            if (divisionId) {
                $.ajax({
                    url: "{{ url('get-karyawan') }}/" + divisionId,
                    type: "GET",
                    dataType: "json",
                    success: function (data) {
                        $('#employee_id').empty();
                        $('#employee_id').append('<option value="">Pilih Karyawan</option>');
                        $.each(data, function (key, value) {
                            $('#employee_id').append('<option value="'+ value.id +'">'+ value.nama_karyawan +'</option>');
                        });
                    },
                    error: function () {
                        alert('Gagal mengambil data karyawan.');
                    }
                });
            } else {
                $('#employee_id').empty();
                $('#employee_id').append('<option value="">Pilih Karyawan</option>');
            }
        });
    });
</script>
@endpush


@push('scripts')
<script>
    $(document).ready(function() {
        $('#division_id').on('change', function() {
            var divisionId = $(this).val();
            if (divisionId) {
                $.ajax({
                    url: '/get-karyawan-by-division/' + divisionId,
                    type: 'GET',
                    dataType: 'json',
                    success: function(data) {
                        $('#employee_id').empty();
                        $('#employee_id').append('<option value="">Pilih Karyawan</option>');
                        $.each(data, function(key, value) {
                            $('#employee_id').append('<option value="' + value.id + '">' + value.nama_karyawan + '</option>');
                        });
                    }
                });
            } else {
                $('#employee_id').empty();
                $('#employee_id').append('<option value="">Pilih Karyawan</option>');
            }
        });
    });
</script>
@endpush


@push('scripts')
<script>
    $(document).ready(function() {
        $('#division_id').on('change', function() {
            var divisionId = $(this).val();
            if (divisionId) {
                $.ajax({
                    url: '/get-karyawan-by-division/' + divisionId,
                    type: 'GET',
                    dataType: 'json',
                    success: function(data) {
                        $('#employee_id').empty();
                        $('#employee_id').append('<option value="">Pilih Karyawan</option>');
                        $.each(data, function(key, value) {
                            $('#employee_id').append('<option value="' + value.id + '">' + value.nama_karyawan + '</option>');
                        });
                    }
                });
            } else {
                $('#employee_id').empty();
                $('#employee_id').append('<option value="">Pilih Karyawan</option>');
            }
        });
    });
</script>
@endpush


    <!-- CSS untuk Indikator -->
    <style>
        .indicator {
            transition: background-color 0.3s ease; /* Animasi perubahan warna */
        }
    </style>

    <!-- JavaScript untuk Charts dan Real-time Updates -->
    <script>
        // Endpoint API untuk suhu dari Laravel
        const API_URL = "http://192.168.30.249:8000/api/sensor/latest";

        let usageValues = {
            CM2: 0,
            CM3: 0,
            Sport: 0,
            CM1: 0
        };

        function updateTotalUsage() {
            let totalUsage = usageValues.CM2 + usageValues.CM3 + usageValues.Sport + usageValues.CM1;
            let lampuUsage = totalUsage * 0.5; // Asumsi 50% untuk lampu
            let acUsage = totalUsage * 0.5; // Asumsi 50% untuk AC

            document.getElementById("lampu-value").innerText = lampuUsage > 0 ? lampuUsage.toFixed(1) + " KWh" : "N/A";
            document.getElementById("ac-value").innerText = acUsage > 0 ? acUsage.toFixed(1) + " KWh" : "N/A";
            document.getElementById("listrik-value").innerText = totalUsage > 0 ? totalUsage.toFixed(1) + " KWh" : "N/A";
        }

        function createChart(canvasId, usageId, key) {
            let ctx = document.getElementById(canvasId).getContext("2d");
            let chart = new Chart(ctx, {
                type: "doughnut",
                data: {
                    labels: ["Digunakan", "Sisa Kapasitas"],
                    datasets: [{
                        data: [usageValues[key], 100 - usageValues[key]],
                        backgroundColor: ["#ff5733", "#ddd"],
                        borderWidth: 1
                    }]
                },
                options: {
                    circumference: 180,
                    rotation: 270,
                    cutout: "70%",
                    plugins: {
                        legend: { display: false }
                    }
                }
            });

            document.getElementById(usageId).innerText = usageValues[key] > 0 ? usageValues[key] + " KWh" : "N/A";
            return chart;
        }

        function updateCharts() {
            chartCM2.data.datasets[0].data[0] = usageValues.CM2;
            chartCM3.data.datasets[0].data[0] = usageValues.CM3;
            chartSport.data.datasets[0].data[0] = usageValues.Sport;
            chartGudang.data.datasets[0].data[0] = usageValues.CM1;

            // Update the displayed usage values or set to "N/A"
            document.getElementById("usageCM2").innerText = usageValues.CM2 > 0 ? usageValues.CM2 + " KWh" : "N/A";
            document.getElementById("usageCM3").innerText = usageValues.CM3 > 0 ? usageValues.CM3 + " KWh" : "N/A";
            document.getElementById("usageSport").innerText = usageValues.Sport > 0 ? usageValues.Sport + " KWh" : "N/A";
            document.getElementById("usageCM1").innerText = usageValues.CM1 > 0 ? usageValues.CM1 + " KWh" : "N/A";

            chartCM2.update();
            chartCM3.update();
            chartSport.update();
            chartGudang.update();
        }

        document.addEventListener("DOMContentLoaded", function() {
            // Inisialisasi Pusher untuk real-time
            Pusher.logToConsole = true;
            var pusher = new Pusher("c77afdf15a167aa70311", { cluster: "ap1" });

            var channel = pusher.subscribe("sensor-data");
            channel.bind("update-usage", function(data) {
                // Update usage values from Pusher
                usageValues.CM2 = data.CM2;
                usageValues.CM3 = data.CM3;
                usageValues.Sport = data.Sport;
                usageValues.CM1 = data.CM1;

                // Update charts and total usage
                updateCharts();
                updateTotalUsage();
            });

            // Create charts
            let chartCM2 = createChart("chartCM2", "usageCM2", "CM2");
            let chartCM3 = createChart("chartCM3", "usageCM3", "CM3");
            let chartSport = createChart("chartSport", "usageSport", "Sport");
            let chartGudang = createChart("chartCM1", "usageCM1", "CM1");

            // Fetch initial data
            async function fetchInitialData() {
                try {
                    let response = await fetch(API_URL);
                    let data = await response.json();
                    
                    if (data.success) {
                        usageValues.CM2 = data.usage.CM2;
                        usageValues.CM3 = data.usage.CM3;
                        usageValues.Sport = data.usage.Sport;
                        usageValues.CM1 = data.usage.CM1;

                        updateCharts();
                        updateTotalUsage();
                    } else {
                        console.error("Gagal mengambil data penggunaan");
                    }
                } catch (error) {
                    console.error("Error fetching usage:", error);
                }
            }

            fetchInitialData(); // Fetch initial data on page load
        });
    </script>

    <!-- JavaScript untuk Logika Perangkat -->
    <script>
        document.addEventListener("DOMContentLoaded", function () {
            const buildingSelect = document.getElementById("building-select");
            const deviceGroups = document.querySelectorAll(".device-group");

            // Fungsi untuk memperbarui tampilan perangkat berdasarkan ruangan yang dipilih
            function updateDevices(selectedBuilding) {
                deviceGroups.forEach(group => {
                    if (group.getAttribute("data-building") === selectedBuilding) {
                        group.classList.remove("d-none");
                    } else {
                        group.classList.add("d-none");
                    }
                });
            }

            // Event listener untuk perubahan dropdown
            buildingSelect.addEventListener("change", function () {
                updateDevices(this.value);
            });

            // Event listener untuk switch (ubah warna indikator)
            document.querySelectorAll(".device-switch").forEach(switchElement => {
                switchElement.addEventListener("change", function () {
                    // Cari indikator terdekat dalam container yang sama
                    const indicator = this.closest(".d-flex").querySelector(".indicator");
                    if (indicator) {
                        indicator.style.backgroundColor = this.checked ? "green" : "grey";
                    }
                });
            });

            // Set awal (tampilkan perangkat dari ruangan pertama)
            updateDevices(buildingSelect.value);
        });
    </script>

    <!-- JavaScript untuk Form Lembur -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const departmentSelect = document.getElementById('department_id');
            const employeeSelect = document.getElementById('employee_id');
            
            // Fungsi untuk memuat karyawan berdasarkan departemen
            function loadEmployees(departmentId) {
                // Reset dropdown karyawan
                employeeSelect.innerHTML = '<option value="">Pilih Karyawan</option>';
                
                if (!departmentId) return;
                
                // Fetch API untuk mendapatkan karyawan berdasarkan departemen
                fetch(`/api/employees-by-department?department_id=${departmentId}`)
                    .then(response => response.json())
                    .then(employees => {
                        employees.forEach(employee => {
                            const option = document.createElement('option');
                            option.value = employee.id;
                            option.textContent = employee.name;
                            employeeSelect.appendChild(option);
                        });
                    })
                    .catch(error => {
                        console.error('Error loading employees:', error);
                    });
            }
            
            // Event listener untuk perubahan departemen
            departmentSelect.addEventListener('change', function() {
                loadEmployees(this.value);
            });
            
            // Muat karyawan jika ada departemen yang dipilih saat halaman dimuat
            if (departmentSelect.value) {
                loadEmployees(departmentSelect.value);
            }
        });
    </script>
    
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
                        @if (session('success'))
                            <div class="alert alert-success" role="alert">
                                {{ session('success') }}
                            </div>
                        @endif

                        @if (session('error'))
                            <div class="alert alert-danger" role="alert">
                                {{ session('error') }}
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

    <!-- JavaScript for User Management -->
        @push('scripts')
            <script>
                document.addEventListener('DOMContentLoaded', function() {
                    const editUserModal = document.getElementById('editUserModal');
                    if(editUserModal) {
                        editUserModal.addEventListener('show.bs.modal', function(event) {
                            const button = event.relatedTarget;
                            const userId = button.getAttribute('data-id');
                            const userName = button.getAttribute('data-name');
                            const userEmail = button.getAttribute('data-email');
                            const userRole = button.getAttribute('data-role');
                            const userRoleName = button.getAttribute('data-role-name');
                            
                            document.getElementById('edit_name').value = userName;
                            document.getElementById('edit_email').value = userEmail;
                            if(userRole) {
                                document.getElementById('edit_role_id').value = userRole;
                            }
                            document.getElementById('edit_password').value = '';
                            
                            document.getElementById('editUserForm').action = `/user-management/${userId}`;
                            
                            // Debug informasi
                            console.log('Edit User:', {
                                userId,
                                userName,
                                userEmail,
                                userRole,
                                userRoleName
                            });
                        });
                    }
                    
                    // Delete User Modal (sama seperti sebelumnya)
                    const deleteUserModal = document.getElementById('deleteUserModal');
                    if(deleteUserModal) {
                        deleteUserModal.addEventListener('show.bs.modal', function(event) {
                            const button = event.relatedTarget;
                            const userId = button.getAttribute('data-id');
                            const userName = button.getAttribute('data-name');
                            
                            document.getElementById('delete_user_name').textContent = userName;
                            document.getElementById('deleteUserForm').action = `/user-management/${userId}`;
                        });
                    }
                });
            </script>
        @endpush
@endif
@endsection