let score = 0;
let mathAnswer;
let previousAnswer = null;
let mathQuestionNumber = 0;
const MAX_MATH_QUESTIONS = 3;
let currentQuestion = "";
let chainStarted = false;
let attemptsLeft = 3;
let difficulty = "easy";
let gameOver = false;

let TIME_PER_QUESTION = 15;
let timeLeft = TIME_PER_QUESTION;
let timerInterval = null;

function startTimer() {
    clearInterval(timerInterval); // clear previous timer
    timeLeft = TIME_PER_QUESTION; // reset timer
    updateTimerUI();

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerUI();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);

            attemptsLeft--; // lose an attempt for timeout
            showFeedback(`⏰ Time's up! Attempts left: ${attemptsLeft}`);

            if (attemptsLeft <= 0) {
                endMathGame(); // game over
            } else {
                // reload the same type of question fairly
                if (!chainStarted) generateFirstQuestion();
                else generateChainQuestion();

                startTimer(); // restart timer for new question
            }
        }
    }, 1000);
}

function updateTimerUI() {
    document.getElementById("timer").textContent = `Time: ${timeLeft}s`;

    const percentage = (timeLeft / TIME_PER_QUESTION) * 100;
    const timerBar = document.getElementById("timerBar");

    timerBar.style.width = percentage + "%";

    // Panic mode: last 5 seconds
    if (timeLeft <= 5) {
        timerBar.classList.add("panic");
    } else {
        timerBar.classList.remove("panic");
    }
}

// Utility
function getNumberBasedOnDifficulty() {
    if (difficulty === "easy") return Math.floor(Math.random() * 5) + 1;
    if (difficulty === "medium") return Math.floor(Math.random() * 10) + 1;
    if (difficulty === "hard") return Math.floor(Math.random() * 20) + 1;
}

// Generate normal question
function generateFirstQuestion() {
    const num1 = getNumberBasedOnDifficulty();
    const num2 = getNumberBasedOnDifficulty();
    const operators = ["+", "-", "*", "/"]; // include division now
    const operator = operators[Math.floor(Math.random() * operators.length)];

    if (operator === "+") {
        mathAnswer = num1 + num2;
        currentQuestion = `${num1} + ${num2} = ?`;
    } else if (operator === "-") {
        if (num1 < num2) return generateFirstQuestion(); // retry to avoid negative
        mathAnswer = num1 - num2;
        currentQuestion = `${num1} - ${num2} = ?`;
    } else if (operator === "*") {
        mathAnswer = num1 * num2;
        currentQuestion = `${num1} × ${num2} = ?`;
    } else if (operator === "/") {
        const divisor = getNumberBasedOnDifficulty();
        const quotient = getNumberBasedOnDifficulty();
        mathAnswer = quotient;
        currentQuestion = `${divisor * quotient} ÷ ${divisor} = ?`;
    }

    updateUI();
}

// Generate chain question using previousAnswer
function generateChainQuestion() {
    if (previousAnswer === null) return generateFirstQuestion();

    const num = getNumberBasedOnDifficulty();
    const operators = ["+", "-", "*", "/"];
    const operator = operators[Math.floor(Math.random() * operators.length)];

    switch (operator) {
        case "+":
            mathAnswer = previousAnswer + num;
            currentQuestion = `? + ${num} = ?`;
            break;
        case "-":
            if (previousAnswer - num <= 0) return generateChainQuestion();
            mathAnswer = previousAnswer - num;
            currentQuestion = `? - ${num} = ?`;
            break;
        case "*":
            mathAnswer = previousAnswer * num;
            currentQuestion = `? × ${num} = ?`;
            break;
        case "/":
            // Pick a small divisor
            const divisor = getNumberBasedOnDifficulty(); // e.g., 1–5 for easy
            // Compute dividend = previousAnswer * divisor
            const dividend = previousAnswer * divisor;
            mathAnswer = previousAnswer; // user needs to recall previousAnswer
            currentQuestion = `${dividend} ÷ ${divisor} = ?`;
            break;
    }

    updateUI();
}

// Load next question
function loadMathQuestion() {
    if (gameOver) return; // prevent new question after game over

    document.getElementById("mathInput").value = "";
    mathQuestionNumber++;

    // Only generate chain if chainStarted AND previousAnswer exists
    if (chainStarted && previousAnswer !== null) generateChainQuestion();
    else generateFirstQuestion();

    startTimer();
}

// Update UI
function updateUI() {
    document.getElementById("mathQuestion").textContent = currentQuestion;
    document.getElementById("score").innerText = `Score: ${score} | Attempts left: ${attemptsLeft}`;
}

// Show feedback
function showFeedback(message) {
    document.getElementById("feedback").textContent = message;
}

// Check user answer
function checkMathAnswer() {
    if (gameOver) return; // ignore input after game over

    const userAnswer = parseInt(document.getElementById("mathInput").value);

    if (userAnswer === mathAnswer) {
        score += 10;
        if (score > 30) score = 30;

        previousAnswer = mathAnswer;
        chainStarted = true;

        showFeedback("✅ Correct!");
        attemptsLeft--;

        if (attemptsLeft <= 0 || mathQuestionNumber >= MAX_MATH_QUESTIONS) {
            endMathGame();
        } else {
            setTimeout(loadMathQuestion, 1000);
        }

    } else {
        attemptsLeft--;
        showFeedback(`❌ Wrong! Attempts left: ${attemptsLeft}`);

        // If wrong, stop chain and give similar first question
        previousAnswer = null;
        chainStarted = false;

        if (attemptsLeft <= 0 || mathQuestionNumber >= MAX_MATH_QUESTIONS) {
            endMathGame();
        } else {
            setTimeout(generateFirstQuestion, 1000);
        }
    }
}

// End game
function endMathGame() {
    gameOver = true;
    clearInterval(timerInterval)
    showResults(); // show modal
}

// Start game
function startMathGame() {
    previousAnswer = null;
    mathQuestionNumber = 0;
    chainStarted = false;
    score = 0;
    attemptsLeft = 3;
    gameOver = false;
    loadMathQuestion();
}

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
  
    document.getElementById("resultModal").classList.remove("hidden");
  }
  
  document.getElementById("retryBtn").onclick = () => {
    location.reload();
  };
  
  document.getElementById("homeBtn").onclick = () => {
    window.location.href = "index.html";
  };
  
  document.getElementById("nextBtn").onclick = () => {
    alert("Next mode coming soon!");
  };

// Event listeners
document.getElementById("submitBtn").addEventListener("click", checkMathAnswer);
window.onload = startMathGame;