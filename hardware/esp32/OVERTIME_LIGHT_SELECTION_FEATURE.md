# Overtime Light Selection Feature 💡

## Overview

Added a new light selection dropdown to the overtime timer feature, allowing users to choose which specific lights (relays) to control during overtime work.

## New Features

### 🎛️ Light Selection Dropdown

Users can now select which lights to turn ON during overtime:

- **ITMS 1 Light** - Controls only Relay 1
- **ITMS 2 Light** - Controls only Relay 2
- **All Lights** - Controls both Relay 1 and 2 (default)

### 🗃️ Database Changes

- Added `light_selection` column to `overtimes` table
- Migration: `2025_08_01_150530_add_light_selection_to_overtime_table.php`
- Default value: `'all'` for backward compatibility

### 📊 UI Updates

- New dropdown field in overtime form (required)
- Added "Lampu" column in overtime table showing selected lights
- Color-coded badges:
  - 🔵 **ITMS 1**: Blue badge
  - 🟡 **ITMS 2**: Yellow badge
  - 🟢 **Semua**: Green badge

## How It Works

### 🔧 Smart Relay Control Logic

The system now intelligently controls relays based on light selection:

```javascript
// Multiple overtimes can have different light selections
// System combines all active selections:

Active Overtimes:
- Overtime #1: light_selection = 'itms1' → Relay1 ON
- Overtime #2: light_selection = 'itms2' → Relay2 ON
Result: Both Relay1 AND Relay2 will be ON

Active Overtimes:
- Overtime #1: light_selection = 'all' → Both ON
- Overtime #2: light_selection = 'itms1' → Relay1 ON
Result: Both Relay1 AND Relay2 will be ON (because 'all' includes both)
```

### 📝 Form Validation

- Light selection is now **required** field
- Validates against: `'itms1'`, `'itms2'`, `'all'`
- Default selection: Empty (forces user to choose)

### 🔄 Backend Integration

- **Livewire Component**: Added `$light_selection` property
- **Model**: Added to `fillable` array in Overtime model
- **Validation**: Added rules and messages
- **Edit Mode**: Properly loads and saves light selection

### 🚀 JavaScript Updates

- **Form Data**: Includes `light_selection` in form submission
- **Validation**: Checks that light selection is chosen
- **Table Update**: Shows light selection badges
- **Relay Control**: Smart logic to combine multiple active overtimes

## Code Changes Summary

### 1. Database Migration

```php
Schema::table('overtimes', function (Blueprint $table) {
    $table->string('light_selection')->default('all')->after('notes');
});
```

### 2. View Form Addition

```html
<select wire:model="light_selection" required>
  <option value="">-- Pilih Lampu --</option>
  <option value="itms1">ITMS 1 Light (Relay 1)</option>
  <option value="itms2">ITMS 2 Light (Relay 2)</option>
  <option value="all">Semua Lampu (ITMS 1 & 2)</option>
</select>
```

### 3. Smart Relay Control

```javascript
// Determine which relays should be ON based on light selection
let relay1ShouldBeOn = false;
let relay2ShouldBeOn = false;

activeOvertimes.forEach((overtime) => {
  const lightSelection = overtime.light_selection || "all";
  if (lightSelection === "itms1" || lightSelection === "all") {
    relay1ShouldBeOn = true;
  }
  if (lightSelection === "itms2" || lightSelection === "all") {
    relay2ShouldBeOn = true;
  }
});
```

## Usage Instructions

### 👤 For Users:

1. **Create Overtime**: Fill form and select desired lights from dropdown
2. **View History**: See which lights were selected in the table
3. **Edit Overtime**: Light selection can be modified when editing

### 🔧 For Developers:

1. **Run Migration**: `php artisan migrate` to add the new column
2. **Default Behavior**: Existing overtime entries default to 'all' lights
3. **ESP32 Compatibility**: Works with simplified ESP32 code that reads Firebase relay values

## Benefits

### ✅ **Energy Efficiency**

- Turn on only needed lights during overtime
- Reduce power consumption when only specific areas are used

### ✅ **Flexibility**

- Different departments can control different lights
- Multiple simultaneous overtimes with different light requirements

### ✅ **User-Friendly**

- Clear dropdown options with descriptive labels
- Visual feedback in table showing selected lights

### ✅ **Backward Compatible**

- Existing overtime entries work normally (default to 'all')
- No breaking changes to current functionality

## Testing

### 🧪 Test Scenarios:

1. **Single ITMS 1**: Create overtime with ITMS 1 → Only Relay1 should turn ON
2. **Single ITMS 2**: Create overtime with ITMS 2 → Only Relay2 should turn ON
3. **All Lights**: Create overtime with All → Both relays should turn ON
4. **Multiple Overtimes**: Create multiple with different selections → Combined relay control
5. **Edit Function**: Edit existing overtime → Light selection updates correctly

### 📊 Expected Results:

- Dropdown is required and validates properly
- Table shows correct light badges
- Firebase receives correct relay values
- ESP32 responds to specific relay commands
- Multiple active overtimes combine selections correctly

## Future Enhancements

### 🔮 Potential Additions:

- **More Relay Options**: Add ITMS 3, 4, etc. when available
- **Custom Light Names**: Allow users to set custom names for each relay
- **Schedule Integration**: Different light selections for different time periods
- **Department Defaults**: Set default light selections per department
- **Power Monitoring**: Show energy usage per selected light combination
