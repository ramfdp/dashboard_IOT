# 🏢 Smart Building IoT Dashboard

[![Laravel](https://img.shields.io/badge/Laravel-10.x-red.svg)](https://laravel.com)
[![PHP](https://img.shields.io/badge/PHP-8.1+-blue.svg)](https://php.net)
[![ESP32](https://img.shields.io/badge/ESP32-Arduino-green.svg)](https://github.com/espressif/arduino-esp32)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A comprehensive IoT dashboard for smart building management, featuring real-time monitoring, device control, and intelligent scheduling systems with ESP32 hardware integration.

## 🌟 Features

- **Real-time Monitoring**: Live power consumption tracking with 3x PZEM sensors (averaged output)
- **Device Control**: Manual and automatic control of lighting systems via ESP32
- **Smart Scheduling**: Automated light scheduling based on time and day
- **Energy Analytics**: Detailed power consumption analysis with predictions
- **User Management**: Role-based access control with different permission levels
- **Overtime Management**: Employee overtime tracking and approval system
- **Firebase Integration**: Real-time device communication and control
- **ESP32 Hardware**: Complete IoT controller with 2 relays and 3 PZEM sensors
- **Responsive Design**: Mobile-friendly interface for all devices

## 🛠️ Tech Stack

### Backend

- **Laravel 10.x** - PHP Framework
- **MySQL** - Primary Database
- **Firebase** - Real-time device communication
- **Livewire 3** - Dynamic frontend components
- **Spatie Permissions** - Role & permission management

### Frontend

- **Bootstrap 5** - UI Framework
- **Chart.js** - Data visualization
- **jQuery** - JavaScript functionality
- **FontAwesome** - Icons
- **Custom CSS/JS** - Specialized components

### Hardware (ESP32)

- **ESP32 DevKit V1** - Main microcontroller
- **2x Relay modules** - Device control (Lampu ITMS 1 & 2)
- **3x PZEM-004T v3.0** - Power monitoring sensors
- **Firebase ESP32 Client** - Real-time communication
- **WiFi connectivity** - Internet connection

### DevOps & Tools

- **Laravel Mix** - Asset compilation
- **Composer** - PHP dependency management
- **NPM** - Node.js package management
- **Arduino IDE** - ESP32 development
- **Git** - Version control

## 🚀 Quick Start

### Prerequisites

- PHP 8.1 or higher
- Composer
- Node.js & NPM
- MySQL/MariaDB
- Arduino IDE (for ESP32)
- ESP32 development board
- Git

### Software Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ramfdp/dashboard_IOT.git
   cd dashboard_IOT
   ```

2. **Install PHP dependencies**

   ```bash
   composer install
   ```

3. **Install Node.js dependencies**

   ```bash
   npm install
   ```

4. **Environment setup**

   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Configure your `.env` file**

   ```env
   APP_NAME="Smart Building IoT Dashboard"
   APP_ENV=local
   APP_DEBUG=true
   APP_URL=http://localhost:8000

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=iot_dashboard
   DB_USERNAME=your_username
   DB_PASSWORD=your_password

   # Firebase Configuration (get from Firebase console)
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=your_client_email
   FIREBASE_PRIVATE_KEY="your_private_key"
   ```

6. **Database setup**

   ```bash
   php artisan migrate --seed
   ```

7. **Compile assets**

   ```bash
   npm run dev
   ```

8. **Start the development server**
   ```bash
   php artisan serve
   ```

### Hardware Setup (ESP32)

1. **Hardware Requirements**

   - ESP32 DevKit V1 or compatible
   - 2x Relay modules (5V, optocoupler isolated)
   - 3x PZEM-004T v3.0 power sensors
   - External 5V/2A power supply
   - Connecting wires and breadboard

2. **Arduino IDE Setup**

   - Install ESP32 board package
   - Install required libraries (see `hardware/esp32/README.md`)

3. **Configure ESP32**

   - Update WiFi credentials in `hardware/esp32/esp32_iot_controller.ino`
   - Update Firebase credentials in `hardware/esp32/config.h`
   - Follow wiring diagram in `hardware/esp32/WIRING.md`

4. **Upload firmware**
   - Open `hardware/esp32/esp32_iot_controller.ino` in Arduino IDE
   - Select ESP32 board and port
   - Upload the sketch

📖 **Detailed ESP32 setup guide**: See `hardware/esp32/SETUP.md`

## 📁 Project Structure

```
dashboard_IOT/
├── app/
│   ├── Http/Controllers/     # Application controllers
│   ├── Models/              # Eloquent models
│   ├── Livewire/           # Livewire components
│   └── Services/           # Business logic services
├── database/
│   ├── migrations/         # Database migrations
│   └── seeders/           # Database seeders
├── hardware/
│   └── esp32/             # ESP32 firmware and documentation
│       ├── esp32_iot_controller.ino  # Main Arduino sketch
│       ├── config.h                  # Hardware configuration
│       ├── SETUP.md                  # Setup instructions
│       ├── WIRING.md                 # Wiring diagrams
│       └── README.md                 # Library requirements
├── public/
│   └── assets/            # Compiled assets (CSS, JS, images)
├── resources/
│   ├── views/             # Blade templates
│   ├── js/               # JavaScript source files
│   └── scss/             # SASS/CSS source files
├── routes/
│   ├── web.php           # Web routes
│   └── api.php           # API routes
└── storage/              # Application storage
```

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Realtime Database
3. Generate a service account key
4. Add the credentials to your `.env` file
5. Configure database rules for device communication

### ESP32 Integration

The ESP32 controller provides:

- **Real-time sensor data**: 3x PZEM sensors with averaged output
- **Device control**: 2 relays for lighting control
- **Automatic scheduling**: Based on Laravel dashboard schedules
- **Mode switching**: Auto/Manual control modes
- **Firebase sync**: Bidirectional communication with dashboard

### Data Flow

```
PZEM Sensors → ESP32 → Firebase → Laravel Dashboard
Dashboard Commands → Firebase → ESP32 → Relays
```

## 📊 API Endpoints

| Method | Endpoint               | Description                   |
| ------ | ---------------------- | ----------------------------- |
| GET    | `/api/monitoring`      | Get real-time monitoring data |
| POST   | `/api/devices/control` | Control device states         |
| GET    | `/api/schedules`       | Get lighting schedules        |
| POST   | `/api/schedules`       | Create new schedule           |
| DELETE | `/api/schedules/{id}`  | Delete schedule               |
| POST   | `/api/mode/auto`       | Switch to automatic mode      |
| POST   | `/api/mode/manual`     | Switch to manual mode         |

## 🔐 Default Credentials

After running the seeders, you can login with:

- **Admin**: admin@example.com / password
- **User**: user@example.com / password

> ⚠️ **Important**: Change these credentials in production!

## 🧪 Testing

```bash
# Run PHP tests
php artisan test

# Run with coverage
php artisan test --coverage

# Test ESP32 connection
# Check Serial Monitor output at 115200 baud
```

## 📦 Deployment

### Production Setup

1. Set `APP_ENV=production` in `.env`
2. Set `APP_DEBUG=false`
3. Configure proper database credentials
4. Set up Firebase production project
5. Deploy ESP32 with production credentials
6. Run optimizations:
   ```bash
   composer install --optimize-autoloader --no-dev
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   npm run production
   ```

### ESP32 Production Notes

- Use quality 5V external power supply
- Install in proper electrical enclosure
- Follow local electrical safety codes
- Test thoroughly before final installation

## 🔒 Security

- **Firebase rules**: Properly configured for authenticated access
- **ESP32 isolation**: Optocoupler relays for electrical isolation
- **Input validation**: All Laravel inputs validated and sanitized
- **Role-based access**: Different permission levels for users
- **HTTPS**: Use SSL certificates in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

### Development Guidelines

- Follow Laravel coding standards
- Comment ESP32 code thoroughly
- Test both software and hardware changes
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: [ramfdp](https://github.com/ramfdp)

## 📞 Support

For support:

- **Software issues**: Create an issue in this repository
- **Hardware issues**: Check `hardware/esp32/SETUP.md` troubleshooting section
- **Email**: [support@example.com]

## 🔗 Related Documentation

- [ESP32 Setup Guide](hardware/esp32/SETUP.md)
- [ESP32 Wiring Diagram](hardware/esp32/WIRING.md)
- [Laravel Documentation](https://laravel.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [ESP32 Arduino Core](https://github.com/espressif/arduino-esp32)

---

**Built with ❤️ for Smart Building Management**

_Complete hardware and software solution for IoT-based building automation_
