const gameSelect = document.getElementById("gameSelect");
const container = document.getElementById("leaderboardContainer");

// Load leaderboard
async function loadLeaderboard(game) {
  try {
    const response = await fetch(`http://localhost:3000/api/leaderboard/${game}?limit=10`);
    const data = await response.json();

    // Clear previous entries
    container.innerHTML = "";

    data.forEach((entry, idx) => {
      const card = document.createElement("div");
      card.classList.add("leaderboard-card");

      // Top 3 styling
      let rankClass = "";
      if (idx === 0) rankClass = "rank-1";
      else if (idx === 1) rankClass = "rank-2";
      else if (idx === 2) rankClass = "rank-3";

      card.innerHTML = `
        <div class="rank ${rankClass}">${idx + 1}</div>
        <div class="username">${entry.username}</div>
        <div class="score">${entry.score}</div>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.error("Failed to load leaderboard:", err);
    container.innerHTML = "<p style='color:red'>Failed to load leaderboard.</p>";
  }
}

// Load default leaderboard
loadLeaderboard(gameSelect.value);

// Change leaderboard when selecting a game
gameSelect.addEventListener("change", () => {
  loadLeaderboard(gameSelect.value);
});