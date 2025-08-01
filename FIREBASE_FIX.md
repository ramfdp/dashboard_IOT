# Firebase Configuration Fix

## Problem Analysis

You're getting these errors:

- `PERMISSION_DENIED: Permission denied`
- `401 (Unauthorized)`

This happens because:

1. Firebase Realtime Database rules are too restrictive
2. Web app is not properly authenticated with Firebase
3. ESP32 might not be using the correct authentication method

## Solution Steps

### 1. Update Firebase Database Rules

Go to [Firebase Console](https://console.firebase.google.com) → Your Project → Realtime Database → Rules

Replace your current rules with these **development-friendly** rules:

```json
{
  "rules": {
    ".read": true,
    ".write": true,
    "sensor": {
      ".read": true,
      ".write": true,
      ".indexOn": "timestamp"
    },
    "relayControl": {
      ".read": true,
      ".write": true
    },
    "devices": {
      ".read": true,
      ".write": true
    },
    "schedules": {
      ".read": true,
      ".write": true
    },
    "history": {
      ".read": true,
      ".write": true,
      ".indexOn": "timestamp"
    },
    "commands": {
      ".read": true,
      ".write": true
    }
  }
}
```

**⚠️ Note**: These are development rules. For production, implement proper authentication.

### 2. Production-Ready Rules (for later)

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "sensor": {
      ".read": true,
      ".write": "auth != null || auth.uid == 'esp32-device'",
      ".indexOn": "timestamp"
    },
    "relayControl": {
      ".read": true,
      ".write": "auth != null || auth.uid == 'esp32-device'"
    },
    "devices": {
      ".read": true,
      ".write": "auth != null || auth.uid == 'esp32-device'"
    },
    "schedules": {
      ".read": true,
      ".write": "auth != null"
    },
    "history": {
      ".read": "auth != null",
      ".write": "auth != null || auth.uid == 'esp32-device'",
      ".indexOn": "timestamp"
    },
    "commands": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

### 3. Update Your Firebase URL

Your Firebase project URL should be:

```
https://smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app/
```

### 4. Check Firebase Configuration in Laravel

Update your `.env` file:

```env
FIREBASE_PROJECT_ID=smart-building-3e5c1
FIREBASE_DATABASE_URL=https://smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app/
```

### 5. Update ESP32 Configuration

In your `config.h`, update:

```cpp
#define FIREBASE_HOST "smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app"
```

## Quick Test

After updating the rules, test with curl:

```bash
# Test read
curl "https://smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app/sensor.json"

# Test write
curl -X PUT "https://smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app/test.json" -d '{"value": "test"}'
```

If these work, your web app should work too.

## Security Note

The development rules above allow anyone to read/write to your database. This is fine for development but **must be changed for production**.

For production:

1. Implement Firebase Authentication
2. Use the production rules provided above
3. Configure ESP32 with service account authentication
