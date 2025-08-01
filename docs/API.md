# API Documentation

## Overview

The Smart Building IoT Dashboard provides RESTful API endpoints for device control, data retrieval, and system management.

## Base URL

```
http://localhost:8000/api
```

## Authentication

Most API endpoints require authentication. Include the authentication token in the request headers:

```http
Authorization: Bearer {your-api-token}
```

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Authenticated users**: 100 requests per minute
- **Unauthenticated users**: 20 requests per minute

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Success message",
  "timestamp": "2025-07-31T10:30:00Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  },
  "timestamp": "2025-07-31T10:30:00Z"
}
```

## Endpoints

### Monitoring Data

#### Get Real-time Sensor Data

```http
GET /api/monitoring/realtime
```

**Response:**

```json
{
  "success": true,
  "data": {
    "voltage": 230.5,
    "current": 2.3,
    "power": 530.15,
    "energy": 12.5,
    "frequency": 50.0,
    "power_factor": 0.95,
    "timestamp": "2025-07-31T10:30:00Z"
  }
}
```

#### Get Historical Data

```http
GET /api/monitoring/history
```

**Parameters:**

- `start_date` (optional): Start date in YYYY-MM-DD format
- `end_date` (optional): End date in YYYY-MM-DD format
- `limit` (optional): Number of records to return (default: 100)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "voltage": 230.5,
      "current": 2.3,
      "power": 530.15,
      "energy": 12.5,
      "timestamp": "2025-07-31T10:30:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_records": 500
  }
}
```

### Device Control

#### Get Device Status

```http
GET /api/devices/status
```

**Response:**

```json
{
  "success": true,
  "data": {
    "relay1": {
      "status": "on",
      "name": "Lampu ITMS 1",
      "last_updated": "2025-07-31T10:25:00Z"
    },
    "relay2": {
      "status": "off",
      "name": "Lampu ITMS 2",
      "last_updated": "2025-07-31T10:20:00Z"
    },
    "mode": "auto",
    "esp32_status": "online"
  }
}
```

#### Control Single Device

```http
POST /api/devices/{device_id}/control
```

**Parameters:**

- `device_id`: Device identifier (relay1, relay2)
- `action`: Device action (on, off, toggle)

**Request Body:**

```json
{
  "action": "on"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "device_id": "relay1",
    "status": "on",
    "message": "Device switched on successfully"
  }
}
```

#### Control Multiple Devices

```http
POST /api/devices/control
```

**Request Body:**

```json
{
  "devices": {
    "relay1": "on",
    "relay2": "off"
  }
}
```

### Mode Control

#### Switch to Auto Mode

```http
POST /api/mode/auto
```

**Response:**

```json
{
  "success": true,
  "data": {
    "mode": "auto",
    "message": "Switched to automatic mode"
  }
}
```

#### Switch to Manual Mode

```http
POST /api/mode/manual
```

**Response:**

```json
{
  "success": true,
  "data": {
    "mode": "manual",
    "message": "Switched to manual mode"
  }
}
```

### Schedule Management

#### Get All Schedules

```http
GET /api/schedules
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Morning Lights",
      "day_of_week": "monday",
      "start_time": "07:00:00",
      "end_time": "18:00:00",
      "is_active": true,
      "created_at": "2025-07-31T08:00:00Z"
    }
  ]
}
```

#### Create New Schedule

```http
POST /api/schedules
```

**Request Body:**

```json
{
  "name": "Evening Lights",
  "day_of_week": "monday",
  "start_time": "18:00",
  "end_time": "22:00"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Evening Lights",
    "day_of_week": "monday",
    "start_time": "18:00:00",
    "end_time": "22:00:00",
    "is_active": true
  }
}
```

#### Update Schedule

```http
PUT /api/schedules/{id}
```

#### Delete Schedule

```http
DELETE /api/schedules/{id}
```

### System Information

#### Get System Status

```http
GET /api/system/status
```

**Response:**

```json
{
  "success": true,
  "data": {
    "app_version": "1.0.0",
    "laravel_version": "10.x",
    "php_version": "8.1.0",
    "database_status": "connected",
    "firebase_status": "connected",
    "esp32_status": "online",
    "last_data_update": "2025-07-31T10:30:00Z",
    "uptime": "2 days, 5 hours"
  }
}
```

## Error Codes

| Code                      | Description                          |
| ------------------------- | ------------------------------------ |
| `INVALID_REQUEST`         | Request format is invalid            |
| `AUTHENTICATION_REQUIRED` | Authentication token required        |
| `AUTHORIZATION_FAILED`    | Insufficient permissions             |
| `DEVICE_NOT_FOUND`        | Specified device not found           |
| `DEVICE_OFFLINE`          | Device is not responding             |
| `SCHEDULE_CONFLICT`       | Schedule conflicts with existing one |
| `VALIDATION_ERROR`        | Input validation failed              |
| `INTERNAL_ERROR`          | Server internal error                |
| `RATE_LIMIT_EXCEEDED`     | Too many requests                    |

## SDK Examples

### JavaScript (Fetch API)

```javascript
// Get real-time data
async function getRealTimeData() {
  try {
    const response = await fetch("/api/monitoring/realtime", {
      headers: {
        Authorization: "Bearer " + token,
        Accept: "application/json",
      },
    });
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Control device
async function controlDevice(deviceId, action) {
  try {
    const response = await fetch(`/api/devices/${deviceId}/control`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ action }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
}
```

### PHP (Guzzle)

```php
use GuzzleHttp\Client;

$client = new Client(['base_uri' => 'http://localhost:8000/api/']);

// Get real-time data
$response = $client->get('monitoring/realtime', [
    'headers' => [
        'Authorization' => 'Bearer ' . $token,
        'Accept' => 'application/json'
    ]
]);

$data = json_decode($response->getBody(), true);
```

### Python (Requests)

```python
import requests

base_url = "http://localhost:8000/api"
headers = {
    "Authorization": f"Bearer {token}",
    "Accept": "application/json"
}

# Get real-time data
response = requests.get(f"{base_url}/monitoring/realtime", headers=headers)
data = response.json()

# Control device
control_data = {"action": "on"}
response = requests.post(
    f"{base_url}/devices/relay1/control",
    json=control_data,
    headers=headers
)
```

## Webhooks

Configure webhooks to receive real-time notifications:

### Device State Changes

```json
{
  "event": "device.state_changed",
  "data": {
    "device_id": "relay1",
    "old_state": "off",
    "new_state": "on",
    "timestamp": "2025-07-31T10:30:00Z"
  }
}
```

### Power Alerts

```json
{
  "event": "power.alert",
  "data": {
    "type": "high_consumption",
    "value": 5500.0,
    "threshold": 5000.0,
    "timestamp": "2025-07-31T10:30:00Z"
  }
}
```

## Rate Limiting Headers

API responses include rate limiting information:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1627740000
```

## Testing

Use the provided Postman collection or test with curl:

```bash
# Get real-time data
curl -X GET "http://localhost:8000/api/monitoring/realtime" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"

# Control device
curl -X POST "http://localhost:8000/api/devices/relay1/control" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "on"}'
```
