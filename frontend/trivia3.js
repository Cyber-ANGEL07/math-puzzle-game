// ==========================
// VARIABLES (HARD MODE)
// ==========================
let score = 0;
let questionNumber = 0;

const TOTAL_QUESTIONS = 4;
let attemptsLeft = 3;     // 🔥 harder (less attempts)

let correctAnswer = "";

let timeLeft = 7;         // 🔥 faster timer
const maxTime = 7;

let timerInterval;


// ==========================
// LOAD QUESTION
// ==========================
async function loadQuestion() {

  clearInterval(timerInterval);

  document.getElementById("question").textContent = "Loading question...";
  document.getElementById("feedback").textContent = "";

  document.getElementById("score").textContent =
    `Score: ${score} | Attempts: ${attemptsLeft}`;

  try {

    // ⭐ HARD difficulty
    const response = await fetch(
      "http://localhost:3000/api/trivia?difficulty=hard&amount=1&type=multiple"
    );

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      showFeedback("No question received.", false);
      return;
    }

    const q = data.results[0];

    document.getElementById("question").textContent =
      decodeHtml(q.question);

    correctAnswer = q.correct_answer;

    const options = [...q.incorrect_answers, q.correct_answer];
    shuffle(options);

    const buttons = document.querySelectorAll(".optionBtn");

    buttons.forEach((btn, index) => {
      btn.textContent = decodeHtml(options[index]);
      btn.disabled = false;
      btn.onclick = () => checkAnswer(options[index]);
    });

    startTimer();

  } catch (err) {
    console.error(err);
    showFeedback("Server error.", false);
  }
}


// ==========================
// CHECK ANSWER
// ==========================
function checkAnswer(selected) {

  clearInterval(timerInterval);

  document.querySelectorAll(".optionBtn")
    .forEach(btn => btn.disabled = true);

  if (selected === correctAnswer) {
    score += 10;
    showFeedback("✅ Correct!", true);
  } else {
    attemptsLeft--;
    showFeedback(`❌ Wrong! ${correctAnswer}`, false);
  }

  document.getElementById("score").textContent =
    `Score: ${score} | Attempts: ${attemptsLeft}`;

  questionNumber++;

  if (questionNumber >= TOTAL_QUESTIONS || attemptsLeft <= 0) {
    setTimeout(showResults, 1500);
  } else {
    setTimeout(loadQuestion, 1500);
  }
}


// ==========================
// TIMER
// ==========================
function startTimer() {

  timeLeft = maxTime;

  timerInterval = setInterval(() => {

    timeLeft--;
    updateTimerUI();

    if (timeLeft <= 0) {

      clearInterval(timerInterval);

      attemptsLeft--;

      document.getElementById("score").textContent =
        `Score: ${score} | Attempts: ${attemptsLeft}`;

      showFeedback(`⏰ Time's up! ${correctAnswer}`, false);

      questionNumber++;

      if (questionNumber >= TOTAL_QUESTIONS || attemptsLeft <= 0) {
        setTimeout(showResults, 1500);
      } else {
        setTimeout(loadQuestion, 1500);
      }
    }

  }, 1000);
}


// ==========================
// TIMER UI
// ==========================
function updateTimerUI() {

  document.getElementById("timer").textContent =
    `Time: ${timeLeft}s`;

  const percent = (timeLeft / maxTime) * 100;

  const bar = document.getElementById("timerBar");
  bar.style.width = percent + "%";

  bar.classList.toggle("panic", timeLeft <= 3);
}


// ==========================
// RESULTS
// ==========================
function showResults() {

  clearInterval(timerInterval);

  document.getElementById("finalScore").textContent =
    `Score: ${score}`;

  const stars = document.querySelectorAll(".star");
  stars.forEach(s => s.classList.remove("filled"));

  let starCount = 0;

  if (score >= 30) starCount = 3;
  else if (score >= 20) starCount = 2;
  else if (score >= 10) starCount = 1;

  for (let i = 0; i < starCount; i++) {
    stars[i].classList.add("filled");
  }

  document.getElementById("resultModal")
    .classList.remove("hidden");
}


// ==========================
// HELPERS
// ==========================
function showFeedback(msg, good) {
  const fb = document.getElementById("feedback");
  fb.textContent = msg;
  fb.style.color = good ? "limegreen" : "red";
}

function shuffle(arr) {
  arr.sort(() => Math.random() - 0.5);
}

function decodeHtml(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}


// ==========================
// MODAL BUTTONS
// ==========================
document.getElementById("retryBtn").onclick = () => location.reload();

document.getElementById("homeBtn").onclick =
  () => window.location.href = "trivia-levels.html";

document.getElementById("nextBtn").onclick =
  () => alert("🎉 You completed all trivia levels!");


// ==========================
// START GAME
// ==========================
window.onload = () => {
  document.getElementById("resultModal").classList.add("hidden");
  loadQuestion();
};