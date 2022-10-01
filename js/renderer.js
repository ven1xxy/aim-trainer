function initRenderer() {
  resizeCanvas();
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.textBaseline = "top";
}

function drawTarget(target, texture) {
  var drawTarget = target.calculateDrawTarget();
  context.drawImage(
    texture,
    drawTarget.x,
    drawTarget.y,
    drawTarget.width,
    drawTarget.height
  );
}

function resizeCanvas() {
  var oldW = canvas.width;
  var oldH = canvas.height;
  canvas.width = document.body.clientWidth * 0.7;
  canvas.height = document.body.clientHeight * 0.8;

  rect = canvas.getBoundingClientRect(); // Update rect
  handleDPR();

  var multX = canvas.width / oldW;
  var multY = canvas.height / oldH;

  console.log(
    `canvas scaled: x: ${oldW} → ${canvas.width} (${multX}x) // y: ${oldH} → ${canvas.height} (${multY}x)`
  );

  for (let i = 0; i < targets.length; i++) {
    targets[i].x *= multX;
    targets[i].y *= multY;
  }
}

function handleDPR() {
  dpr = (window.devicePixelRatio || 1) * sampling;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  var ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  rect = canvas.getBoundingClientRect(); // Update rect
}

function clearCanvas() {
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#ffffff";
  /* TODO: Try optimizing this, using seperate layers for background & game,
  also grid background */
}

function drawFPS(frameTime) {
  var fps = Math.round(1 / frameTime);
  context.fillText(`${fps} FPS (${frameTime * 1000} ms)`, 16, 16);
}
