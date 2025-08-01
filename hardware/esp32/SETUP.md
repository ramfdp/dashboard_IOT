# ESP32 Setup Guide

## Quick Start Guide

### 1. Hardware Preparation

#### Required Components

- ESP32 DevKit V1 or compatible board
- 2x Relay modules (5V, optocoupler isolated)
- 3x PZEM-004T v3.0 power sensors
- External 5V/2A power supply
- Breadboard and jumper wires
- Electrical enclosure (for safety)

#### Wiring

Follow the detailed wiring diagram in `WIRING.md`

### 2. Software Setup

#### Arduino IDE Setup

1. **Install ESP32 Board Package**

   - File → Preferences
   - Add to Additional Board Manager URLs:
     ```
     https://dl.espressif.com/dl/package_esp32_index.json
     ```
   - Tools → Board → Boards Manager → Search "ESP32" → Install

2. **Install Required Libraries**

   - Tools → Manage Libraries
   - Install each library listed in `README.md`

3. **Board Configuration**
   - Tools → Board → ESP32 Arduino → ESP32 Dev Module
   - Tools → Port → Select your ESP32 port

### 3. Configuration

#### Update WiFi Settings

Edit `esp32_iot_controller.ino`:

```cpp
const char* WIFI_SSID = "Your_WiFi_Name";
const char* WIFI_PASSWORD = "Your_WiFi_Password";
```

#### Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project or select existing one
3. Go to Project Settings → Service Accounts
4. Generate new private key
5. Update in `config.h`:
   ```cpp
   #define FIREBASE_HOST "your-project-id-default-rtdb.firebaseio.com"
   #define FIREBASE_AUTH "your-database-secret"
   ```

#### Set Firebase Database Rules

In Firebase Console → Realtime Database → Rules:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "sensors": {
      ".read": true,
      ".write": true
    },
    "devices": {
      ".read": true,
      ".write": true
    },
    "commands": {
      ".read": true,
      ".write": true
    },
    "schedules": {
      ".read": true,
      ".write": false
    }
  }
}
```

### 4. Upload and Test

#### First Upload

1. Connect ESP32 via USB
2. Open `esp32_iot_controller.ino`
3. Verify/Compile (Ctrl+R)
4. Upload (Ctrl+U)
5. Open Serial Monitor (Ctrl+Shift+M) at 115200 baud

#### Expected Serial Output

```
=== ESP32 IoT Controller Starting ===
✓ Pins initialized
✓ PZEM sensors initialized
Connecting to WiFi: Your_WiFi_Name
...........
✓ WiFi connected!
IP address: 192.168.1.100
✓ Firebase connected
=== ESP32 IoT Controller Ready ===
```

### 5. Integration with Laravel Dashboard

The ESP32 automatically integrates with your Laravel dashboard through Firebase:

#### Data Flow

```
ESP32 Sensors → Firebase → Laravel Dashboard
Laravel Commands → Firebase → ESP32 Relays
```

#### Automatic Features

- **Real-time monitoring**: Power data updates every 5 seconds
- **Device control**: Manual relay control from dashboard
- **Auto scheduling**: Automatic light control based on Laravel schedules
- **Mode switching**: Auto/Manual mode from dashboard

### 6. Testing Checklist

#### Hardware Tests

- [ ] Status LED blinks during WiFi connection
- [ ] Status LED stays on when connected
- [ ] Relays click when tested manually
- [ ] PZEM sensors show voltage readings

#### Software Tests

- [ ] ESP32 connects to WiFi
- [ ] Firebase connection successful
- [ ] Sensor data appears in Firebase
- [ ] Manual relay control from dashboard works
- [ ] Auto mode scheduling works
- [ ] Mode switching works

#### Dashboard Integration

- [ ] Real-time power data visible
- [ ] Device control buttons work
- [ ] Schedule creation works
- [ ] Mode switching buttons work

### 7. Troubleshooting

#### Common Issues

**WiFi Connection Failed**

- Check SSID and password
- Verify 2.4GHz network (ESP32 doesn't support 5GHz)
- Check signal strength

**Firebase Connection Failed**

- Verify Firebase credentials
- Check internet connectivity
- Ensure Firebase rules allow access

**PZEM Sensors Not Reading**

- Check TX/RX pin connections
- Verify 5V power supply
- Ensure proper grounding
- Check sensor addressing (should be unique)

**Relays Not Switching**

- Check 5V power supply capacity (min 2A)
- Verify relay module compatibility
- Test with multimeter

#### Debug Mode

Enable detailed debugging in `config.h`:

```cpp
#define ENABLE_SERIAL_DEBUG true
#define ENABLE_SENSOR_DEBUG true
#define ENABLE_FIREBASE_DEBUG true
```

### 8. Production Deployment

#### Safety Considerations

- Use proper electrical enclosure
- Install appropriate circuit breakers
- Follow local electrical codes
- Test thoroughly before final installation

#### Performance Optimization

- Use external 5V supply (not USB power)
- Place ESP32 close to WiFi router
- Use quality jumper wires for connections
- Consider PCB design for permanent installation

#### Monitoring

- Check serial output regularly
- Monitor Firebase data flow
- Set up alerts for connection failures
- Plan backup power for critical applications

## Support

For technical support:

1. Check the troubleshooting section
2. Review Firebase connection logs
3. Verify hardware connections
4. Create issue in project repository with:
   - Serial monitor output
   - Hardware configuration
   - Error messages
   - Steps to reproduce
