let score = 0;
let questionNumber = 0;
const TOTAL_QUESTIONS = 4;
let attemptsLeft = 4;
let correctAnswer = "";
let timeLeft = 10;
let maxTime = 10;
let timerInterval;
let gameActive = true;

// UTILITIES
function decodeHtml(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function shuffle(arr) {
  arr.sort(() => Math.random() - 0.5);
}

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

// CIRCULAR TIMER
function startTimer() {
  clearInterval(timerInterval);
  updateTimerUI();

  timerInterval = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      attemptsLeft--;
      updateStats();
      showFeedback(`⏰ Time's up! Correct: ${correctAnswer}`, false);
      playSound(wrongBeep);
      flashScreen('red');
      const buttons = document.querySelectorAll(".optionBtn");
      buttons.forEach(btn => btn.disabled = true);
      questionNumber++;
      if (questionNumber >= TOTAL_QUESTIONS || attemptsLeft <= 0) {
        setTimeout(showResults, 1500);
      } else {
        setTimeout(loadQuestion, 1500);
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
  const dashOffset = 251.2 * (1 - timeLeft / maxTime);
  progressCircle.style.strokeDashoffset = dashOffset;
  progressCircle.style.stroke = timeLeft <= 5 ? '#f00' : '#ffb000';
  timerText.textContent = timeLeft + 's';
}

// LOAD QUESTION
async function loadQuestion() {
  if (!gameActive) return;
  clearInterval(timerInterval);

  const buttons = document.querySelectorAll(".optionBtn");
  buttons.forEach(btn => {
    btn.disabled = false;
    btn.textContent = "";
  });

  document.getElementById("question").textContent = "Loading question...";
  document.getElementById("feedback").textContent = "";
  updateStats();

  try {
    const response = await fetch("http://localhost:3000/api/trivia?difficulty=medium&amount=1&type=multiple");
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      console.error("Trivia API returned no results:", data);
      showFeedback("Trivia question unavailable. Try again.", false);
      return;
    }

    const q = data.results[0];
    document.getElementById("question").textContent = decodeHtml(q.question);
    correctAnswer = q.correct_answer;

    const options = [...q.incorrect_answers, q.correct_answer];
    shuffle(options);

    buttons.forEach((btn, idx) => {
      btn.textContent = decodeHtml(options[idx]);
      btn.onclick = () => checkAnswer(options[idx]);
    });

    // Update difficulty badge (always medium for level 2)
    const badge = document.getElementById("difficultyBadge");
    badge.textContent = "MEDIUM";
    badge.className = "difficulty-badge medium";

    timeLeft = maxTime;
    startTimer();

  } catch (error) {
    console.error("Trivia API failed:", error);
    showFeedback("Trivia API failed. Please check your server.", false);
  }
}

// CHECK ANSWER
function checkAnswer(selected) {
  clearInterval(timerInterval);

  const buttons = document.querySelectorAll(".optionBtn");
  buttons.forEach(btn => btn.disabled = true);

  if (selected === correctAnswer) {
    score += 10;
    if (score > 30) score = 30;
    showFeedback("Correct!", true);
    playSound(correctBeep);
    flashScreen('green');
  } else {
    attemptsLeft--;
    showFeedback(`Wrong! Correct: ${correctAnswer}`, false);
    playSound(wrongBeep);
    flashScreen('red');
  }

  updateStats();
  questionNumber++;

  if (questionNumber >= TOTAL_QUESTIONS || attemptsLeft <= 0) {
    setTimeout(showResults, 1500);
  } else {
    setTimeout(loadQuestion, 1500);
  }
}

// ==========================
// END OF GAME / MODAL
// ==========================
function showResults() {
  gameActive = false;
  clearInterval(timerInterval);

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

// Unlock Level 3 if score is 30+
if (score >= 30) {
  localStorage.setItem("triviaLevel3Unlocked", "true"); // matches check in trivia-levels.js
  localStorage.setItem("triviaLevel2Completed", "true"); // optional: track completion
}

  document.getElementById("resultModal").classList.remove("hidden");
  sendTriviaScore();
}

// ==========================
// SAVE SCORE
// ==========================
async function sendTriviaScore() {
  const userId = localStorage.getItem("userId");
  if (!userId) return;
  try {
    await fetch("http://localhost:3000/api/saveScore/trivia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, score, level: 2 })
    });
    console.log("Trivia Level 2 score saved:", score);
  } catch (err) {
    console.error("Failed to save score:", err);
  }
}

// ==========================
// MODAL BUTTONS
// ==========================
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
  if (score === 30) localStorage.setItem("triviaLevel3Unlocked", "true");
  window.location.href = "trivia-levels.html";
};
document.getElementById("leaderboardBtn").onclick = () => {
  playSound(buttonSound);
  window.location.href = "leaderboard.html";
};

// ==========================
// START GAME
// ==========================
window.onload = () => {
  loadQuestion();
};