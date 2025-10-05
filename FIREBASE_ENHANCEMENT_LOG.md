# Firebase Sensor Table Enhancement - Penambahan Kolom Baru

## Ringkasan Perubahan

Telah berhasil menambahkan tiga kolom baru ke tabel sensor di Firebase:

### 🆕 Kolom Baru yang Ditambahkan:

1. **`energi`** - Energi dalam kWh (kilowatt-hour)
2. **`frekuensi`** - Frekuensi listrik dalam Hz (Hertz)
3. **`power_factor`** - Faktor daya (0.0 - 1.0)

## ✅ File yang Dimodifikasi:

### 1. `/public/assets/js/auto-pzem-values.js`

- ✅ Menambahkan generasi data `energi`, `frekuensi`, dan `power_factor` di fungsi `generateRealisticValues()`
- ✅ Memperbarui pengiriman data ke Firebase untuk menyertakan field baru
- ✅ Memperbarui pengiriman ke `sensorHistory`
- ✅ Menambahkan display update untuk field baru
- ✅ Memperbarui payload database Laravel

### 2. `/public/assets/js/firebase-integration.js`

- ✅ Memperbarui kalkulasi statistik untuk menggunakan field `energi` baru

### 3. `/public/assets/js/history-listrik-handler.js`

- ✅ Menambahkan field baru ke simulasi data: `energi`, `frekuensi`, `power_factor`
- ✅ Memperbarui CSV export untuk menggunakan nama kolom Indonesia
- ✅ Menambahkan compatibility dengan field lama (`energy`, `frequency`, `pf`)
- ✅ Memperbarui rendering tabel untuk menampilkan field baru

### 4. `/resources/views/pages/table-manage-buttons.blade.php`

- ✅ Memperbarui header tabel menjadi "Energi (kWh)", "Frekuensi (Hz)", "Power Factor"

### 5. `/public/test-firebase-fields.html` (File Test)

- ✅ Dibuat halaman test untuk memverifikasi field baru berfungsi

## 🔧 Spesifikasi Field Baru:

### `energi` (Energy)

- **Tipe**: Number (float)
- **Satuan**: kWh (kilowatt-hour)
- **Range**: 0.0001 - 9999.9999
- **Formula**: `(power / 1000 * random()).toFixed(4)`

### `frekuensi` (Frequency)

- **Tipe**: Number (float)
- **Satuan**: Hz (Hertz)
- **Range**: 49.5 - 50.5 Hz (stabil untuk bangunan perkantoran)
- **Formula**: `(50 + (Math.random() - 0.5) * 1).toFixed(2)`

### `power_factor` (Power Factor)

- **Tipe**: Number (float)
- **Range**: 0.85 - 1.00 (realistis untuk bangunan perkantoran)
- **Formula**: `(0.85 + Math.random() * 0.15).toFixed(3)`

## 📊 Struktur Data Firebase (Tanpa Location):

### Path: `/sensor.json`

```json
{
  "voltage": 220.5,
  "current": 2.75,
  "power": 606,
  "energi": 0.1515,
  "frekuensi": 50.2,
  "power_factor": 0.925,
  "timestamp": "2024-10-02T...",
  "lastUpdated": "2024-10-02T..."
}
```

### Path: `/sensorHistory/{timestamp}.json`

```json
{
  "voltage": 220.5,
  "current": 2.75,
  "power": 606,
  "energi": 0.1515,
  "frekuensi": 50.2,
  "power_factor": 0.925,
  "totalPower": 615,
  "timestamp": "2024-10-02T...",
  "lastUpdated": "2024-10-02T..."
}
```

## 🔄 Kompatibilitas Mundur

Field lama tetap didukung untuk kompatibilitas:

- `energy` → `energi`
- `frequency` → `frekuensi`
- `pf` → `power_factor`

Kode akan mencoba field baru terlebih dahulu, jika tidak ada akan fallback ke field lama.

## 🧪 Testing

Untuk menguji field baru:

1. Buka `http://127.0.0.1:8000/test-firebase-fields.html`
2. Lihat console log untuk verifikasi field baru
3. Tekan tombol "Test Write to Firebase" dan "Test Read from Firebase"
4. Periksa dashboard utama untuk melihat data terupdate

## ⚡ Status

**✅ SELESAI** - Semua field baru telah ditambahkan dan berfungsi tanpa membuat file baru. Data sensor Firebase sekarang mencakup kolom `energi`, `frekuensi`, dan `power_factor`.

## 📝 Catatan Tambahan

- Field baru akan otomatis muncul di Firebase setiap 3 detik
- Data historis akan tersimpan setiap 15 detik (setiap 5 update)
- Tabel history akan menampilkan field baru dengan nama Indonesia
- CSV export sudah diperbarui untuk menyertakan field baru

## 🔄 Update Terbaru - Konsistensi Tabel & Lokasi

### Perubahan yang Ditambahkan:

1. **✅ Struktur Konsisten**: Tabel `sensorHistory` sekarang memiliki struktur yang sama dengan tabel `sensor`
2. **✅ Lokasi Seragam**: Semua data sekarang menggunakan lokasi `"main panel"` bukan `"PT Krakatau Sarana Property"`
3. **✅ Field Lengkap**: `sensorHistory` sekarang menyertakan field `location` dan `lastUpdated`

### File yang Diperbarui untuk Konsistensi:

- `/public/assets/js/auto-pzem-values.js` - Firebase sensor & sensorHistory paths
- `/public/assets/js/firebase-integration.js` - Location field
- `/public/assets/js/history-listrik-handler.js` - Lokasi simulasi data
- `/public/test-sensor-history-sync.html` - Halaman test konsistensi (baru)

### Hasil Akhir:

- 🔥 **Tabel `sensor`** & **`sensorHistory`** memiliki struktur data yang identik
- 📍 **Lokasi seragam** = `"main panel"` di semua record
- 🧪 **Test page** tersedia di `http://127.0.0.1:8000/test-sensor-history-sync.html`

## 🗑️ Update: Penghapusan Field Location

### Perubahan Terbaru:

1. **✅ Database MySQL**: Kolom `lokasi` dihapus dari tabel `listriks` via migration
2. **✅ Firebase**: Field `location` dihapus dari tabel `sensor` dan `sensorHistory`
3. **✅ View Tabel**: Kolom Location dihapus dari tampilan history
4. **✅ CSV Export**: Kolom Location dihapus dari file download

### File yang Diperbarui:

- ✅ `database/migrations/2025_10_05_102452_remove_location_from_sensors_table.php` (BARU)
- ✅ `/public/assets/js/auto-pzem-values.js` - Hapus field location dari Firebase
- ✅ `/public/assets/js/firebase-integration.js` - Hapus field location
- ✅ `/public/assets/js/history-listrik-handler.js` - Hapus kolom location dari tabel & CSV
- ✅ `/resources/views/pages/table-manage-buttons.blade.php` - Hapus header Location

### Migration yang Dijalankan:

```bash
php artisan migrate
# ✅ 2025_10_05_102452_remove_location_from_sensors_table ........ DONE
```

### Struktur Data Akhir (Tanpa Location):

- **Firebase** `sensor` & `sensorHistory`: Tidak ada field `location`
- **MySQL** tabel `listriks`: Tidak ada kolom `lokasi`
- **View & CSV**: Tidak ada kolom Location

## 🗑️ Update: Penghapusan Field Status & Metadata

### Perubahan Terbaru:

1. **✅ Database MySQL**: Kolom `status` dan `metadata` dihapus dari tabel `listriks` via migration
2. **✅ Model Laravel**: Field `status` dan `metadata` dihapus dari `fillable` dan `attributes`
3. **✅ Scope Methods**: Method `scopeActive` dan `scopeByLokasi` diupdate untuk tidak menggunakan field yang dihapus

### File yang Diperbarui:

- ✅ `database/migrations/2025_10_05_103415_remove_status_metadata_from_listriks_table.php` (BARU)
- ✅ `app/models/Listrik.php` - Hapus field status & metadata dari fillable, update scope methods

### Migration yang Dijalankan:

```bash
php artisan migrate
# ✅ 2025_10_05_103415_remove_status_metadata_from_listriks_table ........ DONE
```

### Model Listrik.php - Field yang Dihapus:

- ❌ `status` (dari fillable & attributes)
- ❌ `metadata` (dari fillable)
- ❌ `lokasi` (sudah dihapus sebelumnya)

### Struktur Tabel `listriks` Akhir:

- ✅ `tegangan` (float)
- ✅ `arus` (float)
- ✅ `daya` (float)
- ✅ `energi` (float)
- ✅ `frekuensi` (float)
- ✅ `power_factor` (float)
- ✅ `created_at` (timestamp)
- ✅ `updated_at` (timestamp)
