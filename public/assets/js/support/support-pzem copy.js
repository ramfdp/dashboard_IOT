
class AutoPZEMGenerator {
    constructor() {
        // console.log('[AutoPZEM] 🚀 Constructor called - initializing...');

        this.isRunning = false;
        this.interval = null;
        this.databaseSyncCounter = 0;
        this.currentData = {
            voltage: 220,
            current: 0,
            power: 0,
            totalPower: 0
        };

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
        this.setupFirebaseListener(); // Setup listener untuk update UI dari Firebase

        if (!this.isRunning) {
            this.start();
        } else {
        }
    }

    // Setup Firebase Realtime Listener
    setupFirebaseListener() {
        // Tunggu Firebase SDK ready
        const initFirebaseListener = () => {
            try {
                if (typeof firebase === 'undefined' || !firebase.database) {
                    console.log('[AutoPZEM] ⏳ Waiting for Firebase SDK...');
                    setTimeout(initFirebaseListener, 500);
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

                // Initialize Firebase jika belum
                if (!firebase.apps || !firebase.apps.length) {
                    firebase.initializeApp(firebaseConfig);
                }

                // Listen untuk perubahan di Firebase /sensor
                const sensorRef = firebase.database().ref('sensor');

                // Load existing data immediately (once)
                sensorRef.once('value').then((snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        // console.log('[AutoPZEM] 📥 Initial data from Firebase:', data);
                        this.updateUIFromFirebase(data);
                    } else {
                        // console.warn('[AutoPZEM] ⚠️ No data in Firebase /sensor - waiting for generator');
                    }
                }).catch((error) => {
                    console.error('[AutoPZEM] ❌ Error loading initial data:', error);
                });

                // Listen untuk perubahan real-time
                sensorRef.on('value', (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        // console.log('[AutoPZEM] 📡 Data update from Firebase:', data);
                        // Update UI dengan data dari Firebase
                        this.updateUIFromFirebase(data);
                    }
                });

                // console.log('[AutoPZEM] ✅ Firebase listener aktif - UI akan update otomatis dari Firebase');
            } catch (error) {
                console.error('[AutoPZEM] ❌ Error setup Firebase listener:', error);
            }
        };

        initFirebaseListener();
    }


    generateRealisticValues() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const dayOfWeek = now.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        // Spesifikasi:
        // - Max kWh: 8080 kWh
        // - Tegangan: 220-223 V (dengan beban), 380V (tanpa beban)
        // - Arus: 7.3-15.6 A
        // - Jam Kerja (08:00-12:00 & 14:00-18:00): Tegangan & Arus Maksimal
        // - Jam Istirahat (12:00-14:00): Pemakaian berkurang (laptop tidak charging)
        // - Jam Malam (18:00-08:00): Hanya lampu (4 lampu × 15W × 25% = 15W per ruangan)
        // - Tegangan maksimal 380V saat tidak ada beban (weekend/jam sangat sepi)

        let voltage, current, power;

        if (isWeekend) {
            // Weekend: Minimal operation (hanya keamanan & lampu darurat)
            // TIDAK ADA BEBAN SIGNIFIKAN - Tegangan naik ke 380V
            voltage = 375 + Math.random() * 5; // 375-380 V (tanpa beban)
            current = 0.3 + Math.random() * 0.2; // 0.3-0.5 A (sangat minimal)
            power = 200 + Math.random() * 50; // ~200-250 W (tetap rendah meski tegangan tinggi)
        } else {
            // Weekday operations
            if ((hour >= 8 && hour < 12) || (hour >= 14 && hour < 18)) {
                // JAM KERJA: Tegangan & Arus Maksimal
                // Banyak penggunaan: komputer, AC, printer, charging, dll
                voltage = 221 + Math.random() * 2; // 221-223 V (maksimal dengan beban)
                current = 13.5 + Math.random() * 2.1; // 13.5-15.6 A (maksimal)
                power = voltage * current; // ~2,990-3,459 W

                // Tambahkan variasi natural (fluktuasi peralatan)
                const variation = (Math.random() - 0.5) * 200;
                power = power + variation;

            } else if (hour >= 12 && hour < 14) {
                // JAM ISTIRAHAT (12:00-14:00): Pemakaian berkurang
                // Laptop tidak charging, sebagian AC tetap jalan, lampu nyala
                voltage = 220 + Math.random() * 2; // 220-222 V (normal)
                current = 8.5 + Math.random() * 2.0; // 8.5-10.5 A (berkurang ~35%)
                power = voltage * current; // ~1,870-2,310 W

                // Variasi kecil
                const variation = (Math.random() - 0.5) * 100;
                power = power + variation;

            } else if (hour >= 18 || hour < 8) {
                // JAM MALAM (18:00-08:00): Night mode
                // Hanya lampu yang nyala - BEBAN SANGAT MINIMAL
                // Asumsi: 10 ruangan, setiap ruangan 4 lampu @ 15W, hanya 1 lampu nyala
                // Total: 10 ruangan × 1 lampu × 15W = 150W
                // Plus: Emergency lighting, CCTV, server = ~100W
                // Total: ~250W

                // Tegangan naik karena beban minimal (mendekati 380V tapi tidak penuh)
                voltage = 350 + Math.random() * 20; // 350-370 V (beban sangat ringan)
                current = 0.6 + Math.random() * 0.3; // 0.6-0.9 A (minimal)
                power = 200 + Math.random() * 100; // 200-300 W (lampu + emergency)

            } else {
                // Jam transisi (06:00-08:00): Persiapan kerja
                voltage = 220 + Math.random() * 2; // 220-222 V
                current = 7.3 + Math.random() * 1.5; // 7.3-8.8 A
                power = voltage * current; // ~1,606-1,954 W

                const variation = (Math.random() - 0.5) * 150;
                power = power + variation;
            }
        }

        // Pastikan current tidak melebihi range 7.3-15.6 A (kecuali malam hari yang lebih rendah)
        if ((hour >= 8 && hour < 18) && !isWeekend) {
            current = Math.max(7.3, Math.min(15.6, current));
        }

        // Validasi voltage berdasarkan kondisi beban
        if (isWeekend || (hour >= 18 || hour < 8)) {
            // Tanpa beban atau beban minimal: tegangan bisa naik hingga 380V
            voltage = Math.max(350, Math.min(380, voltage));
        } else if ((hour >= 8 && hour < 18) && !isWeekend) {
            // Dengan beban (jam kerja): tegangan normal 220-223V
            voltage = Math.max(220, Math.min(223, voltage));
        }

        // Recalculate power berdasarkan voltage dan current final (hanya untuk jam kerja)
        if ((hour >= 8 && hour < 18) && !isWeekend) {
            power = voltage * current;
        }

        // Hitung energi kumulatif dalam kWh
        // Untuk mencapai max 8080 kWh per bulan (30 hari):
        // 8080 kWh / 30 hari = 269.33 kWh/hari
        // 269.33 kWh / 24 jam = 11.22 kWh/jam
        // Dengan interval 10 detik: 11.22 / 360 = 0.0312 kWh per update

        const hoursElapsed = hour + (minute / 60);
        const dailyTarget = 269.33; // kWh per hari untuk mencapai 8080/bulan
        const currentDayProgress = (power / 1000) * (hoursElapsed / 24);
        const energi = (currentDayProgress * (dailyTarget / (power / 1000 * 24))).toFixed(4);

        // Frekuensi dan power factor
        const frekuensi = (50 + (Math.random() - 0.5) * 0.5).toFixed(2); // 49.75-50.25 Hz
        const power_factor = (0.85 + Math.random() * 0.10).toFixed(3); // 0.85-0.95

        // Total power (termasuk losses kecil)
        const lightingPower = Math.random() * 10 + 5; // Losses & parasitic load
        const totalPower = power + lightingPower;

        let generatedData = {
            voltage: Math.round(voltage * 10) / 10,
            current: Math.round(current * 100) / 100,
            power: Math.round(power),
            energi: parseFloat(energi),
            frekuensi: parseFloat(frekuensi),
            power_factor: parseFloat(power_factor),
            totalPower: Math.round(totalPower),
            timestamp: this.getIndonesiaTimestamp()
        };

        // Tidak perlu night reduction karena sudah dihandle di atas
        // this.updateNightModeStatus();
        // generatedData = this.applyNightModeReduction(generatedData);

        return generatedData;
    }


    getIndonesiaTimestamp() {
        const now = new Date();
        return now.toISOString().replace('Z', '+07:00');
    }

    updateNightModeIndicator() {
        // Don't show indicator on login page
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
                top: 10px;
                right: 10px;
                z-index: 1000;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: bold;
                transition: all 0.3s ease;
                min-width: 120px;
                text-align: center;
            `;
            document.body.appendChild(nightIndicator);
        }

        if (isNightTime) {
            nightIndicator.innerHTML = `
                <i class="fa fa-moon"></i> Night Mode
                <small style="display: block; font-size: 0.7rem; opacity: 0.8;">-70% Power</small>
            `;
            nightIndicator.className = 'badge bg-dark text-white';
            nightIndicator.style.background = 'linear-gradient(45deg, #1a1a2e, #16213e)';
        } else {
            nightIndicator.innerHTML = `
                <i class="fa fa-sun"></i> Day Mode
                <small style="display: block; font-size: 0.7rem; opacity: 0.8;">Normal Power</small>
            `;
            nightIndicator.className = 'badge bg-warning text-dark';
            nightIndicator.style.background = 'linear-gradient(45deg, #ffd700, #ffed4a)';
        }

        const timeStr = now.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Jakarta'
        });
        nightIndicator.title = `Current time: ${timeStr} WIB`;
    }

    updateDisplay(data) {
        this.updateNightModeIndicator();
        // Firebase push now handled by backend (RealTimePowerController)
        // this.sendToFirebase(data);
        this.databaseSyncCounter++;
        if (this.databaseSyncCounter >= 3) {
            this.sendToDatabase(data);
            this.databaseSyncCounter = 0;
        }
    }

    // Method baru untuk update UI dari Firebase
    updateUIFromFirebase(data) {
        // console.log('[AutoPZEM] 🔄 Updating UI from Firebase:', data);

        const voltageEl = document.getElementById('pzem-voltage');
        if (voltageEl) {
            voltageEl.textContent = `${data.voltage} V`;
        }

        const currentEl = document.getElementById('pzem-current');
        if (currentEl) {
            currentEl.textContent = `${data.current} A`;
        }

        const powerEl = document.getElementById('pzem-power');
        if (powerEl) {
            powerEl.textContent = `${data.power} W`;
        }

        const energiEl = document.getElementById('pzem-energi');
        if (energiEl && data.energi) {
            energiEl.textContent = `${data.energi} kWh`;
        }

        const frekuensiEl = document.getElementById('pzem-frekuensi');
        if (frekuensiEl && data.frekuensi) {
            frekuensiEl.textContent = `${data.frekuensi} Hz`;
        }

        const powerFactorEl = document.getElementById('pzem-power-factor');
        if (powerFactorEl && data.power_factor) {
            powerFactorEl.textContent = data.power_factor;
        }

        this.currentData = data;

        // Update grafik jika ada
        this.updateChart(data);
    }

    // Update chart dengan data baru
    updateChart(data) {
        if (!window.electricityChart || !window.globalElectricityData) {
            return;
        }

        const newValue = data.power || 0;
        window.globalElectricityData.values.push(newValue);

        const now = new Date();
        const timeLabel = now.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Jakarta'
        });
        window.globalElectricityData.labels.push(timeLabel);

        // Keep only last 50 data points
        if (window.globalElectricityData.values.length > 50) {
            window.globalElectricityData.values.shift();
            window.globalElectricityData.labels.shift();
        }

        window.electricityChart.data.labels = window.globalElectricityData.labels;
        window.electricityChart.data.datasets[0].data = window.globalElectricityData.values;
        window.electricityChart.update('none');

        // Update dashboard statistics to match chart data
        this.updateDashboardStatistics();

        // console.log('[AutoPZEM] 📊 Chart updated with power:', newValue, 'W');
    }

    // Update main dashboard statistics based on actual chart data
    updateDashboardStatistics() {
        if (!window.globalElectricityData || !window.globalElectricityData.values.length) {
            return;
        }

        const values = window.globalElectricityData.values;
        const avgPower = values.reduce((sum, val) => sum + val, 0) / values.length;
        const maxPower = Math.max(...values);
        const minPower = Math.min(...values);

        // Calculate kWh estimates
        const kwhHarian = (avgPower * 24 / 1000).toFixed(2);
        const kwhMingguan = (avgPower * 24 * 7 / 1000).toFixed(2);
        const kwhBulanan = (avgPower * 24 * 30 / 1000).toFixed(2);

        const statistics = [
            { id: 'dayaTertinggi', value: `${maxPower.toFixed(0)} W` },
            { id: 'dayaTerendah', value: `${minPower.toFixed(0)} W` },
            { id: 'totalData', value: values.length },
            { id: 'kwhHarian', value: `${kwhHarian} kWh` },
            { id: 'kwhMingguan', value: `${kwhMingguan} kWh` },
            { id: 'kwhBulanan', value: `${kwhBulanan} kWh` }
        ];

        statistics.forEach(stat => {
            const el = document.getElementById(stat.id);
            if (el) {
                el.textContent = stat.value;
            }
        });

        // console.log('[AutoPZEM] 📊 Dashboard statistics updated - Data points:', values.length);
    }
    async sendToDatabase(data) {
        try {
            const payload = {
                tegangan: data.voltage,
                arus: data.current,
                daya: data.power,
                energi: data.energi || (data.power / 1000) * (1 / 60),
                frekuensi: data.frekuensi || 50.0,
                power_factor: data.power_factor || 0.85,
                timestamp: data.timestamp
            };

            const response = await fetch(`${window.baseUrl}/api/real-time-power`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify(payload),
                // Add timeout to prevent hanging
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });

            if (response.ok) {
                const result = await response.json();

                const dbStatus = document.getElementById('dbSyncStatus');
                if (dbStatus) {
                    dbStatus.className = 'badge bg-success me-2';
                    dbStatus.innerHTML = '<i class="fa fa-database"></i> DB: Synced';
                }

                document.body.style.borderLeft = '3px solid green';
                setTimeout(() => {
                    document.body.style.borderLeft = '';
                }, 500);
            } else {
                const errorText = await response.text();
                console.warn('Database sync failed:', response.statusText, errorText);
                const dbStatus = document.getElementById('dbSyncStatus');
                if (dbStatus) {
                    dbStatus.className = 'badge bg-warning me-2';
                    dbStatus.innerHTML = '<i class="fa fa-database"></i> DB: Slow';
                }
            }
        } catch (error) {
            if (error.name === 'TimeoutError') {
                console.error('[AutoPZEM] ❌ Database timeout (>5s)');
                const dbStatus = document.getElementById('dbSyncStatus');
                if (dbStatus) {
                    dbStatus.className = 'badge bg-danger me-2';
                    dbStatus.innerHTML = '<i class="fa fa-database"></i> DB: Timeout';
                }
            } else {
                console.error('[AutoPZEM] ❌ Database sync error:', error);
            }
        }
    }

    async sendToFirebase(data) {
        try {
            const firebaseUrl = 'https://smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app';

            const sensorResponse = await fetch(`${firebaseUrl}/sensor.json`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    voltage: Math.round(data.voltage * 10) / 10,
                    current: Math.round(data.current * 100) / 100,
                    power: Math.round(data.power),
                    energi: Math.round((data.energi || (parseFloat(data.power) / 1000 * Math.random())) * 10000) / 10000,
                    frekuensi: Math.round((data.frekuensi || (50 + (Math.random() - 0.5) * 1)) * 100) / 100,
                    power_factor: Math.round((data.power_factor || (0.85 + Math.random() * 0.15)) * 1000) / 1000,
                    timestamp: data.timestamp,
                    lastUpdated: new Date().toISOString()
                })
            });

            if (sensorResponse.ok) {

                const firebaseStatus = document.getElementById('firebaseSyncStatus');
                if (firebaseStatus) {
                    firebaseStatus.className = 'badge bg-info';
                    firebaseStatus.innerHTML = '<i class="fa fa-cloud"></i> Firebase: Connected';

                    setTimeout(() => {
                        firebaseStatus.className = 'badge bg-secondary';
                        firebaseStatus.innerHTML = '<i class="fa fa-cloud"></i> Firebase: Synced';
                    }, 3000);
                }

                document.body.style.borderRight = '3px solid blue';
                setTimeout(() => {
                    document.body.style.borderRight = '';
                }, 500);
            } else {
                console.warn('[AutoPZEM] ❌ Firebase sensor sync failed:', sensorResponse.statusText);

                const firebaseStatus = document.getElementById('firebaseSyncStatus');
                if (firebaseStatus) {
                    firebaseStatus.className = 'badge bg-warning';
                    firebaseStatus.innerHTML = '<i class="fa fa-cloud"></i> Firebase: Error';
                }
            }

            if (this.databaseSyncCounter % 5 === 0) {
                const timestamp = Date.now();
                await fetch(`${firebaseUrl}/sensorHistory/${timestamp}.json`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        voltage: Math.round(data.voltage * 10) / 10,
                        current: Math.round(data.current * 100) / 100,
                        power: Math.round(data.power),
                        energi: Math.round((data.energi || (parseFloat(data.power) / 1000 * Math.random())) * 10000) / 10000,
                        frekuensi: Math.round((data.frekuensi || (50 + (Math.random() - 0.5) * 1)) * 100) / 100,
                        power_factor: Math.round((data.power_factor || (0.85 + Math.random() * 0.15)) * 1000) / 1000,
                        totalPower: Math.round(data.totalPower),
                        timestamp: data.timestamp,
                        lastUpdated: new Date().toISOString()
                    })
                });

            }

        } catch (error) {
            console.error('[AutoPZEM] ❌ Firebase sync error:', error);
        }
    }

    start() {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;

        const initialData = this.generateRealisticValues();
        this.currentData = initialData;
        this.updateDisplay(initialData);

        this.interval = setInterval(() => {
            const newData = this.generateRealisticValues();
            this.currentData = newData;
            this.updateDisplay(newData);
        }, 10000);
    }


    stop() {
        if (!this.isRunning) {
            return;
        }

        this.isRunning = false;

        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }


    initializeNightMode() {
        const now = new Date();
        this.nightModeSimulation.nextTriggerTime = new Date(now.getTime() + (this.nightModeSimulation.intervalHours * 60 * 60 * 1000));

    }

    updateNightModeStatus() {
        if (!this.nightModeSimulation.enabled) return;

        const now = new Date();

        if (!this.nightModeSimulation.isActive &&
            this.nightModeSimulation.nextTriggerTime &&
            now >= this.nightModeSimulation.nextTriggerTime) {

            this.nightModeSimulation.isActive = true;
            this.nightModeSimulation.startTime = new Date();
            this.nightModeSimulation.lastTriggerTime = new Date();
            const endTime = new Date(now.getTime() + (this.nightModeSimulation.durationMinutes * 60 * 1000));
            this.nightModeSimulation.nextTriggerTime = new Date(now.getTime() + (this.nightModeSimulation.intervalHours * 60 * 60 * 1000));
        }

        if (this.nightModeSimulation.isActive && this.nightModeSimulation.startTime) {
            const elapsedMinutes = (now - this.nightModeSimulation.startTime) / (60 * 1000);

            if (elapsedMinutes >= this.nightModeSimulation.durationMinutes) {
                this.nightModeSimulation.isActive = false;
                this.nightModeSimulation.startTime = null;
            }
        }
    }

    applyRealTimeNightReduction(data) {
        const now = new Date();
        const hour = now.getHours();

        const isNightTime = (hour >= 22 || hour < 6);

        if (!isNightTime) {
            return data;
        }

        const nightReductionFactor = 0.3;

        const reducedData = {
            ...data,
            power: Math.round(data.power * nightReductionFactor),
            totalPower: Math.round(data.totalPower * nightReductionFactor),
            current: Math.round(data.current * nightReductionFactor * 100) / 100,
            voltage: data.voltage
        };

        const minPower = 150;
        if (reducedData.power < minPower) {
            reducedData.power = minPower;
            reducedData.totalPower = minPower + Math.round(Math.random() * 50 + 20); // +emergency lighting
            reducedData.current = Math.round((reducedData.power / data.voltage) * 100) / 100;
        }
        return reducedData;
    }

    applyNightModeReduction(data) {
        if (!this.nightModeSimulation.enabled || !this.nightModeSimulation.isActive) {
            return data;
        }

        const reducedData = {
            ...data,
            power: Math.round(data.power * this.nightModeSimulation.powerReduction),
            totalPower: Math.round(data.totalPower * this.nightModeSimulation.powerReduction),
            current: Math.round(data.current * this.nightModeSimulation.currentReduction * 100) / 100,
        };

        reducedData.totalPower = reducedData.power + Math.round(Math.random() * 20 + 10); // Minimal lighting

        return reducedData;
    }

    getStatus() {
        const now = new Date();
        const nightModeInfo = {
            enabled: this.nightModeSimulation.enabled,
            isActive: this.nightModeSimulation.isActive,
            nextTrigger: this.nightModeSimulation.nextTriggerTime,
            durationMinutes: this.nightModeSimulation.durationMinutes,
            intervalHours: this.nightModeSimulation.intervalHours,
            powerReduction: `${this.nightModeSimulation.powerReduction * 100}%`,
            currentReduction: `${this.nightModeSimulation.currentReduction * 100}%`
        };

        if (this.nightModeSimulation.isActive && this.nightModeSimulation.startTime) {
            const elapsedMinutes = (now - this.nightModeSimulation.startTime) / (60 * 1000);
            const remainingMinutes = this.nightModeSimulation.durationMinutes - elapsedMinutes;
            nightModeInfo.remainingMinutes = Math.max(0, Math.round(remainingMinutes));
        }

        return {
            isRunning: this.isRunning,
            currentData: this.currentData,
            buildingProfile: this.buildingProfile,
            nightMode: nightModeInfo
        };
    }

    generateRealisticChartData(timeRangeHours = null) {
        const labels = [];
        const values = [];
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        const endTimeInMinutes = timeRangeHours ? (timeRangeHours * 60) : (currentHour * 60 + currentMinute);

        const getBasePowerForHour = (hour, minute = 0) => {
            const dayOfWeek = now.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            if (isWeekend) {
                return 150 + Math.random() * 100; // Weekend minimal
            }

            // Jam Kerja Pagi (08:00-12:00): Maksimal
            if (hour >= 8 && hour < 12) {
                return 3000 + Math.random() * 400; // 3000-3400 W
            }
            // Jam Istirahat (12:00-14:00): Berkurang
            else if (hour >= 12 && hour < 14) {
                return 1900 + Math.random() * 400; // 1900-2300 W
            }
            // Jam Kerja Sore (14:00-18:00): Maksimal
            else if (hour >= 14 && hour < 18) {
                return 3000 + Math.random() * 400; // 3000-3400 W
            }
            // Jam Malam (18:00-08:00): Minimal (lampu saja)
            else if (hour >= 18 || hour < 8) {
                return 220 + Math.random() * 80; // 220-300 W
            }
            // Default
            else {
                return 1800 + Math.random() * 200;
            }
        };

        let lastPowerValue = getBasePowerForHour(0);

        for (let totalMinutes = 0; totalMinutes <= endTimeInMinutes; totalMinutes += 5) {
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            const timeLabel = String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
            labels.push(timeLabel);

            const basePower = getBasePowerForHour(hours, minutes);

            const targetPower = basePower + (Math.sin(totalMinutes / 30) * 50);
            const randomVariation = (Math.random() - 0.5) * 100;

            const powerDifference = targetPower - lastPowerValue;
            const adjustmentRate = 0.3;

            let newPowerValue = lastPowerValue + (powerDifference * adjustmentRate) + randomVariation;

            // Spike events (peralatan nyala/mati) hanya di jam kerja
            if (Math.random() < 0.05 && hours >= 8 && hours < 18) {
                const spikeDirection = Math.random() > 0.5 ? 1 : -1;
                newPowerValue += spikeDirection * (50 + Math.random() * 100);
            }

            // Batasi sesuai jam
            if (hours >= 8 && hours < 12) {
                newPowerValue = Math.max(2800, Math.min(3500, newPowerValue));
            } else if (hours >= 12 && hours < 14) {
                newPowerValue = Math.max(1800, Math.min(2400, newPowerValue));
            } else if (hours >= 14 && hours < 18) {
                newPowerValue = Math.max(2800, Math.min(3500, newPowerValue));
            } else if (hours >= 18 || hours < 8) {
                newPowerValue = Math.max(200, Math.min(350, newPowerValue));
            } else {
                newPowerValue = Math.max(1600, Math.min(2200, newPowerValue));
            }

            values.push(Math.round(newPowerValue));
            lastPowerValue = newPowerValue;
        }

        return { labels, values, metadata: { interval: 5, unit: 'minutes' } };
    }

    generateRealisticModalData() {

        const data = [];
        const labels = [];

        const now = new Date();
        let baseTime = new Date(now.getTime() - (30 * 5 * 60 * 1000));
        let lastPower = 2500;

        for (let i = 0; i < 30; i++) {
            const currentTime = new Date(baseTime.getTime() + (i * 5 * 60 * 1000));
            const hours = currentTime.getHours();
            const minutes = currentTime.getMinutes();

            labels.push(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);

            let targetPower;
            if (hours >= 8 && hours < 12) targetPower = 3200;
            else if (hours >= 12 && hours < 14) targetPower = 2000;
            else if (hours >= 14 && hours < 18) targetPower = 3200;
            else if (hours >= 18 || hours < 8) targetPower = 250;
            else targetPower = 1800;

            const variation = (Math.random() - 0.5) * 100;
            const transition = (targetPower - lastPower) * 0.2;
            lastPower = lastPower + transition + variation;

            lastPower = Math.max(200, Math.min(3500, lastPower));
            data.push(Math.round(lastPower));
        }


        return { data, labels, metadata: { interval: 5, unit: 'minutes', points: 30 } };
    }

    generateRealisticFallbackData(dataPoints = 30) {

        const fallbackData = [];
        const fallbackLabels = [];
        let currentPower = 2500;

        for (let i = dataPoints - 1; i >= 0; i--) {
            const timeAgo = new Date(Date.now() - (i * 5 * 60 * 1000));
            const hours = timeAgo.getHours();
            const minutes = timeAgo.getMinutes();

            fallbackLabels.unshift(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);

            let targetPower;
            if (hours >= 8 && hours < 12) targetPower = 3200;
            else if (hours >= 12 && hours < 14) targetPower = 2000;
            else if (hours >= 14 && hours < 18) targetPower = 3200;
            else if (hours >= 18 || hours < 8) targetPower = 250;
            else targetPower = 1800;

            const variation = (Math.random() - 0.5) * 80;
            const transition = (targetPower - currentPower) * 0.15;
            currentPower = Math.max(200, Math.min(3500, currentPower + transition + variation));
            fallbackData.unshift(Math.round(currentPower));
        }
        return { data: fallbackData, labels: fallbackLabels, metadata: { interval: 5, unit: 'minutes' } };
    }

    generateNewDayResetData() {
        const newLabels = [];
        const newData = [];

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;

        let lastPower = 250; // Start with night consumption (lampu)

        for (let totalMinutes = 0; totalMinutes <= currentTimeInMinutes; totalMinutes += 5) {
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            const timeLabel = String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
            newLabels.push(timeLabel);

            let targetPower;
            if (hours >= 8 && hours < 12) targetPower = 3200;
            else if (hours >= 12 && hours < 14) targetPower = 2000;
            else if (hours >= 14 && hours < 18) targetPower = 3200;
            else if (hours >= 18 || hours < 8) targetPower = 250;
            else targetPower = 1800;

            const variation = (Math.random() - 0.5) * 50;
            const transition = (targetPower - lastPower) * 0.25;
            lastPower = Math.max(200, Math.min(3500, lastPower + transition + variation));

            newData.push(Math.round(lastPower));
        }
        return { labels: newLabels, data: newData, metadata: { interval: 5, unit: 'minutes' } };
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // console.log('[AutoPZEM] 📄 DOMContentLoaded fired');

    setTimeout(() => {
        // console.log('[AutoPZEM] ⏰ Timeout fired - initializing generator');

        // Check if we're on dashboard page (has PZEM elements)
        const isDashboardPage = document.getElementById('pzem-voltage') !== null;

        if (!window.autoPZEMGenerator) {
            // console.log('[AutoPZEM] 🆕 Creating new AutoPZEMGenerator instance');
            window.autoPZEMGenerator = new AutoPZEMGenerator();
            // console.log('[AutoPZEM] ✅ AutoPZEMGenerator instance created');

            // Only start generator if on dashboard page
            if (isDashboardPage) {
                // console.log('[AutoPZEM] 🏠 Dashboard page detected - starting generator');
            } else {
                // console.log('[AutoPZEM] 📄 Non-dashboard page - generator created but not started');
            }
        } else {
            // console.log('[AutoPZEM] ⚠️ AutoPZEMGenerator already exists');
            if (!window.autoPZEMGenerator.isRunning && isDashboardPage) {
                // console.log('[AutoPZEM] 🔄 Starting existing generator');
                window.autoPZEMGenerator.start();
            } else {
                // console.log('[AutoPZEM] ✅ Generator already running or not on dashboard');
            }
            return;
        }

        window.startAutoPZEM = () => window.autoPZEMGenerator.start();
        window.stopAutoPZEM = () => window.autoPZEMGenerator.stop();
        window.autoPZEMStatus = () => console.log(window.autoPZEMGenerator.getStatus());

        window.triggerNightMode = () => {
            window.autoPZEMGenerator.nightModeSimulation.nextTriggerTime = new Date();
        };

        window.disableNightMode = () => {
            window.autoPZEMGenerator.nightModeSimulation.enabled = false;
            window.autoPZEMGenerator.nightModeSimulation.isActive = false;
        };

        window.enableNightMode = () => {
            window.autoPZEMGenerator.nightModeSimulation.enabled = true;
            window.autoPZEMGenerator.initializeNightMode();
        };

        window.nightModeStatus = () => {
            const status = window.autoPZEMGenerator.getStatus();
            return status.nightMode;
        };
    }, 1000);
});
