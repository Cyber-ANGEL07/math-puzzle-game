window.onload = () => {
    const level2 = document.getElementById("mathLevel2");
    const level3 = document.getElementById("mathLevel3");

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

    // Redirect when unlocked button clicked
    level2.onclick = () => {
        if (!level2.disabled) window.location.href = "math.html?level=2";
    };
    level3.onclick = () => {
        if (!level3.disabled) window.location.href = "math.html?level=3";
    };
};