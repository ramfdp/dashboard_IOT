function fetchPZEMAndRelayData() {
    console.log('[Monitoring] Starting data fetch...');
    Promise.all([
        fetch('https://smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app/sensor.json').then(res => res.json()),
        fetch('https://smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app/relayControl.json').then(res => res.json())
    ])
        .then(([sensor, relay]) => {
            console.log('[Monitoring] Firebase data received:', { sensor, relay });

            const voltage = sensor?.voltage ?? 0;
            const current = sensor?.current ?? 0;
            const power = sensor?.power ?? 0;

            // Daya lampu (relay aktif = 9 W each)
            let dayaLampu = 0;
            for (let i = 1; i <= 8; i++) {
                if (relay?.[`relay${i}`] == 1) dayaLampu += 9;
            }

            const totalPower = power + dayaLampu;

            // Konversi ke kWh (estimasi harian berdasarkan daya saat ini)
            const dailyKwh = (totalPower / 1000) * 24;
            const weeklyKwh = dailyKwh * 7;
            const monthlyKwh = dailyKwh * 30;

            console.log('[Monitoring] Calculated values:', {
                voltage, current, power, dayaLampu, totalPower,
                dailyKwh, weeklyKwh, monthlyKwh
            });

            // Tampilkan ke HTML - basic monitoring data
            document.getElementById('pzem-voltage').innerText = `${voltage.toFixed(1)} V`;
            document.getElementById('pzem-current').innerText = `${current.toFixed(2)} A`;
            document.getElementById('pzem-power').innerText = `${power.toFixed(2)} W`;
            document.getElementById('total-listrik').innerText = `${totalPower.toFixed(2)} W`;

            // Update elemen kWh dengan prioritas tinggi - overrides other calculations
            setTimeout(() => {
                const totalKwhElement = document.getElementById('totalKwh');
                if (totalKwhElement) {
                    totalKwhElement.innerText = `${dailyKwh.toFixed(2)} kWh`;
                    console.log(`[Monitoring] Updated totalKwh: ${dailyKwh.toFixed(2)} kWh`);
                }

                const kwhHarianElement = document.getElementById('kwhHarian');
                if (kwhHarianElement) {
                    kwhHarianElement.innerText = `${dailyKwh.toFixed(2)} kWh`;
                    console.log(`[Monitoring] Updated kwhHarian: ${dailyKwh.toFixed(2)} kWh`);
                }

                const kwhMingguanElement = document.getElementById('kwhMingguan');
                if (kwhMingguanElement) {
                    kwhMingguanElement.innerText = `${weeklyKwh.toFixed(2)} kWh`;
                    console.log(`[Monitoring] Updated kwhMingguan: ${weeklyKwh.toFixed(2)} kWh`);
                }

                const kwhBulananElement = document.getElementById('kwhBulanan');
                if (kwhBulananElement) {
                    kwhBulananElement.innerText = `${monthlyKwh.toFixed(2)} kWh`;
                    console.log(`[Monitoring] Updated kwhBulanan: ${monthlyKwh.toFixed(2)} kWh`);
                }

                // Store real-time data globally for other scripts to use
                window.realTimeElectricityData = {
                    voltage: voltage,
                    current: current,
                    power: power,
                    totalPower: totalPower,
                    dailyKwh: dailyKwh,
                    weeklyKwh: weeklyKwh,
                    monthlyKwh: monthlyKwh,
                    lastUpdated: new Date().toISOString()
                };
                console.log(`[Monitoring] Stored global data:`, window.realTimeElectricityData);
            }, 50); // Delay to ensure other scripts have updated first
        })
        .catch(err => {
            console.error("[Monitoring] Gagal memuat data sensor:", err);

            // Fallback with demo data if Firebase is unreachable
            const demoData = {
                voltage: 220.0,
                current: 0.45,
                power: 95.5,
                totalPower: 113.5, // Including some relay power
                dailyKwh: 2.72, // 113.5W * 24h / 1000
                weeklyKwh: 19.04,
                monthlyKwh: 81.6
            };

            console.log('[Monitoring] Using demo data:', demoData);

            // Update with demo data
            document.getElementById('pzem-voltage').innerText = `${demoData.voltage} V`;
            document.getElementById('pzem-current').innerText = `${demoData.current} A`;
            document.getElementById('pzem-power').innerText = `${demoData.power} W`;
            document.getElementById('total-listrik').innerText = `${demoData.totalPower} W`;

            setTimeout(() => {
                const totalKwhElement = document.getElementById('totalKwh');
                if (totalKwhElement) {
                    totalKwhElement.innerText = `${demoData.dailyKwh} kWh`;
                }

                const kwhHarianElement = document.getElementById('kwhHarian');
                if (kwhHarianElement) {
                    kwhHarianElement.innerText = `${demoData.dailyKwh} kWh`;
                }

                const kwhMingguanElement = document.getElementById('kwhMingguan');
                if (kwhMingguanElement) {
                    kwhMingguanElement.innerText = `${demoData.weeklyKwh} kWh`;
                }

                const kwhBulananElement = document.getElementById('kwhBulanan');
                if (kwhBulananElement) {
                    kwhBulananElement.innerText = `${demoData.monthlyKwh} kWh`;
                }

                window.realTimeElectricityData = demoData;
                window.realTimeElectricityData.lastUpdated = new Date().toISOString();
                console.log('[Monitoring] Stored demo data globally');
            }, 50);
        });
}

// Jalankan pertama kali
fetchPZEMAndRelayData();

let monitoringInterval = null;
let isMonitoringActive = false;

function startMonitoring() {
    if (!isMonitoringActive) {
        isMonitoringActive = true;
        monitoringInterval = setInterval(fetchPZEMAndRelayData, 5000);
    }
}

function stopMonitoring() {
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
        monitoringInterval = null;
        isMonitoringActive = false;
    }
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopMonitoring();
    } else {
        startMonitoring();
    }
});

window.addEventListener('beforeunload', stopMonitoring);

startMonitoring();