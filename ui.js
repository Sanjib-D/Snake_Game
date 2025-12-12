const sections = {
  landing: document.getElementById("landing-page"),
  modeSelect: document.getElementById("mode-selection"),
  game: document.getElementById("game-area"),
};

const ui = {
  score: document.getElementById("score"),
  finalScore: document.getElementById("final-score"),
  startScreen: document.getElementById("start-screen"),
  gameOverScreen: document.getElementById("game-over-screen"),
  modeDisplay: document.getElementById("current-mode-display"),
  modeTitle: document.getElementById("mode-title"),
  modeInstruction: document.getElementById("mode-instruction"),
  saveContainer: document.getElementById("save-score-container"),
  saveMsg: document.getElementById("save-message"),
  nameInput: document.getElementById("player-name"),
  saveBtn: document.getElementById("save-btn"),
  top10List: document.getElementById("top-10-list"),
  top100List: document.getElementById("top-100-list"),
  leaderboardModal: document.getElementById("leaderboard-modal"),
  creditsModal: document.getElementById("credits-modal"), // NEW: Added Credits Modal
  healthContainer: document.getElementById("health-bar-container"),
  healthFill: document.getElementById("health-fill"),
  reverseAlert: document.getElementById("reverse-alert"),
};

function setupGameUI(mode) {
  ui.modeDisplay.innerText = mode.replace("_", " ").toUpperCase();
  ui.modeTitle.innerText = mode.replace("_", " ").toUpperCase() + " MODE";

  const instructions = {
    classic: "Eat food. Don't hit walls.",
    time_attack: "Time Limit! Score points quickly.",
    obstacle: "Avoid the gray blocks!",
    speed_rush: "Speed increases drastically!",
    maze: "Navigate the maze.",
    boss_food: "Every 10th food is a BOSS. Hit it 5 times!",
    survival: "Don't die! Wall hits cost Health.",
    dark_mode: "Limited visibility. Watch out!",
    poison: "Avoid Purple Poison food!",
    reverse: "CAUTION: Controls flip every 5 seconds!",
    portal: "Blue portals take you to Orange portals.",
    multi_food: "Multiple foods appear! Eat them before they vanish.",
  };
  ui.modeInstruction.innerText = instructions[mode] || "Play carefully.";

  // Hide all overlays initially
  ui.startScreen.classList.remove("hidden");
  ui.gameOverScreen.classList.add("hidden");
  ui.reverseAlert.style.display = "none";

  if (mode === "survival") {
    ui.healthContainer.style.display = "block";
    updateHealthUI(100);
  } else {
    ui.healthContainer.style.display = "none";
  }

  ui.saveContainer.style.display = "flex";
  ui.saveContainer.classList.remove("hidden");
  ui.saveMsg.style.display = "none";
  ui.saveMsg.classList.add("hidden");
  ui.saveBtn.disabled = false;
  ui.saveBtn.innerText = "Save Score";
  ui.saveBtn.style.backgroundColor = "";
  ui.nameInput.value = "";
}

function showSection(sectionId) {
  Object.values(sections).forEach((sec) => {
    if (sec) {
      sec.classList.remove("active-section");
      sec.classList.add("hidden-section");
    }
  });

  if (sectionId === "landing") sections.landing.classList.add("active-section");
  else if (sectionId === "mode") {
    sections.modeSelect.classList.add("active-section");
    if (typeof subscribeToTop10 === "function") subscribeToTop10();
  } else if (sectionId === "game")
    sections.game.classList.add("active-section");

  const active = document.querySelector(".active-section");
  if (active) active.classList.remove("hidden-section");
}

function showModeSelection() {
  stopGameEngine();
  showSection("mode");
}

function goToHome() {
  stopGameEngine();
  showSection("landing");
}

function toggleTheme() {
  const body = document.body;
  const btnIcon = document.querySelector("#theme-toggle-btn i");
  if (body.getAttribute("data-theme") === "light") {
    body.setAttribute("data-theme", "dark");
    btnIcon.className = "fas fa-sun";
  } else {
    body.setAttribute("data-theme", "light");
    btnIcon.className = "fas fa-moon";
  }
}

function updateHealthUI(percent) {
  ui.healthFill.style.width = percent + "%";
  if (percent > 50) ui.healthFill.style.background = "#2ecc71";
  else if (percent > 20) ui.healthFill.style.background = "#f1c40f";
  else ui.healthFill.style.background = "#e74c3c";
}

function showGameOverUI(finalScore) {
  ui.finalScore.innerText = finalScore;
  ui.gameOverScreen.classList.remove("hidden");
}

// --- NEW: Credits Modal Functions ---
function openCreditsModal() {
  if (ui.creditsModal) ui.creditsModal.classList.remove("hidden");
}

function closeCreditsModal() {
  if (ui.creditsModal) ui.creditsModal.classList.add("hidden");
}

// --- Global Click Handler: Close Modals when clicking outside ---
window.onclick = function (event) {
  if (event.target === ui.leaderboardModal) {
    closeLeaderboardModal();
  }
  if (event.target === ui.creditsModal) {
    closeCreditsModal();
  }
};

showSection("landing");
