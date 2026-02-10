/*
This file was developed with assistance from ChatGPT (OpenAI).
All code has been reviewed and understood by the author.
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
  
  // Play button event
  document.getElementById('playBtn').addEventListener('click', () => {
    showNotification('Starting normal game...');
  });
  
  // Daily Challenge logic
  document.getElementById('dailyBtn').addEventListener('click', () => {
    const today = new Date().toDateString();
    const lastPlayed = localStorage.getItem('dailyChallengeDate');
  
    if (lastPlayed === today) {
      showNotification('You already played today’s challenge!', true);
    } else {
      localStorage.setItem('dailyChallengeDate', today);
      showNotification('Starting today’s special challenge!');
    }
  });
  