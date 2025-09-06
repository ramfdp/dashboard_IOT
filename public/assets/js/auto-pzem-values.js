/**
 * Auto PZEM Values Generator for PT Krakatau Sarana Property
 * Generates realistic electricity consumption values that change every 3 seconds
 * Based on office building patterns and working hours
 */

class AutoPZEMGenerator {
    constructor() {
        this.isRunning = false;
        this.interval = null;
        this.databaseSyncCounter = 0; // Counter for database sync
        this.currentData = {
            voltage: 220,
            current: 0,
            power: 0,
            totalPower: 0
        };

        // Night mode simulation - menurunkan daya setiap 1 jam selama 30 menit
        this.nightModeSimulation = {
            enabled: true,
            intervalHours: 1,           // Setiap 1 jam
            durationMinutes: 30,        // Selama 30 menit
            powerReduction: 0.3,        // Kurangi daya menjadi 30% dari normal
            currentReduction: 0.3,      // Kurangi arus menjadi 30% dari normal
            lastTriggerTime: null,      // Waktu terakhir night mode aktif
            isActive: false,            // Status night mode saat ini
            startTime: null,            // Waktu mulai night mode
            nextTriggerTime: null       // Waktu trigger berikutnya
        };

        // PT Krakatau Sarana Property building profile
        this.buildingProfile = {
            basePowerConsumption: 8000,    // 8kW base load
            maxPowerConsumption: 45000,    // 45kW peak load
            operatingHours: { start: 7, end: 19 },
            weekendReduction: 0.3          // 30% of normal consumption on weekends
        };

        console.log('[AutoPZEM] Auto PZEM Generator initialized with Night Mode Simulation');
        this.initializeNightMode();
        this.start();
    }

    /**
     * Generate realistic power consumption based on time and building profile
     */
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

        // Weekend reduction
        if (isWeekend) {
            basePower *= this.buildingProfile.weekendReduction;
            maxPower *= this.buildingProfile.weekendReduction;
        }

        let powerMultiplier = 1.0;

        if (isWorkingHour && !isWeekend) {
            // Working hours pattern for office building
            if (hour >= 7 && hour <= 9) {
                // Morning arrival (7-9 AM) - gradual increase
                powerMultiplier = 0.4 + (hour - 7) * 0.3 + (minute / 60) * 0.3;
            } else if (hour >= 9 && hour <= 11) {
                // Morning peak (9-11 AM) - high usage
                powerMultiplier = 0.8 + Math.sin((hour - 9) * Math.PI / 2) * 0.2;
            } else if (hour >= 11 && hour <= 13) {
                // Pre-lunch (11 AM - 1 PM) - moderate usage
                powerMultiplier = 0.7 + Math.sin((hour - 11) * Math.PI / 2) * 0.15;
            } else if (hour >= 13 && hour <= 14) {
                // Lunch break (1-2 PM) - reduced usage
                powerMultiplier = 0.5 + Math.sin((minute / 60) * Math.PI) * 0.1;
            } else if (hour >= 14 && hour <= 17) {
                // Afternoon peak (2-5 PM) - highest usage
                powerMultiplier = 0.85 + Math.sin((hour - 14) * Math.PI / 3) * 0.15;
            } else if (hour >= 17 && hour <= 19) {
                // Evening decline (5-7 PM) - decreasing
                powerMultiplier = 0.6 - (hour - 17) * 0.15;
            }
        } else if (!isWorkingHour && !isWeekend) {
            // Non-working hours on weekdays
            if (hour >= 19 && hour <= 23) {
                // Evening security/cleaning
                powerMultiplier = 0.25 + Math.random() * 0.1;
            } else if (hour >= 0 && hour <= 6) {
                // Night security/emergency systems
                powerMultiplier = 0.15 + Math.random() * 0.05;
            } else {
                // Early morning preparation
                powerMultiplier = 0.2 + Math.random() * 0.1;
            }
        } else {
            // Weekend pattern - minimal usage
            powerMultiplier = 0.2 + Math.random() * 0.1;
        }

        // Add some randomness for realistic variation
        const randomVariation = 0.9 + (Math.random() * 0.2); // ±10% variation
        const finalPower = basePower * powerMultiplier * randomVariation;

        // Calculate voltage with realistic variation (220V ±5%)
        const voltage = 220 + (Math.random() * 22 - 11); // 209V to 231V

        // Calculate current based on power and voltage (P = V × I)
        const current = finalPower / voltage;

        // Add some lighting power (simulate relay usage)
        const lightingPower = Math.random() > 0.7 ? Math.random() * 100 + 50 : Math.random() * 40;
        const totalPower = finalPower + lightingPower;

        // Generate base data
        let generatedData = {
            voltage: Math.round(voltage * 10) / 10,     // 1 decimal place
            current: Math.round(current * 100) / 100,  // 2 decimal places
            power: Math.round(finalPower),              // Whole number
            totalPower: Math.round(totalPower),         // Total including lighting
            timestamp: this.getIndonesiaTimestamp()
        };

        // Update night mode status
        this.updateNightModeStatus();

        // Apply night mode reduction jika sedang aktif
        generatedData = this.applyNightModeReduction(generatedData);

        return generatedData;
    }

    /**
     * Get timestamp in Indonesia timezone
     */
    getIndonesiaTimestamp() {
        const now = new Date();
        // Konversi ke timezone Indonesia (WIB = UTC+7)
        const indonesiaTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
        return indonesiaTime.toISOString().replace('Z', '+07:00');
    }

    /**
     * Update the PZEM display elements
     */
    updateDisplay(data) {
        // Update PZEM monitoring widgets
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

        const totalEl = document.getElementById('total-listrik');
        if (totalEl) {
            totalEl.textContent = `${data.totalPower} W`;
        }

        console.log('[AutoPZEM] Values updated:', {
            voltage: `${data.voltage} V`,
            current: `${data.current} A`,
            power: `${data.power} W`,
            total: `${data.totalPower} W`
        });

        // Always send to Firebase (every 3 seconds)
        this.sendToFirebase(data);

        // Send to database less frequently (every 10th update = every 30 seconds)
        this.databaseSyncCounter++;
        if (this.databaseSyncCounter >= 10) {
            this.sendToDatabase(data);
            this.databaseSyncCounter = 0;
        }
    }

    /**
     * Send data to Laravel database via API
     */
    async sendToDatabase(data) {
        try {
            console.log('[AutoPZEM] Sending to database:', data);

            const payload = {
                tegangan: data.voltage,
                arus: data.current,
                daya: data.power,
                energi: (data.power / 1000) * (1 / 60), // Convert to kWh for 1 minute interval
                frekuensi: 50.0,
                power_factor: 0.85,
                lokasi: 'PT Krakatau Sarana Property',
                building: 'PT Krakatau Sarana Property',
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
                console.log('[AutoPZEM] ✅ Data sent to database successfully:', result);

                // Update status indicator
                const dbStatus = document.getElementById('dbSyncStatus');
                if (dbStatus) {
                    dbStatus.className = 'badge bg-success me-2';
                    dbStatus.innerHTML = '<i class="fa fa-database"></i> DB: Connected';

                    // Reset to normal after 5 seconds
                    setTimeout(() => {
                        dbStatus.className = 'badge bg-secondary me-2';
                        dbStatus.innerHTML = '<i class="fa fa-database"></i> DB: Synced';
                    }, 5000);
                }

                // Visual feedback
                document.body.style.borderLeft = '3px solid green';
                setTimeout(() => {
                    document.body.style.borderLeft = '';
                }, 1000);
            } else {
                const errorText = await response.text();
                console.warn('[AutoPZEM] ❌ Database sync failed:', response.statusText, errorText);

                // Update status indicator for error
                const dbStatus = document.getElementById('dbSyncStatus');
                if (dbStatus) {
                    dbStatus.className = 'badge bg-danger me-2';
                    dbStatus.innerHTML = '<i class="fa fa-database"></i> DB: Error';
                }

                // Visual feedback for error
                document.body.style.borderLeft = '3px solid red';
                setTimeout(() => {
                    document.body.style.borderLeft = '';
                }, 1000);
            }
        } catch (error) {
            console.error('[AutoPZEM] ❌ Database sync error:', error);
        }
    }

    /**
     * Send data to Firebase Realtime Database
     */
    async sendToFirebase(data) {
        try {
            console.log('[AutoPZEM] Sending to Firebase sensor path:', data);

            // Use direct REST API to Firebase (more reliable)
            const firebaseUrl = 'https://smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app';

            // Send to sensor path (overwrites existing data)
            const sensorResponse = await fetch(`${firebaseUrl}/sensor.json`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    voltage: data.voltage,
                    current: data.current,
                    power: data.power,
                    timestamp: data.timestamp,
                    lastUpdated: new Date().toISOString()
                })
            });

            if (sensorResponse.ok) {
                console.log('[AutoPZEM] ✅ Data sent to Firebase sensor successfully');

                // Update Firebase status indicator
                const firebaseStatus = document.getElementById('firebaseSyncStatus');
                if (firebaseStatus) {
                    firebaseStatus.className = 'badge bg-info';
                    firebaseStatus.innerHTML = '<i class="fa fa-cloud"></i> Firebase: Connected';

                    // Reset to normal after 3 seconds
                    setTimeout(() => {
                        firebaseStatus.className = 'badge bg-secondary';
                        firebaseStatus.innerHTML = '<i class="fa fa-cloud"></i> Firebase: Synced';
                    }, 3000);
                }

                // Visual feedback - blue border for Firebase sync
                document.body.style.borderRight = '3px solid blue';
                setTimeout(() => {
                    document.body.style.borderRight = '';
                }, 500);
            } else {
                console.warn('[AutoPZEM] ❌ Firebase sensor sync failed:', sensorResponse.statusText);

                // Update Firebase status for error
                const firebaseStatus = document.getElementById('firebaseSyncStatus');
                if (firebaseStatus) {
                    firebaseStatus.className = 'badge bg-warning';
                    firebaseStatus.innerHTML = '<i class="fa fa-cloud"></i> Firebase: Error';
                }
            }

            // Also save to history (every 5th update to avoid too much data)
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
                        totalPower: data.totalPower,
                        timestamp: data.timestamp
                    })
                });

                console.log('[AutoPZEM] ✅ Data also saved to Firebase history');
            }

        } catch (error) {
            console.error('[AutoPZEM] ❌ Firebase sync error:', error);
        }
    }

    /**
     * Start the auto-update process
     */
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
        console.log(`[AutoPZEM] Next night mode trigger: ${this.nightModeSimulation.nextTriggerTime.toLocaleString('id-ID')}`);
        console.log(`[AutoPZEM] Night mode akan aktif setiap ${this.nightModeSimulation.intervalHours} jam selama ${this.nightModeSimulation.durationMinutes} menit`);
        console.log(`[AutoPZEM] Saat night mode: Daya akan turun ke ${this.nightModeSimulation.powerReduction * 100}% dan arus ke ${this.nightModeSimulation.currentReduction * 100}%`);
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

            console.log(`[AutoPZEM] 🌙 NIGHT MODE STARTED - Daya dan arus akan turun selama ${this.nightModeSimulation.durationMinutes} menit`);

            // Set waktu berakhir night mode
            const endTime = new Date(now.getTime() + (this.nightModeSimulation.durationMinutes * 60 * 1000));
            console.log(`[AutoPZEM] 🌙 Night mode akan berakhir pada: ${endTime.toLocaleString('id-ID')}`);

            // Set next trigger time (1 jam dari sekarang)
            this.nightModeSimulation.nextTriggerTime = new Date(now.getTime() + (this.nightModeSimulation.intervalHours * 60 * 60 * 1000));
            console.log(`[AutoPZEM] 🌙 Next night mode: ${this.nightModeSimulation.nextTriggerTime.toLocaleString('id-ID')}`);
        }

        // Cek apakah night mode sudah selesai
        if (this.nightModeSimulation.isActive && this.nightModeSimulation.startTime) {
            const elapsedMinutes = (now - this.nightModeSimulation.startTime) / (60 * 1000);

            if (elapsedMinutes >= this.nightModeSimulation.durationMinutes) {
                // Akhiri night mode
                this.nightModeSimulation.isActive = false;
                this.nightModeSimulation.startTime = null;

                console.log(`[AutoPZEM] ☀️ NIGHT MODE ENDED - Daya dan arus kembali ke normal`);
                console.log(`[AutoPZEM] ☀️ Next night mode dalam ${this.nightModeSimulation.intervalHours} jam`);
            }
        }
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
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    console.log('[AutoPZEM] DOM ready, initializing auto PZEM generator...');

    // Wait a bit for other scripts to load
    setTimeout(() => {
        window.autoPZEMGenerator = new AutoPZEMGenerator();

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

        console.log('[AutoPZEM] Available console commands:');
        console.log('  startAutoPZEM() - Start generator');
        console.log('  stopAutoPZEM() - Stop generator');
        console.log('  autoPZEMStatus() - Show complete status');
        console.log('  triggerNightMode() - Force trigger night mode');
        console.log('  disableNightMode() - Disable night mode simulation');
        console.log('  enableNightMode() - Enable night mode simulation');
        console.log('  nightModeStatus() - Show night mode status only');
    }, 1000);
});

// Also handle window load as fallback
window.addEventListener('load', function () {
    if (!window.autoPZEMGenerator) {
        console.log('[AutoPZEM] Window loaded, initializing as fallback...');
        setTimeout(() => {
            window.autoPZEMGenerator = new AutoPZEMGenerator();
        }, 500);
    }
});
