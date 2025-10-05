/**
 * PLN Tariff Calculator - Enhanced with Official PLN Rates
 * Berdasarkan Tarif PLN Juli-September 2025
 * PT Krakatau Sarana Property
 */

class PLNTariffCalculator {
    constructor() {
        this.tariffData = {
            // Residential Tariffs
            'R-1/TR': {
                name: 'Rumah Tangga 900 VA-RTM',
                category: 'Residensial',
                power: '900 VA',
                rates: [
                    { limit: Infinity, rate: 1352.00 }
                ],
                basicFee: 0,
                description: 'Rumah tangga dengan daya 900 VA'
            },
            'R-1/TR-1300': {
                name: 'Rumah Tangga 1300 VA',
                category: 'Residensial',
                power: '1300 VA',
                rates: [
                    { limit: Infinity, rate: 1444.70 }
                ],
                basicFee: 0,
                description: 'Rumah tangga dengan daya 1300 VA'
            },
            'R-1/TR-2200': {
                name: 'Rumah Tangga 2200 VA',
                category: 'Residensial',
                power: '2200 VA',
                rates: [
                    { limit: Infinity, rate: 1444.70 }
                ],
                basicFee: 0,
                description: 'Rumah tangga dengan daya 2200 VA'
            },
            'R-2/TR': {
                name: 'Rumah Tangga 3500-5500 VA',
                category: 'Residensial',
                power: '3500-5500 VA',
                rates: [
                    { limit: Infinity, rate: 1699.53 }
                ],
                basicFee: 0,
                description: 'Rumah tangga dengan daya 3500-5500 VA'
            },
            'R-3/TR': {
                name: 'Rumah Tangga 6600 VA ke atas',
                category: 'Residensial',
                power: '6600 VA+',
                rates: [
                    { limit: Infinity, rate: 1699.53 }
                ],
                basicFee: 0,
                description: 'Rumah tangga dengan daya 6600 VA ke atas'
            },

            // Business Tariffs
            'B-2/TR': {
                name: 'Bisnis 6600 VA s.d 200 kVA',
                category: 'Bisnis',
                power: '6600 VA - 200 kVA',
                rates: [
                    { limit: Infinity, rate: 1444.70 }
                ],
                basicFee: 0,
                description: 'Bisnis dengan daya 6600 VA sampai 200 kVA'
            },

            // Industrial Tariffs  
            'B-3/TM': {
                name: 'Bisnis di atas 200 kVA',
                category: 'Industri',
                power: '> 200 kVA',
                rates: [
                    { limit: Infinity, rate: 1035.76 }
                ],
                basicFee: 0,
                description: 'Bisnis dengan daya di atas 200 kVA',
                blockType: 'WBP/LWBP',
                wbpRate: 1035.76,
                lwbpRate: 1035.76
            },

            'I-3/TM': {
                name: 'Industri di atas 200 kVA',
                category: 'Industri',
                power: '> 200 kVA',
                rates: [
                    { limit: Infinity, rate: 1035.76 }
                ],
                basicFee: 0,
                description: 'Industri dengan daya di atas 200 kVA',
                blockType: 'WBP/LWBP',
                wbpRate: 1035.76,
                lwbpRate: 1035.76,
                kvarh: 1114.74
            },

            'I-4/TT': {
                name: 'Industri 30,000 kVA ke atas',
                category: 'Industri Besar',
                power: '≥ 30,000 kVA',
                rates: [
                    { limit: Infinity, rate: 996.74 }
                ],
                basicFee: 0,
                description: 'Industri besar dengan daya 30,000 kVA ke atas',
                blockType: 'WBP/LWBP',
                wbpRate: 996.74,
                lwbpRate: 996.74
            },

            // Public Facilities
            'P-1/TR': {
                name: 'Penerangan Jalan s.d 200 kVA',
                category: 'Publik',
                power: '≤ 200 kVA',
                rates: [
                    { limit: Infinity, rate: 1699.53 }
                ],
                basicFee: 0,
                description: 'Penerangan jalan sampai 200 kVA'
            },

            'P-2/TM': {
                name: 'Penerangan Jalan di atas 200 kVA',
                category: 'Publik',
                power: '> 200 kVA',
                rates: [
                    { limit: Infinity, rate: 1415.01 }
                ],
                basicFee: 0,
                description: 'Penerangan jalan di atas 200 kVA',
                blockType: 'WBP/LWBP',
                wbpRate: 1415.01,
                lwbpRate: 1415.01,
                kvarh: 1522.86
            },

            'P-3/TR': {
                name: 'Layanan Umum',
                category: 'Publik',
                power: 'Varies',
                rates: [
                    { limit: Infinity, rate: 1699.53 }
                ],
                basicFee: 0,
                description: 'Layanan umum dan sosial'
            },

            // Special Tariffs
            'U/TR-TM-TT': {
                name: 'Tarif Khusus',
                category: 'Khusus',
                power: 'Varies',
                rates: [
                    { limit: Infinity, rate: 1644.52 }
                ],
                basicFee: 0,
                description: 'Tarif khusus sesuai kesepakatan',
                blockType: 'WBP/LWBP',
                wbpRate: 1644.52,
                lwbpRate: 1644.52
            }
        };

        // Default tariff untuk PT Krakatau Sarana Property (Industri)
        this.currentTariff = 'I-3/TM';
        this.initializeUI();
    }

    initializeUI() {
        this.createModalTariffSelector();
        this.updateModalDisplay();
    }

    createModalTariffSelector() {
        // Initialize modal tariff selector instead of standalone
        this.initializeModalSelector();
    }

    initializeModalSelector() {
        // Wait for modal to be available
        const checkModal = setInterval(() => {
            const modalSelector = document.getElementById('tariffSelectModal');
            if (modalSelector) {
                clearInterval(checkModal);
                this.setupModalSelector(modalSelector);
            }
        }, 500);
    }

    setupModalSelector(modalSelector) {
        // Populate modal selector options
        modalSelector.innerHTML = this.generateTariffOptions();

        // Set default selection
        modalSelector.value = this.currentTariff;

        // Add event listener
        modalSelector.addEventListener('change', (e) => {
            this.changeTariff(e.target.value);
        });

        // Initialize display
        this.updateModalDisplay();
        this.calculateModalCost();

        // Setup modal calculator
        this.setupModalCalculator();

        console.log('[PLN Calculator] Modal selector initialized');
    }

    setupModalCalculator() {
        const kwhInput = document.getElementById('kwhInputModal');

        // Input is now readonly and auto-populated from database
        if (kwhInput) {
            kwhInput.setAttribute('readonly', true);
            kwhInput.placeholder = 'Memuat data dari database...';
        }

        // Auto-load data from database - no manual interaction needed
        console.log('[PLN Calculator] Auto-mode - loading monthly data from database');

        // Load monthly data from database
        this.loadMonthlyDataFromDatabase();
    }

    async loadMonthlyDataFromDatabase() {
        try {
            const response = await fetch('/api/pln/monthly-kwh-consumption', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.monthly_kwh > 0) {
                    console.log('[PLN Calculator] ✅ Monthly data loaded from database:', data);

                    // Update input field with monthly consumption
                    const kwhInput = document.getElementById('kwhInputModal');
                    if (kwhInput) {
                        kwhInput.value = data.monthly_kwh.toFixed(2);

                        // Add data source info
                        this.updateDataSourceInfo(data);

                        // Calculate cost
                        this.calculateModalCost();
                    }
                    return;
                }
            }

            console.warn('[PLN Calculator] No monthly data available, enabling manual input');

            // Enable manual input as fallback
            const kwhInput = document.getElementById('kwhInputModal');
            if (kwhInput) {
                kwhInput.removeAttribute('readonly');
                kwhInput.placeholder = 'Masukkan konsumsi kWh';
                kwhInput.value = '100'; // Default value

                // Add input listener for manual mode
                kwhInput.addEventListener('input', () => {
                    this.calculateModalCost();
                });
            }

            // Update help text
            const helpText = document.querySelector('#kwhInputModal').parentElement.nextElementSibling;
            if (helpText && helpText.classList.contains('text-muted')) {
                helpText.innerHTML = '<i class="fa fa-edit"></i> Input manual - data database tidak tersedia';
            }

            this.calculateModalCost();

        } catch (error) {
            console.error('[PLN Calculator] Error loading monthly data:', error);

            // Enable manual input as fallback
            const kwhInput = document.getElementById('kwhInputModal');
            if (kwhInput) {
                kwhInput.removeAttribute('readonly');
                kwhInput.placeholder = 'Masukkan konsumsi kWh';
                kwhInput.value = '100';

                // Add input listener
                kwhInput.addEventListener('input', () => {
                    this.calculateModalCost();
                });
            }

            // Update help text
            const helpText = document.querySelector('#kwhInputModal').parentElement.nextElementSibling;
            if (helpText && helpText.classList.contains('text-muted')) {
                helpText.innerHTML = '<i class="fa fa-exclamation-triangle"></i> Error loading data - input manual tersedia';
            }

            this.calculateModalCost();
        }
    }

    updateDataSourceInfo(data) {
        // Add or update data source information display
        const helpText = document.querySelector('#kwhInputModal').parentElement.nextElementSibling;
        if (helpText && helpText.classList.contains('text-muted')) {
            helpText.innerHTML = `
                <i class="fa fa-database"></i> Data konsumsi bulanan dari database: ${data.monthly_kwh.toFixed(2)} kWh
                <br><small>Berdasarkan ${data.data_points} data points (${data.calculation_method})</small>
            `;
        }
    }

    loadMonitoringData() {
        // Manual input mode - data sync disabled
        console.log('[PLN Calculator] Manual input mode - monitoring data sync disabled');

        // Just use the current input value without auto-loading
        const kwhInput = document.getElementById('kwhInputModal');
        if (kwhInput && kwhInput.value) {
            this.calculateModalCost();
        }
    }

    async getDataFromMonitoring() {
        // Priority 1: Get from database API
        try {
            const response = await fetch('/api/pln/latest-kwh-data', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.kwh && data.kwh > 0) {
                    console.log('[PLN Calculator] ✅ Data from database API:', data.kwh, 'kWh');
                    console.log('[PLN Calculator] Source:', data.source, 'Timestamp:', data.timestamp);
                    return parseFloat(data.kwh);
                }
            }
        } catch (error) {
            console.log('[PLN Calculator] Database API not available:', error.message);
        }

        // Priority 2: Get from real-time monitoring elements
        const kwhFromElements = this.extractKwhFromDashboard();
        if (kwhFromElements > 0) {
            console.log('[PLN Calculator] ✅ Data from dashboard elements:', kwhFromElements, 'kWh');
            return kwhFromElements;
        }

        // Priority 3: Get from global monitoring data
        if (window.realTimeElectricityData && window.realTimeElectricityData.dailyKwh) {
            const dailyKwh = parseFloat(window.realTimeElectricityData.dailyKwh);
            console.log('[PLN Calculator] ✅ Data from global monitoring:', dailyKwh, 'kWh');
            return dailyKwh;
        }

        // Priority 4: Calculate from power consumption
        const estimatedKwh = this.estimateKwhFromPower();
        if (estimatedKwh > 0) {
            console.log('[PLN Calculator] ✅ Data estimated from power:', estimatedKwh, 'kWh');
            return estimatedKwh;
        }

        throw new Error('No monitoring data available');
    }

    extractKwhFromDashboard() {
        // Extract kWh from various dashboard elements
        const kwhSources = [
            'totalKwh',
            'total-listrik',
            'pzem-power',
            'daily-kwh',
            'consumption-kwh'
        ];

        for (const sourceId of kwhSources) {
            const element = document.getElementById(sourceId);
            if (element) {
                const text = element.textContent || element.innerHTML;
                const kwhMatch = text.match(/(\d+(?:\.\d+)?)/);
                if (kwhMatch) {
                    const kwh = parseFloat(kwhMatch[1]);
                    if (kwh > 0) {
                        // Convert from watts to kWh if needed
                        return kwh > 1000 ? kwh / 1000 : kwh;
                    }
                }
            }
        }

        return 0;
    }

    estimateKwhFromPower() {
        // Estimate daily kWh from current power consumption
        const powerElement = document.getElementById('pzem-power') ||
            document.getElementById('total-listrik');

        if (powerElement) {
            const powerText = powerElement.textContent || powerElement.innerHTML;
            const powerMatch = powerText.match(/(\d+(?:\.\d+)?)/);
            if (powerMatch) {
                const powerWatts = parseFloat(powerMatch[1]);
                const powerKw = powerWatts / 1000;
                // Estimate daily consumption (assuming current power for 24 hours)
                const dailyKwh = powerKw * 24;
                return dailyKwh;
            }
        }

        return 0;
    }

    startDataSync() {
        // Sync monitoring data every 30 seconds
        setInterval(() => {
            this.loadMonitoringData();
        }, 30000);
    }

    generateTariffOptions() {
        let options = '';
        let currentCategory = '';

        Object.entries(this.tariffData).forEach(([code, data]) => {
            if (data.category !== currentCategory) {
                if (currentCategory !== '') {
                    options += '</optgroup>';
                }
                options += `<optgroup label="${data.category}">`;
                currentCategory = data.category;
            }

            const selected = code === this.currentTariff ? 'selected' : '';
            options += `<option value="${code}" ${selected}>${code} - ${data.name}</option>`;
        });

        if (currentCategory !== '') {
            options += '</optgroup>';
        }

        return options;
    }

    changeTariff(tariffCode) {
        this.currentTariff = tariffCode;
        this.updateModalDisplay();
        this.calculateModalCost();

        console.log(`[PLN Calculator] Tariff changed to: ${tariffCode}`);
    }

    updateModalDisplay() {
        const tariff = this.tariffData[this.currentTariff];
        const rate = tariff.rates[0].rate;

        // Update modal tariff info
        const currentRateModal = document.getElementById('currentRateModal');
        const tariffDescriptionModal = document.getElementById('tariffDescriptionModal');

        if (currentRateModal) {
            currentRateModal.textContent = `Rp ${this.formatNumber(rate)}`;
        }

        if (tariffDescriptionModal) {
            tariffDescriptionModal.textContent = tariff.description;
        }
    }

    calculateModalCost() {
        const kwhInput = document.getElementById('kwhInputModal');
        const kwh = parseFloat(kwhInput?.value) || 0;

        // Validate input
        if (kwh <= 0) {
            console.warn('[PLN Calculator] ⚠️ Invalid kWh value:', kwh);
            return { kwh: 0, rate: 0, totalCost: 0, tariffCode: '', tariffName: '' };
        }

        const tariff = this.tariffData[this.currentTariff];
        if (!tariff) {
            console.error('[PLN Calculator] ❌ Invalid tariff:', this.currentTariff);
            return { kwh: 0, rate: 0, totalCost: 0, tariffCode: '', tariffName: '' };
        }

        const rate = tariff.rates[0].rate;

        // Basic calculation
        const totalCost = kwh * rate;

        console.log(`[PLN Calculator] 📊 Calculation: ${kwh} kWh × Rp ${rate} = Rp ${totalCost.toLocaleString('id-ID')}`);

        // Update modal display
        const displayKwhModal = document.getElementById('displayKwhModal');
        const totalCostModal = document.getElementById('totalCostModal');

        if (displayKwhModal) {
            displayKwhModal.textContent = `${kwh} kWh`;
        }

        if (totalCostModal) {
            totalCostModal.textContent = `Rp ${this.formatNumber(totalCost)}`;
        }

        // Update existing cost summary cards
        this.updateCostSummaryCards(kwh, rate, totalCost);

        // Trigger event untuk integrasi dengan sistem lain
        this.triggerCalculationEvent(kwh, rate, totalCost);

        return {
            kwh: kwh,
            rate: rate,
            totalCost: totalCost,
            tariffCode: this.currentTariff,
            tariffName: tariff.name
        };
    }

    updateCostSummaryCards(kwh, rate, totalCost) {
        // Update existing cost display cards
        const costDailyKwh = document.getElementById('costDailyKwh');
        const costDailyAmount = document.getElementById('costDailyAmount');
        const costMonthlyKwh = document.getElementById('costMonthlyKwh');
        const costMonthlyAmount = document.getElementById('costMonthlyAmount');
        const totalCostHighlight = document.getElementById('totalCostHighlight');

        if (costDailyKwh) costDailyKwh.textContent = `${kwh.toFixed(1)} kWh`;
        if (costDailyAmount) costDailyAmount.textContent = `Rp ${this.formatNumber(totalCost)}`;

        // Monthly calculations (assume 30 days)
        const monthlyKwh = kwh * 30;
        const monthlyCost = totalCost * 30;

        if (costMonthlyKwh) costMonthlyKwh.textContent = `${this.formatNumber(monthlyKwh)} kWh`;
        if (costMonthlyAmount) costMonthlyAmount.textContent = `Rp ${this.formatNumber(monthlyCost)}`;
        if (totalCostHighlight) totalCostHighlight.textContent = `Rp ${this.formatNumber(monthlyCost)}`;
    }

    triggerCalculationEvent(kwh, rate, totalCost) {
        // Dispatch custom event untuk integrasi
        const event = new CustomEvent('plnCalculationUpdate', {
            detail: {
                kwh: kwh,
                rate: rate,
                totalCost: totalCost,
                tariffCode: this.currentTariff,
                timestamp: new Date().toISOString()
            }
        });
        document.dispatchEvent(event);
    }

    formatNumber(number) {
        return new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(number);
    }

    // Public methods untuk integrasi
    getCurrentTariff() {
        return this.tariffData[this.currentTariff];
    }

    getCurrentRate() {
        return this.tariffData[this.currentTariff].rates[0].rate;
    }

    calculateKwhToCost(kwh) {
        const rate = this.getCurrentRate();
        return kwh * rate;
    }

    getAllTariffs() {
        return this.tariffData;
    }

    /**
     * Start periodic data sync with monitoring system (DISABLED in manual mode)
     */
    startDataSync() {
        console.log('[PLN Calculator] � Data sync disabled - Manual input mode');
        // No automatic sync in manual mode
    }    /**
     * Stop periodic data sync
     */
    stopDataSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            console.log('[PLN Calculator] ⏹️ Data sync stopped');
        }
    }

    /**
     * Force refresh data now
     */
    refreshData() {
        console.log('[PLN Calculator] 🔄 Force refreshing data...');
        this.loadMonitoringData();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    console.log('[PLN Calculator] Initializing PLN Tariff Calculator...');

    setTimeout(() => {
        window.plnCalculator = new PLNTariffCalculator();

        // Global functions
        window.calculatePLNCost = (kwh) => window.plnCalculator.calculateKwhToCost(kwh);
        window.getPLNRate = () => window.plnCalculator.getCurrentRate();
        window.getPLNTariff = () => window.plnCalculator.getCurrentTariff();

        console.log('[PLN Calculator] ✅ Initialized successfully (Manual Mode)');
        console.log('[PLN Calculator] Available functions: calculatePLNCost(kwh), getPLNRate(), getPLNTariff()');

    }, 1000);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PLNTariffCalculator;
}
