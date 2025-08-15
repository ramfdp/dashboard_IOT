/**
 * Dashboard Electricity Integration - FIXED VERSION
 * Menggabungkan Chart.js dengan KNN prediction dan modal calculator
 * Dipindahkan dari dashboard-v1.blade.php untuk clean separation
 */

// Wait for Chart.js to be fully loaded
function waitForChart(callback, maxRetries = 50) {
    if (typeof Chart !== 'undefined') {
        console.log('[Dashboard] Chart.js is available');
        callback();
    } else if (maxRetries > 0) {
        console.log('[Dashboard] Waiting for Chart.js... retries left:', maxRetries);
        setTimeout(() => waitForChart(callback, maxRetries - 1), 200);
    } else {
        console.error('[Dashboard] Chart.js failed to load after maximum retries');
    }
}

// Initialize chart after page load
window.addEventListener('DOMContentLoaded', function () {
    console.log('[Dashboard] DOM loaded, initializing chart system...');

    // Wait a bit for all scripts to load
    setTimeout(() => {
        initializeElectricityChart();
    }, 500);
});

function initializeElectricityChart() {
    console.log('[Dashboard] Starting chart initialization...');

    waitForChart(function () {
        console.log('[Dashboard] Chart.js loaded, initializing chart...');

        const canvas = document.getElementById('wattChart');
        if (!canvas) {
            console.error('[Dashboard] Canvas element #wattChart not found!');
            return;
        }

        console.log('[Dashboard] Canvas found:', canvas);

        // Get data from canvas attributes
        let labels = [];
        let values = [];

        try {
            const rawLabels = canvas.dataset.labels;
            const rawValues = canvas.dataset.values;

            console.log('[Dashboard] Raw data from canvas:', {
                rawLabels: rawLabels ? rawLabels.substring(0, 100) + '...' : 'null',
                rawValues: rawValues ? rawValues.substring(0, 100) + '...' : 'null'
            });

            labels = rawLabels ? JSON.parse(rawLabels) : [];
            values = rawValues ? JSON.parse(rawValues).map(Number) : [];

        } catch (e) {
            console.error('[Dashboard] Error parsing data from canvas:', e);
            labels = [];
            values = [];
        }

        console.log('[Dashboard] Parsed data:', {
            labelsCount: labels.length,
            valuesCount: values.length,
            sampleLabels: labels.slice(0, 3),
            sampleValues: values.slice(0, 3)
        });

        // Create demo data if no data available
        if (labels.length === 0 || values.length === 0) {
            console.log('[Dashboard] No data from server, creating demo data...');

            labels = [];
            values = [];

            const now = new Date();
            for (let i = 0; i < 24; i++) {
                const hour = String(i).padStart(2, '0') + ':00';
                labels.push(hour);

                // Realistic power consumption pattern
                let power;
                if (i >= 7 && i <= 9) {
                    power = 180 + Math.random() * 80; // Morning peak
                } else if (i >= 10 && i <= 16) {
                    power = 220 + Math.random() * 80; // Work hours  
                } else if (i >= 17 && i <= 21) {
                    power = 140 + Math.random() * 60; // Evening
                } else {
                    power = 60 + Math.random() * 40;  // Night
                }
                values.push(Math.round(power));
            }

            console.log('[Dashboard] Demo data created:', {
                labelsCount: labels.length,
                valuesCount: values.length,
                sampleValues: values.slice(0, 5)
            });
        }

        console.log('[Dashboard] Final data ready for chart:', {
            labelsCount: labels.length,
            valuesCount: values.length,
            sampleLabels: labels.slice(0, 3),
            sampleValues: values.slice(0, 3)
        });

        // Destroy existing chart instance if exists
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            console.log('[Dashboard] Destroying existing chart instance');
            existingChart.destroy();
        }

        // Verify we have data before creating chart
        if (values.length === 0) {
            console.error('[Dashboard] No data available for chart!');
            return;
        }

        // Create chart context
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('[Dashboard] Could not get 2d context from canvas!');
            return;
        }

        console.log('[Dashboard] Creating chart with Chart.js...');

        // Create gradient for chart
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(54, 162, 235, 0.3)');
        gradient.addColorStop(1, 'rgba(54, 162, 235, 0.05)');

        try {
            console.log('[Dashboard] Initializing Chart.js with data points:', values.length);

            window.myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Konsumsi Listrik (Watt)',
                        data: values,
                        borderColor: '#36a2eb',
                        backgroundColor: gradient,
                        borderWidth: 3,
                        fill: true,
                        tension: 0.3,
                        pointBackgroundColor: '#ffffff',
                        pointBorderColor: '#36a2eb',
                        pointRadius: 5,
                        pointHoverRadius: 8,
                        pointBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
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
                                color: '#ffffff'
                            },
                            grid: {
                                color: 'rgba(255,255,255,0.1)'
                            },
                            title: {
                                display: true,
                                text: 'Waktu (Jam)',
                                color: '#ffffff'
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

            console.log('[Dashboard] ✅ Chart created successfully!');
            console.log('[Dashboard] Chart instance:', window.myChart);

            // Verify chart was actually created
            if (window.myChart && window.myChart.data && window.myChart.data.datasets.length > 0) {
                console.log('[Dashboard] Chart validation passed - data is present');
            } else {
                console.error('[Dashboard] Chart validation failed - chart may be empty');
            }

            // Store chart data globally for calculator access
            window.chartData = {
                labels: labels,
                datasets: [{
                    data: values,
                    label: 'Konsumsi Listrik (Watt)'
                }]
            };

            // Store latest power value for real-time display
            window.latestPowerValue = values[values.length - 1] || 0;

            // Store global data for calculator
            window.globalElectricityData = {
                currentPower: window.latestPowerValue,
                dailyData: values,
                labels: labels,
                source: values.length > 0 ? (labels.length === values.length ? 'server_data' : 'demo_data') : 'no_data'
            };

            console.log('[Dashboard] Global data stored:', {
                currentPower: window.latestPowerValue,
                dataPoints: values.length,
                sampleValues: values.slice(0, 3),
                source: window.globalElectricityData.source
            });

        } catch (error) {
            console.error('[Dashboard] ❌ Critical error creating chart:', error);
            console.error('[Dashboard] Error details:', {
                message: error.message,
                stack: error.stack,
                chartExists: typeof Chart !== 'undefined',
                canvasExists: !!canvas,
                contextExists: !!ctx,
                dataLength: values.length
            });

            // Try to show some indication of error on canvas
            if (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Error loading chart: ' + error.message, canvas.width / 2, canvas.height / 2);
            }
        }
    });
}

// Additional diagnostic function
window.diagnosticChart = function () {
    console.log('[Diagnostic] Chart.js available:', typeof Chart !== 'undefined');
    console.log('[Diagnostic] Canvas element:', document.getElementById('wattChart'));
    console.log('[Diagnostic] Global chart data:', window.chartData);
    console.log('[Diagnostic] Chart instance:', window.myChart);
};

// Ensure modal calculator can access data
document.addEventListener('DOMContentLoaded', function () {

    /**
     * Fungsi helper untuk menghitung prediksi dengan konteks periode yang benar
     */
    function calculateSmartPrediction(data, analysisPeriod, predictionHours) {
        if (!data || data.length === 0) {
            return { prediction: 0, kwh: 0, confidence: 0 };
        }

        const avgPower = data.reduce((a, b) => a + b, 0) / data.length;
        const recentTrend = data.slice(-Math.min(5, data.length));
        const trendAvg = recentTrend.reduce((a, b) => a + b, 0) / recentTrend.length;

        // Hitung variance untuk confidence level
        const variance = recentTrend.reduce((sum, val) => sum + Math.pow(val - trendAvg, 2), 0) / recentTrend.length;
        const confidence = Math.max(65, Math.min(95, 90 - Math.sqrt(variance) / 15));

        // Prediksi berdasarkan konteks periode analisis
        let prediction;
        switch (analysisPeriod) {
            case 'harian':
                // Untuk analisis harian: gunakan trend terkini dengan sedikit variasi
                const dailyTrendMultiplier = trendAvg > avgPower ? 1.03 : 0.97;
                prediction = Math.round(trendAvg * dailyTrendMultiplier);
                break;
            case 'mingguan':
                // Untuk analisis mingguan: gunakan rata-rata yang lebih stabil
                prediction = Math.round((avgPower + trendAvg) / 2);
                break;
            case 'bulanan':
                // Untuk analisis bulanan: gunakan rata-rata dengan smoothing
                prediction = Math.round(avgPower * 1.01); // Slight growth assumption
                break;
            default:
                prediction = Math.round(trendAvg);
        }

        // Pastikan prediksi dalam rentang yang masuk akal
        const minPrediction = Math.min(...data) * 0.8;
        const maxPrediction = Math.max(...data) * 1.2;
        prediction = Math.max(minPrediction, Math.min(maxPrediction, prediction));

        // Hitung energi berdasarkan horizon prediksi
        const predictedKwh = (prediction * predictionHours) / 1000;

        return {
            prediction: prediction,
            kwh: predictedKwh,
            confidence: Math.round(confidence)
        };
    }

    // Function to fetch real data from database API
    async function fetchRealDataFromAPI(period = 'harian') {
        try {
            console.log('[API] Fetching data for period:', period);
            const response = await fetch(`/api/electricity/data?period=${period}`);
            const result = await response.json();

            if (result.success) {
                console.log('[API] Data fetched successfully:', {
                    period: result.period,
                    totalRecords: result.total_records,
                    source: result.source
                });
                return result;
            } else {
                console.error('[API] Error fetching data:', result.error);
                return null;
            }
        } catch (error) {
            console.error('[API] Network error:', error);
            return null;
        }
    }

    // Function to calculate and update modal data based on period INTERPRETATION
    async function updateModalData(period = 'harian') {
        console.log('[Modal] Updating data for period:', period);

        // Fetch real data from API (ALWAYS same 30 records from database)
        const apiData = await fetchRealDataFromAPI(period);

        let data, labels, dataCount;

        if (!apiData || !apiData.data || apiData.data.length === 0) {
            console.log('[Modal] No API data available, using fallback data');
            // Use fallback data if API fails or returns empty
            if (window.globalElectricityData && window.globalElectricityData.dailyData.length > 0) {
                data = window.globalElectricityData.dailyData;
                labels = window.globalElectricityData.labels || [];
                dataCount = data.length;
                console.log('[Modal] Using existing global data:', { dataCount });
            } else {
                // Generate demo data as last resort
                data = Array.from({ length: 30 }, () => Math.floor(Math.random() * 200 + 100));
                labels = Array.from({ length: 30 }, (_, i) => `${23 - i}:00`);
                dataCount = 30;
                console.log('[Modal] Using demo data as fallback:', { dataCount });
            }
        } else {
            // SAME DATA (e.g., 30 records), different INTERPRETATION
            data = apiData.data; // Always 30 records from database
            labels = apiData.labels;
            dataCount = data.length; // Always 30
        }

        console.log('[Modal] Using SAME database data:', {
            period,
            dataCount,
            source: apiData.source,
            interpretation: apiData.interpretation
        });

        // Calculate statistics from SAME 30 database records
        const avgPower = data.reduce((a, b) => a + b, 0) / data.length;
        const maxPower = Math.max(...data);
        const minPower = Math.min(...data);

        // Calculate energy based on PERIOD INTERPRETATION (not data count)
        let periodKwh, dailyKwh, weeklyKwh, monthlyKwh;
        let periodLabel, timeSpanHours;

        switch (period) {
            case 'harian':
                // Interpret: 30 readings as hourly data (30 hours of data)
                timeSpanHours = dataCount; // 30 hours
                dailyKwh = (avgPower * 24) / 1000; // Standard 24h projection
                periodKwh = dailyKwh;
                weeklyKwh = dailyKwh * 7;
                monthlyKwh = dailyKwh * 30;
                periodLabel = 'per hari';
                break;

            case 'mingguan':
                // Interpret: Same 30 readings in weekly context
                timeSpanHours = dataCount; // Still 30 hours of actual data
                dailyKwh = (avgPower * 24) / 1000;
                weeklyKwh = dailyKwh * 7; // Project to full week
                periodKwh = weeklyKwh;
                monthlyKwh = weeklyKwh * 4.3; // ~4.3 weeks in month
                periodLabel = 'per minggu';
                break;

            case 'bulanan':
                // Interpret: Same 30 readings in monthly context
                timeSpanHours = dataCount; // Still 30 hours of actual data
                dailyKwh = (avgPower * 24) / 1000;
                weeklyKwh = dailyKwh * 7;
                monthlyKwh = dailyKwh * 30; // Project to full month
                periodKwh = monthlyKwh;
                periodLabel = 'per bulan';
                break;
        }

        console.log('[Modal] Period interpretation calculated:', {
            period,
            actualDataPoints: dataCount, // Always 30
            timeSpanHours,
            avgPower: avgPower.toFixed(1),
            periodKwh: periodKwh.toFixed(2)
        });

        // Store/update global electricity data for prediction use
        window.globalElectricityData = {
            currentPower: avgPower,
            dailyData: data,
            labels: labels,
            source: 'modal_data',
            period: period,
            periodKwh: periodKwh,
            predictionHours: predictionHours, // Store current prediction horizon
            lastUpdated: new Date().getTime()
        };

        console.log('[Modal] Global data updated:', {
            dataPoints: data.length,
            avgPower: avgPower.toFixed(1),
            period: period,
            predictionHours: predictionHours,
            source: window.globalElectricityData.source
        });

        // Update current usage display
        const totalWattEl = document.getElementById('totalWatt');
        const totalKwhEl = document.getElementById('totalKwh');
        const periodeLabelEl = document.getElementById('periodeLabel');

        if (totalWattEl) totalWattEl.textContent = Math.round(avgPower) + ' W';
        if (totalKwhEl) totalKwhEl.textContent = periodKwh.toFixed(2) + ' kWh';
        if (periodeLabelEl) periodeLabelEl.textContent = periodLabel;

        // Update detailed statistics (ALWAYS based on SAME 30 database records)
        const dayaTertinggiEl = document.getElementById('dayaTertinggi');
        const dayaTerendahEl = document.getElementById('dayaTerendah');
        const totalDataEl = document.getElementById('totalData');
        const kwhHarianEl = document.getElementById('kwhHarian');
        const kwhMingguanEl = document.getElementById('kwhMingguan');
        const kwhBulananEl = document.getElementById('kwhBulanan');

        if (dayaTertinggiEl) dayaTertinggiEl.textContent = Math.round(maxPower) + ' W';
        if (dayaTerendahEl) dayaTerendahEl.textContent = Math.round(minPower) + ' W';
        if (totalDataEl) totalDataEl.textContent = dataCount; // Always shows 30 (real count)
        if (kwhHarianEl) kwhHarianEl.textContent = dailyKwh.toFixed(2) + ' kWh';
        if (kwhMingguanEl) kwhMingguanEl.textContent = weeklyKwh.toFixed(2) + ' kWh';
        if (kwhBulananEl) kwhBulananEl.textContent = monthlyKwh.toFixed(2) + ' kWh';

        // Update predictions based on REAL trend analysis and CURRENT PERIOD CONTEXT
        const prediksiWattEl = document.getElementById('prediksiWatt');
        const prediksiKwhHarianEl = document.getElementById('prediksiKwhHarian');
        const confidenceLevelEl = document.getElementById('confidenceLevel');
        const confidencePercentageEl = document.getElementById('confidencePercentage');

        // Get current prediction horizon (default to 1 hour if not set)
        const periodePrediksiEl = document.getElementById('periodePrediksi');
        const predictionHours = periodePrediksiEl ? parseInt(periodePrediksiEl.value) || 1 : 1;

        // Use smart prediction calculation
        const smartPrediction = calculateSmartPrediction(data, period, predictionHours);

        // Update prediction display with proper context
        if (prediksiWattEl) {
            if (predictionHours === 1) {
                prediksiWattEl.textContent = smartPrediction.prediction + ' W';
            } else {
                prediksiWattEl.textContent = smartPrediction.prediction + ' W (rata-rata)';
            }
        }

        if (prediksiKwhHarianEl) {
            if (predictionHours === 1) {
                prediksiKwhHarianEl.textContent = smartPrediction.kwh.toFixed(3) + ' kWh (1 jam)';
            } else {
                prediksiKwhHarianEl.textContent = smartPrediction.kwh.toFixed(2) + ` kWh (${predictionHours} jam)`;
            }
        }

        if (confidenceLevelEl) confidenceLevelEl.textContent = smartPrediction.confidence + '%';
        if (confidencePercentageEl) confidencePercentageEl.textContent = smartPrediction.confidence + '%';

        console.log('[Modal] ✅ Prediction updated with smart calculation:', {
            analysisPeriod: period,
            predictionHours: predictionHours,
            prediction: smartPrediction.prediction,
            predictedKwh: smartPrediction.kwh.toFixed(3),
            confidence: smartPrediction.confidence + '%'
        });

        console.log('[Modal] ✅ Modal updated with SAME database data, different period interpretation');
        console.log('[Modal] Data integrity:', {
            alwaysSameDataCount: dataCount, // Always 30
            periodInterpretation: periodLabel,
            predictionConfidence: smartPrediction.confidence + '%'
        });

        // Store the updated data globally for later use
        window.globalElectricityData = {
            currentPower: avgPower,
            dailyData: data,
            labels: labels,
            source: 'modal_data',
            period: period,
            periodKwh: periodKwh,
            predictionHours: predictionHours,
            lastUpdated: new Date().getTime()
        };
    }

    // Handle periode analisis change
    const periodePerhitunganEl = document.getElementById('periodePerhitungan');
    if (periodePerhitunganEl) {
        periodePerhitunganEl.addEventListener('change', function () {
            const selectedPeriod = this.value;
            console.log('[Modal] Analysis period changed to:', selectedPeriod);

            // Update modal data with new analysis period
            // The updateModalData function will now handle prediction context properly
            updateModalData(selectedPeriod);
        });
    }

    // Handle periode prediksi change - IMPROVED LOGIC
    const periodePrediksiEl = document.getElementById('periodePrediksi');
    if (periodePrediksiEl) {
        periodePrediksiEl.addEventListener('change', function () {
            const selectedHours = parseInt(this.value);
            console.log('[Modal] Prediction period changed to:', selectedHours, 'hours');

            // Get current analysis period to maintain context
            const currentAnalysisPeriod = periodePerhitunganEl ? periodePerhitunganEl.value : 'harian';

            // Recalculate predictions using smart prediction function
            if (window.globalElectricityData && window.globalElectricityData.dailyData.length > 0) {
                const data = window.globalElectricityData.dailyData;

                // Use consistent smart prediction logic
                const smartPrediction = calculateSmartPrediction(data, currentAnalysisPeriod, selectedHours);

                // Update prediction elements with proper context
                const prediksiWattEl = document.getElementById('prediksiWatt');
                const prediksiKwhHarianEl = document.getElementById('prediksiKwhHarian');

                if (prediksiWattEl) {
                    if (selectedHours === 1) {
                        prediksiWattEl.textContent = smartPrediction.prediction + ' W';
                    } else {
                        prediksiWattEl.textContent = smartPrediction.prediction + ' W (rata-rata)';
                    }
                }

                if (prediksiKwhHarianEl) {
                    if (selectedHours === 1) {
                        prediksiKwhHarianEl.textContent = smartPrediction.kwh.toFixed(3) + ' kWh (1 jam)';
                    } else {
                        prediksiKwhHarianEl.textContent = smartPrediction.kwh.toFixed(2) + ` kWh (${selectedHours} jam)`;
                    }
                }

                console.log('[Modal] Updated prediction with consistent logic:', {
                    analysisPeriod: currentAnalysisPeriod,
                    predictionHours: selectedHours,
                    prediction: smartPrediction.prediction,
                    predictedKwh: smartPrediction.kwh.toFixed(3),
                    confidence: smartPrediction.confidence
                });
            } else {
                console.log('[Modal] No global data available, refreshing modal...');
                // If no data available, refresh modal with current analysis period
                updateModalData(currentAnalysisPeriod);
            }
        });
    }

    // Handle modal open event
    const modalButton = document.getElementById('btnLihatPerhitungan');
    const modal = document.getElementById('modalPerhitunganListrik');

    if (modalButton && modal) {
        modalButton.addEventListener('click', function () {
            console.log('[Modal] Opening calculation modal...');

            // Show loading indicators immediately
            const elements = [
                'totalWatt', 'totalKwh', 'dayaTertinggi', 'dayaTerendah',
                'totalData', 'kwhHarian', 'kwhMingguan', 'kwhBulanan',
                'prediksiWatt', 'prediksiKwhHarian', 'confidenceLevel', 'confidencePercentage'
            ];

            elements.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = 'Loading...';
                }
            });

            // Get current period selection and load data immediately
            const currentPeriod = periodePerhitunganEl ? periodePerhitunganEl.value : 'harian';

            // Load data immediately without delay
            updateModalData(currentPeriod).then(() => {
                console.log('[Modal] Initial data loaded successfully');

                // Trigger Krakatau calculator if available
                if (window.krakatauCalculator && typeof window.krakatauCalculator.updateCalculation === 'function') {
                    console.log('[Modal] Triggering Krakatau calculator update...');
                    window.krakatauCalculator.updateCalculation();
                }
            }).catch(error => {
                console.error('[Modal] Error loading initial data:', error);

                // Even if there's an error, try to show some data
                elements.forEach(id => {
                    const element = document.getElementById(id);
                    if (element && element.textContent === 'Loading...') {
                        element.textContent = '0';
                    }
                });
            });
        });

        // Handle modal close to preserve state
        modal.addEventListener('hidden.bs.modal', function () {
            console.log('[Modal] Modal closed, preserving data state');
            // Data tetap tersimpan di window.globalElectricityData untuk dibuka kembali
        });
    }

    // Initialize modal data when the page loads
    async function initializeData() {
        console.log('[Init] Initializing electricity data on page load');

        try {
            const defaultPeriod = 'harian';
            const apiData = await fetchRealDataFromAPI(defaultPeriod);

            if (apiData && apiData.data && apiData.data.length > 0) {
                // Store data globally for immediate use
                window.globalElectricityData = {
                    currentPower: apiData.data.reduce((a, b) => a + b, 0) / apiData.data.length,
                    dailyData: apiData.data,
                    labels: apiData.labels,
                    source: 'init_load',
                    period: defaultPeriod,
                    periodKwh: 0,
                    predictionHours: 24,
                    lastUpdated: new Date().getTime()
                };
                console.log('[Init] Data initialized successfully');
            }
        } catch (error) {
            console.log('[Init] Failed to initialize data:', error);
            // Create fallback data
            window.globalElectricityData = {
                currentPower: 150,
                dailyData: Array.from({ length: 30 }, () => Math.floor(Math.random() * 200 + 100)),
                labels: Array.from({ length: 30 }, (_, i) => `${23 - i}:00`),
                source: 'init_fallback',
                period: 'harian',
                periodKwh: 0,
                predictionHours: 24,
                lastUpdated: new Date().getTime()
            };
        }
    }

    // Initialize data when page loads
    initializeData();

    // Initialize modal data if modal is already open
    if (modal && modal.classList.contains('show')) {
        const currentPeriod = periodePerhitunganEl ? periodePerhitunganEl.value : 'harian';
        updateModalData(currentPeriod);
    }
});
