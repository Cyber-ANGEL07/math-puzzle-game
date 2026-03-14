// ==========================
// LEVEL BUTTON REFERENCES
// ==========================
const level1Btn = document.getElementById("level1Btn");
const level2Btn = document.getElementById("level2Btn");
const level3Btn = document.getElementById("level3Btn");


// ==========================
// LEVEL 1 (always unlocked)
// ==========================
level1Btn.onclick = () => {
  window.location.href = "trivia.html";
};


// ==========================
// UNLOCK LEVEL 2
// ==========================
if (localStorage.getItem("triviaLevel2Unlocked") === "true") {

  level2Btn.disabled = false;
  level2Btn.textContent = "Level 2: Medium";

  level2Btn.onclick = () => {
    window.location.href = "trivia2.html";
  };
}


// ==========================
// UNLOCK LEVEL 3
// ==========================
if (localStorage.getItem("triviaLevel3Unlocked") === "true") {

  level3Btn.disabled = false;
  level3Btn.textContent = "Level 3: Hard";

  level3Btn.onclick = () => {
    window.location.href = "trivia3.html";
  };
}