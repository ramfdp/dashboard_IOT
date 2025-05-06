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
                    {data: 'action', name: 'action', orderable: false, searchable: false, 
                        className: 'text-center', width: '15%',
                        render: function (data, type, row) {
                            return `
                                <form action="/karyawan/${row.id}" method="POST" onsubmit="return confirm('Yakin ingin menghapus karyawan ini?')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-danger btn-sm">Hapus</button>
                                </form>
                            `;
                        }
                    }
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

<!-- Tombol Create -->
<div class="text-end mb-3">
    <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#karyawanModal">+ Tambah Karyawan</button>
</div>

<!-- Modal -->
<div class="modal fade" id="karyawanModal" tabindex="-1" aria-labelledby="karyawanModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="backdrop-filter: blur(5px); background-color: rgba(255, 255, 255, 0.9);">
            <div class="modal-header">
                <h5 class="modal-title" id="karyawanModalLabel">Tambah Karyawan</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
            </div>
            <form action="{{ route('karyawan.store') }}" method="POST">
                @csrf
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="nama_karyawan" class="form-label">Nama Karyawan</label>
                        <input type="text" class="form-control" id="nama_karyawan" name="nama_karyawan" required>
                    </div>
                    <div class="mb-3">
                        <label for="divisi_id" class="form-label">Divisi</label>
                        <select name="divisi_id" id="divisi_id" class="form-select" required>
                            <option value="">Pilih Divisi</option>
                            @foreach($divisions as $division)
                                <option value="{{ $division->id }}">{{ $division->nama_divisi }}</option>
                            @endforeach
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-primary">Simpan</button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                </div>
            </form>
        </div>
    </div>
</div>
                    
                    <!-- Tabel Karyawan -->
                    <table id="karyawan-table" class="table table-striped table-bordered align-middle w-100 text-nowrap">
                        <thead>
                            <tr>
                                <th style="text-align: center;">No</th>
                                <th style="text-align: center;">Nama Karyawan</th>
                                <th style="text-align: center;">Aksi</th>
                            </tr>
                        </thead>
                    </table>
                </div>
            </div>
        </div>
    </div>
@endsection
