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
@endpush

@section('content')
	<!-- BEGIN breadcrumb -->
	<ol class="breadcrumb float-xl-end">
		<li class="breadcrumb-item"><a href="{{ route('dashboard-v1') }}">Home</a></li>
		<li class="breadcrumb-item active">dashboardDetailCm2</li>
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
    <!-- BEGIN row -->
    <div class="row">
        <!-- BEGIN col-8 -->
        <div class="col-xl-8">
            <div class="widget-chart with-sidebar" data-bs-theme="dark">
                <div class="widget-chart-content bg-gray-800">
                    <h4 class="chart-title">
                        Penggunaan Listrik CM-1
                        <small>Distribusi Penggunaan Energi</small>
                    </h4>
                    <div id="visitors-line-chart" class="widget-chart-full-width dark-mode" style="height: 257px;"></div>
                </div>
                <div class="widget-chart-sidebar bg-gray-900">
                    <div class="chart-number">
                        70.33 KWh
                        <small>Total Penggunaan Listrik</small>
                    </div>
                    <div class="flex-grow-1 d-flex align-items-center">
                        <div id="visitors-donut-chart" data-bs-theme="dark" style="height: 180px"></div>
                    </div>
                    <ul class="chart-legend fs-11px">
                        <li><i class="fa fa-circle fa-fw text-primary fs-9px me-5px t-minus-1"></i> 40.0% <span>Penggunaan Lampu</span></li>
                        <li><i class="fa fa-circle fa-fw text-info fs-9px me-5px t-minus-1"></i> 60.0% <span>Penggunaan Pendingin Ruangan</span></li>
                    </ul>
                </div>
            </div>
        </div>
        <!-- END col-8 -->
    </div>
    <!-- END row -->

    <script>
        document.addEventListener("DOMContentLoaded", function () {
            var options = {
                series: [40, 60], // 40% penggunaan lampu, 60% penggunaan pendingin ruangan
                chart: {
                    type: 'donut',
                    height: 180
                },
                labels: ['Penggunaan Lampu', 'Penggunaan Pendingin Ruangan'],
                colors: ['#0d47a1', '#26c6da'], // Biru tua untuk lampu, biru tosca untuk pendingin ruangan
                legend: {
                    position: 'bottom'
                }
            };
            var chart = new ApexCharts(document.querySelector("#visitors-donut-chart"), options);
            chart.render();
        });
    </script>

@endsection 