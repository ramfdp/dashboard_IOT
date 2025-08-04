/*
 * ESP32 IoT Controller Configuration
 * Update these values according to your setup
 */

#ifndef CONFIG_H
#define CONFIG_H

// ===== Network Configuration =====
// Update with your WiFi credentials
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// ===== Firebase Configuration =====
// Get these from Firebase Console > Project Settings > Service Accounts
#define FIREBASE_HOST "smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app"
#define FIREBASE_AUTH "your-firebase-database-secret"

// Alternative: Use Firebase config (more secure)
// #define FIREBASE_API_KEY "your-api-key"
// #define FIREBASE_PROJECT_ID "your-project-id"
// #define FIREBASE_USER_EMAIL "your-email@domain.com"
// #define FIREBASE_USER_PASSWORD "your-password"

// ===== Hardware Pin Configuration =====
// Relay Control Pins
#define RELAY1_PIN 26 // GPIO 26 - Relay 1
#define RELAY2_PIN 27 // GPIO 27 - Relay 2
#define RELAY3_PIN 14 // GPIO 14 - Relay 3
#define RELAY4_PIN 12 // GPIO 12 - Relay 4
#define RELAY5_PIN 13 // GPIO 13 - Relay 5
#define RELAY6_PIN 25 // GPIO 25 - Relay 6
#define RELAY7_PIN 33 // GPIO 33 - Relay 7
#define RELAY8_PIN 32 // GPIO 32 - Relay 8

// PZEM-004T Sensor Pins (Software Serial)
#define PZEM1_RX 16 // GPIO 16 - PZEM 1 RX
#define PZEM1_TX 17 // GPIO 17 - PZEM 1 TX
#define PZEM2_RX 18 // GPIO 18 - PZEM 2 RX
#define PZEM2_TX 19 // GPIO 19 - PZEM 2 TX
#define PZEM3_RX 21 // GPIO 21 - PZEM 3 RX
#define PZEM3_TX 22 // GPIO 22 - PZEM 3 TX

// Status Indicators
#define STATUS_LED 2  // GPIO 2 - Built-in LED
#define BUZZER_PIN 25 // GPIO 25 - Optional buzzer for alerts

// ===== Timing Configuration =====
#define SENSOR_READ_INTERVAL 5000       // Read sensors every 5 seconds
#define FIREBASE_UPDATE_INTERVAL 10000  // Update Firebase every 10 seconds
#define CONNECTION_CHECK_INTERVAL 30000 // Check connections every 30 seconds
#define SCHEDULE_CHECK_INTERVAL 60000   // Check schedules every minute

// ===== System Configuration =====
#define SERIAL_BAUD_RATE 115200
#define PZEM_BAUD_RATE 9600
#define WIFI_CONNECTION_TIMEOUT 20000 // 20 seconds timeout for WiFi
#define MAX_WIFI_RETRY_ATTEMPTS 5

// ===== Timezone Configuration =====
#define TIMEZONE_OFFSET 25200 // GMT+7 Indonesia (7 * 3600 seconds)
#define NTP_SERVER "pool.ntp.org"
#define NTP_UPDATE_INTERVAL 60000 // Update time every minute

// ===== Device Information =====
#define DEVICE_ID "esp32_001"
#define DEVICE_NAME "Smart Building Controller"
#define FIRMWARE_VERSION "1.0.0"
#define HARDWARE_VERSION "ESP32-DevKit-V1"

// ===== Debug Configuration =====
#define ENABLE_SERIAL_DEBUG true
#define ENABLE_SENSOR_DEBUG true
#define ENABLE_FIREBASE_DEBUG false

// ===== Safety Configuration =====
#define MAX_POWER_THRESHOLD 5000.0  // Maximum power in watts before alert
#define MIN_VOLTAGE_THRESHOLD 200.0 // Minimum voltage before alert
#define MAX_CURRENT_THRESHOLD 25.0  // Maximum current before alert

// ===== Firebase Paths =====
#define FB_SENSORS_PATH "/sensors/pzem"
#define FB_DEVICES_PATH "/devices"
#define FB_COMMANDS_PATH "/commands"
#define FB_SCHEDULES_PATH "/schedules"
#define FB_HISTORY_PATH "/history"
#define FB_ALERTS_PATH "/alerts"
#define FB_STATUS_PATH "/devices/esp32"

#endif // CONFIG_H
