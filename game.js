// --- CONFIGURATION ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const TILE_SIZE = 30;
const TILE_COUNT_X = canvas.width / TILE_SIZE;
const TILE_COUNT_Y = canvas.height / TILE_SIZE;

// --- NEW SCALING CONFIG ---
const DRAW_SCALE = 2.2;
const TAIL_SCALE = 2.3;
const BOSS_SCALE = 2.0;
const BODY_SCALE = 1.9; // New Body Scale

// --- ASSETS ---
const assets = {
  head: new Image(),
  body: new Image(),
  tail: new Image(),
  food: new Image(),
  poison: new Image(),
  obstacle: new Image(),
  portal: new Image(),
  boss: new Image(),
};
assets.head.src = "assets/head.png";
assets.body.src = "assets/body.png";
assets.tail.src = "assets/tail.png";
assets.food.src = "assets/food.png";
assets.poison.src = "assets/poison.png";
assets.obstacle.src = "assets/obstacle.png";
assets.portal.src = "assets/portal.png";
assets.boss.src = "assets/boss.png";

// --- GAME STATE ---
let score = 0;
let gameSpeed = 150;
let gameRunning = false;
let isPaused = false;
let gameLoopTimeout;
let currentMode = "classic";
let snake = [];
let food = { x: 10, y: 10 };
let foodList = [];
let dx = 0,
  dy = 0;
let nextDx = 0,
  nextDy = 0;

let foodsEaten = 0;
let timeLeft = 60;
let timeInterval = null;
let obstacles = [];
let portals = [];

// Boss & Survival
let bossActive = false;
let bossHP = 5;
let health = 100;
let poisonFood = { x: -1, y: -1 };

// Arcade Mechanics
let isReversed = false;
let reverseInterval = null;
let multiFoodInterval = null;
let moveObstacleInterval = null;

// --- EXTERNAL CONTROLS ---
function stopGameEngine() {
  gameRunning = false;
  isPaused = false;
  clearTimeout(gameLoopTimeout);
  clearInterval(timeInterval);
  clearInterval(reverseInterval);
  clearInterval(multiFoodInterval);
  clearInterval(moveObstacleInterval);
}

function startGame(mode) {
  currentMode = mode;
  showSection("game");
  setupGameUI(mode);
  initGameConfig();
  draw();
}

function resetGame() {
  stopGameEngine();
  startGame(currentMode);
}

function initGameConfig() {
  snake = [
    { x: 15, y: 15 },
    { x: 15, y: 16 },
    { x: 15, y: 17 },
  ];
  dx = 0;
  dy = -1;
  nextDx = 0;
  nextDy = -1;
  score = 0;
  foodsEaten = 0;
  ui.score.innerText = "0";
  obstacles = [];
  portals = [];
  foodList = [];

  clearInterval(timeInterval);
  clearInterval(reverseInterval);
  clearInterval(multiFoodInterval);
  clearInterval(moveObstacleInterval);

  bossActive = false;
  bossHP = 5;
  health = 100;
  poisonFood = { x: -1, y: -1 };
  isReversed = false;
  isPaused = false;
  ui.reverseAlert.style.display = "none";

  // --- MODE SETUP ---
  if (currentMode === "classic") gameSpeed = 250;
  else if (currentMode === "time_attack") {
    gameSpeed = 100;
    timeLeft = 60;
    ui.score.innerText = "0 | Time: 60";
  } else if (currentMode === "obstacle") {
    gameSpeed = 150;
    generateObstacles(15);
    startMovingObstacles();
  } else if (currentMode === "speed_rush") gameSpeed = 100;
  else if (currentMode === "maze") {
    gameSpeed = 150;
    generateMaze();
  } else if (currentMode === "boss_food") gameSpeed = 140;
  else if (currentMode === "survival") gameSpeed = 140;
  else if (currentMode === "dark_mode") gameSpeed = 150;
  else if (currentMode === "poison") gameSpeed = 140;
  else if (currentMode === "reverse") {
    gameSpeed = 140;
    startReverseLogic();
  } else if (currentMode === "portal") {
    gameSpeed = 150;
    generatePortals(3);
  } else if (currentMode === "multi_food") {
    gameSpeed = 140;
    spawnMultiFood();
    startMultiFoodTimer();
  }

  placeFood();
}

// --- LOGIC HELPERS ---
function startReverseLogic() {
  reverseInterval = setInterval(() => {
    if (isPaused) return;
    isReversed = !isReversed;
    ui.reverseAlert.style.display = isReversed ? "block" : "none";
    ui.reverseAlert.innerText = isReversed ? "⚠ CONTROLS REVERSED! ⚠" : "";
  }, 5000);
}

function startMultiFoodTimer() {
  multiFoodInterval = setInterval(() => {
    if (isPaused) return;
    spawnMultiFood();
  }, 4000);
}

function startMovingObstacles() {
  moveObstacleInterval = setInterval(() => {
    if (isPaused) return;
    for (let i = 0; i < 5 && i < obstacles.length; i++) {
      const moveDir = Math.random() > 0.5 ? 1 : -1;
      if (Math.random() > 0.5) {
        obstacles[i].x =
          (obstacles[i].x + moveDir + TILE_COUNT_X) % TILE_COUNT_X;
      } else {
        obstacles[i].y =
          (obstacles[i].y + moveDir + TILE_COUNT_Y) % TILE_COUNT_Y;
      }
    }
    if (!gameRunning) draw();
  }, 2000);
}

function startLoop() {
  if (!gameRunning) {
    gameRunning = true;
    isPaused = false;
    ui.startScreen.classList.add("hidden");

    if (currentMode === "time_attack") {
      timeInterval = setInterval(() => {
        if (isPaused) return;
        timeLeft--;
        ui.score.innerText = `${score} | Time: ${timeLeft}`;
        if (timeLeft <= 0) gameOver();
      }, 1000);
    }
    gameLoop();
  }
}

function gameLoop() {
  if (!gameRunning) return;
  if (isPaused) {
    // FIXED: Redraw game AND pause screen to prevent black screen stacking
    draw();
    drawPauseScreen();
    gameLoopTimeout = setTimeout(gameLoop, 100);
    return;
  }
  advanceSnake();
  if (checkCollisions()) {
    gameOver();
    return;
  }
  draw();
  gameLoopTimeout = setTimeout(gameLoop, gameSpeed);
}

function advanceSnake() {
  dx = nextDx;
  dy = nextDy;
  let head = { x: snake[0].x + dx, y: snake[0].y + dy };

  if (currentMode === "time_attack") {
    if (head.x < 0) head.x = TILE_COUNT_X - 1;
    if (head.x >= TILE_COUNT_X) head.x = 0;
    if (head.y < 0) head.y = TILE_COUNT_Y - 1;
    if (head.y >= TILE_COUNT_Y) head.y = 0;
  }

  if (currentMode === "portal") {
    for (let p of portals) {
      if (head.x === p.x1 && head.y === p.y1) {
        head.x = p.x2;
        head.y = p.y2;
      } else if (head.x === p.x2 && head.y === p.y2) {
        head.x = p.x1;
        head.y = p.y1;
      }
    }
  }

  snake.unshift(head);

  let ate = false;
  if (currentMode === "multi_food") {
    for (let i = 0; i < foodList.length; i++) {
      if (head.x === foodList[i].x && head.y === foodList[i].y) {
        score += 10;
        foodList.splice(i, 1);
        ate = true;
        break;
      }
    }
  } else if (head.x === food.x && head.y === food.y) {
    if (currentMode === "boss_food" && bossActive) {
      bossHP--;
      if (bossHP <= 0) {
        score += 50;
        bossActive = false;
        ate = true;
      } else {
        score += 5;
        snake.pop();
        placeFood();
        return;
      }
    } else {
      score += 10;
      foodsEaten++;
      ate = true;
      if (currentMode === "boss_food" && foodsEaten % 10 === 0) {
        bossActive = true;
        bossHP = 5;
      }
    }

    if (currentMode === "survival") {
      health = Math.min(100, health + 10);
      updateHealthUI(health);
    }
    placeFood();
  } else if (
    currentMode === "poison" &&
    head.x === poisonFood.x &&
    head.y === poisonFood.y
  ) {
    score = Math.max(0, score - 20);
    snake.pop();
    snake.pop();
    if (snake.length === 0) {
      gameOver();
      return;
    }
    placeFood();
  }

  if (ate) {
    updateScoreBoard();
    handleSpeed();
  } else {
    snake.pop();
  }
}

function checkCollisions() {
  const head = snake[0];
  let hitWall = false;

  if (currentMode !== "time_attack") {
    if (
      head.x < 0 ||
      head.x >= TILE_COUNT_X ||
      head.y < 0 ||
      head.y >= TILE_COUNT_Y
    )
      hitWall = true;
  }

  if (!hitWall) {
    for (let obs of obstacles)
      if (head.x === obs.x && head.y === obs.y) hitWall = true;
  }

  let hitSelf = false;
  for (let i = 1; i < snake.length; i++)
    if (head.x === snake[i].x && head.y === snake[i].y) hitSelf = true;

  if (hitWall || hitSelf) {
    if (currentMode === "survival") {
      health -= 20;
      updateHealthUI(health);
      snake.shift();
      if (snake.length === 0 || health <= 0) return true;
      return false;
    } else return true;
  }
  return false;
}

function updateScoreBoard() {
  if (currentMode === "time_attack")
    ui.score.innerText = `${score} | Time: ${timeLeft}`;
  else ui.score.innerText = score;
}

function handleSpeed() {
  if (currentMode === "classic" && gameSpeed > 50) gameSpeed -= 2;
  if (currentMode === "speed_rush" && foodsEaten % 3 === 0 && gameSpeed > 40)
    gameSpeed -= 10;
}

function gameOver() {
  stopGameEngine();
  showGameOverUI(score);
}

// --- GENERATORS ---
function placeFood() {
  if (currentMode === "multi_food") return;
  food = getRandomEmptyPos();
  if (currentMode === "poison") poisonFood = getRandomEmptyPos();
}

function spawnMultiFood() {
  foodList = [];
  for (let i = 0; i < 5; i++) foodList.push(getRandomEmptyPos());
}

function getRandomEmptyPos() {
  let valid = false;
  let pos = { x: 0, y: 0 };
  while (!valid) {
    pos.x = Math.floor(Math.random() * TILE_COUNT_X);
    pos.y = Math.floor(Math.random() * TILE_COUNT_Y);
    valid = true;
    for (let part of snake)
      if (part.x === pos.x && part.y === pos.y) valid = false;
    for (let obs of obstacles)
      if (obs.x === pos.x && obs.y === pos.y) valid = false;
    for (let p of portals)
      if (
        (pos.x === p.x1 && pos.y === p.y1) ||
        (pos.x === p.x2 && pos.y === p.y2)
      )
        valid = false;
  }
  return pos;
}

function generateObstacles(count) {
  obstacles = [];
  for (let i = 0; i < count; i++) {
    let obs = getRandomEmptyPos();
    if (Math.abs(obs.x - 15) < 3 && Math.abs(obs.y - 15) < 3) i--;
    else obstacles.push(obs);
  }
}

function generateMaze() {
  obstacles = [];
  for (let x = 5; x < 25; x++) {
    if (x !== 10 && x !== 20) obstacles.push({ x: x, y: 5 });
    if (x !== 15) obstacles.push({ x: x, y: 25 });
  }
  for (let y = 5; y < 25; y++) {
    if (y !== 15) obstacles.push({ x: 5, y: y });
    if (y !== 10 && y !== 20) obstacles.push({ x: 25, y: y });
  }
}

function generatePortals(count) {
  portals = [];
  const colors = ["#00a8ff", "#9c88ff", "#fbc531"];
  for (let i = 0; i < count; i++) {
    let p1 = getRandomEmptyPos();
    let p2 = getRandomEmptyPos();
    portals.push({
      x1: p1.x,
      y1: p1.y,
      x2: p2.x,
      y2: p2.y,
      color: colors[i % colors.length],
    });
  }
}

// --- DRAWING ---
function draw() {
  const computedStyle = getComputedStyle(document.body);
  // Background
  ctx.fillStyle = computedStyle.getPropertyValue("--card-bg").trim();
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // NEW: Draw Border around Playable Area
  ctx.strokeStyle = computedStyle.getPropertyValue("--text-color").trim(); // Use theme text color
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  // Obstacles
  for (let obs of obstacles) {
    drawElement(assets.obstacle, obs.x, obs.y, "#7f8c8d");
  }

  // Portals
  if (currentMode === "portal") {
    for (let p of portals) {
      drawElement(assets.portal, p.x1, p.y1, p.color);
      drawElement(assets.portal, p.x2, p.y2, p.color);
    }
  }

  // Food
  if (currentMode === "multi_food") {
    for (let f of foodList) drawElement(assets.food, f.x, f.y, "#ff4757");
  } else if (currentMode === "boss_food" && bossActive) {
    drawElement(assets.boss, food.x, food.y, "#f1c40f", BOSS_SCALE);
    ctx.fillStyle = "black";
    ctx.fillRect(food.x * TILE_SIZE, food.y * TILE_SIZE - 6, TILE_SIZE, 4);
    ctx.fillStyle = "red";
    ctx.fillRect(
      food.x * TILE_SIZE,
      food.y * TILE_SIZE - 6,
      (TILE_SIZE / 5) * bossHP,
      4
    );
  } else {
    drawElement(assets.food, food.x, food.y, "#ff4757");
  }

  // Poison
  if (currentMode === "poison") {
    drawElement(assets.poison, poisonFood.x, poisonFood.y, "#8e44ad");
  }

  // Snake
  for (let i = 0; i < snake.length; i++) {
    let part = snake[i];
    let isHead = i === 0;
    let isTail = i === snake.length - 1;

    if (isHead) {
      let angle = 0;
      if (dx === 1) angle = 90;
      if (dx === -1) angle = -90;
      if (dy === 1) angle = 180;
      drawRotatedElement(assets.head, part.x, part.y, angle, "#388E3C");
    } else if (isTail) {
      let prev = snake[i - 1];
      let angle = 0;
      if (prev.x > part.x) angle = 90;
      if (prev.x < part.x) angle = -90;
      if (prev.y > part.y) angle = 180;
      drawRotatedElement(
        assets.tail,
        part.x,
        part.y,
        angle,
        "#4CAF50",
        TAIL_SCALE
      );
    } else {
      // Updated to use BODY_SCALE
      drawElement(assets.body, part.x, part.y, "#4CAF50", BODY_SCALE);
    }
  }

  if (currentMode === "dark_mode") renderFlashlightEffect();
}

function drawPauseScreen() {
  ctx.save();
  // Semi-transparent overlay
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Text
  ctx.fillStyle = "#fff";
  ctx.font = "bold 40px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 5;
  ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);

  ctx.font = "20px 'Segoe UI', sans-serif";
  ctx.fillText("Press ESC to Resume", canvas.width / 2, canvas.height / 2 + 40);
  ctx.restore();
}

function drawElement(img, x, y, color, scale = DRAW_SCALE) {
  if (img && img.complete && img.naturalHeight !== 0) {
    const baseSize = TILE_SIZE * scale;
    const offsetX = (TILE_SIZE - baseSize) / 2;
    const offsetY = (TILE_SIZE - baseSize) / 2;
    const ratio = img.naturalWidth / img.naturalHeight;
    let drawWidth = baseSize,
      drawHeight = baseSize;
    if (ratio > 1) drawHeight = baseSize / ratio;
    else drawWidth = baseSize * ratio;

    const finalX = x * TILE_SIZE + offsetX + (baseSize - drawWidth) / 2;
    const finalY = y * TILE_SIZE + offsetY + (baseSize - drawHeight) / 2;
    ctx.drawImage(img, finalX, finalY, drawWidth, drawHeight);
  } else {
    ctx.fillStyle = color;
    ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
}

function drawRotatedElement(img, x, y, angle, color, scale = DRAW_SCALE) {
  if (img && img.complete && img.naturalHeight !== 0) {
    const baseSize = TILE_SIZE * scale;
    const ratio = img.naturalWidth / img.naturalHeight;
    let drawWidth = baseSize,
      drawHeight = baseSize;
    if (ratio > 1) drawHeight = baseSize / ratio;
    else drawWidth = baseSize * ratio;

    ctx.save();
    ctx.translate(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
  } else {
    ctx.fillStyle = color;
    ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
}

function renderFlashlightEffect() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.98)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const head = snake[0];
  ctx.globalCompositeOperation = "destination-out";
  const gradient = ctx.createRadialGradient(
    head.x * TILE_SIZE + 10,
    head.y * TILE_SIZE + 10,
    10,
    head.x * TILE_SIZE + 10,
    head.y * TILE_SIZE + 10,
    80
  );
  gradient.addColorStop(0, "rgba(0,0,0,1)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(head.x * TILE_SIZE + 10, head.y * TILE_SIZE + 10, 80, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
}

// --- INPUTS ---
document.addEventListener("keydown", (event) => {
  if (
    sections.game.classList.contains("active-section") &&
    !gameRunning &&
    ui.gameOverScreen.classList.contains("hidden")
  ) {
    if ([37, 38, 39, 40].includes(event.keyCode)) startLoop();
  }
  if (event.keyCode === 27 && gameRunning) {
    isPaused = !isPaused;
    if (!isPaused) draw();
  }
  if (!isPaused) changeDirection(event);
});

function changeDirection(event) {
  let k = event.keyCode;
  if (currentMode === "reverse" && isReversed) {
    if (k === 37) k = 39;
    else if (k === 39) k = 37;
    else if (k === 38) k = 40;
    else if (k === 40) k = 38;
  }
  const up = dy === -1,
    down = dy === 1,
    right = dx === 1,
    left = dx === -1;
  if (k === 37 && !right) {
    nextDx = -1;
    nextDy = 0;
  }
  if (k === 38 && !down) {
    nextDx = 0;
    nextDy = -1;
  }
  if (k === 39 && !left) {
    nextDx = 1;
    nextDy = 0;
  }
  if (k === 40 && !up) {
    nextDx = 0;
    nextDy = 1;
  }
}
