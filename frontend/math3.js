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

function endMathGame(){ gameOver=true; clearInterval(timerInterval); document.getElementById("finalScore").textContent=`Score: ${score}`; const stars=document.querySelectorAll(".star"); stars.forEach(s=>s.classList.remove("filled")); let starCount=0; if(score>=30) starCount=3; else if(score>=20) starCount=2; else if(score>=10) starCount=1; for(let i=0;i<starCount;i++) stars[i].classList.add("filled"); document.getElementById("resultModal").classList.remove("hidden"); }

document.getElementById("submitBtn").addEventListener("click",checkMathAnswer);
document.getElementById("retryBtn").onclick=()=>location.reload();
document.getElementById("homeBtn").onclick=()=>window.location.href="index.html";
document.getElementById("nextBtn").onclick=()=>alert("Next mode coming soon!");

window.onload=startMathGame;
function startMathGame(){ previousAnswer=null; chainStarted=false; mathQuestionNumber=0; score=0; attemptsLeft=3; gameOver=false; document.getElementById("mathInput").value=""; showFeedback(""); loadMathQuestion(); }