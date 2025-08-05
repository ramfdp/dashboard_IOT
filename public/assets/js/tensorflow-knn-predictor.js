/**
 * TensorFlow.js KNN Predictor untuk Prediksi Penggunaan Listrik
 * Menggunakan K-Nearest Neighbors untuk prediksi time series
 */

class TensorFlowKNNPredictor {
    constructor() {
        this.model = null;
        this.isModelReady = false;
        this.kValue = 5; // Number of nearest neighbors
        this.trainingData = [];
        this.trainingLabels = [];
        this.scaler = { min: 0, max: 1, range: 1 };

        // Feature configuration
        this.featureSize = 6; // [hour, dayOfWeek, power, trend, seasonal, lag]
        this.sequenceLength = 12; // Use last 12 hours for prediction

        // Web Worker for heavy computations
        this.worker = null;
        this.workerRequests = new Map();
        this.requestId = 0;

        this.initializeTensorFlow();
        this.initializeWebWorker();
    }

    /**
     * Initialize Web Worker for heavy computations
     */
    initializeWebWorker() {
        try {
            this.worker = new Worker('/assets/js/knn-worker.js');

            this.worker.addEventListener('message', (e) => {
                const { id, success, result, error } = e.data;

                if (this.workerRequests.has(id)) {
                    const { resolve, reject } = this.workerRequests.get(id);
                    this.workerRequests.delete(id);

                    if (success) {
                        resolve(result);
                    } else {
                        reject(new Error(error));
                    }
                }
            });

            this.worker.addEventListener('error', (error) => {
                console.error('Web Worker error:', error);
            });

            console.log('Web Worker initialized for KNN computations');
        } catch (error) {
            console.warn('Web Worker not available, using main thread:', error);
            this.worker = null;
        }
    }

    /**
     * Send request to Web Worker
     */
    sendWorkerRequest(type, data) {
        return new Promise((resolve, reject) => {
            if (!this.worker) {
                reject(new Error('Web Worker not available'));
                return;
            }

            const id = ++this.requestId;
            this.workerRequests.set(id, { resolve, reject });

            this.worker.postMessage({
                id: id,
                type: type,
                data: data
            });

            // Timeout after 30 seconds
            setTimeout(() => {
                if (this.workerRequests.has(id)) {
                    this.workerRequests.delete(id);
                    reject(new Error('Worker request timeout'));
                }
            }, 30000);
        });
    }
    /**
     * Initialize TensorFlow.js when available
     */
    async initializeTensorFlow() {
        // Wait for TensorFlow.js to load
        const checkTensorFlow = () => {
            if (typeof tf !== 'undefined') {
                this.setupTensorFlow();
            } else {
                setTimeout(checkTensorFlow, 100);
            }
        };
        checkTensorFlow();
    }

    /**
     * Setup TensorFlow.js environment
     */
    async setupTensorFlow() {
        try {
            // Set backend to CPU for better compatibility
            await tf.setBackend('cpu');
            await tf.ready();

            console.log('TensorFlow.js siap:', tf.version);
            this.isModelReady = true;

            // Initialize empty model structure
            this.createKNNModel();

        } catch (error) {
            console.error('Error initializing TensorFlow.js:', error);
        }
    }

    /**
     * Create KNN model structure
     */
    createKNNModel() {
        // KNN doesn't need a traditional model, we'll implement the algorithm manually
        this.trainingData = [];
        this.trainingLabels = [];
        console.log('Model KNN siap untuk training');
    }

    /**
     * Normalize data to [0, 1] range
     */
    normalizeData(data) {
        if (data.length === 0) return [];

        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;

        this.scaler = { min, max, range };

        return data.map(value => (value - min) / range);
    }

    /**
     * Denormalize data back to original range
     */
    denormalizeData(normalizedData) {
        return normalizedData.map(value =>
            value * this.scaler.range + this.scaler.min
        );
    }

    /**
     * Extract features from time series data
     */
    extractFeatures(powerData, index) {
        const date = new Date();
        date.setHours(date.getHours() + index);

        const hour = date.getHours();
        const dayOfWeek = date.getDay();
        const power = powerData[Math.max(0, powerData.length - 1 - index)] || 0;

        // Calculate trend (simple slope of last 3 points)
        const recentData = powerData.slice(-3);
        const trend = recentData.length >= 2 ?
            (recentData[recentData.length - 1] - recentData[0]) / (recentData.length - 1) : 0;

        // Seasonal factor (simplified)
        const seasonal = this.getSeasonalFactor(hour, dayOfWeek);

        // Lag feature (previous hour value)
        const lag = powerData[Math.max(0, powerData.length - 2)] || power;

        return [
            hour / 24,           // Normalized hour
            dayOfWeek / 7,       // Normalized day of week
            power,               // Current power (will be normalized)
            trend,               // Trend
            seasonal,            // Seasonal factor
            lag                  // Lag feature
        ];
    }

    /**
     * Get seasonal factor for hour and day
     */
    getSeasonalFactor(hour, dayOfWeek) {
        // Business hours factor
        const isBusinessHour = hour >= 8 && hour <= 17;
        const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

        if (isWeekday && isBusinessHour) return 1.0;
        if (isWeekday && !isBusinessHour) return 0.3;
        if (!isWeekday && isBusinessHour) return 0.4;
        return 0.2; // Weekend, non-business hours
    }

    /**
     * Calculate Euclidean distance between two feature vectors
     */
    calculateDistance(features1, features2) {
        let sum = 0;
        for (let i = 0; i < features1.length; i++) {
            const diff = features1[i] - features2[i];
            sum += diff * diff;
        }
        return Math.sqrt(sum);
    }

    /**
     * Train the KNN model with historical data (using Web Worker if available)
     */
    async trainModel(powerData) {
        if (!this.isModelReady) {
            throw new Error('TensorFlow.js belum siap');
        }

        if (powerData.length < this.sequenceLength) {
            throw new Error('Data tidak cukup untuk training');
        }

        console.log('Memulai training model KNN...');

        try {
            // Use Web Worker if available for heavy computation
            if (this.worker) {
                const result = await this.sendWorkerRequest('train', {
                    powerData: powerData
                });

                if (result.success) {
                    // Update local state
                    this.trainingData = Array(result.samples).fill(null); // Placeholder
                    this.trainingLabels = Array(result.samples).fill(null); // Placeholder

                    console.log(`Model KNN berhasil dilatih dengan ${result.samples} sampel (Web Worker)`);
                    return result;
                } else {
                    throw new Error(result.error);
                }
            } else {
                // Fallback to main thread
                return await this.trainModelMainThread(powerData);
            }
        } catch (error) {
            console.error('Error training model:', error);
            throw error;
        }
    }

    /**
     * Fallback training method for main thread
     */
    async trainModelMainThread(powerData) {
        const normalizedPower = this.normalizeData(powerData);

        this.trainingData = [];
        this.trainingLabels = [];

        for (let i = this.sequenceLength; i < normalizedPower.length; i++) {
            const sequence = [];
            for (let j = 0; j < this.sequenceLength; j++) {
                const features = this.extractFeatures(normalizedPower, i - this.sequenceLength + j);
                sequence.push(...features);
            }

            this.trainingData.push(sequence);
            this.trainingLabels.push(normalizedPower[i]);
        }

        console.log(`Model KNN berhasil dilatih dengan ${this.trainingData.length} sampel (Main Thread)`);
        return {
            success: true,
            samples: this.trainingData.length,
            features: this.featureSize * this.sequenceLength
        };
    }

    /**
     * Make predictions using KNN (using Web Worker if available)
     */
    async predict(powerData, hoursAhead = 24) {
        if (!this.isModelReady) {
            throw new Error('Model belum siap');
        }

        if (this.trainingData.length === 0 && !this.worker) {
            throw new Error('Model belum dilatih');
        }

        console.log('Memulai prediksi KNN...');

        try {
            // Use Web Worker if available for heavy computation
            if (this.worker) {
                const result = await this.sendWorkerRequest('predict', {
                    powerData: powerData,
                    hoursAhead: hoursAhead
                });

                if (result.success) {
                    console.log(`Prediksi KNN selesai untuk ${hoursAhead} jam (Web Worker)`);

                    return {
                        algorithm: 'K-Nearest Neighbors (TensorFlow.js + Web Worker)',
                        model_info: {
                            k_value: this.kValue,
                            training_samples: result.predictions ? result.predictions.length : 0,
                            sequence_length: this.sequenceLength,
                            feature_size: this.featureSize,
                            computation: 'Web Worker'
                        },
                        predictions: result.predictions,
                        summary: result.summary
                    };
                } else {
                    throw new Error(result.error);
                }
            } else {
                // Fallback to main thread
                return await this.predictMainThread(powerData, hoursAhead);
            }
        } catch (error) {
            console.error('Error generating predictions:', error);
            throw error;
        }
    }

    /**
     * Fallback prediction method for main thread
     */
    async predictMainThread(powerData, hoursAhead = 24) {
        const predictions = [];
        let currentData = [...powerData];

        for (let hour = 1; hour <= hoursAhead; hour++) {
            const normalizedCurrent = this.normalizeData(currentData);

            const currentSequence = [];
            for (let j = 0; j < this.sequenceLength; j++) {
                const features = this.extractFeatures(
                    normalizedCurrent,
                    normalizedCurrent.length - this.sequenceLength + j
                );
                currentSequence.push(...features);
            }

            const distances = this.trainingData.map((trainData, index) => ({
                distance: this.calculateDistance(currentSequence, trainData),
                label: this.trainingLabels[index],
                index: index
            }));

            distances.sort((a, b) => a.distance - b.distance);
            const kNearest = distances.slice(0, this.kValue);

            let weightedSum = 0;
            let totalWeight = 0;

            kNearest.forEach(neighbor => {
                const weight = neighbor.distance === 0 ? 1 : 1 / (neighbor.distance + 1e-8);
                weightedSum += neighbor.label * weight;
                totalWeight += weight;
            });

            const prediction = totalWeight > 0 ? weightedSum / totalWeight : 0;
            const denormalizedPrediction = prediction * this.scaler.range + this.scaler.min;

            const neighborValues = kNearest.map(n => n.label);
            const variance = this.calculateVariance(neighborValues);
            const confidence = Math.max(0.1, Math.min(1.0, 1 - variance));

            predictions.push({
                hour: hour,
                predicted_power: Math.max(0, Math.round(denormalizedPrediction * 100) / 100),
                predicted_energy: Math.round(denormalizedPrediction / 10) / 100,
                confidence: Math.round(confidence * 100) / 100,
                nearest_neighbors: kNearest.length
            });

            currentData.push(denormalizedPrediction);

            if (currentData.length > powerData.length + hour) {
                currentData = currentData.slice(-powerData.length);
            }
        }

        console.log(`Prediksi KNN selesai untuk ${hoursAhead} jam (Main Thread)`);

        return {
            algorithm: 'K-Nearest Neighbors (TensorFlow.js)',
            model_info: {
                k_value: this.kValue,
                training_samples: this.trainingData.length,
                sequence_length: this.sequenceLength,
                feature_size: this.featureSize,
                computation: 'Main Thread'
            },
            predictions: predictions,
            summary: {
                next_hour_power: predictions[0]?.predicted_power || 0,
                next_24h_energy: Math.round(
                    predictions.slice(0, 24).reduce((sum, p) => sum + p.predicted_power, 0) / 10
                ) / 100,
                average_confidence: Math.round(
                    predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length * 100
                ) / 100
            }
        };
    }

    /**
     * Calculate variance for confidence estimation
     */
    calculateVariance(values) {
        if (values.length <= 1) return 0;

        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    }

    /**
     * Get model status
     */
    getModelStatus() {
        return {
            isReady: this.isModelReady,
            isTrained: this.trainingData.length > 0,
            trainingsamples: this.trainingData.length,
            tensorflowVersion: typeof tf !== 'undefined' ? tf.version : 'Not loaded'
        };
    }

    /**
     * Reset model
     */
    resetModel() {
        this.trainingData = [];
        this.trainingLabels = [];
        console.log('Model KNN telah direset');
    }
}

// Export for global use
window.TensorFlowKNNPredictor = TensorFlowKNNPredictor;
