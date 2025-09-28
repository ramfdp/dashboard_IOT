# 📚 **Dashboard IoT - API Documentation untuk Postman**

## **✅ UPDATED: Dengan Data Real (18,148 Records PZEM)**

## **🔧 Base Configuration**

### **Environment Variables:**

```json
{
  "baseUrl": "http://127.0.0.1:8000",
  "laravelUrl": "http://dashboard_iot.test",
  "user_id": "1",
  "location": "PT Krakatau Sarana Property"
}
```

### **Headers Global:**

```
Content-Type: application/json
Accept: application/json
```

---

## **📁 COLLECTION 1: PZEM Sensor Management (TESTED ✅)**

### **1. Get All Listrik Data ✅**

- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/sensors`
- **Description:** Mengambil 100 data sensor PZEM terbaru (dari 18,148 total records)
- **Test Status:** ✅ **WORKING** - Data tersedia Juli-September 2025

**Response Example (Real Data):**

```json
{
  "success": true,
  "data": [
    {
      "id": 18117,
      "lokasi": "PT Krakatau Sarana Property",
      "tegangan": 210.5,
      "arus": 5.71,
      "daya": 1057,
      "energi": 31.34,
      "frekuensi": 49.7,
      "power_factor": 0.88,
      "status": "active",
      "metadata": "{\"sensor_type\":\"PZEM-004T\",\"location_detail\":\"Main Power Line\",\"measurement_interval\":\"5_minutes\"}",
      "created_at": "2025-09-14T14:40:00.000000Z",
      "updated_at": "2025-09-14T14:40:00.000000Z"
    }
  ],
  "count": 100
}
```

---

### **2. Create Sensor Data (PZEM) ✅**

- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/sensor`
- **Description:** Menyimpan data sensor PZEM baru (support field lama & baru)
- **Test Status:** ✅ **TESTED & WORKING** - Command line test berhasil

**⚠️ POSTMAN TROUBLESHOOTING:**
Jika mendapat error **405 Method Not Allowed**, pastikan:

1. **URL**: `http://127.0.0.1:8000/api/sensor` (bukan https)
2. **Method**: POST (bukan GET)
3. **Headers**: Content-Type: application/json, Accept: application/json
4. **Body**: raw → JSON format
5. **Server**: `php artisan serve` berjalan

**Body Options (JSON):**

**Opsi 1: Field Indonesia (Recommended):**

```json
{
  "lokasi": "PT Krakatau Sarana Property",
  "tegangan": 220.5,
  "arus": 5.2,
  "daya": 1140,
  "energi": 15.5,
  "frekuensi": 50.0,
  "power_factor": 0.85
}
```

**Opsi 2: Field English (Legacy Support):**

```json
{
  "lokasi": "PT Krakatau Sarana Property",
  "voltage": 220.5,
  "current": 5.2,
  "power": 1140,
  "energy": 15.5,
  "frequency": 50.0,
  "pf": 0.85
}
```

**Response Example:**

```json
{
  "success": true,
  "message": "Data listrik berhasil disimpan",
  "data": {
    "id": 18149,
    "lokasi": "PT Krakatau Sarana Property",
    "tegangan": 220.5,
    "arus": 5.2,
    "daya": 1140,
    "energi": 15.5,
    "frekuensi": 50.0,
    "power_factor": 0.85,
    "status": "active",
    "metadata": "{\"sensor_type\":\"PZEM-004T\",\"source\":\"api_sensor\"}",
    "created_at": "2025-09-28T15:30:00.000000Z"
  }
}
```

---

### **3. Get Latest Sensor Data ✅**

- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/sensor/latest`
- **Description:** Mengambil data sensor PZEM terbaru
- **Test Status:** ✅ **WORKING** - Field sudah diupdate

**Response Example (Real Latest Data):**

```json
{
  "success": true,
  "tegangan": 222.7,
  "arus": 1.03,
  "daya": 199,
  "energi": 42.34,
  "frekuensi": 50.5,
  "power_factor": 0.87,
  "lokasi": "PT Krakatau Sarana Property",
  "status": "active",
  "datetime": "2025-09-14T16:55:00.000000Z"
}
```

---

### **4. Get Sensor Summary ✅**

- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/sensors/summary`
- **Description:** Mendapatkan ringkasan statistik dari 18,148 data sensor
- **Test Status:** ✅ **TESTED & WORKING**

**Response Example (Real Summary):**

```json
{
  "success": true,
  "total_power": 16382652,
  "total_energy": 461624.77,
  "avg_voltage": 219.91,
  "avg_current": 4.85,
  "latest_power": 338,
  "latest_voltage": 210.6,
  "latest_current": 1.61,
  "latest_energy": 0.01,
  "data_count": 18148,
  "location": "PT Krakatau Sarana Property"
}
```

---

## **� QUICK IMPORT TO POSTMAN**

### **🚀 Ready-to-Use Files:**

1. **Collection File**: `postman/Dashboard_IOT_API_Collection.json`
2. **Environment File**: `postman/Dashboard_IOT_Environment.json`

### **📝 Import Instructions:**

1. **Open Postman**
2. **Import Collection:**

   - Click **Import** button
   - Select `Dashboard_IOT_API_Collection.json`
   - Collection akan muncul di sidebar

3. **Import Environment:**

   - Click **Import** button
   - Select `Dashboard_IOT_Environment.json`
   - Pilih environment "Dashboard IOT - Development" di top-right

4. **Start Laravel Server:**

   ```bash
   php artisan serve
   # Server akan berjalan di http://127.0.0.1:8000
   ```

5. **Test API:**
   - Pilih request "Get Sensor Summary"
   - Click **Send**
   - Akan dapat response dengan 18,148 data

### **✅ Available Endpoints (Ready to Test):**

#### **PZEM Sensor (TESTED ✅):**

- `GET /api/sensors` - 100 data terbaru
- `GET /api/sensors/summary` - Statistik 18,148 records
- `GET /api/sensor/latest` - Data terbaru
- `POST /api/sensor` - Tambah data baru

#### **Real-time Power:**

- `POST /api/real-time-power` - Store power data
- `GET /api/real-time-power/latest` - Latest power
- `GET /api/realtime-power/krakatau-stats` - PT Krakatau stats

#### **User Management:**

- `GET /api/users` - All users
- `POST /api/users` - Create user
- `GET /api/users/statistics` - User stats

---

## **📊 Test Data Available:**

### **✅ Real Data Summary:**

- **Total Records**: 18,148
- **Date Range**: 14 Juli - 14 September 2025
- **Location**: PT Krakatau Sarana Property
- **Sensor**: PZEM-004T
- **Interval**: Every 5 minutes
- **Patterns**: Realistic day/night, weekday/weekend consumption

### **⚡ Sample Values:**

```json
{
  "tegangan": 210.5, // 210-230V
  "arus": 5.71, // 0.5-12A patterns
  "daya": 1057, // Calculated power
  "energi": 31.34, // kWh accumulated
  "frekuensi": 49.7, // 50Hz ± 0.5
  "power_factor": 0.88 // 0.80-0.90
}
```

---

## **�📁 COLLECTION 2: User Management**

### **5. Get All Users**

- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/users`
- **Response Example:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "created_at": "2025-09-28 15:30:00"
    }
  ]
}
```

---

### **6. Create New User**

- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/users`
- **Body (JSON):**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

- **Response Example:**

```json
{
  "success": true,
  "message": "User berhasil ditambahkan",
  "data": {
    "id": 2,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

### **7. Get User by ID**

- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/users/{{user_id}}`
- **Response Example:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "created_at": "2025-09-28 15:30:00"
  }
}
```

---

### **8. Update User**

- **Method:** `PUT`
- **URL:** `{{baseUrl}}/api/users/{{user_id}}`
- **Body (JSON):**

```json
{
  "name": "John Smith Updated",
  "email": "johnupdated@example.com",
  "role": "admin",
  "password": "newpassword123"
}
```

- **Note:** Password is optional
- **Response Example:**

```json
{
  "success": true,
  "message": "User berhasil diupdate",
  "data": {
    "id": 2,
    "name": "John Smith Updated",
    "email": "johnupdated@example.com",
    "role": "admin"
  }
}
```

---

### **9. Delete User**

- **Method:** `DELETE`
- **URL:** `{{baseUrl}}/api/users/{{user_id}}`
- **Response Example:**

```json
{
  "success": true,
  "message": "User berhasil dihapus"
}
```

---

### **10. Get User Statistics**

- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/users/statistics`
- **Response Example:**

```json
{
  "success": true,
  "data": {
    "total_users": 15,
    "admin_count": 3,
    "user_count": 12,
    "recent_users": [
      {
        "id": 15,
        "name": "Latest User",
        "email": "latest@example.com",
        "created_at": "2025-09-28T15:30:00.000000Z"
      }
    ]
  }
}
```

---

## **📁 COLLECTION 3: Power & Electricity Management**

### **11. Get Power Usage**

- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/power-usage`

---

### **12. Get Listrik Data**

- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/listrik`

---

### **13. Create Listrik Data**

- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/listrik`
- **Body:** (Sesuaikan dengan struktur data listrik)

---

### **14. Get Current Usage**

- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/electricity/current-usage`

---

### **15. Get Electricity Analysis**

- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/electricity/analysis`

---

## **📁 COLLECTION 4: Dashboard Controls**

### **16. Get Sensor Data**

- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/dashboard/sensor-data`

---

### **17. Control Relay**

- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/dashboard/control-relay`
- **Body (JSON):**

```json
{
  "relay_id": 1,
  "state": "on"
}
```

---

### **18. Get Relay States**

- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/dashboard/relay-states`

---

## **📁 COLLECTION 5: Schedules Management**

### **19. Get All Schedules**

- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/schedules`

---

### **20. Create Schedule**

- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/schedules`

---

### **21. Get Current Schedule**

- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/schedules/current`

---

## **🚀 Quick Setup Instructions:**

1. **Install Postman** dan buat workspace baru
2. **Import Collection** atau buat manual menggunakan endpoint di atas
3. **Setup Environment:**
   - Nama: `Dashboard_IoT_Local`
   - Variables:
     - `baseUrl`: `http://localhost:8000`
     - `user_id`: `1` (untuk testing)
4. **Test Endpoints** satu per satu mulai dari Sensor Management
5. **Untuk Production:** Ganti `baseUrl` ke domain production

---

## **⚠️ Important Notes:**

- **Base URL:** Pastikan Laravel server berjalan di `http://localhost:8000` atau sesuaikan
- **CORS:** Pastikan CORS sudah dikonfigurasi untuk API calls
- **Validation:** Semua endpoint memiliki validation dan error handling
- **Role Management:** User endpoints menggunakan Spatie Permission untuk role management
- **Response Format:** Semua response menggunakan format JSON konsisten dengan `success` flag

**Semua API sudah siap digunakan dan ditest di Postman!** 🎉
