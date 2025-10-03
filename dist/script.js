const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const groundHeight = 30;
let birdImageframe = 0;
const flapInterval = 50;
const birdGravity = 0.2;
const pipes = [];
const pipeWidth = 52;

// 敵人設定
const enemies = [];
const enemySize = 80; // 寬高一樣

let birdJump;

if (window.matchMedia("(max-width: 750px)").matches) {
  birdJump = -4.6;
} else {
  birdJump = -3.5;
}

let enemySpeed;

if (window.matchMedia("(max-width: 750px)").matches) {
  enemySpeed = 1.3;
} else {
  enemySpeed = 0.8;
}

const minGap = 210;
const maxGap = 300;
const pipeGap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);
let score = 0;
let distances = 0;
let running = false;

function resizeCanvas() {
  if (window.matchMedia("(max-width: 750px)").matches) {
    // 手機 → 滿版
    canvas.width = window.innerWidth;
    canvas.height = canvas.clientHeight;
  } else {
    // 桌機 → 固定大小
    canvas.width = 260;
    canvas.height = 480;
  }
}
// 一開始先呼叫一次
resizeCanvas();

// 視窗大小改變時也更新
window.addEventListener("resize", resizeCanvas);

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
const failSound = new Audio("../src/mp3/fail.mp3");
const winSound = new Audio("../src/mp3/win.mp3");
const pointSound = new Audio("../src/mp3/point.mp3");
const backgroundMusic = new Audio("../src/mp3/background1.mp3");

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

// 建立靜音按鈕
const muteBtn = document.createElement("div");
muteBtn.className = "mute-btn";
// 建立 Icon (Font Awesome)
let muteIcon = document.createElement("i");
muteIcon.classList.add("fas", "fa-volume-up"); // 預設音量開啟

// 把 icon 放進按鈕
muteBtn.appendChild(muteIcon);

document.body.appendChild(muteBtn);

let isMuted = false;

muteBtn.addEventListener("click", function () {
  isMuted = !isMuted;

  // 切換 icon
  if (isMuted) {
    muteIcon.classList.remove("fa-volume-up");
    muteIcon.classList.add("fa-volume-mute");
  } else {
    muteIcon.classList.remove("fa-volume-mute");
    muteIcon.classList.add("fa-volume-up");
  }

  // 控制所有聲音
  backgroundMusic.muted = isMuted;
  pointSound.muted = isMuted;
  failSound.muted = isMuted;
  winSound.muted = isMuted;
});
let bird;
// Create the bird object
if (window.matchMedia("(max-width: 480px)").matches) {
  bird = {
    x: 50,
    y: canvas.height / 2,
    width: 120,
    height: 120,
    speed: 0,
    gravity: birdGravity,
    jump: birdJump,
    update: function () {
      this.speed += this.gravity * delta;
      this.y += this.speed * delta;
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
} else {
  bird = {
    x: 50,
    y: canvas.height / 2,
    width: 60,
    height: 60,
    speed: 0,
    gravity: birdGravity,
    jump: birdJump,
    update: function () {
      this.speed += this.gravity * delta;
      this.y += this.speed * delta;
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
}

const ground = {
  x: 0,
  y: canvas.height - groundHeight,
  width: canvas.width,
  height: groundHeight,
  speed: 1,
  update: function () {
    this.x -= this.speed * delta;
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

  let enemy;
  if (window.matchMedia("(max-width: 480px)").matches) {
    enemy = {
      type: type,
      x: canvas.width,
      baseW: 150,
      baseH: 150,
      scale: scale,
      passed: false,
    };
  } else {
    enemy = {
      type: type,
      x: canvas.width,
      baseW: 80,
      baseH: 80,
      scale: scale,
      passed: false,
    };
  }

  if (type === "dragon") {
    enemy.baseY = canvas.height - groundHeight - enemy.baseH * scale; // 基準：貼地板
  } else if (type === "bird") {
    // 隨機高度：避免跟地面重疊，也不要太靠上
    const minY = 0;
    const maxY = canvas.height - groundHeight - enemy.baseH * scale - 50;
    enemy.baseY = Math.floor(Math.random() * (maxY - minY + 1) + minY);
  }

  // 🔥 檢查是否跟其他敵人重疊
  let overlapped = false;
  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    const existingTop = e.baseY;
    const existingBottom = e.baseY + e.baseH * e.scale;

    const newTop = enemy.baseY;
    const newBottom = enemy.baseY + enemy.baseH * enemy.scale;

    // 如果上下範圍重疊太多，就算重疊
    if (!(newBottom < existingTop - 20 || newTop > existingBottom + 20)) {
      overlapped = true;
      break;
    }
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

    if (score == 100) {
      if (!document.getElementById("restartBtn")) {
        running = false;
        winSound.play();
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
        scoreContainer.style.display = "none";

        const monsterImg = document.createElement("div");
        monsterImg.className = "monster-img";
        document.body.appendChild(monsterImg);

        const informationContainer = document.createElement("div");
        informationContainer.classList.add("information-container");
        informationContainer.innerHTML = `
          <div class="title-img succes-img"></div>
          <div class="final-score-content">
            <div class="inform-text" id="score-total"></div>
            <div class="inform-text" id="score-percentage"></div>
          </div>
          <a class="video-img" href="https://www.youtube.com/watch?v=3DlIfk11tUI" target="_blank"></a>
          <div class="restart-btn" id="restartBtn">再玩一次</div>
        `;

        document.body.appendChild(informationContainer);

        const shareContainer = document.createElement("div");
        shareContainer.classList.add("share-container");
        shareContainer.innerHTML = `
            <a class="share-item" href="#">分享給好友</a>
            <a class="share-item" href="https://www.miramarcinemas.tw/Movie/detail?id=46231817-6f9e-4c8d-affe-d66c7643a7d2&type=coming" target="_blink">觀看時刻表</a>
        `;

        document.body.appendChild(shareContainer);

        const scoreTotal = document.getElementById("score-total");

        const scorePercentage = document.getElementById("score-percentage");

        scoreTotal.textContent = "總分：" + score;
        scorePercentage.textContent = "終點距離：" + distances;

        const restartBtn = document.getElementById("restartBtn");

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

    if (isCollidingCircle(birdCx, birdCy, birdR, enemyCx, enemyCy, enemyR)) {
      if (!document.getElementById("restartBtn")) {
        running = false;
        failSound.play();
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
        scoreContainer.style.display = "none";

        const monsterImg = document.createElement("div");
        monsterImg.className = "monster-img";
        document.body.appendChild(monsterImg);

        const informationContainer = document.createElement("div");
        informationContainer.classList.add("information-container");
        informationContainer.innerHTML = `
          <div class="title-img fail-img"></div>
          <div class="final-score-content">
            <div class="inform-text" id="score-total"></div>
            <div class="inform-text" id="score-percentage"></div>
          </div>
          <a class="video-img" href="https://www.youtube.com/watch?v=3DlIfk11tUI" target="_blank"></a>
          <div class="restart-btn" id="restartBtn">再玩一次</div>
        `;

        document.body.appendChild(informationContainer);

        const shareContainer = document.createElement("div");
        shareContainer.classList.add("share-container");
        shareContainer.innerHTML = `
            <a class="share-item" href="#">分享給好友</a>
            <a class="share-item" href="https://www.miramarcinemas.tw/Movie/detail?id=46231817-6f9e-4c8d-affe-d66c7643a7d2&type=coming" target="_blink">觀看時刻表</a>
        `;

        document.body.appendChild(shareContainer);

        const scoreTotal = document.getElementById("score-total");

        const scorePercentage = document.getElementById("score-percentage");

        scoreTotal.textContent = "總分：" + score;
        scorePercentage.textContent = "終點距離：" + distances;
        console.log("distances:", distances);
        const restartBtn = document.getElementById("restartBtn");
        console.log("score:", score);
        restartBtn.addEventListener("click", function () {
          document.body.removeChild(monsterImg);
          document.body.removeChild(informationContainer);
          document.body.removeChild(shareContainer);
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
      if (e.type === "bird") {
        score += 2; // 🐦 敵方鳥加 2 分
      } else if (e.type === "dragon") {
        score += 1; // 🐉 龍加 1 分
      }
      pointSound.currentTime = 0; // ✅ 重置音效，避免太快重疊
      pointSound.play();
      continue; // ✅ 避免同一回合重複判定
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

const ruleImg = document.createElement("div");
ruleImg.className = "game-rule";

document.body.appendChild(ruleImg);

const playBtn = document.createElement("button");
playBtn.className = "play-btn";
playBtn.addEventListener("click", function () {
  document.body.removeChild(playBtn);
  document.body.removeChild(ruleImg);
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

setInterval(() => {
  if (running) addEnemy();
}, 4000);

let lastTime = performance.now();
let delta;

const gameLoop = function () {
  const now = performance.now();
  delta = (now - lastTime) / 16.67; // 相對於 60FPS 的倍率
  lastTime = now;
  console.log("delta:", delta);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

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

  if (running) {
    bird.update(delta);
    bird.draw();
    updateAndDrawEnemies(delta);
    ground.update(delta);
    ground.draw();
    scoreElement.textContent = score;
  }

  requestAnimationFrame(gameLoop);
};

gameLoop();
