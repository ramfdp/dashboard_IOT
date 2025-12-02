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

        this.buildingProfile = {
            totalFloors: 15,
            officeArea: 12000,
            basePowerConsumption: 400,
            maxPowerConsumption: 650,
            operatingHours: {
                start: 7,
                end: 19
            },
            weekendReduction: 0.3
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadStoredEnergy();
    }

    generateRealisticPower() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const dayOfWeek = now.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isWorkingHour = hour >= this.buildingProfile.operatingHours.start &&
            hour <= this.buildingProfile.operatingHours.end;

        let calculatedPower;

        if (hour >= 7 && hour <= 18 && !isWeekend) {
            calculatedPower = 550 + Math.random() * 50;
        } else if (isWeekend && hour >= 8 && hour <= 17) {
            calculatedPower = 300 + Math.random() * 100;
        } else {
            calculatedPower = 120 + Math.random() * 60;
        }

        return Math.max(calculatedPower, 100);
    }

    generateVoltage() {
        const baseVoltage = 220;
        const variation = (Math.random() - 0.5) * 10;
        return Math.max(200, Math.min(240, baseVoltage + variation));
    }

    calculateCurrent(power, voltage) {
        if (voltage === 0) return 0;
        return power / voltage;
    }

    generateElectricalData() {
        const power = this.generateRealisticPower();
        const voltage = this.generateVoltage();
        const current = this.calculateCurrent(power, voltage);

        const timeDelta = 1;
        const energyIncrement = (power * timeDelta) / (60 * 1000);

        this.currentData = {
            voltage: Math.round(voltage * 10) / 10,
            current: Math.round(current * 100) / 100,
            power: Math.round(power),
            energy: Math.round((this.currentData.energy + energyIncrement) * 1000) / 1000,
            frequency: 50.0 + (Math.random() - 0.5) * 0.5,
            powerFactor: 0.85 + (Math.random() - 0.5) * 0.1,
            timestamp: new Date().toISOString(),
            location: 'PT Krakatau Sarana Property'
        };

        return this.currentData;
    }

    updateUI(data) {
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
            const lightingPower = Math.random() > 0.5 ? 72 : 36;
            const totalPower = data.power + lightingPower;
            totalEl.textContent = `${totalPower.toFixed(2)} W`;
        }

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

        const voltageElement = document.querySelector('.voltage-value, #voltageDisplay, [data-display="voltage"]');
        if (voltageElement) {
            voltageElement.textContent = `${data.voltage} V`;
        }

        const currentElement = document.querySelector('.current-value, #currentDisplay, [data-display="current"]');
        if (currentElement) {
            currentElement.textContent = `${data.current} A`;
        }

        const powerElement = document.querySelector('.power-value, #powerDisplay, [data-display="power"]');
        if (powerElement) {
            powerElement.textContent = `${data.power} W`;
        }

    }

    async sendToFirebase(data) {
        try {
            if (typeof firebase !== 'undefined' && firebase.database) {
                const database = firebase.database();
                const ref = database.ref('electricity_data');

                // Format data sama seperti yang ditampilkan di UI
                const formattedData = {
                    voltage: Math.round(data.voltage * 10) / 10,
                    current: Math.round(data.current * 100) / 100,
                    power: Math.round(data.power),
                    energy: Math.round(data.energy * 10000) / 10000,
                    frequency: Math.round(data.frequency * 100) / 100,
                    powerFactor: Math.round(data.powerFactor * 1000) / 1000,
                    timestamp: data.timestamp,
                    location: data.location,
                    created_at: firebase.database.ServerValue.TIMESTAMP
                };

                await ref.push(formattedData);

                // console.log('[PowerGen] Data sent to Firebase successfully');
                return true;
            } else {
                // console.warn('[PowerGen] Firebase not available, skipping Firebase sync');
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
            const response = await fetch(`${window.baseUrl}/api/listrik`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    tegangan: Math.round(data.voltage * 10) / 10,
                    arus: Math.round(data.current * 100) / 100,
                    daya: Math.round(data.power),
                    energi: Math.round(data.energy * 10000) / 10000,
                    frekuensi: Math.round(data.frequency * 100) / 100,
                    power_factor: Math.round(data.powerFactor * 1000) / 1000,
                    lokasi: data.location,
                    building: data.building,
                    timestamp: data.timestamp
                })
            });

            if (response.ok) {
                const result = await response.json();
                // console.log('[PowerGen] Data sent to database successfully:', result);
                return true;
            } else {
                // console.error('[PowerGen] Failed to send to database:', response.statusText);
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

        } catch (error) {
            console.error('[PowerGen] Error in sync process:', error);
        }

        localStorage.setItem('pt_krakatau_energy_total', data.energy.toString());
    }


    start() {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;

        // Generate data immediately
        this.generateAndSync();

        // Generate every 10 seconds - SATU KALI SAJA
        this.interval = setInterval(() => {
            this.generateAndSync();
        }, 10000); // 10 detik - generate dan sync
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

    loadStoredEnergy() {
        const storedEnergy = localStorage.getItem('pt_krakatau_energy_total');
        if (storedEnergy) {
            this.currentData.energy = parseFloat(storedEnergy);
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
                alert(JSON.stringify(this.getStatus(), null, 2));
            });
        }

        // Auto-start on page load SEKALI SAJA
        document.addEventListener('DOMContentLoaded', () => {
            // Pastikan hanya 1 instance yang running
            if (!this.isRunning) {
                // Update UI untuk stopped state
                this.updateStoppedUI();

                // Auto-start setelah 2 detik
                setTimeout(() => {
                    if (!this.isRunning) {
                        this.start();
                    }
                }, 2000);
            }
        });
    }

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

window.powerGenerator = new RealTimePowerGenerator();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealTimePowerGenerator;
}

window.startPowerGen = () => window.powerGenerator.start();
window.stopPowerGen = () => window.powerGenerator.stop();
window.powerGenStatus = () => console.log(window.powerGenerator.getStatus());


