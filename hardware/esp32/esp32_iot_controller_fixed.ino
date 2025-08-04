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
#define RELAY3_PIN 14
#define RELAY4_PIN 12
#define RELAY5_PIN 13
#define RELAY6_PIN 25
#define RELAY7_PIN 33
#define RELAY8_PIN 32
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
bool relay1State = false, relay2State = false, relay3State = false, relay4State = false;
bool relay5State = false, relay6State = false, relay7State = false, relay8State = false;

// Previous states to track changes
bool prevRelay1State = false, prevRelay2State = false, prevRelay3State = false, prevRelay4State = false;
bool prevRelay5State = false, prevRelay6State = false, prevRelay7State = false, prevRelay8State = false;
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
    pinMode(RELAY3_PIN, OUTPUT);
    pinMode(RELAY4_PIN, OUTPUT);
    pinMode(RELAY5_PIN, OUTPUT);
    pinMode(RELAY6_PIN, OUTPUT);
    pinMode(RELAY7_PIN, OUTPUT);
    pinMode(RELAY8_PIN, OUTPUT);
    pinMode(STATUS_LED, OUTPUT);

    // Initialize all relays to OFF state
    digitalWrite(RELAY1_PIN, LOW);
    digitalWrite(RELAY2_PIN, LOW);
    digitalWrite(RELAY3_PIN, LOW);
    digitalWrite(RELAY4_PIN, LOW);
    digitalWrite(RELAY5_PIN, LOW);
    digitalWrite(RELAY6_PIN, LOW);
    digitalWrite(RELAY7_PIN, LOW);
    digitalWrite(RELAY8_PIN, LOW);

    Serial.println("✓ All 8 relay pins configured");
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

    // Check all relay states for changes
    struct RelayState
    {
        bool *current;
        bool *previous;
        const char *name;
    };

    RelayState relays[] = {
        {&relay1State, &prevRelay1State, "relay1"},
        {&relay2State, &prevRelay2State, "relay2"},
        {&relay3State, &prevRelay3State, "relay3"},
        {&relay4State, &prevRelay4State, "relay4"},
        {&relay5State, &prevRelay5State, "relay5"},
        {&relay6State, &prevRelay6State, "relay6"},
        {&relay7State, &prevRelay7State, "relay7"},
        {&relay8State, &prevRelay8State, "relay8"}};

    for (int i = 0; i < 8; i++)
    {
        if (*relays[i].current != *relays[i].previous)
        {
            Firebase.setBool(firebaseData, String("/devices/") + relays[i].name, *relays[i].current);
            *relays[i].previous = *relays[i].current;
            hasChanges = true;
            Serial.println("Device status updated: " + String(relays[i].name) + " = " + String(*relays[i].current ? 1 : 0));
        }
    }

    if (hasChanges)
    {
        Firebase.setString(firebaseData, "/devices/lastUpdate", timestamp);
        Serial.println("Device status updated in Firebase with timestamp: " + timestamp);
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

    // Read all 8 relay states from Firebase
    for (int i = 1; i <= 8; i++)
    {
        String relayPath = "/relayControl/relay" + String(i);

        if (Firebase.get(firebaseData, relayPath))
        {
            int firebaseValue = firebaseData.intData();
            bool newState = (firebaseValue == 1);
            bool *currentState;

            // Get current state reference based on relay number
            switch (i)
            {
            case 1:
                currentState = &relay1State;
                break;
            case 2:
                currentState = &relay2State;
                break;
            case 3:
                currentState = &relay3State;
                break;
            case 4:
                currentState = &relay4State;
                break;
            case 5:
                currentState = &relay5State;
                break;
            case 6:
                currentState = &relay6State;
                break;
            case 7:
                currentState = &relay7State;
                break;
            case 8:
                currentState = &relay8State;
                break;
            }

            if (newState != *currentState)
            {
                setRelay(i, newState);
                Serial.println("Relay" + String(i) + " changed to: " + String(newState ? "ON" : "OFF"));
            }
        }
        else
        {
            Serial.println("Failed to read Firebase relay" + String(i) + " value");
        }
    }
}

void setRelay(int relayNum, bool state)
{
    int pin;
    bool *currentState;

    // Map relay number to pin and state variable
    switch (relayNum)
    {
    case 1:
        pin = RELAY1_PIN;
        currentState = &relay1State;
        break;
    case 2:
        pin = RELAY2_PIN;
        currentState = &relay2State;
        break;
    case 3:
        pin = RELAY3_PIN;
        currentState = &relay3State;
        break;
    case 4:
        pin = RELAY4_PIN;
        currentState = &relay4State;
        break;
    case 5:
        pin = RELAY5_PIN;
        currentState = &relay5State;
        break;
    case 6:
        pin = RELAY6_PIN;
        currentState = &relay6State;
        break;
    case 7:
        pin = RELAY7_PIN;
        currentState = &relay7State;
        break;
    case 8:
        pin = RELAY8_PIN;
        currentState = &relay8State;
        break;
    default:
        return; // Invalid relay number
    }

    *currentState = state;
    digitalWrite(pin, state ? HIGH : LOW);

    // Use LED indicator for relay 1 only
    if (relayNum == 1)
    {
        digitalWrite(STATUS_LED, state ? HIGH : LOW);
    }

    Serial.println("Relay" + String(relayNum) + " physically set to: " + String(state ? "ON" : "OFF"));
}

void setRelay1(bool state)
{
    setRelay(1, state);
}

void setRelay2(bool state)
{
    setRelay(2, state);
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