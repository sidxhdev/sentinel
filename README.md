# 🔒 Sentinel - AI-Powered Intrusion Detection System

An intelligent security system combining ESP32-CAM and STM32 Blue Pill microcontrollers for real-time motion detection and alerting. Sentinel uses PIR sensors and camera-based AI detection to provide multi-layered security monitoring.

## ✨ Features

- **Real-time Motion Detection**: PIR sensor integration for immediate motion sensing
- **AI-Powered Vision**: ESP32-CAM module for intelligent image capture and processing
- **Audio Alerts**: Buzzer system with customizable alert patterns (3 beeps per minute on detection)
- **Dual Microcontroller Architecture**: Independent ESP32-CAM and STM32 operation for enhanced reliability
- **Low Power Design**: Optimized for continuous monitoring applications

## 🛠️ Hardware Requirements

### Core Components
- **AI Thinker ESP32-CAM** - Camera module for image capture and AI processing
- **STM32 Blue Pill** (STM32F103C8T6) - Main controller for sensor processing
- **PIR Motion Sensor** (HC-SR501 or similar) - Passive infrared motion detection
- **Active Buzzer** - Audio alert system
- **USB-Serial 'mb' Programmer** - For flashing ESP32-CAM
- **ST-Link V2** - For programming STM32

### Additional Components
- Jumper wires
- Breadboard (for prototyping)
- 5V power supply
- Resistors (as needed for circuit)

## 📋 Pin Configuration

### STM32 Blue Pill Connections

PIR Sensor:

    VCC → 5V

    GND → GND

    OUT → PA0 (or configured GPIO pin)

Buzzer:

    Positive → PB12 (or configured GPIO pin)

    Negative → GND


### ESP32-CAM Connections

Power:

    5V → VCC

    GND → GND

Programming (via USB-Serial 'mb'):

    U0R → RX

    U0T → TX

    IO0 → GND (during flash)


## 🚀 Getting Started

### Prerequisites

1. **Arduino IDE** installed
2. **ESP32 Board Support** added to Arduino IDE
3. **STM32CubeIDE** or Arduino IDE with STM32 support
4. **OpenCV** libraries (optional, for advanced AI features)

### Installation

#### 1. Clone the Repository

git clone https://github.com/sidxhdev/sentinel.git
cd sentinel


#### 2. Flash ESP32-CAM

Open esp32-cam/sentinel-cam.ino in Arduino IDE
Connect ESP32-CAM via USB-Serial 'mb' programmer
Select Tools > Board > AI Thinker ESP32-CAM
Select correct COM port (e.g., COM3)
Press and hold BOOT button, then upload



#### 3. Program STM32 Blue Pill

Connect ST-Link V2 to STM32
Open stm32/sentinel-controller/ in STM32CubeIDE
Build and flash to STM32

text

## 💻 Software Architecture

### ESP32-CAM Module
- Captures images on trigger
- Runs lightweight AI detection models
- Independent operation from STM32

### STM32 Controller
- Monitors PIR sensor continuously
- Triggers buzzer alerts (3 beeps/minute pattern)
- Manages power and timing logic

## 🔧 Configuration

### Motion Detection Settings
Edit `config.h` to customize:
- PIR sensor sensitivity
- Buzzer alert pattern
- Detection cooldown period
- Image capture frequency

### AI Detection Parameters
Configure in `esp32-cam/config.h`:
- Detection confidence threshold
- Image resolution
- Processing interval

## 📡 Usage

1. **Power On**: Connect both microcontrollers to power supply
2. **Initialization**: System performs self-check (buzzer beeps once)
3. **Active Monitoring**: PIR sensor continuously monitors for motion
4. **Alert Mode**: On detection, buzzer sounds (3 beeps every minute) and ESP32-CAM captures images
5. **Reset**: Press reset button on STM32 to clear alerts

## 📁 Project Structure


sentinel/
├── esp32-cam/
│ ├── sentinel-cam.ino
│ ├── config.h
│ └── README.md
├── stm32/
│ ├── sentinel-controller/
│ │ ├── Core/
│ │ ├── Drivers/
│ │ └── sentinel-controller.ioc
│ └── README.md
├── docs/
│ ├── wiring-diagram.png
│ └── setup-guide.md
└── README.md



## 🔍 Troubleshooting

### ESP32-CAM Won't Flash
- Ensure IO0 is connected to GND during upload
- Check USB-Serial 'mb' programmer connections
- Verify correct COM port selection (check Device Manager)

### STM32 Not Responding
- Verify ST-Link V2 connections
- Check power supply (3.3V/5V requirements)
- Try different USB port or cable

### False Motion Detections
- Adjust PIR sensor potentiometer (sensitivity)
- Increase detection cooldown period
- Shield sensor from air currents and heat sources

## 🛣️ Roadmap

- [ ] Add WiFi connectivity for remote monitoring
- [ ] Implement cloud storage for captured images
- [ ] Mobile app integration
- [ ] Multiple camera support
- [ ] Advanced AI person detection with OpenCV
- [ ] Power optimization for battery operation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Siddesh** ([@sidxhdev](https://github.com/sidxhdev))

## 🙏 Acknowledgments

- ESP32-CAM community for camera integration examples
- STM32 community for embedded development resources
- OpenCV contributors for AI detection capabilities

---

**⚠️ Note**: This is a prototype security system. For production deployment, additional security hardening and testing are required.
