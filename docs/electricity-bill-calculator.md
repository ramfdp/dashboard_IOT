# Kalkulator Biaya Listrik PLN - Dokumentasi

## Overview

Sistem kalkulator biaya listrik yang terintegrasi dengan Dashboard IoT untuk menghitung estimasi tagihan listrik berdasarkan konsumsi kWh dan tarif PLN terbaru 2025.

## Fitur Utama

### 1. Perhitungan Biaya Listrik Real-time

- **Input Konsumsi**: Masukkan konsumsi dalam kWh (harian/bulanan)
- **Pilihan Tarif**: 7 jenis tarif PLN (rumah tangga & bisnis)
- **Perhitungan Otomatis**: Real-time calculation saat input berubah

### 2. Jenis Tarif yang Didukung

#### Rumah Tangga (R-1)

1. **R-1/TR 900 VA** (Bersubsidi)

   - Blok 1: 0-30 kWh = Rp 169/kWh
   - Blok 2: 30-60 kWh = Rp 360/kWh
   - Blok 3: 60-200 kWh = Rp 445/kWh
   - Blok 4: >200 kWh = Rp 495/kWh

2. **R-1/TR 1300 VA** (Bersubsidi)

   - Sama dengan 900 VA

3. **R-1/TR 2200 VA**

   - Tarif tunggal: Rp 1.352/kWh
   - Biaya beban: Rp 40.000/bulan

4. **R-1/TR 3500-5500 VA**

   - Tarif tunggal: Rp 1.444,70/kWh
   - Biaya beban: Rp 40.000/bulan

5. **R-1/TR 6600 VA+**
   - Tarif tunggal: Rp 1.444,70/kWh
   - Biaya beban: Rp 40.000/bulan

#### Bisnis (B-1)

6. **B-1/TR 1300 VA**

   - Tarif tunggal: Rp 1.352/kWh
   - Biaya beban: Rp 44.000/bulan

7. **B-1/TR 2200-200 kVA**
   - Tarif tunggal: Rp 1.444,70/kWh
   - Biaya beban: Rp 48.000/bulan

### 3. Komponen Biaya

#### Biaya Utama

- **Biaya Energi**: Konsumsi × Tarif per kWh
- **Biaya Beban**: Biaya tetap bulanan (untuk non-subsidi)

#### Pajak dan Biaya Tambahan

- **PPJ (Pajak Penerangan Jalan)**: 3% dari subtotal
- **PPN**: 11% dari subtotal (hanya untuk non-subsidi)
- **Biaya Admin**: Rp 2.500/bulan
- **Materai**: Rp 6.000 (untuk tagihan > Rp 250.000)

### 4. Fitur Prediksi

- **Prediksi Bulanan**: Berdasarkan konsumsi harian
- **Biaya per Hari**: Estimasi biaya harian
- **Tarif Rata-rata**: Biaya per kWh efektif

### 5. Perbandingan Tarif

- **Ranking Biaya**: Urutkan tarif dari termurah
- **Indikator Subsidi**: Badge untuk tarif bersubsidi
- **Rekomendasi**: Tarif terbaik untuk konsumsi tertentu

## Cara Penggunaan

### 1. Pilih Tarif

```html
<select id="tariffSelector">
  <option value="R1_1300VA" selected>R-1/TR 1300 VA (Bersubsidi)</option>
  <!-- Pilihan tarif lainnya -->
</select>
```

### 2. Input Konsumsi

```html
<input
  type="number"
  id="kwhUsageInput"
  placeholder="Masukkan konsumsi kWh"
  min="0"
  step="0.1"
  value="0"
/>
```

### 3. Auto-fill dari Dashboard

- **Tombol "Isi Otomatis"**: Mengambil data konsumsi dari monitoring real-time
- **Sumber Data**: Total kWh dari dashboard atau chart data
- **Default Value**: 5 kWh/hari jika tidak ada data

### 4. Hasil Perhitungan

- **Total Tagihan**: Ditampilkan prominent di header
- **Rincian Biaya**: Tabel breakdown per komponen
- **Summary Cards**: Statistik penting (konsumsi, tarif rata-rata, pajak, total)

## Integrasi dengan Dashboard IoT

### 1. Data Source Integration

```javascript
// Ambil data dari element dashboard
const totalKwhElement = document.getElementById("totalKwh");
const wattChart = document.getElementById("wattChart");

// Parse chart data untuk estimasi konsumsi
const values = JSON.parse(wattChart.dataset.values);
const avgWatt =
  values.reduce((sum, val) => sum + parseFloat(val), 0) / values.length;
const dailyKwh = (avgWatt * 24) / 1000;
```

### 2. Real-time Updates

- **Event Listeners**: Input changes trigger automatic calculation
- **Live Monitoring**: Sync dengan data sensor PZEM
- **Auto-refresh**: Update saat data monitoring berubah

### 3. Chart Manager Integration

```javascript
// Gunakan ChartManager untuk menghindari konflik
if (window.ChartManager) {
  window.ChartManager.destroyChartsOnCanvas("wattChart");
}
```

## Technical Implementation

### 1. Class Structure

```javascript
class ElectricityBillCalculator {
  constructor() {
    this.tariffRates = this.getTariffRates();
    this.additionalCharges = this.getAdditionalCharges();
    this.currentTariff = "R1_1300VA";
  }
}
```

### 2. Key Methods

- `calculateElectricityBill(kwhUsage, tariffType)`: Perhitungan utama
- `predictMonthlyBill(dailyKwh)`: Prediksi bulanan
- `compareTariffs(kwhUsage)`: Perbandingan tarif
- `autoFillFromCurrentUsage()`: Auto-fill dari dashboard

### 3. UI Components

- **Input Section**: Tarif selector & kWh input
- **Results Section**: Breakdown table & summary
- **Prediction Section**: Monthly forecast
- **Comparison Section**: Tariff ranking

### 4. Responsive Design

```css
@media (max-width: 768px) {
  .bill-calculator {
    padding: 20px;
  }
  .bill-summary {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}
```

## Error Handling & UX

### 1. Loading States

```javascript
showLoading() {
    const loadingDiv = document.getElementById('billCalculatorLoading');
    loadingDiv.style.display = 'block';
}
```

### 2. Error Management

- **Input Validation**: Cek nilai negatif atau kosong
- **Tariff Validation**: Pastikan tarif tersedia
- **Calculation Errors**: Handle overflow atau invalid calculations

### 3. Notifications

```javascript
showNotification(message, type) {
    // Toast-style notifications untuk feedback user
    // Types: success, error, warning, info
}
```

## Testing & Validation

### 1. Test Cases

- **Konsumsi 0 kWh**: Tidak ada perhitungan
- **Konsumsi 50 kWh**: Test blok tarif bersubsidi
- **Konsumsi 300 kWh**: Test semua blok tarif
- **Perbandingan Tarif**: Validasi ranking

### 2. Data Accuracy

- **Tarif PLN 2025**: Sesuai dengan regulasi terbaru
- **Pajak**: PPJ 3%, PPN 11% untuk non-subsidi
- **Biaya Admin**: Rp 2.500 standar PLN

### 3. Performance

- **Real-time Calculation**: < 100ms response time
- **Memory Usage**: Efficient object management
- **Mobile Responsive**: Optimized untuk semua device

## Future Enhancements

### 1. Advanced Features

- **Export PDF**: Cetak estimasi tagihan
- **Historical Analysis**: Tren konsumsi bulanan
- **Smart Recommendations**: Saran penghematan listrik

### 2. Integration Improvements

- **Database Storage**: Simpan historical calculations
- **API Integration**: Real-time tariff updates dari PLN
- **Machine Learning**: Prediksi konsumsi cerdas

### 3. UI/UX Enhancements

- **Charts**: Visualisasi breakdown biaya
- **Dark/Light Theme**: Theme switching
- **Localization**: Multi-language support

## Support & Maintenance

### File Locations

- **JavaScript**: `/public/assets/js/electricity-bill-calculator.js`
- **CSS**: `/public/assets/css/electricity-bill-calculator.css`
- **View**: `/resources/views/pages/dashboard-v1.blade.php`
- **Documentation**: `/docs/electricity-bill-calculator.md`

### Dependencies

- **Chart.js**: Chart management integration
- **Bootstrap**: Responsive grid system
- **Font Awesome**: Icons
- **Laravel Blade**: Template engine

### Troubleshooting

1. **Calculator tidak muncul**: Check JavaScript loading dan DOM ready
2. **Perhitungan salah**: Validate tariff rates dan formula
3. **UI tidak responsive**: Check CSS media queries
4. **Auto-fill tidak work**: Validate dashboard element selectors

---

**Version**: 1.0.0  
**Date**: August 14, 2025  
**Author**: Dashboard IoT Development Team
