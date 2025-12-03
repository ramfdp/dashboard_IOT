class AutoPZEMGenerator {
    constructor() {
        // SINGLETON: Pastikan hanya 1 instance berjalan
        if (window.autoPZEMInstance) {
            console.warn('⚠️ [AutoPZEM] Instance already exists, stopping previous...');
            window.autoPZEMInstance.stop();
        }
        window.autoPZEMInstance = this;

        this.isRunning = false;
        this.interval = null;
        this.databaseSyncCounter = 0;
        this.currentData = {
            voltage: 220,
            current: 0,
            power: 0,
            totalPower: 0
        };

        // Previous data untuk smoothing
        this.previousData = {
            voltage: 220,
            current: 0,
            power: 0,
            energi: 0,
            frekuensi: 50,
            power_factor: 0.85
        };

        // Smoothing configuration
        this.smoothingConfig = {
            enabled: true,
            maxChangePercent: 2, // Maksimal perubahan 2% per update (lebih halus)
            transitionSteps: 3   // Jumlah step untuk transisi
        };

        // Stability configuration - Data stabil 10 menit
        this.stabilityConfig = {
            duration: 600000, // 10 menit dalam ms
            currentData: null,
            startTime: null
        };

        // Konfigurasi API eksternal - HANYA dari data.json
        this.apiConfig = {
            url: `${window.baseUrl}/api/proxy/iot-data`, // Proxy ke http://115.85.65.125:8084/iot/data.json
            enabled: true, // WAJIB true - semua data dari API
            refreshInterval: 10000, // 10 detik
            updateInterval: 10000 // 10 detik
        };
        this.apiDataCache = [];
        this.apiRandomIndices = []; // Array untuk urutan acak
        this.apiCurrentIndex = 0;
        this.apiLastFetch = null;

        this.nightModeSimulation = {
            enabled: false,
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

        // this.initializeNightMode(); // DISABLED - pakai data API murni

        // API PUSH MODE - Fetch dari API → Push ke Firebase → Baca dari Firebase
        this.setupFirebase(); // Init Firebase
        this.setupFirebaseListener(); // Listener untuk display data

        // Load chart data dari database
        this.loadChartDataFromDatabase().then(() => {
            // Fetch data dari API dan mulai push ke Firebase
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

        console.log('🔥 [AutoPZEM] API → Firebase → Display MODE');
        console.log('📡 [AutoPZEM] Fetching from API, pushing to Firebase, displaying from Firebase');
    }

    // ========== FETCH DATA DARI API EKSTERNAL ==========
    async fetchExternalAPI() {
        try {
            console.log('🔌 [AutoPZEM] Fetching data from API via Laravel proxy...');

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

            const result = await response.json();

            // API mengembalikan object dengan property "data" dan "Count"
            let rawData = [];
            if (result.data && Array.isArray(result.data)) {
                rawData = result.data;
            } else if (Array.isArray(result)) {
                rawData = result;
            } else {
                throw new Error('Invalid data format from API');
            }

            if (rawData.length === 0) {
                throw new Error('No data received from API');
            }

            // Filter data - hanya ambil yang power dalam range reasonable (200W - 3000W)
            const filteredData = rawData.filter(d => {
                const power = parseFloat(d.daya) || 0;
                return power >= 200 && power <= 3000;
            });

            if (filteredData.length === 0) {
                console.warn('⚠️ [AutoPZEM] No data in valid range after filtering, using all data');
                this.apiDataCache = rawData;
            } else {
                console.log(`🗑️ [AutoPZEM] Filtered ${rawData.length} → ${filteredData.length} records (removed outliers)`);
                this.apiDataCache = filteredData;
            }

            // Generate random indices untuk randomize urutan data
            this.apiRandomIndices = this.generateRandomIndices(this.apiDataCache.length);
            this.apiCurrentIndex = 0;
            this.apiLastFetch = Date.now();

            // Analisa range power dari API
            const powerValues = this.apiDataCache.map(d => parseFloat(d.daya) || 0);
            const minPower = Math.min(...powerValues);
            const maxPower = Math.max(...powerValues);
            const avgPower = powerValues.reduce((a, b) => a + b, 0) / powerValues.length;

            console.log(`✅ [AutoPZEM] Loaded ${this.apiDataCache.length} valid records from API`);
            console.log(`📊 [AutoPZEM] Power range: ${minPower.toFixed(0)}W - ${maxPower.toFixed(0)}W (avg: ${avgPower.toFixed(0)}W)`);
            console.log('🔀 [AutoPZEM] Data order randomized');
            console.log('📊 Sample data:', this.apiDataCache[0]);

            // Schedule refresh
            setTimeout(() => this.fetchExternalAPI(), this.apiConfig.refreshInterval);

            return true;

        } catch (error) {
            console.error('❌ [AutoPZEM] Failed to fetch external API:', error);
            console.warn('⚠️ [AutoPZEM] Falling back to generator mode');
            this.apiConfig.enabled = false;
            return false;
        }
    }    // ========== GENERATE RANDOM INDICES ==========
    generateRandomIndices(length) {
        // Buat array dengan urutan 0 sampai length-1
        const indices = Array.from({ length }, (_, i) => i);

        // Fisher-Yates shuffle algorithm untuk randomize
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }

        return indices;
    }

    // ========== SMOOTH DATA TRANSITION ==========
    smoothDataTransition(newData) {
        if (!this.smoothingConfig.enabled) {
            return newData;
        }

        const smoothed = {};
        const maxChange = this.smoothingConfig.maxChangePercent / 100;

        // Smooth each numeric field
        ['voltage', 'current', 'power', 'energi', 'frekuensi', 'power_factor'].forEach(field => {
            const oldValue = this.previousData[field] || newData[field];
            const newValue = newData[field];

            if (oldValue === 0 || oldValue === undefined) {
                smoothed[field] = newValue;
                return;
            }

            const diff = newValue - oldValue;
            const changePercent = Math.abs(diff / oldValue);

            // Jika perubahan terlalu besar, batasi
            if (changePercent > maxChange) {
                const maxDiff = oldValue * maxChange;
                if (diff > 0) {
                    smoothed[field] = oldValue + maxDiff;
                } else {
                    smoothed[field] = oldValue - maxDiff;
                }
                console.log(`🔒 [Smoothing] ${field}: ${oldValue.toFixed(2)} → ${newValue.toFixed(2)} LIMITED to ${smoothed[field].toFixed(2)} (blocked ${(changePercent * 100).toFixed(1)}% change, allowed 5%)`);
            } else {
                smoothed[field] = newValue;
                if (field === 'power') {
                    console.log(`✅ [Smoothing] ${field}: ${oldValue.toFixed(2)} → ${newValue.toFixed(2)} (change ${(changePercent * 100).toFixed(1)}% - within limit)`);
                }
            }
        });

        // Copy non-numeric fields
        smoothed.totalPower = smoothed.power || newData.totalPower;
        smoothed.timestamp = newData.timestamp;

        // Update previous data
        this.previousData = { ...smoothed };

        return smoothed;
    }

    // ========== AMBIL DATA BERIKUTNYA DARI CACHE API (BERUBAH SETIAP 10 DETIK) ==========
    getNextAPIData() {
        if (!this.apiDataCache.length) {
            return null;
        }

        // SELALU ambil data baru setiap kali dipanggil (TIDAK ADA STABILITY MODE)
        // Ambil data random dari cache
        const randomIndex = this.apiRandomIndices[this.apiCurrentIndex];
        const rawData = this.apiDataCache[randomIndex];

        // Increment index dengan looping
        this.apiCurrentIndex = (this.apiCurrentIndex + 1) % this.apiRandomIndices.length;

        // Jika sudah mencapai akhir, shuffle lagi untuk variasi
        if (this.apiCurrentIndex === 0) {
            console.log('🔀 [AutoPZEM] Reshuffling data order...');
            this.apiRandomIndices = this.generateRandomIndices(this.apiDataCache.length);
        }

        // Parse frequency - handle format "50 Hz" atau "50"
        let frequency = 50.0;
        if (rawData['frekuensi '] !== undefined) {
            const freqStr = String(rawData['frekuensi ']).replace(/[^0-9.]/g, '');
            frequency = parseFloat(freqStr) || 50.0;
        } else if (rawData.frekuensi !== undefined) {
            const freqStr = String(rawData.frekuensi).replace(/[^0-9.]/g, '');
            frequency = parseFloat(freqStr) || 50.0;
        }

        // Parse energy - handle key dengan spasi
        let energi = 0;
        if (rawData['energi '] !== undefined) {
            energi = parseFloat(rawData['energi ']) || 0;
        } else if (rawData.energi !== undefined) {
            energi = parseFloat(rawData.energi) || 0;
        }

        // Normalisasi data dari format API eksternal
        const parsedData = {
            voltage: parseFloat(rawData.tegangan) || 220,
            current: parseFloat(rawData.arus) || 0,
            power: parseFloat(rawData.daya) || 0,
            energi: energi / 1000, // Wh to kWh
            frekuensi: frequency,
            power_factor: parseFloat(rawData.power_factor) || 0.85,
            totalPower: parseFloat(rawData.daya) || 0,
            timestamp: this.getIndonesiaTimestamp()
        };

        // Apply smoothing untuk perubahan halus setiap update
        const smoothedData = this.smoothDataTransition(parsedData);

        return smoothedData;
    }

    // ========== CLEAR FIREBASE DATA (HAPUS DATA LAMA) ==========
    async clearFirebaseData() {
        try {
            if (typeof firebase === 'undefined' || !firebase.database) {
                return false;
            }

            const sensorRef = firebase.database().ref('sensor');
            await sensorRef.remove();
            console.log('🧽 [AutoPZEM] Firebase data cleared (removing old cached data)');
            return true;
        } catch (error) {
            console.error('[AutoPZEM] Firebase clear error:', error);
            return false;
        }
    }

    // ========== PUSH DATA KE FIREBASE ==========
    async pushToFirebase(data) {
        try {
            if (typeof firebase === 'undefined' || !firebase.database) {
                console.warn('[AutoPZEM] Firebase not initialized, skipping push');
                return false;
            }

            // VALIDASI: Hanya reject jika data benar-benar invalid
            if (!data || typeof data.power === 'undefined') {
                console.error('❌ [AutoPZEM] REJECTED: Invalid data object', data);
                return false;
            }

            // Log semua data sebelum validasi
            console.log('🔍 [AutoPZEM] Checking data:', {
                power: data.power,
                voltage: data.voltage,
                current: data.current
            });

            // Validasi power range (200W - 3000W)
            if (data.power < 200 || data.power > 3000) {
                console.error(`❌ [AutoPZEM] REJECTED: Power ${data.power.toFixed(2)}W is out of valid range (200-3000W)`);
                return false;
            }

            const sensorRef = firebase.database().ref('sensor');

            const firebaseData = {
                voltage: data.voltage || 220,
                current: data.current || 0,
                power: data.power,
                energi: data.energi || 0,
                frekuensi: data.frekuensi || 50,
                power_factor: data.power_factor || 0.85,
                timestamp: data.timestamp || this.getIndonesiaTimestamp(),
                lastUpdated: firebase.database.ServerValue.TIMESTAMP
            };

            await sensorRef.set(firebaseData);
            console.log(`🔥 [AutoPZEM] Data pushed to Firebase - Power: ${data.power.toFixed(2)}W, Voltage: ${data.voltage.toFixed(2)}V`);

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
                    console.log('🔥 [AutoPZEM] Firebase initialized (API → Firebase → Display mode)');
                }

            } catch (error) {
                console.error('[AutoPZEM] Firebase init error:', error);
            }
        };

        initFirebase();
    }

    // ========== SETUP FIREBASE LISTENER (HANYA BACA DATA) ==========
    setupFirebaseListener() {
        const startListener = () => {
            try {
                if (typeof firebase === 'undefined' || !firebase.database) {
                    setTimeout(startListener, 500);
                    return;
                }

                const sensorRef = firebase.database().ref('sensor');

                console.log('🔊 [AutoPZEM] Firebase listener started - waiting for data...');

                sensorRef.on('value', (snapshot) => {
                    const firebaseData = snapshot.val();

                    if (!firebaseData) {
                        console.warn('⚠️ [AutoPZEM] No data in Firebase');
                        return;
                    }

                    // Transform Firebase data ke format yang dibutuhkan
                    const data = {
                        voltage: parseFloat(firebaseData.voltage) || 220,
                        current: parseFloat(firebaseData.current) || 0,
                        power: parseFloat(firebaseData.power) || 0,
                        energi: parseFloat(firebaseData.energi) || 0,
                        frekuensi: parseFloat(firebaseData.frekuensi) || 50,
                        power_factor: parseFloat(firebaseData.power_factor) || 0.85,
                        totalPower: parseFloat(firebaseData.power) || 0,
                        timestamp: firebaseData.timestamp || this.getIndonesiaTimestamp()
                    };

                    console.log('📥 [AutoPZEM] Data received from Firebase:', {
                        V: data.voltage,
                        A: data.current,
                        W: data.power,
                        PF: data.power_factor
                    });

                    // Update display dengan data dari Firebase
                    this.currentData = data;
                    this.updateDisplay(data);

                }, (error) => {
                    console.error('❌ [AutoPZEM] Firebase listener error:', error);
                });

            } catch (error) {
                console.error('[AutoPZEM] setupFirebaseListener error:', error);
            }
        };

        startListener();
    }

    // ========== FUNGSI GENERATE DIHAPUS - HANYA PAKAI DATA DARI API ==========
    // generateRealisticValues() REMOVED - menggunakan API eksternal saja

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

        // Update UI langsung dari data Firebase listener
        this.updateUI(data);

        // Data sudah disimpan ke database oleh interval di start()
        // Listener hanya untuk display, tidak simpan database lagi
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
            // VALIDASI: Reject data dengan power di luar range 200W - 3000W
            if (data.power < 200 || data.power > 3000) {
                console.error(`❌ [AutoPZEM] DB REJECTED: Power ${data.power.toFixed(2)}W is out of valid range (200-3000W)`);
                return false;
            }

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
        if (this.isRunning) {
            console.warn('⚠️ [AutoPZEM] Already running, ignoring duplicate start');
            return;
        }

        this.isRunning = true;

        console.log('🚀 [AutoPZEM] Started in API → Firebase → Display mode');
        console.log('📡 [AutoPZEM] API: http://115.85.65.125:8084/iot/data.json');
        console.log('🔄 [AutoPZEM] Pushing to Firebase every 10 seconds');

        // Clear Firebase data lama untuk pastikan data fresh dari API
        this.clearFirebaseData();

        // Wait for dashboard-electricity.js to create chart first
        setTimeout(() => {
            this.ensureChartExists();
            console.log('[AutoPZEM] Chart initialization check completed');
        }, 3000);

        // Interval untuk fetch API dan push ke Firebase
        this.interval = setInterval(() => {
            if (this.apiConfig.enabled && this.apiDataCache.length > 0) {
                // Ambil data dari API (random order)
                const data = this.getNextAPIData();

                if (data) {
                    console.log(`🔄 [AutoPZEM] Processing data [${this.apiCurrentIndex}/${this.apiDataCache.length}]:`, {
                        power: data.power,
                        voltage: data.voltage,
                        current: data.current
                    });

                    // Validasi final sebelum push
                    if (data.power >= 200 && data.power <= 3000) {
                        console.log(`✅ [AutoPZEM] Valid data - Power: ${data.power.toFixed(2)}W`);

                        // Push ke Firebase
                        this.pushToFirebase(data).then((success) => {
                            if (success) {
                                console.log('✅ [AutoPZEM] Successfully pushed to Firebase');
                            } else {
                                console.error('❌ [AutoPZEM] Failed to push to Firebase');
                            }
                        }).catch((error) => {
                            console.error('❌ [AutoPZEM] Firebase push error:', error);
                        });

                        // Simpan ke database setiap 10 detik (setiap update)
                        this.sendToDatabase(data);
                    } else {
                        console.error(`⚠️ [AutoPZEM] SKIPPED: Power ${data.power.toFixed(2)}W is invalid!`);
                    }
                } else {
                    console.warn('⚠️ [AutoPZEM] getNextAPIData() returned null');
                }
            } else {
                if (!this.apiConfig.enabled) {
                    console.warn('⚠️ [AutoPZEM] API mode disabled');
                }
                if (this.apiDataCache.length === 0) {
                    console.warn('⚠️ [AutoPZEM] No API data in cache - waiting for fetch...');
                }
            }
        }, 10000); // Fixed 10 detik interval
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isRunning = false;
        console.log('⏹️ [AutoPZEM] Stopped');

        // Clear instance reference
        if (window.autoPZEMInstance === this) {
            window.autoPZEMInstance = null;
        }
    }
}

// ========== AUTO-START (SINGLETON) ==========
document.addEventListener('DOMContentLoaded', () => {
    // Cek apakah sudah ada instance
    if (window.autoPZEM && window.autoPZEM.isRunning) {
        console.log('✅ [AutoPZEM] Already running, skipping initialization');
        return;
    }

    // Delay 2 detik untuk pastikan Firebase loaded
    setTimeout(() => {
        console.log('🔌 Initializing AutoPZEM Generator (SINGLE INSTANCE)...');
        window.autoPZEM = new AutoPZEMGenerator();
    }, 2000);
});
