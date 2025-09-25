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
let running = false;

// Set canvas size
canvas.width = 320;
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

const scoreElement = document.createElement("span");
scoreElement.textContent = 0;
scoreElement.style.position = "absolute";
scoreElement.style.left = "50%";
scoreElement.style.top = "35px";
scoreElement.style.transform = "translate(-50%, -50%)";
document.body.appendChild(scoreElement);

// Create the bird object
const bird = {
  x: 50,
  y: canvas.height / 2,
  width: 80,
  height: 100,
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

// 生成敵人
const addEnemy = function () {
  const type = Math.random() < 0.5 ? "dragon" : "bird";
  const y =
    type === "dragon"
      ? canvas.height - groundHeight - enemySize // dragon 在地板上
      : 0; // bird 在上方

  enemies.push({
    type: type,
    x: canvas.width,
    y: y,
    width: enemySize,
    height: enemySize,
    passed: false, // 用來記錄是否計分
  });
};

// 更新與繪製敵人
function updateAndDrawEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];

    // 繪製敵人
    if (e.type === "dragon") {
      const scale = 1.5; // 放大倍率
      ctx.drawImage(
        dragonImg,
        e.x,
        e.y - e.height * (scale - 1), // 把 Y 座標往上移，避免掉到地板下
        e.width * scale,
        e.height * scale
      );
    } else if (e.type === "bird") {
      ctx.drawImage(birdEnemyImg, e.x, e.y, e.width, e.height);
    }

    // 移動
    e.x -= 2;

    // 碰撞檢查
    if (
      bird.x < e.x + e.width &&
      bird.x + bird.width > e.x &&
      bird.y < e.y + e.height &&
      bird.y + bird.height > e.y
    ) {
      running = false;
      hitSound.play();
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
      console.log("Game Over!");

      // 建立 Restart 按鈕
      const restartBtn = document.createElement("button");
      restartBtn.textContent = "Restart";
      restartBtn.style.position = "absolute";
      restartBtn.style.left = "50%";
      restartBtn.style.top = "50%";
      restartBtn.style.transform = "translate(-50%, -50%)";
      restartBtn.style.fontSize = "24px";
      restartBtn.style.padding = "10px 20px";
      restartBtn.style.borderRadius = "12px";
      restartBtn.style.cursor = "pointer";
      document.body.appendChild(restartBtn);

      // Restart 邏輯
      restartBtn.addEventListener("click", function () {
        document.body.removeChild(restartBtn);
        score = 0;
        enemies.length = 0;
        bird.y = canvas.height / 2;
        bird.speed = 0;
        running = true;
        addEnemy();
        backgroundMusic.play();
        gameLoop();
      });
      return;
    }

    // 通過後加分
    if (!e.passed && bird.x > e.x + e.width) {
      e.passed = true;
      score++;
      pointSound.play();
    }

    // 移除離開畫面的敵人
    if (e.x + e.width < 0) {
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
playBtn.innerText = "Play";
playBtn.style.position = "absolute";
playBtn.style.left = "50%";
playBtn.style.top = "50%";
playBtn.style.transform = "translate(-50%, -50%)";
playBtn.addEventListener("click", function () {
  document.body.removeChild(playBtn);
  document.body.removeChild(helpText);
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

const helpText = document.createElement("p");
helpText.innerHTML =
  "TAP to jump on Mobile <br /><br /> SPACEBAR to jump on Destop";
helpText.style.position = "absolute";
helpText.style.left = "50%";
helpText.style.top = "75%";
helpText.style.transform = "translate(-50%, -50%)";
document.body.appendChild(helpText);

// The game loop
// const gameLoop = function () {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   ground.draw();
//   drawBackground();

//   if (!running) return;

//   bird.update();
//   bird.draw();

//   // Draw and update pipes
//   for (let i = 0; i < pipes.length; i++) {
//     // ctx.fillStyle = ctx.createPattern(pipesBackgroundImg, "repeat");
//     ctx.fillRect(pipes[i].x, 0, pipes[i].width, pipes[i].y);
//     ctx.fillRect(
//       pipes[i].x,
//       pipes[i].y + pipeGap,
//       pipes[i].width,
//       canvas.height - pipes[i].y - pipeGap
//     );

//     // Top pipe
//     ctx.beginPath();
//     ctx.strokeStyle = "#618842";
//     ctx.lineWidth = 4;
//     ctx.moveTo(pipes[i].x, pipes[i].y);
//     ctx.lineTo(pipes[i].x + pipes[i].width, pipes[i].y);
//     ctx.stroke();
//     ctx.drawImage(
//       pipesBackgroundImg,
//       pipes[i].x,
//       0,
//       pipes[i].width,
//       pipes[i].y
//     );

//     // Bottom pipe
//     ctx.beginPath();
//     ctx.strokeStyle = "#618842";
//     ctx.lineWidth = 4;
//     ctx.moveTo(pipes[i].x, pipes[i].y + pipeGap);
//     ctx.lineTo(pipes[i].x + pipes[i].width, pipes[i].y + pipeGap);
//     ctx.stroke();
//     ctx.drawImage(
//       pipesBackgroundImg,
//       pipes[i].x,
//       pipes[i].y + pipeGap,
//       pipes[i].width,
//       canvas.height - pipes[i].y - pipeGap - groundHeight
//     );

//     pipes[i].x -= 1;

//     // if game over / Check for collisions
//     if (
//       bird.x < pipes[i].x + pipes[i].width &&
//       bird.x + bird.width > pipes[i].x &&
//       (bird.y < pipes[i].y || bird.y + bird.height > pipes[i].y + pipeGap)
//     ) {
//       running = false;

//       hitSound.play();

//       ground.draw();

//       backgroundMusic.pause();
//       backgroundMusic.currentTime = 0;

//       console.log("Game Over!");

//       const replayBtn = document.createElement("button");

//       replayBtn.innerText = "Replay";
//       replayBtn.style.position = "absolute";
//       replayBtn.style.left = "50%";
//       replayBtn.style.top = "50%";
//       replayBtn.style.transform = "translate(-50%, -50%)";
//       replayBtn.addEventListener("click", function () {
//         document.body.removeChild(replayBtn);
//         running = true;
//         // Reset game variables to their initial values
//         score = 0;
//         pipes.length = 0;
//         addPipe();
//         gameLoop();

//         backgroundMusic.loop = true;
//         backgroundMusic.play();
//       });

//       document.body.appendChild(replayBtn);

//       return;
//     }

//     // Check if bird has passed the pipe and add point to score
//     if (bird.x > pipes[i].x + pipes[i].width && !pipes[i].passed) {
//       pipes[i].passed = true;
//       pointSound.play();
//       score++;
//     }

//     // Add a new pipe when the current pipe has moved off the screen
//     if (pipes[i].x + pipes[i].width < 0) {
//       pipes.splice(i, 1);
//       i--;
//       addPipe();
//     }
//   }

//   ground.update();
//   ground.draw();

//   scoreElement.textContent = score;

//   // Keep the bird within the bounds of the canvas
//   if (bird.y + bird.height > canvas.height - groundHeight) {
//     bird.y = canvas.height - groundHeight - bird.height;
//     bird.speed = 0;
//   } else if (bird.y < 0) {
//     bird.y = 0;
//     bird.speed = 0;
//   }

//   requestAnimationFrame(gameLoop);
// };

const gameLoop = function () {
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
