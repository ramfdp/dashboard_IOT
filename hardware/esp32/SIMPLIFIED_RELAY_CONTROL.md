# ESP32 Simplified Relay Control

## Overview

This version of the ESP32 code has been simplified to ONLY read from Firebase `/relayControl/relay1` and `/relayControl/relay2` values and directly control the physical relays. All complex logic (auto mode, manual mode, scheduling) has been removed.

## How It Works

### Simple Logic Flow:

1. **Read Firebase Values**: Every 2 seconds, read `/relayControl/relay1` and `/relayControl/relay2`
2. **Apply to Hardware**: If Firebase value is 1 → Relay ON, if 0 → Relay OFF
3. **Update Device Status**: Update `/devices/relay1` and `/devices/relay2` to reflect actual hardware state
4. **Send Sensor Data**: Continue reading PZEM sensors and uploading to Firebase

### Key Changes Made:

- ❌ **Removed**: `autoMode` variable and all related logic
- ❌ **Removed**: Manual mode detection (`/relayControl/manualMode`)
- ❌ **Removed**: `handleAutoMode()` function with scheduling logic
- ❌ **Removed**: Complex conditions in relay control
- ❌ **Removed**: Writing back to `/relayControl/relay1` and `/relayControl/relay2`
- ✅ **Kept**: Pure Firebase read → relay control
- ✅ **Kept**: PZEM sensor reading and upload
- ✅ **Kept**: Connection monitoring and heartbeat

## Code Structure

### Main Functions:

- `readRelayStatesFromFirebase()`: Simply reads Firebase values and applies to relays
- `setRelay1(state)` / `setRelay2(state)`: Controls physical relay pins
- `updateDeviceStatusOnChange()`: Updates device status in Firebase (read-only)

### Firebase Paths:

- **Read Only**: `/relayControl/relay1` and `/relayControl/relay2`
- **Write Only**: `/devices/relay1`, `/devices/relay2`, `/sensors/*`

## Benefits

1. **Simplified Logic**: No complex mode switching or conditions
2. **Web App Control**: All logic (manual, overtime, scheduling) handled by Laravel web application
3. **Pure I/O Device**: ESP32 acts as a simple input/output device
4. **Reliable Operation**: Less code = fewer bugs
5. **Easy Debugging**: Simple read → apply logic

## How to Use

1. **Upload Code**: Flash `esp32_iot_controller_fixed.ino` to your ESP32
2. **Web Control**: Use your Laravel dashboard to control relays
3. **Firebase Updates**: Any changes to `/relayControl/relay1` or `/relayControl/relay2` will immediately affect the physical relays

## Serial Monitor Output

```
=== ESP32 IoT Controller Ready ===
Status: Reading Firebase relay control values...
Relay1 changed to: ON
Device status updated: Relay1 = 1
Relay2 changed to: OFF
Device status updated: Relay2 = 0
```

## Web Application Responsibility

The Laravel web application now handles:

- Manual control buttons
- Overtime timers
- Scheduled operations
- Mode switching logic
- User interface logic

## ESP32 Responsibility

The ESP32 now only handles:

- Reading Firebase relay control values
- Controlling physical relay hardware
- Reading PZEM sensor data
- Uploading sensor data to Firebase
- Connection monitoring
