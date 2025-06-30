// public/assets/js/perhitung-grafik-moni.js

document.addEventListener('DOMContentLoaded', function () {
    const wattChartCanvas = document.getElementById('wattChart');

    // Cek apakah elemen wattChart ada sebelum mencoba mengakses data-attributes
    if (!wattChartCanvas) {
        console.error('Element with ID "wattChart" not found.');
        return; // Hentikan eksekusi jika elemen tidak ada
    }

    // Ambil data dari data-attributes dan parse sebagai JSON
    const labels = JSON.parse(wattChartCanvas.dataset.labels);
    const dataValues = JSON.parse(wattChartCanvas.dataset.values);

    const ctx = wattChartCanvas.getContext('2d');

    const gradWatt = ctx.createLinearGradient(0, 0, 0, 300);
    gradWatt.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    gradWatt.addColorStop(1, 'rgba(255, 255, 255, 0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daya (Watt)',
                data: dataValues,
                fill: true,
                backgroundColor: gradWatt,
                borderColor: '#ffffff',
                pointBackgroundColor: '#ffffff',
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: true, backgroundColor: '#333', titleColor: '#fff', bodyColor: '#fff' }
            },
            scales: {
                x: {
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                y: {
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                }
            }
        }
    });

    const btnLihatPerhitungan = document.getElementById('btnLihatPerhitungan');
    const modalPerhitunganListrikElement = document.getElementById('modalPerhitunganListrik');
    const periodePerhitungan = document.getElementById('periodePerhitungan');

    // Cek keberadaan elemen modal dan tombol sebelum inisialisasi
    if (!btnLihatPerhitungan || !modalPerhitunganListrikElement || !periodePerhitungan) {
        console.error('One or more calculation elements (button, modal, dropdown) not found.');
        // Tidak perlu 'return' di sini jika Anda ingin Chart tetap diinisialisasi
        // hanya perhitungan modal yang tidak akan berfungsi.
        // Namun, jika ini kritis, Anda bisa tambahkan 'return'.
    } else {
        const modalPerhitunganListrik = new bootstrap.Modal(modalPerhitunganListrikElement);

        // Fungsi untuk menghitung penggunaan listrik berdasarkan periode
        function hitungPenggunaanListrik(periode = 'harian') {
            const dayaValuesParsed = dataValues.map(d => parseFloat(d));

            if (dayaValuesParsed.length === 0) {
                console.warn('No data available for calculation.');
                document.getElementById('totalWatt').textContent = `N/A`;
                document.getElementById('totalKwh').textContent = `N/A`;
                document.getElementById('periodeLabel').textContent = periode;
                document.getElementById('dayaTertinggi').textContent = `N/A`;
                document.getElementById('dayaTerendah').textContent = `N/A`;
                document.getElementById('totalData').textContent = `0 titik data`;
                document.getElementById('kwhHarian').textContent = `N/A`;
                document.getElementById('kwhMingguan').textContent = `N/A`;
                document.getElementById('kwhBulanan').textContent = `N/A`;
                document.getElementById('perhitunganSummary').innerHTML = `<p>Tidak ada data untuk perhitungan.</p>`;
                return;
            }

            const rataDaya = dayaValuesParsed.reduce((a, b) => a + b, 0) / dayaValuesParsed.length;
            const dayaTertinggi = Math.max(...dayaValuesParsed);
            const dayaTerendah = Math.min(...dayaValuesParsed);

            let kwhValue = 0;
            let periodeText = '';

            switch (periode) {
                case 'harian':
                    kwhValue = (rataDaya * 24) / 1000;
                    periodeText = 'per hari';
                    break;
                case 'mingguan':
                    kwhValue = (rataDaya * 24 * 7) / 1000;
                    periodeText = 'per minggu';
                    break;
                case 'bulanan':
                    kwhValue = (rataDaya * 24 * 30) / 1000; // asumsi 30 hari dalam sebulan
                    periodeText = 'per bulan';
                    break;
            }

            document.getElementById('totalWatt').textContent = `${rataDaya.toFixed(2)} Watt`;
            document.getElementById('totalKwh').textContent = `${kwhValue.toFixed(2)} kWh`;
            document.getElementById('periodeLabel').textContent = periodeText;
            document.getElementById('dayaTertinggi').textContent = `${dayaTertinggi.toFixed(2)} Watt`;
            document.getElementById('dayaTerendah').textContent = `${dayaTerendah.toFixed(2)} Watt`;
            document.getElementById('totalData').textContent = `${dayaValuesParsed.length} titik data`;

            const kwhHarian = (rataDaya * 24) / 1000;
            const kwhMingguan = kwhHarian * 7;
            const kwhBulanan = kwhHarian * 30;

            document.getElementById('kwhHarian').textContent = `${kwhHarian.toFixed(2)} kWh`;
            document.getElementById('kwhMingguan').textContent = `${kwhMingguan.toFixed(2)} kWh`;
            document.getElementById('kwhBulanan').textContent = `${kwhBulanan.toFixed(2)} kWh`;

            const perhitunganSummary = document.getElementById('perhitunganSummary');
            perhitunganSummary.innerHTML = `
                    <p>Berdasarkan data penggunaan listrik pada grafik, rata-rata penggunaan daya adalah 
                    <strong>${rataDaya.toFixed(2)} Watt</strong>. Dengan asumsi penggunaan selama 24 jam, 
                    estimasi konsumsi energi adalah <strong>${kwhValue.toFixed(2)} kWh ${periodeText}</strong>.</p>
                `;
        }

        periodePerhitungan.addEventListener('change', function () {
            hitungPenggunaanListrik(this.value);
        });

        btnLihatPerhitungan.addEventListener('click', function () {
            hitungPenggunaanListrik(periodePerhitungan.value);
            modalPerhitunganListrik.show();
        });
    }
});