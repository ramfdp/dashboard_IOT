# 🚨 **QUICK FIX - Postman POST Error 405**

## **Problem**: POST ke `{{baseUrl}}/api/sensor` → Error 405 Method Not Allowed

## **✅ SOLUTION (Step by Step):**

### **1. ⚠️ PASTIKAN SERVER RUNNING:**

```bash
php artisan serve
# Harus muncul: Server running on [http://127.0.0.1:8000]
```

### **2. 🔧 POSTMAN SETUP (Manual):**

**A. Create New Request:**

- New Request → POST
- URL: `http://127.0.0.1:8000/api/sensor` (**JANGAN pakai {{baseUrl}} dulu**)

**B. Headers Tab:**

```
Content-Type: application/json
Accept: application/json
```

**C. Body Tab:**

- Select: **raw**
- Dropdown: **JSON** (bukan Text!)
- Body:

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

**D. Send:**

- Click **Send**
- Harus dapat response success ✅

---

## **3. ✅ EXPECTED RESULT:**

```json
{
  "success": true,
  "message": "Data listrik berhasil disimpan",
  "data": {
    "id": 18174,
    "lokasi": "PT Krakatau Sarana Property",
    "tegangan": 220.5,
    "arus": 5.2,
    "daya": 1140,
    "energi": 15.5,
    "frekuensi": 50.0,
    "power_factor": 0.85,
    "status": "active",
    "metadata": "{\"sensor_type\":\"PZEM-004T\",\"source\":\"api_sensor\"}",
    "created_at": "2025-09-28T..."
  }
}
```

---

## **4. 🔧 AFTER SUCCESS - Use Environment:**

**A. Import Environment:**

- Import: `Dashboard_IOT_Environment.json`
- Select environment dari dropdown

**B. Change URL:**

- Ganti `http://127.0.0.1:8000/api/sensor`
- Jadi: `{{baseUrl}}/api/sensor`

---

## **5. 🚨 COMMON MISTAKES:**

❌ **URL**: `https://127.0.0.1:8000` (wrong - no https)
✅ **URL**: `http://127.0.0.1:8000`

❌ **Body**: Text format  
✅ **Body**: JSON format

❌ **Headers**: Missing Content-Type
✅ **Headers**: Content-Type: application/json

❌ **Method**: GET
✅ **Method**: POST

---

**💡 API 100% WORKING - Issue di Postman configuration!**

**📞 Jika masih error, coba:**

1. Restart Postman
2. Create fresh request (jangan import dulu)
3. Test manual setup diatas
4. Setelah berhasil, baru pakai Collection
