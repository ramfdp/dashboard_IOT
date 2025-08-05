/**
 * Web Worker untuk Komputasi KNN yang Intensif
 * Menghindari blocking UI thread saat training dan prediksi
 */

// Import TensorFlow.js dalam Web Worker
importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core@4.15.0/dist/tf-core.min.js');
importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter@4.15.0/dist/tf-converter.min.js');
importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-cpu@4.15.0/dist/tf-backend-cpu.min.js');

class KNNWorker {
    constructor() {
        this.trainingData = [];
        this.trainingLabels = [];
        this.scaler = { min: 0, max: 1, range: 1 };
        this.kValue = 5;
        this.sequenceLength = 12;
        this.featureSize = 6;

        this.initializeTensorFlow();
    }

    async initializeTensorFlow() {
        try {
            await tf.setBackend('cpu');
            await tf.ready();
            console.log('TensorFlow.js ready in Web Worker');
        } catch (error) {
            console.error('Error initializing TensorFlow in Worker:', error);
        }
    }

    normalizeData(data) {
        if (data.length === 0) return [];

        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;

        this.scaler = { min, max, range };

        return data.map(value => (value - min) / range);
    }

    extractFeatures(powerData, index) {
        const date = new Date();
        date.setHours(date.getHours() + index);

        const hour = date.getHours();
        const dayOfWeek = date.getDay();
        const power = powerData[Math.max(0, powerData.length - 1 - index)] || 0;

        const recentData = powerData.slice(-3);
        const trend = recentData.length >= 2 ?
            (recentData[recentData.length - 1] - recentData[0]) / (recentData.length - 1) : 0;

        const seasonal = this.getSeasonalFactor(hour, dayOfWeek);
        const lag = powerData[Math.max(0, powerData.length - 2)] || power;

        return [
            hour / 24,
            dayOfWeek / 7,
            power,
            trend,
            seasonal,
            lag
        ];
    }

    getSeasonalFactor(hour, dayOfWeek) {
        const isBusinessHour = hour >= 8 && hour <= 17;
        const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

        if (isWeekday && isBusinessHour) return 1.0;
        if (isWeekday && !isBusinessHour) return 0.3;
        if (!isWeekday && isBusinessHour) return 0.4;
        return 0.2;
    }

    calculateDistance(features1, features2) {
        let sum = 0;
        for (let i = 0; i < features1.length; i++) {
            const diff = features1[i] - features2[i];
            sum += diff * diff;
        }
        return Math.sqrt(sum);
    }

    async trainModel(powerData) {
        try {
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

            return {
                success: true,
                samples: this.trainingData.length,
                features: this.featureSize * this.sequenceLength
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async predict(powerData, hoursAhead = 24) {
        try {
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

            return {
                success: true,
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
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    calculateVariance(values) {
        if (values.length <= 1) return 0;

        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    }
}

// Initialize worker
const knnWorker = new KNNWorker();

// Handle messages from main thread
self.addEventListener('message', async function (e) {
    const { id, type, data } = e.data;

    try {
        let result;

        switch (type) {
            case 'train':
                result = await knnWorker.trainModel(data.powerData);
                break;

            case 'predict':
                result = await knnWorker.predict(data.powerData, data.hoursAhead);
                break;

            default:
                result = { success: false, error: 'Unknown operation type' };
        }

        // Send result back to main thread
        self.postMessage({
            id: id,
            success: true,
            result: result
        });

    } catch (error) {
        // Send error back to main thread
        self.postMessage({
            id: id,
            success: false,
            error: error.message
        });
    }
});
