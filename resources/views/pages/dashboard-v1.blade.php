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
    <!-- END SECTION: Parameter Penggunaan -->

    <!-- Monitoring Gauge Chart -->
    <div class="col-md-12">
        <div class="panel-heading d-flex justify-content-between align-items-center bg-dark text-white p-3 rounded-top">
            <h6 class="panel-title mb-0">Penggunaan Listrik</h6>
        </div>
        <div class="row mt-4">
            <div class="col-md-3 text-center">
                <h4>Arkom</h4>
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


    <!-- kontrol panel -->
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

    <!-- BEGIN Form Lembur Section 1 -->
    <div class="row">
        <div class="col-md-12">
            <!-- BEGIN page-header -->
            <h1 class="page-header">Tambah Data Lembur</h1>
            <!-- END page-header -->

            <div class="panel panel-inverse">
                <div class="panel-heading">
                    <h4 class="panel-title">Form Input Data Lembur</h4>
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
                                    <label for="department_id" class="form-label">Departemen</label>
                                    <select name="department_id" id="department_id" class="form-select @error('department_id') is-invalid @enderror" required>
                                        <option value="">Pilih Departemen</option>
                                        @foreach($departments as $dept)
                                            <option value="{{ $dept->id }}">{{ $dept->nama_departemen }}</option>
                                        @endforeach
                                    </select>
                                    @error('department_id')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="form-group mb-3">
                                    <label for="employee_id" class="form-label">Karyawan</label>
                                    <select name="employee_id" id="employee_id" class="form-select @error('employee_id') is-invalid @enderror" required>
                                        <option value="">Pilih Karyawan</option>
                                        <!-- Opsi akan diisi via JavaScript -->
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
                                    <label for="end_time" class="form-label">Waktu Selesai (opsional)</label>
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
                            <a href="{{ route('overtime.index') }}" class="btn btn-default">Kembali</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <!-- END Form Lembur Section 1 -->

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
    <div class="row">
        <div class="row justify-content-center">
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
                                                data-role="{{ $user->role_id ?? '' }}"
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