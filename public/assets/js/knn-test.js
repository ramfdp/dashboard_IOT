/**
 * Simple test to initialize KNN electricity calculator
 */

document.addEventListener('DOMContentLoaded', function () {
    console.log('KNN Calculator Test - DOM loaded');

    // Wait for all dependencies to load
    setTimeout(function () {
        // Test if canvas exists
        const canvas = document.getElementById('wattChart');
        console.log('Canvas found:', !!canvas);

        // Test if data exists
        if (canvas) {
            const labels = JSON.parse(canvas.dataset.labels || '[]');
            const values = JSON.parse(canvas.dataset.values || '[]');
            console.log('Data labels:', labels.length);
            console.log('Data values:', values.length);
            console.log('Sample data:', values.slice(0, 5));
        }

        // Test TensorFlow availability
        console.log('TensorFlow available:', typeof tf !== 'undefined');
        console.log('TensorFlowKNNPredictor available:', typeof TensorFlowKNNPredictor !== 'undefined');
        console.log('ElectricityKNNCalculator available:', typeof ElectricityKNNCalculator !== 'undefined');

        // Test modal elements
        const modal = document.getElementById('modalPerhitunganListrik');
        const button = document.getElementById('btnLihatPerhitungan');
        console.log('Modal exists:', !!modal);
        console.log('Button exists:', !!button);

        // Initialize calculator if available
        if (typeof ElectricityKNNCalculator !== 'undefined' && canvas) {
            console.log('Initializing KNN Calculator...');
            try {
                window.knnCalculator = new ElectricityKNNCalculator(canvas);
                console.log('KNN Calculator initialized successfully');
            } catch (error) {
                console.error('Error initializing KNN Calculator:', error);
            }
        }

    }, 2000); // Wait 2 seconds for all scripts to load
});

// Manual calculation trigger for testing
function testKNNCalculation() {
    console.log('Testing KNN Calculation...');

    if (window.knnCalculator) {
        try {
            window.knnCalculator.displayEnhancedCalculations('harian');
            console.log('KNN Calculation completed');
        } catch (error) {
            console.error('Error in KNN Calculation:', error);
        }
    } else {
        console.error('KNN Calculator not available');
    }
}

// Expose test function globally
window.testKNNCalculation = testKNNCalculation;
