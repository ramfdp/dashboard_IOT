class AutoPZEMGenerator {
    constructor() {
        this.isRunning = false;
        this.interval = null;
        this.databaseSyncCounter = 0;
        this.currentData = {
            voltage: 220,
            current: 0,
            power: 0,
            totalPower: 0
        };

        // Konfigurasi API eksternal
        this.apiConfig = {
            url: `${window.baseUrl}/api/proxy/rama-json`, // Menggunakan proxy Laravel untuk bypass CORS
            enabled: true, // Set false untuk pakai generator
            refreshInterval: 300000, // 5 menit
            updateInterval: 10000 // 10 detik
        };
        this.apiDataCache = [];
        this.apiCurrentIndex = 0;
        this.apiLastFetch = null;

        this.nightModeSimulation = {
            enabled: true,
            intervalHours: 1,
            durationMinutes: 30,
            powerReduction: 0.3,
            currentReduction: 0.3,
            lastTriggerTime: null,
            isActive: false,
            startTime: null,
            nextTriggerTime: null
        };

        this.buildingProfile = {
            basePowerConsumption: 400,
            maxPowerConsumption: 650,
            operatingHours: { start: 7, end: 19 },
            weekendReduction: 0.3
        };

        this.initializeNightMode();
        // Firebase listener DISABLED - hanya push data dari API
        // this.setupFirebaseListener();
        this.setupFirebase(); // Init Firebase tanpa listener

        // Load chart data dulu, baru start
        this.loadChartDataFromDatabase().then(() => {
            // Fetch data dari API eksternal jika enabled
            if (this.apiConfig.enabled) {
                this.fetchExternalAPI().then(() => {
                    if (!this.isRunning) {
                        this.start();
                    }
                });
            } else {
                if (!this.isRunning) {
                    this.start();
                }
            }
        });
    }

    // ========== FETCH DATA DARI API EKSTERNAL ==========
    async fetchExternalAPI() {
        try {
            console.log('🔌 [AutoPZEM] Fetching data from rama.json API via proxy...');

            const response = await fetch(this.apiConfig.url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const rawData = await response.json();

            if (!Array.isArray(rawData) || rawData.length === 0) {
                throw new Error('Invalid data format from API');
            }

            this.apiDataCache = rawData;
            this.apiCurrentIndex = 0;
            this.apiLastFetch = Date.now();

            console.log(`✅ [AutoPZEM] Fetched ${rawData.length} records from rama.json API`);
            console.log('📊 Sample data:', rawData[0]);

            // Schedule refresh
            setTimeout(() => this.fetchExternalAPI(), this.apiConfig.refreshInterval);

            return true;

        } catch (error) {
            console.error('❌ [AutoPZEM] Failed to fetch external API:', error);
            console.warn('⚠️ [AutoPZEM] Falling back to generator mode');
            this.apiConfig.enabled = false;
            return false;
        }
    }

    // ========== AMBIL DATA BERIKUTNYA DARI CACHE API ==========
    getNextAPIData() {
        if (!this.apiDataCache.length) {
            return null;
        }

        const rawData = this.apiDataCache[this.apiCurrentIndex];

        // Increment index dengan looping
        this.apiCurrentIndex = (this.apiCurrentIndex + 1) % this.apiDataCache.length;

        // Normalisasi data dari format API eksternal
        // Format API: tegangan=560V (3 phase), perlu dibagi 3 untuk single phase display
        return {
            voltage: parseFloat(rawData.tegangan) || 220,
            current: parseFloat(rawData.arus) || 0,
            power: parseFloat(rawData.daya) || 0,
            energi: parseFloat(rawData.energi) / 1000 || 0, // Wh to kWh
            frekuensi: parseFloat(rawData.frekuensi) || 50.0, // Parse "50 Hz" string
            power_factor: parseFloat(rawData.power_factor) || 0.85,
            totalPower: parseFloat(rawData.daya) || 0,
            timestamp: this.getIndonesiaTimestamp()
        };
    }

    // ========== PUSH DATA KE FIREBASE ==========
    async pushToFirebase(data) {
        try {
            if (typeof firebase === 'undefined' || !firebase.database) {
                console.warn('[AutoPZEM] Firebase not initialized, skipping push');
                return false;
            }

            const sensorRef = firebase.database().ref('sensor');

            const firebaseData = {
                voltage: data.voltage,
                current: data.current,
                power: data.power,
                energi: data.energi,
                frekuensi: data.frekuensi,
                power_factor: data.power_factor,
                timestamp: data.timestamp,
                lastUpdated: firebase.database.ServerValue.TIMESTAMP
            };

            await sensorRef.set(firebaseData);
            console.log('🔥 [AutoPZEM] Data pushed to Firebase');

            return true;

        } catch (error) {
            console.error('[AutoPZEM] Firebase push error:', error);
            return false;
        }
    }

    initializeNightMode() {
        const now = new Date();
        this.nightModeSimulation.nextTriggerTime = new Date(
            now.getTime() + this.nightModeSimulation.intervalHours * 60 * 60 * 1000
        );
    }

    // ========== LOAD CHART DATA DARI DATABASE ==========
    async loadChartDataFromDatabase() {
        try {
            console.log('📂 [AutoPZEM] Loading chart data from database...');

            const response = await fetch(`${window.baseUrl}/api/listrik/chart-data/today`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.data) {
                window.globalElectricityData = {
                    labels: result.data.labels || [],
                    values: result.data.values || [],
                    source: 'api'
                };
                console.log(`✅ [AutoPZEM] Loaded ${result.data.count} chart data points from database`);
            } else {
                this.resetChartData();
            }

        } catch (error) {
            console.error('[AutoPZEM] Error loading chart data from database:', error);
            this.resetChartData();
        }
    }

    // ========== RESET CHART DATA ==========
    resetChartData() {
        window.globalElectricityData = {
            labels: [],
            values: [],
            source: 'api'
        };
    }

    // ========== SAVE CHART DATA KE DATABASE ==========
    async saveChartDataToDatabase(data) {
        // Data sudah disimpan ke tabel listriks via sendToDatabase()
        // Tidak perlu save terpisah karena menggunakan tabel yang sama
        return true;
    }

    setupFirebase() {
        const initFirebase = () => {
            try {
                if (typeof firebase === 'undefined' || !firebase.database) {
                    setTimeout(initFirebase, 500);
                    return;
                }

                const firebaseConfig = {
                    apiKey: "AIzaSyDy8HhOzJXhuHLRU8WXE4aS65FHdg7LRy0",
                    authDomain: "smart-building-3e5c1.firebaseapp.com",
                    databaseURL: "https://smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app",
                    projectId: "smart-building-3e5c1",
                    storageBucket: "smart-building-3e5c1.firebasestorage.app",
                    messagingSenderId: "1095165881086",
                    appId: "1:1095165881086:web:e87280aa0b9f8bd4b9b67b"
                };

                if (!firebase.apps || !firebase.apps.length) {
                    firebase.initializeApp(firebaseConfig);
                    console.log('🔥 [AutoPZEM] Firebase initialized (PUSH ONLY mode)');
                }

            } catch (error) {
                console.error('[AutoPZEM] Firebase init error:', error);
            }
        };

        initFirebase();
    }


    generateRealisticValues() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const dayOfWeek = now.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        let voltage, current, power;

        // ========== WEEKEND (No load, voltage jumps to 380V) ==========
        if (isWeekend) {
            voltage = 375 + Math.random() * 5;
            current = 0.3 + Math.random() * 0.2;
            power = 200 + Math.random() * 50;

        } else {
            // ========== JAM KERJA 08-12 & 14-18 ==========
            if ((hour >= 8 && hour < 12) || (hour >= 14 && hour < 18)) {
                voltage = 221 + Math.random() * 2;
                current = 13.5 + Math.random() * 2.1;
                power = voltage * current + (Math.random() - 0.5) * 200;

            } else if (hour >= 12 && hour < 14) {
                // ========== JAM ISTIRAHAT ==========
                voltage = 220 + Math.random() * 2;
                current = 8.5 + Math.random() * 2.0;
                power = voltage * current + (Math.random() - 0.5) * 100;

            } else if (hour >= 18 || hour < 8) {
                // ========== MALAM HARI ==========
                voltage = 350 + Math.random() * 20;
                current = 0.6 + Math.random() * 0.3;
                power = 200 + Math.random() * 100;

            } else {
                // ========== TRANSISI 06-08 ==========
                voltage = 220 + Math.random() * 2;
                current = 7.3 + Math.random() * 1.5;
                power = voltage * current + (Math.random() - 0.5) * 150;
            }
        }

        if ((hour >= 8 && hour < 18) && !isWeekend) {
            current = Math.max(7.3, Math.min(15.6, current));
            voltage = Math.max(220, Math.min(223, voltage));
            power = voltage * current;
        } else {
            voltage = Math.max(350, Math.min(380, voltage));
        }

        // kalkulasi energi
        const energi = ((power / 1000) * (1 / 360)).toFixed(4);

        const frekuensi = (50 + (Math.random() - 0.5) * 0.5).toFixed(2);
        const power_factor = (0.85 + Math.random() * 0.10).toFixed(3);

        const lightingPower = Math.random() * 10 + 5;
        const totalPower = power + lightingPower;

        return {
            voltage: Math.round(voltage * 10) / 10,
            current: Math.round(current * 100) / 100,
            power: Math.round(power),
            energi: parseFloat(energi),
            frekuensi: parseFloat(frekuensi),
            power_factor: parseFloat(power_factor),
            totalPower: Math.round(totalPower),
            timestamp: this.getIndonesiaTimestamp()
        };
    }

    getIndonesiaTimestamp() {
        const now = new Date();
        return now.toISOString().replace('Z', '+07:00');
    }


    updateNightModeIndicator() {
        if (window.location.pathname.includes('/login') || document.querySelector('.login-with-news-feed')) {
            return;
        }

        const now = new Date();
        const hour = now.getHours();
        const isNightTime = (hour >= 22 || hour < 6);

        let nightIndicator = document.getElementById('nightModeIndicator');
        if (!nightIndicator) {
            nightIndicator = document.createElement('div');
            nightIndicator.id = 'nightModeIndicator';
            nightIndicator.style.cssText = `
                position: fixed;
                top: 10px; right: 10px;
                z-index: 1000;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: bold;
                min-width: 120px;
                text-align: center;
            `;
            document.body.appendChild(nightIndicator);
        }

        if (isNightTime) {
            nightIndicator.innerHTML = `<i class="fa fa-moon"></i> Night Mode<br><small>-70% Power</small>`;
            nightIndicator.className = 'badge bg-dark text-white';
        } else {
            nightIndicator.innerHTML = `<i class="fa fa-sun"></i> Day Mode<br><small>Normal Power</small>`;
            nightIndicator.className = 'badge bg-warning text-dark';
        }
    }


    updateDisplay(data) {
        this.updateNightModeIndicator();

        // Update UI langsung dari data API
        this.updateUI(data);

        this.databaseSyncCounter++;

        if (this.databaseSyncCounter >= 3) {
            // Kirim ke database (untuk semua mode)
            this.sendToDatabase(data);
            this.databaseSyncCounter = 0;
        }

        // Push ke Firebase HANYA jika data dari API eksternal
        // Tidak ada delay/counter - langsung push setiap update
        if (this.apiConfig.enabled && this.apiDataCache.length > 0) {
            this.pushToFirebase(data);
        }
    }

    // ========== UPDATE UI ELEMENTS ==========
    updateUI(data) {
        // Update display elements
        const voltageEl = document.getElementById('pzem-voltage');
        const currentEl = document.getElementById('pzem-current');
        const powerEl = document.getElementById('pzem-power');
        const energiEl = document.getElementById('pzem-energi');
        const frekuensiEl = document.getElementById('pzem-frekuensi');
        const powerFactorEl = document.getElementById('pzem-power-factor');

        if (voltageEl) voltageEl.textContent = `${data.voltage} V`;
        if (currentEl) currentEl.textContent = `${data.current} A`;
        if (powerEl) powerEl.textContent = `${data.power} W`;
        if (energiEl) energiEl.textContent = `${data.energi.toFixed(2)} kWh`;
        if (frekuensiEl) frekuensiEl.textContent = `${data.frekuensi} Hz`;
        if (powerFactorEl) powerFactorEl.textContent = data.power_factor;

        // Update current data
        this.currentData = data;

        // Update chart
        this.updateChart(data);
    }


    updateChart(data) {
        // Update global electricity data untuk semua chart
        if (!window.globalElectricityData) {
            window.globalElectricityData = {
                labels: [],
                values: [],
                source: 'api'
            };
        }

        const newValue = data.power || 0;
        const now = new Date();
        const label = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        // Cek apakah label ini sudah ada (avoid duplicate)
        const lastLabel = window.globalElectricityData.labels[window.globalElectricityData.labels.length - 1];
        if (lastLabel === label) {
            // Update nilai yang sudah ada, jangan tambah baru
            window.globalElectricityData.values[window.globalElectricityData.values.length - 1] = newValue;
        } else {
            // Tambah data baru
            window.globalElectricityData.values.push(newValue);
            window.globalElectricityData.labels.push(label);
        }

        // Limit to 50 data points
        if (window.globalElectricityData.values.length > 50) {
            window.globalElectricityData.values.shift();
            window.globalElectricityData.labels.shift();
        }

        // Data chart otomatis tersimpan via sendToDatabase() ke tabel listriks
        // Tidak perlu save terpisah

        // Ensure chart exists first
        this.ensureChartExists();

        // Primary chart: wattChart (created by dashboard-electricity.js or AutoPZEM)
        const chartToUpdate = window.wattChart || window.electricityChart;

        if (chartToUpdate && chartToUpdate.data && chartToUpdate.data.datasets && chartToUpdate.data.datasets[0]) {
            try {
                chartToUpdate.data.labels = [...window.globalElectricityData.labels];
                chartToUpdate.data.datasets[0].data = [...window.globalElectricityData.values];
                chartToUpdate.update('none');
                console.log('📊 [AutoPZEM] Chart updated with', newValue, 'W');
            } catch (e) {
                console.error('[AutoPZEM] Chart update failed:', e);
            }
        } else {
            console.warn('[AutoPZEM] Chart not ready for update');
        }

        this.updateDashboardStatistics();
    }

    // ========== ENSURE CHART EXISTS ==========
    ensureChartExists() {
        // Tunggu Chart.js loaded
        if (typeof Chart === 'undefined') {
            console.warn('[AutoPZEM] Chart.js not loaded yet');
            setTimeout(() => this.ensureChartExists(), 1000);
            return;
        }

        // Cari canvas wattChart (primary chart untuk dashboard)
        const canvasWatt = document.getElementById('wattChart');

        if (!canvasWatt) {
            console.warn('[AutoPZEM] Canvas wattChart not found');
            return;
        }

        try {
            // Check if chart already exists (created by dashboard-electricity.js)
            let chartInstance = Chart.getChart(canvasWatt);

            if (chartInstance) {
                // Chart sudah ada, assign ke window.wattChart jika belum
                if (!window.wattChart) {
                    window.wattChart = chartInstance;
                    console.log('✅ [AutoPZEM] Using existing wattChart instance');
                }
                // Jika chart sudah ada tapi nama variabelnya electricityChart
                if (!window.wattChart && window.electricityChart) {
                    window.wattChart = window.electricityChart;
                    console.log('✅ [AutoPZEM] Aliased electricityChart to wattChart');
                }

                // Restore data dari storage jika chart baru dibuat
                if (window.globalElectricityData && window.globalElectricityData.values.length > 0) {
                    chartInstance.data.labels = [...window.globalElectricityData.labels];
                    chartInstance.data.datasets[0].data = [...window.globalElectricityData.values];
                    chartInstance.update('none');
                    console.log(`📊 [AutoPZEM] Restored ${window.globalElectricityData.values.length} data points to chart`);
                }
            } else {
                // Create chart baru jika belum ada
                const ctx = canvasWatt.getContext('2d');
                window.wattChart = new Chart(ctx, this.getChartConfig());
                console.log('✅ [AutoPZEM] Created new wattChart');

                // Restore data dari storage
                if (window.globalElectricityData && window.globalElectricityData.values.length > 0) {
                    window.wattChart.data.labels = [...window.globalElectricityData.labels];
                    window.wattChart.data.datasets[0].data = [...window.globalElectricityData.values];
                    window.wattChart.update('none');
                    console.log(`📊 [AutoPZEM] Restored ${window.globalElectricityData.values.length} data points to new chart`);
                }
            }
        } catch (error) {
            console.error('[AutoPZEM] Chart creation error:', error);
        }
    }

    // ========== GET CHART CONFIG ==========
    getChartConfig() {
        return {
            type: 'line',
            data: {
                labels: window.globalElectricityData?.labels || [],
                datasets: [{
                    label: 'Daya (W)',
                    data: window.globalElectricityData?.values || [],
                    borderColor: 'rgba(100, 200, 255, 1)', // Biru muda
                    backgroundColor: 'rgba(100, 200, 255, 0.2)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    pointBackgroundColor: 'rgba(100, 200, 255, 1)',
                    pointBorderColor: 'rgba(255, 255, 255, 1)',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: 'rgba(255, 255, 255, 0.9)',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Real-Time Power Monitoring (API Data)',
                        color: 'rgba(255, 255, 255, 0.9)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Waktu',
                            color: 'rgba(255, 255, 255, 0.8)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Daya (Watt)',
                            color: 'rgba(255, 255, 255, 0.8)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        beginAtZero: true
                    }
                },
                animation: {
                    duration: 0
                }
            }
        };
    }

    updateDashboardStatistics() {
        if (!window.globalElectricityData || !window.globalElectricityData.values.length) return;

        const values = window.globalElectricityData.values;
        const avg = values.reduce((a, b) => a + b, 0) / values.length;

        const stats = {
            dayaTertinggi: `${Math.max(...values)} W`,
            dayaTerendah: `${Math.min(...values)} W`,
            totalData: values.length,
            kwhHarian: `${(avg * 24 / 1000).toFixed(2)} kWh`,
            kwhMingguan: `${(avg * 24 * 7 / 1000).toFixed(2)} kWh`,
            kwhBulanan: `${(avg * 24 * 30 / 1000).toFixed(2)} kWh`
        };

        for (let id in stats) {
            const el = document.getElementById(id);
            if (el) el.textContent = stats[id];
        }
    }

    async sendToDatabase(data) {
        try {
            const payload = {
                tegangan: data.voltage,
                arus: data.current,
                daya: data.power,
                energi: data.energi || (data.power / 1000 / 60),
                frekuensi: data.frekuensi || 50.0,
                power_factor: data.power_factor || 0.85,
                timestamp: data.timestamp
            };

            const response = await fetch(`${window.baseUrl}/api/real-time-power`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log('💾 [AutoPZEM] Data saved to DB');

        } catch (err) {
            console.error("[AutoPZEM] Error sendToDatabase:", err);
        }
    }


    start() {
        if (this.isRunning) return;

        this.isRunning = true;

        const mode = this.apiConfig.enabled ? 'API + FIREBASE' : 'GENERATOR';
        console.log(`🚀 [AutoPZEM] Started in ${mode} mode`);

        // Wait for dashboard-electricity.js to create chart first
        setTimeout(() => {
            this.ensureChartExists();
            console.log('[AutoPZEM] Chart initialization check completed');
        }, 3000);

        this.interval = setInterval(() => {
            let data;

            // Prioritas: gunakan data dari API eksternal jika tersedia
            if (this.apiConfig.enabled && this.apiDataCache.length > 0) {
                data = this.getNextAPIData();
                console.log(`📡 [AutoPZEM] API data [${this.apiCurrentIndex}/${this.apiDataCache.length}] | V:${data.voltage} A:${data.current} W:${data.power} PF:${data.power_factor}`);
            } else {
                // Fallback ke generator
                data = this.generateRealisticValues();
                console.log('🔄 [AutoPZEM] Using generated data');
            }

            if (data) {
                this.currentData = data;
                this.updateDisplay(data);
            }
        }, this.apiConfig.enabled ? this.apiConfig.updateInterval : 3000);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isRunning = false;
        console.log('⏹️ [AutoPZEM] Stopped');
    }
}

// ========== AUTO-START ==========
document.addEventListener('DOMContentLoaded', () => {
    // Delay 2 detik untuk pastikan Firebase loaded
    setTimeout(() => {
        console.log('🔌 Initializing AutoPZEM Generator...');
        window.autoPZEM = new AutoPZEMGenerator();
    }, 2000);
});
