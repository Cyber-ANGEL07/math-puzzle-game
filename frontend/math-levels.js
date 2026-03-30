// ================= SOUND HELPER =================
// (Global functions defined in HTML, but we keep a local reference)
function playSound(sound) {
    if (!sound) return;
    sound.currentTime = 0;
    sound.play().catch(() => {});
}

window.onload = () => {
    const level1 = document.getElementById("mathLevel1");
    const level2 = document.getElementById("mathLevel2");
    const level3 = document.getElementById("mathLevel3");
    const backBtn = document.getElementById("backBtn");
    const buttonSound = document.getElementById("buttonSound");

    // Unlock Medium if Easy was completed perfectly
    if (localStorage.getItem("mathLevel1Completed") === "true") {
        level2.disabled = false;
        level2.textContent = "Level 2: Medium";
    }

    // Unlock Hard if Medium was completed perfectly
    if (localStorage.getItem("mathLevel2Completed") === "true") {
        level3.disabled = false;
        level3.textContent = "Level 3: Hard";
    }

    // Level 1 link – intercept click to play sound before navigation
    if (level1) {
        level1.addEventListener("click", (e) => {
            e.preventDefault();           // stop immediate navigation
            playSound(buttonSound);
            setTimeout(() => {
                window.location.href = level1.href;
            }, 300);
        });
    }

    // Level 2 button (if unlocked)
    if (level2 && !level2.disabled) {
        level2.onclick = (e) => {
            e.preventDefault();
            playSound(buttonSound);
            setTimeout(() => {
                window.location.href = "math.html?level=2";
            }, 300);
        };
    } else if (level2) {
        // Keep original disabled state – no sound needed
    }

    // Level 3 button (if unlocked)
    if (level3 && !level3.disabled) {
        level3.onclick = (e) => {
            e.preventDefault();
            playSound(buttonSound);
            setTimeout(() => {
                window.location.href = "math.html?level=3";
            }, 300);
        };
    }

    // Back button sound
    if (backBtn) {
        backBtn.addEventListener("click", (e) => {
            e.preventDefault();
            playSound(buttonSound);
            setTimeout(() => {
                window.location.href = backBtn.href;
            }, 300);
        });
    }
};