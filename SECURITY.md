# Security Policy

## 🔒 Supported Versions

The following versions of **SecurePass AI** are currently supported with security updates:

| Version | Supported |
|---------|------------|
| Latest Release | ✅ |
| Older Versions | ❌ |

Please ensure you are using the latest version of the project for the best security and stability.

---

## 🛡️ Reporting a Vulnerability

If you discover a security vulnerability in **SecurePass AI**, please report it responsibly.

### Please Do NOT:

- Open a public GitHub issue for security vulnerabilities
- Share exploit details publicly before a fix is available

---

## 📩 How to Report

Please include the following information in your report:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Screenshots or proof-of-concept (if applicable)
- Suggested fix (optional)

---

## ⚡ Response Process

Once a vulnerability is reported:

1. The issue will be reviewed and verified
2. A fix will be developed as quickly as possible
3. Security patches will be released
4. Responsible disclosure credit may be provided

---

## 🔐 Security Principles

SecurePass AI follows these core security principles:

### Local-First Security

All password analysis and entropy calculations are performed locally in the browser whenever possible.

---

### Privacy Protection

- Passwords are never stored
- Passwords are never logged
- Passwords are never transmitted to private servers

---

### K-Anonymity Breach Checking

For breach detection using the **Have I Been Pwned** API:

- Only the first 5 characters of the SHA-1 hash are sent
- The full password never leaves the device
- Raw passwords are never shared externally

---

### Secure Dependencies

The project uses trusted and widely adopted libraries such as:

- zxcvbn
- Chart.js
- jsPDF

Dependencies should be updated regularly to reduce security risks.

---

## 🧪 Recommended Security Practices

When contributing or deploying SecurePass AI:

- Keep dependencies updated
- Use HTTPS in production
- Avoid logging sensitive user input
- Validate all external API responses
- Test features across multiple browsers

---

## 🚨 Disclaimer

SecurePass AI is an educational and cybersecurity awareness tool. While it follows security best practices, no software can guarantee absolute protection.

Users are encouraged to:

- Use strong and unique passwords
- Enable multi-factor authentication (MFA)
- Regularly update credentials
- Monitor accounts for suspicious activity

---

## 🙌 Thank You

Thank you for helping make **SecurePass AI** safer for everyone.
