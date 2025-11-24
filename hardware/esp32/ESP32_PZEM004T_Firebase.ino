#include <WiFi.h>
#include <PZEM004Tv30.h>
#include <HTTPClient.h>

#define WIFI_SSID "WORKSHOP ITMS"
#define WIFI_PASSWORD "ITMS2023"
#define API_KEY "AIzaSyDi-2L7pOKJH1gOAJnSvhMfLUINRPTX7Yg"
#define DATABASE_URL "https://smart-building-3e5c1-default-rtdb.asia-southeast1.firebasedatabase.app/"
#define USER_EMAIL "esp32@iot.com"
#define USER_PASSWORD "esp32password123"
#define LARAVEL_API_URL "http://192.168.1.100/api/pln/store-realtime-power"

PZEM004Tv30 pzem(Serial2, 16, 17);

#define RELAY_1 25
#define RELAY_2 26
#define RELAY_3 27
#define RELAY_4 32
#define RELAY_5 33

const int relayPins[5] = {RELAY_1, RELAY_2, RELAY_3, RELAY_4, RELAY_5};
bool relayStates[5] = {false, false, false, false, false};

HTTPClient http;
String firebaseAuthToken = "";

unsigned long lastFirebaseUpdate = 0;
unsigned long lastDatabaseUpdate = 0;
unsigned long lastRelayCheck = 0;
const unsigned long FIREBASE_INTERVAL = 10000;
const unsigned long DATABASE_INTERVAL = 30000;
const unsigned long RELAY_CHECK_INTERVAL = 5000;

void setup()
{
    Serial.begin(115200);
    Serial.println("ESP32 PZEM-004T IoT Monitor with 5-Relay Light Control");

    for (int i = 0; i < 5; i++)
    {
        pinMode(relayPins[i], OUTPUT);
        digitalWrite(relayPins[i], LOW);
        Serial.print("Relay ");
        Serial.print(i + 1);
        Serial.print(" (GPIO ");
        Serial.print(relayPins[i]);
        Serial.println("): OFF");
    }

    delay(1000);
    connectWiFi();
    setupFirebase();
    Serial.println("Setup complete!");
}

void loop()
{
    unsigned long currentMillis = millis();

    if (WiFi.status() != WL_CONNECTED)
    {
        Serial.println("WiFi lost! Reconnecting...");
        connectWiFi();
        return;
    }

    if (currentMillis - lastRelayCheck >= RELAY_CHECK_INTERVAL)
    {
        checkRelaysFromFirebase();
        lastRelayCheck = currentMillis;
    }

    float voltage = pzem.voltage();
    float current = pzem.current();
    float power = pzem.power();
    float energy = pzem.energy();
    float frequency = pzem.frequency();
    float pf = pzem.pf();

    if (isnan(voltage))
    {
        Serial.println("PZEM error!");
        delay(1000);
        return;
    }

    Serial.print("V:");
    Serial.print(voltage, 2);
    Serial.print(" A:");
    Serial.print(current, 3);
    Serial.print(" P:");
    Serial.print(power, 2);
    Serial.print(" E:");
    Serial.print(energy, 3);
    Serial.print(" F:");
    Serial.print(frequency, 1);
    Serial.print(" PF:");
    Serial.println(pf, 2);

    if (currentMillis - lastFirebaseUpdate >= FIREBASE_INTERVAL)
    {
        sendToFirebase(voltage, current, power, energy, frequency, pf);
        lastFirebaseUpdate = currentMillis;
    }

    if (currentMillis - lastDatabaseUpdate >= DATABASE_INTERVAL)
    {
        sendToLaravelAPI(voltage, current, power, energy, frequency, pf);
        lastDatabaseUpdate = currentMillis;
    }

    delay(1000);
}

void connectWiFi()
{
    Serial.print("Connecting to ");
    Serial.println(WIFI_SSID);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20)
    {
        delay(500);
        Serial.print(".");
        attempts++;
    }

    if (WiFi.status() == WL_CONNECTED)
    {
        Serial.print("WiFi connected! IP: ");
        Serial.print(WiFi.localIP());
        Serial.print(" RSSI: ");
        Serial.print(WiFi.RSSI());
        Serial.println(" dBm");
    }
    else
    {
        Serial.println("WiFi failed! Restarting...");
        delay(5000);
        ESP.restart();
    }
}

void setupFirebase()
{
    Serial.println("Firebase auth skipped - using direct HTTP");
}

void sendToFirebase(float voltage, float current, float power, float energy, float frequency, float pf)
{
    if (WiFi.status() != WL_CONNECTED)
        return;

    http.begin(String(DATABASE_URL) + "sensor.json?auth=" + API_KEY);
    http.addHeader("Content-Type", "application/json");

    String json = "{\"tegangan\":" + String(voltage, 2) +
                  ",\"arus\":" + String(current, 3) +
                  ",\"daya\":" + String(power, 2) +
                  ",\"energi\":" + String(energy, 3) +
                  ",\"frekuensi\":" + String(frequency, 1) +
                  ",\"faktor_daya\":" + String(pf, 2) +
                  ",\"timestamp\":" + String(millis()) +
                  ",\"source\":\"ESP32-PZEM004T\"}";

    int httpCode = http.PUT(json);
    if (httpCode > 0)
    {
        Serial.println("Firebase sent!");
    }
    else
    {
        Serial.print("Firebase error: ");
        Serial.println(httpCode);
    }
    http.end();
}

void sendToLaravelAPI(float voltage, float current, float power, float energy, float frequency, float pf)
{
    if (WiFi.status() != WL_CONNECTED)
        return;

    HTTPClient httpClient;
    httpClient.begin(LARAVEL_API_URL);
    httpClient.addHeader("Content-Type", "application/json");
    httpClient.setTimeout(10000);

    String json = "{\"tegangan\":\"" + String(voltage, 2) +
                  "\",\"arus\":\"" + String(current, 3) +
                  "\",\"daya\":\"" + String(power, 2) +
                  "\",\"energi\":\"" + String(energy, 3) +
                  "\",\"frekuensi\":\"" + String(frequency, 1) +
                  "\",\"faktor_daya\":\"" + String(pf, 2) +
                  "\",\"source\":\"ESP32-PZEM004T\"}";

    int httpResponseCode = httpClient.POST(json);

    if (httpResponseCode > 0)
    {
        String response = httpClient.getString();
        Serial.print("API response: ");
        Serial.print(httpResponseCode);
        Serial.print(" ");
        Serial.println(response);
    }
    else
    {
        Serial.print("API error: ");
        Serial.print(httpResponseCode);
        Serial.print(" ");
        Serial.println(httpClient.errorToString(httpResponseCode));
    }

    httpClient.end();
}

void checkRelaysFromFirebase()
{
    if (WiFi.status() != WL_CONNECTED)
        return;

    for (int i = 1; i <= 5; i++)
    {
        HTTPClient httpClient;
        String url = String(DATABASE_URL) + "relayControl/relay" + String(i) + ".json?auth=" + API_KEY;
        httpClient.begin(url);
        int httpCode = httpClient.GET();

        if (httpCode == 200)
        {
            String payload = httpClient.getString();
            int value = payload.toInt();
            bool newState = (value == 1);
            if (newState != relayStates[i - 1])
            {
                controlRelay(i - 1, newState);
            }
        }
        else
        {
            Serial.print("Failed to read relay");
            Serial.println(i);
        }
        httpClient.end();
    }
}

void controlRelay(int relayIndex, bool state)
{
    if (relayIndex < 0 || relayIndex >= 5)
        return;

    relayStates[relayIndex] = state;
    digitalWrite(relayPins[relayIndex], state ? HIGH : LOW);

    Serial.print("Relay ");
    Serial.print(relayIndex + 1);
    Serial.print(": ");
    Serial.println(state ? "ON" : "OFF");
    updateRelayStatusToFirebase();
}

void updateRelayStatusToFirebase()
{
    if (WiFi.status() != WL_CONNECTED)
        return;

    for (int i = 0; i < 5; i++)
    {
        HTTPClient httpClient;
        String url = String(DATABASE_URL) + "relayControl/relay" + String(i + 1) + ".json?auth=" + API_KEY;
        httpClient.begin(url);
        httpClient.addHeader("Content-Type", "application/json");
        int value = relayStates[i] ? 1 : 0;
        int httpCode = httpClient.PUT(String(value));

        if (httpCode == 200)
        {
            Serial.print("Relay ");
            Serial.print(i + 1);
            Serial.print(" updated: ");
            Serial.println(value);
        }
        else
        {
            Serial.print("Relay ");
            Serial.print(i + 1);
            Serial.print(" update failed: ");
            Serial.println(httpCode);
        }
        httpClient.end();
    }
}
