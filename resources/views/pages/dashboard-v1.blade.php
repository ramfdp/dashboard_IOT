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
    <script src="/assets/js/random-gen-moni.js"></script>
    <script src="/assets/js/perhitung-grafik-moni.js"></script>
    <script src="/assets/js/logika-controling.js"></script>
    <script src="/assets/js/logika-form-lembur.js"></script>
    <script src="/assets/js/realtime-charts-update.js"></script>
    <script src="/assets/js/logika-perangkat.js"></script>
    <script src="/assets/js/logika-form-lembur2.js"></script>
    <script src="/assets/js/logika-user-management.js"></script>
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
                            data-labels='@json($dataKwh->pluck('waktu')->toArray())'
                            data-values='@json($dataKwh->pluck('daya')->toArray())'
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

    <!-- BEGIN row -->
    {{-- <form action="{{ route('dashboard.update') }}" method="POST">
        @csrf
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
                                                <input class="form-check-input device-switch" type="checkbox" name="relay1" {{ ($relay1 ?? 0) == 1 ? 'checked' : '' }}>
                                                </div>
                                                <div class="indicator"></div>
                                            </div>
                                        </div>

                                        <div class="device-container d-flex flex-column align-items-start">
                                            <label class="device-label">Lampu ITMS 2</label>
                                            <div class="d-flex align-items-center gap-3">
                                                <i class="fa fa-lightbulb text-primary fs-4"></i>
                                                <div class="form-check form-switch">
                                                    <input class="form-check-input device-switch" type="checkbox" name="relay2" value="1" {{ $relay2 == 1 ? 'checked' : '' }}>
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
    </form>     --}}

    <form action="{{ route('dashboard.update') }}" method="POST">
    @csrf

    <div class="device-row d-flex justify-content-between gap-4 mb-4">
        <div class="device-container d-flex flex-column align-items-start">
            <label class="device-label">Lampu ITMS 1</label>
            <div class="d-flex align-items-center gap-3">
                <i class="fa fa-lightbulb text-primary fs-4"></i>
                <div class="form-check form-switch">
                    <input class="form-check-input device-switch" type="checkbox" name="relay1" value="1" {{ $relay1 == 1 ? 'checked' : '' }}>
                </div>
                <div class="indicator"></div>
            </div>
        </div>

        <div class="device-container d-flex flex-column align-items-start">
            <label class="device-label">Lampu ITMS 2</label>
            <div class="d-flex align-items-center gap-3">
                <i class="fa fa-lightbulb text-primary fs-4"></i>
                <div class="form-check form-switch">
                    <input class="form-check-input device-switch" type="checkbox" name="relay2" value="1" {{ $relay2 == 1 ? 'checked' : '' }}>
                </div>
                <div class="indicator"></div>
            </div>
        </div>

        <div class="device-container d-flex flex-column align-items-start">
            <label class="device-label">Mode SOS</label>
            <div class="d-flex align-items-center gap-3">
                <i class="fa fa-bell text-danger fs-4"></i>
                <div class="form-check form-switch">
                    <input class="form-check-input device-switch" type="checkbox" name="sos" value="1" {{ $sos ?? 0 == 1 ? 'checked' : '' }}>
                </div>
            </div>
        </div>
    </div>

    <button class="btn btn-primary mt-3" type="submit">Perbarui Status</button>
</form>


    <!-- END row -->

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

    <!-- CSS untuk Indikator -->
    <style>
        .indicator {
            transition: background-color 0.3s ease; /* Animasi perubahan warna */
        }
    </style>
    
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
@endif
@endsection