# ESP32 Debugging Guide - Relay Control Issues

## 🔍 Problem Analysis

Based on your serial monitor output:

- ✗ **PZEM sensors not reading** ("No valid sensor data available")
- ✗ **Relays not responding** to commands
- ✓ **Auto mode working** (shows schedule check)

## 🛠️ Debugging Steps

### Step 1: Check Basic Connectivity

Add this debug code to your `setup()` function:

```cpp
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("=== ESP32 IoT Controller Starting ===");

  // Test relay pins first
  testRelays();

  // Initialize pins
  setupPins();

  // Test WiFi before anything else
  connectToWiFi();

  // Only proceed if WiFi is connected
  if (WiFi.status() == WL_CONNECTED) {
    setupFirebase();
    setupSensors();
    timeClient.begin();
  }

  Serial.println("=== Setup Complete ===");
}

// Add this function to test relays manually
void testRelays() {
  Serial.println("Testing relays...");

  pinMode(RELAY1_PIN, OUTPUT);
  pinMode(RELAY2_PIN, OUTPUT);

  // Test Relay 1
  Serial.println("Testing Relay 1 (GPIO 26)");
  digitalWrite(RELAY1_PIN, HIGH);
  delay(1000);
  digitalWrite(RELAY1_PIN, LOW);
  delay(1000);

  // Test Relay 2
  Serial.println("Testing Relay 2 (GPIO 27)");
  digitalWrite(RELAY2_PIN, HIGH);
  delay(1000);
  digitalWrite(RELAY2_PIN, LOW);
  delay(1000);

  Serial.println("Relay test complete");
}
```

### Step 2: Fix PZEM Sensor Issues

The PZEM sensors are not reading. This could be:

1. **Wiring issues** - Check connections
2. **Power supply** - PZEM needs 5V
3. **Serial conflicts** - ESP32 serial ports

**Quick PZEM test code:**

```cpp
void testPZEMSensors() {
  Serial.println("=== Testing PZEM Sensors ===");

  // Test PZEM 1
  float voltage1 = pzem1.voltage();
  Serial.printf("PZEM1 Voltage: %.2f V (Valid: %s)\n",
                voltage1, (!isnan(voltage1) && voltage1 > 0) ? "YES" : "NO");

  // Test PZEM 2
  float voltage2 = pzem2.voltage();
  Serial.printf("PZEM2 Voltage: %.2f V (Valid: %s)\n",
                voltage2, (!isnan(voltage2) && voltage2 > 0) ? "YES" : "NO");

  // Test PZEM 3
  float voltage3 = pzem3.voltage();
  Serial.printf("PZEM3 Voltage: %.2f V (Valid: %s)\n",
                voltage3, (!isnan(voltage3) && voltage3 > 0) ? "YES" : "NO");
}
```

### Step 3: Add Manual Relay Control

Add this to your `loop()` for manual testing:

```cpp
void loop() {
  // Check for serial commands
  if (Serial.available()) {
    String command = Serial.readString();
    command.trim();

    if (command == "r1on") {
      digitalWrite(RELAY1_PIN, HIGH);
      Serial.println("Relay 1 ON");
    } else if (command == "r1off") {
      digitalWrite(RELAY1_PIN, LOW);
      Serial.println("Relay 1 OFF");
    } else if (command == "r2on") {
      digitalWrite(RELAY2_PIN, HIGH);
      Serial.println("Relay 2 ON");
    } else if (command == "r2off") {
      digitalWrite(RELAY2_PIN, LOW);
      Serial.println("Relay 2 OFF");
    } else if (command == "test") {
      testRelays();
    } else if (command == "pzem") {
      testPZEMSensors();
    } else if (command == "wifi") {
      Serial.printf("WiFi Status: %s\n", WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected");
      if (WiFi.status() == WL_CONNECTED) {
        Serial.printf("IP: %s\n", WiFi.localIP().toString().c_str());
      }
    } else if (command == "firebase") {
      Serial.printf("Firebase Status: %s\n", Firebase.ready() ? "Connected" : "Disconnected");
    }
  }

  // Your existing loop code...
}
```

## 🔧 Hardware Checklist

### Relay Module Check:

- [ ] **VCC** connected to ESP32 **VIN (5V)** or external 5V
- [ ] **GND** connected to ESP32 **GND**
- [ ] **IN1** connected to ESP32 **GPIO 26**
- [ ] **IN2** connected to ESP32 **GPIO 27**
- [ ] **Relay module LED** should light up when activated

### Power Supply Check:

- [ ] ESP32 powered via **USB** or **external 5V/2A**
- [ ] If using external power, ensure **common ground**
- [ ] Relay modules need **5V, not 3.3V**

### PZEM Sensor Check:

- [ ] **PZEM VCC** → **ESP32 VIN (5V)**
- [ ] **PZEM GND** → **ESP32 GND**
- [ ] **TX/RX pins** connected correctly
- [ ] **AC power** connected to PZEM for readings

## 🧪 Testing Commands

Upload the modified code and test with Serial Monitor:

```
r1on     - Turn Relay 1 ON
r1off    - Turn Relay 1 OFF
r2on     - Turn Relay 2 ON
r2off    - Turn Relay 2 OFF
test     - Test both relays
pzem     - Test PZEM sensors
wifi     - Check WiFi status
firebase - Check Firebase status
```

## ⚡ Quick Fixes

### Issue 1: No Relay Response

```cpp
// Force relay test in setup()
void setup() {
  // ... existing code ...

  // Force relay test
  pinMode(26, OUTPUT);
  pinMode(27, OUTPUT);

  Serial.println("Force testing relays...");
  digitalWrite(26, HIGH);
  delay(2000);
  digitalWrite(26, LOW);
  delay(1000);
  digitalWrite(27, HIGH);
  delay(2000);
  digitalWrite(27, LOW);

  // ... rest of setup ...
}
```

### Issue 2: PZEM Not Reading

```cpp
// Simplified PZEM test
void simplePZEMTest() {
  Serial.println("Simple PZEM test...");

  // Try just voltage reading
  Serial1.print("VOLTAGE\n");
  delay(100);

  if (Serial1.available()) {
    String response = Serial1.readString();
    Serial.println("PZEM1 Response: " + response);
  } else {
    Serial.println("No response from PZEM1");
  }
}
```

## 📊 Expected Output

After fixes, you should see:

```
=== ESP32 IoT Controller Starting ===
Testing relays...
Testing Relay 1 (GPIO 26)
Testing Relay 2 (GPIO 27)
Relay test complete
✓ Pins initialized
Connecting to WiFi: YourWiFiName
✓ WiFi connected!
IP address: 192.168.1.100
✓ Firebase connected
PZEM1 Voltage: 220.50 V (Valid: YES)
=== Setup Complete ===
```

## 🆘 If Still Not Working

1. **Check wiring** with multimeter
2. **Test relay module** with Arduino Uno first
3. **Verify ESP32 pin functions** (some pins are input-only)
4. **Use external 5V power supply** for relays
5. **Try different GPIO pins** if current ones don't work

The most likely issues are **wiring problems** or **insufficient power supply** for the relay modules.
