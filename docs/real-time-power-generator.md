# Real-time Power Generator untuk PT Krakatau Sarana Property

## 📋 Overview

Sistem real-time power generator ini dibuat untuk mensimulasikan dan menghasilkan data listrik yang realistis untuk PT Krakatau Sarana Property. Data yang dihasilkan akan disimpan ke Firebase dan database Laravel, kemudian ditampilkan di dashboard monitoring.

## 🏢 Profile Building PT Krakatau Sarana Property

- **Total Lantai**: 15 lantai
- **Luas Area Kantor**: 12,000 m²
- **Konsumsi Daya Base**: 8,000 W (beban dasar)
- **Konsumsi Daya Maksimum**: 45,000 W (beban puncak)
- **Jam Operasional**: 07:00 - 19:00
- **Pengurangan Weekend**: 30% dari konsumsi normal
- **Lokasi**: Cilegon, Banten

## 🔧 Komponen Sistem

### 1. Real-time Power Generator (`real-time-power-generator.js`)

**Fitur Utama:**

- Generate data listrik realistis berdasarkan pola penggunaan gedung perkantoran
- Pola konsumsi berbeda untuk:
  - Jam kerja vs non-jam kerja
  - Hari kerja vs weekend
  - Pagi, siang, sore dengan karakteristik masing-masing
- Auto-sync ke Firebase dan database Laravel
- Update UI secara real-time

**Metode Perhitungan:**

```javascript
// Pola konsumsi berdasarkan waktu
Morning Peak (7-9 AM): 40-70% dari max power
Work Hours (9-17 PM): 70-100% dari max power
Evening (17-19 PM): 60-45% dari max power
Night (19-7 AM): 15-25% dari max power
Weekend: 30% dari konsumsi normal
```

### 2. Firebase Integration (`firebase-integration.js`)

**Fitur:**

- Koneksi dan autentikasi Firebase
- Penyimpanan data real-time
- Subscription untuk update real-time
- Structured data storage untuk analisis

**Struktur Data Firebase:**

```
electricity_data/
├── daily/
│   └── YYYY-MM-DD/
│       └── timestamp/
├── latest/
└── buildings/
    └── krakatau_sarana_property/
        └── electricity/
```

### 3. Backend Controller (`RealTimePowerController.php`)

**Endpoints:**

- `POST /api/realtime-power/store` - Simpan data real-time
- `GET /api/realtime-power/latest` - Ambil data terbaru
- `GET /api/realtime-power/range` - Ambil data range waktu tertentu
- `GET /api/realtime-power/krakatau-stats` - Statistik khusus PT Krakatau
- `POST /api/realtime-power/reset-energy` - Reset counter energi

### 4. Control Panel (`power-generator-control.blade.php`)

**Interface untuk:**

- Start/Stop generator
- Monitor status real-time
- View statistics harian
- System logs
- Building profile information

## 🚀 Cara Penggunaan

### 1. Instalasi

```bash
# 1. Copy semua file JavaScript ke folder public/assets/js/
# 2. Copy controller ke app/Http/Controllers/
# 3. Copy view ke resources/views/
# 4. Tambahkan routes di routes/api.php dan routes/web.php
```

### 2. Konfigurasi Firebase

```javascript
// Update config di firebase-integration.js
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-domain.firebaseapp.com",
  databaseURL: "your-database-url",
  projectId: "your-project-id",
  // ... other config
};
```

### 3. Menjalankan Generator

**Otomatis (Default):**
Generator akan auto-start 2 detik setelah page load.

**Manual via Console:**

```javascript
// Start generator
startPowerGen();

// Stop generator
stopPowerGen();

// Check status
powerGenStatus();
```

**Melalui Control Panel:**
Akses: `http://your-domain/power-generator-control`

### 4. Integrasi dengan Dashboard

Generator terintegrasi otomatis dengan dashboard electricity integration. Data real-time akan:

- Update chart secara langsung
- Tersinkron dengan global data
- Tersimpan ke database
- Tampil di monitoring cards

## 📊 Data yang Dihasilkan

### Electrical Data

- **Tegangan**: 200-240V dengan fluktuasi realistis
- **Arus**: Dihitung berdasarkan P/V
- **Daya**: 8,000-45,000W sesuai pola building
- **Energi**: Akumulasi konsumsi (kWh)
- **Frekuensi**: 50Hz ±0.25Hz
- **Power Factor**: 0.85 ±0.05

### Pattern Examples

```javascript
// Pagi Kerja (7-9 AM)
powerMultiplier = 0.4 + (hour - 7) * 0.3 + (minute / 60) * 0.3;

// Siang Peak (14-17 PM)
powerMultiplier = 0.85 + Math.sin(((hour - 14) * Math.PI) / 3) * 0.15;

// Weekend
basePower *= 0.3; // 30% reduction
```

## 🔄 Sinkronisasi Data

### Database Laravel

Data disimpan dalam 2 tabel:

1. **`listrik`** - Data utama dengan metadata
2. **`history_kwh`** - Data historis untuk analisis

### Firebase Realtime Database

Data disimpan dengan struktur:

- Path daily untuk analisis harian
- Path latest untuk monitoring real-time
- Path building-specific untuk reporting

## 📈 Fitur Monitoring

### Real-time Updates

- Update setiap 5 detik untuk UI
- Sync database setiap 1 menit
- Chart update tanpa refresh

### Statistics

- Average, Max, Min power per hari/minggu/bulan
- Energy consumption tracking
- Cost estimation dengan tarif PLN B-2/TM
- Efficiency metrics

### Alerts & Notifications

- Generator status changes
- Sync failures
- Data validation errors

## 🛠️ Kustomisasi

### Mengubah Building Profile

```javascript
// Di real-time-power-generator.js
this.buildingProfile = {
  totalFloors: 20, // Ubah jumlah lantai
  officeArea: 15000, // Ubah luas area (m²)
  basePowerConsumption: 10000, // Ubah base power (W)
  maxPowerConsumption: 60000, // Ubah max power (W)
  // ... other settings
};
```

### Mengubah Interval Update

```javascript
// Update database interval (default: 1 menit)
setInterval(() => {
  this.generateAndSync();
}, 30000); // Ubah ke 30 detik

// UI update interval (default: 5 detik)
setInterval(() => {
  const quickData = this.generateElectricalData();
  this.updateUI(quickData);
}, 2000); // Ubah ke 2 detik
```

### Custom Power Pattern

```javascript
// Tambahkan pattern khusus
if (isSpecialEvent) {
  powerMultiplier = 1.2; // 20% increase untuk acara khusus
}

// Seasonal adjustment
const month = now.getMonth();
if (month >= 5 && month <= 8) {
  // Musim kemarau
  powerMultiplier *= 1.1; // 10% increase untuk AC
}
```

## 🚨 Troubleshooting

### Generator Tidak Start

1. Check console untuk error
2. Pastikan Firebase config benar
3. Verify API endpoints accessible
4. Check CSRF token untuk Laravel

### Data Tidak Tersimpan

1. Verify database connection
2. Check API routes
3. Validate request format
4. Check server logs

### Firebase Error

1. Verify Firebase config
2. Check Firebase rules
3. Ensure SDK loaded properly
4. Check network connectivity

## 📞 Support

Untuk pertanyaan atau dukungan teknis, hubungi tim development atau buka issue di repository.

---

**Dibuat untuk PT Krakatau Sarana Property - Smart Building IoT System**
