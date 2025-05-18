const canvas = document.getElementById('menuCanvas');
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
const backgroundColor = 'rgba(52,64,0,1)';

// ------------------------------
// LOGO
// ------------------------------
const logoImage = new Image();
logoImage.src = 'logo.png';
let logoTime = 0;

// ------------------------------
// AUDIO
// ------------------------------
const lobbyAudio = new Audio('lobby.mp3');
lobbyAudio.volume = 0.5;

// ------------------------------
// PRZYCISK START
// ------------------------------
const startButton = {
  x: canvas.width / 2 - 150,
  y: canvas.height / 2 + 100,
  width: 300,
  height: 80,
  text: 'ROZPOCZNIJ GRĘ',
  hovered: false,
  scale: 1,
  targetScale: 1
};

// ------------------------------
// POZYCJA PRZYCISKU
// ------------------------------
function updateButtonPos() {
  startButton.x = canvas.width / 2 - startButton.width / 2;
  startButton.y = canvas.height / 2 + 100;
}
window.addEventListener('resize', updateButtonPos);

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
    mouseX >= startButton.x &&
    mouseX <= startButton.x + startButton.width &&
    mouseY >= startButton.y &&
    mouseY <= startButton.y + startButton.height
  ) {
    window.location.href = 'game.html'; // Przejście do gry
  }
});

// ------------------------------
// OBSŁUGA RUCHU MYSZY
// ------------------------------
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const isHovered = mouseX >= startButton.x &&
                    mouseX <= startButton.x + startButton.width &&
                    mouseY >= startButton.y &&
                    mouseY <= startButton.y + startButton.height;

  startButton.targetScale = isHovered ? 1.1 : 1;
  canvas.style.cursor = isHovered ? 'pointer' : 'default';
});

// ------------------------------
// RYSOWANIE PRZYCISKU
// ------------------------------
function drawButton(btn) {
  const buttonWidth = btn.width * btn.scale;
  const buttonHeight = btn.height * btn.scale;
  const buttonX = btn.x - (buttonWidth - btn.width) / 2;
  const buttonY = btn.y - (buttonHeight - btn.height) / 2;

  const grad = ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonHeight);
  grad.addColorStop(0, '#3f5000');
  grad.addColorStop(1, '#5c6f1b');

  ctx.save();
  ctx.shadowColor = 'rgba(185,255,110,0.4)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.fillStyle = grad;
  ctx.strokeStyle = '#d1c759';
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
// RYSOWANIE MENU
// ------------------------------
function drawMenu() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (logoImage.complete) {
    const angle = Math.sin(logoTime) * 5 * Math.PI / 180;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2 - 150);
    ctx.rotate(angle);
    const logoWidth = 400;
    const logoHeight = (logoImage.height / logoImage.width) * logoWidth;
    ctx.drawImage(logoImage, -logoWidth / 2, -logoHeight / 2, logoWidth, logoHeight);
    ctx.restore();
    logoTime += 0.02;
  }

  startButton.scale += (startButton.targetScale - startButton.scale) * 0.1;
  drawButton(startButton);

  requestAnimationFrame(drawMenu);
}

// ------------------------------
// INICJALIZACJA
// ------------------------------
logoImage.onload = () => {
  updateButtonPos();
  drawMenu();
  lobbyAudio.play();
  lobbyAudio.volume = 0.25;
};
