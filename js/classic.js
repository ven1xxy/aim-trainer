var difficulties = {
  unlosable: {
    targetCount: 3,
    targetWidth: 50,
    targetHeight: 50,
    targetScaleSpeed: -0.5,
  },

  easy: {
    targetCount: 1,
    targetWidth: 100,
    targetHeight: 100,
    targetScaleSpeed: 0.5,
  },

  medium: {
    targetCount: 4,
    targetWidth: 50,
    targetHeight: 50,
    targetScaleSpeed: 0.1,
  },

  hard: {
    targetCount: 4,
    targetWidth: 45,
    targetHeight: 45,
    targetScaleSpeed: 0.2,
  },

  nightmare: {
    targetCount: 4,
    targetWidth: 35,
    targetHeight: 35,
    targetScaleSpeed: 0.25,
  },

  dead: {
    targetCount: 2,
    targetWidth: 25,
    targetHeight: 25,
    targetScaleSpeed: 0.4,
  },
};

var gameOptions = difficulties["medium"];

var dpr = window.devicePixelRatio || 1; // Used for DPI Scaling.

var sampling = 1;

var canvas;
var context;
var rect;

var targets = [];

var lastDraw = Date.now();

/* 
2px of tolerance, so hitboxes are actually 2px larger on every side compared to the texture
we do this to sort of compensate for dumbass cursors.
*/
var lenience = 2;

var targetImage = new Image();
targetImage.src = "./assets/images/target.png";

var hitAudio = new Audio("./assets/sounds/hit.wav");
var missAudio = new Audio("./assets/sounds/miss.wav");
var interactionAudio = new Audio("./assets/sounds/interaction.wav");
var sliderAudio = new Audio("./assets/sounds/slider.wav");

var backgroundColor = "#262335";

window.onload = function (e) {
  /*  "No super" modals */
  var modals = document.getElementsByClassName("modal");
  for (let i = 0; i < modals.length; i++) {
    const modal = modals[i];
    modal.onclick = function (e) {
      noSuper(e);
    };
  }

  canvas = document.getElementsByTagName("canvas")[0];
  context = canvas.getContext("2d");

  // Initialize renderer.
  initRenderer();

  canvas.onmousedown = function (e) {
    rect = canvas.getBoundingClientRect();

    var x = e.clientX - rect.left; // x position within the element.
    var y = e.clientY - rect.top; // y position within the element.

    handleClick(x, y);
  };

  window.onresize = function (e) {
    resizeCanvas();
  };

  var modeSelector = document.getElementsByTagName("select")[0];

  modeSelector.onclick = function (e) {
    playSound(interactionAudio);
  };

  modeSelector.onchange = function (e) {
    gameOptions = difficulties[modeSelector.value];
    playSound(sliderAudio);
    beginGame();
  };

  beginGame();
  draw();
};

function populate() {
  for (let i = 0; i < gameOptions.targetCount; i++) {
    targets.push(createRandomTarget(0));
  }
}

function handleClick(x, y) {
  var newTargets = [];

  var hit = false;

  // Reversed, so the target on top is checked first.
  for (let i = targets.length - 1; i >= 0; i--) {
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
      newTargets[i] = createRandomTarget(0);
      continue;
    }

    newTargets[i] = target;
  }

  if (!hit) {
    playSound(missAudio);
  }

  targets = newTargets;
}

function draw() {
  var now = Date.now();
  var deltaTime = (now - lastDraw) / 1000;

  clearCanvas();

  var newTargets = [];

  for (let i = 0; i < targets.length; i++) {
    drawTarget(targets[i], targetImage);

    targets[i].scale -= gameOptions.targetScaleSpeed * deltaTime;

    if (targets[i].scale > 0) {
      newTargets.push(targets[i]);
    } else {
      newTargets.push(createRandomTarget(0));
      playSound(missAudio);
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

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

function createRandomTarget(depth = 0) {
  var target = new Target(
    getRandomInt(0, canvas.width / dpr - 100),
    getRandomInt(0, canvas.height / dpr - 100),
    gameOptions.targetWidth,
    gameOptions.targetHeight,
    1
  );

  //  Avoid spawning targets inside each other.
  if (depth < 5) {
    // stop trying after 5 retries
    for (let i = 0; i < targets.length; i++) {
      const compareTarget = targets[i];
      if (
        target.x >= compareTarget.x - compareTarget.width &&
        target.x <= compareTarget.x + compareTarget.width &&
        target.y >= compareTarget.y - compareTarget.height &&
        target.y <= compareTarget.y + compareTarget.height
      ) {
        return createRandomTarget(depth + 1);
      }
    }
  } else {
    console.log("couldn't prevent collision. (too many retries)");
  }

  return target;
}

function beginGame() {
  targets = [];

  populate();
}

function showModal(modalID) {
  var modalsContainer = document.getElementById("modals");
  modalsContainer.className = "";
  var graphicsModal = document.getElementById(modalID);
  graphicsModal.className = "modal";
}

function hideModals() {
  // Hides *all* modals.
  var modalsContainer = document.getElementById("modals");
  modalsContainer.className = "hide";
  var modals = document.getElementsByClassName("modal");
  for (let i = 0; i < modals.length; i++) {
    const modal = modals[i];
    modal.className = "modal hide";
  }
}

function noSuper(e) {
  e.stopPropagation();
}
