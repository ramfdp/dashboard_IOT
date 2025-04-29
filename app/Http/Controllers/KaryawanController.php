@extends('layouts.default')

@section('title', 'Karyawan')

@push('css')
    <link href="/assets/plugins/datatables.net-bs5/css/dataTables.bootstrap5.min.css" rel="stylesheet" />
    <link href="/assets/plugins/datatables.net-responsive-bs5/css/responsive.bootstrap5.min.css" rel="stylesheet" />
    <link href="/assets/plugins/datatables.net-buttons-bs5/css/buttons.bootstrap5.min.css" rel="stylesheet" />
@endpush

@push('scripts')
    <script src="/assets/plugins/datatables.net/js/jquery.dataTables.min.js"></script>
    <script src="/assets/plugins/datatables.net-bs5/js/dataTables.bootstrap5.min.js"></script>
    <script src="/assets/plugins/datatables.net-responsive/js/dataTables.responsive.min.js"></script>
    <script src="/assets/plugins/datatables.net-responsive-bs5/js/responsive.bootstrap5.min.js"></script>
    <script src="/assets/plugins/datatables.net-buttons/js/dataTables.buttons.min.js"></script>
    <script src="/assets/plugins/datatables.net-buttons-bs5/js/buttons.bootstrap5.min.js"></script>
    <script src="/assets/plugins/datatables.net-buttons/js/buttons.html5.min.js"></script>
    <script src="/assets/plugins/datatables.net-buttons/js/buttons.print.min.js"></script>
    <script src="/assets/plugins/jszip/dist/jszip.min.js"></script>
    <script src="/assets/plugins/pdfmake/build/pdfmake.min.js"></script>
    <script src="/assets/plugins/pdfmake/build/vfs_fonts.js"></script>

    <script>
        $(document).ready(function () {
            var table = $('#karyawan-table').DataTable({
                processing: true,
                serverSide: true,
                ajax: {
                    url: '{{ route('karyawan.getData') }}',
                    data: function (d) {
                        d.divisi = $('#divisi-select').val(); // ambil divisi dari dropdown
                    },
                    type: 'GET',
                    error: function(xhr, error, thrown) {
                        console.error("AJAX Error: ", error, thrown, xhr.responseText);
                        alert("Terjadi kesalahan saat mengambil data. Periksa konsol untuk detail.");
                    }
                },
                columns: [
                    { data: 'id', name: 'id', className: 'text-center', width: '5%' },
                    { data: 'nama_karyawan', name: 'nama_karyawan' },
                ],
                dom: '<"row"<"col-md-6"B><"col-md-6"fr>>t<"row"<"col-md-5"i><"col-md-7"p>>',
                buttons: [
                    { extend: 'copy', className: 'btn-sm' },
                    { extend: 'csv', className: 'btn-sm' },
                    { extend: 'excel', className: 'btn-sm' },
                    { extend: 'pdf', className: 'btn-sm' },
                    { extend: 'print', className: 'btn-sm' }
                ]
            });

            // Trigger reload tabel saat dropdown divisi berubah
            $('#divisi-select').on('change', function() {
                table.ajax.reload();
            });
        });
    </script>
@endpush

@section('content')
    <div class="row">
        <div class="col-xl-12">
            <div class="panel panel-inverse">
                <div class="panel-heading">
                    <h4 class="panel-title">Data Karyawan</h4>
                </div>
                <div class="panel-body">
                    <!-- Dropdown untuk memilih Divisi -->
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <label for="divisi-select" class="form-label">Pilih Divisi:</label>
                        <select class="form-select w-auto bg-light border-0" id="divisi-select">
                            <option value="">Semua Divisi</option>
                            @foreach($divisions as $division)
                                <option value="{{ $division->id }}" 
                                    {{ $selectedDivision == $division->id ? 'selected' : '' }}>
                                    {{ $division->nama_divisi }}
                                </option>
                            @endforeach
                        </select>
                    </div>
                    
                    <!-- Tabel Karyawan -->
                    <table id="karyawan-table" class="table table-striped table-bordered align-middle w-100 text-nowrap">
                        <thead>
                            <tr>
                                <th style="text-align: center;">No</th>
                                <th style="text-align: center;">Nama Karyawan</th>
                            </tr>
                        </thead>
                    </table>
                </div>
            </div>
        </div>
    </div>
@endsection