document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('wattChart');
    if (!canvas) return console.error('Chart element not found');

    const labels = JSON.parse(canvas.dataset.labels);
    const values = JSON.parse(canvas.dataset.values).map(parseFloat);
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, 300);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Daya (Watt)',
                data: values,
                fill: true,
                backgroundColor: grad,
                borderColor: '#fff',
                pointBackgroundColor: '#fff',
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
                tooltip: {
                    enabled: true,
                    backgroundColor: '#333',
                    titleColor: '#fff',
                    bodyColor: '#fff'
                }
            },
            scales: {
                x: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                y: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } }
            }
        }
    });

    const modal = new bootstrap.Modal(document.getElementById('modalPerhitunganListrik'));
    const btn = document.getElementById('btnLihatPerhitungan');
    const periodeSelect = document.getElementById('periodePerhitungan');

    const jamPeriode = { harian: 24, mingguan: 168, bulanan: 720 };

    function prediksiRegresiKuadratik(data) {
        const n = data.length;
        if (n < 3) return null;

        const x = Array.from({ length: n }, (_, i) => i);
        const x2 = x.map(i => i ** 2);
        const x3 = x.map(i => i ** 3);
        const x4 = x.map(i => i ** 4);
        const y = data;
        const xy = x.map((xi, i) => xi * y[i]);
        const x2y = x.map((xi, i) => xi ** 2 * y[i]);

        function sum(arr) { return arr.reduce((a, b) => a + b, 0); }

        const A = [
            [n, sum(x), sum(x2)],
            [sum(x), sum(x2), sum(x3)],
            [sum(x2), sum(x3), sum(x4)]
        ];
        const B = [sum(y), sum(xy), sum(x2y)];

        // Gaussian elimination
        for (let i = 0; i < 3; i++) {
            let max = i;
            for (let j = i + 1; j < 3; j++) {
                if (Math.abs(A[j][i]) > Math.abs(A[max][i])) max = j;
            }
            [A[i], A[max]] = [A[max], A[i]];
            [B[i], B[max]] = [B[max], B[i]];

            for (let j = i + 1; j < 3; j++) {
                const factor = A[j][i] / A[i][i];
                for (let k = i; k < 3; k++) A[j][k] -= factor * A[i][k];
                B[j] -= factor * B[i];
            }
        }

        const coeffs = Array(3);
        for (let i = 2; i >= 0; i--) {
            coeffs[i] = B[i];
            for (let j = i + 1; j < 3; j++) coeffs[i] -= A[i][j] * coeffs[j];
            coeffs[i] /= A[i][i];
        }

        const nextX = n;
        const predY = coeffs[0] + coeffs[1] * nextX + coeffs[2] * nextX ** 2;
        return predY;
    }

    function tampilkanData(periode = 'harian') {
        if (!values.length) return tampilkanKosong();

        const rata = values.reduce((a, b) => a + b, 0) / values.length;
        const tertinggi = Math.max(...values);
        const terendah = Math.min(...values);
        const jam = jamPeriode[periode];

        document.getElementById('totalWatt').textContent = `${rata.toFixed(2)} Watt`;
        document.getElementById('totalKwh').textContent = `${(rata * jam / 1000).toFixed(2)} kWh`;
        document.getElementById('periodeLabel').textContent = `per ${periode.slice(0, -3)}`;
        document.getElementById('dayaTertinggi').textContent = `${tertinggi.toFixed(2)} Watt`;
        document.getElementById('dayaTerendah').textContent = `${terendah.toFixed(2)} Watt`;
        document.getElementById('totalData').textContent = `${values.length} titik data`;

        ['Harian', 'Mingguan', 'Bulanan'].forEach(p => {
            const jamx = jamPeriode[p.toLowerCase()];
            const kwh = (rata * jamx) / 1000;
            document.getElementById(`kwh${p}`).textContent = `${kwh.toFixed(2)} kWh`;
        });

        document.getElementById('perhitunganSummary').innerHTML = `
            <p>Berdasarkan data, rata-rata daya: <strong>${rata.toFixed(2)} Watt</strong>.
            Estimasi konsumsi: <strong>${(rata * jam / 1000).toFixed(2)} kWh</strong> ${periode}</p>
        `;

        const pred = prediksiRegresiKuadratik(values);
        if (pred !== null) {
            const predKwh = (pred * jam) / 1000;
            document.getElementById('prediksiWatt').textContent = `${pred.toFixed(2)} Watt`;
            document.getElementById('prediksiKwhHarian').textContent = `${predKwh.toFixed(2)} kWh`;
        }
    }

    function tampilkanKosong() {
        ['totalWatt', 'totalKwh', 'dayaTertinggi', 'dayaTerendah', 'totalData', 'kwhHarian', 'kwhMingguan', 'kwhBulanan', 'prediksiWatt', 'prediksiKwhHarian']
            .forEach(id => document.getElementById(id).textContent = 'N/A');
        document.getElementById('periodeLabel').textContent = '-';
        document.getElementById('perhitunganSummary').innerHTML = '<p>Tidak ada data.</p>';
    }

    periodeSelect.addEventListener('change', () => tampilkanData(periodeSelect.value));
    btn.addEventListener('click', () => {
        tampilkanData(periodeSelect.value);
        modal.show();
    });

    const prediksiSelect = document.getElementById('periodePrediksi');
    prediksiSelect.addEventListener('change', () => {
        tampilkanData(periodeSelect.value); // gunakan ulang logika tampilkanData
    });

});