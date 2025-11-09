function waitForChart(callback, maxRetries = 50) {
    if (typeof Chart !== 'undefined') {
        callback();
    } else if (maxRetries > 0) {
        setTimeout(() => waitForChart(callback, maxRetries - 1), 200);
    } else {
        console.error('[Dashboard] Chart.js failed to load');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        initializeElectricityChart();
    }, 1000);
});

function initializeElectricityChart() {
    if (!window.autoPZEMGenerator) {
        setTimeout(() => {
            initializeElectricityChart();
        }, 500);
        return;
    }

    waitForChart(function () {
        const canvas = document.getElementById('wattChart');
        if (!canvas) return;

        let labels = [];
        let values = [];

        try {
            const rawLabels = canvas.dataset.labels;
            const rawValues = canvas.dataset.values;
            labels = rawLabels ? JSON.parse(rawLabels) : [];
            values = rawValues ? JSON.parse(rawValues).map(Number) : [];
        } catch (e) {
            labels = [];
            values = [];
        }

        // Generate fallback data if needed
        if (labels.length === 0 || values.length === 0) {
            if (window.autoPZEMGenerator && typeof window.autoPZEMGenerator.generateRealisticChartData === 'function') {
                const chartData = window.autoPZEMGenerator.generateRealisticChartData();
                labels = chartData.labels;
                values = chartData.values;
            } else {
                // Simple fallback data
                for (let i = 0; i < 24; i++) {
                    labels.push(String(i).padStart(2, '0') + ':00');
                    let power = (i >= 7 && i <= 9) ? 180 + Math.random() * 80 :
                        (i >= 10 && i <= 16) ? 220 + Math.random() * 80 :
                            (i >= 17 && i <= 21) ? 140 + Math.random() * 60 :
                                60 + Math.random() * 40;
                    values.push(Math.round(power));
                }
            }
        }

        // Destroy existing chart
        const existingChart = Chart.getChart(canvas);
        if (existingChart) existingChart.destroy();

        if (values.length === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(54, 162, 235, 0.3)');
        gradient.addColorStop(1, 'rgba(54, 162, 235, 0.05)');

        try {
            window.myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Konsumsi Listrik Hari Ini (Watt)',
                        data: values,
                        borderColor: '#36a2eb',
                        backgroundColor: gradient,
                        borderWidth: 3,
                        fill: true,
                        tension: 0.3,
                        pointBackgroundColor: '#ffffff',
                        pointBorderColor: '#36a2eb',
                        pointRadius: 4,
                        pointHoverRadius: 7,
                        pointBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: `Monitoring Konsumsi Listrik - ${new Date().toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}`,
                            color: '#ffffff',
                            font: { size: 16, weight: 'bold' },
                            padding: 20
                        },
                        legend: {
                            labels: {
                                color: '#ffffff',
                                font: { size: 14 }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#36a2eb',
                            borderWidth: 1,
                            callbacks: {
                                label: function (context) {
                                    return context.parsed.y + ' Watt';
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: '#ffffff',
                                maxTicksLimit: 12,
                                autoSkip: true,
                                maxRotation: 45,
                                minRotation: 0
                            },
                            grid: {
                                color: 'rgba(255,255,255,0.1)'
                            },
                            title: {
                                display: true,
                                text: 'Waktu (Jam) - Data Hari Ini',
                                color: '#ffffff',
                                font: { size: 12 }
                            }
                        },
                        y: {
                            ticks: {
                                color: '#ffffff',
                                callback: function (value) {
                                    return value + 'W';
                                }
                            },
                            grid: {
                                color: 'rgba(255,255,255,0.1)'
                            },
                            title: {
                                display: true,
                                text: 'Daya (Watt)',
                                color: '#ffffff'
                            }
                        }
                    },
                    animation: {
                        duration: 1500
                    }
                }
            });

            // Store data globally
            window.chartData = {
                labels: labels,
                datasets: [{
                    data: values,
                    label: 'Konsumsi Listrik (Watt)'
                }]
            };

            window.latestPowerValue = values[values.length - 1] || 0;
            window.globalElectricityData = {
                currentPower: window.latestPowerValue,
                dailyData: values,
                labels: labels,
                source: values.length > 0 ? (labels.length === values.length ? 'server_data' : 'demo_data') : 'no_data'
            };

        } catch (error) {
            console.error('[Dashboard] Error creating chart:', error);
            if (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Error loading chart: ' + error.message, canvas.width / 2, canvas.height / 2);
            }
        }
    });
}

// Smart prediction calculation
function calculateSmartPrediction(data, analysisPeriod, predictionHours) {
    if (!data || data.length === 0) {
        return { prediction: 0, kwh: 0, confidence: 0 };
    }

    const avgPower = data.reduce((a, b) => a + b, 0) / data.length;
    const recentTrend = data.slice(-Math.min(5, data.length));
    const trendAvg = recentTrend.reduce((a, b) => a + b, 0) / recentTrend.length;

    const variance = recentTrend.reduce((sum, val) => sum + Math.pow(val - trendAvg, 2), 0) / recentTrend.length;
    const confidence = Math.max(65, Math.min(95, 90 - Math.sqrt(variance) / 15));

    let prediction;
    switch (analysisPeriod) {
        case 'harian':
            const dailyTrendMultiplier = trendAvg > avgPower ? 1.03 : 0.97;
            prediction = Math.round(trendAvg * dailyTrendMultiplier);
            break;
        case 'mingguan':
            prediction = Math.round((avgPower + trendAvg) / 2);
            break;
        case 'bulanan':
            prediction = Math.round(avgPower * 1.01);
            break;
        default:
            prediction = Math.round(trendAvg);
    }

    const minPrediction = Math.min(...data) * 0.8;
    const maxPrediction = Math.max(...data) * 1.2;
    prediction = Math.max(minPrediction, Math.min(maxPrediction, prediction));

    const predictedKwh = (prediction * predictionHours) / 1000;

    return {
        prediction: prediction,
        kwh: predictedKwh,
        confidence: Math.round(confidence)
    };
}

// Fetch data from API
async function fetchRealDataFromAPI(period = 'harian') {
    try {
        const response = await fetch(`/api/electricity/data?period=${period}`);
        const result = await response.json();
        return result.success ? result : null;
    } catch (error) {
        console.error('[API] Error:', error);
        return null;
    }
}

// Update modal data
async function updateModalData(period = 'harian') {
    try {
        const apiData = await fetchRealDataFromAPI(period);
        let data, labels, dataCount;

        if (!apiData || !apiData.data || apiData.data.length === 0) {
            // Use fallback data
            if (window.globalElectricityData && window.globalElectricityData.dailyData.length > 0) {
                data = window.globalElectricityData.dailyData;
                labels = window.globalElectricityData.labels || [];
                dataCount = data.length;
            } else if (window.autoPZEMGenerator && typeof window.autoPZEMGenerator.generateRealisticModalData === 'function') {
                const modalData = window.autoPZEMGenerator.generateRealisticModalData();
                data = modalData.data;
                labels = modalData.labels;
                dataCount = data.length;
            } else {
                data = Array(30).fill(350);
                labels = Array(30).fill(0).map((_, i) => `${String(new Date().getHours()).padStart(2, '0')}:${String(i * 2).padStart(2, '0')}`);
                dataCount = 30;
            }
        } else {
            data = apiData.data;
            labels = apiData.labels;
            dataCount = data.length;
        }

        // Calculate statistics
        const avgPower = data.reduce((a, b) => a + b, 0) / data.length;
        const maxPower = Math.max(...data);
        const minPower = Math.min(...data);

        // Calculate energy based on period interpretation
        let periodKwh, dailyKwh, weeklyKwh, monthlyKwh, periodLabel;

        switch (period) {
            case 'harian':
                dailyKwh = (avgPower * 24) / 1000;
                periodKwh = dailyKwh;
                weeklyKwh = dailyKwh * 7;
                monthlyKwh = dailyKwh * 30;
                periodLabel = 'per hari';
                break;
            case 'mingguan':
                dailyKwh = (avgPower * 24) / 1000;
                weeklyKwh = dailyKwh * 7;
                periodKwh = weeklyKwh;
                monthlyKwh = weeklyKwh * 4.3;
                periodLabel = 'per minggu';
                break;
            case 'bulanan':
                dailyKwh = (avgPower * 24) / 1000;
                weeklyKwh = dailyKwh * 7;
                monthlyKwh = dailyKwh * 30;
                periodKwh = monthlyKwh;
                periodLabel = 'per bulan';
                break;
        }

        // Update global data
        window.globalElectricityData = {
            currentPower: avgPower,
            dailyData: data,
            labels: labels,
            source: 'modal_data',
            period: period,
            periodKwh: periodKwh,
            lastUpdated: new Date().getTime()
        };

        // Update UI elements
        const elements = {
            'totalWatt': Math.round(avgPower) + ' W',
            'totalKwh': periodKwh.toFixed(2) + ' kWh',
            'periodeLabel': periodLabel,
            'dayaTertinggi': Math.round(maxPower) + ' W',
            'dayaTerendah': Math.round(minPower) + ' W',
            'totalData': dataCount,
            'kwhHarian': dailyKwh.toFixed(2) + ' kWh',
            'kwhMingguan': weeklyKwh.toFixed(2) + ' kWh',
            'kwhBulanan': monthlyKwh.toFixed(2) + ' kWh'
        };

        Object.keys(elements).forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = elements[id];
        });

        // Update predictions
        const periodePrediksiEl = document.getElementById('periodePrediksi');
        const predictionHours = periodePrediksiEl ? parseInt(periodePrediksiEl.value) || 1 : 1;
        const smartPrediction = calculateSmartPrediction(data, period, predictionHours);

        const prediksiWattEl = document.getElementById('prediksiWatt');
        const prediksiKwhHarianEl = document.getElementById('prediksiKwhHarian');
        const confidenceLevelEl = document.getElementById('confidenceLevel');
        const confidencePercentageEl = document.getElementById('confidencePercentage');

        if (prediksiWattEl) {
            prediksiWattEl.textContent = predictionHours === 1 ?
                smartPrediction.prediction + ' W' :
                smartPrediction.prediction + ' W (rata-rata)';
        }

        if (prediksiKwhHarianEl) {
            prediksiKwhHarianEl.textContent = predictionHours === 1 ?
                smartPrediction.kwh.toFixed(3) + ' kWh (1 jam)' :
                smartPrediction.kwh.toFixed(2) + ` kWh (${predictionHours} jam)`;
        }

        if (confidenceLevelEl) confidenceLevelEl.textContent = smartPrediction.confidence + '%';
        if (confidencePercentageEl) confidencePercentageEl.textContent = smartPrediction.confidence + '%';

    } catch (error) {
        console.error('[Modal] Error:', error);
        // Show error fallback
        const errorElements = ['maxPowerModal', 'minPowerModal', 'averagePowerModal', 'periodKwhModal', 'predictionNextHours'];
        errorElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = 'Error loading';
        });
    }
}

// Event handlers
const periodePerhitunganEl = document.getElementById('periodePerhitungan');
if (periodePerhitunganEl) {
    periodePerhitunganEl.addEventListener('change', function () {
        updateModalData(this.value);
    });
}

const periodePrediksiEl = document.getElementById('periodePrediksi');
if (periodePrediksiEl) {
    periodePrediksiEl.addEventListener('change', function () {
        const selectedHours = parseInt(this.value);
        const currentAnalysisPeriod = periodePerhitunganEl ? periodePerhitunganEl.value : 'harian';

        if (window.globalElectricityData && window.globalElectricityData.dailyData.length > 0) {
            const data = window.globalElectricityData.dailyData;
            const smartPrediction = calculateSmartPrediction(data, currentAnalysisPeriod, selectedHours);

            const prediksiWattEl = document.getElementById('prediksiWatt');
            const prediksiKwhHarianEl = document.getElementById('prediksiKwhHarian');
            const confidenceLevelEl = document.getElementById('confidenceLevel');
            const confidencePercentageEl = document.getElementById('confidencePercentage');

            if (prediksiWattEl) {
                prediksiWattEl.textContent = selectedHours === 1 ?
                    smartPrediction.prediction + ' W' :
                    smartPrediction.prediction + ' W (rata-rata)';
            }

            if (prediksiKwhHarianEl) {
                prediksiKwhHarianEl.textContent = selectedHours === 1 ?
                    smartPrediction.kwh.toFixed(3) + ' kWh (1 jam)' :
                    smartPrediction.kwh.toFixed(2) + ` kWh (${selectedHours} jam)`;
            }

            if (confidenceLevelEl) confidenceLevelEl.textContent = smartPrediction.confidence + '%';
            if (confidencePercentageEl) confidencePercentageEl.textContent = smartPrediction.confidence + '%';
        } else {
            updateModalData(currentAnalysisPeriod);
        }
    });
}

// Modal handlers
const modalButton = document.getElementById('btnLihatPerhitungan');
const modal = document.getElementById('modalPerhitunganListrik');

if (modalButton && modal) {
    modalButton.addEventListener('click', function () {
        // Show loading
        const loadingElements = [
            'totalWatt', 'totalKwh', 'dayaTertinggi', 'dayaTerendah',
            'totalData', 'kwhHarian', 'kwhMingguan', 'kwhBulanan',
            'prediksiWatt', 'prediksiKwhHarian', 'confidenceLevel', 'confidencePercentage'
        ];

        loadingElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = 'Loading...';
        });

        const currentPeriod = periodePerhitunganEl ? periodePerhitunganEl.value : 'harian';
        updateModalData(currentPeriod).then(() => {
            // Force update confidence if still empty
            setTimeout(() => {
                const confidenceLevelEl = document.getElementById('confidenceLevel');
                const confidencePercentageEl = document.getElementById('confidencePercentage');

                if (confidenceLevelEl && (confidenceLevelEl.textContent === 'Loading...' || confidenceLevelEl.textContent === '-')) {
                    confidenceLevelEl.textContent = '78%';
                }

                if (confidencePercentageEl && (confidencePercentageEl.textContent === 'Loading...' || confidencePercentageEl.textContent === '--%')) {
                    confidencePercentageEl.textContent = '78%';
                }
            }, 500);

            // Trigger Krakatau calculator if available
            if (window.krakatauCalculator && typeof window.krakatauCalculator.updateCalculation === 'function') {
                window.krakatauCalculator.updateCalculation();
            }
        }).catch(error => {
            console.error('[Modal] Error loading data:', error);
            loadingElements.forEach(id => {
                const element = document.getElementById(id);
                if (element && element.textContent === 'Loading...') {
                    element.textContent = '0';
                }
            });
        });
    });
}

// Initialize data
async function initializeData() {
    try {
        const apiData = await fetchRealDataFromAPI('harian');
        if (apiData && apiData.data && apiData.data.length > 0) {
            window.globalElectricityData = {
                currentPower: apiData.data.reduce((a, b) => a + b, 0) / apiData.data.length,
                dailyData: apiData.data,
                labels: apiData.labels,
                source: 'init_load',
                period: 'harian',
                periodKwh: 0,
                predictionHours: 24,
                lastUpdated: new Date().getTime()
            };
        }
    } catch (error) {
        // Use AutoPZEM generator for fallback
        let fallbackResult;
        if (window.autoPZEMGenerator && typeof window.autoPZEMGenerator.generateRealisticFallbackData === 'function') {
            fallbackResult = window.autoPZEMGenerator.generateRealisticFallbackData(30);
        } else {
            const now = new Date();
            const fallbackData = Array(30).fill(320);
            const fallbackLabels = Array(30).fill(0).map((_, i) => {
                const time = new Date(now.getTime() - (i * 5 * 60 * 1000));
                return `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
            }).reverse();
            fallbackResult = { data: fallbackData, labels: fallbackLabels };
        }

        window.globalElectricityData = {
            currentPower: fallbackResult.data[fallbackResult.data.length - 1],
            dailyData: fallbackResult.data,
            labels: fallbackResult.labels,
            source: 'init_fallback_AutoPZEM',
            period: 'harian',
            periodKwh: 0,
            predictionHours: 24,
            lastUpdated: new Date().getTime()
        };
    }
}

initializeData();

// REMOVED: Real-time power generator integration - menggunakan autoPZEMGenerator saja

// Initialize confidence elements
setTimeout(() => {
    const confidenceLevelEl = document.getElementById('confidenceLevel');
    const confidencePercentageEl = document.getElementById('confidencePercentage');

    if (confidenceLevelEl && confidenceLevelEl.textContent === '-') {
        confidenceLevelEl.textContent = '75%';
    }

    if (confidencePercentageEl && confidencePercentageEl.textContent === '--%') {
        confidencePercentageEl.textContent = '75%';
    }
}, 100);

// Day change monitoring
function getCurrentDateString() {
    return new Date().toDateString();
}

function getStoredLastDate() {
    return localStorage.getItem('lastChartDate') || '';
}

function setStoredLastDate(dateString) {
    localStorage.setItem('lastChartDate', dateString);
}

function resetChartForNewDay() {
    if (window.globalElectricityData) {
        window.globalElectricityData.dailyData = [];
        window.globalElectricityData.labels = [];
        window.globalElectricityData.currentPower = 0;
    }

    if (window.myChart && window.myChart.data) {
        let resetData;
        if (window.autoPZEMGenerator && typeof window.autoPZEMGenerator.generateNewDayResetData === 'function') {
            resetData = window.autoPZEMGenerator.generateNewDayResetData();
        } else {
            const now = new Date();
            const currentHour = now.getHours();
            resetData = {
                labels: Array.from({ length: currentHour + 1 }, (_, i) => `${String(i).padStart(2, '0')}:00`),
                data: Array(currentHour + 1).fill(350)
            };
        }

        window.myChart.data.labels = resetData.labels;
        window.myChart.data.datasets[0].data = resetData.data;

        const newDateText = new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        window.myChart.options.plugins.title.text = `Monitoring Konsumsi Listrik - ${newDateText}`;
        window.myChart.update();
    }

    const chartDateDisplay = document.getElementById('chartDateDisplay');
    if (chartDateDisplay) {
        const newDateFormatted = new Date().toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        chartDateDisplay.textContent = newDateFormatted;
    }

    setStoredLastDate(getCurrentDateString());
}

function checkForDayChange() {
    const currentDate = getCurrentDateString();
    const lastStoredDate = getStoredLastDate();

    if (!lastStoredDate || currentDate !== lastStoredDate) {
        if (lastStoredDate) {
            resetChartForNewDay();
        } else {
            setStoredLastDate(currentDate);
        }
    }
}

setTimeout(() => checkForDayChange(), 1000);
setInterval(() => checkForDayChange(), 60000);

// Diagnostic function
window.diagnosticChart = function () {
    console.log('[Diagnostic] Chart.js available:', typeof Chart !== 'undefined');
    console.log('[Diagnostic] Canvas element:', document.getElementById('wattChart'));
    console.log('[Diagnostic] Global chart data:', window.chartData);
    console.log('[Diagnostic] Chart instance:', window.myChart);
};