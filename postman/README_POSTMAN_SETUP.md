# 🚀 **POSTMAN SETUP - Dashboard IoT PZEM API**

## **✅ READY TO TEST! Files Sudah Tersedia**

### **📁 Files untuk Import:**

1. `postman/Dashboard_IOT_API_Collection.json` - Main API Collection
2. `postman/Dashboard_IOT_Environment.json` - Environment Settings

---

## **📝 LANGKAH IMPORT KE POSTMAN:**

### **1. Start Laravel Server**

```bash
php artisan serve
# ✅ Server running di: http://127.0.0.1:8000
```

### **2. Import ke Postman**

1. **Buka Postman**
2. **Import Collection:**

   - Click **Import** → Pilih file `Dashboard_IOT_API_Collection.json`
   - Collection "Dashboard IOT - PZEM Sensor API" akan muncul

3. **Import Environment:**
   - Click **Import** → Pilih file `Dashboard_IOT_Environment.json`
   - Pilih environment "Dashboard IOT - Development" di top-right dropdown

### **3. Test API Endpoints**

**Endpoint Siap Test:**

- ✅ `GET /api/sensors/summary` - **TESTED WORKING**
- ✅ `GET /api/sensors` - List 100 data terbaru
- ✅ `GET /api/sensor/latest` - Data sensor terbaru
- ✅ `POST /api/sensor` - Tambah data sensor baru

---

## **📊 DATA TERSEDIA:**

### **✅ Real Data Statistics:**

- **18,148 Records** - Data sensor PZEM real
- **Period**: 14 Juli - 14 September 2025
- **Location**: PT Krakatau Sarana Property
- **Sensor**: PZEM-004T
- **Interval**: Every 5 minutes

### **📈 Latest Test Result:**

```json
{
  "success": true,
  "total_power": 16391183,
  "total_energy": 461625.01,
  "avg_voltage": 219.91,
  "avg_current": 4.85,
  "latest_power": 353,
  "latest_voltage": 214.9,
  "data_count": 18172,
  "location": "PT Krakatau Sarana Property"
}
```

---

## **🎯 QUICK TEST STEPS:**

1. **Import** kedua file JSON ke Postman
2. **Select** environment "Dashboard IOT - Development"
3. **Choose** request "Get Sensor Summary Statistics"
4. **Click** Send button
5. **Result** → Akan dapat data dari 18,148+ records ✅

---

## **💡 Tips:**

### **Environment Variables Available:**

- `{{baseUrl}}` = http://127.0.0.1:8000
- `{{location}}` = PT Krakatau Sarana Property

### **Test Scenarios:**

1. **GET Summary** - Lihat statistik keseluruhan
2. **GET Sensors** - Lihat 100 data terbaru
3. **POST Sensor** - Tambah data sensor baru
4. **GET Latest** - Data sensor terakhir

**🎉 API siap digunakan dengan 18,148+ data real sensor PZEM!**
