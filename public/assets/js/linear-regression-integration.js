/**
 * Linear Regression Integration Script
 * Menggantikan KNN dengan Linear Regression untuk prediksi listrik
 */

document.addEventListener('DOMContentLoaded', function () {
    // Initialize Linear Regression integration
    setTimeout(initializeLinearRegressionIntegration, 1500);
});

function initializeLinearRegressionIntegration() {
    console.log('[Dashboard] Initializing Linear Regression integration...');

    // Check if Linear Regression calculator is available
    if (typeof window.ElectricityLinearRegressionCalculator !== 'undefined') {
        // Update prediction display
        updatePredictionDisplay();

        // Setup periodic updates
        setInterval(updatePredictionDisplay, 30000); // Update every 30 seconds

        console.log('[Dashboard] Linear Regression integration ready');
    } else {
        console.warn('[Dashboard] Linear Regression calculator not available, retrying...');
        setTimeout(initializeLinearRegressionIntegration, 1000);
    }
}

/**
 * Update prediction display using Linear Regression
 */
async function updatePredictionDisplay() {
    try {
        if (!window.electricityCalculator || !window.electricityCalculator.linearPredictor) {
            console.log('[Dashboard] Linear Regression predictor not ready yet');
            return;
        }

        // Get current data for prediction
        const currentData = window.electricityCalculator.chartData || [];

        if (currentData.length > 0) {
            // Get prediction from Linear Regression
            const prediction = await window.electricityCalculator.linearPredictor.predict(currentData, 24);

            // Update UI elements
            updatePredictionUI(prediction);

            console.log('[Dashboard] Prediction updated:', prediction);
        }

    } catch (error) {
        console.error('[Dashboard] Failed to update prediction:', error);
    }
}

/**
 * Update prediction UI elements
 */
function updatePredictionUI(prediction) {
    try {
        // Update prediction values
        const prediksiWatt = document.getElementById('prediksiWatt');
        if (prediksiWatt) {
            prediksiWatt.textContent = `${prediction.prediction} W`;
        }

        // Calculate daily energy (prediction * 24 hours / 1000 for kWh)
        const dailyEnergy = (prediction.prediction * 24 / 1000).toFixed(2);
        const prediksiKwhHarian = document.getElementById('prediksiKwhHarian');
        if (prediksiKwhHarian) {
            prediksiKwhHarian.textContent = `${dailyEnergy} kWh`;
        }

    } catch (error) {
        console.error('[Dashboard] Failed to update prediction UI:', error);
    }
}

/**
 * Handle modal open for electricity analysis
 */
function showElectricityAnalysis() {
    // Make sure Linear Regression calculator is initialized
    if (window.electricityCalculator) {
        // Refresh analysis when modal opens
        window.electricityCalculator.refresh();
    }

    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('electricityAnalysisModal'));
    modal.show();
}

/**
 * Export Linear Regression results
 */
function exportLinearRegressionResults() {
    if (window.electricityCalculator && typeof window.electricityCalculator.exportResults === 'function') {
        window.electricityCalculator.exportResults();
    } else {
        console.warn('[Dashboard] Export function not available');
        alert('Fitur export belum tersedia. Silakan coba lagi nanti.');
    }
}

// Make functions globally available
window.showElectricityAnalysis = showElectricityAnalysis;
window.exportLinearRegressionResults = exportLinearRegressionResults;
window.updatePredictionDisplay = updatePredictionDisplay;

console.log('[Dashboard] Linear Regression integration script loaded');
