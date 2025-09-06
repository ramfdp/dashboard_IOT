# Night Mode Simulation - PT Krakatau Sarana Property

## 🌙 Overview

Sistem simulasi waktu malam yang secara otomatis menurunkan daya sensor setiap 1 jam selama 30 menit, kemudian kembali normal. Sistem ini mensimulasikan kondisi real di mana konsumsi listrik turun saat waktu malam.

## 📋 Spesifikasi

### ⏰ Timing

- **Interval**: Setiap 1 jam sekali
- **Durasi**: 30 menit per siklus night mode
- **Siklus**: Berulang otomatis tanpa henti

### 📊 Efek pada Sensor

- **Daya (Power)**: Turun ke 30% dari nilai normal
- **Arus (Current)**: Turun ke 30% dari nilai normal
- **Tegangan (Voltage)**: Tetap normal (tidak berubah)
- **Total Power**: Turun sesuai dengan power reduction

### 🔄 Pola Siklus

```
Jam 00:00 - 00:30 → 🌙 NIGHT MODE (30% daya)
Jam 00:30 - 01:00 → ☀️ NORMAL (100% daya)
Jam 01:00 - 01:30 → 🌙 NIGHT MODE (30% daya)
Jam 01:30 - 02:00 → ☀️ NORMAL (100% daya)
... dan seterusnya berulang
```

## 🔧 Implementasi

### Files yang Dimodifikasi:

1. **`auto-pzem-values.js`** - Main generator dengan night mode logic
2. **`night-mode-indicator.js`** - Visual indicator di dashboard
3. **`dashboard-v1.blade.php`** - Dashboard template

### Fitur Utama:

- ✅ Auto-initialize saat dashboard dibuka
- ✅ Real-time status tracking
- ✅ Visual indicator dengan progress bar
- ✅ Console commands untuk kontrol manual
- ✅ Logging sistem untuk debugging

## 🎮 Console Commands

### Monitoring Commands:

```javascript
nightModeStatus(); // Lihat status night mode saja
autoPZEMStatus(); // Lihat status lengkap generator
```

### Control Commands:

```javascript
triggerNightMode(); // Force trigger night mode sekarang
disableNightMode(); // Disable night mode simulation
enableNightMode(); // Enable night mode simulation
```

### Example Usage:

```javascript
// Cek status night mode
> nightModeStatus()
{
  enabled: true,
  isActive: false,
  nextTrigger: "2025-09-06T08:18:00.000Z",
  durationMinutes: 30,
  intervalHours: 1,
  powerReduction: "30%",
  currentReduction: "30%"
}

// Force trigger untuk testing
> triggerNightMode()
[AutoPZEM] 🌙 Night mode will trigger on next update cycle
```

## 📈 Monitoring

### 1. Visual Indicator

Dashboard menampilkan card khusus night mode dengan:

- **Status**: Active/Standby
- **Timer**: Countdown sisa waktu night mode
- **Next Trigger**: Waktu trigger berikutnya
- **Progress Bar**: Visual progress night mode

### 2. Console Logging

Generator memberikan logging real-time:

```
[AutoPZEM] 🌙 NIGHT MODE STARTED - Daya dan arus akan turun selama 30 menit
[AutoPZEM] 🌙 Night mode akan berakhir pada: 06/09/2025 08:48:00
[AutoPZEM] ☀️ NIGHT MODE ENDED - Daya dan arus kembali ke normal
```

### 3. Real-time Data

Perubahan nilai sensor dapat dilihat di:

- Dashboard widgets (voltage, current, power)
- Database records (histori_kwh table)
- Firebase real-time database

## 🧪 Testing Guide

### Quick Test (Manual Trigger):

1. Buka Dashboard: `http://localhost:8000/dashboard`
2. Buka Console (F12)
3. Ketik: `triggerNightMode()`
4. Monitor perubahan dalam 30 detik
5. Nilai akan turun ke 30%

### Full Cycle Test:

1. Buka Dashboard
2. Tunggu trigger otomatis (maks 1 jam)
3. Monitor selama 30 menit night mode
4. Pastikan kembali normal setelah 30 menit

### Verification Points:

- ✅ Night mode trigger setiap 1 jam
- ✅ Daya turun ke ~30% saat active
- ✅ Arus turun ke ~30% saat active
- ✅ Durasi exactly 30 menit
- ✅ Auto return to normal setelah 30 menit
- ✅ Visual indicator update real-time
- ✅ Console logging works

## 🔍 Troubleshooting

### Issue: Night mode tidak trigger

**Solution**:

```javascript
enableNightMode(); // Re-enable jika disabled
triggerNightMode(); // Force trigger untuk test
```

### Issue: Visual indicator tidak muncul

**Solution**:

- Refresh halaman dashboard
- Cek console untuk error JavaScript
- Pastikan script loaded: `night-mode-indicator.js`

### Issue: Nilai tidak berubah saat night mode

**Solution**:

```javascript
autoPZEMStatus(); // Cek apakah generator running
```

## 📊 Data Flow

```
Timer Check (every 3s)
↓
updateNightModeStatus()
↓
Check if trigger time reached
↓
Activate night mode (30min duration)
↓
generateRealisticValues()
↓
applyNightModeReduction()
↓
Send reduced values to:
├── Dashboard UI
├── Database (histori_kwh)
└── Firebase
```

## 🎯 Benefits

1. **Realistic Simulation**: Mensimulasikan pola konsumsi real
2. **Automated Testing**: Test otomatis untuk low-power scenarios
3. **Visual Feedback**: Clear indication saat night mode aktif
4. **Flexible Control**: Manual override tersedia untuk testing
5. **Data Integrity**: Semua perubahan terecord di database

## 📝 Configuration

Current settings dapat diubah di `auto-pzem-values.js`:

```javascript
nightModeSimulation: {
    enabled: true,           // Enable/disable fitur
    intervalHours: 1,        // Interval trigger (jam)
    durationMinutes: 30,     // Durasi night mode (menit)
    powerReduction: 0.3,     // Persen power reduction (30%)
    currentReduction: 0.3    // Persen current reduction (30%)
}
```

---

**Night Mode Simulation untuk PT Krakatau Sarana Property telah successfully implemented!** 🚀
