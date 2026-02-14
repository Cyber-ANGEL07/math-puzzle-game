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
  
  // Play button: start the game
  playBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
  
    if (!username) {
      alert("Please enter a username");
      return;
    }
  
    // Save username
    localStorage.setItem("banana_username", username);
    playerName.textContent = username;
  
    // Switch screens
    menuScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
  
    // Notification
    showNotification(`Welcome, ${username}! Game starting...`);
  
    // Start game logic
    startGame();
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
  