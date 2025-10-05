/**
 * Electricity Linear Regression Calculator
 * Menggantikan sistem prediksi KNN dengan Linear Regression
 * Untuk PT Krakatau Sarana Property
 */

// Global Linear Regression Predictor class
class LinearRegressionPredictor {
    constructor() {
        this.isInitialized = false;
    }

    /**
     * Simple Linear Regression prediction based on historical data
     */
    async predict(historicalData, targetHours = 24) {
        try {
            if (!historicalData || historicalData.length < 3) {
                return {
                    prediction: 0
                };
            }

            // Prepare data for linear regression
            const dataPoints = historicalData.map((item, index) => ({
                x: index,
                y: parseFloat(item.daya) || parseFloat(item.power) || 0
            }));

            // Calculate linear regression
            const regression = this.calculateLinearRegression(dataPoints);

            // Predict future value
            const futureX = dataPoints.length + (targetHours / 24) * dataPoints.length;
            const prediction = regression.slope * futureX + regression.intercept;

            // Ensure prediction is reasonable (between 50W and 800W)
            const adjustedPrediction = Math.max(50, Math.min(800, Math.abs(prediction)));

            return {
                prediction: Math.round(adjustedPrediction)
            };
        } catch (error) {
            console.warn('Linear regression prediction failed:', error.message);
            return {
                prediction: 250
            };
        }
    }

    /**
     * Calculate linear regression coefficients
     */
    calculateLinearRegression(dataPoints) {
        const n = dataPoints.length;
        const sumX = dataPoints.reduce((sum, point) => sum + point.x, 0);
        const sumY = dataPoints.reduce((sum, point) => sum + point.y, 0);
        const sumXY = dataPoints.reduce((sum, point) => sum + (point.x * point.y), 0);
        const sumXX = dataPoints.reduce((sum, point) => sum + (point.x * point.x), 0);

        // Calculate slope and intercept
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        return {
            slope: slope,
            intercept: intercept
        };
    }
}

// Make Linear Regression predictor available globally
window.LinearRegressionPredictor = LinearRegressionPredictor;

class ElectricityLinearRegressionCalculator {
    constructor(chartManager = null) {
        this.isInitialized = false;
        this.chart = null;
        this.chartData = [];
        this.chartManager = chartManager;

        // Use existing chart manager or create new one
        if (this.chartManager) {
            console.log('ChartManager used for Linear Regression calculator initialization');
        }

        // Initialize linear regression predictor
        this.linearPredictor = null;

        // Electricity analysis configurations
        this.analysisConfig = {
            predictions: {
                enabled: true,
                hours: [1, 6, 12, 24],
                defaultHours: 24
            },
            charts: {
                animation: true,
                responsive: true
            }
        };

        this.initialize();
    }

    async initialize() {
        // Destroy any existing chart if using chartManager
        if (this.chartManager && this.chartManager.chart) {
            try {
                this.chartManager.chart.destroy();
                console.log('Existing Chart.js instance destroyed before creating new Linear Regression calculator');
            } catch (error) {
                console.log('No existing chart to destroy');
            }
        }

        // Create loading state
        this.showLoadingState();

        // Initialize with delay to ensure DOM is ready
        setTimeout(async () => {
            await this.initializeLinearRegressionModel();
        }, 500);
    }

    /**
     * Initialize Linear Regression model
     */
    async initializeLinearRegressionModel() {
        try {
            // Wait for Linear Regression Predictor to be available
            const waitForLinearRegression = () => {
                if (typeof LinearRegressionPredictor !== 'undefined') {
                    this.linearPredictor = new LinearRegressionPredictor();
                    console.log('Linear Regression predictor initialized successfully');
                    this.isInitialized = true;
                    this.loadElectricityData();
                } else {
                    console.log('Waiting for Linear Regression Predictor...');
                    setTimeout(waitForLinearRegression, 100);
                }
            };

            waitForLinearRegression();
        } catch (error) {
            console.error('Failed to initialize Linear Regression model:', error);
            this.showErrorState('Failed to initialize prediction model');
        }
    }

    /**
     * Load electricity data and perform analysis
     */
    async loadElectricityData() {
        try {
            this.showLoadingState();

            // Generate realistic electricity data if no data available
            const electricityData = await this.getElectricityData();

            if (!electricityData || electricityData.length === 0) {
                throw new Error('No electricity data available');
            }

            this.chartData = electricityData;

            // Perform linear regression analysis
            await this.performLinearRegressionAnalysis();

            // Create visualization
            this.createElectricityChart();

            // Update summary statistics
            this.updateSummaryStatistics();

            console.log('Linear Regression analysis completed successfully');

        } catch (error) {
            console.error('Failed to load electricity data:', error);
            this.showErrorState('Failed to load electricity data: ' + error.message);
        }
    }

    /**
     * Get electricity data from various sources
     */
    async getElectricityData() {
        try {
            // Try to get data from API first
            const response = await fetch('/api/history/filtered?limit=100');
            if (response.ok) {
                const apiData = await response.json();
                if (apiData.data && apiData.data.length > 0) {
                    return apiData.data.map(item => ({
                        waktu: item.waktu,
                        daya: parseFloat(item.daya),
                        waktu_formatted: new Date(item.waktu).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                    }));
                }
            }
        } catch (error) {
            console.warn('API data not available, using generated data:', error);
        }

        // Generate realistic data as fallback
        return this.generateRealisticElectricityData();
    }

    /**
     * Generate realistic electricity data for demonstration
     */
    generateRealisticElectricityData() {
        const data = [];
        const now = new Date();

        for (let i = 23; i >= 0; i--) {
            const time = new Date(now.getTime() - (i * 60 * 60 * 1000));
            const hour = time.getHours();

            // Generate realistic power consumption based on time
            let power;
            if (hour >= 7 && hour <= 18) {
                // Work hours: 550-600W
                power = 550 + Math.random() * 50;
            } else {
                // Night hours: 120-180W
                power = 120 + Math.random() * 60;
            }

            data.push({
                waktu: time.toISOString(),
                daya: Math.round(power),
                waktu_formatted: time.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            });
        }

        return data;
    }

    /**
     * Perform linear regression analysis
     */
    async performLinearRegressionAnalysis() {
        if (!this.linearPredictor || !this.chartData) {
            throw new Error('Linear regression predictor or data not available');
        }

        try {
            // Get predictions for different time horizons
            this.predictions = {};

            for (const hours of this.analysisConfig.predictions.hours) {
                const result = await this.linearPredictor.predict(this.chartData, hours);
                this.predictions[hours] = result;
            }

            console.log('Linear regression predictions:', this.predictions);

        } catch (error) {
            console.error('Linear regression analysis failed:', error);
            throw error;
        }
    }

    /**
     * Create electricity consumption chart
     */
    createElectricityChart() {
        const canvas = document.getElementById('electricityAnalysisChart');
        if (!canvas) {
            console.error('Chart canvas not found');
            return;
        }

        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        // Prepare chart data
        const labels = this.chartData.map(item => item.waktu_formatted);
        const powerData = this.chartData.map(item => item.daya);

        // Add prediction point
        const prediction24h = this.predictions[24];
        if (prediction24h) {
            labels.push('Prediksi 24h');
            powerData.push(prediction24h.prediction);
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Konsumsi Listrik (W)',
                    data: powerData.slice(0, -1), // Exclude prediction from main line
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Prediksi Linear Regression',
                    data: [null, null, null, null, null, null, null, null,
                        null, null, null, null, null, null, null, null,
                        null, null, null, null, null, null, null, powerData[powerData.length - 1]],
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                    pointBorderColor: 'rgba(255, 99, 132, 1)',
                    pointRadius: 6,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: this.analysisConfig.charts.animation ? 1000 : 0
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Analisis Konsumsi Listrik dengan Linear Regression',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
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
                            text: 'Waktu'
                        }
                    }
                }
            }
        });
    }

    /**
     * Update summary statistics
     */
    updateSummaryStatistics() {
        try {
            // Calculate current statistics
            const currentData = this.chartData.map(item => item.daya);
            const avgPower = currentData.reduce((sum, val) => sum + val, 0) / currentData.length;
            const maxPower = Math.max(...currentData);
            const minPower = Math.min(...currentData);

            // Get 24h prediction
            const prediction24h = this.predictions[24] || { prediction: 0 };

            // Update DOM elements
            this.updateElementText('avgPowerConsumption', `${Math.round(avgPower)} W`);
            this.updateElementText('maxPowerConsumption', `${maxPower} W`);
            this.updateElementText('minPowerConsumption', `${minPower} W`);
            this.updateElementText('prediction24h', `${prediction24h.prediction} W`);

            // Update algorithm info
            this.updateElementText('algorithmUsed', 'Linear Regression');

            console.log('Summary statistics updated');

        } catch (error) {
            console.error('Failed to update summary statistics:', error);
        }
    }

    /**
     * Update element text safely
     */
    updateElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        const chartContainer = document.getElementById('electricityAnalysisChart');
        if (chartContainer) {
            const parentElement = chartContainer.parentElement;
            if (parentElement) {
                parentElement.innerHTML = `
                    <div class="text-center p-4">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-2">Memuat analisis Linear Regression...</p>
                    </div>
                `;
            }
        }
    }

    /**
     * Show error state
     */
    showErrorState(message) {
        const chartContainer = document.getElementById('electricityAnalysisChart');
        if (chartContainer) {
            const parentElement = chartContainer.parentElement;
            if (parentElement) {
                parentElement.innerHTML = `
                    <div class="text-center p-4">
                        <div class="alert alert-danger" role="alert">
                            <i class="fas fa-exclamation-triangle"></i>
                            ${message}
                        </div>
                        <button class="btn btn-primary" onclick="location.reload()">
                            <i class="fas fa-redo"></i> Muat Ulang
                        </button>
                    </div>
                `;
            }
        }
    }

    /**
     * Export analysis results
     */
    exportResults() {
        const results = {
            timestamp: new Date().toISOString(),
            algorithm: 'Linear Regression',
            data: this.chartData,
            predictions: this.predictions,
            summary: {
                avgPower: this.chartData.reduce((sum, item) => sum + item.daya, 0) / this.chartData.length,
                maxPower: Math.max(...this.chartData.map(item => item.daya)),
                minPower: Math.min(...this.chartData.map(item => item.daya))
            }
        };

        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `electricity-analysis-linear-regression-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Refresh analysis
     */
    async refresh() {
        console.log('Refreshing Linear Regression analysis...');
        await this.loadElectricityData();
    }
}

// Make Linear Regression calculator available globally
window.ElectricityLinearRegressionCalculator = ElectricityLinearRegressionCalculator;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    // Check if we should initialize the calculator
    if (document.getElementById('electricityAnalysisChart')) {
        console.log('Initializing Electricity Linear Regression Calculator...');

        // Initialize with slight delay to ensure all dependencies are loaded
        setTimeout(() => {
            window.electricityCalculator = new ElectricityLinearRegressionCalculator();
        }, 1000);
    }
});
