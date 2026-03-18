let score = 0;                  // total score
let questionNumber = 0;         // current question number
const TOTAL_QUESTIONS = 3;      // total questions per round
let attemptsLeft = 3;           // attempts for current question
let gameActive = true;          // is game running
let triviaAnswer = "";  
let timeLeft = 15;
let maxTime = 15;          // seconds per question
let timerInterval = null;   // stores setInterval
const TIME_PER_QUESTION = 15;        // correct answer for current question

function decodeHtml(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

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
  document.getElementById("hint").textContent = `Category: ${decodeHtml(data.results[0].category)}`;
  document.getElementById("guessInput").value = "";

  loadTriviaQuestion(); // Load next trivia question
}

async function loadTriviaQuestion() {
  if (!gameActive) return;

  const guessBtn = document.getElementById("guessBtn");
  guessBtn.disabled = true; // ❌ disable button while loading

  clearInterval(timerInterval);

  attemptsLeft = 3;  // reset attempts for new question

  document.getElementById("score").innerText =
    `Score: ${score} | Attempts left: ${attemptsLeft}`;

  try {
    const response = await fetch("http://localhost:3000/api/trivia?difficulty=easy");

    // Handle API failures gracefully
    if (!response.ok) {
      console.log("Trivia API temporary failure. Retrying...");
      return setTimeout(loadTriviaQuestion, 2000); // retry after 2 sec
    }
    
    const data = await response.json();
    
    // Optional: also check if OpenTDB returned no results
    if (!data.results || data.results.length === 0) {
      console.log("Trivia API returned empty results. Retrying...");
      return setTimeout(loadTriviaQuestion, 2000); // retry after 2 sec
    }

    if (!data.results || data.results.length === 0) {
      showFeedback("Trivia question unavailable. Trying again…", false);
      setTimeout(loadTriviaQuestion, 1000);
      return;
    }

    triviaAnswer = data.results[0].correct_answer;
    const question = data.results[0].question;
    document.getElementById("triviaQuestion").textContent = decodeHtml(data.results[0].question);
    document.getElementById("hint").textContent = `Category: ${data.results[0].category}`;
    document.getElementById("guessInput").value = "";

    // Re-enable the button now that question is ready
    guessBtn.disabled = false;

    //Show the category and difficulty
    const difficulty = data.results[0].difficulty; //easy,medium,hard
    document.getElementById("hint").textContent = 
        `Category: ${data.results[0].category} | Difficulty: ${difficulty}`;

    //Starting the timer based on the Difficulty
    switch (difficulty.toLowerCase()) {
      case "easy":
        timeLeft = 15;
        break;
      case "medium":
        timeLeft = 10;
        break;
      case "hard":
        timeLeft = 7;
        break;
      default:
        timeLeft = 15;

    }
    updateTimerUI();
    startTimer();
    
  } catch (error) {
    console.error(error); // still log for debugging
  
      const guessBtn = document.getElementById("guessBtn");
      
      // Optional polish:
      showFeedback("⏳ Loading next question… please wait", false); // friendly message
      guessBtn.disabled = true; // prevent clicks
  
      setTimeout(() => {
          loadTriviaQuestion();      // retry fetching question
          guessBtn.disabled = false; // re-enable button after question loads
      }, 2000);
  }

}

function startTimer() {
  clearInterval(timerInterval);

  // ✅ use difficulty-based time already set
  timeLeft = maxTime;

  updateTimerUI();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerUI();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);

      attemptsLeft--; // lose an attempt

      document.getElementById("score").innerText =
        `Score: ${score} | Attempts left: ${attemptsLeft}`;

      if (attemptsLeft > 0) {

        showFeedback(
          `⏰ Time's up! Attempts left: ${attemptsLeft}`,
          false
        );

        // ✅ restart timer for same question
        timeLeft = maxTime;
        startTimer();

      } else {

        showFeedback(
          `⏰ Time's up! No attempts left! Correct answer: ${triviaAnswer}`,
          false
        );

        nextOrEnd(); // move to next question
      }
    }
  }, 1000);
}

function updateTimerUI() {

  document.getElementById("timer").textContent =
    `Time: ${timeLeft}s`;

  const percentage = (timeLeft / maxTime) * 100;
  const timerBar = document.getElementById("timerBar");

  timerBar.style.width = percentage + "%";

  // ⭐ PANIC MODE (last 5 seconds)
  if (timeLeft <= 5) {
    timerBar.classList.add("panic");
  } else {
    timerBar.classList.remove("panic");
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

function nextOrEnd() {
  clearInterval(timerInterval); // stop timer

  questionNumber++;

  if (questionNumber >= TOTAL_QUESTIONS) {
    showResults();
  } else {
    loadTriviaQuestion();
  }
}

function checkAnswer() {
  if (!gameActive) return;

  const userAnswer = document.getElementById("guessInput").value.trim();
  if (!userAnswer) {
    alert("Please enter your answer!");
    return;
  }

  if (userAnswer.toLowerCase() === triviaAnswer.toLowerCase()) {
    clearInterval(timerInterval);
    score += 10; // points per correct answer
    showFeedback(`✅ Correct! +10 points`, true);
    nextOrEnd();
  } else {
    attemptsLeft--;
    if (attemptsLeft > 0) {
      const hintMessage = attemptsLeft === 2 ? generateHint(triviaAnswer) : "";
      showFeedback(`❌ Wrong! Attempts left: ${attemptsLeft}\n${hintMessage}`, false);
      document.getElementById("score").innerText =
        `Score: ${score} | Attempts left: ${attemptsLeft}`;
    } else {
      showFeedback(`💀 No attempts left! Correct answer: ${triviaAnswer}`, false);
      nextOrEnd();
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

function handleWrongAttempt(message = "❌ Wrong answer") {

  attemptsLeft--;

  document.getElementById("score").textContent =
    `Score: ${score} | Attempts: ${attemptsLeft}`;

  if (attemptsLeft <= 0) {
    endGame();   // ⭐ NEW
    return;
  }

  alert(message);
  startTimer();
}

function endGame() {
  gameActive = false;
  document.getElementById("finalScore").textContent = `Your Score: ${score}`;
  document.getElementById("gameOverScreen").style.display = "block";
  document.getElementById("guessBtn").disabled = true;
  document.getElementById("guessInput").disabled = true;
}
document.getElementById("retryBtn").addEventListener("click", () => {
  score = 0;
  questionNumber = 0;
  attemptsLeft = 3;
  gameActive = true;

  document.getElementById("gameOverScreen").style.display = "none";
  document.getElementById("guessBtn").disabled = false;
  document.getElementById("guessInput").disabled = false;
  document.getElementById("score").innerText = `Score: ${score} | Attempts left: ${attemptsLeft}`;



  loadTriviaQuestion();
});

document.getElementById("guessBtn").addEventListener("click", checkAnswer);

function restartGame() {

  score = 0;
  attemptsLeft = 3;
  gameActive = true;

  document.getElementById("gameOverScreen").style.display = "none";

  document.getElementById("guessBtn").disabled = false;
  document.getElementById("guessInput").disabled = false;

  document.getElementById("score").textContent =
    `Score: ${score} | Attempts: ${attemptsLeft}`;

  loadTriviaQuestion();
}

document.getElementById("guessBtn").addEventListener("click", () => {
  if (!gameActive) return;

  // existing logic
});

function showResults() {

  clearInterval(timerInterval);

  document.getElementById("finalScore").textContent =
    `Score: ${score}`;

  const stars = document.querySelectorAll(".star");

  // reset stars
  stars.forEach(star => star.classList.remove("filled"));

  // ⭐ scoring logic (you can tweak)
  let starCount = 0;

  if (score >= 30) starCount = 3;
  else if (score >= 20) starCount = 2;
  else if (score >= 10) starCount = 1;

  for (let i = 0; i < starCount; i++) {
    stars[i].classList.add("filled");
  }
    // ✅ UNLOCK LEVEL 2
    if (score >= 30) {
      localStorage.setItem("triviaLevel2Unlocked", "true");
    }

  document.getElementById("resultModal").classList.remove("hidden");

  // Call it at the end of showResults()
sendTriviaScore();
}

async function sendTriviaScore() {
  const userId = localStorage.getItem("userId");
  if (!userId) return;

  try {
    await fetch("http://localhost:3000/api/saveScore/trivia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        score,
        level: 1 // replace with actual level if using multiple
      })
    });
    console.log("Trivia score sent to server:", score);
  } catch (err) {
    console.error("Failed to send trivia score:", err);
  }
}

document.getElementById("retryBtn").onclick = () => {
  location.reload();
};

document.getElementById("homeBtn").onclick = () => {
  window.location.href = "index.html";
};

document.getElementById("nextBtn").onclick = () => {
  // Save score for current level
  localStorage.setItem("triviaLevel1Score", score); 

  // Unlock Level 2 if player scored >=30
  if (score >= 30) {
    localStorage.setItem("triviaLevel2Unlocked", "true");
      // Redirect to Levels page
    
    window.location.href = "trivia-levels.html";
  }

};

window.onload = function() {
  loadTriviaQuestion();
};

