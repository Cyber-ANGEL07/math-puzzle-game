// ==========================
// VARIABLES
// ==========================
let triviaAnswer;          // correct trivia answer
let attempts = 3;          // max attempts per question
let score = 0;             // player score
let maxAttempts = 3;
let level = 1;

// ==========================
// START GAME
// ==========================
function nextLevel() {
  level++;
  if (level === 2) {
    loadMathQuestion();
  } else if (level === 3) {
    loadBonusChallenge();
  }
}

function startGame() {
  attempts = maxAttempts;
  document.getElementById("score").innerText = `Score: ${score} | Attempts left: ${attempts}`;
  document.getElementById("hint").innerText = "";
  document.getElementById("guessInput").value = "";

  loadTriviaQuestion(); // Load next trivia question
}

// ==========================
// LOAD TRIVIA QUESTION (Math/Science)
// ==========================
async function loadTriviaQuestion() {
  try {
    // Category 17 = Science: Math
    const response = await fetch("https://opentdb.com/api.php?amount=1&category=17&type=multiple&difficulty=easy");

    if (!response.ok) throw new Error(`Trivia API responded with status ${response.status}`);

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      showFeedback("Trivia question unavailable. Trying again…", false);
      setTimeout(loadTriviaQuestion, 1000); // retry after 1 sec
      return;
    }

    // ✅ Set the correct answer and display the question
    triviaAnswer = data.results[0].correct_answer;
    const question = data.results[0].question;
    document.getElementById("triviaQuestion").innerHTML = question;

    // ✅ Show category hint immediately
    document.getElementById("hint").innerText = `Category: ${data.results[0].category}`;

  } catch (error) {
    alert("Trivia API failed. Please try again later."); 
    console.error(error);
  }
}
function generateHint(answer) {
  let hint = "";

  // If answer is a number
  if (!isNaN(answer)) {
    const num = Number(answer);
    hint = `Hint: The answer is between ${Math.max(0, num - 5)} and ${num + 5}`;
  } else {
    // Text answer → first letter hint
    hint = `Hint: The answer starts with "${answer[0]}"`;
  }

  return hint;
}

// ==========================
// CHECK USER ANSWER
// ==========================
async function checkAnswer() {
  const userAnswer = document.getElementById("guessInput").value.trim();

  if (!userAnswer) {
    alert("Please enter your answer!");
    return;
  }

  if (userAnswer.toLowerCase() === triviaAnswer.toLowerCase()) {
    // Correct
    score += 10;
    document.getElementById("score").innerText = `Score: ${score} | Attempts left: ${attempts}`;
    showFeedback("CORRECT!!!", true);
    startGame(); 
  } else {
    attempts--;
    if (attempts > 0) {
      // Show hint after first wrong attempt
      const hintMessage = attempts === 2 ? generateHint(triviaAnswer) : "";
      showFeedback(`❌ Wrong! Attempts left: ${attempts}\n${hintMessage}`, false);
    } else {
      alert(`💀 Game Over! Correct answer was: ${triviaAnswer}`);
      score = 0;
      startGame(); 
    }
  }
  document.getElementById("guessInput").value = "";
}



// ==========================
// SHOW FEEDBACK
// ==========================
function showFeedback(message, isCorrect) {
  const hintEl = document.getElementById("hint");
  hintEl.innerText = message;
  hintEl.classList.remove("correct", "wrong");
  hintEl.classList.add(isCorrect ? "correct" : "wrong");
}

// ==========================
// EVENT LISTENERS
// ==========================
window.onload = function() {
  startGame();
  document.getElementById("guessBtn").addEventListener("click", checkAnswer);
};

