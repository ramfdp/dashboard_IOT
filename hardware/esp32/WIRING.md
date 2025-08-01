# ESP32 Wiring Diagram

## Pin Connections

### ESP32 DevKit V1 Pinout

```
                     ESP32 DevKit V1
                    ┌─────────────────┐
                    │                 │
               3V3  │ 1            30 │ VIN (5V)
               GND  │ 2            29 │ GND
                TX  │ 3            28 │ GPIO 13
                RX  │ 4            27 │ GPIO 12
            GPIO 5  │ 5            26 │ GPIO 14
            GPIO 18 │ 6  [ESP32]   25 │ GPIO 27  --> RELAY 2
            GPIO 19 │ 7            24 │ GPIO 26  --> RELAY 1
            GPIO 21 │ 8            23 │ GPIO 25  --> BUZZER (Optional)
                    │ 9            22 │ GPIO 33
            GPIO 22 │ 10           21 │ GPIO 32
                TX2 │ 11           20 │ GPIO 35
                RX2 │ 12           19 │ GPIO 34
            GPIO 17 │ 13           18 │ VN
            GPIO 16 │ 14           17 │ GPIO 23
                    │ 15           16 │ GPIO 22  --> PZEM 3 TX
                    └─────────────────┘
```

### Relay Module Connections

#### Relay 1 (Lampu ITMS 1)

- **VCC** → ESP32 5V (VIN) or external 5V supply
- **GND** → ESP32 GND
- **IN1** → ESP32 GPIO 26
- **COM** → AC Hot wire input
- **NO** → AC Hot wire to Load 1 (Lampu ITMS 1)

#### Relay 2 (Lampu ITMS 2)

- **VCC** → ESP32 5V (VIN) or external 5V supply
- **GND** → ESP32 GND
- **IN2** → ESP32 GPIO 27
- **COM** → AC Hot wire input
- **NO** → AC Hot wire to Load 2 (Lampu ITMS 2)

### PZEM-004T v3.0 Sensor Connections

#### PZEM Sensor 1

- **VCC** → ESP32 5V (VIN)
- **GND** → ESP32 GND
- **TX** → ESP32 GPIO 16 (RX1)
- **RX** → ESP32 GPIO 17 (TX1)

#### PZEM Sensor 2

- **VCC** → ESP32 5V (VIN)
- **GND** → ESP32 GND
- **TX** → ESP32 GPIO 18 (RX2)
- **RX** → ESP32 GPIO 19 (TX2)

#### PZEM Sensor 3

- **VCC** → ESP32 5V (VIN)
- **GND** → ESP32 GND
- **TX** → ESP32 GPIO 21 (RX3)
- **RX** → ESP32 GPIO 22 (TX3)

### Power Supply Connections

#### AC Power Monitoring (PZEM Sensors)

Each PZEM sensor monitors one AC line:

- **L (Live)** → Pass through PZEM sensor
- **N (Neutral)** → Direct connection (not through PZEM)
- **GND** → Earth/Ground connection

#### Safety Connections

- Use proper electrical enclosure
- Install circuit breakers/fuses
- Ensure proper grounding
- Follow local electrical codes

### Optional Components

#### Status LED (Built-in)

- **GPIO 2** → Built-in LED (automatically connected)

#### External Buzzer (Optional)

- **Positive** → ESP32 GPIO 25
- **Negative** → ESP32 GND

## Schematic Diagram

```
     ┌─────────────┐
     │   ESP32     │
     │             │
  ┌──┤ GPIO 26     │
  │  │             │
  │  │ GPIO 27     ├──┐
  │  │             │  │
  │  │ GPIO 16     ├──┼──┐
  │  │             │  │  │
  │  │ GPIO 17     ├──┼──┼──┐
  │  │             │  │  │  │
  │  │ GPIO 18     ├──┼──┼──┼──┐
  │  │             │  │  │  │  │
  │  │ GPIO 19     ├──┼──┼──┼──┼──┐
  │  │             │  │  │  │  │  │
  │  │ GPIO 21     ├──┼──┼──┼──┼──┼──┐
  │  │             │  │  │  │  │  │  │
  │  │ GPIO 22     ├──┼──┼──┼──┼──┼──┼──┐
  │  │             │  │  │  │  │  │  │  │
  │  │ VIN (5V)    ├──┼──┼──┼──┼──┼──┼──┼──┐
  │  │             │  │  │  │  │  │  │  │  │
  │  │ GND         ├──┼──┼──┼──┼──┼──┼──┼──┼─ Common GND
  │  └─────────────┘  │  │  │  │  │  │  │  │
  │                   │  │  │  │  │  │  │  │
  │  ┌─────────────┐  │  │  │  │  │  │  │  │
  └──┤  RELAY 1    │  │  │  │  │  │  │  │  │
     │             │  │  │  │  │  │  │  │  │
  ┌──┤  RELAY 2    ├──┘  │  │  │  │  │  │  │
  │  └─────────────┘     │  │  │  │  │  │  │
  │                      │  │  │  │  │  │  │
  │  ┌─────────────┐     │  │  │  │  │  │  │
  │  │  PZEM 1     │     │  │  │  │  │  │  │
  │  │    RX   ────├─────┘  │  │  │  │  │  │
  │  │    TX   ────├────────┘  │  │  │  │  │
  │  │    VCC  ────├───────────┼──┼──┼──┼──┘
  │  │    GND  ────├───────────┼──┼──┼──┼──── GND
  │  └─────────────┘           │  │  │  │
  │                            │  │  │  │
  │  ┌─────────────┐           │  │  │  │
  │  │  PZEM 2     │           │  │  │  │
  │  │    RX   ────├───────────┘  │  │  │
  │  │    TX   ────├──────────────┘  │  │
  │  │    VCC  ────├─────────────────┼──┘
  │  │    GND  ────├─────────────────┼──── GND
  │  └─────────────┘                 │
  │                                  │
  │  ┌─────────────┐                 │
  │  │  PZEM 3     │                 │
  │  │    RX   ────├─────────────────┘
  │  │    TX   ────├──────────────────
  │  │    VCC  ────├──────────────────
  │  │    GND  ────├──────────────────── GND
  │  └─────────────┘
  │
  └── To AC loads (Lampu ITMS 1 & 2)
```

## Important Notes

### Safety Warnings

⚠️ **HIGH VOLTAGE** - AC mains voltage is dangerous and potentially lethal
⚠️ **Proper isolation** required between low voltage (ESP32) and high voltage (AC)
⚠️ **Professional installation** recommended for AC connections
⚠️ **Circuit protection** (fuses/breakers) must be installed

### Installation Tips

1. **Test with DC first** - Verify relay operation with DC loads before AC
2. **Use optocoupler relays** - Provides electrical isolation
3. **Proper enclosure** - Use electrical junction boxes
4. **Cable management** - Keep AC and DC wires separated
5. **Grounding** - Ensure proper earth/ground connections

### Troubleshooting

- **Relays not switching**: Check 5V power supply capacity
- **PZEM not reading**: Verify TX/RX connections and baud rate
- **WiFi issues**: Check antenna placement and signal strength
- **Firebase errors**: Verify credentials and internet connection
