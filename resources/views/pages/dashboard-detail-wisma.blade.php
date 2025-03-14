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
    @if(isset($breadcrumb))
        <ol class="breadcrumb">
            @foreach ($breadcrumb as $item)
                @if ($item['route'])
                    <li class="breadcrumb-item"><a href="{{ $item['route'] }}">{{ $item['name'] }}</a></li>
                @else
                    <li class="breadcrumb-item active">{{ $item['name'] }}</li>
                @endif
            @endforeach
        </ol>
    @endif


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
                    <div class="stats-number" id="cm2-value">{{ $penggunaanListrik['CM2'] ?? 'data tidak tersedia'  }} kWh</div>
                    <div class="progress-bar" id="cm2-bar" style="width: {{ $penggunaanListrik['CM2'] ?? 'data tidak tersedia'  }}%;"></div>
                    <div class="stats-desc">Daya digunakan: {{ $penggunaanListrik['CM2'] ?? 'data tidak tersedia'  }}%</div>
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
                    <div class="stats-number" id="cm1-value">{{ $penggunaanListrik['CM1'] ?? 'data tidak tersedia'  }} kWh</div>
                    <div class="progress-bar" id="cm1-bar" style="width: {{ $penggunaanListrik['CM1'] ?? 'data tidak tersedia'  }}%;"></div>
                    <div class="stats-desc">Daya digunakan: {{ $penggunaanListrik['CM1'] ?? 'data tidak tersedia'  }}%</div>
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
                    <div class="stats-number" id="cm3-value">{{ $penggunaanListrik['CM3'] ?? 'data tidak tersedia' }} kWh</div>
                    <div class="progress-bar" id="cm3-bar" style="width: {{ $penggunaanListrik['CM3'] ?? 'data tidak tersedia'  }}%;"></div>
                    <div class="stats-desc">Daya digunakan: {{ $penggunaanListrik['CM3'] ?? 'data tidak tersedia'  }}%</div>
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
                    <div class="stats-number" id="sport-center-value">{{ $penggunaanListrik['Sport'] ?? 'data tidak tersedia' }} kWh</div>
                    <div class="progress-bar" id="sport-center-bar" style="width: {{ $penggunaanListrik['Sport'] ?? 'data tidak tersedia'  }}%;"></div>
                    <div class="stats-desc">Daya digunakan: {{ $penggunaanListrik['Sport'] ?? 'data tidak tersedia' }}%</div>
                </div>
            </div>
        </div>
        <!-- END col-3 -->
    </div>
    <!-- END row -->

    <!-- JavaScript untuk Update Real-time -->
    <script>
        function updateProgress(idValue, idBar, value) {
            document.getElementById(idValue).innerText = value.toFixed(2) + " kWh";
            document.getElementById(idBar).style.width = value + "%";
        }

        document.addEventListener("DOMContentLoaded", function() {
            // Ambil nilai dari Laravel (bukan sessionStorage)
            let usageValues = <?php echo json_encode($penggunaanListrik, 15, 512) ?>;

            updateProgress("cm2-value", "cm2-bar", usageValues.CM2);
            updateProgress("cm1-value", "cm1-bar", usageValues.CM1);
            updateProgress("cm3-value", "cm3-bar", usageValues.CM3);
            updateProgress("sport-center-value", "sport-center-bar", usageValues.Sport);
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

<!-- Tombol untuk melihat perhitungan biaya -->
<div class="text-center mt-3">
    <button class="btn btn-primary" onclick="hitungBiayaListrik()">
        Lihat Perhitungan Biaya
    </button>
</div>
<div class="mt-3" id="dropdown-cost-cm1" style="display: none;">
    <div class="card card-body">
        <h6>Perhitungan Biaya Listrik</h6>
        <p id="biaya-listrik-cm1">Menghitung...</p>
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

<!-- Tombol untuk melihat perhitungan biaya CM-2 -->
<div class="text-center mt-3">
    <button class="btn btn-primary" onclick="hitungBiayaListrikCM2()">
        Lihat Perhitungan Biaya CM-2
    </button>
</div>
<div class="mt-3" id="dropdown-cost-cm2" style="display: none;">
    <div class="card card-body">
        <h6>Perhitungan Biaya Listrik CM-2</h6>
        <p id="biaya-listrik-cm2">Menghitung...</p>
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

<!-- Tombol untuk melihat perhitungan biaya CM-3 -->
<div class="text-center mt-3">
    <button class="btn btn-primary" onclick="hitungBiayaListrikCM3()">
        Lihat Perhitungan Biaya CM-3
    </button>
</div>
<div class="mt-3" id="dropdown-cost-cm3" style="display: none;">
    <div class="card card-body">
        <h6>Perhitungan Biaya Listrik CM-3</h6>
        <p id="biaya-listrik-cm3">Menghitung...</p>
    </div>
</div>

<!-- Grafik Penggunaan Listrik Sport Center -->
<div class="card mt-4"> 
    <div class="card-header bg-dark text-white">
        <h5>Penggunaan Listrik Sport Center</h5>
    </div>
    <div class="card-body">
        <canvas id="chart-listrik-sportcenter"></canvas>
    </div>
</div>

<!-- Tombol untuk melihat perhitungan biaya Sport Center -->
<div class="text-center mt-3">
    <button class="btn btn-primary" onclick="hitungBiayaListrikSportCenter()">
        Lihat Perhitungan Biaya Sport Center
    </button>
</div>
<div class="mt-3" id="dropdown-cost-sportcenter" style="display: none;">
    <div class="card card-body">
        <h6>Perhitungan Biaya Listrik Sport Center</h6>
        <p id="biaya-listrik-sportcenter">Menghitung...</p>
    </div>
</div>

<!-- Load Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<script>
    document.addEventListener("DOMContentLoaded", function() {
        console.log("Script dimuat, inisialisasi Chart.js...");

        let chartListrikCM1, chartListrikCM2, chartListrikCM3, chartListrikSportCenter;

        function buatGrafik(id) {
            let ctx = document.getElementById(id);
            if (!ctx) {
                console.error("Canvas tidak ditemukan untuk " + id);
                return;
            }

            return new Chart(ctx.getContext("2d"), {
                type: "line",
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: "Penggunaan Listrik",
                            data: [],
                            backgroundColor: "rgba(0, 123, 255, 0.2)",
                            borderColor: "rgba(0, 123, 255, 1)",
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4
                        },
                        {
                            label: "Penggunaan AC",
                            data: [],
                            backgroundColor: "rgba(0, 255, 0, 0.2)",
                            borderColor: "rgba(0, 255, 0, 1)",
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4
                        },
                        {
                            label: "Penggunaan Lampu",
                            data: [],
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

        function fetchData(endpoint, chart, dataKey) {
            fetch(endpoint)
                .then(response => response.json())
                .then(data => {
                    console.log("Data baru diterima:", data);
                    
                    chart.data.labels = data.labels;
                    chart.data.datasets[0].data = data.listrik;
                    chart.data.datasets[1].data = data.ac;
                    chart.data.datasets[2].data = data.lampu;
                    chart.update();
                    
                    // Simpan data terbaru untuk perhitungan biaya listrik
                    window[dataKey] = data.listrik;
                })
                .catch(error => console.error("Gagal mengambil data:", error));
        }

        // Inisialisasi grafik dan ambil data pertama kali
        chartListrikCM1 = buatGrafik("chart-listrik-cm1");
        chartListrikCM2 = buatGrafik("chart-listrik-cm2");
        chartListrikCM3 = buatGrafik("chart-listrik-cm3");
        chartListrikSportCenter = buatGrafik("chart-listrik-sportcenter");

        fetchData('/api/listrik/cm1', chartListrikCM1, 'dataListrikCM1');
        fetchData('/api/listrik/cm2', chartListrikCM2, 'dataListrikCM2');
        fetchData('/api/listrik/cm3', chartListrikCM3, 'dataListrikCM3');
        fetchData('/api/listrik/sportcenter', chartListrikSportCenter, 'dataListrikSportCenter');

        // Perbarui data setiap 10 detik
        setInterval(() => {
            fetchData('/api/listrik/cm1', chartListrikCM1, 'dataListrikCM1');
            fetchData('/api/listrik/cm2', chartListrikCM2, 'dataListrikCM2');
            fetchData('/api/listrik/cm3', chartListrikCM3, 'dataListrikCM3');
            fetchData('/api/listrik/sportcenter', chartListrikSportCenter, 'dataListrikSportCenter');
        }, 10000);
    });

    function hitungBiayaListrikCM2() {
        hitungBiayaListrik('dataListrikCM2', 'biaya-listrik-cm2', 'dropdown-cost-cm2');
    }

    function hitungBiayaListrikCM3() {
        hitungBiayaListrik('dataListrikCM3', 'biaya-listrik-cm3', 'dropdown-cost-cm3');
    }

    function hitungBiayaListrikSportCenter() {
        hitungBiayaListrik('dataListrikSportCenter', 'biaya-listrik-sportcenter', 'dropdown-cost-sportcenter');
    }

    function hitungBiayaListrik(dataKey, biayaTextId, dropdownId) {
        const tarifPerKwh = 1444.70;
        const dayaKVA = 147;
        const faktorDaya = 0.85;
        const dayaKW = dayaKVA * faktorDaya;
        const jamMinimum = 40;

        const dataListrik = window[dataKey] || [];

        if (dataListrik.length < 2) {
            alert("Data belum cukup untuk perhitungan.");
            return;
        }

        const lastTwoDataListrik = dataListrik.slice(-2);
        const totalKwh15Hari = lastTwoDataListrik.reduce((a, b) => a + b, 0);
        const totalKwhBulanan = (totalKwh15Hari / 15) * 30;
        const biayaNormal = totalKwhBulanan * tarifPerKwh;
        const biayaMinimum = (jamMinimum * dayaKW) * tarifPerKwh;
        const biayaListrik = Math.max(biayaNormal, biayaMinimum);
        const biayaFormatted = biayaListrik.toLocaleString("id-ID", { style: "currency", currency: "IDR" });

        let biayaText = document.getElementById(biayaTextId);
        let dropdown = document.getElementById(dropdownId);

        if (biayaText && dropdown) {
            if (dropdown.style.display === "none" || dropdown.style.display === "") {
                biayaText.innerHTML = `
                    <b>Perkiraan biaya listrik bulanan:</b> ${biayaFormatted} <br>
                    <b>Total Konsumsi (perkiraan bulanan):</b> ${totalKwhBulanan.toFixed(2)} kWh
                `;
                dropdown.style.display = "block";
            } else {
                dropdown.style.display = "none";
            }
        } else {
            console.error("Elemen perhitungan biaya tidak ditemukan di DOM.");
        }
    }
</script>
        <div class="section text-center my-5">
            <a href="{{ route('dashboard-v1') }}" class="btn btn-primary w-100 py-3">kembali</a>
        </div>
@endsection 