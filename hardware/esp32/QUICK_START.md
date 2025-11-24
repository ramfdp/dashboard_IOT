# Quick Start Guide - ESP32 PZEM-004T Integration

## 🎯 Ringkasan Project

ESP32 dengan sensor PZEM-004T dan 5 relay module untuk:

- ✅ Monitor konsumsi listrik real-time (Voltage, Current, Power, Energy)
- ✅ Kontrol 5 lampu via web dashboard
- ✅ Sinkronisasi data ke Firebase & MySQL database

---

## 📦 Komponen yang Dibutuhkan

### Hardware:

1. ESP32 Development Board
2. PZEM-004T (AC Power Monitor)
3. 5-Channel Relay Module
4. Jumper wires
5. 5V Power Supply (3A minimum)
6. 5x Lampu AC (untuk testing)

### Software:

1. Arduino IDE dengan library:
   - Firebase ESP32 Client (Mobizt)
   - PZEM004Tv30 (Jakub Mandula)
   - ArduinoJson (v6.x)

---

## ⚙️ Konfigurasi yang Sudah Disesuaikan

### 1. WiFi Configuration

```cpp
#define WIFI_SSID "WORKSHOP ITMS"
#define WIFI_PASSWORD "ITMS2023"
```

✅ Sudah sesuai dengan WiFi Anda

### 2. Firebase Configuration

```cpp
#define API_KEY "AIzaSyDi-2L7pOKJH1gOAJnSvhMfLUINRPTX7Yg"
#define DATABASE_URL "https://smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app/"
#define USER_EMAIL "esp32@iot.com"
#define USER_PASSWORD "esp32password123"
```

✅ API Key sesuai project
⚠️ Buat user di Firebase Authentication (lihat FIREBASE_SETUP.md)

### 3. Laravel API

```cpp
#define LARAVEL_API_URL "http://192.168.1.100/api/pln/store-realtime-power"
```

⚠️ GANTI IP ini dengan IP komputer Anda!

**Cara cek IP:**

```powershell
ipconfig
# Cari IPv4 Address
```

### 4. Pin Configuration

**PZEM-004T:**

```
PZEM TX  → ESP32 GPIO 16 (RX2)
PZEM RX  → ESP32 GPIO 17 (TX2)
PZEM VCC → 5V
PZEM GND → GND
```

**5 Relay Module:**

```
Relay IN1 → ESP32 GPIO 25 (Lampu 1)
Relay IN2 → ESP32 GPIO 26 (Lampu 2)
Relay IN3 → ESP32 GPIO 27 (Lampu 3)
Relay IN4 → ESP32 GPIO 32 (Lampu 4)
Relay IN5 → ESP32 GPIO 33 (Lampu 5)
Relay VCC → 5V
Relay GND → GND
```

---

## 🔄 Data Flow yang Sudah Disesuaikan

### 1. PZEM Data ke Firebase (/sensor)

**Interval:** Setiap 10 detik

**Data Structure:**

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

### 2. PZEM Data ke Laravel API

**Interval:** Setiap 30 detik

**Endpoint:** `POST /api/pln/store-realtime-power`

**Payload:** Same as Firebase

### 3. Relay Control via Firebase (/relayControl)

**Path Structure:**

```
/relayControl
  ├── relay1: 0  (0=OFF, 1=ON)
  ├── relay2: 0
  ├── relay3: 0
  ├── relay4: 0
  └── relay5: 0
```

**Cara Kerja:**

1. Dashboard web update `/relayControl/relay1` = 1
2. ESP32 detect via Firebase Stream Listener
3. ESP32 set GPIO 25 = HIGH
4. Relay 1 active → Lampu 1 nyala
5. ESP32 update status kembali ke Firebase

---

## 📝 Step-by-Step Installation

### Step 1: Setup Firebase Authentication

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Project: **smart-building-3e5c1**
3. **Authentication** → **Sign-in method**
4. Enable **Email/Password**
5. **Users** → **Add user**:
   - Email: `esp32@iot.com`
   - Password: `esp32password123`

### Step 2: Update Laravel API URL

1. Buka PowerShell/CMD
2. Ketik: `ipconfig`
3. Catat IPv4 Address (contoh: 192.168.1.100)
4. Edit `ESP32_PZEM004T_Firebase.ino`:
   ```cpp
   #define LARAVEL_API_URL "http://192.168.1.100/api/pln/store-realtime-power"
   ```
5. Jika pakai `php artisan serve`:
   ```cpp
   #define LARAVEL_API_URL "http://192.168.1.100:8000/api/pln/store-realtime-power"
   ```

### Step 3: Install Arduino Libraries

Arduino IDE → **Tools** → **Manage Libraries**:

1. **Firebase ESP32 Client** by Mobizt
2. **PZEM004Tv30** by Jakub Mandula
3. **ArduinoJson** by Benoit Blanchon (v6.x, BUKAN v7)

### Step 4: Wiring Hardware

**PZEM-004T (DC side):**

- VCC → ESP32 5V
- GND → ESP32 GND
- TX → ESP32 GPIO 16
- RX → ESP32 GPIO 17

**Relay Module:**

- VCC → ESP32 5V
- GND → ESP32 GND
- IN1 → GPIO 25
- IN2 → GPIO 26
- IN3 → GPIO 27
- IN4 → GPIO 32
- IN5 → GPIO 33

**⚠️ AC WIRING (by electrician only!):**

- Connect PZEM to AC load
- Connect relay COM to MCB Live
- Connect relay NO to Lamp Live

### Step 5: Upload Code

1. Connect ESP32 via USB
2. Arduino IDE:
   - **Board:** ESP32 Dev Module
   - **Port:** (pilih COM port ESP32)
   - **Upload Speed:** 115200
3. Open `ESP32_PZEM004T_Firebase.ino`
4. Click **Upload** (→)
5. Wait for "Done uploading"

### Step 6: Monitor Serial Output

1. **Tools** → **Serial Monitor**
2. Set baud rate: **115200**
3. Anda akan lihat:

```
================================
ESP32 PZEM-004T IoT Monitor
with 5-Relay Light Control
================================

[RELAY] Initializing relay pins...
[RELAY] Relay 1 (GPIO 25): OFF
[RELAY] Relay 2 (GPIO 26): OFF
[RELAY] Relay 3 (GPIO 27): OFF
[RELAY] Relay 4 (GPIO 32): OFF
[RELAY] Relay 5 (GPIO 33): OFF

[WiFi] Connecting to: WORKSHOP ITMS
.....
[WiFi] ✅ Connected!
[WiFi] IP Address: 192.168.1.50

[Firebase] Configuring...
[Firebase] Authenticating......
[Firebase] ✅ Connected and authenticated!

[Stream] ✅ Stream listener started on /relayControl

--- PZEM-004T Readings ---
Voltage:   220.50 V
Current:   1.234 A
Power:     272.00 W
Energy:    1.234 kWh
-------------------------

[Firebase] 📤 Sending data...
[Firebase] ✅ Data sent successfully!
```

---

## ✅ Verification Checklist

### Firebase:

- [ ] User `esp32@iot.com` exists in Authentication
- [ ] Data muncul di `/sensor` setiap 10 detik
- [ ] `/relayControl/relay1-5` ada dan bernilai 0
- [ ] Serial Monitor show: `[Firebase] ✅ Connected`

### Laravel API:

- [ ] Server Laravel running (`php artisan serve`)
- [ ] Firewall allow port 8000 (atau port yang dipakai)
- [ ] ESP32 dan server di network yang sama
- [ ] Serial Monitor show: `[API] ✅ Response code: 200`

### PZEM Sensor:

- [ ] PZEM connected ke AC load
- [ ] Voltage reading ~220V
- [ ] Current/Power shows actual consumption
- [ ] No error: `[PZEM] ❌ Error reading sensor!`

### Relay Control:

- [ ] All relays OFF saat boot
- [ ] Toggle relay1 di Firebase → Relay click
- [ ] Toggle dari dashboard → Relay responds
- [ ] Lampu nyala/mati sesuai kontrol

---

## 🐛 Troubleshooting

| Problem              | Check          | Solution                           |
| -------------------- | -------------- | ---------------------------------- |
| WiFi failed          | SSID/Password  | Verify credentials                 |
| Firebase auth failed | User creation  | Create `esp32@iot.com` in Firebase |
| API error -1         | Laravel server | Start `php artisan serve`          |
| API error -1         | IP address     | Check ESP32 & server same network  |
| PZEM error           | Wiring         | TX↔RX, VCC=5V, GND connected       |
| Relay no click       | Power supply   | Use 3A adapter, check voltage      |
| Relay no response    | Firebase path  | Verify `/relayControl/relay1`      |

---

## 📊 Expected Behavior

### Normal Operation:

**Every 1 second:**

- Read PZEM sensor
- Print to Serial Monitor

**Every 10 seconds:**

- Send data to Firebase `/sensor`

**Every 30 seconds:**

- Send data to Laravel API

**Real-time:**

- Listen to Firebase `/relayControl`
- Update relay immediately when changed
- Update status back to Firebase

---

## 🔒 Safety Warnings

### ⚠️ HIGH VOLTAGE AC 220V!

1. **NEVER** touch AC terminals when powered
2. **ALWAYS** turn OFF main breaker before wiring
3. **USE** proper wire gauge (1.5mm² minimum)
4. **TEST** with low power loads first (LED bulb)
5. **INSTALL** in proper enclosure
6. **KEEP** away from water/moisture
7. **VERIFY** all connections before power ON
8. **HAVE** fire extinguisher nearby

**Installation by qualified electrician only!**

---

## 📁 Documentation Files

```
hardware/esp32/
├── ESP32_PZEM004T_Firebase.ino    ← Main code (READY TO USE)
├── FIREBASE_SETUP.md              ← Firebase configuration guide
├── RELAY_WIRING_DIAGRAM.md        ← Detailed wiring diagrams
├── README_ESP32_PZEM_SETUP.md     ← Complete setup guide
└── QUICK_START.md                 ← This file
```

---

## 🎯 What's Different from Generic Code?

### ✅ Disesuaikan dengan Project:

1. **Firebase Paths:**

   - Generic: `/devices/relay`
   - **Project:** `/relayControl/relay1-5` ✅

2. **Data Format:**

   - Generic: `boolean` (true/false)
   - **Project:** `int` (0/1) ✅

3. **WiFi Credentials:**

   - Generic: Placeholder
   - **Project:** "WORKSHOP ITMS" ✅

4. **Firebase API Key:**

   - Generic: Placeholder
   - **Project:** Real API key ✅

5. **Relay Count:**
   - Generic: 8 relays
   - **Project:** 5 relays (sisanya reserved) ✅

---

## 🚀 Next Steps

### After ESP32 Working:

1. **Dashboard Integration:**

   - Verify web dashboard can control relays
   - Check real-time data updates
   - Test manual mode

2. **Add Remaining 3 Relays:**

   ```cpp
   #define RELAY_6 14  // GPIO 14
   #define RELAY_7 12  // GPIO 12
   #define RELAY_8 13  // GPIO 13
   ```

3. **Production Deployment:**

   - Use external power supply
   - Install in proper enclosure
   - Label all relays clearly
   - Document installation

4. **Monitoring:**
   - Check Firebase quota usage
   - Monitor database growth
   - Set up alerts for failures

---

## ✅ Status Saat Ini

- [x] ESP32 code disesuaikan dengan project
- [x] Firebase paths match dashboard
- [x] Data format (0/1) compatible
- [x] WiFi credentials configured
- [x] API key integrated
- [x] 5 relay pins defined
- [x] PZEM-004T configured
- [x] Stream listener implemented
- [x] Documentation complete

**Ready untuk hardware installation! 🎉**

---

**Need Help?**

- Check FIREBASE_SETUP.md untuk Firebase configuration
- Check RELAY_WIRING_DIAGRAM.md untuk wiring details
- Check README_ESP32_PZEM_SETUP.md untuk troubleshooting
