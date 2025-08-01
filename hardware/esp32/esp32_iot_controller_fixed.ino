// ESP32 IoT Controller - Simplified version that only reads Firebase relayControl values
// Pure Firebase-to-relay control: reads /relayControl/relay1 and /relayControl/relay2
#include <WiFi.h>
#include <FirebaseESP32.h>
#include <PZEM004Tv30.h>
#include <ArduinoJson.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

// ===== WiFi Configuration =====
const char *WIFI_SSID = "WORKSHOP ITMS";
const char *WIFI_PASSWORD = "ITMS2023";

// ===== Firebase Configuration =====
#define FIREBASE_HOST "smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app"
#define FIREBASE_AUTH "eQwnzPeghBPFwHthG2PsDNJyyrs1FeuhnFTEBqkr"

// ===== Pin Definitions =====
#define RELAY1_PIN 26
#define RELAY2_PIN 27
#define PZEM1_RX 16
#define PZEM1_TX 17
#define PZEM2_RX 18
#define PZEM2_TX 19
#define PZEM3_RX 21
#define PZEM3_TX 22
#define STATUS_LED 2

FirebaseData firebaseData;
FirebaseConfig config;
FirebaseAuth auth;
PZEM004Tv30 pzem1(Serial1, PZEM1_RX, PZEM1_TX);
PZEM004Tv30 pzem2(Serial2, PZEM2_RX, PZEM2_TX);
HardwareSerial pzem3Serial(1);
PZEM004Tv30 pzem3(pzem3Serial, PZEM3_RX, PZEM3_TX);
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 25200, 60000);

// Current states
bool relay1State = false, relay2State = false;

// Previous states to track changes
bool prevRelay1State = false, prevRelay2State = false;
String prevTimestamp = "";

unsigned long lastSensorRead = 0, lastFirebaseUpdate = 0, lastConnectionCheck = 0;
unsigned long lastHeartbeat = 0;

const unsigned long SENSOR_INTERVAL = 5000;
const unsigned long FIREBASE_INTERVAL = 2000; // Check more frequently
const unsigned long CONNECTION_CHECK_INTERVAL = 30000;
const unsigned long HEARTBEAT_INTERVAL = 60000; // Heartbeat every minute

struct SensorData
{
    float voltage, current, power, energy, frequency, pf;
} avgSensorData;

// Individual sensor data storage
struct IndividualSensorData
{
    float voltage[3];
    float current[3];
    float power[3];
    float energy[3];
    float frequency[3];
    float pf[3];
    int validReadings;
} sensorData;

void setup()
{
    Serial.begin(115200);
    Serial.println("\n=== ESP32 IoT Controller Starting ===");

    setupPins();
    connectToWiFi();
    setupFirebase();
    setupSensors();
    timeClient.begin();

    // Initialize previous states
    prevRelay1State = relay1State;
    prevRelay2State = relay2State;

    Serial.println("=== ESP32 IoT Controller Ready ===");
    Serial.println("Status: Reading Firebase relay control values...");
}

void loop()
{
    unsigned long now = millis();

    // Check connections
    if (now - lastConnectionCheck >= CONNECTION_CHECK_INTERVAL)
    {
        checkConnections();
        lastConnectionCheck = now;
    }

    // Read sensors
    if (now - lastSensorRead >= SENSOR_INTERVAL)
    {
        readAndAverageSensors();
        lastSensorRead = now;
    }

    // Firebase operations
    if (now - lastFirebaseUpdate >= FIREBASE_INTERVAL)
    {
        readRelayStatesFromFirebase();
        updateDeviceStatusOnChange(); // Only update if changed
        lastFirebaseUpdate = now;
    }

    // Heartbeat
    if (now - lastHeartbeat >= HEARTBEAT_INTERVAL)
    {
        sendHeartbeat();
        lastHeartbeat = now;
    }

    timeClient.update();
    delay(100);
}

void setupPins()
{
    pinMode(RELAY1_PIN, OUTPUT);
    pinMode(RELAY2_PIN, OUTPUT);
    pinMode(STATUS_LED, OUTPUT);
    digitalWrite(RELAY1_PIN, LOW);
    digitalWrite(RELAY2_PIN, LOW);
    Serial.println("✓ Pins configured");
}

void connectToWiFi()
{
    Serial.print("Connecting to WiFi");
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    for (int i = 0; i < 20 && WiFi.status() != WL_CONNECTED; i++)
    {
        delay(1000);
        Serial.print(".");
    }

    if (WiFi.status() == WL_CONNECTED)
    {
        Serial.println();
        Serial.println("✓ WiFi connected: " + WiFi.localIP().toString());
    }
    else
    {
        Serial.println("\n✗ WiFi connection failed!");
    }
}

void setupFirebase()
{
    config.host = FIREBASE_HOST;
    config.signer.tokens.legacy_token = FIREBASE_AUTH;
    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);
    Serial.println("✓ Firebase configured");
}

void setupSensors()
{
    Serial1.begin(9600, SERIAL_8N1, PZEM1_RX, PZEM1_TX);
    Serial2.begin(9600, SERIAL_8N1, PZEM2_RX, PZEM2_TX);
    pzem3Serial.begin(9600, SERIAL_8N1, PZEM3_RX, PZEM3_TX);
    Serial.println("✓ PZEM sensors configured");
}

void readAndAverageSensors()
{
    // Initialize arrays
    for (int i = 0; i < 3; i++)
    {
        sensorData.voltage[i] = 0;
        sensorData.current[i] = 0;
        sensorData.power[i] = 0;
        sensorData.energy[i] = 0;
        sensorData.frequency[i] = 0;
        sensorData.pf[i] = 0;
    }
    sensorData.validReadings = 0;

    // Read PZEM1
    sensorData.voltage[0] = pzem1.voltage();
    if (!isnan(sensorData.voltage[0]))
    {
        sensorData.current[0] = pzem1.current();
        sensorData.power[0] = pzem1.power();
        sensorData.energy[0] = pzem1.energy();
        sensorData.frequency[0] = pzem1.frequency();
        sensorData.pf[0] = pzem1.pf();
        sensorData.validReadings++;
    }

    // Read PZEM2
    sensorData.voltage[1] = pzem2.voltage();
    if (!isnan(sensorData.voltage[1]))
    {
        sensorData.current[1] = pzem2.current();
        sensorData.power[1] = pzem2.power();
        sensorData.energy[1] = pzem2.energy();
        sensorData.frequency[1] = pzem2.frequency();
        sensorData.pf[1] = pzem2.pf();
        sensorData.validReadings++;
    }

    // Read PZEM3
    sensorData.voltage[2] = pzem3.voltage();
    if (!isnan(sensorData.voltage[2]))
    {
        sensorData.current[2] = pzem3.current();
        sensorData.power[2] = pzem3.power();
        sensorData.energy[2] = pzem3.energy();
        sensorData.frequency[2] = pzem3.frequency();
        sensorData.pf[2] = pzem3.pf();
        sensorData.validReadings++;
    }

    if (sensorData.validReadings > 0)
    {
        // Calculate averages
        avgSensorData.voltage = (sensorData.voltage[0] + sensorData.voltage[1] + sensorData.voltage[2]) / 3.0;
        avgSensorData.current = (sensorData.current[0] + sensorData.current[1] + sensorData.current[2]) / 3.0;
        avgSensorData.power = (sensorData.power[0] + sensorData.power[1] + sensorData.power[2]) / 3.0;
        avgSensorData.energy = (sensorData.energy[0] + sensorData.energy[1] + sensorData.energy[2]) / 3.0;
        avgSensorData.frequency = (sensorData.frequency[0] + sensorData.frequency[1] + sensorData.frequency[2]) / 3.0;
        avgSensorData.pf = (sensorData.pf[0] + sensorData.pf[1] + sensorData.pf[2]) / 3.0;

        // Upload sensor data to Firebase
        uploadSensorData();
    }
    else
    {
        Serial.println("⚠ No valid sensor data available");
    }
}

void uploadSensorData()
{
    if (!Firebase.ready())
        return;

    String timestamp = getTimestamp();

    // Upload individual sensor data
    Firebase.setFloat(firebaseData, "/sensors/pzem1/voltage", sensorData.voltage[0]);
    Firebase.setFloat(firebaseData, "/sensors/pzem1/current", sensorData.current[0]);
    Firebase.setFloat(firebaseData, "/sensors/pzem1/power", sensorData.power[0]);

    Firebase.setFloat(firebaseData, "/sensors/pzem2/voltage", sensorData.voltage[1]);
    Firebase.setFloat(firebaseData, "/sensors/pzem2/current", sensorData.current[1]);
    Firebase.setFloat(firebaseData, "/sensors/pzem2/power", sensorData.power[1]);

    Firebase.setFloat(firebaseData, "/sensors/pzem3/voltage", sensorData.voltage[2]);
    Firebase.setFloat(firebaseData, "/sensors/pzem3/current", sensorData.current[2]);
    Firebase.setFloat(firebaseData, "/sensors/pzem3/power", sensorData.power[2]);

    // Upload average data
    Firebase.setFloat(firebaseData, "/sensors/average/voltage", avgSensorData.voltage);
    Firebase.setFloat(firebaseData, "/sensors/average/current", avgSensorData.current);
    Firebase.setFloat(firebaseData, "/sensors/average/power", avgSensorData.power);
    Firebase.setFloat(firebaseData, "/sensors/average/energy", avgSensorData.energy);
    Firebase.setFloat(firebaseData, "/sensors/average/frequency", avgSensorData.frequency);
    Firebase.setFloat(firebaseData, "/sensors/average/pf", avgSensorData.pf);
    Firebase.setString(firebaseData, "/sensors/average/timestamp", timestamp);
}

// CRITICAL FIX: Only update Firebase when values actually change
void updateDeviceStatusOnChange()
{
    if (!Firebase.ready())
        return;

    bool hasChanges = false;
    String timestamp = getTimestamp();

    // Check if relay1 state changed
    if (relay1State != prevRelay1State)
    {
        Firebase.setBool(firebaseData, "/devices/relay1", relay1State);
        prevRelay1State = relay1State;
        hasChanges = true;
        Serial.println("Device status updated: Relay1 = " + String(relay1State ? 1 : 0));
    }

    // Check if relay2 state changed
    if (relay2State != prevRelay2State)
    {
        Firebase.setBool(firebaseData, "/devices/relay2", relay2State);
        prevRelay2State = relay2State;
        hasChanges = true;
        Serial.println("Device status updated: Relay2 = " + String(relay2State ? 1 : 0));
    }

    if (hasChanges)
    {
        Serial.println("Device status updated in Firebase");
    }
}

// Separate heartbeat function to show device is alive
void sendHeartbeat()
{
    if (!Firebase.ready())
        return;

    String timestamp = getTimestamp();
    Firebase.setString(firebaseData, "/devices/esp32/last_seen", timestamp);
    Firebase.setString(firebaseData, "/devices/esp32/status", "online");

    // Update timestamp only if it actually changed
    if (timestamp != prevTimestamp)
    {
        prevTimestamp = timestamp;
        Serial.println("❤ Heartbeat sent: " + timestamp);
    }
}

void readRelayStatesFromFirebase()
{
    if (!Firebase.ready())
        return;

    // Simply read relay1 state from Firebase and apply it
    if (Firebase.get(firebaseData, "/relayControl/relay1"))
    {
        int firebaseValue = firebaseData.intData();
        bool newState = (firebaseValue == 1);

        if (newState != relay1State)
        {
            setRelay1(newState);
            Serial.println("Relay1 changed to: " + String(newState ? "ON" : "OFF"));
        }
    }
    else
    {
        Serial.println("Failed to read Firebase relay1 value");
    }

    // Simply read relay2 state from Firebase and apply it
    if (Firebase.get(firebaseData, "/relayControl/relay2"))
    {
        int firebaseValue = firebaseData.intData();
        bool newState = (firebaseValue == 1);

        if (newState != relay2State)
        {
            setRelay2(newState);
            Serial.println("Relay2 changed to: " + String(newState ? "ON" : "OFF"));
        }
    }
    else
    {
        Serial.println("Failed to read Firebase relay2 value");
    }
}

void setRelay1(bool state)
{
    relay1State = state;
    digitalWrite(RELAY1_PIN, state ? HIGH : LOW);
    digitalWrite(STATUS_LED, state ? HIGH : LOW); // Visual indicator
    Serial.println("Relay1 physically set to: " + String(state ? "ON" : "OFF"));
}

void setRelay2(bool state)
{
    relay2State = state;
    digitalWrite(RELAY2_PIN, state ? HIGH : LOW);
    Serial.println("Relay2 physically set to: " + String(state ? "ON" : "OFF"));
}

String getTimestamp()
{
    time_t t = timeClient.getEpochTime();
    struct tm *ptm = gmtime((time_t *)&t);
    char ts[32];
    sprintf(ts, "%04d-%02d-%02d %02d:%02d:%02d",
            ptm->tm_year + 1900, ptm->tm_mon + 1, ptm->tm_mday,
            ptm->tm_hour + 7, ptm->tm_min, ptm->tm_sec);
    return String(ts);
}

void checkConnections()
{
    // Check WiFi
    if (WiFi.status() != WL_CONNECTED)
    {
        Serial.println("⚠ WiFi disconnected, reconnecting...");
        connectToWiFi();
    }

    // Check Firebase
    if (!Firebase.ready())
    {
        Serial.println("⚠ Firebase disconnected, reconnecting...");
        setupFirebase();
    }

    // Show status
    Serial.println("Connection status: WiFi=" +
                   String(WiFi.status() == WL_CONNECTED ? "OK" : "FAIL") +
                   ", Firebase=" +
                   String(Firebase.ready() ? "OK" : "FAIL"));
}