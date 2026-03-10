// ==========================
// VARIABLES
// ==========================
let score = 0;
let questionNumber = 0;
const TOTAL_QUESTIONS = 4;       // total questions in level 2
let attemptsLeft = 4;             // ✅ Step 1: 5 attempts
let correctAnswer = "";
let timeLeft = 10;                // seconds per question
const maxTime = 10;               
let timerInterval;

// ==========================
// LOAD QUESTION
// ==========================
async function loadQuestion() {
  clearInterval(timerInterval);

  document.getElementById("question").textContent = "Loading question...";
document.getElementById("feedback").textContent = "";

  document.getElementById("score").textContent = `Score: ${score} | Attempts: ${attemptsLeft}`;

  try {
    const response = await fetch("http://localhost:3000/api/trivia?difficulty=medium&amount=1&type=multiple");
    const data = await response.json();

// ✅ SAFETY CHECK
    if (!data.results || data.results.length === 0) {
        console.error("Trivia API returned no results:", data);
        showFeedback("Trivia question unavailable. Try refreshing.", false);
        return;  // stop execution so JS doesn't crash
    }

    const q = data.results[0];  // safe now
    document.getElementById("question").textContent = decodeHtml(q.question);

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
  } catch (error) {
    console.error("Trivia API failed:", error);   // ✅ log real error
    showFeedback("Trivia API failed. Please check your server.", false);
  }
}

// ==========================
// CHECK ANSWER
// ==========================
function checkAnswer(selected) {

  clearInterval(timerInterval); // stop timer on click

  const buttons = document.querySelectorAll(".optionBtn");
  buttons.forEach(btn => btn.disabled = true); // ✅ Step 3: disable buttons

  if(selected === correctAnswer){
    score += 10; // ✅ add score
    showFeedback("✅ Correct!", true);
  } else {
    attemptsLeft--; // ✅ remove an attempt for wrong answer
    showFeedback(`❌ Wrong! Correct: ${correctAnswer}`, false);
  }

  // ✅ Step 1: update score & attempts UI after answer
  document.getElementById("score").textContent = `Score: ${score} | Attempts: ${attemptsLeft}`;

  questionNumber++;

  // Check if game is over
  if(questionNumber >= TOTAL_QUESTIONS || attemptsLeft <= 0){
    setTimeout(showResults, 1500); // show modal after 1.5s
  } else {
    setTimeout(loadQuestion, 1500); // load next question
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

    if(timeLeft <= 0){

      clearInterval(timerInterval);
      attemptsLeft--; // ✅ lose attempt if time runs out

      // ✅ Step 1: update score & attempts UI after timeout
      document.getElementById("score").textContent = `Score: ${score} | Attempts: ${attemptsLeft}`;

      showFeedback(`⏰ Time's up! Correct: ${correctAnswer}`, false);

      const buttons = document.querySelectorAll(".optionBtn");
      buttons.forEach(btn => btn.disabled = true);

      questionNumber++;

      if(questionNumber >= TOTAL_QUESTIONS || attemptsLeft <= 0){
        setTimeout(showResults, 1500);
      } else {
        setTimeout(loadQuestion, 1500);
      }
    }
  }, 1000);
}

// ==========================
// UPDATE TIMER BAR
// ==========================
function updateTimerUI() {
  document.getElementById("timer").textContent = `Time: ${timeLeft}s`;

  const percent = (timeLeft / maxTime) * 100;
  document.getElementById("timerBar").style.width = percent + "%";

  if(timeLeft <= 5) {
    document.getElementById("timerBar").classList.add("panic");
  } else {
    document.getElementById("timerBar").classList.remove("panic");
  }
}

// ==========================
// FEEDBACK
// ==========================
function showFeedback(msg, correct) {
  const fb = document.getElementById("feedback");
  fb.textContent = msg;
  fb.style.color = correct ? "green" : "red";
}

// ==========================
// END OF GAME / MODAL
// ==========================
function showResults() {

  clearInterval(timerInterval); // stop any running timer

  const buttons = document.querySelectorAll(".optionBtn");
  buttons.forEach(btn => btn.disabled = true); // disable all buttons

  document.getElementById("questionContainer").style.display = "block"; 
// add a wrapper div around question + options in HTML

  document.getElementById("finalScore").textContent = `Score: ${score}`;

  document.getElementById("resultModal").classList.remove("hidden");

  const stars = document.querySelectorAll(".star");
  stars.forEach(star => star.classList.remove("filled"));

  let starCount = 0;
  if(score >= 30) starCount = 3;
  else if(score >= 20) starCount = 2;
  else if(score >= 10) starCount = 1;

  for(let i=0; i<starCount; i++){
    stars[i].classList.add("filled");
  }

  // Unlock next level if score is high
  if(score >= 30){
    localStorage.setItem("triviaLevel3Unlocked", "true");
  }

  // ✅ show modal
  document.getElementById("resultModal").classList.remove("hidden");
}

// ==========================
// UTILITIES
// ==========================
function shuffle(arr){ arr.sort(() => Math.random() - 0.5); }
function decodeHtml(html){ const txt = document.createElement("textarea"); txt.innerHTML = html; return txt.value; }

// ==========================
// BUTTONS ON MODAL
// ==========================
document.getElementById("retryBtn").onclick = () => {
  document.getElementById("resultModal").classList.add("hidden"); // hide modal
  document.getElementById("questionContainer").style.display = "block"; // show question area
  score = 0;
  questionNumber = 0;
  attemptsLeft = 4;
  loadQuestion();
};

document.getElementById("homeBtn").onclick = () => { window.location.href="trivia-levels.html"; };
document.getElementById("nextBtn").onclick = () => { alert("Next mode coming soon!"); };

// ==========================
// START GAME
// ==========================
window.onload = () => {
  document.getElementById("resultModal").classList.add("hidden");
  document.getElementById("questionContainer").style.display = "block";
  loadQuestion();
};