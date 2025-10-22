console.log('[Dashboard] 🔥 Dashboard Electricity Integration Unified - Script Loading...');

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
    console.log('[Dashboard] ✅ DOM Content Loaded');

    const wattChart = document.getElementById('wattChart');
    const modalButton = document.getElementById('btnLihatPerhitungan');

    if (modalButton) {
        modalButton.addEventListener('click', function () {
            showElectricityModal();
        });
        console.log('[Dashboard] ✅ Modal button event listener added');
    }

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

        if (!canvas) {
            console.error('[Dashboard] Canvas wattChart not found');
            return;
        }

        console.log('[Dashboard] ✅ Canvas found:', canvas.id);

        let labels = [];
        let values = [];

        try {
            const rawLabels = canvas.dataset.labels;
            const rawValues = canvas.dataset.values;

            labels = rawLabels ? JSON.parse(rawLabels) : [];
            values = rawValues ? JSON.parse(rawValues).map(Number) : [];
        } catch (e) {
            console.error('[Dashboard] ❌ Error parsing canvas data:', e);
            labels = [];
            values = [];
        }

        if (labels.length === 0 || values.length === 0) {
            if (window.autoPZEMGenerator && typeof window.autoPZEMGenerator.generateRealisticChartData === 'function') {
                const chartData = window.autoPZEMGenerator.generateRealisticChartData();
                labels = chartData.labels;
                values = chartData.values;
                console.log('[Dashboard] ✅ AutoPZEM data generated');
            } else {
                for (let i = 0; i < 24; i++) {
                    const hour = String(i).padStart(2, '0') + ':00';
                    labels.push(hour);

                    let power;
                    if (i >= 7 && i <= 9) {
                        power = 180 + Math.random() * 80;
                    } else if (i >= 10 && i <= 16) {
                        power = 220 + Math.random() * 80;
                    } else if (i >= 17 && i <= 21) {
                        power = 140 + Math.random() * 60;
                    } else {
                        power = 60 + Math.random() * 40;
                    }
                    values.push(Math.round(power));
                }
                console.log('[Dashboard] ✅ Manual fallback data created');
            }
        }

        window.globalElectricityData = {
            labels: labels,
            values: values,
            source: window.autoPZEMGenerator ? 'autopzem' : 'fallback'
        };

        if (labels.length === 0 || values.length === 0) {
            console.error('[Dashboard] No data available for chart creation');
            return;
        }

        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Konsumsi Listrik (W)',
                    data: values,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                    pointBorderColor: 'rgba(255, 255, 255, 2)',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Konsumsi Listrik Real-time'
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Waktu'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Daya (Watt)'
                        },
                        beginAtZero: true
                    }
                },
                elements: {
                    point: {
                        radius: 0
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        };

        const ctx = canvas.getContext('2d');

        // Destroy existing chart instance properly
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }

        try {
            window.electricityChart = new Chart(ctx, config);
            console.log('[Dashboard] ✅ Chart created successfully!');
        } catch (error) {
            console.error('[Dashboard] Chart creation failed:', error);
            return;
        }

        const currentValue = values[values.length - 1] || 0;
        updateElectricityDisplay(currentValue);

        setInterval(() => {
            updateRealtimeData();
        }, 3000);

        console.log('[Dashboard] ✅ Initialization complete!');
    });
}

function updateElectricityDisplay(currentValue) {
    const elements = [
        { id: 'pzem-power', value: currentValue + ' W' },
        { id: 'pzem-current', value: (currentValue / 220).toFixed(2) + ' A' },
        { id: 'pzem-voltage', value: '220 V' }
    ];

    elements.forEach(element => {
        const el = document.getElementById(element.id);
        if (el) {
            el.textContent = element.value;
        }
    });

    console.log('[Dashboard] Display updated:', currentValue + 'W');
}

function updateRealtimeData() {
    if (!window.electricityChart || !window.globalElectricityData) {
        return;
    }

    let newValue;
    if (window.autoPZEMGenerator && window.autoPZEMGenerator.currentData) {
        newValue = window.autoPZEMGenerator.currentData.power || 0;
    } else {
        const lastValue = window.globalElectricityData.values[window.globalElectricityData.values.length - 1];
        const variation = (Math.random() - 0.5) * 20;
        newValue = Math.max(50, Math.min(600, lastValue + variation));
    }

    window.globalElectricityData.values.push(newValue);

    const now = new Date();
    const timeLabel = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta'
    });
    window.globalElectricityData.labels.push(timeLabel);

    if (window.globalElectricityData.values.length > 50) {
        window.globalElectricityData.values.shift();
        window.globalElectricityData.labels.shift();
    }

    window.electricityChart.data.labels = window.globalElectricityData.labels;
    window.electricityChart.data.datasets[0].data = window.globalElectricityData.values;
    window.electricityChart.update('none');

    updateElectricityDisplay(newValue);
}

function showElectricityModal() {
    const modalData = generateModalData();
    updateModalChart(modalData);
    updateModalStatistics(modalData);
    setupPredictionDropdown(modalData);

    const modal = new bootstrap.Modal(document.getElementById('modalPerhitunganListrik'));
    modal.show();
}

function generateModalData() {
    if (window.autoPZEMGenerator && typeof window.autoPZEMGenerator.generateRealisticModalData === 'function') {
        return window.autoPZEMGenerator.generateRealisticModalData();
    }

    const data = [];
    const labels = [];
    let lastPower = 350;

    for (let i = 0; i < 30; i++) {
        const time = new Date(Date.now() - (30 - i) * 5 * 60 * 1000);
        const hours = time.getHours();
        const minutes = time.getMinutes();

        labels.push(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);

        let targetPower;
        if (hours >= 9 && hours <= 17) {
            targetPower = 580;
        } else if (hours >= 18 && hours <= 22) {
            targetPower = 320;
        } else if (hours >= 6 && hours <= 8) {
            targetPower = 180;
        } else {
            targetPower = 120;
        }

        const variation = (Math.random() - 0.5) * 20;
        const transition = (targetPower - lastPower) * 0.2;
        lastPower = Math.max(100, Math.min(620, lastPower + transition + variation));
        data.push(Math.round(lastPower));
    }

    return { data, labels };
}

function generateModalDataForPeriod(period) {
    console.log('[Dashboard] 🔄 Generating data for period:', period);

    if (window.autoPZEMGenerator && typeof window.autoPZEMGenerator.generateRealisticModalData === 'function') {
        // Generate different data patterns based on period
        const baseData = window.autoPZEMGenerator.generateRealisticModalData();

        // Modify data characteristics based on period
        switch (period) {
            case 'harian':
                // Use default data (last 30 points representing hours)
                return baseData;

            case 'mingguan':
                // Simulate weekly pattern with more variation
                baseData.data = baseData.data.map((value, index) => {
                    const dayOfWeek = index % 7;
                    const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1.1;
                    return Math.round(value * weekendMultiplier);
                });
                return baseData;

            case 'bulanan':
                // Simulate monthly pattern with seasonal trends
                baseData.data = baseData.data.map((value, index) => {
                    const monthProgress = index / baseData.data.length;
                    const seasonalMultiplier = 0.9 + (0.2 * Math.sin(monthProgress * Math.PI * 2));
                    return Math.round(value * seasonalMultiplier);
                });
                return baseData;

            default:
                return baseData;
        }
    }

    // Fallback to original generateModalData if autoPZEM not available
    return generateModalData();
}

function updateModalChart(modalData) {
    const canvas = document.getElementById('electricityAnalysisChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (window.modalChart) {
        window.modalChart.destroy();
    }

    window.modalChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: modalData.labels,
            datasets: [{
                label: 'Konsumsi Listrik (W)',
                data: modalData.data,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Analisis Konsumsi Listrik 24 Jam',
                    font: { size: 16, weight: 'bold' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Daya (Watt)' }
                },
                x: {
                    title: { display: true, text: 'Waktu' }
                }
            }
        }
    });
}

function updateModalStatistics(modalData) {
    const avgPower = modalData.data.reduce((sum, val) => sum + val, 0) / modalData.data.length;
    const maxPower = Math.max(...modalData.data);
    const minPower = Math.min(...modalData.data);

    const elements = [
        { id: 'dayaTertinggi', value: `${maxPower} W` },
        { id: 'dayaTerendah', value: `${minPower} W` },
        { id: 'totalData', value: modalData.data.length },
        { id: 'kwhHarian', value: `${(avgPower * 24 / 1000).toFixed(2)} kWh` }
    ];

    elements.forEach(element => {
        const el = document.getElementById(element.id);
        if (el) {
            el.textContent = element.value;
        }
    });

    // Don't set static prediction here - let dropdown handler manage it
    console.log('[Dashboard] ✅ Modal statistik dasar updated');
}

function setupPredictionDropdown(modalData) {
    const periodePrediksiEl = document.getElementById('periodePrediksi');
    const periodePerhitunganEl = document.getElementById('periodePerhitungan');

    if (!periodePrediksiEl) {
        console.error('[Dashboard] Dropdown periodePrediksi tidak ditemukan');
        return;
    }

    // Store modal data globally for access in event handler
    window.currentModalData = modalData;

    // Setup prediction period dropdown
    periodePrediksiEl.removeEventListener('change', window.predictionChangeHandler);

    window.predictionChangeHandler = function () {
        if (window.currentModalData) {
            handlePredictionChange(window.currentModalData);
        }
    };

    periodePrediksiEl.addEventListener('change', window.predictionChangeHandler);

    // Setup analysis period dropdown if it exists
    if (periodePerhitunganEl) {
        periodePerhitunganEl.removeEventListener('change', window.analysisChangeHandler);

        window.analysisChangeHandler = function () {
            const selectedPeriod = periodePerhitunganEl.value;
            console.log('[Dashboard] 🔄 Periode analisis berubah ke:', selectedPeriod);

            // Regenerate modal data based on new period
            const newModalData = generateModalDataForPeriod(selectedPeriod);
            window.currentModalData = newModalData;

            // Update chart and statistics
            updateModalChart(newModalData);
            updateModalStatistics(newModalData);

            // Recalculate predictions with new data
            handlePredictionChange(newModalData);
        };

        periodePerhitunganEl.addEventListener('change', window.analysisChangeHandler);
        console.log('[Dashboard] ✅ Analysis period dropdown configured');
    }

    // Initialize with current selection
    handlePredictionChange(modalData);
    console.log('[Dashboard] ✅ Prediction dropdown initialized with value:', periodePrediksiEl.value);
}

function handlePredictionChange(modalData) {
    const periodePrediksiEl = document.getElementById('periodePrediksi');
    const prediksiWattEl = document.getElementById('prediksiWatt');
    const prediksiKwhHarianEl = document.getElementById('prediksiKwhHarian');
    const confidenceLevelEl = document.getElementById('confidenceLevel');
    const confidencePercentageEl = document.getElementById('confidencePercentage');

    if (!periodePrediksiEl) return;

    const selectedHours = parseInt(periodePrediksiEl.value) || 24;
    console.log('[Dashboard] 🔄 Prediksi periode berubah ke:', selectedHours, 'jam');

    // Calculate prediction asynchronously
    calculateAdvancedPrediction(modalData.data, selectedHours).then(prediction => {
        // Update prediction display
        if (prediksiWattEl) {
            if (selectedHours === 1) {
                prediksiWattEl.textContent = `${prediction.avgWatt} W`;
            } else {
                prediksiWattEl.textContent = `${prediction.avgWatt} W (rata-rata)`;
            }
        }

        if (prediksiKwhHarianEl) {
            if (selectedHours === 1) {
                prediksiKwhHarianEl.textContent = `${prediction.totalKwh.toFixed(3)} kWh (1 jam)`;
            } else {
                prediksiKwhHarianEl.textContent = `${prediction.totalKwh.toFixed(2)} kWh (${selectedHours} jam)`;
            }
        }

        // Update confidence levels
        if (confidenceLevelEl) {
            confidenceLevelEl.textContent = `${prediction.confidence}%`;
        }
        if (confidencePercentageEl) {
            confidencePercentageEl.textContent = `${prediction.confidence}%`;
        }

        console.log('[Dashboard] ✅ Prediksi berhasil diperbarui:', {
            periode: selectedHours + ' jam',
            daya: prediction.avgWatt + ' W',
            energi: prediction.totalKwh.toFixed(3) + ' kWh',
            confidence: prediction.confidence + '%'
        });
    }).catch(error => {
        console.error('[Dashboard] Error updating prediction:', error);
    });
}

async function calculateAdvancedPrediction(data, targetHours) {
    if (!data || data.length === 0) {
        return {
            avgWatt: 0,
            totalKwh: 0,
            confidence: 50
        };
    }

    // Calculate trend using linear regression
    let prediction, confidence;

    if (window.LinearRegressionPredictor) {
        try {
            const predictor = new window.LinearRegressionPredictor();
            const historicalData = data.map((value, index) => ({
                daya: value,
                time: index
            }));

            const result = await predictor.predict(historicalData, targetHours);
            prediction = result.prediction || 0;
            confidence = Math.round((result.r2 || 0.5) * 100);

            console.log('[Dashboard] 📊 Linear regression hasil:', {
                prediction: prediction,
                r2: result.r2,
                equation: result.equation
            });
        } catch (error) {
            console.warn('[Dashboard] Linear regression gagal, menggunakan fallback:', error);
            prediction = null;
        }
    }

    if (!prediction) {
        // Fallback calculation if linear regression not available
        const recentData = data.slice(-Math.min(10, data.length));
        const avgRecent = recentData.reduce((sum, val) => sum + val, 0) / recentData.length;
        const avgAll = data.reduce((sum, val) => sum + val, 0) / data.length;

        // Simple trend analysis
        const trend = avgRecent > avgAll ? 1.05 : 0.95;
        prediction = Math.round(avgRecent * trend);
        confidence = 75;

        console.log('[Dashboard] 📊 Fallback calculation hasil:', {
            avgRecent: avgRecent.toFixed(1),
            avgAll: avgAll.toFixed(1),
            trend: trend,
            prediction: prediction
        });
    }

    // Ensure reasonable bounds
    const avgWatt = Math.max(50, Math.min(600, prediction));
    const totalKwh = (avgWatt * targetHours) / 1000;

    // Adjust confidence based on prediction hours
    if (targetHours > 24) {
        confidence = Math.max(confidence - 10, 50);
    } else if (targetHours <= 6) {
        confidence = Math.min(confidence + 5, 95);
    }

    return {
        avgWatt: Math.round(avgWatt),
        totalKwh: totalKwh,
        confidence: Math.round(confidence)
    };
}

window.showElectricityModal = showElectricityModal;
window.handlePredictionChange = handlePredictionChange;
window.calculateAdvancedPrediction = calculateAdvancedPrediction;
window.setupPredictionDropdown = setupPredictionDropdown;

// Integration with linear regression
window.updatePredictionFromRegression = function (predictionData) {
    const prediksiWattEl = document.getElementById('prediksiWatt');
    const prediksiKwhHarianEl = document.getElementById('prediksiKwhHarian');
    const confidenceLevelEl = document.getElementById('confidenceLevel');
    const confidencePercentageEl = document.getElementById('confidencePercentage');

    if (predictionData && prediksiWattEl && prediksiKwhHarianEl) {
        prediksiWattEl.textContent = `${predictionData.avgWatt} W`;
        prediksiKwhHarianEl.textContent = `${predictionData.totalKwh.toFixed(3)} kWh`;

        if (confidenceLevelEl) confidenceLevelEl.textContent = `${predictionData.confidence}%`;
        if (confidencePercentageEl) confidencePercentageEl.textContent = `${predictionData.confidence}%`;

        console.log('[Dashboard] ✅ Prediction updated from linear regression:', predictionData);
    }
};

document.addEventListener('DOMContentLoaded', function () {
    const btnLihatPerhitungan = document.getElementById('btnLihatPerhitungan');
    if (btnLihatPerhitungan) {
        btnLihatPerhitungan.addEventListener('click', showElectricityModal);
        console.log('[Dashboard] Modal button event listener added');
    }
});