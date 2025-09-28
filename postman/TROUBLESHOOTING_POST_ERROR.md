# 🔧 **POSTMAN TROUBLESHOOTING - API Sensor POST Error**

## **❌ Error yang Ditemui:**

- **Error Code**: 405 Method Not Allowed
- **Endpoint**: `POST {{baseUrl}}/api/sensor`
- **Symptom**: POST request ditolak dengan method not allowed

---

## **✅ SOLUTION - FIXES untuk Postman:**

### **1. Pastikan URL Benar ✅**

```
URL: http://127.0.0.1:8000/api/sensor
Method: POST
Content-Type: application/json
```

### **2. Headers yang Diperlukan:**

```
Content-Type: application/json
Accept: application/json
```

### **3. Body JSON yang Benar:**

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

---

## **🧪 VERIFICATION - API Sudah Tested Working:**

### **✅ Command Line Test (SUCCESS):**

```bash
# PowerShell Test - WORKING ✅
$body = '{"lokasi": "PT Krakatau Sarana Property", "tegangan": 220.5, "arus": 5.2, "daya": 1140, "energi": 15.5, "frekuensi": 50.0, "power_factor": 0.85}'
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/sensor" -Method POST -ContentType "application/json" -Body $body

# RESULT ✅:
success: True
message: Data listrik berhasil disimpan
```

### **✅ Route Verification:**

```bash
php artisan route:list --path=api/sensor

# RESULT ✅:
POST    api/sensor .... SensorController@store  ✅
GET     api/sensor/latest ... SensorController@latest ✅
```

---

## **🔧 POSTMAN CONFIGURATION STEPS:**

### **Step 1: Environment Setup**

1. **Create/Import Environment**: `Dashboard_IOT_Environment.json`
2. **Set Variables**:
   - `baseUrl`: `http://127.0.0.1:8000`
   - `location`: `PT Krakatau Sarana Property`

### **Step 2: Request Configuration**

1. **Method**: POST
2. **URL**: `{{baseUrl}}/api/sensor`
3. **Headers Tab**:

   ```
   Content-Type: application/json
   Accept: application/json
   ```

4. **Body Tab**:
   - Select **raw**
   - Select **JSON** from dropdown
   - Paste body JSON

### **Step 3: Troubleshooting Checklist**

#### **A. Server Running?**

```bash
php artisan serve
# Should show: Server running on [http://127.0.0.1:8000]
```

#### **B. URL Correct?**

- ✅ `http://127.0.0.1:8000/api/sensor` (NOT https)
- ✅ No trailing slash
- ✅ Environment variable `{{baseUrl}}` set correctly

#### **C. Headers Set?**

- ✅ Content-Type: application/json
- ✅ Accept: application/json

#### **D. Body Format?**

- ✅ Body type: raw
- ✅ Body format: JSON
- ✅ Valid JSON syntax

---

## **🚨 COMMON POSTMAN ISSUES & FIXES:**

### **Issue 1: SSL Certificate Error**

**Fix**: Use `http://` not `https://` for local development

### **Issue 2: Environment Variable Not Working**

**Fix**:

1. Select environment from top-right dropdown
2. Check variable is set: `baseUrl = http://127.0.0.1:8000`

### **Issue 3: Headers Not Applied**

**Fix**:

1. Go to Headers tab
2. Manually add headers:
   - `Content-Type: application/json`
   - `Accept: application/json`

### **Issue 4: Body Not Sent**

**Fix**:

1. Body tab → raw
2. Select JSON from dropdown (not Text)
3. Valid JSON format

### **Issue 5: Wrong Method**

**Fix**: Ensure method is **POST** not GET

---

## **✅ WORKING POSTMAN REQUEST EXAMPLE:**

### **Request Setup:**

```
Method: POST
URL: {{baseUrl}}/api/sensor
Headers:
  Content-Type: application/json
  Accept: application/json

Body (raw JSON):
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

### **Expected Response:**

```json
{
  "success": true,
  "message": "Data listrik berhasil disimpan",
  "data": {
    "id": 18173,
    "lokasi": "PT Krakatau Sarana Property",
    "tegangan": 220.5,
    "arus": 5.2,
    "daya": 1140,
    "energi": 15.5,
    "frekuensi": 50.0,
    "power_factor": 0.85,
    "status": "active",
    "created_at": "2025-09-28T..."
  }
}
```

---

## **🔍 DEBUG STEPS:**

1. **Test di Command Line** (sudah berhasil ✅)
2. **Import Collection & Environment** ke Postman fresh
3. **Manual setup** request di Postman baru
4. **Check Console** di Postman untuk error details
5. **Enable verbose logging** di Postman

**💡 API endpoint 100% working - masalah di konfigurasi Postman!**
