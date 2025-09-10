/**
 * kWh Monitoring Script
 * Handles kWh calculations only - PZEM values are handled by auto-pzem-values.js
 */

function fetchPZEMAndRelayData() {
    console.log('[Monitoring] Starting data fetch for kWh calculations only...');

    // Check if auto PZEM generator is running
    if (window.autoPZEMGenerator && window.autoPZEMGenerator.isRunning) {
        console.log('[Monitoring] Auto PZEM generator is active, using its data for kWh calculations');

        // Use data from auto generator
        const currentData = window.autoPZEMGenerator.currentData;
        updateKwhCalculations(currentData.power, currentData.totalPower);
        return;
    }

    // If auto generator is not available, fall back to Firebase
    Promise.all([
        fetch('https://smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app/sensor.json').then(res => res.json()),
        fetch('https://smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app/relayControl.json').then(res => res.json())
    ])
        .then(([sensor, relay]) => {
            console.log('[Monitoring] Firebase data received for kWh calculations:', { sensor, relay });

            const voltage = sensor?.voltage ?? 0;
            const current = sensor?.current ?? 0;
            const power = sensor?.power ?? 0;

            // Daya lampu (relay aktif = 9 W each)
            let dayaLampu = 0;
            for (let i = 1; i <= 8; i++) {
                if (relay?.[`relay${i}`] == 1) dayaLampu += 9;
            }

            const totalPower = power + dayaLampu;

            // Only update kWh calculations, not the PZEM display values
            updateKwhCalculations(power, totalPower);
        })
        .catch(err => {
            console.error("[Monitoring] Gagal memuat data sensor:", err);
            // Use fallback demo data for kWh calculations
            updateKwhCalculations(95.5, 113.5);
        });
}

function updateKwhCalculations(power, totalPower) {
    // Konversi ke kWh (estimasi harian berdasarkan daya saat ini)
    const dailyKwh = (totalPower / 1000) * 24;
    const weeklyKwh = dailyKwh * 7;
    const monthlyKwh = dailyKwh * 30;

    console.log('[Monitoring] Calculated kWh values:', {
        power, totalPower, dailyKwh, weeklyKwh, monthlyKwh
    });

    // Update elemen kWh saja
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

        // Store global data for other scripts
        window.realTimeElectricityData = {
            power: power,
            totalPower: totalPower,
            dailyKwh: dailyKwh,
            weeklyKwh: weeklyKwh,
            monthlyKwh: monthlyKwh,
            lastUpdated: new Date().toISOString()
        };
        console.log(`[Monitoring] Stored global kWh data:`, window.realTimeElectricityData);
    }, 50);
}

// Initialize monitoring - but only for kWh calculations
document.addEventListener('DOMContentLoaded', function () {
    console.log('[Monitoring] DOM loaded - initializing kWh monitoring only');

    // Wait for auto PZEM generator to start first
    setTimeout(() => {
        fetchPZEMAndRelayData();

        // Set interval for periodic kWh updates (every 30 seconds)
        setInterval(fetchPZEMAndRelayData, 30000);
    }, 2000);
});

console.log('[Monitoring] kWh monitoring script loaded - PZEM values will be handled by auto-generator');