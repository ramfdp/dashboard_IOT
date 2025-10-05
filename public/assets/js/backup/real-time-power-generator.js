/**
 * Real-time Power Data Generator for PT Krakatau Sarana Property
 * Generates realistic electricity consumption data based on office building patterns
 */

class RealTimePowerGenerator {
    constructor() {
        this.isRunning = false;
        this.interval = null;
        this.currentData = {
            voltage: 220.0,
            current: 0.0,
            power: 0.0,
            energy: 0.0,
            frequency: 50.0,
            powerFactor: 0.85
        };

        // PT Krakatau Sarana Property building characteristics
        this.buildingProfile = {
            totalFloors: 15,
            officeArea: 12000, // m²
            basePowerConsumption: 400, // Watts (base load)
            maxPowerConsumption: 650, // Watts (peak load)
            operatingHours: {
                start: 7,
                end: 19
            },
            weekendReduction: 0.3 // 30% power during weekends
        };

        this.init();
    }

    init() {
        console.log('[PowerGen] Real-time Power Generator initialized for PT Krakatau Sarana Property');
        this.bindEvents();
        this.loadStoredEnergy();
    }

    /**
     * Generate realistic power consumption based on time and building usage
     */
    generateRealisticPower() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isWorkingHour = hour >= this.buildingProfile.operatingHours.start &&
            hour <= this.buildingProfile.operatingHours.end;

        // Pola sederhana sesuai permintaan: 600W jam kerja, 150an malam
        let calculatedPower;

        if (hour >= 7 && hour <= 18 && !isWeekend) {
            // Jam kerja 7 pagi - 6 sore = daya maksimal 600W
            calculatedPower = 550 + Math.random() * 50; // 550-600W
        } else if (isWeekend && hour >= 8 && hour <= 17) {
            // Weekend jam siang = daya sedang
            calculatedPower = 300 + Math.random() * 100; // 300-400W
        } else {
            // Malam hari atau di luar jam kerja = 150an
            calculatedPower = 120 + Math.random() * 60; // 120-180W
        }

        // Ensure minimum power consumption (emergency systems, security, etc.)
        return Math.max(calculatedPower, 100);
    }

    /**
     * Generate voltage with realistic fluctuations
     */
    generateVoltage() {
        const baseVoltage = 220; // Standard Indonesian voltage
        const variation = (Math.random() - 0.5) * 10; // ±5V variation
        return Math.max(200, Math.min(240, baseVoltage + variation));
    }

    /**
     * Calculate current based on power and voltage
     */
    calculateCurrent(power, voltage) {
        if (voltage === 0) return 0;
        return power / voltage; // I = P/V (assuming single phase)
    }

    /**
     * Generate complete electrical data
     */
    generateElectricalData() {
        const power = this.generateRealisticPower();
        const voltage = this.generateVoltage();
        const current = this.calculateCurrent(power, voltage);

        // Calculate energy increment (kWh)
        const timeDelta = 1; // 1 minute interval
        const energyIncrement = (power * timeDelta) / (60 * 1000); // Convert to kWh

        this.currentData = {
            voltage: Math.round(voltage * 10) / 10,
            current: Math.round(current * 100) / 100,
            power: Math.round(power),
            energy: Math.round((this.currentData.energy + energyIncrement) * 1000) / 1000,
            frequency: 50.0 + (Math.random() - 0.5) * 0.5, // ±0.25Hz variation
            powerFactor: 0.85 + (Math.random() - 0.5) * 0.1, // ±0.05 variation
            timestamp: new Date().toISOString(),
            location: 'PT Krakatau Sarana Property'
        };

        return this.currentData;
    }

    /**
     * Update UI displays
     */
    updateUI(data) {
        // Update PZEM monitoring widgets on dashboard
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
            // Add some lighting power (8 relays * 9W each if active)
            const lightingPower = Math.random() > 0.5 ? 72 : 36; // Simulate some lights on
            const totalPower = data.power + lightingPower;
            totalEl.textContent = `${totalPower.toFixed(2)} W`;
        }

        // Update power generator status elements
        const generatorStatusEl = document.getElementById('generatorStatus');
        if (generatorStatusEl) {
            generatorStatusEl.className = 'badge fs-6 p-3 bg-success text-white';
            generatorStatusEl.textContent = 'Generator Running';
        }

        const dataPointsEl = document.getElementById('dataPointsDisplay');
        if (dataPointsEl) {
            dataPointsEl.textContent = this.dataPoints.toString();
        }

        const syncStatusEl = document.getElementById('syncStatusDisplay');
        if (syncStatusEl) {
            syncStatusEl.innerHTML = '<span class="badge bg-success">Active</span>';
        }

        // Update voltage display
        const voltageElement = document.querySelector('.voltage-value, #voltageDisplay, [data-display="voltage"]');
        if (voltageElement) {
            voltageElement.textContent = `${data.voltage} V`;
        }

        // Update current display
        const currentElement = document.querySelector('.current-value, #currentDisplay, [data-display="current"]');
        if (currentElement) {
            currentElement.textContent = `${data.current} A`;
        }

        // Update power display
        const powerElement = document.querySelector('.power-value, #powerDisplay, [data-display="power"]');
        if (powerElement) {
            powerElement.textContent = `${data.power} W`;
        }

        console.log('[PowerGen] UI updated:', {
            voltage: data.voltage,
            current: data.current,
            power: data.power,
            timestamp: data.timestamp
        });
    }

    /**
     * Send data to Firebase
     */
    async sendToFirebase(data) {
        try {
            // Check if Firebase is available
            if (typeof firebase !== 'undefined' && firebase.database) {
                const database = firebase.database();
                const ref = database.ref('electricity_data');

                await ref.push({
                    ...data,
                    created_at: firebase.database.ServerValue.TIMESTAMP
                });

                console.log('[PowerGen] Data sent to Firebase successfully');
                return true;
            } else {
                console.warn('[PowerGen] Firebase not available, skipping Firebase sync');
                return false;
            }
        } catch (error) {
            console.error('[PowerGen] Error sending to Firebase:', error);
            return false;
        }
    }

    /**
     * Send data to Laravel backend database
     */
    async sendToDatabase(data) {
        try {
            const response = await fetch('/api/listrik', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    tegangan: data.voltage,
                    arus: data.current,
                    daya: data.power,
                    energi: data.energy,
                    frekuensi: data.frequency,
                    power_factor: data.powerFactor,
                    lokasi: data.location,
                    building: data.building,
                    timestamp: data.timestamp
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('[PowerGen] Data sent to database successfully:', result);
                return true;
            } else {
                console.error('[PowerGen] Failed to send to database:', response.statusText);
                return false;
            }
        } catch (error) {
            console.error('[PowerGen] Error sending to database:', error);
            return false;
        }
    }

    /**
     * Main data generation and sync cycle
     */
    async generateAndSync() {
        const data = this.generateElectricalData();

        // Update UI
        this.updateUI(data);

        // Update global data for chart integration
        if (window.globalElectricityData) {
            window.globalElectricityData.currentPower = data.power;
            window.latestPowerValue = data.power;

            // Add to daily data array (keep last 30 points)
            if (!window.globalElectricityData.dailyData) {
                window.globalElectricityData.dailyData = [];
            }
            window.globalElectricityData.dailyData.push(data.power);
            if (window.globalElectricityData.dailyData.length > 30) {
                window.globalElectricityData.dailyData.shift();
            }
        }

        // Try to sync to Firebase and Database
        const promises = [
            this.sendToFirebase(data),
            this.sendToDatabase(data)
        ];

        try {
            const results = await Promise.allSettled(promises);
            const firebaseSuccess = results[0].status === 'fulfilled' && results[0].value;
            const databaseSuccess = results[1].status === 'fulfilled' && results[1].value;

            console.log('[PowerGen] Sync results:', {
                firebase: firebaseSuccess,
                database: databaseSuccess,
                power: data.power,
                timestamp: new Date().toLocaleTimeString()
            });
        } catch (error) {
            console.error('[PowerGen] Error in sync process:', error);
        }

        // Store energy value in localStorage for persistence
        localStorage.setItem('pt_krakatau_energy_total', data.energy.toString());
    }

    /**
     * Start real-time data generation
     */
    start() {
        if (this.isRunning) {
            console.log('[PowerGen] Already running');
            return;
        }

        console.log('[PowerGen] Starting real-time power generation for PT Krakatau Sarana Property');
        this.isRunning = true;

        // Generate data immediately
        this.generateAndSync();

        // Then generate every minute
        this.interval = setInterval(() => {
            this.generateAndSync();
        }, 60000); // 1 minute interval

        // Also update UI more frequently for smooth display
        this.uiInterval = setInterval(() => {
            const quickData = this.generateElectricalData();
            this.updateUI(quickData);
        }, 5000); // 5 second UI updates
    }

    /**
     * Stop data generation
     */
    stop() {
        if (!this.isRunning) {
            console.log('[PowerGen] Not running');
            return;
        }

        console.log('[PowerGen] Stopping power generation');
        this.isRunning = false;

        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }

        if (this.uiInterval) {
            clearInterval(this.uiInterval);
            this.uiInterval = null;
        }
    }

    /**
     * Load stored energy value
     */
    loadStoredEnergy() {
        const storedEnergy = localStorage.getItem('pt_krakatau_energy_total');
        if (storedEnergy) {
            this.currentData.energy = parseFloat(storedEnergy);
            console.log('[PowerGen] Loaded stored energy:', this.currentData.energy, 'kWh');
        }
    }

    /**
     * Get current status
     */
    getStatus() {
        return {
            running: this.isRunning,
            currentData: this.currentData,
            buildingProfile: this.buildingProfile,
            nextUpdate: this.interval ? new Date(Date.now() + 60000) : null
        };
    }

    /**
     * Bind UI events
     */
    bindEvents() {
        // Add control buttons if they exist
        const startBtn = document.getElementById('startPowerGen');
        const stopBtn = document.getElementById('stopPowerGen');
        const statusBtn = document.getElementById('powerGenStatus');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.start());
        }

        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stop());
        }

        if (statusBtn) {
            statusBtn.addEventListener('click', () => {
                console.log('[PowerGen] Status:', this.getStatus());
                alert(JSON.stringify(this.getStatus(), null, 2));
            });
        }

        // Auto-start on page load (optional)
        document.addEventListener('DOMContentLoaded', () => {
            console.log('[PowerGen] DOM loaded, initializing auto-start...');

            // Initial UI update for stopped state
            this.updateStoppedUI();

            // Auto-start after 2 seconds
            setTimeout(() => {
                console.log('[PowerGen] Auto-starting power generator...');
                this.start();
            }, 2000);
        });

        // Also handle window load event as fallback
        window.addEventListener('load', () => {
            if (!this.isRunning) {
                console.log('[PowerGen] Window loaded, checking if generator needs to start...');
                setTimeout(() => {
                    if (!this.isRunning) {
                        this.start();
                    }
                }, 1000);
            }
        });
    }

    /**
     * Update UI when generator is stopped
     */
    updateStoppedUI() {
        const generatorStatusEl = document.getElementById('generatorStatus');
        if (generatorStatusEl) {
            generatorStatusEl.className = 'badge fs-6 p-3 bg-secondary text-white';
            generatorStatusEl.textContent = 'Generator Stopped';
        }

        const syncStatusEl = document.getElementById('syncStatusDisplay');
        if (syncStatusEl) {
            syncStatusEl.innerHTML = '<span class="badge bg-secondary">Waiting</span>';
        }
    }
}

// Initialize the power generator
window.powerGenerator = new RealTimePowerGenerator();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealTimePowerGenerator;
}

// Console helpers
window.startPowerGen = () => window.powerGenerator.start();
window.stopPowerGen = () => window.powerGenerator.stop();
window.powerGenStatus = () => console.log(window.powerGenerator.getStatus());

console.log('[PowerGen] Real-time Power Generator loaded. Use startPowerGen(), stopPowerGen(), powerGenStatus() in console.');
