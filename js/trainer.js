var gameOptions = gameModes["standard"];

var canvas;
var context;

var targets;

/* 
2px of tolerance, so hitboxes are actually 2px larger on every side compared to the texture
we do this to sort of compensate for dumbass cursors.
*/
var lenience = 2;

var targetImage = new Image();
targetImage.src = "../assets/images/target.png";

var hitAudio = new Audio("../assets/sounds/hit.wav");
var missAudio = new Audio("../assets/sounds/miss.wav");
var interactionAudio = new Audio("../assets/sounds/interaction.wav");
var sliderAudio = new Audio("../assets/sounds/slider.wav");

var backgroundColor = "#262335";

window.onload = function (e) {
  canvas = document.getElementsByTagName("canvas")[0];
  context = canvas.getContext("2d");

  canvas.onclick = function (e) {
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left; // x position within the element.
    var y = e.clientY - rect.top; // y position within the element.

    handleClick(x, y);
  };

  var modeSelector = document.getElementsByTagName("select")[0];

  modeSelector.onclick = function (e) {
    playSound(interactionAudio);
  };

  modeSelector.onchange = function (e) {
    gameOptions = gameModes[modeSelector.value];
    playSound(sliderAudio);
    beginGame();
  };

  beginGame();
  draw();
};

function populate() {
  for (let i = 0; i < gameOptions.targetCount; i++) {
    targets.push(createRandomTarget());
  }
}

function handleClick(x, y) {
  var newTargets = [];

  var hit = false;

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];

    var drawTarget = target.calculateDrawTarget();

    if (
      hit == false &&
      x >= drawTarget.x - lenience &&
      x <= drawTarget.x + drawTarget.width + lenience &&
      y >= drawTarget.y - lenience &&
      y <= drawTarget.y + drawTarget.height + lenience
    ) {
      playSound(hitAudio);
      hit = true;
      newTargets.push(createRandomTarget());
      continue;
    }

    newTargets.push(target);
  }

  if (!hit) {
    playSound(missAudio);
  }

  targets = newTargets;
}

var lastDraw;

function draw() {
  var now = Date.now();
  var deltaTime = (now - lastDraw) / 1000;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#ffffff";

  var newTargets = [];

  for (let i = 0; i < targets.length; i++) {
    drawTarget(targets[i]);

    targets[i].scale -= gameOptions.targetScaleSpeed * deltaTime;

    if (targets[i].scale > 0) {
      newTargets.push(targets[i]);
    } else {
      newTargets.push(createRandomTarget());
    }
  }

  targets = newTargets;

  lastDraw = now;
  requestAnimationFrame(draw);
}

function playSound(audio) {
  if (audio.readyState == HTMLMediaElement.HAVE_ENOUGH_DATA) {
    var clone = audio.cloneNode();
    clone.currentTime = 0;
    clone.play();
  }
}

function drawTarget(target) {
  var drawTarget = target.calculateDrawTarget();
  context.drawImage(
    targetImage,
    drawTarget.x,
    drawTarget.y,
    drawTarget.width,
    drawTarget.height
  );
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

function createRandomTarget(depth = 0) {
  var target = new Target(
    getRandomInt(0, canvas.width - 100),
    getRandomInt(0, canvas.height - 100),
    gameOptions.targetWidth,
    gameOptions.targetHeight,
    1
  );

  //  Avoid spawning targets inside each other.
  if (depth < 5) {
    // stop trying after 5 retries
    targets.forEach((compareTarget) => {
      if (
        target.x >= compareTarget.x - compareTarget.width &&
        target.x <=
          compareTarget.x + compareTarget.width + compareTarget.width &&
        target.y >= compareTarget.y - compareTarget.height &&
        target.y <=
          compareTarget.y + compareTarget.height + compareTarget.height
      ) {
        console.log("collision prevented.");
        return createRandomTarget(depth + 1);
      }
    });
  } else {
    console.log("couldn't prevent collision. (too many retries)");
  }

  return target;
}

function beginGame() {
  targets = [];

  populate();
}
