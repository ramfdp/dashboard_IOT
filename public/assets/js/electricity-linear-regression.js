class LinearRegressionPredictor {
    constructor() {
        this.isInitialized = false;
    }

    async predict(historicalData, targetHours = 24) {
        try {
            if (!historicalData || historicalData.length < 3) {
                return {
                    prediction: 0
                };
            }

            const dataPoints = historicalData.map((item, index) => [
                index,
                parseFloat(item.daya) || parseFloat(item.power) || 0
            ]);

            const result = regression.linear(dataPoints);

            const futureX = dataPoints.length + (targetHours / 24) * dataPoints.length;
            const prediction = result.predict(futureX)[1];

            const adjustedPrediction = Math.max(50, Math.min(800, Math.abs(prediction)));

            return {
                prediction: Math.round(adjustedPrediction),
                equation: result.string,
                r2: result.r2
            };
        } catch (error) {
            console.warn('Linear regression prediction failed:', error.message);
            return {
                prediction: 250,
                equation: 'N/A',
                r2: 0
            };
        }
    }
}

class ElectricityLinearRegressionCalculator {
    constructor(chartManager = null) {
        this.isInitialized = false;
        this.chart = null;
        this.chartData = [];
        this.chartManager = chartManager;
        this.linearPredictor = null;
        this.predictions = {};

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
        if (this.chartManager && this.chartManager.chart) {
            try {
                this.chartManager.chart.destroy();
                console.log('[LinearRegression] Existing Chart.js instance destroyed');
            } catch (error) {
                console.log('[LinearRegression] No existing chart to destroy');
            }
        }

        this.showLoadingState();

        setTimeout(async () => {
            await this.initializeLinearRegressionModel();
        }, 500);
    }

    async initializeLinearRegressionModel() {
        try {
            this.linearPredictor = new LinearRegressionPredictor();
            console.log('[LinearRegression] Predictor initialized successfully');
            this.isInitialized = true;
            this.loadElectricityData();
        } catch (error) {
            console.error('[LinearRegression] Failed to initialize model:', error);
            this.showErrorState('Failed to initialize prediction model');
        }
    }

    async loadElectricityData() {
        try {
            this.showLoadingState();

            const electricityData = await this.getElectricityData();

            if (!electricityData || electricityData.length === 0) {
                console.warn('[LinearRegression] No data available from API or fallback data sources');
                this.showErrorState('No electricity data available. Please ensure data sources are accessible.');
                return;
            }

            this.chartData = electricityData;
            await this.performLinearRegressionAnalysis();
            this.createElectricityChart();
            this.updateSummaryStatistics();

            console.log('[LinearRegression] Analysis completed successfully');

        } catch (error) {
            console.error('[LinearRegression] Failed to load electricity data:', error);
            this.showErrorState('Failed to load electricity data: ' + error.message);
        }
    }

    async getElectricityData() {
        try {
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
            console.warn('[LinearRegression] API data not available, using fallback data source:', error);
        }

        return this.getFallbackElectricityData();
    }

    getFallbackElectricityData() {
        if (window.autoPZEMGenerator) {
            // console.log('[LinearRegression] Using fallback data source from system generator');

            if (typeof window.autoPZEMGenerator.generateRealisticFallbackData === 'function') {
                const fallbackData = window.autoPZEMGenerator.generateRealisticFallbackData(24); // 24 data points for 24 hours

                return fallbackData.data.map((power, index) => {
                    const label = fallbackData.labels[index];
                    const now = new Date();
                    const [hours, minutes] = label.split(':').map(Number);
                    const timeDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

                    return {
                        waktu: timeDate.toISOString(),
                        daya: power,
                        waktu_formatted: label
                    };
                });
            }

            if (window.autoPZEMGenerator.currentData) {
                const currentData = window.autoPZEMGenerator.currentData;
                const now = new Date();

                console.log('[LinearRegression] Using single current data point as fallback');
                return [{
                    waktu: now.toISOString(),
                    daya: parseFloat(currentData.power) || 0,
                    waktu_formatted: now.toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                }];
            }
        }

        console.warn('[LinearRegression] No fallback data source available, returning empty data');
        return [];
    }

    async performLinearRegressionAnalysis() {
        if (!this.linearPredictor || !this.chartData) {
            throw new Error('Linear regression predictor or data not available');
        }

        try {
            this.predictions = {};

            for (const hours of this.analysisConfig.predictions.hours) {
                const result = await this.linearPredictor.predict(this.chartData, hours);
                this.predictions[hours] = result;
            }

            console.log('[LinearRegression] Predictions calculated:', this.predictions);

        } catch (error) {
            console.error('[LinearRegression] Analysis failed:', error);
            throw error;
        }
    }

    createElectricityChart() {
        const canvas = document.getElementById('electricityAnalysisChart');
        if (!canvas) {
            console.error('[LinearRegression] Chart canvas not found');
            return;
        }

        const ctx = canvas.getContext('2d');

        if (this.chart) {
            this.chart.destroy();
        }

        const labels = this.chartData.map(item => item.waktu_formatted);
        const powerData = this.chartData.map(item => item.daya);

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
                    data: powerData.slice(0, -1),
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Prediksi Linear Regression',
                    data: Array(powerData.length - 1).fill(null).concat([powerData[powerData.length - 1]]),
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

    updateSummaryStatistics() {
        try {
            const currentData = this.chartData.map(item => item.daya);
            const avgPower = currentData.reduce((sum, val) => sum + val, 0) / currentData.length;
            const maxPower = Math.max(...currentData);
            const minPower = Math.min(...currentData);

            const prediction24h = this.predictions[24] || { prediction: 0, r2: 0 };

            this.updateElementText('avgPowerConsumption', `${Math.round(avgPower)} W`);
            this.updateElementText('maxPowerConsumption', `${maxPower} W`);
            this.updateElementText('minPowerConsumption', `${minPower} W`);
            this.updateElementText('prediction24h', `${prediction24h.prediction} W`);

            const r2Percentage = (prediction24h.r2 * 100).toFixed(1);
            this.updateElementText('algorithmUsed', `Linear Regression (R² ${r2Percentage}%)`);

            if (prediction24h.equation) {
                this.updateElementText('regressionEquation', prediction24h.equation);
            }

            console.log('[LinearRegression] Summary statistics updated');

        } catch (error) {
            console.error('[LinearRegression] Failed to update summary statistics:', error);
        }
    }

    updateElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    }

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

    async refresh() {
        console.log('[LinearRegression] Refreshing analysis...');
        await this.loadElectricityData();
    }
}

function initializeLinearRegressionIntegration() {
    console.log('[Dashboard] Initializing Linear Regression integration...');

    if (typeof window.ElectricityLinearRegressionCalculator !== 'undefined') {
        updatePredictionDisplay();
        setInterval(updatePredictionDisplay, 30000);
        console.log('[Dashboard] Linear Regression integration ready');
    } else {
        console.warn('[Dashboard] Linear Regression calculator not available, retrying...');
        setTimeout(initializeLinearRegressionIntegration, 1000);
    }
}

async function updatePredictionDisplay() {
    try {
        if (!window.electricityCalculator || !window.electricityCalculator.linearPredictor) {
            console.log('[Dashboard] Linear Regression predictor not ready yet');
            return;
        }

        const currentData = window.electricityCalculator.chartData || [];

        if (currentData.length > 0) {
            const prediction = await window.electricityCalculator.linearPredictor.predict(currentData, 24);
            updatePredictionUI(prediction);
            console.log('[Dashboard] Prediction updated:', prediction);
        }

    } catch (error) {
        console.error('[Dashboard] Failed to update prediction:', error);
    }
}

function updatePredictionUI(prediction) {
    try {
        const prediksiWatt = document.getElementById('prediksiWatt');
        if (prediksiWatt) {
            prediksiWatt.textContent = `${prediction.prediction} W`;
        }

        const dailyEnergy = (prediction.prediction * 24 / 1000).toFixed(2);
        const prediksiKwhHarian = document.getElementById('prediksiKwhHarian');
        if (prediksiKwhHarian) {
            prediksiKwhHarian.textContent = `${dailyEnergy} kWh`;
        }

    } catch (error) {
        console.error('[Dashboard] Failed to update prediction UI:', error);
    }
}

function showElectricityAnalysis() {
    if (window.electricityCalculator) {
        window.electricityCalculator.refresh();
    }

    const modal = new bootstrap.Modal(document.getElementById('electricityAnalysisModal'));
    modal.show();
}

function exportLinearRegressionResults() {
    if (window.electricityCalculator && typeof window.electricityCalculator.exportResults === 'function') {
        window.electricityCalculator.exportResults();
    } else {
        console.warn('[Dashboard] Export function not available');
        alert('Fitur export belum tersedia. Silakan coba lagi nanti.');
    }
}

window.LinearRegressionPredictor = LinearRegressionPredictor;
window.ElectricityLinearRegressionCalculator = ElectricityLinearRegressionCalculator;
window.showElectricityAnalysis = showElectricityAnalysis;
window.exportLinearRegressionResults = exportLinearRegressionResults;
window.updatePredictionDisplay = updatePredictionDisplay;

document.addEventListener('DOMContentLoaded', function () {
    console.log('[LinearRegression] Unified script loaded');

    if (document.getElementById('electricityAnalysisChart')) {
        console.log('[LinearRegression] Initializing Electricity Calculator...');

        setTimeout(() => {
            window.electricityCalculator = new ElectricityLinearRegressionCalculator();
        }, 1000);
    }

    setTimeout(initializeLinearRegressionIntegration, 1500);
});

console.log('[LinearRegression] Unified Linear Regression module loaded successfully');