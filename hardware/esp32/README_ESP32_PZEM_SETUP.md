# ESP32 dengan PZEM-004T - Setup Guide

## 📋 Daftar Komponen

### Hardware

1. **ESP32 Development Board** (ESP32-WROOM-32 atau sejenisnya)
2. **PZEM-004T** (Energy Monitor Sensor)
3. **Kabel Jumper** (Female-Female untuk koneksi)
4. **Power Supply 5V** untuk ESP32
5. **Beban Listrik AC** yang akan dimonitor (maks 100A)

### Software & Library

1. **Arduino IDE** (versi 1.8.x atau 2.x)
2. **ESP32 Board Support** di Arduino IDE
3. **Library yang diperlukan:**
   - Firebase ESP32 Client by Mobizt (v4.3.x atau lebih baru)
   - PZEM004Tv30 by Jakub Mandula
   - ArduinoJson by Benoit Blanchon (v6.x)

---

## 🔌 Wiring Diagram

```
PZEM-004T          ESP32
---------          -----
VCC (5V)    --->   5V
GND         --->   GND
TX          --->   GPIO 16 (RX2)
RX          --->   GPIO 17 (TX2)

Beban AC:
L (Line)    --->   Sambungkan ke jalur beban AC
N (Neutral) --->   Sambungkan ke jalur beban AC
```

**PERINGATAN KESELAMATAN:**
⚠️ PZEM-004T bekerja dengan listrik AC 220V!
⚠️ Pastikan pemasangan dilakukan oleh teknisi berpengalaman
⚠️ Matikan listrik saat memasang
⚠️ Jangan sentuh bagian yang terhubung AC saat sistem menyala

---

## 📦 Instalasi Library Arduino

### Cara 1: Menggunakan Library Manager (Recommended)

1. Buka Arduino IDE
2. Klik **Sketch** → **Include Library** → **Manage Libraries**
3. Install library berikut:

**Firebase ESP32 Client:**

```
Search: "Firebase ESP Client"
Author: Mobizt
Install: Versi terbaru (4.3.x atau lebih baru)
```

**PZEM-004T:**

```
Search: "PZEM-004Tv30"
Author: Jakub Mandula
Install: Versi terbaru
```

**ArduinoJson:**

```
Search: "ArduinoJson"
Author: Benoit Blanchon
Install: Versi 6.x (JANGAN versi 7.x)
```

### Cara 2: Manual Install

Download dan extract ke folder `Arduino/libraries/`:

- [Firebase ESP32 Client](https://github.com/mobizt/Firebase-ESP32)
- [PZEM-004Tv30](https://github.com/mandulaj/PZEM-004T-v30)
- [ArduinoJson](https://github.com/bblanchon/ArduinoJson)

---

## ⚙️ Konfigurasi Firebase

### 1. Dapatkan Firebase Credentials

Anda sudah punya Firebase project: `smart-building-3e5c1`

#### Cara Mendapatkan API Key:

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project `smart-building-3e5c1`
3. Klik ⚙️ (Settings) → **Project settings**
4. Tab **General** → Scroll ke bawah
5. Copy **Web API Key**

#### Cara Membuat User Authentication:

1. Di Firebase Console, klik **Authentication**
2. Tab **Sign-in method** → Enable **Email/Password**
3. Tab **Users** → **Add user**
4. Masukkan email dan password (contoh: esp32@iot.com / password123)
5. Click **Add user**

### 2. Edit File ESP32_PZEM004T_Firebase.ino

Ganti bagian ini dengan credential Anda:

```cpp
// WiFi Configuration
#define WIFI_SSID "NamaWiFiAnda"           // Ganti dengan SSID WiFi
#define WIFI_PASSWORD "PasswordWiFiAnda"   // Ganti dengan password WiFi

// Firebase Configuration
#define API_KEY "AIzaSyXXXXXXXXXXXXXXXXXXXXXX"  // Ganti dengan Web API Key
#define USER_EMAIL "esp32@iot.com"              // Email user Firebase
#define USER_PASSWORD "password123"              // Password user Firebase

// Laravel API Configuration
#define LARAVEL_API_URL "http://192.168.1.100/api/pln/store-realtime-power"
// Ganti dengan IP server Laravel Anda
// Jika pakai domain: "https://yourdomain.com/api/pln/store-realtime-power"
```

**Cara Cek IP Server Laravel:**

```bash
# Di komputer yang menjalankan Laravel:
ipconfig  # Windows
ifconfig  # Linux/Mac

# Cari IP Address (contoh: 192.168.1.100)
```

---

## 📤 Upload ke ESP32

### 1. Konfigurasi Arduino IDE untuk ESP32

**Install ESP32 Board:**

1. Buka **File** → **Preferences**
2. Di "Additional Board Manager URLs", masukkan:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Klik **OK**
4. Buka **Tools** → **Board** → **Boards Manager**
5. Search "ESP32" → Install **esp32 by Espressif Systems**

**Pilih Board:**

1. **Tools** → **Board** → **ESP32 Arduino** → **ESP32 Dev Module**
2. **Tools** → **Upload Speed** → **115200**
3. **Tools** → **Port** → Pilih COM port ESP32 Anda

### 2. Upload Sketch

1. Buka file `ESP32_PZEM004T_Firebase.ino`
2. Pastikan semua konfigurasi sudah benar
3. Klik **Upload** (→)
4. Tunggu hingga selesai

### 3. Monitor Serial

1. Buka **Tools** → **Serial Monitor**
2. Set baud rate ke **115200**
3. Anda akan melihat output seperti ini:

```
================================
ESP32 PZEM-004T IoT Monitor
================================

[WiFi] Connecting to: YourWiFi
.......
[WiFi] ✅ Connected!
[WiFi] IP Address: 192.168.1.50
[WiFi] Signal Strength: -45 dBm

[Firebase] Configuring...
[Firebase] Authenticating........
[Firebase] ✅ Connected and authenticated!

[SYSTEM] Setup complete!
================================

--- PZEM-004T Readings ---
Voltage:   220.50 V
Current:   1.234 A
Power:     272.00 W
Energy:    1.234 kWh
Frequency: 50.0 Hz
PF:        1.00
-------------------------

[Firebase] 📤 Sending data...
[Firebase] ✅ Data sent successfully!

[API] 📤 Sending to Laravel database...
[API] ✅ Response code: 200
[API] Response: {"message":"Data stored successfully"}
```

---

## 🔧 Troubleshooting

### Problem: "Error reading sensor!"

**Solusi:**

- Cek koneksi kabel TX/RX (pastikan TX PZEM → RX ESP32)
- Pastikan PZEM mendapat power 5V
- Pastikan ada beban AC terhubung ke PZEM
- Coba swap TX dan RX jika masih error

### Problem: "WiFi Connection failed!"

**Solusi:**

- Cek SSID dan Password WiFi
- Pastikan WiFi dalam jangkauan
- ESP32 hanya support WiFi 2.4GHz (TIDAK support 5GHz)

### Problem: "Firebase Authentication failed!"

**Solusi:**

- Cek API_KEY sudah benar
- Pastikan email/password user sudah dibuat di Firebase Authentication
- Cek koneksi internet
- Pastikan Database URL benar

### Problem: "API Error code: -1"

**Solusi:**

- Cek IP address Laravel server
- Pastikan Laravel server menyala (php artisan serve)
- Cek firewall Windows (allow port 8000)
- Pastikan ESP32 dan server di network yang sama

### Problem: "Connection lost" berulang kali

**Solusi:**

- Signal WiFi lemah, dekatkan ESP32 ke router
- Cek stabilitas power supply ESP32
- Tambahkan capacitor 100uF di VCC dan GND ESP32

---

## 📊 Monitoring Data

### 1. Cek Firebase Realtime Database

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project `smart-building-3e5c1`
3. Klik **Realtime Database**
4. Lihat node `/sensor` - data akan update setiap 10 detik

### 2. Cek Laravel Database

```bash
# Via Tinker
php artisan tinker
DB::table('listriks')->latest()->first();

# Via Browser (jika ada UI)
http://localhost/dashboard
```

### 3. Cek Serial Monitor

Real-time output langsung dari ESP32 setiap 1 detik

---

## ⚡ Penjelasan Interval Pengiriman

```cpp
FIREBASE_INTERVAL = 10000   // 10 detik ke Firebase (real-time display)
DATABASE_INTERVAL = 30000   // 30 detik ke Database (storage)
```

**Kenapa berbeda?**

- Firebase: Update cepat untuk real-time monitoring di dashboard
- Database: Lebih jarang untuk menghemat storage dan load server

**Cara mengubah interval:**
Edit nilai di code:

```cpp
const unsigned long FIREBASE_INTERVAL = 5000;   // Ubah jadi 5 detik
const unsigned long DATABASE_INTERVAL = 60000;  // Ubah jadi 60 detik
```

---

## 🎯 Fitur Tambahan

### Auto Reconnect

- ESP32 otomatis reconnect WiFi jika terputus
- Firebase otomatis retry authentication
- Restart ESP32 jika WiFi gagal connect 20x

### Error Handling

- Validasi pembacaan sensor (NaN check)
- HTTP timeout protection (10 detik)
- Firebase error logging ke Serial

### Power Saving (Optional)

Tambahkan di akhir `loop()` jika ingin hemat daya:

```cpp
// Deep sleep 5 detik (TIDAK RECOMMENDED untuk monitoring real-time)
// esp_sleep_enable_timer_wakeup(5000000);
// esp_deep_sleep_start();
```

---

## 📝 Format Data yang Dikirim

### Ke Firebase (/sensor):

```json
{
  "tegangan": "220.50",
  "arus": "1.234",
  "daya": "272.00",
  "energi": "1.234",
  "frekuensi": "50.0",
  "faktor_daya": "1.00",
  "timestamp": 123456789,
  "source": "ESP32-PZEM004T"
}
```

### Ke Laravel API (POST /api/pln/store-realtime-power):

```json
{
  "tegangan": "220.50",
  "arus": "1.234",
  "daya": "272.00",
  "energi": "1.234",
  "frekuensi": "50.0",
  "faktor_daya": "1.00",
  "source": "ESP32-PZEM004T"
}
```

---

## 🔒 Keamanan

### Firebase Security Rules

Pastikan rules Firebase sudah benar:

```json
{
  "rules": {
    "sensor": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

### Laravel API Protection (Optional)

Tambahkan API token di ESP32:

```cpp
http.addHeader("Authorization", "Bearer YOUR_API_TOKEN");
```

---

## 📞 Support

Jika ada masalah:

1. Cek Serial Monitor untuk error messages
2. Test koneksi WiFi dengan WiFi Scanner
3. Test PZEM dengan code example library PZEM-004T
4. Test Firebase dengan example Firebase ESP32 Client

---

## 📚 Referensi

- [PZEM-004T Manual](https://innovatorsguru.com/pzem-004t-v3/)
- [Firebase ESP32 Documentation](https://github.com/mobizt/Firebase-ESP32)
- [ESP32 Arduino Core](https://docs.espressif.com/projects/arduino-esp32/en/latest/)

---

**✅ Setelah setup berhasil:**

- Data PZEM akan otomatis muncul di dashboard
- Firebase update setiap 10 detik
- Database save setiap 30 detik
- Monitor real-time via Serial Monitor
- Tidak ada lagi data generate palsu!

**Selamat mencoba! 🚀**
