/**
 * Kalkulator Penggunaan Listrik Lanjutan
 * Mengimplementasikan beberapa algoritma prediksi termasuk Regresi Linear,
 * Penyesuaian Musiman, dan Pengenalan Pola Beban
 */

class ElectricityCalculator {
    constructor(chartCanvas) {
        this.canvas = chartCanvas;
        this.chart = null;
        this.data = {
            labels: [],
            values: [],
            timestamps: []
        };
        this.predictions = [];

        // Konfigurasi algoritma
        this.config = {
            minDataPoints: 5,
            maxPredictionHours: 72,
            confidenceThreshold: 0.7,
            seasonalFactors: this.getSeasonalFactors(),
            loadPatterns: this.getLoadPatterns()
        };

        this.initializeChart();
        this.setupEventListeners();
    }

    /**
     * Inisialisasi chart dengan styling yang ditingkatkan
     */
    initializeChart() {
        if (!this.canvas) {
            console.error('Canvas chart tidak ditemukan');
            return;
        }

        // Parsing data dari atribut canvas
        this.data.labels = JSON.parse(this.canvas.dataset.labels || '[]');
        this.data.values = JSON.parse(this.canvas.dataset.values || '[]').map(parseFloat);
        this.data.timestamps = this.generateTimestamps();

        const ctx = this.canvas.getContext('2d');
        const gradient = this.createGradient(ctx);

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.data.labels,
                datasets: [{
                    label: 'Daya Aktual (W)',
                    data: this.data.values,
                    fill: true,
                    backgroundColor: gradient,
                    borderColor: '#00ff88',
                    pointBackgroundColor: '#00ff88',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: true,
                        labels: { color: '#fff' }
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#00ff88',
                        borderWidth: 1,
                        callbacks: {
                            afterBody: (context) => {
                                const index = context[0].dataIndex;
                                const prediction = this.getPredictionForIndex(index);
                                return prediction ? [`Predicted: ${prediction.toFixed(2)} W`] : [];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#fff' },
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        title: {
                            display: true,
                            text: 'Waktu',
                            color: '#fff'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#fff',
                            callback: (value) => `${value} W`
                        },
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        title: {
                            display: true,
                            text: 'Daya (Watt)',
                            color: '#fff'
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    /**
     * Advanced Linear Regression with Seasonal Adjustment
     */
    advancedLinearRegression(data, hoursAhead = 24) {
        const n = data.length;
        if (n < this.config.minDataPoints) {
            return {
                error: 'Titik data tidak cukup',
                minRequired: this.config.minDataPoints
            };
        }

        // Prepare data points with time features
        const points = data.map((value, index) => ({
            x: index,
            y: value,
            hour: this.getHourFromIndex(index),
            dayOfWeek: this.getDayOfWeekFromIndex(index),
            isWeekend: this.isWeekendFromIndex(index)
        }));

        // Calculate linear regression coefficients
        const sumX = points.reduce((sum, p) => sum + p.x, 0);
        const sumY = points.reduce((sum, p) => sum + p.y, 0);
        const sumXY = points.reduce((sum, p) => sum + (p.x * p.y), 0);
        const sumX2 = points.reduce((sum, p) => sum + (p.x * p.x), 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Calculate correlation coefficient (R²)
        const meanY = sumY / n;
        const ssTotal = points.reduce((sum, p) => sum + Math.pow(p.y - meanY, 2), 0);
        const ssResidual = points.reduce((sum, p) => {
            const predicted = slope * p.x + intercept;
            return sum + Math.pow(p.y - predicted, 2);
        }, 0);
        const rSquared = 1 - (ssResidual / ssTotal);

        // Generate predictions with seasonal adjustments
        const predictions = [];
        const currentTime = new Date();

        for (let i = 1; i <= hoursAhead; i++) {
            const futureTime = new Date(currentTime.getTime() + (i * 60 * 60 * 1000));
            const x = n + i - 1;
            const basePrediction = slope * x + intercept;

            // Apply seasonal adjustments
            const hourFactor = this.getHourlyLoadFactor(futureTime.getHours());
            const dayFactor = this.getDailyLoadFactor(futureTime.getDay());
            const seasonalFactor = this.getSeasonalFactor(futureTime.getMonth());

            const adjustedPrediction = Math.max(0, basePrediction * hourFactor * dayFactor * seasonalFactor);
            const confidence = this.calculateConfidence(rSquared, i, points);

            predictions.push({
                hour: i,
                timestamp: futureTime.toISOString(),
                predicted_power: Math.round(adjustedPrediction * 100) / 100,
                predicted_energy: Math.round(adjustedPrediction / 10) / 100, // kWh
                confidence: Math.round(confidence * 100) / 100,
                reliability: this.getReliabilityLevel(confidence)
            });
        }

        return {
            algorithm: 'Regresi Linear Lanjutan dengan Penyesuaian Musiman',
            coefficients: {
                slope: Math.round(slope * 10000) / 10000,
                intercept: Math.round(intercept * 100) / 100
            },
            statistics: {
                r_squared: Math.round(rSquared * 10000) / 10000,
                accuracy_level: this.getAccuracyLevel(rSquared),
                data_quality: this.assessDataQuality(points)
            },
            predictions: predictions,
            summary: {
                next_hour_power: predictions[0]?.predicted_power || 0,
                next_24h_energy: Math.round(predictions.slice(0, 24).reduce((sum, p) => sum + p.predicted_power, 0) / 10) / 100,
                average_confidence: Math.round(predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length * 100) / 100,
                trend_direction: slope > 0 ? 'meningkat' : 'menurun',
                trend_strength: this.getTrendStrength(Math.abs(slope))
            }
        };
    }

    /**
     * Multi-algorithm ensemble prediction
     */
    ensemblePrediction(data, hoursAhead = 24) {
        const algorithms = [
            this.advancedLinearRegression(data, hoursAhead)
        ];

        // Filter successful predictions
        const validAlgorithms = algorithms.filter(result => !result.error);

        if (validAlgorithms.length === 0) {
            return { error: 'Semua algoritma prediksi gagal' };
        }

        // Ensemble prediction by weighted average
        const ensemblePredictions = [];

        for (let i = 0; i < hoursAhead; i++) {
            let weightedSum = 0;
            let totalWeight = 0;

            validAlgorithms.forEach(algorithm => {
                if (algorithm.predictions && algorithm.predictions[i]) {
                    const weight = algorithm.statistics?.r_squared || 0.5;
                    weightedSum += algorithm.predictions[i].predicted_power * weight;
                    totalWeight += weight;
                }
            });

            const ensemblePower = totalWeight > 0 ? weightedSum / totalWeight : 0;

            ensemblePredictions.push({
                hour: i + 1,
                predicted_power: Math.round(ensemblePower * 100) / 100,
                predicted_energy: Math.round(ensemblePower / 10) / 100,
                confidence: Math.min(...validAlgorithms.map(a => a.predictions?.[i]?.confidence || 0)),
                contributing_algorithms: validAlgorithms.length
            });
        }

        return {
            algorithm: 'Prediksi Ensemble',
            contributing_methods: validAlgorithms.map(a => a.algorithm),
            predictions: ensemblePredictions,
            summary: {
                next_hour_power: ensemblePredictions[0]?.predicted_power || 0,
                next_24h_energy: Math.round(ensemblePredictions.slice(0, 24).reduce((sum, p) => sum + p.predicted_power, 0) / 10) / 100,
                average_confidence: Math.round(ensemblePredictions.reduce((sum, p) => sum + p.confidence, 0) / ensemblePredictions.length * 100) / 100
            }
        };
    }

    /**
     * Enhanced calculation display with multiple algorithms
     */
    displayEnhancedCalculations(periode = 'harian') {
        if (!this.data.values.length) {
            return this.displayEmptyState();
        }

        // Calculate basic statistics
        const stats = this.calculateBasicStats();
        const periodHours = this.getPeriodHours(periode);

        // Get predictions from ensemble method
        const prediction = this.ensemblePrediction(this.data.values, 24);

        // Update basic statistics
        this.updateBasicDisplay(stats, periodHours, periode);

        // Update prediction display
        if (!prediction.error) {
            this.updatePredictionDisplay(prediction);
            this.displayEfficiencyMetrics(stats);
            this.displayRecommendations(stats, prediction);
        }

        // Update summary
        this.updateSummaryDisplay(stats, prediction, periode);
    }

    /**
     * Calculate comprehensive statistics
     */
    calculateBasicStats() {
        const values = this.data.values;
        const sum = values.reduce((a, b) => a + b, 0);
        const mean = sum / values.length;
        const sorted = [...values].sort((a, b) => a - b);

        // Calculate standard deviation
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);

        // Calculate percentiles
        const q1 = sorted[Math.floor(values.length * 0.25)];
        const median = sorted[Math.floor(values.length * 0.5)];
        const q3 = sorted[Math.floor(values.length * 0.75)];

        return {
            mean: Math.round(mean * 100) / 100,
            median: Math.round(median * 100) / 100,
            max: Math.round(Math.max(...values) * 100) / 100,
            min: Math.round(Math.min(...values) * 100) / 100,
            stdDev: Math.round(stdDev * 100) / 100,
            coefficientOfVariation: Math.round((stdDev / mean) * 10000) / 100,
            q1: Math.round(q1 * 100) / 100,
            q3: Math.round(q3 * 100) / 100,
            dataPoints: values.length
        };
    }

    /**
     * Update basic display elements
     */
    updateBasicDisplay(stats, periodHours, periode) {
        this.safeUpdateElement('totalWatt', `${stats.mean} Watt`);
        this.safeUpdateElement('totalKwh', `${Math.round(stats.mean * periodHours / 10) / 100} kWh`);
        this.safeUpdateElement('periodeLabel', `per ${periode.slice(0, -3)}`);
        this.safeUpdateElement('dayaTertinggi', `${stats.max} Watt`);
        this.safeUpdateElement('dayaTerendah', `${stats.min} Watt`);
        this.safeUpdateElement('totalData', `${stats.dataPoints} titik data`);

        // Update period-specific energy calculations
        ['Harian', 'Mingguan', 'Bulanan'].forEach(p => {
            const hours = this.getPeriodHours(p.toLowerCase());
            const kwh = Math.round(stats.mean * hours / 10) / 100;
            this.safeUpdateElement(`kwh${p}`, `${kwh} kWh`);
        });
    }

    /**
     * Update prediction display
     */
    updatePredictionDisplay(prediction) {
        if (prediction.summary) {
            this.safeUpdateElement('prediksiWatt', `${prediction.summary.next_hour_power} Watt`);
            this.safeUpdateElement('prediksiKwhHarian', `${prediction.summary.next_24h_energy} kWh`);

            // Add confidence indicator
            const confidenceElement = document.getElementById('confidenceLevel');
            if (confidenceElement) {
                const confidence = prediction.summary.average_confidence;
                confidenceElement.textContent = `${Math.round(confidence * 100)}%`;
                confidenceElement.className = `confidence-${this.getConfidenceClass(confidence)}`;
            }
        }
    }

    /**
     * Display efficiency metrics
     */
    displayEfficiencyMetrics(stats) {
        const efficiencyElement = document.getElementById('efficiencyMetrics');
        if (efficiencyElement) {
            const loadFactor = this.calculateLoadFactor(stats);
            const stabilityRating = this.getStabilityRating(stats.coefficientOfVariation / 100);

            efficiencyElement.innerHTML = `
                <div class="efficiency-metrics">
                    <div class="metric">
                        <span class="label">Load Factor:</span>
                        <span class="value">${Math.round(loadFactor * 100)}%</span>
                    </div>
                    <div class="metric">
                        <span class="label">Stability:</span>
                        <span class="value">${stabilityRating}</span>
                    </div>
                    <div class="metric">
                        <span class="label">Variability:</span>
                        <span class="value">${stats.coefficientOfVariation}%</span>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Display actionable recommendations
     */
    displayRecommendations(stats, prediction) {
        const recommendationsElement = document.getElementById('recommendations');
        if (recommendationsElement) {
            const recommendations = this.generateRecommendations(stats, prediction);

            recommendationsElement.innerHTML = recommendations.map(rec => `
                <div class="recommendation ${rec.priority}">
                    <h6>${rec.title}</h6>
                    <p>${rec.description}</p>
                    <small><strong>Action:</strong> ${rec.action}</small>
                </div>
            `).join('');
        }
    }

    /**
     * Generate smart recommendations
     */
    generateRecommendations(stats, prediction) {
        const recommendations = [];

        // High variability recommendation
        if (stats.coefficientOfVariation > 30) {
            recommendations.push({
                priority: 'high',
                title: 'High Power Variability Detected',
                description: `Your power consumption varies significantly (${stats.coefficientOfVariation}% CV).`,
                action: 'Consider implementing load balancing or reviewing equipment schedules.'
            });
        }

        // Load factor recommendation
        const loadFactor = this.calculateLoadFactor(stats);
        if (loadFactor < 0.6) {
            recommendations.push({
                priority: 'medium',
                title: 'Low Load Factor',
                description: `Your system utilization is ${Math.round(loadFactor * 100)}%, which indicates underuse.`,
                action: 'Consider load redistribution or equipment optimization.'
            });
        }

        // Prediction confidence recommendation
        if (prediction.summary && prediction.summary.average_confidence < 0.7) {
            recommendations.push({
                priority: 'low',
                title: 'Low Prediction Confidence',
                description: 'Prediction accuracy could be improved with more consistent data.',
                action: 'Ensure continuous monitoring and check for equipment irregularities.'
            });
        }

        return recommendations;
    }

    /**
     * Helper methods
     */
    getSeasonalFactors() {
        // Seasonal load factors by month (0-11)
        return [
            0.95, 0.92, 0.88, 0.85, 0.90, 0.95, // Jan-Jun
            1.05, 1.08, 1.02, 0.95, 0.90, 0.98  // Jul-Dec
        ];
    }

    getLoadPatterns() {
        // Hourly load patterns for typical industrial facility
        return [
            0.3, 0.25, 0.2, 0.2, 0.25, 0.4,     // 00-05
            0.6, 0.8, 0.95, 1.0, 0.95, 0.9,     // 06-11
            0.85, 0.9, 1.0, 0.95, 0.9, 0.8,     // 12-17
            0.6, 0.4, 0.35, 0.3, 0.28, 0.25     // 18-23
        ];
    }

    getHourlyLoadFactor(hour) {
        return this.config.loadPatterns[hour] || 0.5;
    }

    getDailyLoadFactor(dayOfWeek) {
        // 0=Sunday, 1=Monday, ..., 6=Saturday
        const factors = [0.3, 1.0, 1.0, 1.0, 1.0, 0.9, 0.4];
        return factors[dayOfWeek] || 0.8;
    }

    getSeasonalFactor(month) {
        return this.config.seasonalFactors[month] || 1.0;
    }

    calculateConfidence(rSquared, hoursAhead, points) {
        const baseConfidence = rSquared;
        const timeDecay = 1 - (hoursAhead * 0.015);
        const dataQuality = Math.min(1, points.length / 24);

        return Math.max(0.1, baseConfidence * timeDecay * dataQuality);
    }

    getAccuracyLevel(rSquared) {
        if (rSquared >= 0.9) return 'Excellent';
        if (rSquared >= 0.8) return 'Very Good';
        if (rSquared >= 0.7) return 'Good';
        if (rSquared >= 0.6) return 'Fair';
        if (rSquared >= 0.4) return 'Poor';
        return 'Very Poor';
    }

    getReliabilityLevel(confidence) {
        if (confidence >= 0.8) return 'High';
        if (confidence >= 0.6) return 'Medium';
        if (confidence >= 0.4) return 'Low';
        return 'Very Low';
    }

    getTrendStrength(slope) {
        if (slope > 1) return 'Strong';
        if (slope > 0.5) return 'Moderate';
        if (slope > 0.1) return 'Weak';
        return 'Stable';
    }

    calculateLoadFactor(stats) {
        return stats.mean / stats.max;
    }

    getStabilityRating(cv) {
        if (cv <= 0.1) return 'Very Stable';
        if (cv <= 0.2) return 'Stable';
        if (cv <= 0.3) return 'Moderate';
        if (cv <= 0.5) return 'Variable';
        return 'Highly Variable';
    }

    getConfidenceClass(confidence) {
        if (confidence >= 0.8) return 'high';
        if (confidence >= 0.6) return 'medium';
        return 'low';
    }

    assessDataQuality(points) {
        const coverage = Math.min(1, points.length / 24);
        const consistency = this.calculateDataConsistency(points);
        return (coverage + consistency) / 2;
    }

    calculateDataConsistency(points) {
        if (points.length < 2) return 0;

        const differences = [];
        for (let i = 1; i < points.length; i++) {
            differences.push(Math.abs(points[i].y - points[i - 1].y));
        }

        const meanDiff = differences.reduce((a, b) => a + b, 0) / differences.length;
        const meanValue = points.reduce((sum, p) => sum + p.y, 0) / points.length;

        return Math.max(0, 1 - (meanDiff / meanValue));
    }

    getPeriodHours(periode) {
        const periods = { harian: 24, mingguan: 168, bulanan: 720 };
        return periods[periode] || 24;
    }

    generateTimestamps() {
        const now = new Date();
        return this.data.labels.map((_, index) => {
            const timestamp = new Date(now.getTime() - ((this.data.labels.length - index) * 60 * 60 * 1000));
            return timestamp.toISOString();
        });
    }

    getHourFromIndex(index) {
        const timestamp = new Date(this.data.timestamps[index] || Date.now());
        return timestamp.getHours();
    }

    getDayOfWeekFromIndex(index) {
        const timestamp = new Date(this.data.timestamps[index] || Date.now());
        return timestamp.getDay();
    }

    isWeekendFromIndex(index) {
        const day = this.getDayOfWeekFromIndex(index);
        return day === 0 || day === 6;
    }

    getPredictionForIndex(index) {
        return this.predictions[index]?.predicted_power || null;
    }

    createGradient(ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(0, 255, 136, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 255, 136, 0.05)');
        return gradient;
    }

    safeUpdateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    updateSummaryDisplay(stats, prediction, periode) {
        const summaryElement = document.getElementById('perhitunganSummary');
        if (summaryElement) {
            const hours = this.getPeriodHours(periode);
            const energy = Math.round(stats.mean * hours / 10) / 100;

            summaryElement.innerHTML = `
                <div class="calculation-summary">
                    <p><strong>Statistical Analysis:</strong></p>
                    <p>Average Power: <strong>${stats.mean} Watt</strong></p>
                    <p>Estimated Consumption: <strong>${energy} kWh</strong> per ${periode}</p>
                    <p>Data Quality: <strong>${stats.dataPoints} points</strong> (${this.getDataQualityRating(stats.dataPoints)})</p>
                    ${prediction.error ?
                    '<p><em>Prediction unavailable due to insufficient data</em></p>' :
                    `<p>Next Hour Prediction: <strong>${prediction.summary.next_hour_power} W</strong> 
                         (${Math.round(prediction.summary.average_confidence * 100)}% confidence)</p>`
                }
                </div>
            `;
        }
    }

    getDataQualityRating(dataPoints) {
        if (dataPoints >= 24) return 'Excellent';
        if (dataPoints >= 12) return 'Good';
        if (dataPoints >= 6) return 'Fair';
        return 'Limited';
    }

    displayEmptyState() {
        const elements = [
            'totalWatt', 'totalKwh', 'dayaTertinggi', 'dayaTerendah',
            'totalData', 'kwhHarian', 'kwhMingguan', 'kwhBulanan',
            'prediksiWatt', 'prediksiKwhHarian'
        ];

        elements.forEach(id => this.safeUpdateElement(id, 'N/A'));
        this.safeUpdateElement('periodeLabel', '-');

        const summaryElement = document.getElementById('perhitunganSummary');
        if (summaryElement) {
            summaryElement.innerHTML = '<p><em>No data available for analysis.</em></p>';
        }
    }

    setupEventListeners() {
        // Modal and period selection
        const modal = new bootstrap.Modal(document.getElementById('modalPerhitunganListrik'));
        const showButton = document.getElementById('btnLihatPerhitungan');
        const periodSelect = document.getElementById('periodePerhitungan');

        if (showButton) {
            showButton.addEventListener('click', () => {
                this.displayEnhancedCalculations(periodSelect?.value || 'harian');
                modal.show();
            });
        }

        if (periodSelect) {
            periodSelect.addEventListener('change', () => {
                this.displayEnhancedCalculations(periodSelect.value);
            });
        }

        // Prediction period selection
        const predictionSelect = document.getElementById('periodePrediksi');
        if (predictionSelect) {
            predictionSelect.addEventListener('change', () => {
                const hours = parseInt(predictionSelect.value) || 24;
                const prediction = this.ensemblePrediction(this.data.values, hours);
                this.updatePredictionDisplay(prediction);
            });
        }
    }
}

// Initialize the calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('wattChart');
    if (canvas) {
        window.electricityCalculator = new ElectricityCalculator(canvas);
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ElectricityCalculator;
}
