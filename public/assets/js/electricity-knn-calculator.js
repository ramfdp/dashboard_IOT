/**
 * Electricity KNN Calculator dengan TensorFlow.js
 * Menggantikan sistem prediksi sebelumnya dengan model KNN
 */

// Global KNN Predictor class for modal integration
class TensorFlowKNNPredictor {
    constructor() {
        this.model = null;
        this.isReady = false;
    }

    /**
     * Simple KNN prediction based on historical data
     */
    predict(trainingData, k = 3) {
        try {
            if (!trainingData || trainingData.length < k) {
                throw new Error('Insufficient training data');
            }

            // Get the latest data point as reference
            const latestPoint = trainingData[trainingData.length - 1];
            const currentValue = latestPoint.output;

            // Calculate distances to all training points
            const distances = trainingData.slice(0, -1).map((point, index) => {
                const distance = Math.abs(point.output - currentValue);
                return { index, distance, value: point.output };
            });

            // Sort by distance and take k nearest neighbors
            distances.sort((a, b) => a.distance - b.distance);
            const kNearest = distances.slice(0, Math.min(k, distances.length));

            // Calculate prediction as weighted average
            let totalWeight = 0;
            let weightedSum = 0;

            kNearest.forEach(neighbor => {
                const weight = neighbor.distance === 0 ? 1 : 1 / (neighbor.distance + 0.1);
                totalWeight += weight;
                weightedSum += neighbor.value * weight;
            });

            const prediction = weightedSum / totalWeight;

            // Calculate confidence based on variance of k-nearest neighbors
            const variance = kNearest.reduce((sum, neighbor) =>
                sum + Math.pow(neighbor.value - prediction, 2), 0) / kNearest.length;
            const confidence = Math.max(60, Math.min(95, 90 - Math.sqrt(variance) / 10));

            return {
                value: Math.round(prediction),
                confidence: confidence,
                neighbors: kNearest.length
            };

        } catch (error) {
            console.warn('KNN prediction failed:', error.message);
            return {
                value: null,
                confidence: 50,
                error: error.message
            };
        }
    }
}

// Make KNN predictor available globally
window.TensorFlowKNNPredictor = TensorFlowKNNPredictor;

class ElectricityKNNCalculator {
    constructor(chartCanvas) {
        this.canvas = chartCanvas;
        this.chart = null;
        this.data = {
            labels: [],
            values: [],
            timestamps: []
        };

        // Initialize KNN predictor
        this.knnPredictor = null;
        this.isModelReady = false;
        this.isTraining = false;

        // Configuration
        this.config = {
            minDataPoints: 12,
            maxPredictionHours: 72,
            trainingThreshold: 24 // Minimum data points for training
        };

        // Use ChartManager for safer chart handling
        if (window.ChartManager && this.canvas) {
            window.ChartManager.destroyChartsOnCanvas(this.canvas);
            console.log('ChartManager used for KNN calculator initialization');
        } else {
            // Fallback to manual destruction
            this.destroyExistingChart();
        }

        this.initializeComponents();
    }

    /**
     * Destroy existing chart instances on this canvas
     */
    destroyExistingChart() {
        if (this.canvas) {
            // Check for existing Chart.js instances
            const existingChart = Chart.getChart(this.canvas);
            if (existingChart) {
                existingChart.destroy();
                console.log('Existing Chart.js instance destroyed before creating new KNN calculator');
            }
        }
    }

    /**
     * Initialize all components
     */
    async initializeComponents() {
        this.initializeChart();
        this.setupEventListeners();
        await this.initializeKNNModel();
    }

    /**
     * Initialize KNN model
     */
    async initializeKNNModel() {
        try {
            // Wait for TensorFlow KNN Predictor to be available
            const waitForKNN = () => {
                if (typeof TensorFlowKNNPredictor !== 'undefined') {
                    this.knnPredictor = new TensorFlowKNNPredictor();
                    this.checkModelReadiness();
                } else {
                    setTimeout(waitForKNN, 100);
                }
            };
            waitForKNN();
        } catch (error) {
            console.error('Error initializing KNN model:', error);
        }
    }

    /**
     * Check if model is ready for use
     */
    checkModelReadiness() {
        const checkReady = () => {
            if (this.knnPredictor && this.knnPredictor.isModelReady) {
                this.isModelReady = true;
                console.log('Model KNN siap digunakan');
            } else {
                setTimeout(checkReady, 100);
            }
        };
        checkReady();
    }

    /**
     * Initialize the chart
     */
    initializeChart() {
        if (!this.canvas) {
            console.error('Canvas chart tidak ditemukan');
            return;
        }

        // Parse data from canvas attributes
        this.data.labels = JSON.parse(this.canvas.dataset.labels || '[]');
        this.data.values = JSON.parse(this.canvas.dataset.values || '[]').map(parseFloat);
        this.data.timestamps = this.generateTimestamps();

        console.log('[KNN Chart] Data loaded:', {
            labels: this.data.labels,
            values: this.data.values,
            labelsCount: this.data.labels.length,
            valuesCount: this.data.values.length
        });

        // If no data available, create demo data
        if (this.data.labels.length === 0 || this.data.values.length === 0) {
            console.log('[KNN Chart] No data found, creating demo data...');
            this.createDemoData();
        }

        const ctx = this.canvas.getContext('2d');
        const gradient = this.createGradient(ctx);

        const chartConfig = {
            type: 'line',
            data: {
                labels: this.data.labels,
                datasets: [{
                    label: 'Daya Aktual (W)',
                    data: this.data.values,
                    borderColor: '#00d4ff',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#00d4ff',
                    pointRadius: 3,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        labels: { color: '#ffffff' }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#00d4ff',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        ticks: { 
                            color: '#ffffff',
                            maxTicksLimit: 12, // Limit jumlah label yang ditampilkan
                            callback: function(value, index, values) {
                                // Tampilkan setiap 2 label untuk mengurangi kesesakan
                                if (index % 2 === 0 || index === values.length - 1) {
                                    return this.getLabelForValue(value);
                                }
                                return '';
                            }
                        },
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        title: {
                            display: true,
                            text: 'Waktu',
                            color: '#ffffff'
                        }
                    },
                    y: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        title: {
                            display: true,
                            text: 'Daya (Watt)',
                            color: '#ffffff'
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        };

        // Use ChartManager for safer chart creation
        if (window.ChartManager) {
            this.chart = window.ChartManager.createChart(this.canvas, chartConfig);
            console.log('KNN Calculator chart created with ChartManager');
        } else {
            // Fallback to direct Chart.js creation
            this.chart = new Chart(ctx, chartConfig);
            console.log('KNN Calculator chart created directly');
        }
    }

    /**
     * Create demo data when no real data is available
     */
    createDemoData() {
        const now = new Date();
        const demoLabels = [];
        const demoValues = [];

        for (let i = 0; i < 24; i++) {
            const time = new Date(now);
            time.setHours(i, 0, 0, 0);
            demoLabels.push(time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));

            // Create realistic power consumption pattern
            let power;
            if (i >= 6 && i <= 8) {
                // Morning peak
                power = 150 + Math.random() * 100;
            } else if (i >= 9 && i <= 17) {
                // Office hours
                power = 200 + Math.random() * 100;
            } else if (i >= 18 && i <= 22) {
                // Evening
                power = 100 + Math.random() * 80;
            } else {
                // Night/early morning
                power = 50 + Math.random() * 70;
            }

            demoValues.push(Math.round(power));
        }

        this.data.labels = demoLabels;
        this.data.values = demoValues;
        this.data.timestamps = this.generateTimestamps();

        console.log('[KNN Chart] Demo data created:', {
            labels: demoLabels.length,
            values: demoValues.length,
            sampleValues: demoValues.slice(0, 5)
        });
    }

    /**
     * Create gradient for chart
     */
    createGradient(ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 212, 255, 0.05)');
        return gradient;
    }

    /**
     * Generate timestamps for data
     */
    generateTimestamps() {
        const now = new Date();
        return this.data.labels.map((_, index) => {
            const time = new Date(now);
            time.setHours(time.getHours() - (this.data.labels.length - index - 1));
            return time;
        });
    }

    /**
     * Train KNN model with current data
     */
    async trainKNNModel() {
        if (!this.isModelReady || this.isTraining) {
            console.log('Model belum siap atau sedang training');
            return false;
        }

        if (this.data.values.length < this.config.trainingThreshold) {
            console.log(`Perlu minimal ${this.config.trainingThreshold} data untuk training`);
            return false;
        }

        try {
            this.isTraining = true;

            // Show training indicator
            this.showTrainingIndicator();

            // Train model asynchronously
            const trainingResult = await this.knnPredictor.trainModel(this.data.values);

            console.log('Training selesai:', trainingResult);
            this.isTraining = false;

            // Hide training indicator
            this.hideTrainingIndicator();

            return true;
        } catch (error) {
            console.error('Error training model:', error);
            this.isTraining = false;
            this.hideTrainingIndicator();
            return false;
        }
    }

    /**
     * Generate predictions using KNN model
     */
    async generateKNNPredictions(hoursAhead = 24) {
        if (!this.isModelReady) {
            return {
                error: 'Model TensorFlow.js belum siap',
                message: 'Silakan tunggu beberapa saat untuk inisialisasi model'
            };
        }

        // Train model if needed
        const isModelTrained = await this.trainKNNModel();
        if (!isModelTrained) {
            return {
                error: 'Model tidak dapat dilatih',
                message: `Perlu minimal ${this.config.trainingThreshold} titik data untuk prediksi`
            };
        }

        try {
            // Show prediction indicator
            this.showPredictionIndicator();

            // Generate predictions asynchronously
            const predictions = await this.knnPredictor.predict(this.data.values, hoursAhead);

            // Hide prediction indicator
            this.hidePredictionIndicator();

            return predictions;
        } catch (error) {
            console.error('Error generating predictions:', error);
            this.hidePredictionIndicator();
            return {
                error: 'Gagal membuat prediksi',
                message: error.message
            };
        }
    }

    /**
     * Calculate basic statistics
     */
    calculateBasicStats() {
        if (this.data.values.length === 0) {
            return {
                current: 0,
                average: 0,
                max: 0,
                min: 0,
                total_energy: 0
            };
        }

        const values = this.data.values.filter(v => v != null && !isNaN(v));
        const current = values[values.length - 1] || 0;
        const average = values.reduce((sum, val) => sum + val, 0) / values.length;
        const max = Math.max(...values);
        const min = Math.min(...values);
        const total_energy = (average * values.length) / 1000; // Convert to kWh

        return {
            current: Math.round(current * 100) / 100,
            average: Math.round(average * 100) / 100,
            max: Math.round(max * 100) / 100,
            min: Math.round(min * 100) / 100,
            total_energy: Math.round(total_energy * 100) / 100
        };
    }

    /**
     * Display enhanced calculations using KNN
     */
    async displayEnhancedCalculations(periode = 'harian') {
        if (!this.data.values.length) {
            return this.displayEmptyState();
        }

        // Calculate basic statistics
        const stats = this.calculateBasicStats();
        const periodHours = this.getPeriodHours(periode);

        // Update basic display
        this.updateBasicDisplay(stats, periodHours, periode);

        // Generate KNN predictions
        const prediction = await this.generateKNNPredictions(24);

        // Update prediction display
        if (!prediction.error) {
            this.updatePredictionDisplay(prediction);
            this.displayKNNMetrics(prediction);
            this.displayRecommendations(stats, prediction);
        } else {
            this.displayPredictionError(prediction);
        }

        // Update summary
        this.updateSummaryDisplay(stats, prediction, periode);
    }

    /**
     * Update basic statistics display
     */
    updateBasicDisplay(stats, periodHours, periode) {
        // Update power and energy values
        document.getElementById('totalWatt').textContent = `${stats.current} W`;
        document.getElementById('totalKwh').textContent = `${(stats.average * periodHours / 1000).toFixed(2)} kWh`;

        // Update detailed statistics
        document.getElementById('dayaTertinggi').textContent = `${stats.max} W`;
        document.getElementById('dayaTerendah').textContent = `${stats.min} W`;
        document.getElementById('totalData').textContent = this.data.values.length;

        // Update energy calculations for different periods
        document.getElementById('kwhHarian').textContent = `${(stats.average * 24 / 1000).toFixed(2)} kWh`;
        document.getElementById('kwhMingguan').textContent = `${(stats.average * 24 * 7 / 1000).toFixed(2)} kWh`;
        document.getElementById('kwhBulanan').textContent = `${(stats.average * 24 * 30 / 1000).toFixed(2)} kWh`;

        // Update period label
        const labels = { harian: 'per hari', mingguan: 'per minggu', bulanan: 'per bulan' };
        document.getElementById('periodeLabel').textContent = labels[periode] || 'per hari';
    }

    /**
     * Update prediction display
     */
    updatePredictionDisplay(prediction) {
        if (prediction.predictions && prediction.predictions.length > 0) {
            const nextHour = prediction.predictions[0];
            const summary = prediction.summary;

            document.getElementById('prediksiWatt').textContent = `${nextHour.predicted_power} W`;
            document.getElementById('prediksiKwhHarian').textContent = `${summary.next_24h_energy} kWh`;

            // Update confidence
            const confidence = Math.round(summary.average_confidence * 100);
            const confidenceElement = document.getElementById('confidenceLevel');
            const confidencePercentage = document.getElementById('confidencePercentage');

            if (confidenceElement) {
                confidenceElement.textContent = `${confidence}%`;
                confidenceElement.className = `badge ${this.getConfidenceBadgeClass(confidence)}`;
            }

            if (confidencePercentage) {
                confidencePercentage.textContent = `${confidence}%`;
            }

            // Update confidence indicator
            this.updateConfidenceIndicator(confidence);
        }
    }

    /**
     * Display KNN specific metrics
     */
    displayKNNMetrics(prediction) {
        const metricsContainer = document.getElementById('efficiencyMetrics');
        if (metricsContainer && prediction.model_info) {
            const info = prediction.model_info;
            metricsContainer.innerHTML = `
                <div class="row text-center">
                    <div class="col-6">
                        <h6>${info.k_value}</h6>
                        <small>K Value</small>
                    </div>
                    <div class="col-6">
                        <h6>${info.training_samples}</h6>
                        <small>Sampel Training</small>
                    </div>
                </div>
                <div class="row text-center mt-2">
                    <div class="col-6">
                        <h6>${info.sequence_length}</h6>
                        <small>Panjang Sekuens</small>
                    </div>
                    <div class="col-6">
                        <h6>${info.feature_size}</h6>
                        <small>Jumlah Fitur</small>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Display prediction error
     */
    displayPredictionError(prediction) {
        const errorContainer = document.getElementById('efficiencyMetrics');
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="alert alert-warning">
                    <small><i class="fa fa-exclamation-triangle me-1"></i>
                    ${prediction.message || 'Gagal membuat prediksi'}</small>
                </div>
            `;
        }

        // Reset prediction values
        document.getElementById('prediksiWatt').textContent = '-';
        document.getElementById('prediksiKwhHarian').textContent = '-';
        document.getElementById('confidenceLevel').textContent = '-';
        document.getElementById('confidencePercentage').textContent = '--%';
    }

    /**
     * Get confidence badge class
     */
    getConfidenceBadgeClass(confidence) {
        if (confidence >= 80) return 'bg-success';
        if (confidence >= 60) return 'bg-warning';
        return 'bg-danger';
    }

    /**
     * Update confidence indicator
     */
    updateConfidenceIndicator(confidence) {
        const indicator = document.getElementById('confidenceIndicator');
        if (indicator) {
            const circle = indicator.querySelector('.confidence-circle');
            if (circle) {
                circle.style.background = `conic-gradient(
                    ${this.getConfidenceColor(confidence)} ${confidence * 3.6}deg,
                    rgba(255,255,255,0.1) ${confidence * 3.6}deg
                )`;
            }
        }
    }

    /**
     * Get confidence color
     */
    getConfidenceColor(confidence) {
        if (confidence >= 80) return '#28a745';
        if (confidence >= 60) return '#ffc107';
        return '#dc3545';
    }

    /**
     * Show training indicator
     */
    showTrainingIndicator() {
        const summary = document.getElementById('perhitunganSummary');
        if (summary) {
            summary.innerHTML = '<i class="fa fa-spinner fa-spin me-2"></i>Training model KNN...';
        }
    }

    /**
     * Hide training indicator
     */
    hideTrainingIndicator() {
        // Will be updated by updateSummaryDisplay
    }

    /**
     * Show prediction indicator
     */
    showPredictionIndicator() {
        const summary = document.getElementById('perhitunganSummary');
        if (summary) {
            summary.innerHTML = '<i class="fa fa-spinner fa-spin me-2"></i>Membuat prediksi...';
        }
    }

    /**
     * Hide prediction indicator
     */
    hidePredictionIndicator() {
        // Will be updated by updateSummaryDisplay
    }

    /**
     * Get period hours
     */
    getPeriodHours(periode) {
        const periods = { harian: 24, mingguan: 168, bulanan: 720 };
        return periods[periode] || 24;
    }

    /**
     * Display recommendations
     */
    displayRecommendations(stats, prediction) {
        const container = document.getElementById('recommendations');
        if (!container) return;

        const recommendations = [];

        // KNN specific recommendations
        if (prediction && !prediction.error) {
            const avgConfidence = prediction.summary?.average_confidence || 0;

            if (avgConfidence > 0.8) {
                recommendations.push({
                    icon: 'fa-check-circle',
                    type: 'success',
                    title: 'Prediksi Berkualitas Tinggi',
                    text: 'Model KNN memberikan prediksi dengan confidence tinggi.'
                });
            } else if (avgConfidence > 0.6) {
                recommendations.push({
                    icon: 'fa-info-circle',
                    type: 'info',
                    title: 'Prediksi Cukup Akurat',
                    text: 'Tambahkan lebih banyak data untuk meningkatkan akurasi.'
                });
            } else {
                recommendations.push({
                    icon: 'fa-exclamation-triangle',
                    type: 'warning',
                    title: 'Prediksi Kurang Akurat',
                    text: 'Kumpulkan lebih banyak data historis untuk training yang lebih baik.'
                });
            }
        }

        // Power usage recommendations
        if (stats.current > stats.average * 1.2) {
            recommendations.push({
                icon: 'fa-bolt',
                type: 'warning',
                title: 'Penggunaan Tinggi',
                text: 'Penggunaan saat ini di atas rata-rata. Pertimbangkan optimalisasi.'
            });
        }

        container.innerHTML = recommendations.map(rec => `
            <div class="alert alert-${rec.type} d-flex align-items-center mb-2">
                <i class="fa ${rec.icon} me-2"></i>
                <div>
                    <strong>${rec.title}</strong><br>
                    <small>${rec.text}</small>
                </div>
            </div>
        `).join('');
    }

    /**
     * Update summary display
     */
    updateSummaryDisplay(stats, prediction, periode) {
        const summary = document.getElementById('perhitunganSummary');
        if (summary) {
            const modelStatus = this.knnPredictor ? this.knnPredictor.getModelStatus() : {};

            summary.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <strong>Statistik Dasar:</strong><br>
                        <small>Daya Rata-rata: ${stats.average} W</small><br>
                        <small>Total Data: ${this.data.values.length} titik</small><br>
                        <small>Periode: ${periode}</small>
                    </div>
                    <div class="col-md-6">
                        <strong>Model KNN:</strong><br>
                        <small>Status: ${modelStatus.isReady ? 'Siap' : 'Loading...'}</small><br>
                        <small>Training: ${modelStatus.isTrained ? 'Ya' : 'Belum'}</small><br>
                        <small>TensorFlow: ${modelStatus.tensorflowVersion || 'Loading...'}</small>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Display empty state
     */
    displayEmptyState() {
        const summary = document.getElementById('perhitunganSummary');
        if (summary) {
            summary.innerHTML = `
                <div class="alert alert-info">
                    <i class="fa fa-info-circle me-2"></i>
                    Tidak ada data untuk dianalisis. Pastikan sensor PZEM terhubung dan mengumpulkan data.
                </div>
            `;
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const modal = new bootstrap.Modal(document.getElementById('modalPerhitunganListrik'));
        const showButton = document.getElementById('btnLihatPerhitungan');
        const periodSelect = document.getElementById('periodePerhitungan');
        const predictionSelect = document.getElementById('periodePrediksi');

        if (showButton) {
            showButton.addEventListener('click', async () => {
                await this.displayEnhancedCalculations(periodSelect?.value || 'harian');
                modal.show();
            });
        }

        if (periodSelect) {
            periodSelect.addEventListener('change', async () => {
                await this.displayEnhancedCalculations(periodSelect.value);
            });
        }

        // Prediction period selection
        if (predictionSelect) {
            predictionSelect.addEventListener('change', async () => {
                const hours = parseInt(predictionSelect.value) || 24;
                const prediction = await this.generateKNNPredictions(hours);
                if (!prediction.error) {
                    this.updatePredictionDisplay(prediction);
                }
            });
        }
    }
}

// Initialize the calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for all scripts to load
    setTimeout(() => {
        const canvas = document.getElementById('wattChart');
        console.log('[KNN Calculator] Canvas found:', !!canvas);
        if (canvas) {
            console.log('[KNN Calculator] Canvas data attributes:', {
                labels: canvas.dataset.labels,
                values: canvas.dataset.values,
                labelsLength: canvas.dataset.labels ? JSON.parse(canvas.dataset.labels).length : 0,
                valuesLength: canvas.dataset.values ? JSON.parse(canvas.dataset.values).length : 0
            });

            // Destroy existing chart if it exists - comprehensive cleanup
            const canvasContext = canvas.getContext('2d');

            // Check for existing Chart.js instances
            if (Chart.getChart(canvas)) {
                Chart.getChart(canvas).destroy();
                console.log('Existing Chart.js instance destroyed');
            }

            // Clear any global chart references
            if (window.electricityChart) {
                if (typeof window.electricityChart.destroy === 'function') {
                    window.electricityChart.destroy();
                }
                window.electricityChart = null;
                console.log('Previous electricity chart destroyed');
            }

            if (window.electricityCalculator && window.electricityCalculator.chart) {
                if (typeof window.electricityCalculator.chart.destroy === 'function') {
                    window.electricityCalculator.chart.destroy();
                }
                window.electricityCalculator.chart = null;
                console.log('Previous electricity calculator chart destroyed');
            }

            if (window.electricityKNNCalculator && window.electricityKNNCalculator.chart) {
                if (typeof window.electricityKNNCalculator.chart.destroy === 'function') {
                    window.electricityKNNCalculator.chart.destroy();
                }
                window.electricityKNNCalculator.chart = null;
                console.log('Previous KNN calculator chart destroyed');
            }

            // Clear the canvas manually
            canvasContext.clearRect(0, 0, canvas.width, canvas.height);

            // Reset canvas size to trigger re-initialization
            canvas.style.width = '';
            canvas.style.height = '';

            window.electricityKNNCalculator = new ElectricityKNNCalculator(canvas);
            console.log('Electricity KNN Calculator initialized');
        }
    }, 1000); // Increased timeout to ensure other scripts load first
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ElectricityKNNCalculator;
}
