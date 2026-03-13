// ==========================
// VARIABLES
// ==========================
let score = 0;
let previousAnswer = null;    // stores previous answer for chain
let currentQuestion = "";
let chainStarted = false;
let mathQuestionNumber = 0;
let attemptsLeft = 3;         // total attempts across all questions
const MAX_QUESTIONS = 3;       // total questions in a round
let gameOver = false;

let TIME_PER_QUESTION = 15;
let timeLeft = TIME_PER_QUESTION;
let timerInterval;
let starCount = 0;

// ----------------- SAVE PROGRESS TO BACKEND -----------------
async function saveProgressToBackend(userId, mode, level, score, stars, completed) {
    try {
        const response = await fetch("http://localhost:3000/api/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, mode, level, score, stars, completed })
        });

        const data = await response.json();
        console.log("Progress saved:", data);
    } catch (err) {
        console.error("Error saving progress:", err);
    }
}

// ==========================
// UTILITY FUNCTIONS
// ==========================
function getNumberBasedOnDifficulty() {
    return Math.floor(Math.random() * 10) + 1;
}

function showFeedback(msg) {
    document.getElementById("feedback").textContent = msg;
}

function updateUI() {
    document.getElementById("mathQuestion").textContent = currentQuestion;
    document.getElementById("score").textContent = `Score: ${score} | Attempts left: ${attemptsLeft}`;
}

// ==========================
// TIMER FUNCTIONS
// ==========================
function startTimer() {
    clearInterval(timerInterval);
    timeLeft = TIME_PER_QUESTION;
    updateTimerUI();

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerUI();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            attemptsLeft--;
            showFeedback(`⏰ Time's up! Attempts left: ${attemptsLeft}`);
            handleNextQuestion(false); // timeout counts as wrong
        }
    }, 1000);
}

function updateTimerUI() {
    const timerBar = document.getElementById("timerBar");
    const percentage = (timeLeft / TIME_PER_QUESTION) * 100;
    timerBar.style.width = percentage + "%";
    document.getElementById("timer").textContent = `Time: ${timeLeft}s`;
    timerBar.classList.toggle("panic", timeLeft <= 5);
}

// ==========================
// QUESTION GENERATORS
// ==========================
function generateFirstQuestion() {
    const num1 = getNumberBasedOnDifficulty();
    const num2 = getNumberBasedOnDifficulty();
    const operators = ["+", "-", "*", "/"];
    const operator = operators[Math.floor(Math.random() * operators.length)];

    if (operator === "+") {
        mathAnswer = num1 + num2;
        currentQuestion = `${num1} + ${num2} = ?`;
    } else if (operator === "-") {
        if (num1 < num2) return generateFirstQuestion();
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

function generateChainQuestion() {
    if (previousAnswer === null) return generateFirstQuestion();

    const num = getNumberBasedOnDifficulty(); // random small number
    const operators = ["+", "-", "*", "/"];
    const operator = operators[Math.floor(Math.random() * operators.length)];

    switch (operator) {
        case "+": 
            mathAnswer = previousAnswer + num;
            currentQuestion = `? + ${num} = ?`;
            break;
        case "-": 
            // ensure non-negative
            if (previousAnswer - num < 0) {
                mathAnswer = previousAnswer + num; // fallback
                currentQuestion = `? + ${num} = ?`;
            } else {
                mathAnswer = previousAnswer - num;
                currentQuestion = `? - ${num} = ?`;
            }
            break;
        case "*": 
            mathAnswer = previousAnswer * num;
            currentQuestion = `? × ${num} = ?`;
            break;
        case "/": 
            // create clean division: dividend = previousAnswer * num
            const dividend = previousAnswer * num;
            mathAnswer = previousAnswer;
            currentQuestion = `${dividend} ÷ ? = ?`;
            break;
    }

    updateUI();
}

// ==========================
// CHECK ANSWER
// ==========================
function checkMathAnswer() {
    if (gameOver) return;

    const userAnswer = parseInt(document.getElementById("mathInput").value);

    if (isNaN(userAnswer)) {
        alert("Please enter a valid number!");
        return;
    }

    clearInterval(timerInterval); // stop timer

    if (userAnswer === mathAnswer) {
        score += 10;
        if (score > 30) score = 30; // max score

        showFeedback("✅ Correct!");

        // start chain only if first correct answer
        if (!chainStarted) {
            previousAnswer = mathAnswer;
            chainStarted = true;
        } else {
            previousAnswer = mathAnswer; // continue chain
        }

    } else {
        attemptsLeft--;
        showFeedback(`❌ Wrong! Attempts left: ${attemptsLeft}`);
        previousAnswer = null;
        chainStarted = false;
    }

    mathQuestionNumber++;

    if (mathQuestionNumber >= MAX_QUESTIONS || attemptsLeft <= 0) {
        setTimeout(endMathGame, 1000);
    } else {
        setTimeout(loadMathQuestion, 1000);
    }
}

// ==========================
// LOAD QUESTION
// ==========================
function loadMathQuestion() {
    document.getElementById("mathInput").value = "";

    if (chainStarted && previousAnswer !== null) {
        generateChainQuestion();
    } else {
        generateFirstQuestion();
    }

    startTimer();
}

// ==========================
// HANDLE TIMEOUT / NEXT
// ==========================
function handleNextQuestion(correct) {
    mathQuestionNumber++;
    if (mathQuestionNumber >= MAX_QUESTIONS || attemptsLeft <= 0) {
        endMathGame();
    } else {
        setTimeout(loadMathQuestion, 1000);
    }
}

// ==========================
// END GAME / SHOW MODAL
// ==========================
function endMathGame() {
    gameOver = true;
    clearInterval(timerInterval);

    document.getElementById("finalScore").textContent = `Score: ${score}`;

    const stars = document.querySelectorAll(".star");
    stars.forEach(star => star.classList.remove("filled"));

    starCount = 0;
    if (score >= 30) starCount = 3;
    else if (score >= 20) starCount = 2;
    else if (score >= 10) starCount = 1;

    for (let i = 0; i < starCount; i++) stars[i].classList.add("filled");

    document.getElementById("resultModal").classList.remove("hidden");
}

// ==========================
// BUTTONS
// ==========================
document.getElementById("submitBtn").addEventListener("click", checkMathAnswer);
document.getElementById("retryBtn").onclick = () => location.reload();
document.getElementById("homeBtn").onclick = () => window.location.href = "index.html";
document.getElementById("nextBtn").onclick = async () => {
    const params = new URLSearchParams(window.location.search);
    const level = params.get("level") || "1"; // current level
    const userId = localStorage.getItem("userId", "6992dcec46556e60be825ef7"); // logged-in user

    // Only mark completed if perfect score
    const completed = score === 30;

    // Save progress to backend
    await saveProgressToBackend(
        userId,
        "math",
        parseInt(level),
        score,
        starCount,
        completed
    );

    // Still keep localStorage unlock for UI feedback
    if (completed) {
        if (level === "1") localStorage.setItem("mathLevel1Completed", "true");
        else if (level === "2") localStorage.setItem("mathLevel2Completed", "true");
        else if (level === "3") localStorage.setItem("mathLevel3Completed", "true");
    }

    // Go back to level selection page
    window.location.href = "math-levels.html";
};

// ==========================
// START GAME
// ==========================
window.onload = startMathGame;

function startMathGame() {
    previousAnswer = null;
    chainStarted = false;
    mathQuestionNumber = 0;
    score = 0;
    attemptsLeft = 3;
    gameOver = false;

    document.getElementById("mathInput").value = "";
    showFeedback("");
    loadMathQuestion();
}

document.getElementById("retryBtn").onclick = () => {
    location.reload(true); // true forces full reload ignoring cache
};