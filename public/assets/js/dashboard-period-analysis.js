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
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadPeriodData();
        this.startAutoUpdate();
    }

    setupEventListeners() {
        const periodSelect = document.getElementById('periodePerhitungan');
        if (periodSelect) {
            periodSelect.addEventListener('change', (e) => {
                this.currentPeriod = e.target.value;
                this.loadPeriodData();
                this.updatePeriodInfo();
            });
        }
    }

    async loadPeriodData() {
        try {
            const response = await fetch(`/api/electricity/data?period=${this.currentPeriod}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                this.updatePeriodDisplay(result);
                this.updateChart(result);
                this.updateStatistics(result);
                
                console.log('Period data loaded:', {
                    period: result.period,
                    source: result.source,
                    records: result.total_records,
                    current_month: result.current_month
                });
            } else {
                console.error('Failed to load period data:', result.message);
                this.showError('Gagal memuat data periode');
            }
        } catch (error) {
            console.error('Error loading period data:', error);
            this.showError('Error koneksi saat memuat data periode');
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
        const canvas = document.getElementById('electricityChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        // Create new chart
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
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
                        text: `Analisis Konsumsi Listrik - ${this.getPeriodTitle()}`
                    }
                }
            }
        });
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

    startAutoUpdate() {
        // Update every 5 minutes for period data
        this.updateInterval = setInterval(() => {
            this.loadPeriodData();
        }, 5 * 60 * 1000);
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
        if (this.chart) {
            this.chart.destroy();
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (typeof Chart !== 'undefined') {
        window.dashboardPeriodAnalysis = new DashboardPeriodAnalysis();
    } else {
        console.warn('Chart.js not loaded, period analysis chart disabled');
    }
});
