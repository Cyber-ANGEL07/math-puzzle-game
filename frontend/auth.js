const API_URL = "http://localhost:3000";

async function register() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  document.getElementById("authMessage").textContent =
    res.ok ? "Registered! Please login." : data.error;
}

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("username", data.username);
    window.location.href = "index.html";
  } else {
    document.getElementById("authMessage").textContent = data.error;
  }
}
