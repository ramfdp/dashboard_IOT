# 🔄 **Perubahan: Hapus Tabel Sensors dan Update ke Listrik**

## **✅ Perubahan yang Sudah Dilakukan:**

### **1. Update SensorController**

- ✅ **Ganti import**: `use App\Models\Sensor;` → `use App\Models\Listrik;`
- ✅ **Update method `index()`**: Menggunakan `Listrik::latest()->take(100)->get()`
- ✅ **Update method `store()`**: Menyimpan data PZEM (voltage, current, power, energy, frequency, pf, lokasi)
- ✅ **Update method `show()`**: Mengambil data dari tabel listriks
- ✅ **Update method `update()`**: Update data listrik dengan validation
- ✅ **Update method `destroy()`**: Hapus data dari tabel listriks
- ✅ **Update method `latest()`**: Mengembalikan data PZEM terbaru
- ✅ **Update method `summary()`**: Menghitung total power, energy, average voltage/current

### **2. Cleanup Database & Files**

- ✅ **Hapus Model**: `app/models/Sensor.php` (deleted)
- ✅ **Hapus Tabel**: `sensors` table dropped from database
- ✅ **Migration**: File migration sensors sudah tidak ada

### **3. Update Documentation**

- ✅ **API Docs**: Update `docs/API_POSTMAN_DOCUMENTATION.md`
  - Ganti "Sensor Management" → "Listrik/Sensor Management (PZEM Data)"
  - Update request/response examples dengan data PZEM
- ✅ **Postman Collection**: Update `docs/Dashboard_IoT_API_Collection.postman_collection.json`
  - Update nama collection items
  - Update request body dengan data PZEM

### **4. Database Cleanup**

- ✅ **Hapus Generated Data**:
  - 793 records dengan `source = "real_time_generator"` dihapus
  - 2 records dengan `source = "test_command"` dihapus
  - 2976 records "PT Krakatau Sarana Property" (generated) dihapus
  - **Total dihapus: 3771 records generated data**
- ✅ **Data Bersih**: Tersisa 1 record data real (bukan generated)
- ✅ **Tabel Clean**: Tabel listriks sekarang hanya berisi data sensor PZEM real

---

## **📊 API Endpoints Sekarang Menggunakan Tabel `listriks`:**

### **Sensor API (menggunakan data PZEM dari tabel listriks):**

1. **GET** `/api/sensors`

   - Data: 100 record terbaru dari tabel `listriks`
   - Fields: `voltage`, `current`, `power`, `energy`, `frequency`, `pf`, `lokasi`

2. **POST** `/api/sensor`

   - Input: Data sensor PZEM
   - Simpan ke: Tabel `listriks`
   - Broadcast: Via WebSocket

3. **GET** `/api/sensor/latest`

   - Data: Record terbaru dari tabel `listriks`
   - Response: Data PZEM lengkap

4. **GET** `/api/sensors/summary`
   - Kalkulasi: `total_power`, `total_energy`, `avg_voltage`, `avg_current`
   - Source: Tabel `listriks`

---

## **🔍 Struktur Request/Response Baru:**

### **Create Sensor Data (POST /api/sensor):**

```json
{
  "voltage": 220.5,
  "current": 5.2,
  "power": 1000.0,
  "energy": 15.5,
  "frequency": 50.0,
  "pf": 0.98,
  "lokasi": "Ruang Server"
}
```

### **Get Summary Response:**

```json
{
  "success": true,
  "total_power": 15000.5,
  "total_energy": 250.8,
  "avg_voltage": 220.2,
  "avg_current": 4.8,
  "latest_power": 1000.0,
  "latest_voltage": 220.5,
  "data_count": 1500
}
```

---

## **⚠️ Breaking Changes:**

### **Sebelumnya (dengan tabel sensors):**

- Input: `temperature`, `humidity`
- Output: `temperature`, `humidity`, `lamp_usage`, `ac_usage`

### **Sekarang (dengan tabel listriks):**

- Input: `voltage`, `current`, `power`, `energy`, `frequency`, `pf`, `lokasi`
- Output: `total_power`, `total_energy`, `avg_voltage`, `avg_current`

---

## **🚀 Cara Menggunakan di Postman:**

1. **Import Collection**: `docs/Dashboard_IoT_API_Collection.postman_collection.json`
2. **Test dengan data PZEM**:
   ```json
   POST /api/sensor
   {
     "voltage": 220,
     "current": 5.0,
     "power": 1100,
     "energy": 10.5,
     "frequency": 50,
     "pf": 0.95,
     "lokasi": "Lab IOT"
   }
   ```
3. **Check summary**: `GET /api/sensors/summary`

---

## **✅ Benefits:**

1. **Konsistensi**: API sensors sekarang menggunakan data real dari sensor PZEM
2. **Data Real**: Tidak lagi menggunakan dummy data temperature/humidity
3. **Integrasi**: Seamless dengan sistem monitoring listrik existing
4. **Cleanup**: Removed unused sensors table dan model
5. **Documentation**: Updated dengan structure data yang benar

**🎉 Sekarang API sensors menggunakan data PZEM real dari tabel `listriks` dan sudah tidak ada tabel `sensors` yang tidak diperlukan!**
