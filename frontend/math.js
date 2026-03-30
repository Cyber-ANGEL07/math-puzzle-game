// ==========================
// VARIABLES
// ==========================
let score = 0;
let previousAnswer = null;
let currentQuestion = "";
let chainStarted = false;
let mathQuestionNumber = 0;
let attemptsLeft = 3;
const MAX_QUESTIONS = 3;
let gameOver = false;

let TIME_PER_QUESTION = 15;
let timeLeft = TIME_PER_QUESTION;
let timerInterval;

// ==========================
// UTILITY FUNCTIONS
// ==========================
function getNumberBasedOnDifficulty() {
    return Math.floor(Math.random() * 10) + 1;
}

function showFeedback(msg) {
    document.getElementById("feedback").textContent = msg;
}

// Update the new stats display
function updateStats() {
    document.getElementById("scoreValue").textContent = score;
    document.getElementById("attemptsValue").textContent = attemptsLeft;
}

// ==========================
// TIMER FUNCTIONS (circular)
// ==========================
function startTimer() {
    clearInterval(timerInterval);
    timeLeft = TIME_PER_QUESTION;
    updateTimerUI();

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerUI();

        if (typeof setStatic !== 'undefined') {
            setStatic(timeLeft <= 5);
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            attemptsLeft--;
            showFeedback(`⏰ Time's up! Attempts left: ${attemptsLeft}`);
            updateStats();
            handleNextQuestion(false);
        }
    }, 1000);
}

function updateTimerUI() {
    const progressCircle = document.querySelector('.timer-progress');
    const timerText = document.querySelector('.timer-text');
    const totalTime = TIME_PER_QUESTION;
    const dashOffset = 251.2 * (1 - timeLeft / totalTime);
    if (progressCircle) {
        progressCircle.style.strokeDashoffset = dashOffset;
        progressCircle.style.stroke = timeLeft <= 5 ? '#f00' : '#ffb000';
    }
    if (timerText) {
        timerText.textContent = timeLeft + 's';
    }
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
    document.getElementById("mathQuestion").textContent = currentQuestion;
}

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
            if (previousAnswer - num < 0) {
                mathAnswer = previousAnswer + num;
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
            const dividend = previousAnswer * num;
            mathAnswer = previousAnswer;
            currentQuestion = `${dividend} ÷ ? = ?`;
            break;
    }
    document.getElementById("mathQuestion").textContent = currentQuestion;
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
    clearInterval(timerInterval);

    if (userAnswer === mathAnswer) {
        score += 10;
        if (score > 30) score = 30;
        showFeedback("✅ Correct!");
        if (typeof flashScreen !== 'undefined') flashScreen('green');
        if (typeof playSound !== 'undefined') playSound(correctBeep);
        if (!chainStarted) {
            previousAnswer = mathAnswer;
            chainStarted = true;
        } else {
            previousAnswer = mathAnswer;
        }
    } else {
        attemptsLeft--;
        showFeedback(`❌ Wrong! Attempts left: ${attemptsLeft}`);
        if (typeof flashScreen !== 'undefined') flashScreen('red');
        if (typeof playSound !== 'undefined') playSound(wrongBeep);
        previousAnswer = null;
        chainStarted = false;
    }

    updateStats();
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
// HANDLE NEXT QUESTION (timeout)
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
// END GAME / SHOW MODAL (with star pop animation & sound)
// ==========================
function endMathGame() {
    gameOver = true;
    clearInterval(timerInterval);
    if (typeof setStatic !== 'undefined') setStatic(false);
    
    document.getElementById("finalScore").textContent = `Score: ${score}`;
  
    const stars = document.querySelectorAll(".star");
    stars.forEach(s => s.classList.remove("filled", "pop"));
  
    let starCount = 0;
    if (score >= 30) starCount = 3;
    else if (score >= 20) starCount = 2;
    else if (score >= 10) starCount = 1;
  
    for (let i = 0; i < starCount; i++) {
        setTimeout(() => {
            stars[i].classList.add("pop", "filled");
            if (typeof playSound !== 'undefined') playSound(starSound);
        }, i * 350);  // 350ms between stars
    }
  
    document.getElementById("resultModal").classList.remove("hidden");
    sendMathScore();
}

async function sendMathScore() {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    const params = new URLSearchParams(window.location.search);
    const level = parseInt(params.get("level")) || 1;
    try {
        await fetch("http://localhost:3000/api/saveScore/math", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, score, level })
        });
        console.log(`Math level ${level} score sent:`, score);
    } catch (err) {
        console.error("Failed to send math score:", err);
    }
}

// ==========================
// BUTTON EVENT LISTENERS
// ==========================
document.getElementById("submitBtn").addEventListener("click", checkMathAnswer);
document.getElementById("retryBtn").onclick = () => location.reload(true);
document.getElementById("homeBtn").onclick = () => window.location.href = "index.html";
document.getElementById("nextBtn").onclick = () => {
    const params = new URLSearchParams(window.location.search);
    const level = params.get("level") || "1";
    if (score === 30) {
        if (level === "1") localStorage.setItem("mathLevel1Completed", "true");
        else if (level === "2") localStorage.setItem("mathLevel2Completed", "true");
        else if (level === "3") localStorage.setItem("mathLevel3Completed", "true");
    }
    window.location.href = "math-levels.html";
};
document.getElementById("leaderboardBtn").onclick = () => window.location.href = "leaderboard.html";

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
    updateStats();
    loadMathQuestion();
}