let level = 1;
let score = 0;

function startGame() {
  const username = localStorage.getItem("banana_username");

  // Restore progress if available
  const savedProgress = localStorage.getItem("banana_progress");
  if (savedProgress) {
    const data = JSON.parse(savedProgress);
    level = data.level;
    score = data.score;
  }

  // Show player info
  document.getElementById("playerName").textContent = username;
  document.getElementById("level").textContent = level;
  document.getElementById("score").textContent = score;

  // Show puzzle placeholder
  loadPuzzle();
}

function loadPuzzle() {
  document.getElementById("puzzleArea").textContent =
    "Puzzle will load here 🍌";
}
