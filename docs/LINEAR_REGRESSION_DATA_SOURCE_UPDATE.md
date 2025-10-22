# Linear Regression Data Source Update

## Summary

Removed redundant data generation function from `electricity-linear-regression.js` and integrated with existing AutoPZEM generator.

## Changes Made

### 1. Removed Function

- **Function:** `generateRealisticElectricityData()`
- **Reason:** Duplicate functionality with `auto-pzem-values.js`
- **Lines Removed:** ~30 lines of code

### 2. Updated Data Flow

- **Before:**

  1. Try API endpoint `/api/history/filtered`
  2. If fail → Use internal `generateRealisticElectricityData()`

- **After:**
  1. Try API endpoint `/api/history/filtered`
  2. If fail → Use AutoPZEM generator via `getAutoPZEMData()`

### 3. New Integration Method

```javascript
getAutoPZEMData() {
    // Primary: Use AutoPZEM's generateRealisticFallbackData(24)
    // Fallback: Use AutoPZEM's currentData if available
    // Last resort: Return empty array
}
```

### 4. Data Source Priority

1. **Primary:** Real API data from `/api/history/filtered`
2. **Secondary:** AutoPZEM generated realistic data (24 data points)
3. **Tertiary:** AutoPZEM current single data point
4. **Last Resort:** Empty array with error message

## Benefits

✅ **Eliminated Code Duplication** - No more duplicate data generation logic  
✅ **Consistent Data Source** - Uses same generator as main dashboard  
✅ **Better Maintainability** - Single source of truth for generated data  
✅ **Improved Error Handling** - Graceful degradation through multiple fallbacks  
✅ **Smaller File Size** - Reduced from 514 to ~490 lines

## Technical Details

### AutoPZEM Integration

- Uses `window.autoPZEMGenerator.generateRealisticFallbackData(24)`
- Converts AutoPZEM data format to LinearRegression expected format
- Maintains time formatting consistency with `id-ID` locale

### Data Format Mapping

```javascript
// AutoPZEM Format: { data: [power1, power2], labels: ["00:00", "01:00"] }
// LinearRegression Format: { waktu: ISO, daya: number, waktu_formatted: "HH:MM" }
```

## Impact

- **Functionality:** No change in user experience
- **Performance:** Slightly better (less code execution)
- **Maintenance:** Easier to maintain single data generator
- **Reliability:** Better fallback system with multiple data sources

## Date

October 21, 2025
