/* ================================================================
   KING'S COURT — BASKETBALL ENTRY GAME

   Mouse/touch: drag backwards from the ball and release.
   Keyboard: arrows adjust angle/power; Space shoots.
   ================================================================ */

const canvas = document.querySelector("#basketball-game");
const context = canvas?.getContext("2d");

if (canvas && context) {
  const WIDTH = 900;
  const HEIGHT = 520;
  const GROUND = 470;
  const GRAVITY = 0.24;

  const hoop = {
    left: 705,
    right: 785,
    y: 245,
    backboardX: 815
  };

  const start = { x: 140, y: 430 };

  const ball = {
    x: start.x,
    y: start.y,
    previousY: start.y,
    radius: 18,
    velocityX: 0,
    velocityY: 0,
    rotation: 0,
    inFlight: false
  };

  let attempts = 0;
  let isDragging = false;
  let dragPoint = { x: start.x - 70, y: start.y + 80 };
  let keyboardAngle = 55;
  let keyboardPower = 14;
  let resetCountdown = 0;
  let gameUnlocked = false;
  let lastTimestamp = performance.now();

  const attemptCount = document.querySelector("#attempt-count");
  const gameStatus = document.querySelector("#game-status");
  const shootButton = document.querySelector("#shoot-button");
  const resetButton = document.querySelector("#reset-button");
  const gameGate = document.querySelector("#game-gate");
  const quizApp = document.querySelector("#quiz-app");
  const bucketMessage = document.querySelector("#bucket-message");

  function setStatus(message) {
    if (gameStatus) gameStatus.textContent = message;
  }

  function updateAttemptDisplay() {
    if (attemptCount) {
      attemptCount.textContent = String(attempts).padStart(2, "0");
    }
  }

  function resetBall(message = "Ball in hand") {
    ball.x = start.x;
    ball.y = start.y;
    ball.previousY = start.y;
    ball.velocityX = 0;
    ball.velocityY = 0;
    ball.rotation = 0;
    ball.inFlight = false;
    resetCountdown = 0;
    isDragging = false;
    canvas.classList.remove("is-aiming");
    setStatus(message);
  }

  function shoot(velocityX, velocityY) {
    if (ball.inFlight || gameUnlocked) return;

    const speed = Math.hypot(velocityX, velocityY);

    // Prevent tiny or backwards drag gestures from counting as attempts.
    if (velocityX < 3.5 || velocityY > -4 || speed < 7) {
      setStatus("Pull down and back");
      return;
    }

    ball.velocityX = Math.min(velocityX, 15.5);
    ball.velocityY = Math.max(velocityY, -17.5);
    ball.inFlight = true;
    attempts += 1;
    updateAttemptDisplay();
    setStatus("Shot is up");
  }

  function shootKeyboardPreset() {
    const radians = (keyboardAngle * Math.PI) / 180;
    const velocityX = keyboardPower * Math.cos(radians);
    const velocityY = -keyboardPower * Math.sin(radians);
    shoot(velocityX, velocityY);
  }

  function unlockQuiz() {
    if (gameUnlocked) return;

    gameUnlocked = true;
    ball.inFlight = false;
    setStatus("Bucket!");
    bucketMessage?.classList.add("is-visible");

    window.setTimeout(() => {
      if (gameGate) gameGate.hidden = true;
      if (quizApp) {
        quizApp.hidden = false;
        quizApp.focus();
      }
      document.body.classList.add("quiz-is-open");
    }, 1200);
  }

  function pointerPosition(event) {
    const rectangle = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rectangle.left) / rectangle.width) * WIDTH,
      y: ((event.clientY - rectangle.top) / rectangle.height) * HEIGHT
    };
  }

  function startDragging(event) {
    if (ball.inFlight || gameUnlocked) return;

    const point = pointerPosition(event);
    const distanceFromBall = Math.hypot(point.x - ball.x, point.y - ball.y);

    if (distanceFromBall > 72) return;

    isDragging = true;
    dragPoint = point;
    canvas.classList.add("is-aiming");
    canvas.setPointerCapture?.(event.pointerId);
    setStatus("Release to shoot");
  }

  function updateDragging(event) {
    if (!isDragging) return;
    dragPoint = pointerPosition(event);

    // Keep the drag point behind and beneath the basketball.
    dragPoint.x = Math.min(ball.x - 10, Math.max(10, dragPoint.x));
    dragPoint.y = Math.max(ball.y + 10, Math.min(HEIGHT - 5, dragPoint.y));
  }

  function releaseDragging(event) {
    if (!isDragging) return;

    updateDragging(event);
    isDragging = false;
    canvas.classList.remove("is-aiming");

    const velocityX = (ball.x - dragPoint.x) * 0.115;
    const velocityY = (ball.y - dragPoint.y) * 0.145;
    shoot(velocityX, velocityY);
  }

  function collideWithRim(rimX) {
    const rimRadius = 6;
    const differenceX = ball.x - rimX;
    const differenceY = ball.y - hoop.y;
    const distance = Math.hypot(differenceX, differenceY);
    const minimumDistance = ball.radius + rimRadius;

    if (distance === 0 || distance >= minimumDistance) return;

    const normalX = differenceX / distance;
    const normalY = differenceY / distance;
    const overlap = minimumDistance - distance;

    ball.x += normalX * overlap;
    ball.y += normalY * overlap;

    const velocityAlongNormal =
      ball.velocityX * normalX + ball.velocityY * normalY;

    if (velocityAlongNormal < 0) {
      ball.velocityX -= 1.55 * velocityAlongNormal * normalX;
      ball.velocityY -= 1.55 * velocityAlongNormal * normalY;
      ball.velocityX *= 0.82;
      ball.velocityY *= 0.82;
    }
  }

  function updatePhysics(delta) {
    if (!ball.inFlight || gameUnlocked) return;

    ball.previousY = ball.y;
    ball.velocityY += GRAVITY * delta;
    ball.x += ball.velocityX * delta;
    ball.y += ball.velocityY * delta;
    ball.rotation += ball.velocityX * 0.025 * delta;

    // Backboard collision.
    if (
      ball.x + ball.radius >= hoop.backboardX &&
      ball.x < hoop.backboardX &&
      ball.y > 140 &&
      ball.y < 305
    ) {
      ball.x = hoop.backboardX - ball.radius;
      ball.velocityX *= -0.68;
      ball.velocityY *= 0.92;
    }

    collideWithRim(hoop.left);
    collideWithRim(hoop.right);

    // A basket counts only while the ball is travelling down through the rim.
    const crossedRim = ball.previousY < hoop.y && ball.y >= hoop.y;
    const insideRim =
      ball.x > hoop.left + ball.radius * 0.25 &&
      ball.x < hoop.right - ball.radius * 0.25;

    if (crossedRim && insideRim && ball.velocityY > 0) {
      unlockQuiz();
      return;
    }

    // Floor bounce and automatic retry.
    if (ball.y + ball.radius >= GROUND) {
      ball.y = GROUND - ball.radius;
      ball.velocityY *= -0.48;
      ball.velocityX *= 0.72;

      if (Math.abs(ball.velocityY) < 1.2) {
        ball.velocityY = 0;
        ball.velocityX = 0;
        resetCountdown += delta;
      }
    }

    const outsideCourt =
      ball.x > WIDTH + 90 || ball.x < -90 || ball.y > HEIGHT + 90;

    if (outsideCourt || resetCountdown > 28) {
      resetBall("Try another shot");
    }
  }

  function drawCourt() {
    const gradient = context.createLinearGradient(0, 0, 0, HEIGHT);
    gradient.addColorStop(0, "#041127");
    gradient.addColorStop(0.62, "#08264a");
    gradient.addColorStop(0.63, "#b77a32");
    gradient.addColorStop(1, "#7e4a21");
    context.fillStyle = gradient;
    context.fillRect(0, 0, WIDTH, HEIGHT);

    // Arena glow.
    const glow = context.createRadialGradient(690, 200, 10, 690, 200, 360);
    glow.addColorStop(0, "rgba(237,23,76,.22)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, WIDTH, HEIGHT);

    // Crowd lights.
    context.fillStyle = "rgba(255,255,255,.28)";
    for (let index = 0; index < 58; index += 1) {
      const x = (index * 83) % WIDTH;
      const y = 44 + ((index * 47) % 150);
      const radius = index % 7 === 0 ? 2.2 : 1;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }

    // Hardwood boards.
    context.strokeStyle = "rgba(255,255,255,.09)";
    context.lineWidth = 1;
    for (let x = 0; x < WIDTH; x += 74) {
      context.beginPath();
      context.moveTo(x, 328);
      context.lineTo(x + 45, HEIGHT);
      context.stroke();
    }

    // Court lines and key.
    context.strokeStyle = "rgba(255,255,255,.58)";
    context.lineWidth = 2;
    context.strokeRect(650, 326, 250, 144);
    context.beginPath();
    context.arc(650, 398, 72, -Math.PI / 2, Math.PI / 2);
    context.stroke();

    // Backboard.
    context.strokeStyle = "#f7f3eb";
    context.lineWidth = 7;
    context.beginPath();
    context.moveTo(hoop.backboardX, 135);
    context.lineTo(hoop.backboardX, 300);
    context.stroke();
    context.strokeStyle = "rgba(255,255,255,.7)";
    context.lineWidth = 3;
    context.strokeRect(775, 195, 40, 50);

    // Rim.
    context.strokeStyle = "#f0642a";
    context.lineWidth = 8;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(hoop.left, hoop.y);
    context.lineTo(hoop.right, hoop.y);
    context.stroke();

    // Net.
    context.strokeStyle = "rgba(255,255,255,.66)";
    context.lineWidth = 1.5;
    context.lineCap = "butt";
    for (let index = 0; index <= 6; index += 1) {
      const rimX = hoop.left + ((hoop.right - hoop.left) / 6) * index;
      const bottomX = 723 + (44 / 6) * index;
      context.beginPath();
      context.moveTo(rimX, hoop.y + 4);
      context.lineTo(bottomX, hoop.y + 63);
      context.stroke();
    }
    for (let row = 1; row <= 3; row += 1) {
      const y = hoop.y + row * 15;
      const inset = row * 4;
      context.beginPath();
      context.moveTo(hoop.left + inset, y);
      context.lineTo(hoop.right - inset, y);
      context.stroke();
    }
  }

  function shotVelocityForPreview() {
    if (isDragging) {
      return {
        x: (ball.x - dragPoint.x) * 0.115,
        y: (ball.y - dragPoint.y) * 0.145
      };
    }

    const radians = (keyboardAngle * Math.PI) / 180;
    return {
      x: keyboardPower * Math.cos(radians),
      y: -keyboardPower * Math.sin(radians)
    };
  }

  function drawTrajectory() {
    if (ball.inFlight || gameUnlocked) return;

    const velocity = shotVelocityForPreview();
    context.fillStyle = "rgba(237,23,76,.56)";

    for (let step = 6; step <= 66; step += 6) {
      const x = ball.x + velocity.x * step;
      const y = ball.y + velocity.y * step + 0.5 * GRAVITY * step * step;
      if (x > WIDTH || y > GROUND) break;
      context.beginPath();
      context.arc(x, y, Math.max(1.5, 4 - step * 0.035), 0, Math.PI * 2);
      context.fill();
    }

    if (isDragging) {
      context.strokeStyle = "rgba(255,255,255,.55)";
      context.lineWidth = 2;
      context.setLineDash([7, 7]);
      context.beginPath();
      context.moveTo(ball.x, ball.y);
      context.lineTo(dragPoint.x, dragPoint.y);
      context.stroke();
      context.setLineDash([]);
    }
  }

  function drawBall() {
    context.save();
    context.translate(ball.x, ball.y);
    context.rotate(ball.rotation);

    const ballGradient = context.createRadialGradient(-6, -8, 3, 0, 0, ball.radius);
    ballGradient.addColorStop(0, "#ffb04a");
    ballGradient.addColorStop(0.62, "#ec762b");
    ballGradient.addColorStop(1, "#a93f16");
    context.fillStyle = ballGradient;
    context.beginPath();
    context.arc(0, 0, ball.radius, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = "rgba(49,19,8,.9)";
    context.lineWidth = 2;
    context.beginPath();
    context.arc(0, 0, ball.radius * 0.98, 0, Math.PI * 2);
    context.moveTo(-ball.radius, 0);
    context.lineTo(ball.radius, 0);
    context.moveTo(0, -ball.radius);
    context.bezierCurveTo(-8, -8, -8, 8, 0, ball.radius);
    context.moveTo(0, -ball.radius);
    context.bezierCurveTo(8, -8, 8, 8, 0, ball.radius);
    context.stroke();
    context.restore();
  }

  function drawAimReadout() {
    if (ball.inFlight || gameUnlocked) return;
    context.fillStyle = "rgba(255,255,255,.62)";
    context.font = "700 12px Inter, sans-serif";
    context.textAlign = "right";
    context.fillText(`ANGLE ${String(keyboardAngle).padStart(2, "0")}°`, WIDTH - 22, 34);
    context.fillText(`POWER ${keyboardPower.toFixed(1)}`, WIDTH - 22, 54);
  }

  function draw() {
    drawCourt();
    drawTrajectory();
    drawBall();
    drawAimReadout();
  }

  function animationLoop(timestamp) {
    const elapsed = Math.min((timestamp - lastTimestamp) / 16.667, 2);
    lastTimestamp = timestamp;
    updatePhysics(elapsed);
    draw();
    window.requestAnimationFrame(animationLoop);
  }

  canvas.addEventListener("pointerdown", startDragging);
  canvas.addEventListener("pointermove", updateDragging);
  canvas.addEventListener("pointerup", releaseDragging);
  canvas.addEventListener("pointercancel", () => {
    isDragging = false;
    canvas.classList.remove("is-aiming");
  });

  canvas.addEventListener("keydown", (event) => {
    if (ball.inFlight || gameUnlocked) return;

    if (event.key === "ArrowLeft") keyboardAngle = Math.min(75, keyboardAngle + 2);
    if (event.key === "ArrowRight") keyboardAngle = Math.max(35, keyboardAngle - 2);
    if (event.key === "ArrowUp") keyboardPower = Math.min(18, keyboardPower + 0.4);
    if (event.key === "ArrowDown") keyboardPower = Math.max(9, keyboardPower - 0.4);
    if (event.key === " " || event.key === "Enter") shootKeyboardPreset();

    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "Enter"].includes(event.key)) {
      event.preventDefault();
      setStatus(`Aim ${keyboardAngle}° · Power ${keyboardPower.toFixed(1)}`);
    }
  });

  shootButton?.addEventListener("click", shootKeyboardPreset);
  resetButton?.addEventListener("click", () => resetBall());

  updateAttemptDisplay();
  draw();
  window.requestAnimationFrame(animationLoop);
}
