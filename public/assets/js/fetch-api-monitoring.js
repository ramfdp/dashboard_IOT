function fetchPZEMAndRelayData() {
    Promise.all([
        fetch('https://smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app/sensor.json').then(res => res.json()),
        fetch('https://smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app/relayControl.json').then(res => res.json())
    ])
        .then(([sensor, relay]) => {
            const voltage = sensor?.voltage ?? 0;
            const current = sensor?.current ?? 0;
            const power = sensor?.power ?? 0;

            // Daya lampu (relay aktif = 9 W each)
            let dayaLampu = 0;
            for (let i = 1; i <= 8; i++) {
                if (relay?.[`relay${i}`] == 1) dayaLampu += 9;
            }

            const totalPower = power + dayaLampu;

            // Tampilkan ke HTML
            document.getElementById('pzem-voltage').innerText = `${voltage.toFixed(1)} V`;
            document.getElementById('pzem-current').innerText = `${current.toFixed(2)} A`;
            document.getElementById('pzem-power').innerText = `${power.toFixed(2)} W`;
            document.getElementById('total-listrik').innerText = `${totalPower.toFixed(2)} W`;
        })
        .catch(err => {
            console.error("Gagal memuat data sensor:", err);
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