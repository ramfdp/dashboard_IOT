/**
 * Dashboard Period Analysis
 * Handles period selection and real-time data from database
 * Separated from current usage for better clarity
 */

class DashboardPeriodAnalysis {
    constructor() {
        this.currentPeriod = 'harian';
        this.updateInterval = null;
        this.chart = null;
        this.midnightResetInterval = null;
        this.lastChartDate = new Date().toDateString();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadPeriodData();
        this.startAutoUpdate();
        this.setupMidnightReset();
    }

    setupEventListeners() {
        const periodSelect = document.getElementById('periodePerhitungan');
        if (periodSelect) {
            periodSelect.addEventListener('change', (e) => {
                this.currentPeriod = e.target.value;
                this.loadPeriodData();
                this.updatePeriodInfo();

                // Trigger update untuk section penggunaan listrik
                this.updateUsageSection();
            });
        }
    }

    async loadPeriodData() {
        try {
            // Show loading indicator
            this.showLoadingIndicator(true);

            // Add multiple timestamps untuk super strong cache-busting
            const timestamp = new Date().getTime();
            const randomNum = Math.random().toString(36).substring(7);
            const url = `/api/electricity/data?period=${this.currentPeriod}&_t=${timestamp}&_r=${randomNum}&_force=${Date.now()}`;

            console.log('🔄 Loading period data:', {
                period: this.currentPeriod,
                url: url,
                timestamp: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
            });

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    'If-Modified-Since': 'Thu, 01 Jan 1970 00:00:00 GMT',
                    'If-None-Match': timestamp.toString()
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('📥 API Response received:', result);

            if (result.success) {
                console.log('✅ Data validation:', {
                    hasData: !!(result.data && result.data.length > 0),
                    dataCount: result.data ? result.data.length : 0,
                    hasLabels: !!(result.labels && result.labels.length > 0),
                    labelsCount: result.labels ? result.labels.length : 0,
                    source: result.source,
                    period: result.period
                });

                this.updatePeriodDisplay(result);
                this.updateChart(result);
                this.updateStatistics(result);

                // Update section penggunaan listrik dengan periode yang dipilih
                this.updateUsageSectionWithPeriodData();

                // Hide loading indicator
                this.showLoadingIndicator(false);

                console.log('✅ Period data loaded successfully:', {
                    period: result.period,
                    source: result.source,
                    records: result.total_records,
                    current_month: result.current_month
                });
            } else {
                this.showLoadingIndicator(false);
                console.error('❌ API returned error:', result.message);
                this.showError('Gagal memuat data periode: ' + result.message);
            }
        } catch (error) {
            this.showLoadingIndicator(false);
            console.error('❌ Error loading period data:', error);
            this.showError('Error koneksi saat memuat data periode: ' + error.message);
        }
    }

    updatePeriodDisplay(data) {
        // Update period info
        const periodeInfo = document.getElementById('periodeInfo');
        if (periodeInfo && data.period_info) {
            periodeInfo.textContent = data.period_info;
        }

        // Update source indicator
        const sourceIndicator = this.createSourceIndicator(data.source, data.current_month);
        const periodCard = document.querySelector('#periodePerhitungan').closest('.card');
        if (periodCard) {
            let existingIndicator = periodCard.querySelector('.source-indicator');
            if (existingIndicator) {
                existingIndicator.remove();
            }
            periodCard.querySelector('.card-body').appendChild(sourceIndicator);
        }
    }

    createSourceIndicator(source, currentMonth) {
        const indicator = document.createElement('div');
        indicator.className = 'source-indicator mt-2 p-2 rounded';

        let badgeClass = 'bg-success';
        let iconClass = 'fa-database';
        let text = '';

        switch (source) {
            case 'database':
                badgeClass = 'bg-success';
                iconClass = 'fa-database';
                text = `Data real dari database (${currentMonth})`;
                break;
            case 'demo':
                badgeClass = 'bg-warning text-dark';
                iconClass = 'fa-exclamation-triangle';
                text = `Data demo - belum ada data di database untuk ${currentMonth}`;
                break;
            case 'error_fallback':
                badgeClass = 'bg-danger';
                iconClass = 'fa-exclamation-circle';
                text = 'Menggunakan data cadangan - terjadi error koneksi database';
                break;
        }

        indicator.innerHTML = `
            <span class="badge ${badgeClass}">
                <i class="fa ${iconClass} me-1"></i>${text}
            </span>
        `;

        return indicator;
    }

    updateChart(data) {
        console.log('📊 updateChart called with data:', data);

        const canvas = document.getElementById('electricityChart');
        if (!canvas) {
            console.error('❌ Canvas element not found!');
            return;
        }

        // Validate data
        if (!data || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
            console.warn('⚠️ No chart data available:', data);

            // Show empty chart message instead of failing silently
            const ctx = canvas.getContext('2d');

            // Destroy existing chart
            if (this.chart) {
                this.chart.destroy();
                this.chart = null;
            }

            // Clear canvas and show message
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#6c757d';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Belum ada data untuk periode ini', canvas.width / 2, canvas.height / 2);
            return;
        }

        console.log('✅ Chart data validation passed:', {
            dataLength: data.data.length,
            labelsLength: data.labels ? data.labels.length : 0,
            firstData: data.data[0],
            lastData: data.data[data.data.length - 1]
        });

        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.chart) {
            console.log('🗑️ Destroying existing chart...');
            this.chart.destroy();
        }

        // Force canvas clear untuk memastikan tidak ada cache
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Create new chart dengan timestamp untuk mencegah caching
        console.log('🎨 Creating new chart...');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels || [],
                datasets: [{
                    label: 'Konsumsi Listrik (W)',
                    data: data.data,
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1000 // Add animation to make updates visible
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Daya (Watt)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: this.getXAxisLabel()
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: `Monitoring Konsumsi Listrik - ${this.getRealtimeTitle()}`
                    }
                }
            }
        });

        // Update chart title with current time
        if (this.chart && this.chart.options && this.chart.options.plugins && this.chart.options.plugins.title) {
            this.chart.options.plugins.title.text = `Monitoring Konsumsi Listrik - ${this.getRealtimeTitle()}`;
            this.chart.update('none'); // Update without animation
        }

        console.log('✅ Chart created successfully!');
    }

    updateStatistics(data) {
        if (!data.data || data.data.length === 0) return;

        const stats = this.calculateStatistics(data.data);

        // Update detailed statistics
        const elements = {
            'dayaTertinggi': `${stats.max} W`,
            'dayaTerendah': `${stats.min} W`,
            'totalData': data.total_records,
            'kwhHarian': `${stats.dailyKwh} kWh`,
            'kwhMingguan': `${stats.weeklyKwh} kWh`,
            'kwhBulanan': `${stats.monthlyKwh} kWh`
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    /**
     * Update section penggunaan listrik berdasarkan periode yang dipilih
     */
    updateUsageSectionWithPeriodData() {
        // Panggil API untuk mendapatkan data usage berdasarkan periode
        this.fetchUsageByPeriod();
    }

    /**
     * Fetch usage data berdasarkan periode yang dipilih
     */
    async fetchUsageByPeriod() {
        try {
            console.log(`Fetching usage data for period: ${this.currentPeriod}`);

            const response = await fetch(`/api/electricity/usage-by-period?period=${this.currentPeriod}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Usage API Response:', result);

            if (result.success) {
                this.updateUsageDisplay(result);

                console.log('Usage data by period loaded:', {
                    period: result.period,
                    source: result.source,
                    records: result.total_records,
                    max_power: result.max_power,
                    avg_power: result.avg_power
                });
            } else {
                console.error('Failed to load usage by period:', result.message);
            }
        } catch (error) {
            console.error('Error loading usage by period:', error);

            // Fallback display
            const currentPowerElement = document.getElementById('currentPower');
            const lastUpdateElement = document.getElementById('lastUpdateTime');

            if (currentPowerElement) {
                currentPowerElement.textContent = 'Error';
            }
            if (lastUpdateElement) {
                lastUpdateElement.textContent = 'Error loading data';
            }
        }
    }

    /**
     * Update tampilan section penggunaan listrik
     */
    updateUsageDisplay(data) {
        console.log('updateUsageDisplay called with:', data);
        console.log('Current period:', this.currentPeriod);

        // Update power displays berdasarkan periode
        const currentPowerElement = document.getElementById('currentPower');
        const averagePowerElement = document.getElementById('averagePower');
        const todayKwhElement = document.getElementById('todayKwh');

        console.log('DOM Elements:', {
            currentPowerElement: !!currentPowerElement,
            averagePowerElement: !!averagePowerElement,
            todayKwhElement: !!todayKwhElement
        });

        if (currentPowerElement && averagePowerElement && todayKwhElement) {
            let powerLabel = '';
            let avgLabel = '';
            let energyLabel = '';
            let energyValue = '';

            switch (this.currentPeriod) {
                case 'harian':
                    powerLabel = 'Daya Puncak';
                    avgLabel = 'Rata-rata Hari';
                    energyLabel = 'Total Hari Ini';
                    energyValue = `${data.daily_kwh} kWh`;
                    currentPowerElement.textContent = `${data.max_power} W`;
                    averagePowerElement.textContent = `${data.avg_power} W`;
                    break;
                case 'mingguan':
                    powerLabel = 'Daya Puncak';
                    avgLabel = 'Rata-rata Minggu';
                    energyLabel = 'Total Minggu';
                    energyValue = `${data.weekly_kwh} kWh`;
                    currentPowerElement.textContent = `${data.max_power} W`;
                    averagePowerElement.textContent = `${data.avg_power} W`;
                    break;
                case 'bulanan':
                    powerLabel = 'Daya Puncak';
                    avgLabel = 'Rata-rata Bulan';
                    energyLabel = 'Total Bulan';
                    energyValue = `${data.monthly_kwh} kWh`;
                    currentPowerElement.textContent = `${data.max_power} W`;
                    averagePowerElement.textContent = `${data.avg_power} W`;
                    break;
            }

            // Update energy value
            todayKwhElement.textContent = energyValue;

            // Update labels dengan cara yang lebih aman
            const currentPowerContainer = currentPowerElement.parentElement;
            const averagePowerContainer = averagePowerElement.parentElement;
            const energyContainer = todayKwhElement.parentElement;

            if (currentPowerContainer) {
                const currentLabel = currentPowerContainer.querySelector('small');
                if (currentLabel) currentLabel.textContent = powerLabel;
            }

            if (averagePowerContainer) {
                const avgLabelElement = averagePowerContainer.querySelector('small');
                if (avgLabelElement) avgLabelElement.textContent = avgLabel;
            }

            if (energyContainer) {
                const energyLabelElement = energyContainer.querySelector('small');
                if (energyLabelElement) energyLabelElement.textContent = energyLabel;
            }
        }

        // Update last update time dengan periode info
        const lastUpdateElement = document.getElementById('lastUpdateTime');
        if (lastUpdateElement) {
            lastUpdateElement.textContent = `Update: ${data.last_update} (${data.period_info})`;
        }

        // Update header card title dengan null check
        const cardPowerElement = document.querySelector('#currentPower');
        if (cardPowerElement) {
            const usageCard = cardPowerElement.closest('.card');
            if (usageCard) {
                const usageCardTitle = usageCard.querySelector('.card-title');
                if (usageCardTitle) {
                    const periodTitles = {
                        'harian': 'Penggunaan Listrik - Hari Ini',
                        'mingguan': 'Penggunaan Listrik - Minggu Ini',
                        'bulanan': 'Penggunaan Listrik - Bulan Ini'
                    };
                    usageCardTitle.innerHTML = `<i class="fa fa-bolt me-2"></i>${periodTitles[this.currentPeriod] || 'Penggunaan Listrik'}`;
                }
            }
        } else {
            console.warn('[PeriodAnalysis] Element #currentPower not found, skipping card title update');
        }
    }

    /**
     * Trigger manual update untuk section penggunaan listrik
     */
    updateUsageSection() {
        // Load data periode untuk update penggunaan listrik
        this.loadPeriodData();
    }

    calculateStatistics(data) {
        const max = Math.max(...data);
        const min = Math.min(...data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;

        // Estimate kWh based on period
        const dailyKwh = (avg * 24) / 1000;
        const weeklyKwh = dailyKwh * 7;
        const monthlyKwh = dailyKwh * 30;

        return {
            max: Math.round(max),
            min: Math.round(min),
            avg: Math.round(avg),
            dailyKwh: dailyKwh.toFixed(2),
            weeklyKwh: weeklyKwh.toFixed(2),
            monthlyKwh: monthlyKwh.toFixed(2)
        };
    }

    updatePeriodInfo() {
        const periodeInfo = document.getElementById('periodeInfo');
        if (periodeInfo) {
            const currentMonth = new Date().toLocaleDateString('id-ID', {
                month: 'long',
                year: 'numeric'
            });

            let infoText = '';
            switch (this.currentPeriod) {
                case 'harian':
                    infoText = `Menampilkan data konsumsi listrik hari ini dari database`;
                    break;
                case 'mingguan':
                    infoText = `Menampilkan data konsumsi listrik minggu ini (${currentMonth})`;
                    break;
                case 'bulanan':
                    infoText = `Menampilkan data konsumsi listrik untuk ${currentMonth}`;
                    break;
            }

            periodeInfo.textContent = infoText;
        }
    }

    getXAxisLabel() {
        switch (this.currentPeriod) {
            case 'harian':
                return 'Waktu (Jam)';
            case 'mingguan':
                return 'Hari dan Jam';
            case 'bulanan':
                return 'Tanggal dan Jam';
            default:
                return 'Waktu';
        }
    }

    getPeriodTitle() {
        switch (this.currentPeriod) {
            case 'harian':
                return 'Periode Harian';
            case 'mingguan':
                return 'Periode Mingguan';
            case 'bulanan':
                return 'Periode Bulanan';
            default:
                return 'Periode Analisis';
        }
    }

    /**
     * Get real-time title with current date and time (pure JavaScript, not server dependent)
     */
    getRealtimeTitle() {
        // Use pure JavaScript to get real current date/time
        const now = new Date();

        // Force override any system date issues by creating a new Date object
        const realNow = new Date(Date.now());

        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Jakarta'
        };

        // Format in Indonesian
        const dateString = realNow.toLocaleDateString('id-ID', options);
        const timeString = realNow.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Asia/Jakarta'
        });

        console.log(`🕒 Real-time title generated: ${dateString} - ${timeString}`);
        return `${dateString} - ${timeString}`;
    }

    /**
     * Setup midnight reset untuk clear grafik setiap pergantian hari
     */
    setupMidnightReset() {
        // Calculate time until next midnight
        const now = new Date();
        const nextMidnight = new Date(now);
        nextMidnight.setHours(24, 0, 0, 0); // Set to next midnight

        const timeUntilMidnight = nextMidnight.getTime() - now.getTime();

        // Set initial timeout to next midnight
        setTimeout(() => {
            this.performMidnightReset();

            // Then set interval for every 24 hours
            this.midnightResetInterval = setInterval(() => {
                this.performMidnightReset();
            }, 24 * 60 * 60 * 1000); // 24 hours

        }, timeUntilMidnight);

        console.log(`Next midnight reset scheduled in ${Math.round(timeUntilMidnight / 1000 / 60)} minutes`);
    }

    /**
     * Perform midnight reset - clear chart dan reload data baru
     */
    performMidnightReset() {
        console.log('🌙 Performing midnight reset - clearing chart for new day');
        console.log('📅 Date change:', {
            from: this.lastChartDate,
            to: new Date().toDateString()
        });

        // Update last chart date
        this.lastChartDate = new Date().toDateString();

        // Clear existing chart dengan animasi
        if (this.chart) {
            console.log('🗑️ Destroying chart for midnight reset...');
            this.chart.destroy();
            this.chart = null;
        }

        // Clear chart canvas completely
        const canvas = document.getElementById('electricityChart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Show loading message pada canvas
            this.showLoadingOnCanvas(canvas);
        }

        // Reset statistics display
        this.resetStatisticsDisplay();

        // Clear any cached data
        if (window.dashboardData) {
            delete window.dashboardData;
        }

        // Force reload dengan delay yang lebih singkat dan cache busting
        setTimeout(() => {
            console.log('📊 Loading fresh data for new day...');

            // Force periode ke harian untuk data hari baru
            const periodSelect = document.getElementById('periodePerhitungan');
            if (periodSelect && periodSelect.value !== 'harian') {
                periodSelect.value = 'harian';
                this.currentPeriod = 'harian';
            }

            // Load dengan cache busting yang kuat
            this.loadPeriodData();

            // Update periode info
            this.updatePeriodInfo();

        }, 500); // Reduced delay untuk responsivitas yang lebih baik
    }    /**
     * Show loading message pada canvas
     */
    showLoadingOnCanvas(canvas) {
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        ctx.fillStyle = '#6c757d';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Loading data hari baru...', centerX, centerY);
    }

    /**
     * Reset statistics display ke nilai default
     */
    resetStatisticsDisplay() {
        const elements = {
            'dayaTertinggi': '-- W',
            'dayaTerendah': '-- W',
            'totalData': '--',
            'kwhHarian': '-- kWh',
            'kwhMingguan': '-- kWh',
            'kwhBulanan': '-- kWh'
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    /**
     * Check if date has changed (fallback check)
     */
    checkDateChange() {
        const currentDate = new Date().toDateString();
        if (this.lastChartDate !== currentDate) {
            console.log('📅 Date change detected, performing reset...');
            console.log('📊 Date comparison:', {
                stored: this.lastChartDate,
                current: currentDate
            });
            this.performMidnightReset();
            return true;
        }
        return false;
    }

    /**
     * Force refresh data (manual trigger)
     */
    forceRefresh() {
        console.log('🔄 Force refresh triggered');

        // Show loading indicator
        this.showLoadingIndicator(true);

        // Clear any existing chart
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }

        // Clear cache
        if (window.dashboardData) {
            delete window.dashboardData;
        }

        // Reload data with cache busting
        this.loadPeriodData();
    }

    /**
     * Show/hide loading indicator pada chart
     */
    showLoadingIndicator(show) {
        const canvas = document.getElementById('electricityChart');
        if (!canvas) return;

        let loadingOverlay = document.getElementById('chartLoadingOverlay');

        if (show) {
            // Create loading overlay if doesn't exist
            if (!loadingOverlay) {
                loadingOverlay = document.createElement('div');
                loadingOverlay.id = 'chartLoadingOverlay';
                loadingOverlay.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(255, 255, 255, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    font-size: 16px;
                    color: #007bff;
                    font-weight: bold;
                `;
                loadingOverlay.innerHTML = `
                    <div style="text-align: center;">
                        <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #007bff; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 10px;"></div>
                        <div>📊 Memperbarui data real-time...</div>
                    </div>
                `;

                // Add CSS animation for spinner
                if (!document.getElementById('spinnerStyle')) {
                    const style = document.createElement('style');
                    style.id = 'spinnerStyle';
                    style.textContent = `
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `;
                    document.head.appendChild(style);
                }

                canvas.parentElement.style.position = 'relative';
                canvas.parentElement.appendChild(loadingOverlay);
            }
            loadingOverlay.style.display = 'flex';
        } else {
            // Hide loading overlay
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
        }
    }

    startAutoUpdate() {
        // Update every 30 seconds for real-time data
        this.updateInterval = setInterval(() => {
            // Check if date has changed (fallback protection)
            this.checkDateChange();

            console.log('🔄 Auto-updating chart data...');
            this.loadPeriodData();

            // Update chart title every update
            this.updateChartTitle();
        }, 30 * 1000); // Changed from 5 minutes to 30 seconds

        // Update chart title every 5 seconds for real-time clock
        this.titleUpdateInterval = setInterval(() => {
            this.updateChartTitle();
        }, 5 * 1000);
    }

    /**
     * Update chart title with real-time clock
     */
    updateChartTitle() {
        if (this.chart && this.chart.options && this.chart.options.plugins && this.chart.options.plugins.title) {
            this.chart.options.plugins.title.text = `Monitoring Konsumsi Listrik - ${this.getRealtimeTitle()}`;
            this.chart.update('none'); // Update without animation
            console.log('🕒 Chart title updated');
        }
    }

    showError(message) {
        console.error('Period Analysis Error:', message);

        // Show error badge
        const periodCard = document.querySelector('#periodePerhitungan').closest('.card');
        if (periodCard) {
            let errorBadge = periodCard.querySelector('.error-badge');
            if (errorBadge) {
                errorBadge.remove();
            }

            const errorElement = document.createElement('div');
            errorElement.className = 'error-badge mt-2';
            errorElement.innerHTML = `
                <span class="badge bg-danger">
                    <i class="fa fa-exclamation-circle me-1"></i>${message}
                </span>
            `;

            periodCard.querySelector('.card-body').appendChild(errorElement);
        }
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.titleUpdateInterval) {
            clearInterval(this.titleUpdateInterval);
        }
        if (this.midnightResetInterval) {
            clearInterval(this.midnightResetInterval);
        }
        if (this.chart) {
            this.chart.destroy();
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    if (typeof Chart !== 'undefined') {
        window.dashboardPeriodAnalysis = new DashboardPeriodAnalysis();

        // Expose force refresh untuk debugging
        window.forceRefreshChart = function () {
            if (window.dashboardPeriodAnalysis) {
                console.log('🔧 Manual force refresh triggered from console');
                window.dashboardPeriodAnalysis.forceRefresh();
            }
        };

        console.log('✅ Dashboard Period Analysis initialized');
        console.log('💡 Use window.forceRefreshChart() to manually refresh data');
    } else {
        console.warn('Chart.js not loaded, period analysis chart disabled');
    }
});
