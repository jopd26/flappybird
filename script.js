const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const width = canvas.width;
const height = canvas.height;

const bird = {
  x: 90,
  y: height / 2,
  radius: 16,
  velocity: 0,
  gravity: 0.35,
  jumpHeight: -8,
};

const pipeWidth = 72;
const pipeGap = 180;
const pipeSpeed = 1.5;
const pipeInterval = 2000;

let pipes = [];
let lastPipeTime = 0;
let score = 0;
let bestScore = 0;
let gameOver = false;
let started = false;
let lastTime = 0;

function resetGame() {
  pipes = [];
  lastPipeTime = 0;
  score = 0;
  bird.y = height / 2;
  bird.velocity = 0;
  gameOver = false;
  started = false;
}

function createPipe() {
  const topHeight = 80 + Math.random() * 220;
  pipes.push({ x: width, topHeight, passed: false });
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#7dd1ff');
  gradient.addColorStop(1, '#4ab6f6');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawBird() {
  ctx.fillStyle = '#ffd33a';
  ctx.beginPath();
  ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f8b835';
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawPipes() {
  ctx.fillStyle = '#2c7a1b';
  ctx.strokeStyle = '#1f5d17';
  ctx.lineWidth = 4;
  pipes.forEach(pipe => {
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
    ctx.fillRect(pipe.x, pipe.topHeight + pipeGap, pipeWidth, height - pipe.topHeight - pipeGap);
    ctx.strokeRect(pipe.x, 0, pipeWidth, pipe.topHeight);
    ctx.strokeRect(pipe.x, pipe.topHeight + pipeGap, pipeWidth, height - pipe.topHeight - pipeGap);
  });
}

function drawScore() {
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 34px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(score, width / 2, 64);
  ctx.font = '500 14px Inter, sans-serif';
  ctx.fillText(`Best: ${bestScore}`, width / 2, 92);
}

function drawOverlay() {
  if (!started && !gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 24px Inter, sans-serif';
    ctx.fillText('Click or Space to start', width / 2, height / 2 - 10);
  }

  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 32px Inter, sans-serif';
    ctx.fillText('Game Over', width / 2, height / 2 - 18);
    ctx.font = '500 20px Inter, sans-serif';
    ctx.fillText('Press Space or Restart', width / 2, height / 2 + 24);
  }
}

function update(deltaTime) {
  if (!started || gameOver) return;

  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  if (bird.y + bird.radius > height || bird.y - bird.radius < 0) {
    gameOver = true;
  }

  const currentTime = performance.now();
  if (currentTime - lastPipeTime > pipeInterval) {
    createPipe();
    lastPipeTime = currentTime;
  }

  pipes.forEach(pipe => {
    pipe.x -= pipeSpeed;

    if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
      pipe.passed = true;
      score += 1;
      bestScore = Math.max(score, bestScore);
    }

    const hitTop = bird.x + bird.radius > pipe.x && bird.x - bird.radius < pipe.x + pipeWidth && bird.y - bird.radius < pipe.topHeight;
    const hitBottom = bird.x + bird.radius > pipe.x && bird.x - bird.radius < pipe.x + pipeWidth && bird.y + bird.radius > pipe.topHeight + pipeGap;
    if (hitTop || hitBottom) {
      gameOver = true;
    }
  });

  pipes = pipes.filter(pipe => pipe.x + pipeWidth > -20);
}

function draw() {
  drawBackground();
  drawPipes();
  drawBird();
  drawScore();
  drawOverlay();
}

function loop(timestamp) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  update(deltaTime);
  draw();
  requestAnimationFrame(loop);
}

function flap() {
  if (gameOver) {
    resetGame();
    started = true;
    bird.velocity = bird.jumpHeight;
    return;
  }

  started = true;
  bird.velocity = bird.jumpHeight;
}

canvas.addEventListener('click', () => flap());
window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    flap();
  }
});

resetGame();
requestAnimationFrame(loop);
