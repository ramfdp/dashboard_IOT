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
                    <option value="cm1">Gudang CM 1</option>
                    <option value="cm2">Gudang CM 2</option>
                    <option value="cm3">Gudang CM 3</option>
                    <option value="sportcenter">Sport Center</option>
                </select>
            </div>
            <div class="panel-body p-4">
                <div id="device-container">
                    <!-- Perangkat ITMS -->
                    <div class="device-group" data-building="cm1">
                    <label class="device-title">Lampu</label>

                    <div class="device-row d-flex justify-content-between gap-4">
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

                    <label class="device-title">AC</label>

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
                            <i class="fa fa-lightbulb text-primary fs-4"></i>
                            <div class="form-check form-switch">
                                <input class="form-check-input device-switch" type="checkbox">
                            </div>
                            <div class="indicator"></div>
                        </div>
                    </div>

                    <div class="device-container d-flex flex-column align-items-start">
                        <label class="device-label">AC ITMS 3</label>
                        <div class="d-flex align-items-center gap-3">
                            <i class="fa fa-lightbulb text-primary fs-4"></i>
                            <div class="form-check form-switch">
                                <input class="form-check-input device-switch" type="checkbox">
                            </div>
                            <div class="indicator"></div>
                        </div>
                    </div>
                </div>

                    <label class="device-title">AIR</label>

                    <div class="device-row d-flex justify-content-between gap-4">
                    <div class="device-container d-flex flex-column align-items-start">
                        <label class="device-label">AIR</label>
                        <div class="d-flex align-items-center gap-3">
                            <i class="fa fa-tint text-primary fs-4"></i>
                            <div class="form-check form-switch">
                                <input class="form-check-input device-switch" type="checkbox">
                            </div>
                            <div class="indicator"></div>
                        </div>
                    </div>

                    <div class="water-tank">
                    <div class="water" id="waterLevel" style="height: 70%;"></div>
                </div>
                    <div class="device-row d-flex justify-content-between gap-4">
                    <div class="device-container d-flex flex-column align-items-start">
                        <label class="device-label">Water Level</label>
                        <div class="d-flex align-items-center gap-3">
                            <i class="fa fa-tint text-primary fs-4"></i>
                            <div class="progress" style="width: 100px; height: 20px;">
                                <div class="progress-bar bg-primary" role="progressbar" style="width: 70%;" id="waterLevel"></div>
                            </div>
                        </div>
                    </div>
                </div>

                    <!-- Perangkat KSI -->
                    <div class="device-group d-none" data-building="cm2">
                        <h5>KSI</h5>
                        <div class="d-flex align-items-center">
                            <i class="fa fa-tint text-primary fs-4"></i>
                            <span class="ms-2">Air KSI</span>
                            <div class="form-check form-switch ms-3">
                                <input class="form-check-input device-switch" type="checkbox" id="ksi-air">
                            </div>
                            <div id="ksi-air-indicator" class="indicator ms-2"></div>
                        </div>
                    </div>

                    <!-- Perangkat HC -->
                    <div class="device-group d-none" data-building="sportcenter">
                        <h5>HC</h5>
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
</style>

<style>
.device-container {
    margin-bottom: 20px; /* Kasih jarak antar perangkat */
}
</style>

<style>
.device-title {
    font-size: 18px;
    font-weight: bold;
    background-color: #343a40;
    color: white;
    padding: 5px 10px;
    width: 100%; /* Biar selebar parent-nya */
    text-align: center; /* Biar teks tetap di tengah */
    border-radius: 5px;
    display: inline-block;
    margin-bottom: 8px; /* Tambahin jarak antara label dan elemen di bawahnya */
}
</style>

<style>
.device-label {
    font-size: 10px;
    font-weight: bold;
    background-color: #343a40; /* Warna gelap selaras dengan dashboard */
    color: white;
    padding: 5px 10px;
    border-radius: 5px;
    width: 100%; /* Biar selebar parent-nya */
    text-align: center; /* Biar teks tetap di tengah */
    display: inline-block;
    margin-bottom: 8px; /* Tambahin jarak antara label dan elemen di bawahnya */
}
</style>

		</div>
		<!-- END col-4 -->
	</div>
	<!-- END row -->
@endsection
