const API_URL = "http://localhost:3000";

function isStrongPassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
  return regex.test(password);
}

// register.js

const passwordInput = document.getElementById("password");
const passwordFeedback = document.getElementById("passwordFeedback");

function checkPasswordStrength(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
  return regex.test(password);
}

// Live feedback as user types
passwordInput.addEventListener("input", () => {
  const pwd = passwordInput.value;
  
  if (!pwd) {
    passwordFeedback.textContent = "";
    passwordFeedback.classList.remove("strong");
    return;
  }

  if (checkPasswordStrength(pwd)) {
    passwordFeedback.textContent = "Strong password ✅";
    passwordFeedback.classList.add("strong");
  } else {
    passwordFeedback.textContent = 
      "Use 8+ chars with uppercase, lowercase, number & symbol";
    passwordFeedback.classList.remove("strong");
  }
});

// Phone number validation (9 or 10 digits)
const phoneInput = document.getElementById("phone");
const phoneFeedback = document.getElementById("phoneFeedback");

function isValidPhone(phone) {
  const phoneRegex = /^\d{9,10}$/; // exactly 9 or 10 digits
  return phoneRegex.test(phone);
}

phoneInput.addEventListener("input", () => {
  const phone = phoneInput.value.trim();
  if (!phone) {
    phoneFeedback.textContent = "";
    phoneFeedback.classList.remove("strong");
    return;
  }
  if (isValidPhone(phone)) {
    phoneFeedback.textContent = "Valid phone number ✅";
    phoneFeedback.classList.add("strong");
  } else {
    phoneFeedback.textContent = "Phone number must be 9 or 10 digits (numbers only)";
    phoneFeedback.classList.remove("strong");
  }
});

async function register() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const phone = document.getElementById("phone").value.trim();

  if (!username || !password || !phone) {
    document.getElementById("authMessage").textContent = "All fields are required";
    return;
  }

  if (!isStrongPassword(password)) {
    passwordFeedback.textContent = "Password does not meet requirements!";
    return;
  }

  if (!isValidPhone(phone)) {
    phoneFeedback.textContent = "Phone number must be 9 or 10 digits!";
    return;
  }

  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, phone })
  });

  const data = await res.json();
  const msgEl = document.getElementById("authMessage");
  msgEl.textContent = res.ok ? "Registered! Redirecting to login..." : data.error;

  if (res.ok) {
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  }
}
