let score = 0;
let level = 1;
let timer = 30;
let currentAnswer = null;
let interval = null;

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
    timer--;
    document.getElementById("timer").textContent = timer;

    if (timer <=0 ) {
        clearInterval(interval)
        endGame();
    }
}

async function generatePuzzle() {
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
    }
}

function endGame() {
    alert("Game Over! Your score: " + score);
}