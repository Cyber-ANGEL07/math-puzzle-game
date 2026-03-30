// ==================== USER CHECK ====================
const userId = localStorage.getItem("userId");
if (!userId) window.location.href = "auth.html";

// ==================== AUDIO SETUP ====================
const bgm = document.getElementById("bgm");
const clickSound = document.getElementById("clickSound");
const buttonSound = document.getElementById("buttonSound");
const muteBtn = document.getElementById("muteBtn");

let isMuted = localStorage.getItem("bgmMuted") === "true";

function setMuted(muted) {
  isMuted = muted;
  bgm.muted = muted;
  clickSound.muted = muted;
  buttonSound.muted = muted;
  muteBtn.textContent = muted ? "🔇" : "🔊";
  localStorage.setItem("bgmMuted", muted);
}
setMuted(isMuted);

function toggleMute() {
  setMuted(!isMuted);
}

function playSound(sound) {
  if (!isMuted && sound) {
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }
}

// ==================== BGM START (with autoplay fallback) ====================
let bgmStarted = false;
function startBGM() {
  if (bgmStarted) return;
  bgm.volume = 0.2;
  bgm.play()
    .then(() => bgmStarted = true)
    .catch(() => {
      document.addEventListener('click', function retry() {
        startBGM();
        document.removeEventListener('click', retry);
      });
    });
}

// ==================== RETRO OSCILLOSCOPE BACKGROUND ====================
const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");
let time = 0;

function initOscilloscope() {
  resizeCanvas();
  animate();
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);

function animate() {
  time += 0.05;
  ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid();
  drawWaveform();
  drawScanningDot();

  requestAnimationFrame(animate);
}

function drawGrid() {
  ctx.strokeStyle = 'rgba(255, 176, 0, 0.1)';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.strokeStyle = 'rgba(255, 176, 0, 0.05)';
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.strokeStyle = 'rgba(255, 176, 0, 0.05)';
    ctx.stroke();
  }
}

function drawWaveform() {
  ctx.beginPath();
  ctx.strokeStyle = '#ffb000';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#ffb000';
  ctx.shadowBlur = 10;
  const centerY = canvas.height / 2;
  for (let x = 0; x < canvas.width; x += 5) {
    const y = centerY + 
      Math.sin(x * 0.02 + time) * 30 + 
      Math.sin(x * 0.01 + time * 2) * 15 +
      Math.cos(x * 0.03 + time * 1.3) * 10;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawScanningDot() {
  const x = (time * 50) % canvas.width;
  const centerY = canvas.height / 2;
  const y = centerY + 
    Math.sin(x * 0.02 + time) * 30 + 
    Math.sin(x * 0.01 + time * 2) * 15 +
    Math.cos(x * 0.03 + time * 1.3) * 10;

  ctx.shadowColor = '#ffb000';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 10;
  ctx.fillStyle = '#ffb000';
  ctx.beginPath();
  ctx.arc(x, y, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
}

// ==================== LEVEL UNLOCK LOGIC ====================
document.addEventListener("DOMContentLoaded", () => {
  // Start BGM and background
  startBGM();
  initOscilloscope();

  const level1Btn = document.getElementById("level1Btn");
  const level2Btn = document.getElementById("level2Btn");
  const level3Btn = document.getElementById("level3Btn");

  // Level 1 always unlocked
  if (level1Btn) {
    level1Btn.disabled = false;
    level1Btn.onclick = () => {
      playSound(buttonSound);
      setTimeout(() => window.location.href = "trivia.html", 300);
    };
  }

  // Level 2 unlock
  if (level2Btn) {
    if (localStorage.getItem("triviaLevel2Unlocked") === "true") {
      level2Btn.disabled = false;
      level2Btn.textContent = "Level 2: Medium";
      level2Btn.onclick = () => {
        playSound(buttonSound);
        setTimeout(() => window.location.href = "trivia2.html", 300);
      };
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
      level3Btn.onclick = () => {
        playSound(buttonSound);
        setTimeout(() => window.location.href = "trivia3.html", 300);
      };
    } else {
      level3Btn.disabled = true;
      level3Btn.textContent = "Level 3: Locked 🔒";
    }
  }
});