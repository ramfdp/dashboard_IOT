# Firebase Configuration Guide - ESP32 Integration

## 📋 Firebase Setup untuk ESP32

### 1. Firebase Authentication Setup

ESP32 perlu user authentication untuk akses Firebase Realtime Database.

**Steps:**

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project: **smart-building-3e5c1**
3. Klik **Authentication** di sidebar
4. Tab **Sign-in method**:

   - Enable **Email/Password**
   - Klik **Save**

5. Tab **Users**:
   - Klik **Add user**
   - Email: `esp32@iot.com`
   - Password: `esp32password123`
   - Klik **Add user**

✅ User ESP32 sudah dibuat!

---

### 2. Firebase Realtime Database Structure

ESP32 akan menggunakan struktur yang sama dengan web dashboard:

```
smart-building-3e5c1
│
├── /sensor                     ← PZEM-004T Data (ESP32 writes)
│   ├── tegangan: "220.50"
│   ├── arus: "1.234"
│   ├── daya: "272.00"
│   ├── energi: "1.234"
│   ├── frekuensi: "50.0"
│   ├── faktor_daya: "1.00"
│   ├── timestamp: 123456789
│   └── source: "ESP32-PZEM004T"
│
└── /relayControl               ← Relay Control (ESP32 reads & writes)
    ├── relay1: 0               ← 0=OFF, 1=ON
    ├── relay2: 0
    ├── relay3: 0
    ├── relay4: 0
    ├── relay5: 0
    ├── relay6: 0               ← Reserved (not used yet)
    ├── relay7: 0               ← Reserved (not used yet)
    ├── relay8: 0               ← Reserved (not used yet)
    └── manualMode: false       ← Dashboard sets this
```

---

### 3. Firebase Security Rules

Pastikan ESP32 bisa read/write data:

**Cara update rules:**

1. Firebase Console → **Realtime Database**
2. Tab **Rules**
3. Paste rules berikut:

```json
{
  "rules": {
    "sensor": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "relayControl": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "devices": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

4. Klik **Publish**

✅ ESP32 sekarang bisa akses Firebase dengan authentication!

---

### 4. Kredensial yang Digunakan di ESP32

File: `ESP32_PZEM004T_Firebase.ino`

```cpp
// Firebase Configuration
#define API_KEY "AIzaSyDi-2L7pOKJH1gOAJnSvhMfLUINRPTX7Yg"
#define DATABASE_URL "https://smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app/"
#define USER_EMAIL "esp32@iot.com"
#define USER_PASSWORD "esp32password123"
```

**PENTING:**

- `API_KEY` sudah sesuai dengan project Anda
- `USER_EMAIL` dan `USER_PASSWORD` harus dibuat di Firebase Authentication
- Jangan share kredensial ini di public repository!

---

### 5. Laravel API Configuration

ESP32 kirim data ke Laravel API untuk disimpan ke database MySQL.

**Endpoint:** `/api/pln/store-realtime-power`

**Cara cek IP server Laravel:**

```powershell
# Windows PowerShell
ipconfig

# Cari "IPv4 Address" (contoh: 192.168.1.100)
```

**Update di ESP32:**

```cpp
#define LARAVEL_API_URL "http://192.168.1.100/api/pln/store-realtime-power"
```

**Jika pakai php artisan serve:**

```cpp
#define LARAVEL_API_URL "http://192.168.1.100:8000/api/pln/store-realtime-power"
```

**Jika pakai domain:**

```cpp
#define LARAVEL_API_URL "https://yourdomain.com/api/pln/store-realtime-power"
```

---

### 6. Data Flow Diagram

```
┌─────────────┐
│   PZEM-004T │
│   Sensor    │
└──────┬──────┘
       │ Serial (TX/RX)
       ▼
┌─────────────────────┐
│      ESP32          │
│                     │
│  Read every 1s      │
└──┬──────────────┬───┘
   │              │
   │ 10s          │ 30s
   ▼              ▼
┌──────────┐  ┌──────────────┐
│ Firebase │  │ Laravel API  │
│ /sensor  │  │ MySQL DB     │
└────┬─────┘  └──────┬───────┘
     │               │
     │               │
     ▼               ▼
┌────────────────────────┐
│   Web Dashboard        │
│                        │
│  - Real-time monitor   │
│  - Historical data     │
│  - Charts & analytics  │
└────────────────────────┘


┌─────────────┐
│ Dashboard   │
│ Relay Toggle│
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│   Firebase          │
│   /relayControl     │
│   relay1-5: 0/1     │
└──────┬──────────────┘
       │
       │ Stream Listener
       ▼
┌─────────────────────┐
│      ESP32          │
│                     │
│  Update GPIO        │
│  GPIO 25-33         │
└──────┬──────────────┘
       │
       ▼
┌─────────────┐
│ 5x Relay    │
│ Module      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Lampu 1-5   │
│ AC 220V     │
└─────────────┘
```

---

### 7. Testing Firebase Connection

**Test 1: Manual Test di Firebase Console**

1. Buka Firebase Console
2. Realtime Database
3. Klik **+** di root
4. Path: `/relayControl/relay1`
5. Value: `1`
6. ESP32 Serial Monitor harus show: `Relay 1 (GPIO 25): ON`

**Test 2: Dashboard Control**

1. Buka dashboard web
2. Toggle switch Relay 1
3. Firebase `/relayControl/relay1` berubah jadi `1`
4. ESP32 detect perubahan dan nyalakan relay
5. Lampu menyala

**Test 3: ESP32 to Firebase**

1. ESP32 boot up
2. Serial Monitor show: `[Firebase] ✅ Connected and authenticated!`
3. PZEM data muncul di Firebase `/sensor` setiap 10 detik
4. Check timestamp untuk verify data fresh

---

### 8. Monitoring & Debugging

**Serial Monitor Output (Normal):**

```
================================
ESP32 PZEM-004T IoT Monitor
with 5-Relay Light Control
================================

[WiFi] Connected!
[WiFi] IP Address: 192.168.1.50

[Firebase] Configuring...
[Firebase] Authenticating.....
[Firebase] ✅ Connected and authenticated!

[Stream] ✅ Stream listener started on /relayControl
[RELAY] ✅ Relay 1 status updated: 0
[RELAY] ✅ Relay 2 status updated: 0
[RELAY] ✅ Relay 3 status updated: 0

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
```

**Troubleshooting:**

| Error                                  | Cause                | Solution                     |
| -------------------------------------- | -------------------- | ---------------------------- |
| `[Firebase] ❌ Authentication failed!` | Email/password salah | Verify user di Firebase Auth |
| `[Stream] ❌ Failed to begin stream`   | Path salah           | Check `/relayControl` path   |
| `[API] ❌ Error code: -1`              | Laravel tidak jalan  | Start `php artisan serve`    |
| `[PZEM] ❌ Error reading sensor!`      | Wiring salah         | Check TX↔RX connection       |

---

### 9. Firebase Quota & Limits

**Free Spark Plan:**

- Realtime Database: 1 GB storage
- 10 GB/month download
- 100 simultaneous connections

**Estimasi usage ESP32:**

- Data size per update: ~200 bytes
- Updates per hour: 360 (Firebase) + 120 (Database) = 480
- Daily: 480 × 24 = 11,520 updates (~2.3 MB)
- Monthly: ~70 MB

✅ Free plan lebih dari cukup!

---

### 10. Security Best Practices

**DO:**

- ✅ Gunakan environment-specific credentials
- ✅ Enable Firebase Security Rules
- ✅ Create dedicated ESP32 user (jangan pakai admin)
- ✅ Use HTTPS untuk Laravel API (production)
- ✅ Rotate password secara berkala

**DON'T:**

- ❌ Commit credentials ke Git
- ❌ Share Firebase API Key publicly
- ❌ Disable security rules
- ❌ Use weak password

---

### 11. Backup & Recovery

**Backup Firebase Data:**

```javascript
// Firebase Console → Database → Export JSON
// Or programmatic backup:
firebase database:get / > backup.json
```

**Restore Data:**

```javascript
// Firebase Console → Database → Import JSON
firebase database:set / backup.json
```

---

## ✅ Checklist Firebase Setup

Sebelum upload ke ESP32:

- [ ] Firebase Authentication enabled
- [ ] User `esp32@iot.com` created
- [ ] Security Rules configured
- [ ] `/sensor` path created
- [ ] `/relayControl` path with relay1-5 created
- [ ] API Key verified in code
- [ ] Laravel API URL updated with correct IP
- [ ] Test Firebase connection from web dashboard
- [ ] Serial Monitor ready untuk debugging

**Ready to upload! 🚀**
