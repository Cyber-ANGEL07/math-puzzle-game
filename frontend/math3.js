let score = 0;
let previousAnswer = null;
let currentQuestion = "";
let chainStarted = false;
let mathQuestionNumber = 0;
let attemptsLeft = 3;
const MAX_QUESTIONS = 3;
let gameOver = false;

let TIME_PER_QUESTION = 10;
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

function getNumberBasedOnDifficulty(){ return Math.floor(Math.random()*41)+10; } // 10-50

function showFeedback(msg){ document.getElementById("feedback").textContent = msg; }
function updateUI(){ document.getElementById("mathQuestion").textContent=currentQuestion; document.getElementById("score").textContent=`Score: ${score} | Attempts left: ${attemptsLeft}`; }

function startTimer(){ clearInterval(timerInterval); timeLeft=TIME_PER_QUESTION; updateTimerUI();
timerInterval=setInterval(()=>{timeLeft--; updateTimerUI(); if(timeLeft<=0){clearInterval(timerInterval); attemptsLeft--; showFeedback(`⏰ Time's up! Attempts left: ${attemptsLeft}`); handleNextQuestion(false);} },1000); }

function updateTimerUI(){ const timerBar=document.getElementById("timerBar"); const percentage=(timeLeft/TIME_PER_QUESTION)*100; timerBar.style.width=percentage+"%"; document.getElementById("timer").textContent=`Time: ${timeLeft}s`; timerBar.classList.toggle("panic",timeLeft<=5); }

function generateFirstQuestion(){ const num1=getNumberBasedOnDifficulty(),num2=getNumberBasedOnDifficulty(),operators=["+","-","*","/"],operator=operators[Math.floor(Math.random()*operators.length)];
switch(operator){case "+": mathAnswer=num1+num2; currentQuestion=`${num1} + ${num2} = ?`; break;
case "-": mathAnswer=Math.abs(num1-num2); currentQuestion=(num1>=num2)? `${num1} - ${num2} = ?` : `${num2} - ${num1} = ?`; break;
case "*": mathAnswer=num1*num2; currentQuestion=`${num1} × ${num2} = ?`; break;
case "/": mathAnswer=num2; currentQuestion=`${num1*num2} ÷ ${num1} = ?`; break; }
updateUI(); }

function generateChainQuestion(){ if(previousAnswer===null) return generateFirstQuestion(); const num=getNumberBasedOnDifficulty(); const operators=["+","-","*","/"]; const operator=operators[Math.floor(Math.random()*operators.length)];
switch(operator){case "+": mathAnswer=previousAnswer+num; currentQuestion=`? + ${num} = ?`; break;
case "-": mathAnswer=previousAnswer-num>0? previousAnswer-num:previousAnswer+num; currentQuestion=previousAnswer-num>0?`? - ${num} = ?`:`? + ${num} = ?`; break;
case "*": mathAnswer=previousAnswer*num; currentQuestion=`? × ${num} = ?`; break;
case "/": const dividend=previousAnswer*num; mathAnswer=previousAnswer; currentQuestion=`${dividend} ÷ ? = ?`; break; }
updateUI(); }

function checkMathAnswer(){ if(gameOver)return; const userAnswer=parseInt(document.getElementById("mathInput").value); if(isNaN(userAnswer)){alert("Enter a number!"); return;} clearInterval(timerInterval);
if(userAnswer===mathAnswer){score+=10;if(score>30)score=30; showFeedback("✅ Correct!"); previousAnswer=mathAnswer; chainStarted=true; } else { attemptsLeft--; showFeedback(`❌ Wrong! Attempts left: ${attemptsLeft}`); previousAnswer=null; chainStarted=false; }
mathQuestionNumber++; if(mathQuestionNumber>=MAX_QUESTIONS || attemptsLeft<=0){setTimeout(endMathGame,1000);} else {setTimeout(loadMathQuestion,1000);} }

function loadMathQuestion(){ document.getElementById("mathInput").value=""; if(chainStarted && previousAnswer!==null) generateChainQuestion(); else generateFirstQuestion(); startTimer(); }

function handleNextQuestion(correct){ mathQuestionNumber++; if(mathQuestionNumber>=MAX_QUESTIONS || attemptsLeft<=0) endMathGame(); else setTimeout(loadMathQuestion,1000); }

function endMathGame(){
     gameOver=true; 
     clearInterval(timerInterval); 
     document.getElementById("finalScore").textContent=`Score: ${score}`;
     const stars=document.querySelectorAll(".star"); 
     stars.forEach(s=>s.classList.remove("filled")); 
     let starCount = 0;
     if(score >= 30) starCount = 3;
     else if(score >= 20) starCount = 2;
     else if(score >= 10) starCount = 1;

     for(let i=0;i<starCount;i++) stars[i].classList.add("filled");
     document.getElementById("resultModal").classList.remove("hidden");
     }

document.getElementById("submitBtn").addEventListener("click",checkMathAnswer);
document.getElementById("retryBtn").onclick=()=>location.reload();
document.getElementById("homeBtn").onclick=()=>window.location.href="index.html";
document.getElementById("nextBtn").onclick = async () => {
    const params = new URLSearchParams(window.location.search);
    const level = params.get("level") || "2"; // adjust default if needed
    const userId = localStorage.getItem("userId", "6992dcec46556e60be825ef7");

    const completed = score === 30; // only perfect score counts

    // save progress to backend
    await saveProgressToBackend(
        userId,
        "math",
        parseInt(level),
        score,
        starCount,
        completed
    );

    // localStorage unlock
    if(completed){
        if(level === "1") localStorage.setItem("mathLevel1Completed", "true");
        else if(level === "2") localStorage.setItem("mathLevel2Completed", "true");
        else if(level === "3") localStorage.setItem("mathLevel3Completed", "true");
    }

    // go back to level selection
    window.location.href = "math-levels.html";
};

window.onload=startMathGame;
function startMathGame(){ 
    previousAnswer=null;
    chainStarted=false;
    mathQuestionNumber=0;
    score=0;
    attemptsLeft=3;
    gameOver=false;
    document.getElementById("mathInput").value="";
    showFeedback("");
    loadMathQuestion();
}