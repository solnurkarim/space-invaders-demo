/** @type {HTMLCanvasElement} */
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var displayWidth = document.body.clientWidth;
var displayHeight = document.body.clientHeight;
var displayWidthBase = 1366;
var displayHeightBase = 768;
var displayWidthDiff = displayWidth / displayWidthBase;
var displayHeightDiff = displayHeight / displayHeightBase;
var canvasWidthBase = 700;
canvas.width = canvasWidthBase * displayWidthDiff;
canvas.height = displayHeight;

var settings = {
  npcCount: 30,
  npcPerRow: 10,
};

var borders = {
  left: 0,
  right: canvas.width,
  top: 0,
  bottom: canvas.height,
};

var gaps = {
  NPCfield: {
    top: 20 * displayWidthDiff,
    bottom: null,
    right: (canvas.width - 50) * displayWidthDiff,
    left: 50 * displayWidthDiff,
  },
  NPC: {
    top: 10 * displayWidthDiff,
    bottom: 10 * displayWidthDiff,
    right: 15 * displayWidthDiff,
    left: 15 * displayWidthDiff,
  },
  player: {
    bottom: 20 * displayWidthDiff,
  },
};

var playerSpacecraftData = {
  width: 24 * displayWidthDiff,
  height: 24 * displayWidthDiff,
  hp: 150,
  damage: 50,
  speed: 7 * displayWidthDiff,
  fireRate: 50,
  projectileSpeed: 10 * displayHeightDiff,
  projectileWidth: 6 * displayWidthDiff,
  projectileHeight: 16 * displayWidthDiff,
};

var NPCSpacecraftData = {
  width: 30 * displayWidthDiff,
  height: 30 * displayWidthDiff,
  hp: 250,
  damage: 50,
  speed: 5 * displayWidthDiff,
  fireRate: 2000,
  projectileSpeed: 5 * displayHeightDiff,
  projectileWidth: 6 * displayWidthDiff,
  projectileHeight: 16 * displayWidthDiff,
};

var positions = {
  player: {
    x: canvas.width / 2 - playerSpacecraftData.width / 2,
    y: canvas.height - gaps.player.bottom - playerSpacecraftData.height,
    spacecraftImgShiftX: null,
    spacecraftImgShiftY: null,
    projectileImgShiftX: null,
    projectileImgShiftY: null,
  },
  npc: {
    projectileImgShiftX: null,
    projectileImgShiftY: null,
  },
};

var playerSpacecraft;
var NPCs = [];
var destroyedNPCs = [];

var playerSpacecraftImg = new Image();
playerSpacecraftImg.src = "assets/playerspacecraft.png";
playerSpacecraftImg.onload = function () {
  playerSpacecraftImg.width = playerSpacecraftImg.width * displayWidthDiff;
  playerSpacecraftImg.height = playerSpacecraftImg.height * displayWidthDiff;

  positions.player.spacecraftImgShiftX =
    (playerSpacecraftImg.width - playerSpacecraftData.width) / 2;
  positions.player.spacecraftImgShiftY =
    (playerSpacecraftImg.height - playerSpacecraftData.height) / 2;
};

var npcSpacecraftImg = new Image();
npcSpacecraftImg.src = "assets/npcspacecraft.png";

npcSpacecraftImg.onload = function () {
  npcSpacecraftImg.width = npcSpacecraftImg.width * displayWidthDiff;
  npcSpacecraftImg.height = npcSpacecraftImg.height * displayWidthDiff;
};

var background = new Image();
background.src = "assets/bg-min.jpg";

var explosion0 = new Image();
explosion0.src = "assets/explosion0.png";
var explosion1 = new Image();
explosion1.src = "assets/explosion1.png";
var explosion2 = new Image();
explosion2.src = "assets/explosion2.png";
var explosion3 = new Image();
explosion3.src = "assets/explosion3.png";
var explosion4 = new Image();
explosion4.src = "assets/explosion4.png";
var explosion5 = new Image();
explosion5.src = "assets/explosion5.png";

var explosionImgArr = [
  explosion0,
  explosion1,
  explosion2,
  explosion3,
  explosion4,
  explosion5,
];

explosionImgArr.forEach(function (img, index, arr) {
  img.onload = function () {
    img.width = (img.width / 2) * displayWidthDiff;
    img.height = (img.height / 2) * displayWidthDiff;
  };
});

var playerProjectileImg = new Image();
playerProjectileImg.src = "assets/beam-blue-52.png";
playerProjectileImg.onload = function () {
  playerProjectileImg.width = playerProjectileImg.width * displayWidthDiff;
  playerProjectileImg.height = playerProjectileImg.height * displayWidthDiff;

  positions.player.projectileImgShiftX =
    (playerProjectileImg.width - playerSpacecraftData.projectileWidth) / 2;
  positions.player.projectileImgShiftY =
    (playerProjectileImg.height - playerSpacecraftData.projectileHeight) / 2;
};

var npcProjectileImg = new Image();
npcProjectileImg.src = "assets/beam-red-32.png";
npcProjectileImg.onload = function () {
  npcProjectileImg.width = npcProjectileImg.width * displayWidthDiff;
  npcProjectileImg.height = npcProjectileImg.height * displayWidthDiff;

  positions.npc.projectileImgShiftX =
    (npcProjectileImg.width - NPCSpacecraftData.projectileWidth) / 2;
  positions.npc.projectileImgShiftY =
    (npcProjectileImg.height - NPCSpacecraftData.projectileHeight) / 2;
};

// function drawBackground() {
//   ctx.drawImage(
//     background,
//     0,
//     0,
//     canvas.width,
//     canvas.height,
//     0,
//     0,
//     canvas.width,
//     canvas.height
//   );
// }

function drawBackground() {
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
}

function createPlayerSpacecraft() {
  playerSpacecraft = {
    ...playerSpacecraftData,
    isPlayer: true,
    x0: positions.player.x,
    y0: positions.player.y,
    x1: positions.player.x + playerSpacecraftData.width,
    y1: positions.player.y + playerSpacecraftData.height,
    xCenter: positions.player.x + playerSpacecraftData.width / 2,
    yCenter: positions.player.y + playerSpacecraftData.height / 2,
    projectiles: [],
    isReloading: false,
    draw: function () {
      ctx.drawImage(
        playerSpacecraftImg,
        this.x0 - positions.player.spacecraftImgShiftX,
        this.y0 - positions.player.spacecraftImgShiftY,
        playerSpacecraftImg.width,
        playerSpacecraftImg.height
      );
      ctx.fillStyle = "red";
      ctx.fillRect(this.xCenter - 2, this.yCenter - 2, 4, 4);
    },
    moveTop: function () {
      this.y0 -= this.speed;
      this.y1 -= this.speed;
      this.yCenter -= this.speed;
    },
    moveBottom: function () {
      this.y0 += this.speed;
      this.y1 += this.speed;
      this.yCenter += this.speed;
    },
    moveRight: function () {
      this.x0 += this.speed;
      this.x1 += this.speed;
      this.xCenter += this.speed;
    },
    moveLeft: function () {
      this.x0 -= this.speed;
      this.x1 -= this.speed;
      this.xCenter -= this.speed;
    },
    shoot: function () {
      if (this.isReloading) {
        return;
      } else {
        this.projectiles.push(createProjectile(this));
        this.isReloading = true;
        setTimeout(() => {
          this.isReloading = false;
        }, this.fireRate);
      }
    },
  };
}

function createProjectile(spaceCraft) {
  var projectile = {
    x: spaceCraft.xCenter - spaceCraft.projectileWidth / 2,
    y: spaceCraft.isPlayer
      ? spaceCraft.yCenter - spaceCraft.height / 2 - spaceCraft.projectileHeight
      : spaceCraft.yCenter + spaceCraft.height / 2,
    width: spaceCraft.projectileWidth,
    height: spaceCraft.projectileHeight,
    speed: spaceCraft.projectileSpeed,
    color: spaceCraft.projectileColor,
    distanceMax: canvas.height - spaceCraft.y1,
    distance: 0,
    draw: function () {
      if (spaceCraft.isPlayer) {
        ctx.drawImage(
          playerProjectileImg,
          this.x - positions.player.projectileImgShiftX,
          this.y - positions.player.projectileImgShiftY,
          playerProjectileImg.width,
          playerProjectileImg.height
        );
      } else {
        ctx.drawImage(
          npcProjectileImg,
          this.x - positions.npc.projectileImgShiftX,
          this.y - positions.npc.projectileImgShiftY,
          npcProjectileImg.width,
          npcProjectileImg.height
        );
      }
      // ctx.fillStyle = this.color;
      // ctx.fillRect(this.x, this.y, this.width, this.height);
    },
    move: function () {
      if (spaceCraft.isPlayer) {
        this.y -= this.speed;
        this.distance += this.speed;
      } else {
        this.y += this.speed;
        this.distance += this.speed;
      }
    },
  };

  return projectile;
}

var explosions = [];

function explode(spaceCraft) {
  var explosion = {
    x: spaceCraft.xCenter,
    y: spaceCraft.yCenter,
    phase: 0,
    phaseMax: 5,
    isCompleted: false,
    intervalId: null,
    draw: function () {
      var img = explosionImgArr[this.phase];
      // var width = img.naturalWidth / 2;
      // var height = img.naturalHeight / 2;
      var width = (img.naturalWidth / 2) * displayWidthDiff;
      var height = (img.naturalHeight / 2) * displayWidthDiff;
      ctx.drawImage(
        img,
        this.x - width / 2,
        this.y - height / 2,
        width,
        height
      );
    },
    start: function () {
      this.intervalId = setInterval(() => {
        if (this.phase >= this.phaseMax) {
          this.isCompleted = true;
          clearInterval(this.intervalId);
        } else {
          this.phase++;
        }
      }, 100);
    },
  };

  explosion.start();
  explosions.push(explosion);
}

function checkProjectileCollision(spaceCraft, projectile, projectileIndex) {
  var x0 = projectile.x;
  var y0 = projectile.y;
  var x1 = projectile.x + projectile.width;
  var y1 = projectile.y + projectile.height;
  if (spaceCraft.isPlayer) {
    NPCs.forEach(function (npc, index, arr) {
      if (
        // (x1 >= npc.x0 && x1 <= npc.x1 && y1 >= npc.y0 && y1 <= npc.y1) ||
        // (x0 <= npc.x1 && x0 >= npc.x0 && y1 >= npc.y0 && y1 <= npc.y1)
        (x1 >= npc.x0 && x1 <= npc.x1 && y1 >= npc.y0 && y1 <= npc.y1) ||
        (x0 >= npc.x0 && x0 <= npc.x1 && y0 >= npc.y0 && y0 <= npc.y1)
      ) {
        npc.hp -= spaceCraft.damage;
        if (npc.hp <= 0) {
          clearInterval(npc.intervalId);
          explode(npc);
          destroyedNPCs.push(npc);
          arr.splice(index, 1);
        }
        spaceCraft.projectiles.splice(projectileIndex, 1);
      }
    });
  } else {
    if (
      (x1 >= playerSpacecraft.x0 &&
        x1 <= playerSpacecraft.x1 &&
        y1 >= playerSpacecraft.y0 &&
        y1 <= playerSpacecraft.y1) ||
      (x0 <= playerSpacecraft.x1 &&
        x0 >= playerSpacecraft.x0 &&
        y1 >= playerSpacecraft.y0 &&
        y1 <= playerSpacecraft.y1)
    ) {
      playerSpacecraft.hp -= spaceCraft.damage;
      if (playerSpacecraft.hp <= 0) {
        explode(playerSpacecraft);
        playerSpacecraft = null;
      }
      spaceCraft.projectiles.splice(projectileIndex, 1);
    }
  }
}

var npcCount = 0;
var NPCprojectiles = [];

function createNPCSpacecraft(position) {
  var npc = {
    ...NPCSpacecraftData,
    id: npcCount++,
    isPlayer: false,
    x0: position.x,
    y0: position.y,
    x1: position.x + NPCSpacecraftData.width,
    y1: position.y + NPCSpacecraftData.height,
    xCenter: position.x + NPCSpacecraftData.width / 2,
    yCenter: position.y + NPCSpacecraftData.height / 2,
    xImageShift: 4,
    yImageShift: 5,
    projectiles: [],
    shiftDistanceMax: NPCSpacecraftData.width / 2,
    shiftDistanceMin: -NPCSpacecraftData.width / 2,
    shiftDistance: 0,
    intervalId: null,
    draw: function () {
      ctx.drawImage(
        npcSpacecraftImg,
        this.x0 - this.xImageShift,
        this.y0 - this.yImageShift,
        npcSpacecraftImg.width,
        npcSpacecraftImg.height
      );
      // ctx.fillStyle = "red";
      // ctx.fillRect(this.xCenter - 2, this.yCenter - 2, 4, 4);
    },
    moveTop: function () {
      this.y0 -= this.speed;
      this.y1 -= this.speed;
      this.yCenter -= this.speed;
    },
    moveBottom: function () {
      this.y0 += this.speed;
      this.y1 += this.speed;
      this.yCenter += this.speed;
    },
    moveRight: function () {
      this.x0 += this.speed;
      this.x1 += this.speed;
      this.xCenter += this.speed;
    },
    moveLeft: function () {
      this.x0 -= this.speed;
      this.x1 -= this.speed;
      this.xCenter -= this.speed;
    },
    shoot: function () {
      // if (!this.isPlayer) {
      //   NPCprojectiles.forEach((obj, index, arr) => {
      //     if (obj.id == this.id) {
      //       obj.projectiles.push(createProjectile(this));
      //     }
      //   });
      // } else this.projectiles.push(createProjectile(this));

      this.projectiles.push(createProjectile(this));
    },
    start: function () {
      this.intervalId = setInterval(() => {
        this.shoot();
      }, this.fireRate);
    },
  };

  // var projectilesObj = { id: npc.id, projectiles: [] };
  // NPCprojectiles.push(projectilesObj);

  // this.projectiles = projectilesObj.projectiles;

  return npc;
}

function createNPCs() {
  var totalWidths = settings.npcPerRow * NPCSpacecraftData.width;
  var totalGaps = (settings.npcPerRow - 1) * (gaps.NPC.left + gaps.NPC.right);
  var xNPCfield = (canvas.width - totalWidths - totalGaps) / 2;
  var yNPCfield = gaps.NPCfield.top;

  for (i = 0; i < settings.npcCount; i++) {
    var position = { x: null, y: null };

    if (i == 0) {
      position.x = xNPCfield;
      position.y = yNPCfield + NPCSpacecraftData.height / 2;
    } else if (i < settings.npcPerRow) {
      position.x =
        xNPCfield +
        (NPCSpacecraftData.width + gaps.NPC.left + gaps.NPC.right) * i;
      position.y = yNPCfield + NPCSpacecraftData.height / 2;
    } else if (i < settings.npcPerRow * 2) {
      position.x =
        xNPCfield +
        (NPCSpacecraftData.width + gaps.NPC.left + gaps.NPC.right) *
          (i - settings.npcPerRow);
      position.y =
        yNPCfield +
        NPCSpacecraftData.height / 2 +
        NPCSpacecraftData.height +
        gaps.NPC.top +
        gaps.NPC.bottom;
    } else {
      position.x =
        xNPCfield +
        (NPCSpacecraftData.width + gaps.NPC.left + gaps.NPC.right) *
          (i - settings.npcPerRow * 2);
      position.y =
        yNPCfield +
        NPCSpacecraftData.height +
        NPCSpacecraftData.height * 2 +
        gaps.NPC.top +
        gaps.NPC.bottom +
        5;
    }

    const npc = createNPCSpacecraft(position);
    var randomTimeout = Math.round(npc.fireRate * Math.random());
    setTimeout(() => {
      npc.shoot();
      npc.start();
    }, randomTimeout);
    NPCs.push(npc);
  }
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const keyCode in keysState) {
    if (keysState[keyCode] == true) {
      if (keyCode == 87) playerSpacecraft.moveTop();
      if (keyCode == 83) playerSpacecraft.moveBottom();
      if (keyCode == 68) playerSpacecraft.moveRight();
      if (keyCode == 65) playerSpacecraft.moveLeft();
      if (keyCode == 75) playerSpacecraft.shoot();
    }
  }

  drawBackground();

  playerSpacecraft.draw();

  for (const npc of NPCs) {
    npc.draw();

    var projectileIndex = 0;
    for (const projectile of npc.projectiles) {
      if (projectile.distance > projectile.distanceMax) {
        npc.projectiles.splice(projectileIndex, 1);
      } else {
        projectile.draw();
        projectile.move();
        checkProjectileCollision(npc, projectile, projectileIndex);
      }

      projectileIndex++;
    }
  }

  var destroyedNPCIndex = 0;
  for (const npc of destroyedNPCs) {
    var projectileIndex = 0;

    for (const projectile of npc.projectiles) {
      if (projectile.distance > projectile.distanceMax) {
        npc.projectiles.splice(projectileIndex, 1);
      } else {
        projectile.draw();
        projectile.move();
        checkProjectileCollision(npc, projectile, projectileIndex);
      }

      projectileIndex++;
    }

    if (npc.projectiles.length == 0) {
      destroyedNPCs.splice(destroyedNPCIndex, 1);
    }

    destroyedNPCIndex++;
  }

  // NPCprojectiles.forEach(function (obj, objIndex, objArr) {
  //   NPCs.forEach(function (npc, index, arr) {
  //     if (npc.id == obj.id) {
  //     }
  //   });

  //   obj.projectiles.forEach(function (projectile, index, arr) {
  //     if (projectile.distance >= projectile.distanceMax) {
  //       arr.splice(index, 1);
  //     } else {
  //       projectile.draw();
  //       projectile.move();
  //       checkProjectileCollision(npc, projectile, index);
  //     }
  //   });
  // });

  playerSpacecraft.projectiles.forEach(function (projectile, index, arr) {
    if (projectile.y < -projectile.height) {
      arr.splice(index, 1);
    } else {
      projectile.draw();
      projectile.move();
      checkProjectileCollision(playerSpacecraft, projectile, index);
    }
  });

  explosions.forEach(function (explosion, index, arr) {
    if (explosion.isCompleted) {
      arr.splice(index, 1);
    } else {
      explosion.draw();
    }
  });

  window.requestAnimationFrame(update);
}

var keysState = {
  68: null,
  65: null,
  87: null,
  83: null,
  75: null,
};

// w - 87, a - 65, s - 83, d - 68, k - 75
function onKeyDown(key) {
  // if (key.keyCode == 75) {
  // playerSpacecraft.shoot();
  // }

  if (keysState.hasOwnProperty(key.keyCode)) {
    // for (const keyCode in keysState) {
    //   keysState[keyCode] = null;
    // }
    keysState[key.keyCode] = true;
  }
}

function onKeyUp(key) {
  if (keysState.hasOwnProperty(key.keyCode)) keysState[key.keyCode] = null;
}

document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);

drawBackground();
createNPCs();
createPlayerSpacecraft();
update();
