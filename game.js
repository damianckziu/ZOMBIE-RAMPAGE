// ------------------------------
// INICJALIZACJA
// ------------------------------
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const mapImage = new Image();
mapImage.src = 'map.png';

const soldierImage = new Image();
soldierImage.src = 'soldier.png';

const bulletImage = new Image();
bulletImage.src = 'bullet.png';

const bloodImage = new Image();
bloodImage.src = 'blood.png';

const zombieImage = new Image();
zombieImage.src = 'zombie.png';

const shieldImage = new Image();
shieldImage.src = 'shield.png';

const zombieSound = new Audio('zombie.mp3');
const dayMusic = new Audio('day.mp3');
dayMusic.loop = true;
dayMusic.volume = 0.5;

const nightMusic = new Audio('night.mp3');
nightMusic.loop = true;
nightMusic.volume = 0.5;

const shieldSound = new Audio('shield.mp3');
shieldSound.volume = 0.4;

const shootSound = new Audio('shoot.mp3');
shootSound.volume = 0.25;

// ------------------------------
// GRACZ
// ------------------------------
let player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 20,
  angle: 0,
  speed: 1,
  hp: 100,
  shield: 0,
  stamina: 100,
  lastSprintTime: 0,
  lastDamageTime: 0
};

// ------------------------------
// ZMIENNE STERUJĄCE GRACZEM
// ------------------------------
let keys = {};
let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

// ------------------------------
// PRZECIWNICY I ELEMENTY
// ------------------------------
let bullets = [];
let zombies = [];
let bloodStains = [];
let shieldItems = [];

// ------------------------------
// CYCLES
// ------------------------------
let dayTime = true;
let dayDuration = 30000;
let nightDuration = 60000;
let cycleTimer = dayDuration;
let cycleStartTime = Date.now();

let zombieSpawnInterval = Infinity;
let initialZombieCount = 3;
let minDistanceBetweenZombies = 40;

let nightCount = 0;
let gameStartTime = Date.now();
let gameWon = false;
let victoryStartTime = null;

// ------------------------------
// ZDARZENIA
// ------------------------------
window.addEventListener('contextmenu', function(e) {
  console.log("test");
  e.preventDefault();
});

document.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

canvas.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

canvas.addEventListener('mousedown', e => {
  if (e.button === 0) {
    const angle = player.angle;
    const offsetX = Math.cos(angle) * player.radius;
    const offsetY = Math.sin(angle) * player.radius;

    bullets.push({
      x: player.x + offsetX,
      y: player.y + offsetY,
      dx: Math.cos(angle) * 6,
      dy: Math.sin(angle) * 6,
      angle: angle
    });

    const s = new Audio('shoot.mp3');
    s.volume = 0.25;
    s.play();
  }
});

// ------------------------------
// FUNKCJE DO SPAWN'OWANIA
// ------------------------------
function spawnZombie() {
  const maxTries = 15;
  let tries = 0;
  let x, y, angle, distanceFromPlayer;
  let validPosition = false;

  while (tries < maxTries && !validPosition) {
    distanceFromPlayer = Math.random() * (canvas.width / 2) + canvas.width / 4;
    angle = Math.random() * 2 * Math.PI;
    x = player.x + Math.cos(angle) * distanceFromPlayer;
    y = player.y + Math.sin(angle) * distanceFromPlayer;

    if (Math.hypot(player.x - x, player.y - y) < 100) {
      tries++;
      continue; // za blisko gracza
    }

    let tooClose = false;
    for (let i = 0; i < zombies.length; i++) {
      const zombie = zombies[i];
      if (Math.hypot(zombie.x - x, zombie.y - y) < minDistanceBetweenZombies) {
        tooClose = true;
        break;
      }
    }

    if (tooClose) {
      tries++;
      continue; // za blisko innego zombie
    }

    validPosition = true;
  }

  if (validPosition) {
    zombies.push({ x, y, radius: 20, speed: 0.65, hp: 3, alpha: 1 });
  }
  // jeśli nie znaleźliśmy miejsca, to nie spawnuje nowego zombie (nic nie robimy)
}


function spawnShieldItem() {
  if (dayTime) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    shieldItems.push({ x, y, radius: 20 });
  }
}

// ------------------------------
// GŁÓWNA LOGIKA GRY
// ------------------------------
function update() {
  let dx = 0;
  let dy = 0;
  let speed = player.speed;

  if (keys['shift'] && player.stamina > 0) {
    speed *= 1.8;
    player.stamina -= 0.2;
    player.lastSprintTime = Date.now();
  }

  if (!keys['shift'] && Date.now() - player.lastSprintTime > 3000) {
    player.stamina = Math.min(player.stamina + 0.1, 100);
  }

  if (keys['w']) dy -= 1;
  if (keys['s']) dy += 1;
  if (keys['a']) dx -= 1;
  if (keys['d']) dx += 1;

  const length = Math.hypot(dx, dy);
  if (length > 0) {
    dx = (dx / length) * speed;
    dy = (dy / length) * speed;
    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x + dx));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y + dy));
  }

  bullets.forEach((b, i) => {
    b.x += b.dx;
    b.y += b.dy;
    if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
      bullets.splice(i, 1);
    }
  });

  zombies.forEach((zombie, zIndex) => {
    bullets.forEach((bullet, bIndex) => {
      const dist = Math.hypot(zombie.x - bullet.x, zombie.y - bullet.y);
      if (dist < zombie.radius) {
        bullets.splice(bIndex, 1);
        zombie.hp--;
        zombie.alpha = zombie.hp / 3;

        if (zombie.hp <= 0) {
          bloodStains.push({ x: zombie.x, y: zombie.y, time: Date.now() });
          zombies.splice(zIndex, 1);
        }
      }
    });
  });

  shieldItems.forEach((item, index) => {
    const distance = Math.hypot(player.x - item.x, player.y - item.y);
    if (distance < player.radius + item.radius) {
      player.shield = Math.min(player.shield + 25, 100);
      shieldItems.splice(index, 1);
      shieldSound.play();
    }
  });

  player.angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);

  let elapsedTime = Date.now() - cycleStartTime;
  if (elapsedTime >= cycleTimer) {
    dayTime = !dayTime;
    cycleStartTime = Date.now();
    cycleTimer = dayTime ? dayDuration : nightDuration;

    if (!dayTime) {
      zombieSound.play();
      nightMusic.play();
      dayMusic.pause();
      dayMusic.currentTime = 0;
      nightCount++;
    } else {
      dayMusic.play();
      nightMusic.pause();
      nightMusic.currentTime = 0;
    }
  }

  if (dayTime) {
    zombies = [];
  }

  if (!dayTime) {
    shieldItems = [];
  }

  zombies.forEach(zombie => {
    const angleToPlayer = Math.atan2(player.y - zombie.y, player.x - zombie.x);
    zombie.x += Math.cos(angleToPlayer) * zombie.speed;
    zombie.y += Math.sin(angleToPlayer) * zombie.speed;

    zombies.forEach(otherZombie => {
      if (otherZombie !== zombie) {
        const distance = Math.hypot(zombie.x - otherZombie.x, zombie.y - otherZombie.y);
        if (distance < minDistanceBetweenZombies) {
          const angleBetween = Math.atan2(otherZombie.y - zombie.y, otherZombie.x - zombie.x);
          const pushDistance = minDistanceBetweenZombies - distance;
          zombie.x -= Math.cos(angleBetween) * pushDistance / 2;
          zombie.y -= Math.sin(angleBetween) * pushDistance / 2;
          otherZombie.x += Math.cos(angleBetween) * pushDistance / 2;
          otherZombie.y += Math.sin(angleBetween) * pushDistance / 2;
        }
      }
    });

    const dist = Math.hypot(zombie.x - player.x, zombie.y - player.y);
    if (dist < zombie.radius + player.radius) {
      const now = Date.now();
      if (now - player.lastDamageTime >= 1000) {
        player.lastDamageTime = now;
        if (player.shield > 0) {
          player.shield = Math.max(0, player.shield - 25);
        } else {
          player.hp -= 20;
          if (player.hp <= 0) {
            window.location.href = 'defeat.html';
          }
        }
      }
    }
  });

  if (Date.now() - gameStartTime >= 450000 && !gameWon) {
    gameWon = true;
    victoryStartTime = Date.now();
    window.location.href = 'victory.html';
  }
}

// ------------------------------
// RYSOWANIE
// ------------------------------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (dayTime) {
    bloodStains = bloodStains.filter(stain => stain.time >= cycleStartTime);
  }

  ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);

  if (!dayTime) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  bloodStains.forEach(blood => {
    const scaleFactor = 0.3;
    const scaledWidth = bloodImage.width * scaleFactor;
    const scaledHeight = bloodImage.height * scaleFactor;
    ctx.drawImage(bloodImage, blood.x - scaledWidth / 2, blood.y - scaledHeight / 2, scaledWidth, scaledHeight);
  });

  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.angle);
  const soldierScale = 0.5;
  ctx.drawImage(soldierImage, -soldierImage.width * soldierScale / 2, -soldierImage.height * soldierScale / 2, soldierImage.width * soldierScale, soldierImage.height * soldierScale);
  ctx.restore();

  bullets.forEach(b => {
    const scale = 0.175;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.angle + Math.PI / 2);
    ctx.drawImage(bulletImage, -bulletImage.width * scale / 2, -bulletImage.height * scale / 2, bulletImage.width * scale, bulletImage.height * scale);
    ctx.restore();
  });

  shieldItems.forEach(item => {
    const scale = 0.25;
    ctx.drawImage(shieldImage, item.x - shieldImage.width * scale / 2, item.y - shieldImage.height * scale / 2, shieldImage.width * scale, shieldImage.height * scale);
  });

  zombies.forEach(zombie => {
    const angleToPlayer = Math.atan2(player.y - zombie.y, player.x - zombie.x);
    zombie.alpha = zombie.hp / 3;
    const scale = 0.3;
    ctx.save();
    ctx.translate(zombie.x, zombie.y);
    ctx.rotate(angleToPlayer);
    ctx.globalAlpha = zombie.alpha;
    ctx.drawImage(zombieImage, -zombieImage.width * scale / 2, -zombieImage.height * scale / 2, zombieImage.width * scale, zombieImage.height * scale);
    ctx.restore();
  });

  // ------------------------------
  // PASEK ZDROWIA I STAMINY
  // ------------------------------
  const barWidth = 300;
  const barHeight = 20;
  const barMargin = 10;

  ctx.fillStyle = 'gray';
  ctx.fillRect(canvas.width / 2 - barWidth / 2, canvas.height - barHeight - barMargin, barWidth, barHeight);
  ctx.fillStyle = 'red';
  ctx.fillRect(canvas.width / 2 - barWidth / 2, canvas.height - barHeight - barMargin, (player.hp / 100) * barWidth, barHeight);

  ctx.fillStyle = 'gray';
  ctx.fillRect(canvas.width / 2 - barWidth / 2, canvas.height - barHeight * 2 - barMargin * 2, barWidth, barHeight);
  ctx.fillStyle = 'blue';
  ctx.fillRect(canvas.width / 2 - barWidth / 2, canvas.height - barHeight * 2 - barMargin * 2, (player.shield / 100) * barWidth, barHeight);

  ctx.fillStyle = 'gray';
  ctx.fillRect(canvas.width / 2 - barWidth / 2, canvas.height - barHeight * 3 - barMargin * 3, barWidth, barHeight);
  ctx.fillStyle = 'yellow';
  ctx.fillRect(canvas.width / 2 - barWidth / 2, canvas.height - barHeight * 3 - barMargin * 3, (player.stamina / 100) * barWidth, barHeight);

  ctx.fillStyle = 'white';
  ctx.font = '12px "Press Start 2P", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('STAMINA', canvas.width / 2 - barWidth / 2 - 100, canvas.height - barHeight * 3 - barMargin * 3 + barHeight / 2);
  ctx.fillText('OSLONA', canvas.width / 2 - barWidth / 2 - 100, canvas.height - barHeight * 2 - barMargin * 2 + barHeight / 2);
  ctx.fillText('ZDROWIE', canvas.width / 2 - barWidth / 2 - 100, canvas.height - barHeight - barMargin + barHeight / 2);

  // ------------------------------
  // CZAS POZOSTAŁY
  // ------------------------------
  let remainingTime = cycleTimer - (Date.now() - cycleStartTime);
  let minutes = Math.floor(remainingTime / 60000);
  let seconds = Math.floor((remainingTime % 60000) / 1000);
  let isCriticalTime = remainingTime < 5000;

  ctx.font = '48px "Press Start 2P", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = isCriticalTime ? 'red' : 'white';

  if (isCriticalTime) {
    let shakeIntensity = Math.sin(Date.now() / 50) * 10;
    ctx.fillText(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`, canvas.width / 2 + shakeIntensity, 40 + shakeIntensity);
  } else {
    ctx.fillText(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`, canvas.width / 2, 40);
  }

  ctx.font = '24px "Press Start 2P", sans-serif';
  ctx.fillStyle = 'white';
  ctx.fillText(`NOC ${nightCount}`, canvas.width / 2, 100);
}

// ------------------------------
// INTERWALIA I PĘTLA GRY
// ------------------------------
setInterval(spawnShieldItem, 10000);
setInterval(() => {
  if (!dayTime && zombies.length < 25) {
    for (let i = 0; i < 3; i++) {
      if (zombies.length >= 25) break;
      spawnZombie();
    }
  }
}, 2750);

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

dayMusic.play();
gameLoop();
