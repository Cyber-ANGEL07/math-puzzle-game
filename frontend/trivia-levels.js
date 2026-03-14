document.addEventListener("DOMContentLoaded", () => {
  const level1Btn = document.getElementById("level1Btn");
  const level2Btn = document.getElementById("level2Btn");
  const level3Btn = document.getElementById("level3Btn");

  // Level 1 always unlocked
  if (level1Btn) {
    level1Btn.disabled = false;
    level1Btn.onclick = () => window.location.href = "trivia.html";
  }

  // Level 2 unlock
  if (level2Btn) {
    if (localStorage.getItem("triviaLevel2Unlocked") === "true") {
      level2Btn.disabled = false;
      level2Btn.textContent = "Level 2: Medium";
      level2Btn.onclick = () => window.location.href = "trivia2.html";
    } else {
      level2Btn.disabled = true;
      level2Btn.textContent = "Level 2: Locked 🔒";
    }
  }

  // Level 3 unlock
  if (level3Btn) {
    if (localStorage.getItem("triviaLevel3Unlocked") === "true") {
      level3Btn.disabled = false;
      level3Btn.textContent = "Level 3: Hard";
      level3Btn.onclick = () => window.location.href = "trivia3.html";
    } else {
      level3Btn.disabled = true;
      level3Btn.textContent = "Level 3: Locked 🔒";
    }
  }
});