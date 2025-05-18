const canvas = document.getElementById('defeatCanvas');
const ctx = canvas.getContext('2d');

// ------------------------------
// ROZMIAR CANVAS
// ------------------------------
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ------------------------------
// TŁO
// ------------------------------
const backgroundColor = 'rgba(30, 0, 0, 1)';

// ------------------------------
// OBRAZEK DEFEAT
// ------------------------------
const defeatImage = new Image();
defeatImage.src = 'defeat.png';
let defeatTime = 0;

// ------------------------------
// AUDIO
// ------------------------------
const defeatAudio = new Audio('defeat.mp3');

// ------------------------------
// PRZYCISK WYJŚCIA
// ------------------------------
const exitButton = {
  x: canvas.width / 2 - 150,
  y: canvas.height / 2 + 100,
  width: 300,
  height: 80,
  text: 'WRÓĆ DO MENU',
  hovered: false,
  scale: 1,
  targetScale: 1
};

// ------------------------------
// POZYCJA PRZYCISKU WYJŚCIA
// ------------------------------
function updateExitButtonPos() {
  exitButton.x = canvas.width / 2 - exitButton.width / 2;
  exitButton.y = canvas.height / 2 + 100;
}
window.addEventListener('resize', updateExitButtonPos);

// ------------------------------
// OBSŁUGA KLIKNIĘĆ
// ------------------------------
window.addEventListener('contextmenu', function(e) {
  e.preventDefault();
});

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  if (
    mouseX >= exitButton.x &&
    mouseX <= exitButton.x + exitButton.width &&
    mouseY >= exitButton.y &&
    mouseY <= exitButton.y + exitButton.height
  ) {
    window.location.href = 'index.html';
  }
});

// ------------------------------
// OBSŁUGA RUCHU MYSZY
// ------------------------------
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const isHovered =
    mouseX >= exitButton.x &&
    mouseX <= exitButton.x + exitButton.width &&
    mouseY >= exitButton.y &&
    mouseY <= exitButton.y + exitButton.height;

  exitButton.targetScale = isHovered ? 1.1 : 1;
  canvas.style.cursor = isHovered ? 'pointer' : 'default';
});

// ------------------------------
// RYSOWANIE DEFEAT
// ------------------------------
function drawDefeat() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (defeatImage.complete) {
    const angle = Math.sin(defeatTime) * 5 * Math.PI / 180;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2 - 50);
    ctx.rotate(angle);

    const imageWidth = 200;
    const imageHeight = (defeatImage.height / defeatImage.width) * imageWidth;
    ctx.drawImage(defeatImage, -imageWidth / 2, -imageHeight / 2, imageWidth, imageHeight);
    ctx.restore();

    defeatTime += 0.02;
  }

  exitButton.scale += (exitButton.targetScale - exitButton.scale) * 0.1;

  drawButton(exitButton);

  requestAnimationFrame(drawDefeat);
}

// ------------------------------
// RYSOWANIE PRZYCISKU
// ------------------------------
function drawButton(btn) {
  const buttonWidth = btn.width * btn.scale;
  const buttonHeight = btn.height * btn.scale;
  const buttonX = btn.x - (buttonWidth - btn.width) / 2;
  const buttonY = btn.y - (buttonHeight - btn.height) / 2;

  const grad = ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonHeight);
  grad.addColorStop(0, '#500000');
  grad.addColorStop(1, '#6f1b1b');

  ctx.save();
  ctx.shadowColor = 'rgba(255,80,80,0.4)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.fillStyle = grad;
  ctx.strokeStyle = '#d15b59';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 25);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = '#ffffff';
  ctx.font = `${btn.scale * 24}px Nosifer, cursive`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(btn.text, buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
}

// ------------------------------
// INICJALIZACJA
// ------------------------------
defeatImage.onload = () => {
  updateExitButtonPos();
  drawDefeat();
  defeatAudio.play();
  defeatAudio.volume = 0.25;
};
