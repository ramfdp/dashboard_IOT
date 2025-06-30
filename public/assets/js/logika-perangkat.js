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