document.addEventListener('DOMContentLoaded', function () {
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
    departmentSelect.addEventListener('change', function () {
        loadEmployees(this.value);
    });

    // Muat karyawan jika ada departemen yang dipilih saat halaman dimuat
    if (departmentSelect.value) {
        loadEmployees(departmentSelect.value);
    }
});