const API_URL = "http://localhost:3000";

async function register() {

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const phone = document.getElementById("phone").value.trim();

  if (!username || !password || !phone) {
    document.getElementById("authMessage").textContent = "All fields are required";
    return;
  }

  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, phone })
  });

  const data = await res.json();
  document.getElementById("authMessage").textContent =
    res.ok ? "Registered! Redirecting to login..." : data.error;

  if (res.ok) {
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  }
}
