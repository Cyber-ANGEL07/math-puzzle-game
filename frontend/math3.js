//This code was developed with assistance from a large language model (OpenAI ChatGPT / DeepSeek)
let score = 0;
let previousAnswer = null;
let chainStarted = false;
let mathQuestionNumber = 0;
let attemptsLeft = 3;
const MAX_QUESTIONS = 3;
let gameOver = false;

let TIME_PER_QUESTION = 10;
let timeLeft = TIME_PER_QUESTION;
let timerInterval;
let mathAnswer;

// UTILITY FUNCTIONS
function getNumberBasedOnDifficulty() {
    return Math.floor(Math.random() * 41) + 10; // 10-50
}

function showFeedback(msg) {
    document.getElementById("feedback").textContent = msg;
}

function updateStats() {
    document.getElementById("scoreValue").textContent = score;
    document.getElementById("attemptsValue").textContent = attemptsLeft;
}

// CIRCULAR TIMER
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
    if (timerText) timerText.textContent = timeLeft + 's';
}

// QUESTION GENERATORS
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

    if (operator === "+") {
        mathAnswer = previousAnswer + num;
        currentQuestion = `? + ${num} = ?`;
    } else if (operator === "-") {
        if (previousAnswer - num < 0) {
            mathAnswer = previousAnswer + num;
            currentQuestion = `? + ${num} = ?`;
        } else {
            mathAnswer = previousAnswer - num;
            currentQuestion = `? - ${num} = ?`;
        }
    } else if (operator === "*") {
        mathAnswer = previousAnswer * num;
        currentQuestion = `? × ${num} = ?`;
    } else if (operator === "/") {
        const divisor = num;
        const dividend = previousAnswer * divisor;
        mathAnswer = previousAnswer;
        currentQuestion = `${dividend} ÷ ${divisor} = ?`;
    }
    document.getElementById("mathQuestion").textContent = currentQuestion;
}

// CHECK ANSWER
function checkMathAnswer() {
    if (gameOver) return;
    const userAnswer = parseInt(document.getElementById("mathInput").value);
    if (isNaN(userAnswer)) {
        alert("Enter a number!");
        return;
    }
    clearInterval(timerInterval);

    if (userAnswer === mathAnswer) {
        score += 10;
        if (score > 30) score = 30;
        showFeedback("Correct!");
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
        showFeedback(`Wrong! Attempts left: ${attemptsLeft}`);
        if (typeof flashScreen !== 'undefined') flashScreen('red');
        if (typeof playSound !== 'undefined') playSound(wrongBeep);
        previousAnswer = null;
        chainStarted = false;
    }

    updateStats();
    mathQuestionNumber++;

    if (mathQuestionNumber >= MAX_QUESTIONS || attemptsLeft <= 0) {
        setTimeout(endMathGame, 800);
    } else {
        setTimeout(loadMathQuestion, 1000);
    }
}

// LOAD QUESTION
function loadMathQuestion() {
    document.getElementById("mathInput").value = "";
    if (chainStarted && previousAnswer !== null) {
        generateChainQuestion();
    } else {
        generateFirstQuestion();
    }
    startTimer();
}

// HANDLE NEXT QUESTION (timeout)
function handleNextQuestion(correct) {
    mathQuestionNumber++;
    if (mathQuestionNumber >= MAX_QUESTIONS || attemptsLeft <= 0) {
        endMathGame();
    } else {
        setTimeout(loadMathQuestion, 1000);
    }
}

// END GAME / SHOW MODAL
function endMathGame() {
    gameOver = true;
    clearInterval(timerInterval);
    if (typeof setStatic !== 'undefined') setStatic(false);
    
    document.getElementById("finalScore").textContent = `Score: ${score}`;
  
    const stars = document.querySelectorAll("#stars .star");
    stars.forEach(s => s.classList.remove("filled", "pop"));
  
    let starCount = 0;
    if (score >= 30) starCount = 3;
    else if (score >= 20) starCount = 2;
    else if (score >= 10) starCount = 1;
  
    for (let i = 0; i < starCount; i++) {
        setTimeout(() => {
            stars[i].classList.add("pop", "filled");
            if (typeof playSound !== 'undefined') playSound(starSound);
        }, i * 350);
    }
  
    document.getElementById("resultModal").classList.remove("hidden");
    sendMathScore();
}

// SEND SCORE
async function sendMathScore() {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    const params = new URLSearchParams(window.location.search);
    const level = parseInt(params.get("level")) || 3;
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

// BUTTON EVENT LISTENERS
document.getElementById("submitBtn").addEventListener("click", () => {
    if (typeof playSound !== 'undefined') playSound(clickSound);
    checkMathAnswer();
});
document.getElementById("retryBtn").onclick = () => {
    if (typeof playSound !== 'undefined') playSound(buttonSound);
    location.reload();
};
document.getElementById("homeBtn").onclick = () => {
    if (typeof playSound !== 'undefined') playSound(buttonSound);
    window.location.href = "index.html";
};

// "Next" button becomes "Finish" for level 3 – goes to home
const nextBtn = document.getElementById("nextBtn");
if (nextBtn) {
    nextBtn.textContent = "🏁 FINISH";
    nextBtn.onclick = () => {
        if (typeof playSound !== 'undefined') playSound(buttonSound);
        const params = new URLSearchParams(window.location.search);
        const level = params.get("level") || "3";
        if (score === 30) {
            if (level === "3") localStorage.setItem("mathLevel3Completed", "true");
        }
        window.location.href = "index.html"; // Go to home
    };
}

document.getElementById("leaderboardBtn").onclick = () => {
    if (typeof playSound !== 'undefined') playSound(buttonSound);
    window.location.href = "leaderboard.html";
};

// START GAME
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