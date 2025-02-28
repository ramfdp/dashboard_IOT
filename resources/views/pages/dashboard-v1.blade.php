@extends('layouts.default')

@section('title', 'Dashboard V1')

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
                    <h4>Lampu</h4>
                    <p id="lampu-value">0%</p>
                </div>
            </div>
        </div>
        
        <div class="col-xl-4 col-md-6">
            <div class="widget widget-stats bg-info">
                <div class="stats-icon"><i class="fa fa-snowflake"></i></div>
                <div class="stats-info">
                    <h4>Pendingin Ruangan</h4>
                    <p id="ac-value">0%</p>
                </div>
            </div>
        </div>
        
        <div class="col-xl-4 col-md-6">
            <div class="widget widget-stats bg-orange">
                <div class="stats-icon"><i class="fa fa-bolt"></i></div>
                <div class="stats-info">
                    <h4>Penggunaan Listrik</h4>
                    <p id="listrik-value">0 KWh</p>
                </div>
            </div>
        </div>
    </div>
    <!-- END SECTION: Parameter Penggunaan -->
    
    <script>
        document.addEventListener("DOMContentLoaded", function() {
            function animateNumbers(elementId, targetValue, unit = "") {
                let element = document.getElementById(elementId);
                let counter = 0;
                let interval = setInterval(() => {
                    counter = Math.floor(Math.random() * targetValue);
                    element.innerHTML = counter + unit;
                }, 50);

                setTimeout(() => {
                    clearInterval(interval);
                    element.innerHTML = targetValue + unit;
                }, 2000);
            }

            animateNumbers("lampu-value", 53.4, "%");
            animateNumbers("ac-value", 96.2, "%");
            animateNumbers("listrik-value", 132, " KWh");
        });
    </script>
    
    <!-- Monitoring Gauge Chart -->
    <div class="section mt-4">
        <h2 class="text-center mb-4">Penggunaan Listrik</h2>
        <div class="row">
            <div class="col-md-3 text-center">
                <h4>Gedung Wisma</h4>
                <canvas id="chartWisma"></canvas>
                <p id="usageWisma" class="mt-2 fs-5 font-weight-bold">0 KWh</p>
            </div>
            <div class="col-md-3 text-center">
                <h4>Hotel</h4>
                <canvas id="chartHotel"></canvas>
                <p id="usageHotel" class="mt-2 fs-5 font-weight-bold">0 KWh</p>
            </div>
            <div class="col-md-3 text-center">
                <h4>Sport Center</h4>
                <canvas id="chartSport"></canvas>
                <p id="usageSport" class="mt-2 fs-5 font-weight-bold">0 KWh</p>
            </div>
            <div class="col-md-3 text-center">
                <h4>Gudang CM-1</h4>
                <canvas id="chartGudang"></canvas>
                <p id="usageGudang" class="mt-2 fs-5 font-weight-bold">0 KWh</p>
            </div>
        </div>
    </div>
    
    <script>
        function createChart(canvasId, usageId, initialValue) {
            let ctx = document.getElementById(canvasId).getContext("2d");
            let chart = new Chart(ctx, {
                type: "doughnut",
                data: {
                    labels: ["Digunakan", "Sisa Kapasitas"],
                    datasets: [{
                        data: [initialValue, 100 - initialValue],
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
            document.getElementById(usageId).innerText = initialValue + " KWh";
            return chart;
        }
        
        document.addEventListener("DOMContentLoaded", function() {
            let chartWisma = createChart("chartWisma", "usageWisma", 70);
            let chartHotel = createChart("chartHotel", "usageHotel", 76);
            let chartSport = createChart("chartSport", "usageSport", 90);
            let chartGudang = createChart("chartGudang", "usageGudang", 65);
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
					<div class="row g-3">
						@php
							$devices = [
								['id' => 'lampu-switch', 'label' => 'Lampu', 'icon' => 'fa-lightbulb'],  // Font Awesome
								['id' => 'air-switch', 'label' => 'Air', 'icon' => 'fa-tint'],  // Font Awesome
								['id' => 'ac-switch', 'label' => 'AC', 'icon' => 'fa-snowflake']  // Font Awesome
							];
						@endphp

						@foreach ($devices as $device)
							<div class="col-md-4 d-flex align-items-center">
								<i class="fa {{ $device['icon'] }} text-primary fs-4"></i> 
								<div class="form-check form-switch  ms-3">
									<input class="form-check-input device-switch" type="checkbox" id="{{ $device['id'] }}">
									<label class="form-check-label fw-bold" for="{{ $device['id'] }}">{{ $device['label'] }}</label>
								</div>
							</div>
							<div id="{{ $device['id'] }}-status" class="status-text text-center p-2 mt-2 d-none border rounded"></div>
						@endforeach
					</div>
				</div>
			</div>
		</div>
		<!-- END COL-12 -->

		<!-- Pastikan Chart.js sudah dimuat -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<!-- BEGIN col-4 -->
<div class="col-xl-4">
    <!-- BEGIN panel -->
    <div class="panel panel-inverse shadow-sm rounded-lg" data-sortable-id="index-usage">
        <div class="panel-heading d-flex justify-content-between align-items-center bg-dark text-white p-3 rounded-top">
            <h4 class="panel-title mb-0">Metric Penggunaan</h4>
            <div class="panel-heading-btn">
                <a href="javascript:;" class="btn btn-xs btn-icon btn-success" data-toggle="panel-reload">
                    <i class="fa fa-redo"></i>
                </a>
            </div>
        </div>
        <div class="table-responsive">
            <table class="table table-panel align-middle mb-0">
                <thead>
                    <tr>    
                        <th>Perangkat</th>
                        <th>Total</th>
                        <th>Trend</th>
                    </tr>
                </thead>
                <tbody>
                    @php
                        $metrics = [
                            ['name' => 'Lampu', 'value' => '53.4%', 'icon' => 'fa-lightbulb', 'chart' => 'chart-lampu'],
                            ['name' => 'Pendingin Ruangan', 'value' => '96.2%', 'icon' => 'fa-snowflake', 'chart' => 'chart-ac'],
                            ['name' => 'Penggunaan Listrik', 'value' => '132 KWh', 'icon' => 'fa-bolt', 'chart' => 'chart-listrik']
                        ];
                    @endphp

                    @foreach ($metrics as $metric)
                        <tr>
                            <td nowrap>
                                <i class="fa {{ $metric['icon'] }} text-primary me-2"></i>
                                <label class="badge bg-secondary">{{ $metric['name'] }}</label>
                            </td>
                            <td class="fw-bold">{{ $metric['value'] }}</td>
                            <td>
                                <canvas id="{{ $metric['chart'] }}" width="200" height="100"></canvas>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
    <!-- END panel -->
</div>
<!-- END col-4 -->

<!-- Script untuk inisialisasi Chart.js -->
<script>
    document.addEventListener("DOMContentLoaded", function() {
        // Data untuk setiap grafik trend
        let lampuTrend = [10, 15, 20, 25, 30, 35, 40];
        let acTrend = [40, 45, 50, 55, 60, 65, 70];
        let listrikTrend = [70, 75, 80, 85, 90, 95, 100];

        function createChart(canvasId, data, color) {
            let ctx = document.getElementById(canvasId).getContext('2d');
            new Chart(ctx, {
                type: 'bar', // Bisa diganti ke 'line' jika ingin grafik garis
                data: {
                    labels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
                    datasets: [{
                        label: 'Trend',
                        data: data,
                        backgroundColor: color,
                        borderColor: color,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: false,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }

        createChart("chart-lampu", lampuTrend, "rgba(0, 0, 255, 0.6)"); // Biru
        createChart("chart-ac", acTrend, "rgba(0, 255, 0, 0.6)"); // Hijau
        createChart("chart-listrik", listrikTrend, "rgba(255, 165, 0, 0.6)"); // Oranye
    });
</script>

		
		</div>
		<!-- END col-4 -->
	</div>
	<!-- END row -->
@endsection
