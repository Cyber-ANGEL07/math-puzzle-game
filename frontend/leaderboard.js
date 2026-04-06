const gameSelect = document.getElementById("gameSelect");
const container = document.getElementById("leaderboardContainer");

async function loadLeaderboard(game) {
  try {
    const response = await fetch(`http://localhost:3000/api/leaderboard/${game}?limit=10`);
    const data = await response.json();

    container.innerHTML = "";

    if (!data.length) {
      container.innerHTML = "<p style='color:#ffb000; text-align:center'>⏳ No scores yet. Play a game!</p>";
      return;
    }

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
      <div class="username">${escapeHtml(entry.username)}</div>
      <div class="score">
  ⭐ ${entry.score}
  <span class="total-score"> | Σ ${entry.totalScore ?? entry.score}</span>
</div>
    `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to load leaderboard:", err);
    container.innerHTML = "<p style='color:#ff3300; text-align:center'>⚠️ FAILED TO LOAD. TRY AGAIN.</p>";
  }
}

// Simple XSS prevention
function escapeHtml(str) {
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

loadLeaderboard(gameSelect.value);
gameSelect.addEventListener("change", () => loadLeaderboard(gameSelect.value));