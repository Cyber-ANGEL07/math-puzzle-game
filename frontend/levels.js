
function startLevel(levelNumber) {
  // Hide the level menu
  document.getElementById("levelMenu").style.display = "none";

  // Show the game container
  const gameContainer = document.getElementById("gameContainer");
  gameContainer.style.display = "block";

  // Update title
  document.getElementById("levelTitle").innerText = `Level ${levelNumber}`;

  // Start the appropriate level
  if (levelNumber === 1) {
    startGame(); // your trivia startGame() function
  }
  // You can add similar logic for Level 2, 3 later
}

document.getElementById("level1Btn").addEventListener("click", () => {
    window.location.href = "trivia.html";
  });