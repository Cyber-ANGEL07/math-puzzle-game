async function saveProgress(userId, mode, level, score, stars, completed) {
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