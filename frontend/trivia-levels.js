document.getElementById("level1Btn").onclick = () => {
    window.location.href = "trivia.html";
};

// LEVEL 2 UNLOCK
const level2Btn = document.getElementById("triviaLevel2");

if(localStorage.getItem("triviaLevel2Unlocked")){
    level2Btn.disabled = false;
    level2Btn.textContent = "Level 2: Medium";
}

level2Btn.onclick = () => {
    window.location.href = "trivia2.html";
};


// LEVEL 3 UNLOCK
const level3Btn = document.getElementById("triviaLevel3");

if(localStorage.getItem("triviaLevel3Unlocked")){
    level3Btn.disabled = false;
    level3Btn.textContent = "Level 3: Hard";
}

level3Btn.onclick = () => {
    window.location.href = "trivia3.html";
};