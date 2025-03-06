@extends('layouts.default')

@section('title', 'Detail Penggunaan Listrik')

@push('css')
	<link href="/assets/plugins/jvectormap-next/jquery-jvectormap.css" rel="stylesheet" />
	<link href="/assets/plugins/gritter/css/jquery.gritter.css" rel="stylesheet" />
	<link href="/assets/plugins/nvd3/build/nv.d3.css" rel="stylesheet" />
@endpush

@push('scripts')
	<script src="/assets/plugins/d3/d3.min.js"></script>
	<script src="/assets/plugins/nvd3/build/nv.d3.js"></script>
	<script src="/assets/plugins/jvectormap-next/jquery-jvectormap.min.js"></script>
	<script src="/assets/plugins/jvectormap-content/world-mill.js"></script>
	<script src="/assets/plugins/gritter/js/jquery.gritter.js"></script>
	<script src="/assets/js/demo/dashboard-v2.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
@endpush

@section('content')
	<!-- BEGIN breadcrumb -->
	<ol class="breadcrumb float-xl-end">
		<li class="breadcrumb-item"><a href="{{ route('dashboard-v1') }}">Home</a></li>
		<li class="breadcrumb-item active">dashboard Detail</li>
	</ol>
	<!-- END breadcrumb -->
	<!-- BEGIN page-header -->
	<h1 class="page-header">Detail Penggunaan Listrik<small> anda bisa melihat penggunaan listrik di dalam sini</small></h1>
	<!-- END page-header -->
    <!-- BEGIN row -->
    <div class="row">
        <!-- BEGIN col-3 -->
        <div class="col-xl-3 col-md-6">
            <div class="widget widget-stats bg-teal">
                <div class="stats-icon stats-icon-lg"><i class="fa fa-globe fa-fw"></i></div>
                <div class="stats-content">
                    <div class="stats-title">Gudang CM-2</div>
                    <div class="stats-number" id="cm2-value">50 kWh</div>
                    <div class="stats-progress progress">
                        <div class="progress-bar" id="cm2-bar" style="width: 50%;"></div>
                    </div>
                    <div class="stats-desc">Daya digunakan: 50%</div>
                </div>
            </div>
        </div>
        <!-- END col-3 -->
        
        <!-- BEGIN col-3 -->
        <div class="col-xl-3 col-md-6">
            <div class="widget widget-stats bg-blue">
                <div class="stats-icon stats-icon-lg"><i class="fa fa-dollar-sign fa-fw"></i></div>
                <div class="stats-content">
                    <div class="stats-title">Gudang CM-1</div>
                    <div class="stats-number" id="cm1-value">70.33 kWh</div>
                    <div class="stats-progress progress">
                        <div class="progress-bar" id="cm1-bar" style="width: 70.33%;"></div>
                    </div>
                    <div class="stats-desc">Daya digunakan: 70.33%</div>
                </div>
            </div>
        </div>
        <!-- END col-3 -->
        
        <!-- BEGIN col-3 -->
        <div class="col-xl-3 col-md-6">
            <div class="widget widget-stats bg-indigo">
                <div class="stats-icon stats-icon-lg"><i class="fa fa-archive fa-fw"></i></div>
                <div class="stats-content">
                    <div class="stats-title">Gudang CM-3</div>
                    <div class="stats-number" id="cm3-value">90 kWh</div>
                    <div class="stats-progress progress">
                        <div class="progress-bar" id="cm3-bar" style="width: 90%;"></div>
                    </div>
                    <div class="stats-desc">Daya digunakan: 90%</div>
                </div>
            </div>
        </div>
        <!-- END col-3 -->
        
        <!-- BEGIN col-3 -->
        <div class="col-xl-3 col-md-6">
            <div class="widget widget-stats bg-gray-900">
                <div class="stats-icon stats-icon-lg"><i class="fa fa-comment-alt fa-fw"></i></div>
                <div class="stats-content">
                    <div class="stats-title">Sport Center</div>
                    <div class="stats-number" id="sport-center-value">75.2 kWh</div>
                    <div class="stats-progress progress">
                        <div class="progress-bar" id="sport-center-bar" style="width: 75.2%;"></div>
                    </div>
                    <div class="stats-desc">Daya digunakan: 75.2%</div>
                </div>
            </div>
        </div>
        <!-- END col-3 -->
    </div>
    <!-- END row -->

    <!-- JavaScript untuk Update Real-time -->
    <script>
        function updateProgress(idValue, idBar, value) {
            document.getElementById(idValue).innerText = value + " kWh";
            document.getElementById(idBar).style.width = value + "%";
        }

        document.addEventListener("DOMContentLoaded", function() {
            // Ambil nilai dari sessionStorage
            let storedUsage = sessionStorage.getItem("usageValues");
            
            if (storedUsage) {
                let usageValues = JSON.parse(storedUsage);

                // Update progress bar sesuai nilai dari dashboard
                document.getElementById("cm2-bar").style.width = usageValues.CM2 + "%";
                document.getElementById("cm1-bar").style.width = usageValues.CM1 + "%";
                document.getElementById("cm3-bar").style.width = usageValues.CM3 + "%";
                document.getElementById("sport-center-bar").style.width = usageValues.Sport + "%";

                // Update teks nilai KWh
                document.getElementById("cm2-value").innerText = usageValues.CM2.toFixed(2) + " KWh";
                document.getElementById("cm1-value").innerText = usageValues.CM1.toFixed(2) + " KWh";
                document.getElementById("cm3-value").innerText = usageValues.CM3.toFixed(2) + " KWh";
                document.getElementById("sport-center-value").innerText = usageValues.Sport.toFixed(2) + " KWh";
            }
        });
    </script>

      <!-- Grafik Penggunaan Listrik CM-1 -->
      <div class="card mt-4">
        <div class="card-header bg-dark text-white">
            <h5>Penggunaan Listrik CM-1</h5>
        </div>
        <div class="card-body">
            <canvas id="chart-listrik-cm1"></canvas>
        </div>
    </div>

    <!-- Grafik Penggunaan Listrik CM-2 -->
    <div class="card mt-4">
        <div class="card-header bg-dark text-white">
            <h5>Penggunaan Listrik CM-2</h5>
        </div>
        <div class="card-body">
            <canvas id="chart-listrik-cm2"></canvas>
        </div>
    </div>

    <!-- Grafik Penggunaan Listrik CM-3 -->
    <div class="card mt-4">
        <div class="card-header bg-dark text-white">
            <h5>Penggunaan Listrik CM-3</h5>
        </div>
        <div class="card-body">
            <canvas id="chart-listrik-cm3"></canvas>
        </div>
    </div>

    <!-- Grafik Penggunaan Listrik Sport Center -->
    <div class="card mt-4">
        <div class="card-header bg-dark text-white">
            <h5>Penggunaan Listrik Sport Center</h5>
        </div>
        <div class="card-body">
            <canvas id="chart-listrik-sport"></canvas>
        </div>
    </div>

    <!-- Script Chart.js -->
    <script>
        document.addEventListener("DOMContentLoaded", function() {
            console.log("Script dimuat, inisialisasi Chart.js...");

            function buatGrafik(id, dataListrik, dataAC, dataLampu) {
                let ctx = document.getElementById(id);
                if (!ctx) {
                    console.error("Canvas tidak ditemukan untuk " + id);
                    return;
                }

                new Chart(ctx.getContext("2d"), {
                    type: "line",
                    data: {
                        labels: ["Dec 19", "Dec 24", "Jan 4", "Jan 16", "Jan 28", "Feb 8", "Feb 20", "Mar 6"],
                        datasets: [
                            {
                                label: "Penggunaan Listrik",
                                data: dataListrik,
                                backgroundColor: "rgba(0, 123, 255, 0.2)",
                                borderColor: "rgba(0, 123, 255, 1)",
                                borderWidth: 2,
                                fill: true,
                                tension: 0.4
                            },
                            {
                                label: "Penggunaan AC",
                                data: dataAC,
                                backgroundColor: "rgba(0, 255, 0, 0.2)",
                                borderColor: "rgba(0, 255, 0, 1)",
                                borderWidth: 2,
                                fill: true,
                                tension: 0.4
                            },
                            {
                                label: "Penggunaan Lampu",
                                data: dataLampu,
                                backgroundColor: "rgba(255, 165, 0, 0.2)",
                                borderColor: "rgba(255, 165, 0, 1)",
                                borderWidth: 2,
                                fill: true,
                                tension: 0.4
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 200,
                                ticks: {
                                    callback: function(value) {
                                        return value + " kWh";
                                    }
                                }
                            }
                        },
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: function(tooltipItem) {
                                        return tooltipItem.dataset.label + ": " + tooltipItem.raw + " kWh";
                                    }
                                }
                            }
                        }
                    }
                });
            }

            // Data untuk masing-masing lokasi
            buatGrafik("chart-listrik-cm1", [20, 18, 25, 23, 27, 30, 40, 35], [15, 12, 18, 20, 22, 25, 30, 28], [10, 8, 12, 15, 18, 20, 25, 22]);
            buatGrafik("chart-listrik-cm2", [22, 20, 28, 26, 30, 32, 42, 38], [16, 14, 20, 22, 24, 28, 35, 30], [12, 10, 15, 18, 20, 22, 28, 25]);
            buatGrafik("chart-listrik-cm3", [18, 16, 22, 20, 24, 28, 35, 30], [14, 12, 17, 18, 20, 24, 28, 26], [9, 7, 11, 14, 16, 18, 23, 21]);
            buatGrafik("chart-listrik-sport", [25, 23, 30, 28, 33, 36, 45, 40], [18, 15, 22, 24, 26, 30, 38, 35], [13, 10, 14, 17, 19, 21, 27, 24]);
        });
    </script>
@endsection 