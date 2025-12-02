# 📊 Realistic Listrik Seeder - Panduan Lengkap

## 🎯 Overview

Seeder ini menggenerate data listrik yang **realistis** dengan interval **10 detik** (sesuai dengan generator di `support-pzem.js`).

### ✨ Fitur Utama

- ✅ **Interval 10 detik** - Sama persis dengan generator real-time
- ✅ **Pola kerja kantoran** - Jam kerja, istirahat, malam hari
- ✅ **Weekend detection** - Minimal operation saat weekend
- ✅ **Dynamic voltage** - 220-223V (loaded), 350-380V (no load)
- ✅ **Realistic current** - 7.3-15.6A (jam kerja)
- ✅ **Target 8080 kWh/month** - Sesuai spesifikasi PT Krakatau

---

## 📋 Spesifikasi Generator

### ⏰ Pola Waktu

| Periode                | Waktu                      | Power      | Voltage  | Current    | Keterangan               |
| ---------------------- | -------------------------- | ---------- | -------- | ---------- | ------------------------ |
| **Working Hours Peak** | 08:00-12:00<br>14:00-18:00 | 3000-3400W | 221-223V | 13.5-15.6A | Komputer, AC, printer ON |
| **Lunch Break**        | 12:00-14:00                | 1900-2300W | 220-222V | 8.5-10.5A  | Laptop tidak charging    |
| **Night Mode**         | 18:00-08:00                | 200-300W   | 350-370V | 0.6-0.9A   | Hanya lampu emergency    |
| **Weekend**            | Sabtu-Minggu               | 200-250W   | 375-380V | 0.3-0.5A   | Keamanan minimal         |
| **Transition**         | 06:00-08:00                | 1600-1900W | 220-222V | 7.3-8.8A   | Persiapan kerja          |

### 📊 Target Konsumsi

```
Max kWh       : 8080 kWh/bulan
Daily Target  : 269.33 kWh/hari
Hourly Target : 11.22 kWh/jam
Per Update    : 0.0312 kWh (10 detik)
```

### ⚡ Electrical Specifications

```
Voltage      : 220-223V (dengan beban)
               350-380V (tanpa beban)
Current      : 7.3-15.6A (jam kerja)
               0.3-0.9A (malam/weekend)
Frequency    : 49.75-50.25 Hz
Power Factor : 0.85-0.95
```

---

## 🚀 Cara Menjalankan

### 1. Generate Data 7 Hari (Default)

```bash
php artisan db:seed --class=RealisticListrikSeeder
```

**Output:**

```
🚀 Starting Realistic Listrik Seeder...
📊 Generating data with 10-second intervals
⏱️  Following exact rules from support-pzem.js

📅 Period: 2025-11-24 15:30:00 to 2025-12-01 15:30:00
🔢 Total days: 7
⏰ Interval: 10 seconds
📈 Estimated records: 60,480

✅ Batch 1 inserted (500 records) - Progress: 0.8%
✅ Batch 2 inserted (1,000 records) - Progress: 1.7%
...
```

### 2. Custom Duration (Edit File)

Edit `RealisticListrikSeeder.php` line 34:

```php
// Generate 30 hari data
$daysToGenerate = 30;
```

Kemudian jalankan:

```bash
php artisan db:seed --class=RealisticListrikSeeder
```

### 3. Reset Data Sebelum Generate

Uncomment line 56 di seeder:

```php
// Uncomment untuk reset data
DB::table('listriks')->truncate();
echo "🗑️  Cleared existing data\n\n";
```

---

## 📊 Estimasi Records

| Durasi  | Interval | Total Records | Database Size (Est.) |
| ------- | -------- | ------------- | -------------------- |
| 1 hari  | 10 detik | 8,640         | ~1 MB                |
| 7 hari  | 10 detik | 60,480        | ~7 MB                |
| 30 hari | 10 detik | 259,200       | ~30 MB               |
| 90 hari | 10 detik | 777,600       | ~90 MB               |

**Perhitungan:**

```
Records per hari = (24 jam × 60 menit × 60 detik) / 10 detik
                 = 86,400 / 10
                 = 8,640 records
```

---

## 🔍 Verifikasi Data

### Cek Total Records

```sql
SELECT COUNT(*) as total,
       MIN(sensor_timestamp) as first_record,
       MAX(sensor_timestamp) as last_record
FROM listriks
WHERE source = 'seeder_realistic_10s';
```

### Cek Distribusi Per Jam

```sql
SELECT
    HOUR(sensor_timestamp) as hour,
    COUNT(*) as records,
    AVG(daya) as avg_power,
    AVG(tegangan) as avg_voltage
FROM listriks
WHERE source = 'seeder_realistic_10s'
GROUP BY HOUR(sensor_timestamp)
ORDER BY hour;
```

### Cek Weekend vs Weekday

```sql
SELECT
    JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.day_type')) as day_type,
    COUNT(*) as records,
    AVG(daya) as avg_power
FROM listriks
WHERE source = 'seeder_realistic_10s'
GROUP BY day_type;
```

---

## 📈 Output Statistik Otomatis

Seeder akan menampilkan statistik lengkap setelah selesai:

```
📊 Data Statistics:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Records    : 60,480
Average Voltage  : 286.5 V
Average Current  : 6.8 A
Average Power    : 1,856 W
Peak Power       : 3,459 W
Minimum Power    : 203 W
Total Energy     : 45,678.34 kWh
Avg Frequency    : 50.00 Hz
Avg Power Factor : 0.900
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 Period Distribution:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
working_hours_peak         : 20,160 records (avg: 3,200 W)
lunch_break_reduced        :  7,200 records (avg: 2,100 W)
transition_preparation     :  7,200 records (avg: 1,750 W)
weekend_minimal            : 17,280 records (avg:   225 W)
night_mode_minimal         :  8,640 records (avg:   250 W)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ Hourly Average Power:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
00:00 - 00:59  :   245 W (2,520 records)
01:00 - 01:59  :   248 W (2,520 records)
...
08:00 - 08:59  : 3,210 W (2,520 records)
09:00 - 09:59  : 3,190 W (2,520 records)
...
18:00 - 18:59  :   252 W (2,520 records)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🎨 Struktur Data Generated

Setiap record memiliki struktur:

```php
[
    'lokasi' => 'PT Krakatau Sarana Property',
    'tegangan' => 221.5,          // V
    'arus' => 14.2,               // A
    'daya' => 3145,               // W
    'energi' => 123.4567,         // kWh (kumulatif)
    'frekuensi' => 50.12,         // Hz
    'power_factor' => 0.892,      // 0-1
    'status' => 'active',
    'source' => 'seeder_realistic_10s',
    'metadata' => '{
        "day_type": "weekday",
        "period": "working_hours_peak",
        "interval": "10_seconds",
        "generator": "RealisticListrikSeeder_v2.0",
        "voltage_mode": "normal_voltage_loaded"
    }',
    'sensor_timestamp' => '2025-12-01 09:15:30',
    'created_at' => '2025-12-01 09:15:30',
    'updated_at' => '2025-12-01 09:15:30'
]
```

---

## ⚙️ Konfigurasi

### Ubah Interval (TIDAK DISARANKAN!)

Jika benar-benar perlu mengubah interval:

```php
// Line 34
$intervalSeconds = 5; // Ubah ke 5 detik (2x lebih banyak data)
```

⚠️ **WARNING:** Mengubah interval akan membuat data tidak konsisten dengan generator real-time!

### Ubah Target kWh/bulan

```php
// Line 200
$dailyTarget = 269.33; // Ubah sesuai kebutuhan
```

---

## 🔧 Troubleshooting

### Error: Memory Limit

Jika data terlalu banyak:

```php
// Kurangi batch size di line 62
$batchSize = 250; // Dari 500 ke 250
```

Atau tambah memory limit:

```bash
php -d memory_limit=512M artisan db:seed --class=RealisticListrikSeeder
```

### Error: Execution Timeout

```bash
php -d max_execution_time=600 artisan db:seed --class=RealisticListrikSeeder
```

### Data Terlalu Lambat

Generate data lebih sedikit:

```php
$daysToGenerate = 3; // Mulai dari 3 hari dulu
```

---

## 📌 Best Practices

1. **Start Small** - Mulai dengan 3-7 hari, lalu scale up
2. **Monitor Database Size** - Cek storage sebelum generate data besar
3. **Backup Database** - Selalu backup sebelum truncate
4. **Use Batching** - Jangan ubah batch size kecuali perlu
5. **Check Statistics** - Verifikasi output statistik masuk akal

---

## 🎯 Use Cases

### Testing Dashboard

```bash
# Generate 1 hari untuk quick test
# Edit: $daysToGenerate = 1
php artisan db:seed --class=RealisticListrikSeeder
```

### Demo Client

```bash
# Generate 30 hari untuk presentasi
# Edit: $daysToGenerate = 30
php artisan db:seed --class=RealisticListrikSeeder
```

### Development

```bash
# Generate 7 hari (default) untuk development
php artisan db:seed --class=RealisticListrikSeeder
```

### Production Initial Data

```bash
# Generate 90 hari untuk production launch
# Edit: $daysToGenerate = 90
php artisan db:seed --class=RealisticListrikSeeder
```

---

## 📝 Notes

- ✅ Seeder ini **thread-safe** dan bisa dijalankan multiple kali
- ✅ Data **tidak duplikat** karena menggunakan timestamp unik
- ✅ Cocok untuk **testing, demo, dan development**
- ⚠️ Untuk production, gunakan data real dari ESP32/PZEM
- 💡 Metadata JSON memudahkan filtering dan analisis

---

## 🔗 Related Files

- **Seeder:** `database/seeders/RealisticListrikSeeder.php`
- **Generator JS:** `public/assets/js/support/support-pzem.js`
- **Migration:** `database/migrations/*_create_listriks_table.php`
- **Model:** `app/Models/Listrik.php`

---

## 📞 Support

Untuk pertanyaan atau issues:

1. Check dokumentasi ini
2. Lihat output statistik
3. Verifikasi dengan SQL queries di atas

**Generated by:** RealisticListrikSeeder v2.0  
**Last Updated:** December 2025  
**Interval:** 10 seconds (matching real-time generator)
