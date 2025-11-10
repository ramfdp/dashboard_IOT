# Support - Generator Files

This folder contains all data generator files for the IoT Dashboard system.

## 📁 Files in This Folder

### 1. `support-pzem.js`

**Purpose:** Main PZEM data generator (ACTIVE)

- Generates realistic power consumption data
- Syncs to Firebase Realtime Database
- Syncs to Laravel MySQL Database
- Handles day/night mode simulation
- Contains `AutoPZEMGenerator` class

**Status:** ✅ ACTIVE - Used globally across all pages

**Features:**

- Real-time data generation (every 10 seconds to Firebase, every 30 seconds to Database)
- Realistic office building power consumption patterns
- Night mode simulation (22:00 - 06:00 WIB) with -70% power reduction
- Firebase listener for real-time UI updates
- Chart data generation for dashboard
- Smart page detection (only runs generator on dashboard)

**Loaded in:** `resources/views/includes/page-js.blade.php` (Global)

---

### 2. `support-website.js`

**Purpose:** Legacy power generator (INACTIVE)

- Old implementation of power generation
- Replaced by `support-pzem.js`

**Status:** ⚠️ DEPRECATED - Kept for reference only

**Note:** This file is no longer loaded in any blade templates. Kept in `support` folder for historical reference and potential feature extraction.

---

## 🔧 Usage

### Loading Generator Globally

The main generator (`support-pzem.js`) is loaded in the global layout:

```html
<!-- resources/views/includes/page-js.blade.php -->
<script src="/assets/js/support/support-pzem.js"></script>
```

### Page Detection Logic

The generator automatically detects which page is active:

```javascript
const isDashboardPage = document.getElementById("pzem-voltage") !== null;

if (isDashboardPage) {
  // Start data generation
  generator.start();
} else {
  // Maintain connection only (no generation)
  // Firebase listener remains active
}
```

### Manual Control

You can control the generator from browser console:

```javascript
// Start generator
window.startAutoPZEM();

// Stop generator
window.stopAutoPZEM();

// Check status
window.autoPZEMStatus();

// Trigger night mode manually
window.triggerNightMode();

// Disable night mode
window.disableNightMode();

// Enable night mode
window.enableNightMode();

// Check night mode status
window.nightModeStatus();
```

---

## 📊 Data Flow

```
AutoPZEMGenerator
    ↓
1. Generate realistic data (every 10s)
    ↓
2. Send to Firebase (/sensor node)
    ↓
3. Firebase listener updates UI (real-time)
    ↓
4. Send to Database (every 30s via API)
    ↓
5. Laravel stores in MySQL (listrik table)
```

---

## 🎯 Generator Behavior

| Page            | Generator Status | Firebase Listener | Database Sync |
| --------------- | ---------------- | ----------------- | ------------- |
| Dashboard       | ✅ Running       | ✅ Active         | ✅ Active     |
| Management User | ⚠️ Idle          | ✅ Active         | ❌ No sync    |
| History Listrik | ⚠️ Idle          | ✅ Active         | ❌ No sync    |
| CCTV            | ⚠️ Idle          | ✅ Active         | ❌ No sync    |
| Login Page      | ❌ Not loaded    | ❌ Inactive       | ❌ No sync    |

---

## 🔐 Security Notes

**Important:** All generation-related console logs are commented out to maintain stealth mode. Data should appear as if coming from real sensors.

**Hidden Logs:**

- ❌ Generation start/stop logs
- ❌ Data calculation logs
- ❌ Firebase sync logs
- ❌ Database sync logs

**Visible Logs:**

- ✅ Error logs (console.error) for debugging
- ✅ Manual debug functions when called

---

## 🚀 Performance

**Optimization Features:**

- Smart page detection (no generation on non-dashboard pages)
- Debounced database writes (every 30s instead of 10s)
- Single database write per sync (removed duplicate writes)
- Persistent Firebase connection across page navigation
- 5-second timeout protection on database requests

---

## 📝 Maintenance

### Adding New Generator Features:

1. Edit `auto-pzem-values.js`
2. Test on dashboard page
3. Verify Firebase sync
4. Verify database sync
5. Test page navigation (ensure connection persists)

### Deprecating Old Features:

1. Move deprecated code to backup folder
2. Update this README
3. Remove script tags from blade templates
4. Test all pages to ensure no errors

---

**Last Updated:** November 10, 2025  
**Maintained By:** Development Team  
**Status:** Production Ready ✅
