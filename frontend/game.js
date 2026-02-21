let score = 0;
let level = 1;
let timer = 30;
let currentAnswer = null;
let interval = null;
let puzzleCount = 0;
const maxPuzzles = 3;
let timerPaused = false;

console.log("Script loaded");

const userId = localStorage.getItem("userId");
const username = localStorage.getItem("username");

document.getElementById("playerName").textContent = username;

//Starting Game when page loads
window.onload = function () {
    startGame();
};

function startGame() {
    generatePuzzle();
    interval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    if (!timerPaused) {
        timer--;
        document.getElementById("timer").textContent = timer;

        if (timer <=0 ) {
            clearInterval(interval)
            endGame();
        }
    }
    
}

async function generatePuzzle() {
    timerPaused = true; //pause timer while fetching the puzzle
    console.log("Generating Puzzle...")

    try {
        //Getting Random numbers
        const numberRes = await fetch("https://api.mathjs.org/v4/?expr=randomInt(1,10)");
        const numberData = await numberRes.text();
        let randomNumber = parseInt(numberData);

        //Getting a temperature
        const weatherRes = await fetch("https://api.open-meteo.com/v1/forecast?latitude=51.5072&longitude=0.1276&current_weather=true");
        const weatherData = await weatherRes.json();

        if (!weatherData.current_weather) {
            throw new Error("Weather API failed");
        }

        let temperature = Math.abs(
            Math.round(weatherData.current_weather.temperature % 10)
        ) + 1;

        let puzzleText;

        if (currentAnswer === null) {
            currentAnswer = randomNumber * temperature;
            puzzleText = `${randomNumber} * ${temperature}`;
        }

        else {
            const operationType = Math.floor(Math.random() * 3);


        if (operationType === 0) {
            puzzleText = `? + ${randomNumber}`;
            currentAnswer = currentAnswer + randomNumber;
        }

        else if (operationType === 1) {
            puzzleText = `? * ${randomNumber}`;
            currentAnswer = currentAnswer * randomNumber;
        }

        else {
            if (currentAnswer % randomNumber === 0) {
                puzzleText = `? / ${randomNumber}`;
                currentAnswer = currentAnswer / randomNumber;
            } else {
                puzzleText = `? + ${randomNumber}`;
                currentAnswer = currentAnswer + randomNumber;
            }
        }
    }

    document.getElementById("puzzle").textContent = puzzleText + " = ?";

    } catch (error) {
        console.error("API error:", error);
        document.getElementById("puzzle").textContent = "Error loading puzzle.";
    } finally {
        timerPaused = false; //resume timer after puzzle is loaded
    }
}

function showNotification(message, isError = false) {
    const feedback = document.getElementById("feedback");
    feedback.textContent = message;

    // Optional styling
    feedback.style.color = isError ? "red" : "green";
}

function endGame() {
    alert("Game Over! Your score: " + score);
}

function submitAnswer() {
    const input = document.getElementById("answerInput");
    const userAnswer = parseInt(input.value);

    //Clear input immediately
    input.value = "";

    puzzleCount++;  // increment puzzle count for every answer

    if (userAnswer === currentAnswer) {
        //Correct
        score += 10;
        level += 1;
        timer += 5;
        showNotification("CORRECT!");
    } else {
        //Wrong
        timer -= 5
        showNotification("WRONG!", true)
    }

    //Update UI
    document.getElementById("score").textContent = score;
    document.getElementById("level").textContent = level;
    document.getElementById("timer").textContent = timer;

    if (puzzleCount >= maxPuzzles || timer <= 0) {
        endGame();
    } else {
        generatePuzzle();
    }

    
    }

   

