
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

        console.log('[AutoPZEM] Auto PZEM Generator initialized with Night Mode Simulation');
        this.initializeNightMode();

        // ✅ Auto-start with duplicate protection
        if (!this.isRunning) {
            console.log('[AutoPZEM] Starting generator for dashboard display...');
            this.start();
        } else {
            console.log('[AutoPZEM] Generator already running, skipping duplicate start');
        }
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

        this.updateNightModeIndicator();
        this.sendToFirebase(data);
        this.databaseSyncCounter++;
        if (this.databaseSyncCounter >= 10) {
            this.sendToDatabase(data);
            this.databaseSyncCounter = 0;
        }
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
                    voltage: data.voltage,
                    current: data.current,
                    power: data.power,
                    energi: data.energi || (parseFloat(data.power) / 1000 * Math.random()).toFixed(4), // Energy in kWh
                    frekuensi: data.frekuensi || (50 + (Math.random() - 0.5) * 1).toFixed(2), // 49.5-50.5Hz
                    power_factor: data.power_factor || (0.85 + Math.random() * 0.15).toFixed(3), // 0.85-1.0 PF
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
                        voltage: data.voltage,
                        current: data.current,
                        power: data.power,
                        energi: data.energi || (parseFloat(data.power) / 1000 * Math.random()).toFixed(4), // Energy in kWh
                        frekuensi: data.frekuensi || (50 + (Math.random() - 0.5) * 1).toFixed(2), // 49.5-50.5Hz
                        power_factor: data.power_factor || (0.85 + Math.random() * 0.15).toFixed(3), // 0.85-1.0 PF
                        totalPower: data.totalPower,
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
            console.log('[AutoPZEM] Already running');
            return;
        }

        console.log('[AutoPZEM] Starting auto-update every 3 seconds...');
        this.isRunning = true;

        // Generate first values immediately
        const initialData = this.generateRealisticValues();
        this.currentData = initialData;
        this.updateDisplay(initialData);

        // Set interval to update every 3 seconds
        this.interval = setInterval(() => {
            const newData = this.generateRealisticValues();
            this.currentData = newData;
            this.updateDisplay(newData);
        }, 3000); // 3000ms = 3 seconds
    }

    /**
     * Stop the auto-update process
     */
    stop() {
        if (!this.isRunning) {
            console.log('[AutoPZEM] Not running');
            return;
        }

        console.log('[AutoPZEM] Stopping auto-update...');
        this.isRunning = false;

        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    /**
     * Initialize night mode simulation
     * Set waktu trigger pertama dari sekarang
     */
    initializeNightMode() {
        const now = new Date();
        this.nightModeSimulation.nextTriggerTime = new Date(now.getTime() + (this.nightModeSimulation.intervalHours * 60 * 60 * 1000));

        console.log(`[AutoPZEM] Night Mode Simulation initialized`);
    }

    /**
     * Check dan update status night mode
     */
    updateNightModeStatus() {
        if (!this.nightModeSimulation.enabled) return;

        const now = new Date();

        // Cek apakah sudah waktunya untuk memulai night mode
        if (!this.nightModeSimulation.isActive &&
            this.nightModeSimulation.nextTriggerTime &&
            now >= this.nightModeSimulation.nextTriggerTime) {

            // Mulai night mode
            this.nightModeSimulation.isActive = true;
            this.nightModeSimulation.startTime = new Date();
            this.nightModeSimulation.lastTriggerTime = new Date();

            console.log(`[AutoPZEM] 🌙 NIGHT MODE STARTED`);

            // Set waktu berakhir night mode
            const endTime = new Date(now.getTime() + (this.nightModeSimulation.durationMinutes * 60 * 1000));

            // Set next trigger time (1 jam dari sekarang)
            this.nightModeSimulation.nextTriggerTime = new Date(now.getTime() + (this.nightModeSimulation.intervalHours * 60 * 60 * 1000));
        }

        // Cek apakah night mode sudah selesai
        if (this.nightModeSimulation.isActive && this.nightModeSimulation.startTime) {
            const elapsedMinutes = (now - this.nightModeSimulation.startTime) / (60 * 1000);

            if (elapsedMinutes >= this.nightModeSimulation.durationMinutes) {
                // Akhiri night mode
                this.nightModeSimulation.isActive = false;
                this.nightModeSimulation.startTime = null;

                console.log(`[AutoPZEM] ☀️ NIGHT MODE ENDED`);
            }
        }
    }

    /**
     * ✅ FITUR BARU: Apply real-time night reduction (70% reduction saat malam hari)
     * Berlaku dari jam 22:00 - 06:00 (waktu Indonesia)
     */
    applyRealTimeNightReduction(data) {
        const now = new Date();
        // Gunakan waktu lokal langsung (sudah dalam WIB)
        const hour = now.getHours();

        // Definisi waktu malam: 22:00 - 06:00 (sesuai standar office building)
        const isNightTime = (hour >= 22 || hour < 6);

        if (!isNightTime) {
            // Bukan waktu malam, tidak ada pengurangan
            return data;
        }

        // Waktu malam: kurangi daya sebesar 70% (sisa 30%)
        const nightReductionFactor = 0.3; // 30% dari nilai normal

        const reducedData = {
            ...data,
            power: Math.round(data.power * nightReductionFactor),
            totalPower: Math.round(data.totalPower * nightReductionFactor),
            current: Math.round(data.current * nightReductionFactor * 100) / 100,
            voltage: data.voltage // Tegangan tetap stabil
        };

        // Pastikan minimal ada consumption untuk sistem keamanan dan emergency
        const minPower = 150; // Minimal 150W untuk sistem essential
        if (reducedData.power < minPower) {
            reducedData.power = minPower;
            reducedData.totalPower = minPower + Math.round(Math.random() * 50 + 20); // +emergency lighting
            reducedData.current = Math.round((reducedData.power / data.voltage) * 100) / 100;
        }

        // Night/day time logic without verbose logging

        return reducedData;
    }

    /**
     * Apply night mode reduction jika sedang aktif
     */
    applyNightModeReduction(data) {
        if (!this.nightModeSimulation.enabled || !this.nightModeSimulation.isActive) {
            return data; // Tidak ada perubahan jika night mode tidak aktif
        }

        // Aplikasikan pengurangan daya dan arus
        const reducedData = {
            ...data,
            power: Math.round(data.power * this.nightModeSimulation.powerReduction),
            totalPower: Math.round(data.totalPower * this.nightModeSimulation.powerReduction),
            current: Math.round(data.current * this.nightModeSimulation.currentReduction * 100) / 100,
        };

        // Recalculate total power berdasarkan reduced power + reduced lighting
        reducedData.totalPower = reducedData.power + Math.round(Math.random() * 20 + 10); // Minimal lighting

        return reducedData;
    }

    /**
     * Get current status termasuk night mode information
     */
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

    // ✅ NEW: Generate realistic chart data with 5-minute intervals
    generateRealisticChartData(timeRangeHours = null) {
        console.log('[AutoPZEM] Generating realistic chart data with 5-minute intervals...');

        const labels = [];
        const values = [];
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // If timeRangeHours not specified, generate from 00:00 to current time
        const endTimeInMinutes = timeRangeHours ? (timeRangeHours * 60) : (currentHour * 60 + currentMinute);

        // Base power patterns for different time periods
        const getBasePowerForHour = (hour) => {
            if (hour >= 6 && hour <= 8) return 180; // Early morning
            else if (hour >= 9 && hour <= 17) return 580; // Working hours
            else if (hour >= 18 && hour <= 22) return 320; // Evening
            else return 120; // Night
        };

        let lastPowerValue = getBasePowerForHour(0); // Start with night consumption

        // Generate data points every 5 minutes
        for (let totalMinutes = 0; totalMinutes <= endTimeInMinutes; totalMinutes += 5) {
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            const timeLabel = String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
            labels.push(timeLabel);

            // Get base power for this hour
            const basePower = getBasePowerForHour(hours);

            // Create realistic variations with smooth transitions
            const targetPower = basePower + (Math.sin(totalMinutes / 30) * 20); // Gentle sine wave variation
            const randomVariation = (Math.random() - 0.5) * 15; // ±7.5W variation

            // Gradually move towards target with small random changes
            const powerDifference = targetPower - lastPowerValue;
            const adjustmentRate = 0.3; // 30% adjustment per 5-minute interval

            let newPowerValue = lastPowerValue + (powerDifference * adjustmentRate) + randomVariation;

            // Add occasional realistic spikes (AC, equipment turning on/off)
            if (Math.random() < 0.05 && hours >= 7 && hours <= 21) { // 5% chance during active hours
                const spikeDirection = Math.random() > 0.5 ? 1 : -1;
                newPowerValue += spikeDirection * (20 + Math.random() * 30); // ±20-50W spike
            }

            // Keep values within realistic ranges for each time period
            if (hours >= 9 && hours <= 17) {
                newPowerValue = Math.max(520, Math.min(620, newPowerValue)); // Working hours: 520-620W
            } else if (hours >= 18 && hours <= 22) {
                newPowerValue = Math.max(250, Math.min(400, newPowerValue)); // Evening: 250-400W
            } else if (hours >= 6 && hours <= 8) {
                newPowerValue = Math.max(150, Math.min(220, newPowerValue)); // Morning: 150-220W
            } else {
                newPowerValue = Math.max(100, Math.min(160, newPowerValue)); // Night: 100-160W
            }

            values.push(Math.round(newPowerValue));
            lastPowerValue = newPowerValue;
        }

        console.log('[AutoPZEM] Realistic chart data generated:', {
            labelsCount: labels.length,
            valuesCount: values.length,
            interval: '5 minutes',
            timeRange: `00:00 - ${String(Math.floor(endTimeInMinutes / 60)).padStart(2, '0')}:${String(endTimeInMinutes % 60).padStart(2, '0')}`,
            powerRange: `${Math.min(...values)}W - ${Math.max(...values)}W`,
            sampleValues: values.slice(-10) // Show last 10 values
        });

        return { labels, values, metadata: { interval: 5, unit: 'minutes' } };
    }

    // ✅ NEW: Generate realistic modal data (last 30 data points)
    generateRealisticModalData() {
        console.log('[AutoPZEM] Generating realistic modal data (last 30 points)...');

        const data = [];
        const labels = [];

        // Generate last 30 data points with 5-minute intervals
        const now = new Date();
        let baseTime = new Date(now.getTime() - (30 * 5 * 60 * 1000)); // 30 points × 5 minutes back
        let lastPower = 350; // Start with a reasonable middle value

        for (let i = 0; i < 30; i++) {
            const currentTime = new Date(baseTime.getTime() + (i * 5 * 60 * 1000));
            const hours = currentTime.getHours();
            const minutes = currentTime.getMinutes();

            labels.push(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);

            // Realistic power based on time of day
            let targetPower;
            if (hours >= 9 && hours <= 17) targetPower = 580; // Work hours
            else if (hours >= 18 && hours <= 22) targetPower = 320; // Evening
            else if (hours >= 6 && hours <= 8) targetPower = 180; // Morning
            else targetPower = 120; // Night

            // Smooth transition with small variations
            const variation = (Math.random() - 0.5) * 20; // ±10W
            const transition = (targetPower - lastPower) * 0.2; // 20% adjustment
            lastPower = lastPower + transition + variation;

            // Keep within realistic bounds
            lastPower = Math.max(100, Math.min(620, lastPower));
            data.push(Math.round(lastPower));
        }

        console.log('[AutoPZEM] Realistic modal data generated:', {
            dataCount: data.length,
            powerRange: `${Math.min(...data)}W - ${Math.max(...data)}W`,
            timeRange: `${labels[0]} - ${labels[labels.length - 1]}`
        });

        return { data, labels, metadata: { interval: 5, unit: 'minutes', points: 30 } };
    }

    // ✅ NEW: Generate realistic fallback data for initialization
    generateRealisticFallbackData(dataPoints = 30) {
        console.log('[AutoPZEM] Generating realistic fallback data...');

        const fallbackData = [];
        const fallbackLabels = [];
        let currentPower = 320; // Start with evening power consumption

        // Generate data points (5-minute intervals going backwards)
        for (let i = dataPoints - 1; i >= 0; i--) {
            const timeAgo = new Date(Date.now() - (i * 5 * 60 * 1000));
            const hours = timeAgo.getHours();
            const minutes = timeAgo.getMinutes();

            fallbackLabels.unshift(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);

            // Realistic power variation
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

        console.log('[AutoPZEM] Realistic fallback data created:', {
            dataPoints: fallbackData.length,
            powerRange: `${Math.min(...fallbackData)}W - ${Math.max(...fallbackData)}W`
        });

        return { data: fallbackData, labels: fallbackLabels, metadata: { interval: 5, unit: 'minutes' } };
    }

    // ✅ NEW: Generate data for new day reset (from 00:00 to current time)
    generateNewDayResetData() {
        console.log('[AutoPZEM] Generating new day reset data...');

        const newLabels = [];
        const newData = [];

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;

        let lastPower = 120; // Start with night consumption

        // Generate data for today from 00:00 to current time (5-minute intervals)
        for (let totalMinutes = 0; totalMinutes <= currentTimeInMinutes; totalMinutes += 5) {
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            const timeLabel = String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
            newLabels.push(timeLabel);

            // Realistic power based on time of day
            let targetPower;
            if (hours >= 6 && hours <= 8) targetPower = 180; // Morning
            else if (hours >= 9 && hours <= 17) targetPower = 580; // Work hours  
            else if (hours >= 18 && hours <= 22) targetPower = 320; // Evening
            else targetPower = 120; // Night

            // Smooth transition with small variations
            const variation = (Math.random() - 0.5) * 10; // ±5W variation
            const transition = (targetPower - lastPower) * 0.25; // 25% adjustment per interval
            lastPower = Math.max(100, Math.min(620, lastPower + transition + variation));

            newData.push(Math.round(lastPower));
        }

        console.log('[AutoPZEM] New day reset data generated:', {
            labelsCount: newLabels.length,
            valuesCount: newData.length,
            timeRange: `00:00 - ${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`,
            powerRange: `${Math.min(...newData)}W - ${Math.max(...newData)}W`
        });

        return { labels: newLabels, data: newData, metadata: { interval: 5, unit: 'minutes' } };
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    console.log('[AutoPZEM] DOM ready, initializing auto PZEM generator...');

    // Initialize quickly before dashboard needs it
    setTimeout(() => {
        // Guard against multiple initialization
        if (!window.autoPZEMGenerator) {
            console.log('[AutoPZEM] ✅ Creating new AutoPZEMGenerator instance...');
            window.autoPZEMGenerator = new AutoPZEMGenerator();
        } else {
            console.log('[AutoPZEM] ⚠️ AutoPZEMGenerator already exists, checking if running...');
            if (!window.autoPZEMGenerator.isRunning) {
                console.log('[AutoPZEM] 🔄 Existing generator not running, starting it...');
                window.autoPZEMGenerator.start();
            } else {
                console.log('[AutoPZEM] ✅ Generator already running properly');
            }
            return;
        }

        // Global functions for console control
        window.startAutoPZEM = () => window.autoPZEMGenerator.start();
        window.stopAutoPZEM = () => window.autoPZEMGenerator.stop();
        window.autoPZEMStatus = () => console.log(window.autoPZEMGenerator.getStatus());

        // Night mode control functions
        window.triggerNightMode = () => {
            window.autoPZEMGenerator.nightModeSimulation.nextTriggerTime = new Date();
            console.log('[AutoPZEM] 🌙 Night mode will trigger on next update cycle');
        };

        window.disableNightMode = () => {
            window.autoPZEMGenerator.nightModeSimulation.enabled = false;
            window.autoPZEMGenerator.nightModeSimulation.isActive = false;
            console.log('[AutoPZEM] 🌙 Night mode simulation disabled');
        };

        window.enableNightMode = () => {
            window.autoPZEMGenerator.nightModeSimulation.enabled = true;
            window.autoPZEMGenerator.initializeNightMode();
            console.log('[AutoPZEM] 🌙 Night mode simulation enabled');
        };

        window.nightModeStatus = () => {
            const status = window.autoPZEMGenerator.getStatus();
            console.log('[AutoPZEM] 🌙 Night Mode Status:', status.nightMode);
            return status.nightMode;
        };

        console.log('[AutoPZEM] Console commands available: startAutoPZEM(), stopAutoPZEM(), autoPZEMStatus(), triggerNightMode(), nightModeStatus()');
    }, 1000);
});

// Also handle window load as fallback
// ✅ Fallback load event removed to prevent duplicate initialization
// All initialization handled by DOMContentLoaded event above
