# Struktur Direktori Dashboard IOT - Krakatau Sarana Properti

## Deskripsi Sistem

Dashboard berbasis Laravel untuk kontrol dan monitoring sistem IoT dengan prediksi penggunaan listrik menggunakan algoritma K-Nearest Neighbors (KNN).

```
dashboard_IOT/
├── 📁 app/
│   ├── 📁 Console/
│   │   └── Commands/
│   │       └── SyncUserRoles.php                    # Sinkronisasi peran pengguna
│   ├── 📁 Http/
│   │   ├── 📁 Controllers/
│   │   │   ├── AuthController.php                   # Autentikasi pengguna
│   │   │   ├── DashboardController.php              # Kontroler utama dashboard
│   │   │   ├── HistoryKwhController.php             # Kontroler data historis listrik
│   │   │   ├── ListrikController.php                # Kontroler monitoring listrik
│   │   │   ├── OvertimeController.php               # Kontroler manajemen lembur
│   │   │   ├── UserController.php                   # Kontroler manajemen pengguna
│   │   │   └── CCTVController.php                   # Kontroler sistem CCTV
│   │   └── 📁 Middleware/                          # Middleware untuk keamanan
│   ├── 📁 Livewire/
│   │   ├── DeviceControl.php                        # Komponen kontrol perangkat
│   │   ├── EnergyMonitoring.php                     # Komponen monitoring energi
│   │   ├── OvertimeControl.php                      # Komponen kontrol lembur
│   │   └── UserManagement.php                       # Komponen manajemen pengguna
│   ├── 📁 Models/
│   │   ├── Employee.php                             # Model karyawan
│   │   ├── HistoryKwh.php                          # Model data historis listrik
│   │   ├── LightSchedule.php                        # Model jadwal pencahayaan
│   │   ├── Listrik.php                             # Model data listrik real-time
│   │   ├── Overtime.php                            # Model data lembur
│   │   ├── Sensor.php                              # Model data sensor
│   │   └── User.php                                # Model pengguna
│   └── 📁 Services/
│       └── FirebaseService.php                      # Layanan integrasi Firebase
│
├── 📁 public/assets/js/
│   ├── 🤖 advanced-electricity-calculator.js        # Kalkulator listrik lanjutan
│   ├── 🧠 electricity-knn-calculator.js            # Kalkulator KNN untuk prediksi listrik
│   ├── 🧠 tensorflow-knn-predictor.js              # Prediktor KNN menggunakan TensorFlow.js
│   ├── 🔧 knn-worker.js                            # Web Worker untuk komputasi KNN
│   ├── 🧪 knn-test.js                              # Script testing untuk sistem KNN
│   ├── ⚡ device-firebase-control.js               # Kontrol perangkat melalui Firebase
│   ├── 📊 monitoring-optimized.min.js              # Monitoring real-time (optimized)
│   ├── 💡 LightScheduleManager.js                  # Manajemen jadwal pencahayaan
│   ├── 🔄 ModeManager.js                           # Manajemen mode operasi (auto/manual)
│   ├── ⏰ overtime-control-fetch.js                # Kontrol sistem lembur
│   ├── 🎯 performance-optimizer.js                 # Optimasi performa aplikasi
│   └── 📡 fetch-api-monitoring.js                  # API monitoring real-time
│
├── 📁 resources/
│   ├── 📁 js/
│   │   └── app.js                                  # JavaScript utama aplikasi
│   ├── 📁 scss/
│   │   └── default/styles.scss                     # Styling utama
│   └── 📁 views/
│       ├── 📁 layouts/
│       │   └── default.blade.php                   # Layout utama
│       ├── 📁 pages/
│       │   ├── dashboard-v1.blade.php              # Halaman dashboard utama
│       │   └── login-v3.blade.php                  # Halaman login
│       └── 📁 includes/
│           ├── header.blade.php                    # Header aplikasi
│           └── sidebar.blade.php                   # Menu sidebar
│
├── 📁 routes/
│   ├── web.php                                     # Routing web aplikasi
│   └── api.php                                     # API endpoints
│
├── 📁 database/
│   ├── 📁 migrations/                              # Migrasi database
│   └── 📁 seeders/                                 # Data seeder
│
├── 📁 config/
│   ├── app.php                                     # Konfigurasi aplikasi
│   ├── database.php                               # Konfigurasi database
│   └── services.php                               # Konfigurasi layanan eksternal
│
├── 📄 composer.json                                # Dependencies PHP
├── 📄 package.json                                 # Dependencies Node.js
├── 📄 webpack.mix.js                              # Konfigurasi build assets
└── 📄 .env                                        # Environment variables
```

## 🔧 Komponen Utama

### **Backend (Laravel)**

- **Controllers**: Menangani logika bisnis dan routing
- **Models**: Representasi data dan hubungan database
- **Services**: Layanan eksternal seperti Firebase
- **Livewire**: Komponen reaktif untuk UI real-time

### **Frontend Intelligence**

- **KNN System**: Prediksi penggunaan listrik berbasis machine learning
- **TensorFlow.js**: Framework ML untuk prediksi di browser
- **Advanced Calculator**: Analisis statistik lanjutan
- **Real-time Monitoring**: Monitoring sensor dan perangkat

### **IoT Integration**

- **Firebase**: Database real-time untuk kontrol perangkat
- **Sensor Data**: Pembacaan PZEM-004T untuk monitoring listrik
- **Device Control**: Kontrol relay untuk pencahayaan
- **Schedule Management**: Sistem jadwal otomatis

### **Features Utama**

1. **🔮 Prediksi KNN**: Algoritma machine learning untuk prediksi penggunaan listrik
2. **📊 Dashboard Real-time**: Monitoring live data sensor dan perangkat
3. **💡 Smart Lighting**: Kontrol pencahayaan otomatis berdasarkan jadwal
4. **⏰ Overtime Management**: Sistem manajemen lembur karyawan
5. **👥 User Management**: Sistem pengguna dengan role-based access
6. **📈 Analytics**: Analisis mendalam penggunaan energi

## 🚀 Teknologi yang Digunakan

- **Backend**: Laravel 10.x, PHP 8.x, MySQL
- **Frontend**: Bootstrap 5, jQuery, Chart.js
- **Machine Learning**: TensorFlow.js, Custom KNN Implementation
- **IoT**: Firebase Realtime Database, ESP32, PZEM-004T
- **Build Tools**: Laravel Mix, Webpack, Sass

---

_Dashboard IOT - Krakatau Sarana Properti © 2025_
