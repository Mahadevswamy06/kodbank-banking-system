# 🏦 Kodbank - Modern Digital Banking Platform

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Kodbank** is a premium, full-stack digital banking application designed with a focus on high-end aesthetics and secure financial transactions. It features a modern Bento-style dashboard, real-time animations, and a robust Spring Boot backend.

---

## ✨ Key Features

- **🛡️ Secure Authentication**: JWT-based login and registration system with Spring Security.
- **💰 Real-time Balance**: Instant balance check with smooth count-up animations and confetti celebrations.
- **💸 Seamless Transfers**: Send money to other users securely with instant transaction validation.
- **📜 Transaction History**: Detailed log of all credit and debit transactions with status indicators.
- **📱 Personal QR Code**: Integrated "My QR" feature for receiving payments (PhonePe style integration).
- **⚡ Quick Services**: Interactive Bento-grid for Bill Payments, Recharges, and more (Coming Soon).
- **🎨 Premium UI/UX**:
  - **Glassmorphism Design**: Sleek, transparent card interfaces.
  - **3D Backgrounds**: Immersive environment powered by Three.js.
  - **Fluid Animations**: Smooth transitions using GSAP and Framer Motion.
  - **Dark Mode**: Eye-friendly dark aesthetic by default.

---

## 🚀 Tech Stack

### Backend
- **Framework**: Spring Boot 3.4.2
- **Language**: Java 17
- **Security**: Spring Security, JWT (Json Web Token)
- **Database**: MySQL (Production), H2 (Development)
- **Persistence**: Spring Data JPA / Hibernate

### Frontend
- **Structure**: Semantic HTML5
- **Styling**: Vanilla CSS3 (Custom Design System)
- **Logic**: JavaScript (ES6+)
- **Animations**: GSAP, Three.js, Canvas Confetti
- **Icons**: Font Awesome 6.0

---

## 🛠️ Installation & Setup

### Prerequisites
- JDK 17 or higher
- Maven 3.6+
- MySQL Server (Optional, defaults to H2)

### Steps
1. **Clone the Project**:
   ```bash
   git clone https://github.com/Mahadevswamy06/kodbank-banking-system.git
   cd kodbank
   ```

2. **Configure Database**:
   Update `src/main/resources/application.properties` with your MySQL credentials if using production mode.

3. **Build & Run**:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

4. **Access the App**:
   Visit [kodbank-banking-system-22iq.vercel.app](https://kodbank-banking-system-22iq.vercel.app) or open `http://localhost:8080` for local development.

---



## 🤝 Contributing

Contributions are welcome! If you'd like to improve Kodbank, feel free to fork the repo and submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👨‍💻 Developed By

**Mahadev Swamy**
- GitHub: [@Mahadevswamy06](https://github.com/Mahadevswamy06)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Designed with ❤️ by Mahadev Swamy*
