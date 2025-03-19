@extends('layouts.default')

@section('title', 'Dashboard')

@push('css')
	<link href="/assets/plugins/jvectormap-next/jquery-jvectormap.css" rel="stylesheet" />
	<link href="/assets/plugins/bootstrap-datepicker/dist/css/bootstrap-datepicker.css" rel="stylesheet" />
	<link href="/assets/plugins/gritter/css/jquery.gritter.css" rel="stylesheet" />
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
    <!-- END SECTION: Parameter Penggunaan -->

    <!-- Monitoring Gauge Chart -->
    <div class="col-md-12">
        <div class="panel-heading d-flex justify-content-between align-items-center bg-dark text-white p-3 rounded-top">
            <h6 class="panel-title mb-0">Penggunaan Listrik</h6>
        </div>
        <div class="row mt-4">
            <div class="col-md-3 text-center">
                <h4>Gudang CM-2</h4>
                <canvas id="chartCM2"></canvas>
                <p id="usageCM2" class="mt-2 fs-5 font-weight-bold">N/A</p>
            </div>
            <div class="col-md-3 text-center">
                <h4>Gudang CM-3</h4>
                <canvas id="chartCM3"></canvas>
                <p id="usageCM3" class="mt-2 fs-5 font-weight-bold">N/A</p>
            </div>
            <div class="col-md-3 text-center">
                <h4>Sport Center</h4>
                <canvas id="chartSport"></canvas>
                <p id="usageSport" class="mt-2 fs-5 font-weight-bold">N/A</p>
            </div>
            <div class="col-md-3 text-center">
                <h4>Gudang CM-1</h4>
                <canvas id="chartCM1"></canvas>
                <p id="usageCM1" class="mt-2 fs-5 font-weight-bold">N/A</p>
            </div>
            <div class="section text-center my-5">
                <a href="{{ route('dashboardDetail') }}" class="btn btn-primary w-100 py-3">Detail</a>
            </div>
        </div>
    </div>

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

    <!-- BEGIN row -->
    <div class="row">
        <!-- BEGIN COL-12 -->
        <div class="col-md-12">
            <div class="panel panel-inverse shadow-sm rounded-lg w-100" data-sortable-id="index-9">
                <div class="panel-heading d-flex justify-content-between align-items-center bg-dark text-white p-3 rounded-top">
                    <h4 class="panel-title mb-0">Perangkat</h4>
                    <select class="form-select w-auto bg-light border-0" id="building-select">
                        <option value="all">Semua Gedung</option>
                        <option value="itms">ITMS</option>
                        <option value="ksi">KSI</option>
                        <option value="hc">HC</option>
                    </select>
                </div>
                <div class="panel-body p-4">
    <div class="d-flex justify-content-between align-items-center flex-wrap">
        @php
            $devices = [
                ['id' => 'lampu-switch', 'icon' => 'fa-lightbulb', 'label' => 'Lampu'],
                ['id' => 'air-switch', 'icon' => 'fa-tint', 'label' => 'Air'],
                ['id' => 'ac-switch', 'icon' => 'fa-snowflake', 'label' => 'AC']
            ];
        @endphp

        @foreach ($devices as $device)
            <div class="d-flex align-items-center mx-3">
                <i class="fa {{ $device['icon'] }} text-primary fs-4"></i>
                <span class="ms-2">{{ $device['label'] }}</span>
                <div class="form-check form-switch ms-3">
                    <input class="form-check-input device-switch" type="checkbox" id="{{ $device['id'] }}">
                </div>
                <div id="{{ $device['id'] }}-indicator" class="indicator ms-2" 
                     style="width: 20px; height: 20px; border-radius: 50%; background-color: grey;">
                </div>
            </div>
        @endforeach
    </div>
</div>

            </div>
        </div>
        <!-- END COL-12 -->
    </div>
    <!-- END row -->

    <!-- JavaScript untuk Mengontrol Indikator -->
    <script>
        document.addEventListener("DOMContentLoaded", function () {
            // Ambil semua tombol switch
            const switches = document.querySelectorAll('.device-switch');

            switches.forEach(switchElement => {
                console.log(`Menambahkan event listener untuk switch: ${switchElement.id}`); // Debugging

                // Tambahkan event listener untuk setiap switch
                switchElement.addEventListener('change', function () {
                    console.log(`Switch ${this.id} diubah. Status: ${this.checked}`); // Debugging

                    const deviceId = this.id; // Ambil ID switch
                    const indicator = document.getElementById(`${deviceId}-indicator`); // Ambil elemen indikator

                    console.log(`Indicator Element:`, indicator); // Debugging

                    if (indicator) {
                        if (this.checked) {
                            indicator.style.backgroundColor = 'green'; // Nyala
                        } else {
                            indicator.style.backgroundColor = 'grey'; // Mati
                        }
                    } else {
                        console.error(`Indicator dengan ID ${deviceId}-indicator tidak ditemukan!`);
                    }

                    // Tampilkan status (opsional)
                    const statusText = document.getElementById(`${deviceId}-status`);
                    if (statusText) {
                        statusText.textContent = this.checked ? 'ON' : 'OFF';
                        statusText.classList.remove('d-none');
                    }
                });

                // Tambahkan event listener untuk klik (sebagai fallback)
                switchElement.addEventListener('click', function () {
                    console.log(`Switch ${this.id} diklik. Status: ${this.checked}`); // Debugging
                });
            });
        });
    </script>

    <!-- CSS untuk Indikator -->
    <style>
        .indicator {
            transition: background-color 0.3s ease; /* Animasi perubahan warna */
        }
    </style>
		</div>
		<!-- END col-4 -->
	</div>
	<!-- END row -->
@endsection
