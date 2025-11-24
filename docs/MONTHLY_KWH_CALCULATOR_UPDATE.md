# Monthly kWh Calculator Update

## Overview

Updated the electricity cost estimation system to use actual monthly database data instead of real-time monitoring snapshots.

## Changes Made

### 1. Backend API Implementation

#### New Route Added

**File:** `routes/api.php`

- Added: `Route::get('/api/pln/monthly-kwh-data', [ApiElectricityDataController::class, 'getMonthlyKwhData'])`

#### New Controller Method

**File:** `app/Http/Controllers/Api/ElectricityDataController.php`

- Method: `getMonthlyKwhData()`
- Description: Retrieves current month's total kWh consumption from database

**Calculation Logic:**

```php
1. Query all records from 'listriks' table for current month
2. Calculate: SUM(daya) / data_points = average power in Watts
3. Convert to kW: avg_power_watts / 1000
4. Calculate hours elapsed: start_of_month to now
5. Calculate kWh: avg_power_kw * hours_elapsed
```

**Response Format:**

```json
{
  "success": true,
  "monthly_kwh": 1234.56,
  "avg_power_watts": 2500.0,
  "data_points": 8640,
  "hours_elapsed": 360,
  "period": {
    "start": "2025-01-01",
    "current": "2025-01-15",
    "month": "January 2025"
  },
  "source": "database_current_month"
}
```

### 2. Frontend Integration

#### Updated JavaScript

**File:** `public/assets/js/kwh-calc.js`

- Function: `getDataFromMonitoring()`
- Changed API endpoint from `/api/pln/latest-kwh-data` to `/api/pln/monthly-kwh-data`
- Updated response parsing from `data.kwh` to `data.monthly_kwh`

**Data Retrieval Flow:**

```javascript
1. Try fetch from /api/pln/monthly-kwh-data (monthly database total)
2. Fallback to extractKwhFromDashboard() (DOM elements)
3. Fallback to window.realTimeElectricityData.dailyKwh (real-time data)
```

### 3. Database Schema

**Table:** `listriks`
**Key Fields Used:**

- `daya` (float) - Power consumption in Watts
- `created_at` (timestamp) - Record timestamp

## Benefits

1. **Accurate Monthly Calculation**: Uses actual accumulated data instead of extrapolated estimates
2. **Current Month Only**: Filters data to current calendar month only
3. **Fallback System**: Gracefully falls back to real-time data if database unavailable
4. **Performance**: Single aggregated query instead of multiple real-time calls

## Usage

### Automatic Calculation

The calculator automatically fetches monthly data when the "Hitung Biaya" button is clicked in the tariff modal.

### API Testing

Test the endpoint directly:

```bash
curl http://localhost/api/pln/monthly-kwh-data
```

## Tariff Integration

The monthly kWh value is used with Krakatau Chandra Energi tariffs:

**B-1/TR (900-5500 VA)**

- Rate: Rp 1,913.89/kWh
- Rekening Minimum: Rp 40 per kVA
- Basic Fee: Rp 0

**B-2/TR (6600 VA - 200 kVA)**

- Rate: Rp 1,913.89/kWh
- Basic Fee: Rp 33,900

**B-3/TM (> 200 kVA)**

- Rate: Rp 1,745.43/kWh
- Basic Fee: Rp 37,500
- Includes Load Factor calculation based on utilization

## Load Factor Calculation

For B-3/TM tariff:

```javascript
Utilization = ((kWh/720)/0.85) / dayaKontrakKVA * 100

Load Factor Table:
- 0-10%:   1.0
- 10-40%:  0.9
- 40-60%:  0.8
- 60-80%:  0.7
- 80-100%: 0.6
```

## Troubleshooting

### No Data Returned

**Check:**

1. Database contains records in `listriks` table for current month
2. `daya` field has valid values > 0
3. Laravel application running and API routes accessible

**Query to verify data:**

```sql
SELECT COUNT(*), AVG(daya), MIN(created_at), MAX(created_at)
FROM listriks
WHERE MONTH(created_at) = MONTH(NOW())
AND YEAR(created_at) = YEAR(NOW());
```

### Incorrect Calculations

**Verify:**

1. `daya` values are in Watts (not kW)
2. Data collection interval is consistent
3. No duplicate or null records skewing averages

## Future Improvements

1. **Caching**: Cache monthly totals to reduce database queries
2. **Hourly Breakdown**: Add endpoint for hourly consumption patterns
3. **Comparison**: Add year-over-year or month-over-month comparisons
4. **Alerts**: Trigger alerts when consumption exceeds thresholds
5. **Energy Tracking**: Store cumulative energy (kWh) directly from PZEM sensor

---

**Date Updated:** January 2025  
**Version:** 2.0  
**Author:** Dashboard IOT Development Team
