
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

        const isWorkingHour = hour >= this.buildingProfile.operatingHours.start &&
            hour <= this.buildingProfile.operatingHours.end;

        let basePower = this.buildingProfile.basePowerConsumption;
        let maxPower = this.buildingProfile.maxPowerConsumption;


        if (isWeekend) {
            basePower *= this.buildingProfile.weekendReduction;
            maxPower *= this.buildingProfile.weekendReduction;
        }

        let finalPower;

        if (hour >= 7 && hour <= 18 && !isWeekend) {
            finalPower = 550 + Math.random() * 50;
        } else if (isWeekend && hour >= 8 && hour <= 17) {
            finalPower = 300 + Math.random() * 100;
        } else {
            finalPower = 120 + Math.random() * 60;
        }

        const voltage = 220 + (Math.random() * 22 - 11);

        const current = finalPower / voltage;
        const lightingPower = Math.random() * 20 + 10;
        const totalPower = finalPower + lightingPower;

        const energi = (finalPower / 1000 * Math.random()).toFixed(4);
        const frekuensi = (50 + (Math.random() - 0.5) * 1).toFixed(2);
        const power_factor = (0.85 + Math.random() * 0.15).toFixed(3);

        let generatedData = {
            voltage: Math.round(voltage * 10) / 10,
            current: Math.round(current * 100) / 100,
            power: Math.round(finalPower),
            energi: parseFloat(energi),
            frekuensi: parseFloat(frekuensi),
            power_factor: parseFloat(power_factor),
            totalPower: Math.round(totalPower),
            timestamp: this.getIndonesiaTimestamp()
        };

        generatedData = this.applyRealTimeNightReduction(generatedData);
        this.updateNightModeStatus();
        generatedData = this.applyNightModeReduction(generatedData);

        return generatedData;
    }


    getIndonesiaTimestamp() {
        const now = new Date();
        return now.toISOString().replace('Z', '+07:00');
    }

    updateNightModeIndicator() {
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
        // TIDAK update UI di sini - biarkan Firebase listener yang update
        // Hanya kirim data ke Firebase dan Database
        this.updateNightModeIndicator();
        this.sendToFirebase(data);
        this.databaseSyncCounter++;
        if (this.databaseSyncCounter >= 10) {
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

        // console.log('[AutoPZEM] 📊 Chart updated with power:', newValue, 'W');
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

            const response = await fetch('/api/real-time-power', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const result = await response.json();

                const dbStatus = document.getElementById('dbSyncStatus');
                if (dbStatus) {
                    dbStatus.className = 'badge bg-success me-2';
                    dbStatus.innerHTML = '<i class="fa fa-database"></i> DB: Connected';

                    setTimeout(() => {
                        dbStatus.className = 'badge bg-secondary me-2';
                        dbStatus.innerHTML = '<i class="fa fa-database"></i> DB: Synced';
                    }, 5000);
                }

                document.body.style.borderLeft = '3px solid green';
                setTimeout(() => {
                    document.body.style.borderLeft = '';
                }, 1000);
            } else {
                const errorText = await response.text();
                console.warn('Database sync failed:', response.statusText, errorText);
                const dbStatus = document.getElementById('dbSyncStatus');
                if (dbStatus) {
                    dbStatus.className = 'badge bg-danger me-2';
                    dbStatus.innerHTML = '<i class="fa fa-database"></i> DB: Error';
                }

                document.body.style.borderLeft = '3px solid red';
                setTimeout(() => {
                    document.body.style.borderLeft = '';
                }, 1000);
            }
        } catch (error) {
            console.error('[AutoPZEM] ❌ Database sync error:', error);
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

        const getBasePowerForHour = (hour) => {
            if (hour >= 6 && hour <= 8) return 180;
            else if (hour >= 9 && hour <= 17) return 580;
            else if (hour >= 18 && hour <= 22) return 320;
            else return 120; // Night
        };

        let lastPowerValue = getBasePowerForHour(0);

        for (let totalMinutes = 0; totalMinutes <= endTimeInMinutes; totalMinutes += 5) {
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            const timeLabel = String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
            labels.push(timeLabel);

            const basePower = getBasePowerForHour(hours);

            const targetPower = basePower + (Math.sin(totalMinutes / 30) * 20);
            const randomVariation = (Math.random() - 0.5) * 15;

            const powerDifference = targetPower - lastPowerValue;
            const adjustmentRate = 0.3;

            let newPowerValue = lastPowerValue + (powerDifference * adjustmentRate) + randomVariation;

            if (Math.random() < 0.05 && hours >= 7 && hours <= 21) {
                const spikeDirection = Math.random() > 0.5 ? 1 : -1;
                newPowerValue += spikeDirection * (20 + Math.random() * 30);
            }


            if (hours >= 9 && hours <= 17) {
                newPowerValue = Math.max(520, Math.min(620, newPowerValue));
            } else if (hours >= 18 && hours <= 22) {
                newPowerValue = Math.max(250, Math.min(400, newPowerValue));
            } else if (hours >= 6 && hours <= 8) {
                newPowerValue = Math.max(150, Math.min(220, newPowerValue));
            } else {
                newPowerValue = Math.max(100, Math.min(160, newPowerValue));
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
        let lastPower = 350;

        for (let i = 0; i < 30; i++) {
            const currentTime = new Date(baseTime.getTime() + (i * 5 * 60 * 1000));
            const hours = currentTime.getHours();
            const minutes = currentTime.getMinutes();

            labels.push(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);

            let targetPower;
            if (hours >= 9 && hours <= 17) targetPower = 580;
            else if (hours >= 18 && hours <= 22) targetPower = 320;
            else if (hours >= 6 && hours <= 8) targetPower = 180;
            else targetPower = 120;

            const variation = (Math.random() - 0.5) * 20;
            const transition = (targetPower - lastPower) * 0.2;
            lastPower = lastPower + transition + variation;

            lastPower = Math.max(100, Math.min(620, lastPower));
            data.push(Math.round(lastPower));
        }


        return { data, labels, metadata: { interval: 5, unit: 'minutes', points: 30 } };
    }

    generateRealisticFallbackData(dataPoints = 30) {

        const fallbackData = [];
        const fallbackLabels = [];
        let currentPower = 320;

        for (let i = dataPoints - 1; i >= 0; i--) {
            const timeAgo = new Date(Date.now() - (i * 5 * 60 * 1000));
            const hours = timeAgo.getHours();
            const minutes = timeAgo.getMinutes();

            fallbackLabels.unshift(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);

            let targetPower;
            if (hours >= 9 && hours <= 17) targetPower = 580;
            else if (hours >= 18 && hours <= 22) targetPower = 320;
            else if (hours >= 6 && hours <= 8) targetPower = 180;
            else targetPower = 120;

            const variation = (Math.random() - 0.5) * 15;
            const transition = (targetPower - currentPower) * 0.15;
            currentPower = Math.max(100, Math.min(620, currentPower + transition + variation));
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

        let lastPower = 120; // Start with night consumption

        for (let totalMinutes = 0; totalMinutes <= currentTimeInMinutes; totalMinutes += 5) {
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            const timeLabel = String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
            newLabels.push(timeLabel);

            let targetPower;
            if (hours >= 6 && hours <= 8) targetPower = 180;
            else if (hours >= 9 && hours <= 17) targetPower = 580;
            else if (hours >= 18 && hours <= 22) targetPower = 320;
            else targetPower = 120; // Night

            const variation = (Math.random() - 0.5) * 10;
            const transition = (targetPower - lastPower) * 0.25;
            lastPower = Math.max(100, Math.min(620, lastPower + transition + variation));

            newData.push(Math.round(lastPower));
        }
        return { labels: newLabels, data: newData, metadata: { interval: 5, unit: 'minutes' } };
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // console.log('[AutoPZEM] 📄 DOMContentLoaded fired');

    setTimeout(() => {
        // console.log('[AutoPZEM] ⏰ Timeout fired - initializing generator');

        if (!window.autoPZEMGenerator) {
            // console.log('[AutoPZEM] 🆕 Creating new AutoPZEMGenerator instance');
            window.autoPZEMGenerator = new AutoPZEMGenerator();
            // console.log('[AutoPZEM] ✅ AutoPZEMGenerator instance created');
        } else {
            // console.log('[AutoPZEM] ⚠️ AutoPZEMGenerator already exists');
            if (!window.autoPZEMGenerator.isRunning) {
                // console.log('[AutoPZEM] 🔄 Starting existing generator');
                window.autoPZEMGenerator.start();
            } else {
                // console.log('[AutoPZEM] ✅ Generator already running');
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
