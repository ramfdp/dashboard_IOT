# 🚀 **Dashboard IoT - API Implementation Guide**

## **📋 Apa yang Sudah Ditambahkan**

### **✅ Files yang Dibuat/Dimodifikasi:**

1. **`app/Http/Controllers/Api/UserController.php`** - Controller baru untuk User Management API
2. **`routes/api.php`** - Menambahkan routes untuk User Management dan Sensor API
3. **`docs/API_POSTMAN_DOCUMENTATION.md`** - Dokumentasi lengkap API
4. **`docs/Dashboard_IoT_API_Collection.postman_collection.json`** - Postman Collection file

### **📊 API Endpoints yang Tersedia:**

## **User Management API:**

- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `GET /api/users/statistics` - Get user statistics

## **Sensor Management API:**

- `GET /api/sensors` - Get all sensors (100 latest)
- `POST /api/sensor` - Create sensor data
- `GET /api/sensor/latest` - Get latest sensor data
- `GET /api/sensors/summary` - Get sensor usage summary

---

## **🔧 Cara Menggunakan di Postman**

### **Step 1: Import Collection**

1. Buka Postman
2. Click **Import**
3. Pilih file: `docs/Dashboard_IoT_API_Collection.postman_collection.json`
4. Collection "Dashboard IoT API Collection" akan muncul

### **Step 2: Setup Environment**

1. Click ⚙️ **Settings** → **Manage Environments**
2. Click **Add** environment baru
3. Nama: `Dashboard_IoT_Local`
4. Add variables:
   ```
   baseUrl = http://localhost:8000
   user_id = 1
   ```
5. **Save** dan pilih environment ini

### **Step 3: Testing API**

#### **Test User Management:**

1. **Get All Users**: `GET {{baseUrl}}/api/users`
2. **Create User**: `POST {{baseUrl}}/api/users`
   ```json
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "password123",
     "role": "user"
   }
   ```
3. **Update User**: `PUT {{baseUrl}}/api/users/{{user_id}}`

#### **Test Sensor API:**

1. **Get Sensors**: `GET {{baseUrl}}/api/sensors`
2. **Create Sensor Data**: `POST {{baseUrl}}/api/sensor`
   ```json
   {
     "temperature": 28.5,
     "humidity": 65
   }
   ```

---

## **⚠️ Error "Invalid URI" - Solved!**

### **Problem:**

```
Error: Invalid URI "http:///api/users"
```

### **Solution:**

✅ **Pastikan baseUrl sudah diset dengan benar:**

- Bukan: `http:///api/users` ❌
- Tapi: `http://localhost:8000/api/users` ✅

### **Cara Fix:**

1. **Check Environment Variables**:
   - `baseUrl` = `http://localhost:8000` (tanpa trailing slash)
2. **Check URL di Request**:
   - Gunakan: `{{baseUrl}}/api/users`
   - Jangan: `http:///api/users`

---

## **🔍 Testing dari Terminal**

```bash
# Test User API
curl -X GET http://localhost:8000/api/users \
  -H "Accept: application/json"

# Test Create User
curl -X POST http://localhost:8000/api/users \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "user"
  }'

# Test Sensor API
curl -X GET http://localhost:8000/api/sensors \
  -H "Accept: application/json"

# Test Create Sensor
curl -X POST http://localhost:8000/api/sensor \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "temperature": 28.5,
    "humidity": 65
  }'
```

---

## **📁 File Structure Added**

```
dashboard_IOT/
├── app/Http/Controllers/Api/
│   └── UserController.php          # ✅ NEW - User Management API
├── routes/
│   └── api.php                     # ✅ UPDATED - Added User & Sensor routes
└── docs/
    ├── API_POSTMAN_DOCUMENTATION.md # ✅ NEW - Complete API docs
    └── Dashboard_IoT_API_Collection.postman_collection.json # ✅ NEW
```

---

## **🎯 Next Steps**

1. **Test semua endpoints** di Postman menggunakan collection yang sudah dibuat
2. **Customize sesuai kebutuhan** - tambah validasi, middleware, etc.
3. **Add Authentication** jika diperlukan (Laravel Sanctum/Passport)
4. **Deploy ke production** dan update baseUrl

**🎉 API Management untuk User dan Sensor sudah siap digunakan!**

---

## **📞 Troubleshooting**

### **Q: Server tidak bisa diakses**

**A:** Pastikan Laravel server running: `php artisan serve`

### **Q: Route not found**

**A:** Clear cache: `php artisan route:clear && php artisan config:clear`

### **Q: Validation errors**

**A:** Check request body format dan required fields di dokumentasi

### **Q: Database errors**

**A:** Run migration: `php artisan migrate`

**Problem solved! API sudah siap untuk controlling dan user management!** ✅
