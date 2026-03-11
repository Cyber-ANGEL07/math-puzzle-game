// ==========================
// VARIABLES
// ==========================
let score = 0;
let currentQuestion = "";
let mathAnswer = 0;
let attemptHistory = [];           // Stores all attempts
let currentAttempt = 1;            // Tracks 1st, 2nd, 3rd attempt
const MAX_ATTEMPTS = 3;
let attemptsLeft = MAX_ATTEMPTS;
let chainStarted = false;
let gameOver = false;

let TIME_PER_QUESTION = 15;
let timeLeft = TIME_PER_QUESTION;
let timerInterval = null;

// ==========================
// UTILITY FUNCTIONS
// ==========================
function getNumberBasedOnDifficulty() {
    // You can tweak for Medium/Hard
    return Math.floor(Math.random() * 10) + 1;
}

function shuffle(arr) { arr.sort(() => Math.random() - 0.5); }

// ==========================
// UI FUNCTIONS
// ==========================
function showFeedback(message, correct = true) {
    const fb = document.getElementById("feedback");
    fb.textContent = message;
    fb.style.color = correct ? "green" : "red";
}

function updateUI() {
    document.getElementById("mathQuestion").textContent = currentQuestion;
    document.getElementById("score").textContent = `Score: ${score} | Attempts left: ${attemptsLeft}`;
}

function updateTimerUI() {
    const timerBar = document.getElementById("timerBar");
    const percent = (timeLeft / TIME_PER_QUESTION) * 100;
    timerBar.style.width = percent + "%";
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
    const lastCorrect = attemptHistory.filter(a => a.wasCorrect).pop();
    if (!lastCorrect) return generateFirstQuestion();

    const num = getNumberBasedOnDifficulty();
    const operators = ["+", "-", "*", "/"];
    const operator = operators[Math.floor(Math.random() * operators.length)];

    switch(operator) {
        case "+": mathAnswer = lastCorrect.correctAnswer + num; currentQuestion = `? + ${num} = ?`; break;
        case "-": mathAnswer = lastCorrect.correctAnswer - num; if(mathAnswer < 0) return generateChainQuestion(); currentQuestion = `? - ${num} = ?`; break;
        case "*": mathAnswer = lastCorrect.correctAnswer * num; currentQuestion = `? × ${num} = ?`; break;
        case "/": const divisor = getNumberBasedOnDifficulty(); const dividend = lastCorrect.correctAnswer * divisor; mathAnswer = lastCorrect.correctAnswer; currentQuestion = `${dividend} ÷ ${divisor} = ?`; break;
    }

    updateUI();
}

// ==========================
// TIMER
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
            showFeedback(`⏰ Time's up! Attempts left: ${attemptsLeft}`, false);
            handleNextQuestion(false);
        }
    }, 1000);
}

// ==========================
// LOAD QUESTIONS
// ==========================
function loadMathQuestion() {
    document.getElementById("mathInput").value = "";

    if (chainStarted && attemptHistory.some(a => a.wasCorrect)) {
        generateChainQuestion();
    } else {
        generateFirstQuestion();
    }

    startTimer();
}

// ==========================
// CHECK ANSWER
// ==========================
function checkMathAnswer() {
    if (gameOver) return;

    const userAnswer = parseInt(document.getElementById("mathInput").value);
    const isCorrect = userAnswer === mathAnswer;

    attemptHistory.push({
        attemptNumber: currentAttempt,
        correctAnswer: mathAnswer,
        wasCorrect: isCorrect
    });

    if (isCorrect) {
        showFeedback("✅ Correct!", true);
        chainStarted = true;
    } else {
        showFeedback(`❌ Wrong! Attempts left: ${attemptsLeft}`, false);
        chainStarted = false;
    }

    attemptsLeft--;
    
    if (currentAttempt >= MAX_ATTEMPTS || attemptsLeft <= 0) {
        currentAttempt++;
        endMathGame();
        return;
    }

    currentAttempt++;
    setTimeout(loadMathQuestion, 1000);
}

// ==========================
// CALCULATE SCORE
// ==========================
function calculateFinalScore() {
    const correctAttempts = attemptHistory.filter(a => a.wasCorrect).length;
    if (correctAttempts === 3) return 30;
    if (correctAttempts === 2) return 20;
    if (correctAttempts === 1) return 10;
    return 0;
}

// ==========================
// END GAME / MODAL
// ==========================
function endMathGame() {
    gameOver = true;
    clearInterval(timerInterval);

    score = calculateFinalScore();
    document.getElementById("finalScore").textContent = `Score: ${score}`;

    const stars = document.querySelectorAll(".star");
    stars.forEach(star => star.classList.remove("filled"));

    let starCount = 0;
    if(score >= 30) starCount = 3;
    else if(score >= 20) starCount = 2;
    else if(score >= 10) starCount = 1;

    for(let i = 0; i < starCount; i++) stars[i].classList.add("filled");

    document.getElementById("resultModal").classList.remove("hidden");
}

// ==========================
// HANDLE NEXT QUESTION AFTER TIMEOUT
// ==========================
function handleNextQuestion(correct) {
    clearInterval(timerInterval);
    currentAttempt++;

    if (attemptsLeft <= 0 || currentAttempt > MAX_ATTEMPTS) {
        endMathGame();
    } else {
        setTimeout(loadMathQuestion, 1000);
    }
}

// ==========================
// BUTTON EVENTS
// ==========================
document.getElementById("submitBtn").addEventListener("click", checkMathAnswer);
document.getElementById("retryBtn").onclick = () => location.reload();
document.getElementById("homeBtn").onclick = () => window.location.href = "index.html";
document.getElementById("nextBtn").onclick = () => alert("Next mode coming soon!");

// ==========================
// START GAME
// ==========================
window.onload = () => {
    attemptHistory = [];
    currentAttempt = 1;
    chainStarted = false;
    attemptsLeft = MAX_ATTEMPTS;
    gameOver = false;
    score = 0;
    loadMathQuestion();
};