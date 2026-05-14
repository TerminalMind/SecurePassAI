"use strict";

/**
 * Password Strength Testing Tool
 * Frontend: HTML5, Tailwind CSS, JavaScript ES6+
 * Engine: zxcvbn + custom regex/security checks
 * Added: Have I Been Pwned breached-password check
 * Added: Dark/light theme switch
 */

document.addEventListener("DOMContentLoaded", () => {
  const passwordInput = document.getElementById("passwordInput");
  const togglePasswordBtn = document.getElementById("togglePasswordBtn");
  const generatePasswordBtn = document.getElementById("generatePasswordBtn");
  const themeToggleBtn = document.getElementById("themeToggleBtn");

  const strengthBar = document.getElementById("strengthBar");
  const scoreText = document.getElementById("scoreText");
  const strengthLabel = document.getElementById("strengthLabel");
  const strengthSummary = document.getElementById("strengthSummary");

  const lengthValue = document.getElementById("lengthValue");
  const entropyValue = document.getElementById("entropyValue");
  const zxcvbnScoreValue = document.getElementById("zxcvbnScoreValue");

  const onlineCrackTime = document.getElementById("onlineCrackTime");
  const offlineCrackTime = document.getElementById("offlineCrackTime");

  const checksList = document.getElementById("checksList");
  const suggestionsList = document.getElementById("suggestionsList");

  const breachCard = document.getElementById("breachCard");
  const breachStatus = document.getElementById("breachStatus");
  const breachCheckToggle = document.getElementById("breachCheckToggle");

  // Advanced Feature DOM Elements
  const generatePassphraseBtn = document.getElementById("generatePassphraseBtn");
  const generateAiPasswordBtn = document.getElementById("generateAiPasswordBtn");
  const passwordPurpose = document.getElementById("passwordPurpose");
  const downloadPdfBtn = document.getElementById("downloadPdfBtn");
  const mfaAdvice = document.getElementById("mfaAdvice");
  const dictionaryAttackTime = document.getElementById("dictionaryAttackTime");
  const gpuAttackTime = document.getElementById("gpuAttackTime");
  const quantumAttackTime = document.getElementById("quantumAttackTime");
  const languageSelector = document.getElementById("languageSelector");

  let breachTimer = null;
  let breachRequestId = 0;

  // Entropy Chart Initialization
  const entropyCtx = document.getElementById("entropyChart");
  const entropyChart = new Chart(entropyCtx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Entropy",
          data: [],
          borderWidth: 3,
          tension: 0.4
        },
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  const strengthLevels = [
    {
      label: "Very Weak",
      colorClass: "bg-red-500",
      textClass: "text-red-500 dark:text-red-400",
      summary: "This password is highly vulnerable and should not be used."
    },
    {
      label: "Weak",
      colorClass: "bg-orange-500",
      textClass: "text-orange-500 dark:text-orange-400",
      summary: "This password has several weaknesses and may be easy to guess or crack."
    },
    {
      label: "Fair",
      colorClass: "bg-yellow-500",
      textClass: "text-yellow-500 dark:text-yellow-400",
      summary: "This password is better, but it still needs improvement for important accounts."
    },
    {
      label: "Strong",
      colorClass: "bg-green-500",
      textClass: "text-green-600 dark:text-green-400",
      summary: "This password is strong against many common attacks."
    },
    {
      label: "Very Strong",
      colorClass: "bg-sky-400",
      textClass: "text-sky-600 dark:text-sky-300",
      summary: "This password is very strong, especially if it is unique and stored safely."
    }
  ];

  const riskyCommonPasswords = new Set([
    "password", "password1", "password123", "123456", "12345678",
    "123456789", "qwerty", "qwerty123", "admin", "admin123",
    "letmein", "welcome", "iloveyou", "abc123", "111111", "000000"
  ]);

  const keyboardPatterns = [
    "qwerty", "asdf", "zxcv", "qaz", "wsx", "1234", "2345", 
    "3456", "4567", "5678", "6789"
  ];

  // Translation Support Map
  const translations = {
    en: {
      mfa: "Enable MFA for additional protection.",
      strong: "Strong Password",
      weak: "Weak Password"
    },
    hi: {
      mfa: "अतिरिक्त सुरक्षा के लिए MFA सक्षम करें।",
      strong: "मजबूत पासवर्ड",
      weak: "कमजोर पासवर्ड"
    },
    es: {
      mfa: "Habilita MFA para mayor seguridad.",
      strong: "Contraseña fuerte",
      weak: "Contraseña débil"
    }
  };

  initializeTheme();

  themeToggleBtn.addEventListener("click", toggleTheme);

  togglePasswordBtn.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    togglePasswordBtn.textContent = isHidden ? "Hide" : "Show";
  });

  passwordInput.addEventListener("input", () => {
    analyzePassword(passwordInput.value);
    scheduleBreachCheck(passwordInput.value);
  });

  breachCheckToggle.addEventListener("change", () => {
    if (breachCheckToggle.checked) {
      scheduleBreachCheck(passwordInput.value);
    } else {
      clearBreachCheck();
      setBreachStatus("Breached-password checking is disabled.", "neutral");
    }
  });

  generatePasswordBtn.addEventListener("click", () => {
    const generatedPassword = generateSecurePassword(18);
    passwordInput.value = generatedPassword;
    passwordInput.type = "text";
    togglePasswordBtn.textContent = "Hide";
    analyzePassword(generatedPassword);
    scheduleBreachCheck(generatedPassword);
  });

  // Advanced Feature Listeners
  generatePassphraseBtn?.addEventListener("click", () => {
    const passphrase = generatePassphrase();
    passwordInput.value = passphrase;
    passwordInput.type = "text";
    togglePasswordBtn.textContent = "Hide";
    analyzePassword(passphrase);
    scheduleBreachCheck(passphrase);
  });

  generateAiPasswordBtn?.addEventListener("click", () => {
    const type = passwordPurpose.value;
    const generated = generateAiPassword(type);
    passwordInput.value = generated;
    passwordInput.type = "text";
    togglePasswordBtn.textContent = "Hide";
    analyzePassword(generated);
    scheduleBreachCheck(generated);
  });

  languageSelector?.addEventListener("change", () => {
    const lang = languageSelector.value;
    if (translations[lang]) {
      mfaAdvice.textContent = translations[lang].mfa;
    }
  });

  downloadPdfBtn?.addEventListener("click", downloadSecurityReport);

  function initializeTheme() {
    const isDark = document.documentElement.classList.contains("dark");
    themeToggleBtn.textContent = isDark ? "Light Mode" : "Dark Mode";
  }

  function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    themeToggleBtn.textContent = isDark ? "Light Mode" : "Dark Mode";
  }

  function analyzePassword(password) {
    if (!password) {
      resetUI();
      return;
    }

    const zxcvbnResult = runZxcvbn(password);
    const customAnalysis = runCustomAnalysis(password);

    const adjustedScore = calculateAdjustedScore(
      zxcvbnResult.score,
      customAnalysis.penalty
    );

    const level = strengthLevels[adjustedScore];

    updateStrengthMeter(adjustedScore, level);
    updateMainResult(password, zxcvbnResult, customAnalysis, adjustedScore, level);
    updateChecks(customAnalysis.checks);
    updateSuggestions(zxcvbnResult, customAnalysis.suggestions, adjustedScore);

    // Update Entropy Visualization Graph
    entropyChart.data.labels.push(password.length);
    entropyChart.data.datasets[0].data.push(customAnalysis.entropy);
    entropyChart.update();

    // MFA Advisor logic
    if (adjustedScore <= 2) {
      mfaAdvice.textContent = "Critical Recommendation: Enable MFA immediately.";
    } else {
      mfaAdvice.textContent = "Password is strong, but MFA is still recommended.";
    }

    // Trigger attack simulation calculations
    simulateAttacks(adjustedScore);
  }

  function runZxcvbn(password) {
    if (typeof zxcvbn === "function") {
      return zxcvbn(password);
    }
    const entropy = calculateEntropy(password);
    let score = 0;
    if (entropy >= 80) score = 4;
    else if (entropy >= 60) score = 3;
    else if (entropy >= 40) score = 2;
    else if (entropy >= 25) score = 1;

    return {
      score,
      feedback: {
        warning: "zxcvbn could not be loaded. Fallback scoring is being used.",
        suggestions: ["Check your internet connection or self-host the zxcvbn library."]
      },
      crack_times_display: {
        online_throttling_100_per_hour: "Unknown",
        offline_fast_hashing_1e10_per_second: "Unknown"
      }
    };
  }

  function runCustomAnalysis(password) {
    const checks = [];
    const suggestions = [];
    let penalty = 0;

    const lowerPassword = password.toLowerCase();

    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    const hasRepeatedCharacters = /(.)\1{2,}/.test(password);
    const hasSequentialNumbers = /(012|123|234|345|456|567|678|789)/.test(password);
    const hasSequentialLetters =
      /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password);

    const hasKeyboardPattern = keyboardPatterns.some((pattern) =>
      lowerPassword.includes(pattern)
    );

    const containsYear = /(19\d{2}|20\d{2})/.test(password);
    const isCommonPassword = riskyCommonPasswords.has(lowerPassword);

    if (password.length >= 12) {
      checks.push(pass("Password length is at least 12 characters."));
    } else {
      checks.push(fail("Password is shorter than the recommended 12 characters."));
      suggestions.push("Use at least 12 characters. For high-value accounts, use 16 or more.");
      penalty += 1;
    }

    if (password.length >= 16) {
      checks.push(pass("Password length is excellent for stronger protection."));
    } else {
      suggestions.push("Consider using 16 or more characters for better resistance to cracking.");
    }

    if (hasLowercase && hasUppercase) {
      checks.push(pass("Uses both uppercase and lowercase letters."));
    } else {
      checks.push(fail("Does not use both uppercase and lowercase letters."));
      suggestions.push("Mix uppercase and lowercase letters.");
      penalty += 1;
    }

    if (hasNumber) {
      checks.push(pass("Includes at least one number."));
    } else {
      checks.push(fail("Does not include numbers."));
      suggestions.push("Add numbers, but avoid obvious sequences like 123 or 2024.");
    }

    if (hasSpecial) {
      checks.push(pass("Includes at least one special character."));
    } else {
      checks.push(fail("Does not include special characters."));
      suggestions.push("Add symbols such as @, #, $, %, &, !, or ?.");
    }

    if (isCommonPassword) {
      checks.push(fail("Password appears in a common password list."));
      suggestions.push("Avoid common passwords such as password, qwerty, admin, or 123456.");
      penalty += 2;
    } else {
      checks.push(pass("Password is not in the small built-in common password list."));
    }

    if (hasRepeatedCharacters) {
      checks.push(fail("Contains repeated characters, such as aaa or 111."));
      suggestions.push("Avoid repeated characters and predictable repetition.");
      penalty += 1;
    } else {
      checks.push(pass("No obvious repeated-character pattern detected."));
    }

    if (hasSequentialNumbers || hasSequentialLetters || hasKeyboardPattern) {
      checks.push(fail("Contains sequential or keyboard patterns."));
      suggestions.push("Avoid patterns like qwerty, abcd, 1234, or keyboard walks.");
      penalty += 1;
    } else {
      checks.push(pass("No obvious sequential or keyboard pattern detected."));
    }

    if (containsYear) {
      checks.push(fail("Contains a year-like value, which may be easy to guess."));
      suggestions.push("Avoid birth years, anniversaries, current years, or other personal dates.");
      penalty += 1;
    }

    return {
      checks,
      suggestions,
      penalty,
      entropy: calculateEntropy(password)
    };
  }

  function calculateAdjustedScore(zxcvbnScore, penalty) {
    const adjusted = zxcvbnScore - Math.min(penalty, 3);
    return Math.max(0, Math.min(4, adjusted));
  }

  function calculateEntropy(password) {
    let charsetSize = 0;

    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/\d/.test(password)) charsetSize += 10;
    if (/[^A-Za-z0-9]/.test(password)) charsetSize += 33;

    if (charsetSize === 0) return 0;

    return password.length * Math.log2(charsetSize);
  }

  function updateStrengthMeter(score, level) {
    const percentage = ((score + 1) / 5) * 100;
    strengthBar.className = `h-full rounded-full transition-all duration-300 ${level.colorClass}`;
    strengthBar.style.width = `${percentage}%`;
    scoreText.textContent = `${score} / 4`;
  }

  function updateMainResult(password, zxcvbnResult, customAnalysis, adjustedScore, level) {
    strengthLabel.className = `text-2xl font-bold ${level.textClass}`;
    strengthLabel.textContent = `Strength: ${level.label}`;
    strengthSummary.textContent = level.summary;
    lengthValue.textContent = password.length;
    entropyValue.textContent = `${customAnalysis.entropy.toFixed(1)} bits`;
    zxcvbnScoreValue.textContent = `${adjustedScore} / 4`;

    onlineCrackTime.textContent =
      zxcvbnResult.crack_times_display?.online_throttling_100_per_hour || "N/A";

    offlineCrackTime.textContent =
      zxcvbnResult.crack_times_display?.offline_fast_hashing_1e10_per_second || "N/A";
  }

  function updateChecks(checks) {
    checksList.innerHTML = "";
    checks.forEach((check) => {
      const item = document.createElement("li");
      item.className = check.ok
        ? "flex gap-2 text-green-600 dark:text-green-400"
        : "flex gap-2 text-red-600 dark:text-red-400";
      item.innerHTML = `
        <span aria-hidden="true">${check.ok ? "✓" : "✕"}</span>
        <span>${escapeHTML(check.message)}</span>
      `;
      checksList.appendChild(item);
    });
  }

  function updateSuggestions(zxcvbnResult, customSuggestions, adjustedScore) {
    suggestionsList.innerHTML = "";
    const suggestions = [];

    if (zxcvbnResult.feedback?.warning) {
      suggestions.push(zxcvbnResult.feedback.warning);
    }
    if (Array.isArray(zxcvbnResult.feedback?.suggestions)) {
      suggestions.push(...zxcvbnResult.feedback.suggestions);
    }
    suggestions.push(...customSuggestions);

    if (adjustedScore >= 4) {
      suggestions.push("Excellent password. Make sure it is unique and stored in a password manager.");
      suggestions.push("Enable multi-factor authentication for important accounts.");
    }

    renderSuggestions(suggestions);
  }

  function renderSuggestions(suggestions) {
    suggestionsList.innerHTML = "";
    const uniqueSuggestions = [...new Set(suggestions)].filter(Boolean);

    if (uniqueSuggestions.length === 0) {
      uniqueSuggestions.push("No major weaknesses detected. Use a unique password for every account.");
    }

    uniqueSuggestions.forEach((suggestion) => {
      const item = document.createElement("li");
      item.className = "flex gap-2 text-slate-700 dark:text-slate-300";
      item.innerHTML = `
        <span class="text-sky-600 dark:text-sky-300" aria-hidden="true">•</span>
        <span>${escapeHTML(suggestion)}</span>
      `;
      suggestionsList.appendChild(item);
    });
  }

  function scheduleBreachCheck(password) {
    clearTimeout(breachTimer);
    breachRequestId += 1;
    const requestId = breachRequestId;

    if (!breachCheckToggle.checked) {
      setBreachStatus("Breached-password checking is disabled.", "neutral");
      return;
    }

    if (!password) {
      clearBreachCheck();
      return;
    }

    setBreachStatus("Waiting to check breach database...", "neutral");
    breachTimer = setTimeout(() => {
      checkPasswordAgainstHIBP(password, requestId);
    }, 700);
  }

  async function checkPasswordAgainstHIBP(password, requestId) {
    try {
      setBreachStatus("Checking Have I Been Pwned database...", "neutral");
      const breachCount = await getPwnedPasswordCount(password);

      if (requestId !== breachRequestId || password !== passwordInput.value) {
        return;
      }

      if (breachCount > 0) {
        setBreachStatus(
          `Warning: this password appears in known data breaches ${breachCount.toLocaleString()} time(s). Do not use it.`,
          "danger"
        );
        markPasswordAsCompromised(breachCount);
      } else {
        setBreachStatus(
          "Good news: this password was not found in the Have I Been Pwned breached-password database.",
          "success"
        );
      }
    } catch (error) {
      if (requestId !== breachRequestId) return;
      console.error(error);
      setBreachStatus(
        "Could not complete the breach check. Check your internet connection or try again later.",
        "warning"
      );
    }
  }

  async function getPwnedPasswordCount(password) {
    const sha1Hash = await sha1(password);
    const prefix = sha1Hash.slice(0, 5);
    const suffix = sha1Hash.slice(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!response.ok) {
      throw new Error("HIBP API request failed.");
    }

    const text = await response.text();
    const lines = text.split(/\r?\n/);

    for (const line of lines) {
      const [hashSuffix, count] = line.trim().split(":");
      if (hashSuffix === suffix) {
        return Number(count);
      }
    }
    return 0;
  }

  async function sha1(value) {
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
  }

  function markPasswordAsCompromised(breachCount) {
    strengthBar.className = "h-full rounded-full transition-all duration-300 bg-red-500";
    strengthBar.style.width = "100%";
    scoreText.textContent = "Compromised";
    strengthLabel.className = "text-2xl font-bold text-red-600 dark:text-red-400";
    strengthLabel.textContent = "Strength: Compromised";
    strengthSummary.textContent =
      `This password has appeared in known breaches ${breachCount.toLocaleString()} time(s). Treat it as unsafe, even if it looks complex.`;

    const warning = document.createElement("li");
    warning.className = "flex gap-2 text-red-600 dark:text-red-400";
    warning.innerHTML = `
      <span aria-hidden="true">!</span>
      <span>Immediately choose a different password that has never been used before.</span>
    `;
    suggestionsList.prepend(warning);
  }

  function setBreachStatus(message, type) {
    breachStatus.textContent = message;
    breachCard.className =
      "mt-6 rounded-2xl border bg-white p-5 transition-colors dark:bg-slate-950";

    if (type === "danger") {
      breachCard.classList.add("border-red-400", "bg-red-50", "dark:border-red-500/60", "dark:bg-red-950/30");
      breachStatus.className = "mt-2 text-sm font-semibold text-red-700 dark:text-red-300";
    } else if (type === "success") {
      breachCard.classList.add("border-green-400", "bg-green-50", "dark:border-green-500/60", "dark:bg-green-950/30");
      breachStatus.className = "mt-2 text-sm font-semibold text-green-700 dark:text-green-300";
    } else if (type === "warning") {
      breachCard.classList.add("border-yellow-400", "bg-yellow-50", "dark:border-yellow-500/60", "dark:bg-yellow-950/30");
      breachStatus.className = "mt-2 text-sm font-semibold text-yellow-700 dark:text-yellow-300";
    } else {
      breachCard.classList.add("border-slate-300", "dark:border-slate-700");
      breachStatus.className = "mt-2 text-sm text-slate-600 dark:text-slate-400";
    }
  }

  function clearBreachCheck() {
    clearTimeout(breachTimer);
    breachRequestId += 1;
    setBreachStatus("Enter a password to check whether it appears in known breaches.", "neutral");
  }

  function generateSecurePassword(length = 18) {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()-_=+[]{};:,.?/|~";
    const allCharacters = lowercase + uppercase + numbers + symbols;

    const requiredCharacters = [
      getRandomCharacter(lowercase),
      getRandomCharacter(uppercase),
      getRandomCharacter(numbers),
      getRandomCharacter(symbols)
    ];

    const remainingCharacters = Array.from(
      { length: length - requiredCharacters.length },
      () => getRandomCharacter(allCharacters)
    );

    const passwordArray = [...requiredCharacters, ...remainingCharacters];
    return shuffleArray(passwordArray).join("");
  }

  // Advanced Support Functions
  function generatePassphrase() {
    const words = [
      "river", "falcon", "shadow", "quantum", "matrix",
      "secure", "cipher", "phoenix", "nebula", "hunter",
      "storm", "guardian"
    ];
    const selected = [];
    for (let i = 0; i < 4; i++) {
      selected.push(words[Math.floor(Math.random() * words.length)]);
    }
    const number = Math.floor(Math.random() * 9999);
    return `${selected.join("-")}-${number}`;
  }

  function generateAiPassword(type) {
    const templates = {
      banking: "Bank$Vault#",
      gaming: "GameX!Power#",
      work: "WorkSecure@",
      social: "SocialSphere#",
      general: "SecurePass@"
    };
    const base = templates[type] || templates.general;
    const random = Math.floor(Math.random() * 99999);
    return `${base}${random}`;
  }

  function simulateAttacks(score) {
    if (score <= 1) {
      dictionaryAttackTime.textContent = "Seconds";
      gpuAttackTime.textContent = "Minutes";
      quantumAttackTime.textContent = "Instant";
    } else if (score <= 3) {
      dictionaryAttackTime.textContent = "Days";
      gpuAttackTime.textContent = "Hours";
      quantumAttackTime.textContent = "Minutes";
    } else {
      dictionaryAttackTime.textContent = "Centuries";
      gpuAttackTime.textContent = "Years";
      quantumAttackTime.textContent = "Days";
    }
  }

  async function downloadSecurityReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("SecurePass AI Security Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`Password Length: ${lengthValue.textContent}`, 20, 50);
    doc.text(`Entropy: ${entropyValue.textContent}`, 20, 60);
    doc.text(`Score: ${zxcvbnScoreValue.textContent}`, 20, 70);
    doc.text(`Strength: ${strengthLabel.textContent}`, 20, 80);
    doc.text(`Breach Status: ${breachStatus.textContent}`, 20, 90);
    doc.text(`MFA Advice: ${mfaAdvice.textContent}`, 20, 100);
    doc.save("securepass-report.pdf");
  }

  function getRandomCharacter(characters) {
    const randomValues = new Uint32Array(1);
    crypto.getRandomValues(randomValues);
    return characters[randomValues[0] % characters.length];
  }

  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const randomValues = new Uint32Array(1);
      crypto.getRandomValues(randomValues);
      const j = randomValues[0] % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function pass(message) {
    return { ok: true, message };
  }

  function fail(message) {
    return { ok: false, message };
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function resetUI() {
    strengthBar.className = "h-full w-0 rounded-full transition-all duration-300";
    strengthBar.style.width = "0%";
    scoreText.textContent = "Not tested";
    strengthLabel.className = "text-2xl font-bold text-slate-700 dark:text-slate-300";
    strengthLabel.textContent = "Strength: Not Tested";
    strengthSummary.textContent = "Start typing a password to receive an analysis.";

    lengthValue.textContent = "0";
    entropyValue.textContent = "0 bits";
    zxcvbnScoreValue.textContent = "0 / 4";

    onlineCrackTime.textContent = "N/A";
    offlineCrackTime.textContent = "N/A";

    checksList.innerHTML = `<li class="text-slate-500 dark:text-slate-400">No password entered yet.</li>`;
    suggestionsList.innerHTML = `<li class="text-slate-500 dark:text-slate-400">Suggestions will appear here.</li>`;

    clearBreachCheck();
  }

  resetUI();
});

// Progressive Web App Setup
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js")
      .then(() => {
        console.log("Service Worker Registered");
      })
      .catch((error) => {
        console.error(error);
      });
  });
}