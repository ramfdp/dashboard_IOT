$(document).ready(function () {
    $('#division_id').on('change', function () {
        var divisionId = $(this).val();
        if (divisionId) {
            $.ajax({
                url: "{{ url('get-karyawan') }}/" + divisionId,
                type: "GET",
                dataType: "json",
                success: function (data) {
                    $('#employee_id').empty();
                    $('#employee_id').append('<option value="">Pilih Karyawan</option>');
                    $.each(data, function (key, value) {
                        $('#employee_id').append('<option value="' + value.id + '">' + value.nama_karyawan + '</option>');
                    });
                },
                error: function () {
                    alert('Gagal mengambil data karyawan.');
                }
            });
        } else {
            $('#employee_id').empty();
            $('#employee_id').append('<option value="">Pilih Karyawan</option>');
        }
    });
});