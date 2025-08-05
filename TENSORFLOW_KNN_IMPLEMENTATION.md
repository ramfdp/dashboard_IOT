# TensorFlow.js KNN Prediksi Listrik - Dokumentasi

## 📋 Ringkasan Implementasi

Sistem prediksi penggunaan listrik telah diupgrade menggunakan **TensorFlow.js** dengan algoritma **K-Nearest Neighbors (KNN)**. Implementasi ini dirancang untuk memberikan prediksi yang akurat sambil menjaga performa optimal pada browser.

## 🚀 Fitur Utama

### 1. **TensorFlow.js dengan Optimasi**

- **Modular Import**: Hanya menggunakan `@tensorflow/tfjs-core`, `@tensorflow/tfjs-converter`, dan `@tensorflow/tfjs-backend-cpu`
- **Async Loading**: Script dimuat dengan `async defer` untuk tidak memblokir rendering
- **Size Optimized**: Ukuran library diminimalkan dengan hanya menggunakan modul yang diperlukan

### 2. **K-Nearest Neighbors Algorithm**

- **Feature Engineering**: 6 fitur per data point (hour, dayOfWeek, power, trend, seasonal, lag)
- **Sequence Learning**: Menggunakan 12 jam terakhir untuk prediksi
- **Distance Weighting**: Inverse distance weighting untuk prediksi yang lebih akurat
- **Confidence Scoring**: Berdasarkan konsistensi tetangga terdekat

### 3. **Web Worker Integration**

- **Non-blocking Computation**: Training dan prediksi berjalan di Web Worker
- **Fallback Mechanism**: Jika Web Worker tidak tersedia, menggunakan main thread
- **Timeout Protection**: Timeout 30 detik untuk mencegah hanging

### 4. **Performance Optimizations**

- **Lazy Loading**: Model hanya dimuat saat user klik "Lihat Perhitungan"
- **Data Normalization**: Min-max scaling untuk stabilitas numerik
- **Memory Management**: Pembatasan ukuran data untuk mencegah memory leak

## 📁 Struktur File

```
public/assets/js/
├── tensorflow-knn-predictor.js     # Core KNN predictor dengan TensorFlow.js
├── electricity-knn-calculator.js   # Main calculator untuk UI
├── knn-worker.js                   # Web Worker untuk komputasi berat
└── (old files replaced)
```

## 🔧 Konfigurasi

### Model Parameters

```javascript
kValue = 5; // Jumlah tetangga terdekat
sequenceLength = 12; // Panjang sekuens (jam)
featureSize = 6; // Jumlah fitur per data point
minDataPoints = 12; // Minimum data untuk training
trainingThreshold = 24; // Minimum data untuk prediksi akurat
```

### TensorFlow.js Setup

```javascript
// CDN yang digunakan
@tensorflow/tfjs-core@4.15.0
@tensorflow/tfjs-converter@4.15.0
@tensorflow/tfjs-backend-cpu@4.15.0
```

## 📊 Alur Kerja

### 1. **Inisialisasi**

```
Load TensorFlow.js → Initialize KNN Predictor → Setup Web Worker → Ready
```

### 2. **Training Process**

```
Raw Data → Normalization → Feature Extraction → Sequence Creation → KNN Training
```

### 3. **Prediction Process**

```
Current Data → Feature Engineering → K-NN Search → Distance Weighting → Denormalization → Results
```

## 🎯 Algoritma KNN

### Feature Engineering

Setiap data point memiliki 6 fitur:

1. **Hour**: Jam (dinormalisasi 0-1)
2. **Day of Week**: Hari dalam minggu (dinormalisasi 0-1)
3. **Power**: Nilai daya saat ini
4. **Trend**: Slope dari 3 data terakhir
5. **Seasonal**: Faktor musiman berdasarkan jam dan hari
6. **Lag**: Nilai jam sebelumnya

### Distance Calculation

```javascript
distance = sqrt(sum((feature1[i] - feature2[i])²))
```

### Weighted Prediction

```javascript
weight = 1 / (distance + ε)
prediction = Σ(weight[i] × value[i]) / Σ(weight[i])
```

## 📈 Confidence Scoring

Confidence dihitung berdasarkan konsistensi nilai tetangga terdekat:

```javascript
variance = Σ(value[i] - mean)² / n
confidence = max(0.1, min(1.0, 1 - variance))
```

## 🚀 Performance Optimizations

### 1. **Script Loading**

- TensorFlow.js dimuat secara async dengan defer
- Initialization dilakukan bertahap untuk menghindari blocking
- Fallback mechanism jika library gagal dimuat

### 2. **Memory Management**

- Data training dibatasi untuk mencegah memory overflow
- Garbage collection otomatis untuk data yang tidak digunakan
- Efficient data structures untuk mengurangi footprint

### 3. **Computation Optimization**

- Web Worker untuk training dan prediksi heavy computation
- Main thread hanya untuk UI updates
- Async/await pattern untuk non-blocking operations

## 📱 UI Integration

### Dashboard Integration

- Modal hanya muncul saat user klik "Lihat Perhitungan"
- Real-time loading indicators
- Error handling dengan user-friendly messages
- Responsive design untuk semua device

### User Experience

- Confidence indicator dengan color coding
- Progress indicators untuk training dan prediksi
- Indonesian language interface
- Intuitive controls dan feedback

## 🔍 Monitoring & Debugging

### Console Logging

```javascript
// Training
"Memulai training model KNN...";
"Model KNN berhasil dilatih dengan X sampel (Web Worker/Main Thread)";

// Prediction
"Memulai prediksi KNN...";
"Prediksi KNN selesai untuk X jam (Web Worker/Main Thread)";

// Errors
"TensorFlow.js belum siap";
"Data tidak cukup untuk training";
"Web Worker error: ...";
```

### Performance Monitoring

- Training time tracking
- Prediction latency measurement
- Memory usage monitoring
- Web Worker availability detection

## 🛠️ Troubleshooting

### Common Issues

1. **TensorFlow.js tidak dimuat**

   - Periksa koneksi internet
   - Cek console untuk errors
   - Fallback ke main thread jika perlu

2. **Web Worker error**

   - Browser compatibility issue
   - Script path tidak ditemukan
   - Automatic fallback ke main thread

3. **Training gagal**

   - Data tidak cukup (< 24 points)
   - Invalid data format
   - Memory overflow

4. **Prediksi tidak akurat**
   - Perlu lebih banyak training data
   - Feature engineering perlu adjustment
   - K value perlu tuning

## 📊 Expected Performance

### Training Time

- **Web Worker**: 100-500ms untuk 100 data points
- **Main Thread**: 200-800ms untuk 100 data points

### Prediction Time

- **24 jam prediksi**: 50-200ms
- **72 jam prediksi**: 150-500ms

### Memory Usage

- **TensorFlow.js**: ~15-25MB
- **Training Data**: ~1-5MB per 1000 points
- **Web Worker**: ~5-10MB additional

### Accuracy

- **Confidence > 80%**: Prediksi sangat akurat
- **Confidence 60-80%**: Prediksi cukup akurat
- **Confidence < 60%**: Perlu lebih banyak data

## 🔄 Migration dari Sistem Lama

### Changes Made

1. ❌ **Removed**: Linear regression, ensemble, moving average
2. ✅ **Added**: TensorFlow.js KNN dengan Web Worker
3. 🔄 **Updated**: UI untuk menampilkan KNN metrics
4. 🌐 **Enhanced**: Indonesian language support

### Backward Compatibility

- API endpoints tetap sama
- Database schema tidak berubah
- Existing data tetap dapat digunakan

## 🎯 Future Enhancements

### Possible Improvements

1. **Model Persistence**: Save/load trained models
2. **Advanced Features**: Weather data, seasonal patterns
3. **Real-time Training**: Incremental learning
4. **Multi-location**: Support untuk multiple sensors
5. **Edge Computing**: WASM untuk performance maksimal

---

## 📝 Kesimpulan

Implementasi TensorFlow.js KNN memberikan prediksi yang akurat dengan performa optimal. Sistem dirancang untuk:

- ⚡ **Performance**: Web Worker + optimized TensorFlow.js
- 🎯 **Accuracy**: Advanced KNN dengan feature engineering
- 📱 **User Experience**: Responsive UI dengan feedback real-time
- 🌐 **Accessibility**: Full Indonesian language support
- 🔧 **Maintainability**: Clean architecture dengan error handling

Sistem siap untuk production dengan monitoring dan debugging tools yang komprehensif.
