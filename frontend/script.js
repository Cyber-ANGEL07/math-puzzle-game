/*
  Banana Math Game JS
  Fully corrected version
  Handles menu, game UI, username, notifications, and daily challenge
*/

// Utility: notification system
function showNotification(message, isError = false) {
    const note = document.getElementById('notification');
    note.textContent = message;
    note.classList.remove('hidden', 'error');
  
    if (isError) {
      note.classList.add('error');
    }
  
    setTimeout(() => {
      note.classList.add('hidden');
    }, 3000);
  }
  
  // Grab DOM elements
  const playBtn = document.getElementById('playBtn');
  const usernameInput = document.getElementById('usernameInput');
  const menuScreen = document.getElementById('menuScreen');
  const gameScreen = document.getElementById('gameScreen');
  const playerName = document.getElementById('playerName');
  const dailyBtn = document.getElementById('dailyBtn');
  
  // Load saved username
  window.addEventListener('load', () => {
    const savedUser = localStorage.getItem("banana_username");
    if (savedUser) {
      usernameInput.value = savedUser;
    }
  });
  
  //Start the game
  playBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (!username) { alert("Enter username"); return; }
  
    // Ask user if they want to login or register
    const action = prompt("Type 'login' to login or 'register' to create a new account:").toLowerCase();
    if (action === "register") {
      register();
    } else if (action === "login") {
      login();
    } else {
      alert("Invalid choice. Type 'login' or 'register'.");
    }
  });
  
  
  // Daily Challenge logic
  dailyBtn.addEventListener('click', () => {
    const today = new Date().toDateString();
    const lastPlayed = localStorage.getItem('dailyChallengeDate');
  
    if (lastPlayed === today) {
      showNotification('You already played today’s challenge!', true);
    } else {
      localStorage.setItem('dailyChallengeDate', today);
      showNotification('Starting today’s special challenge!');
      // Optionally switch to a daily challenge mode
    }
  });
  
  // Placeholder for game logic
  function startGame() {
    console.log("Game started! Insert puzzle logic here.");
    // You can implement puzzle generation, score updates, etc.
  }

  // REGISTER
async function register() {
    const username = usernameInput.value.trim();
    const password = prompt("Enter a password for registration:");
    if (!username || !password) return alert("Username and password required");
  
    const res = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
  
    const data = await res.json();
    if (res.ok) {
      alert("Registered successfully! Please login.");
    } else {
      alert(data.error);
    }
  }
  
  // LOGIN
  async function login() {
    const username = usernameInput.value.trim();
    const password = prompt("Enter your password:");
    if (!username || !password) return alert("Username and password required");
  
    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
  
    const data = await res.json();
    if (res.ok) {
      // Save identity locally
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("username", data.username);
  
      // Switch screens
      menuScreen.classList.add('hidden');
      gameScreen.classList.remove('hidden');
  
      playerName.textContent = data.username;
      showNotification(`Welcome back, ${data.username}! Game starting...`);
  
      startGame();
    } else {
      alert(data.error);
    }
  }
  
  