const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const groundHeight = 30;
let birdImageframe = 0;
const flapInterval = 50;
const birdGravity = 0.2;
const birdJump = -4.6;
const pipes = [];
const pipeWidth = 52;

// 敵人設定
const enemies = [];
const enemySize = 80; // 寬高一樣
const enemySpeed = 2;

const minGap = 210;
const maxGap = 300;
const pipeGap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);
let score = 0;
let distances = 0;
let running = false;

// Set canvas size
canvas.width = 260;
canvas.height = 480;

const birdImg1 = new Image();
birdImg1.src = "../src/images/monster.png";
const birdImg2 = new Image();
birdImg2.src = "../src/images/monster.png";
const birdImg3 = new Image();
birdImg3.src = "../src/images/monster.png";
const birdImg4 = new Image();
birdImg4.src = "../src/images/monster.png";

// 載入敵人圖片
const dragonImg = new Image();
dragonImg.src = "../src/images/dragon.png";

const birdEnemyImg = new Image();
birdEnemyImg.src = "../src/images/bird.png";

const backgroundImg = new Image();
backgroundImg.src = "../src/images/background.png";
const groundImg = new Image();
groundImg.src = "../src/images/ground.png";
const pipesBackgroundImg = new Image();
pipesBackgroundImg.src =
  "https://assets.codepen.io/1290466/pipe-bg.jpg?format=auto";

// Sounds
const hitSound = new Audio(
  "https://assets.codepen.io/1290466/flappy-bird-hit.mp3"
);
const pointSound = new Audio();
// "https://assets.codepen.io/1290466/flappy-bird-point.mp3"
const backgroundMusic = new Audio();
// "https://assets.codepen.io/1290466/flappy-bird-background.mp3"

let bgX = 0; // 背景水平位移
const bgSpeed = 0.5; // 背景滾動速度

const drawBackground = function () {
  const scale = canvas.height / backgroundImg.height;
  const bgWidth = backgroundImg.width * scale;
  const bgHeight = backgroundImg.height * scale;

  // 讓背景無縫滾動
  ctx.drawImage(backgroundImg, bgX, 0, bgWidth, bgHeight);
  ctx.drawImage(backgroundImg, bgX + bgWidth, 0, bgWidth, bgHeight);

  // 更新位移
  bgX -= bgSpeed;
  if (bgX <= -bgWidth) {
    bgX = 0;
  }
};

const scoreContainer = document.createElement("div");
scoreContainer.classList.add("score-container");
scoreContainer.innerHTML = `
  <div class="distance-content">
    <div class="distance-img"></div>
    <div class="distance-points"></div>
  </div>
  <div class="points-content">
    <div class="points-img"></div>
    <div class="score-points"></div>
  </div>
`;

document.body.appendChild(scoreContainer);

const distanceElement = document.getElementsByClassName("distance-points")[0];
const scoreElement = document.getElementsByClassName("score-points")[0];

// 創建初始背景圖
const startBg = document.createElement("img");
startBg.src = "../src/images/background-first.png"; // 初始畫面圖片
startBg.style.position = "absolute";
startBg.style.left = "50%";
startBg.style.top = "0";
startBg.style.transform = "translateX(-50%)";
startBg.style.width = "100%"; // 可調整尺寸
startBg.style.height = "100%";
startBg.style.border = "1px solid #000";
document.body.appendChild(startBg);

const titleImg = document.createElement("img");
titleImg.className = "title-head-img";
titleImg.src = "../src/images/title.png"; // 替換成你的圖片路徑

document.body.appendChild(titleImg);

// Create the bird object
const bird = {
  x: 50,
  y: canvas.height / 2,
  width: 40,
  height: 40,
  speed: 0,
  gravity: birdGravity,
  jump: birdJump,
  update: function () {
    this.speed += this.gravity;
    this.y += this.speed;
  },
  draw: function () {
    // Rotate the bird up when it goes up
    if (this.speed < 0) {
      ctx.save();
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.rotate(-Math.PI / 16);

      // bird flap animation
      if (birdImageframe % 3 === 0) {
        ctx.drawImage(
          birdImg1,
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
        );
      } else if (birdImageframe % 3 === 1) {
        ctx.drawImage(
          birdImg2,
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
        );
      } else if (birdImageframe % 3 === 2) {
        ctx.drawImage(
          birdImg3,
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
        );
      } else {
        ctx.drawImage(
          birdImg4,
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
        );
      }

      // 畫鳥的碰撞圓
      const birdCx = 0; // 因為已經 translate 到鳥中心
      const birdCy = 0;
      const birdR = this.width * 0.35; // 你剛剛的設定

      // ctx.beginPath();
      // ctx.arc(birdCx, birdCy, birdR, 0, Math.PI * 2);
      // ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
    // Rotate the bird down when it goes down
    else {
      ctx.save();
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.rotate(Math.PI / 16);
      // ctx.drawImage(birdImg1, -this.width / 2, -this.height / 2, this.width, this.height);

      // bird flap animation
      if (birdImageframe % 3 === 0) {
        ctx.drawImage(
          birdImg1,
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
        );
      } else if (birdImageframe % 3 === 1) {
        ctx.drawImage(
          birdImg2,
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
        );
      } else if (birdImageframe % 3 === 2) {
        ctx.drawImage(
          birdImg3,
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
        );
      } else {
        ctx.drawImage(
          birdImg4,
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
        );
      }

      ctx.restore();
    }
  },
};

const ground = {
  x: 0,
  y: canvas.height - groundHeight,
  width: canvas.width,
  height: groundHeight,
  speed: 1,
  update: function () {
    this.x -= this.speed;
    if (this.x <= -this.width) this.x = 0;
  },
  draw: function () {
    ctx.drawImage(groundImg, this.x, this.y, this.width, this.height);
    ctx.drawImage(
      groundImg,
      this.x + this.width,
      this.y,
      this.width,
      this.height
    );
  },
};

const maxEnemies = 3; // 螢幕最多同時 3 個

// 生成敵人
const addEnemy = function () {
  if (enemies.length >= maxEnemies) return; // 超過數量就不生

  const type = Math.random() < 0.5 ? "dragon" : "bird";
  const scale = type === "dragon" ? 1.5 : 1;

  const enemy = {
    type: type,
    x: canvas.width,
    baseW: 80,
    baseH: 80,
    scale: scale,
    passed: false,
  };

  if (type === "dragon") {
    enemy.baseY = canvas.height - groundHeight - enemy.baseH * scale; // 基準：貼地板
    enemy.amplitude = 80; // 上下浮動幅度
    enemy.frequency = 0.05; // 浮動速度
    enemy.phase = Math.random() * Math.PI * 2; // 隨機初始角度
  } else if (type === "bird") {
    // 隨機高度：避免跟地面重疊，也不要太靠上
    const minY = 0;
    const maxY = canvas.height - groundHeight - enemy.baseH * scale - 50;
    enemy.baseY = Math.floor(Math.random() * (maxY - minY + 1) + minY);
  }

  enemies.push(enemy);
};

function isCollidingCircle(ax, ay, ar, bx, by, br) {
  const dx = ax - bx;
  const dy = ay - by;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < ar + br;
}

// 更新與繪製敵人
function updateAndDrawEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    const drawW = e.baseW * e.scale;
    const drawH = e.baseH * e.scale;
    const drawX = e.x;
    let drawY = 0;

    if (e.type === "dragon") {
      // drawY = e.baseY - Math.sin(e.phase + e.x * e.frequency) * e.amplitude;
      drawY = e.baseY;
      ctx.drawImage(dragonImg, drawX, drawY, drawW, drawH);

      const eCx = drawX + drawW / 2;
      const eCy = drawY + drawH / 2;
      const eR = drawW * 0.4; // 你剛剛設的 enemy 半徑比例

      // ctx.beginPath();
      // ctx.arc(eCx, eCy, eR, 0, Math.PI * 2);
      // ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (e.type === "bird") {
      drawY = e.baseY;
      ctx.drawImage(birdEnemyImg, drawX, drawY, drawW, drawH); // 畫紅框

      const eCx = drawX + drawW / 2;
      const eCy = drawY + drawH / 2;
      const eR = drawW * 0.4; // 你剛剛設的 enemy 半徑比例

      // ctx.beginPath();
      // ctx.arc(eCx, eCy, eR, 0, Math.PI * 2);
      // ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 計算鳥的 hitbox 圓心和半徑
    const birdCx = bird.x + bird.width / 2;
    const birdCy = bird.y + bird.height / 2;
    const birdR = Math.min(bird.width, bird.height) * 0.35;

    // 計算敵人的 hitbox 圓心和半徑
    const enemyCx = drawX + drawW / 2;
    const enemyCy = drawY + drawH / 2;
    const enemyR = Math.min(drawW, drawH) * 0.4;

    e.x -= enemySpeed;

    // 統一碰撞檢查
    const birdLeft = bird.x + bird.width * 0.2;
    const birdRight = bird.x + bird.width * 0.8;
    const birdTop = bird.y + bird.height * 0.2;
    const birdBottom = bird.y + bird.height * 0.8;

    const eLeft = drawX;
    const eRight = drawX + drawW;
    const eTop = drawY;
    const eBottom = drawY + drawH;

    if (isCollidingCircle(birdCx, birdCy, birdR, enemyCx, enemyCy, enemyR)) {
      if (!document.getElementById("restartBtn")) {
        running = false;
        hitSound.play();
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
        scoreContainer.style.display = "none";

        const monsterImg = document.createElement("div");
        monsterImg.className = "monster-img";
        document.body.appendChild(monsterImg);

        const informationContainer = document.createElement("div");
        informationContainer.classList.add("information-container");
        informationContainer.innerHTML = `
          <div class="title-img"></div>
          <div class="final-score-content">
            <div class="inform-text" id="score-total"></div>
            <div class="inform-text" id="score-percentage"></div>
          </div>
          <div class="video-img"></div>
          <div class="restart-btn" id="restartBtn">再玩一次</div>
        `;

        document.body.appendChild(informationContainer);

        const scoreTotal = document.getElementById("score-total");

        const scorePercentage = document.getElementById("score-percentage");

        scoreTotal.textContent = "總分：" + score;
        scorePercentage.textContent = "達成率：" + score + "%";

        const restartBtn = document.getElementById("restartBtn");
        console.log("score:", score);
        restartBtn.addEventListener("click", function () {
          document.body.removeChild(monsterImg);
          document.body.removeChild(informationContainer);
          scoreContainer.style.display = "block";
          score = 0;
          enemies.length = 0;
          bird.y = canvas.height / 2;
          bird.speed = 0;
          running = true;
          addEnemy();
          backgroundMusic.play();
          gameLoop();
        });
      }
    }

    // 通過後加分
    if (!e.passed && bird.x > drawX + drawW) {
      e.passed = true;
      score++;
      pointSound.play();
    }

    // 移除離開畫面的敵人
    if (e.x + drawW < 0) {
      enemies.splice(i, 1);
      i--;
      addEnemy();
    }
  }
}

const addPipe = function () {
  const height = Math.floor((Math.random() * canvas.height) / 2) + 50;
  const y = height - pipeGap / 2;
  pipes.push({
    x: canvas.width,
    y: y,
    width: pipeWidth,
    height: height,
  });
};

setInterval(function () {
  birdImageframe++;
}, flapInterval);

addPipe();

// Listen for clicks to make the bird jump
canvas.addEventListener("click", function () {
  bird.speed = bird.jump;
});

// Listen for sparebar press to make the bird jump
document.addEventListener("keydown", function (event) {
  if (event.keyCode === 32) {
    bird.speed = bird.jump;
  }
});

const playBtn = document.createElement("button");
playBtn.className = "play-btn";
playBtn.addEventListener("click", function () {
  document.body.removeChild(playBtn);
  // document.body.removeChild(helpText);
  startBg.style.display = "none";
  running = true;
  // Set game variables
  score = 0;
  pipes.length = 0;
  addEnemy(); // 生成第一個敵人
  gameLoop();

  backgroundMusic.loop = true;
  backgroundMusic.play();
});

document.body.appendChild(playBtn);

// const helpText = document.createElement("p");
// helpText.innerHTML =
//   "手機請點擊螢幕讓主角跳躍<br /><br />電腦請點擊空白鍵或滑鼠左鍵";
// helpText.style.position = "absolute";
// helpText.style.left = "50%";
// helpText.style.top = "75%";
// helpText.style.transform = "translate(-50%, -50%)";
// document.body.appendChild(helpText);

setInterval(() => {
  if (running) addEnemy();
}, 4000);

const gameLoop = function () {
  if (enemies.length < 1) {
    addEnemy();
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  ground.draw();

  if (!running) return;

  bird.update();
  bird.draw();

  // 更新與繪製敵人
  updateAndDrawEnemies();

  ground.update();
  ground.draw();

  distances = (score * Math.random() * 10).toFixed(1) + " M";
  distanceElement.textContent = distances;
  scoreElement.textContent = score;

  // 邊界處理
  if (bird.y + bird.height > canvas.height - groundHeight) {
    bird.y = canvas.height - groundHeight - bird.height;
    bird.speed = 0;
  } else if (bird.y < 0) {
    bird.y = 0;
    bird.speed = 0;
  }

  requestAnimationFrame(gameLoop);
};

gameLoop();
