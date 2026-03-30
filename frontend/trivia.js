let score = 0;
let questionNumber = 0;
const TOTAL_QUESTIONS = 3;
let attemptsLeft = 3;
let gameActive = true;
let triviaAnswer = "";
let timeLeft = 15;
let maxTime = 15;
let timerInterval = null;
let currentDifficulty = "easy";

// Helper to decode HTML entities
function decodeHtml(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

// Update the CRT‑style stats display
function updateStats() {
  document.getElementById("scoreValue").textContent = score;
  document.getElementById("attemptsValue").textContent = attemptsLeft;
}

function showFeedback(msg, isCorrect) {
  const feedbackEl = document.getElementById("feedback");
  feedbackEl.textContent = msg;
  feedbackEl.classList.remove("correct", "wrong");
  feedbackEl.classList.add(isCorrect ? "correct" : "wrong");
}

// ========== CIRCULAR TIMER ==========
function startTimer() {
  clearInterval(timerInterval);
  updateTimerUI();

  timerInterval = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      attemptsLeft--;
      showFeedback(`⏰ Time's up! Attempts left: ${attemptsLeft}`, false);
      updateStats();
      if (attemptsLeft > 0) {
        // Restart timer for same question
        timeLeft = maxTime;
        startTimer();
      } else {
        showFeedback(`⏰ No attempts left! Correct answer: ${triviaAnswer}`, false);
        nextOrEnd();
      }
    } else {
      timeLeft--;
      updateTimerUI();
      setStatic(timeLeft <= 5);
    }
  }, 1000);
}

function updateTimerUI() {
  const progressCircle = document.querySelector('.timer-progress');
  const timerText = document.querySelector('.timer-text');
  if (!progressCircle || !timerText) return;

  const totalTime = maxTime;
  const dashOffset = 251.2 * (1 - timeLeft / totalTime); // 251.2 = 2 * π * 40
  progressCircle.style.strokeDashoffset = dashOffset;
  progressCircle.style.stroke = timeLeft <= 5 ? '#f00' : '#ffb000';
  timerText.textContent = timeLeft + 's';
}
// =================================

function generateHint(answer) {
  if (!isNaN(answer)) {
    const num = Number(answer);
    return `Hint: The answer is between ${Math.max(0, num - 5)} and ${num + 5}`;
  } else {
    return `Hint: The answer starts with "${answer[0]}"`;
  }
}

async function loadTriviaQuestion() {
  if (!gameActive) return;

  const guessBtn = document.getElementById("guessBtn");
  guessBtn.disabled = true;

  clearInterval(timerInterval);
  attemptsLeft = 3;
  updateStats();

  try {
    const response = await fetch("http://localhost:3000/api/trivia?difficulty=easy");
    if (!response.ok) {
      console.log("Trivia API temporary failure. Retrying...");
      setTimeout(loadTriviaQuestion, 2000);
      return;
    }
    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      setTimeout(loadTriviaQuestion, 2000);
      return;
    }

    triviaAnswer = data.results[0].correct_answer;
    const question = data.results[0].question;
    const category = data.results[0].category;
    currentDifficulty = data.results[0].difficulty.toLowerCase();

    // Set timer based on difficulty
    switch (currentDifficulty) {
      case "easy":   maxTime = 15; break;
      case "medium": maxTime = 10; break;
      case "hard":   maxTime = 7;  break;
      default:       maxTime = 15;
    }
    timeLeft = maxTime;

    // Update difficulty badge
    const badge = document.getElementById("difficultyBadge");
    badge.textContent = currentDifficulty.toUpperCase();
    badge.className = "difficulty-badge " + currentDifficulty;

    document.getElementById("triviaQuestion").textContent = decodeHtml(question);
    document.getElementById("hint").textContent = ""; // clear hint – will be shown on wrong attempts
    document.getElementById("guessInput").value = "";

    guessBtn.disabled = false;
    updateTimerUI();
    startTimer();

  } catch (error) {
    console.error(error);
    showFeedback("⏳ Loading next question… please wait", false);
    guessBtn.disabled = true;
    setTimeout(() => {
      loadTriviaQuestion();
      guessBtn.disabled = false;
    }, 2000);
  }
}

function checkAnswer() {
  if (!gameActive) return;

  const userAnswer = document.getElementById("guessInput").value.trim();
  if (!userAnswer) {
    alert("Please enter your answer!");
    return;
  }

  clearInterval(timerInterval);

  if (userAnswer.toLowerCase() === triviaAnswer.toLowerCase()) {
    score += 10;
    if (score > 30) score = 30;
    showFeedback("✅ Correct! +10 points", true);
    playSound(correctBeep);
    flashScreen('green');
    updateStats();
    nextOrEnd();
  } else {
    attemptsLeft--;
    updateStats();
    if (attemptsLeft > 0) {
      const hintMessage = (attemptsLeft === 2) ? generateHint(triviaAnswer) : "";
      showFeedback(`❌ Wrong! Attempts left: ${attemptsLeft}\n${hintMessage}`, false);
      playSound(wrongBeep);
      flashScreen('red');
      // Restart timer for same question
      timeLeft = maxTime;
      startTimer();
    } else {
      showFeedback(`💀 No attempts left! Correct answer: ${triviaAnswer}`, false);
      playSound(wrongBeep);
      flashScreen('red');
      nextOrEnd();
    }
  }
  document.getElementById("guessInput").value = "";
}

function nextOrEnd() {
  questionNumber++;
  if (questionNumber >= TOTAL_QUESTIONS) {
    showResults();
  } else {
    loadTriviaQuestion();
  }
}

function showResults() {
  clearInterval(timerInterval);
  gameActive = false;

  document.getElementById("finalScore").textContent = `Score: ${score}`;
  const stars = document.querySelectorAll("#stars .star");
  stars.forEach(star => star.classList.remove("filled", "pop"));
  let starCount = 0;
  if (score >= 30) starCount = 3;
  else if (score >= 20) starCount = 2;
  else if (score >= 10) starCount = 1;
  for (let i = 0; i < starCount; i++) {
    setTimeout(() => {
      stars[i].classList.add("pop", "filled");
      playSound(starSound);
    }, i * 350);
  }

  // Unlock level 2 if perfect score
  if (score === 30) {
    localStorage.setItem("triviaLevel2Unlocked", "true");
  }

  document.getElementById("resultModal").classList.remove("hidden");
  sendTriviaScore();
}

async function sendTriviaScore() {
  const userId = localStorage.getItem("userId");
  if (!userId) return;
  try {
    await fetch("http://localhost:3000/api/saveScore/trivia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, score, level: 1 })
    });
    console.log("Trivia score sent to server:", score);
  } catch (err) {
    console.error("Failed to send trivia score:", err);
  }
}

// ========== BUTTON EVENT LISTENERS ==========
document.getElementById("guessBtn").addEventListener("click", () => {
  playSound(clickSound);
  checkAnswer();
});
document.getElementById("retryBtn").onclick = () => {
  playSound(buttonSound);
  location.reload();
};
document.getElementById("homeBtn").onclick = () => {
  playSound(buttonSound);
  window.location.href = "index.html";
};
document.getElementById("nextBtn").onclick = () => {
  playSound(buttonSound);
  if (score === 30) localStorage.setItem("triviaLevel1Completed", "true");
  window.location.href = "trivia-levels.html";
};
document.getElementById("leaderboardBtn").onclick = () => {
  playSound(buttonSound);
  window.location.href = "leaderboard.html";
};

// ========== START GAME ==========
window.onload = () => {
  loadTriviaQuestion();
};