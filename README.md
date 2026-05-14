# SecurePass AI: Password Strength Testing Tool

<div align="center"><img src="SecurePass AI.png" alt="Lock icon with shield symbolizing security and password protection in blue and gold tones" width="150" height="150"></div>


**SecurePass AI** is a comprehensive cybersecurity awareness application designed to help users evaluate and improve their digital security. By combining industry-standard analysis libraries with real-world breach detection, it provides a holistic view of how secure a password truly is against various attack vectors.

---

## 🌐 Live Demo

👉 [Visit Website]()

## 🚀 Features

### 🔍 Advanced Analysis

- **zxcvbn Integration:** Uses Dropbox's realistic password strength estimator to recognize patterns, common names, and keyboard smashes.

- **Entropy Calculation:** Measures the mathematical complexity (bits of entropy) of your password.

- **Attack Simulations:** Provides estimated crack times for:
  - Online throttled attacks (e.g., login screens)
  - Offline fast hash attacks (e.g., leaked database cracking)
  - GPU-accelerated and dictionary attacks
  - Theoretical quantum computing estimates

---

### 🛡️ Breach Detection

- **Have I Been Pwned? Integration:** Utilizes the HIBP k-Anonymity API to check if a password has appeared in known data breaches without ever sending the full password to the server.

---

### 🛠️ Generation Tools

- **Secure Password Generator:** Creates high-entropy random strings.

- **Passphrase Generator:** Generates memorable yet secure multi-word phrases.

- **AI Suggestions:** Context-aware password recommendations based on intended use (Banking, Gaming, Work, etc.).

---

### 📊 Visualization & Reporting

- **Dynamic Strength Meter:** Real-time visual feedback as you type.

- **Entropy Visualization:** Interactive Chart.js integration to visualize security metrics.

- **Security Reports:** Generate and download a PDF summary of your password analysis using jsPDF.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|----------|
| HTML5 | Frontend Structure |
| Tailwind CSS | Styling & Dark Mode |
| zxcvbn | Password Strength Estimation |
| Chart.js | Data Visualization |
| jsPDF | PDF Report Generation |
| HIBP API | Breach Detection |

---

## 📂 Project Structure

```plaintext
├── index.html      # Main application interface and Tailwind configuration
├── app.js          # Core logic, API integration, and event handling
├── manifest.json   # PWA metadata for mobile/desktop installation
└── README.md       # Project documentation

```
---

## 📊 Password Strength Levels

| Score | Strength |
|------|-----------|
| 0 - 24 | Very Weak |
| 25 - 44 | Weak |
| 45 - 64 | Moderate |
| 65 - 84 | Strong |
| 85 - 100 | Very Strong |


---
## 🔒 Privacy & Security

Your security is the priority:

- **Local Analysis:** All password strength calculations and entropy checks happen locally within your browser.

- **K-Anonymity:** When checking for breaches, only the first 5 characters of the SHA-1 hashed password are sent to the HIBP API. The full password never leaves your device.

- **No Storage:** This tool does not store, log, or transmit your passwords to any private server.

---

## 🚦 Getting Started

1. Clone the repository to your local machine.
```bash
git clone https://github.com/your-username/password-strength-tool.git
```

2. Open `index.html` in any modern web browser.

3. Ensure you have an active internet connection if you wish to use the Have I Been Pwned breach check feature.

---
## 👨‍💻 Author

Shivam Kumar

---

## 📄 License

This project is open-source. Please check the individual library licenses (`zxcvbn`, `Chart.js`, `jsPDF`) for their respective usage terms.


