@extends('layouts.default')

@section('title', 'History KWh')

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
            $('#history-kwh-table').DataTable({
                processing: true,
                serverSide: true,
                ajax: {
                    url: '{{ route('history-kwh.index') }}',
                    type: 'GET',
                    error: function(xhr, error, thrown) {
                        console.error("AJAX Error: ", error, thrown, xhr.responseText);
                        alert("Terjadi kesalahan saat mengambil data. Periksa konsol untuk detail.");
                    }
                },
                columns: [
                    { data: 'id', name: 'id' },
                    { data: 'tegangan', name: 'tegangan' },
                    { data: 'arus', name: 'arus' },
                    { data: 'daya', name: 'daya' },
                    { data: 'energi', name: 'energi' },
                    { data: 'frekuensi', name: 'frekuensi' },
                    { data: 'power_factor', name: 'power_factor' },
                    { data: 'tanggal_input', name: 'tanggal_input' }
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
        });
    </script>
@endpush

@section('content')
    <div class="row">
        <div class="col-xl-12">
            <div class="panel panel-inverse">
                <div class="panel-heading">
                    <h4 class="panel-title">History KWh Data</h4>
                </div>
                <div class="panel-body">
                    <table id="history-kwh-table" class="table table-striped table-bordered align-middle w-100 text-nowrap">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Tegangan (V)</th>
                                <th>Arus (A)</th>
                                <th>Daya (W)</th>
                                <th>Energi (kWh)</th>
                                <th>Frekuensi (Hz)</th>
                                <th>Power Factor</th>
                                <th>Tanggal Input</th>
                            </tr>
                        </thead>
                    </table>
                </div>
            </div>
        </div>
    </div>
@endsection