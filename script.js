"use strict";

/* =========================================
   HASSAN SAJID DIGITAL MAGIC PRO MAX
   HTML + CSS + JavaScript
========================================= */

const canvas = document.getElementById("magicCanvas");
const ctx = canvas.getContext("2d");

const modeSelect = document.getElementById("modeSelect");
const colorPicker = document.getElementById("colorPicker");
const powerRange = document.getElementById("powerRange");
const powerValue = document.getElementById("powerValue");
const nameInput = document.getElementById("nameInput");
const canvasHint = document.getElementById("canvasHint");

const autoBtn = document.getElementById("autoBtn");
const soundBtn = document.getElementById("soundBtn");
const nameBtn = document.getElementById("nameBtn");
const clearBtn = document.getElementById("clearBtn");
const saveBtn = document.getElementById("saveBtn");

const photoBtn = document.getElementById("photoBtn");
const photoInput = document.getElementById("photoInput");
const removePhotoBtn = document.getElementById("removePhotoBtn");
const uploadedPhoto = document.getElementById("uploadedPhoto");

const secretBtn = document.getElementById("secretBtn");
const secretDialog = document.getElementById("secretDialog");
const secretForm = document.getElementById("secretForm");
const secretCode = document.getElementById("secretCode");
const secretTitle = document.getElementById("secretTitle");
const secretDescription = document.getElementById("secretDescription");
const secretMessage = document.getElementById("secretMessage");
const secretSubmit = document.getElementById("secretSubmit");
const secretClose = document.getElementById("secretClose");

const helpDialog = document.getElementById("helpDialog");
const startBtn = document.getElementById("startBtn");
const howBtn = document.getElementById("howBtn");
const menuBtn = document.getElementById("menuBtn");
const dashboard = document.getElementById("dashboard");

document.getElementById("year").textContent =
  new Date().getFullYear();

/* ---------- State ---------- */

let width = 0;
let height = 0;
let dpr = 1;

let particles = [];
let stars = [];

let pointerDown = false;
let pointerX = 0;
let pointerY = 0;

let autoMagic = false;
let soundEnabled = false;
let audioContext = null;
let animationFrame = 0;
let lastFrame = 0;

let photoObjectURL = null;
let nameParticles = [];
let secretUnlocked = true;
let savedPasscode = null;

const MAX_PARTICLES = 1300;

const random = (min, max) =>
  Math.random() * (max - min) + min;

const currentColor = () => colorPicker.value || "#48d9ff";

const intensity = () =>
  Number(powerRange.value) / 100;

/* ---------- Canvas setup ---------- */

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();

  width = Math.max(1, rect.width);
  height = Math.max(1, rect.height);
  dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  createStars();
}

function createStars() {
  const count = Math.min(
    180,
    Math.max(50, Math.floor((width * height) / 3500))
  );

  stars = Array.from({ length: count }, () => ({
    x: random(0, width),
    y: random(0, height),
    z: random(0.15, 1),
    size: random(0.5, 2),
    phase: random(0, Math.PI * 2)
  }));
}

window.addEventListener("resize", resizeCanvas);

/* ---------- Particle creation ---------- */

function addParticle(x, y, options = {}) {
  if (particles.length >= MAX_PARTICLES) {
    particles.splice(0, 25);
  }

  const angle = random(0, Math.PI * 2);
  const force = random(0.4, 3.5) * (0.5 + intensity());

  particles.push({
    x,
    y,
    vx: Math.cos(angle) * force,
    vy: Math.sin(angle) * force,
    life: options.life || random(35, 90),
    maxLife: options.life || random(35, 90),
    size: options.size || random(1.2, 4.2),
    color: options.color || currentColor(),
    mode: options.mode || modeSelect.value,
    textParticle: Boolean(options.textParticle),
    gravity: options.gravity || 0
  });
}

function burst(x, y, amount = 30) {
  for (let i = 0; i < amount; i++) {
    const angle = (Math.PI * 2 * i) / amount;
    const speed = random(1, 5) * (0.5 + intensity());

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: random(30, 85),
      maxLife: 85,
      size: random(1.5, 4),
      color: currentColor(),
      mode: "spark",
      textParticle: false,
      gravity: 0
    });
  }

  if (particles.length > MAX_PARTICLES) {
    particles.splice(0, particles.length - MAX_PARTICLES);
  }

  playTone(520, 0.07);
}

/* ---------- Draw particles ---------- */

function drawParticle(p) {
  const alpha = Math.max(0, Math.min(1, p.life / p.maxLife));
  const color = p.color;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8 + p.size * 2;

  if (p.mode === "orbit") {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
    ctx.stroke();
  } else if (p.mode === "spark") {
    ctx.beginPath();
    ctx.moveTo(p.x - p.vx * 2, p.y - p.vy * 2);
    ctx.lineTo(p.x, p.y);
    ctx.lineWidth = Math.max(1, p.size);
    ctx.stroke();
  } else if (p.mode === "firefly") {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 1.6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function updateParticles() {
  const mode = modeSelect.value;
  const centerX = width / 2;
  const centerY = height / 2;

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    if (mode === "vortex" || p.mode === "vortex") {
      const dx = centerX - p.x;
      const dy = centerY - p.y;

      p.vx += -dy * 0.0008;
      p.vy += dx * 0.0008;
    }

    if (p.mode === "orbit") {
      p.vx += (centerX - p.x) * 0.0005;
      p.vy += (centerY - p.y) * 0.0005;
    }

    if (p.mode === "firefly") {
      p.vx += random(-0.04, 0.04);
      p.vy += random(-0.04, 0.04);
    }

    p.vy += p.gravity;
    p.x += p.vx;
    p.y += p.vy;

    p.vx *= 0.992;
    p.vy *= 0.992;

    p.life--;

    if (
      p.life <= 0 ||
      p.x < -80 ||
      p.x > width + 80 ||
      p.y < -80 ||
      p.y > height + 80
    ) {
      particles.splice(i, 1);
      continue;
    }

    drawParticle(p);
  }
}

/* ---------- 3D-style space ---------- */

function drawSpace3D(time) {
  for (const star of stars) {
    const pulse = 0.55 + Math.sin(time * 0.0015 + star.phase) * 0.35;

    star.x += (star.x - width / 2) * 0.00035 * star.z;
    star.y += (star.y - height / 2) * 0.00035 * star.z;

    if (
      star.x < 0 || star.x > width ||
      star.y < 0 || star.y > height
    ) {
      star.x = random(0, width);
      star.y = random(0, height);
    }

    ctx.save();
    ctx.globalAlpha = pulse * star.z;
    ctx.fillStyle = currentColor();
    ctx.shadowColor = currentColor();
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.arc(
      star.x,
      star.y,
      star.size * star.z,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  }
}

/* ---------- Auto magic ---------- */

function createAutoMagic() {
  if (!autoMagic || !width || !height) return;

  const amount = Math.ceil(2 + intensity() * 5);

  for (let i = 0; i < amount; i++) {
    const x = random(10, width - 10);
    const y = random(10, height - 10);

    addParticle(x, y, {
      mode: modeSelect.value,
      life: random(40, 100)
    });
  }
}

/* ---------- Animation loop ---------- */

function animate(time = 0) {
  animationFrame = requestAnimationFrame(animate);

  if (time - lastFrame < 16) return;
  lastFrame = time;

  ctx.clearRect(0, 0, width, height);

  // Subtle dark background.
  ctx.fillStyle = "rgba(5, 9, 24, 0.16)";
  ctx.fillRect(0, 0, width, height);

  if (modeSelect.value === "space3d") {
    drawSpace3D(time);
  }

  if (autoMagic && Math.random() < 0.8) {
    createAutoMagic();
  }

  if (pointerDown) {
    const amount = Math.ceil(2 + intensity() * 8);

    for (let i = 0; i < amount; i++) {
      addParticle(
        pointerX + random(-8, 8),
        pointerY + random(-8, 8),
        { mode: modeSelect.value }
      );
    }
  }

  updateParticles();
}

/* ---------- Touch and mouse controls ---------- */

function getCanvasPosition(event) {
  const rect = canvas.getBoundingClientRect();

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

canvas.addEventListener("pointerdown", event => {
  if (!secretUnlocked) return;

  event.preventDefault();
  pointerDown = true;

  const pos = getCanvasPosition(event);
  pointerX = pos.x;
  pointerY = pos.y;

  canvas.setPointerCapture?.(event.pointerId);

  if (canvasHint) canvasHint.style.opacity = "0";

  burst(pointerX, pointerY, Math.ceil(12 + intensity() * 20));
});

canvas.addEventListener("pointermove", event => {
  if (!pointerDown || !secretUnlocked) return;

  const pos = getCanvasPosition(event);
  pointerX = pos.x;
  pointerY = pos.y;

  addParticle(pointerX, pointerY, {
    mode: modeSelect.value
  });
});

function stopDrawing() {
  pointerDown = false;
}

canvas.addEventListener("pointerup", stopDrawing);
canvas.addEventListener("pointercancel", stopDrawing);
canvas.addEventListener("lostpointercapture", stopDrawing);

/* ---------- Color controls ---------- */

colorPicker.addEventListener("input", () => {
  document.querySelectorAll(".swatch").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.color.toLowerCase() === currentColor().toLowerCase()
    );
  });
});

document.querySelectorAll(".swatch").forEach(button => {
  button.addEventListener("click", () => {
    colorPicker.value = button.dataset.color;

    document.querySelectorAll(".swatch").forEach(swatch => {
      swatch.classList.toggle("active", swatch === button);
    });
  });
});

/* ---------- Intensity ---------- */

powerRange.addEventListener("input", () => {
  powerValue.textContent = powerRange.value + "%";
});

/* ---------- Name magic ---------- */

function createNameMagic() {
  const name = nameInput.value.trim() || "HASSAN SAJID";

  // Use a temporary canvas to sample text pixels.
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  const fontSize = Math.max(
    18,
    Math.min(58, width / Math.max(name.length * 0.62, 1))
  );

  tempCanvas.width = Math.max(1, Math.floor(width));
  tempCanvas.height = Math.max(1, Math.floor(height));

  tempCtx.fillStyle = "#ffffff";
  tempCtx.textAlign = "center";
  tempCtx.textBaseline = "middle";
  tempCtx.font = `800 ${fontSize}px Arial, sans-serif`;
  tempCtx.fillText(name, tempCanvas.width / 2, tempCanvas.height / 2);

  const pixels = tempCtx.getImageData(
    0,
    0,
    tempCanvas.width,
    tempCanvas.height
  ).data;

  nameParticles = [];

  const step = Math.max(3, Math.round(fontSize / 8));

  for (let y = 0; y < tempCanvas.height; y += step) {
    for (let x = 0; x < tempCanvas.width; x += step) {
      const index = (y * tempCanvas.width + x) * 4;

      if (pixels[index + 3] > 100) {
        nameParticles.push({ x, y });
      }
    }
  }

  // Remove older particles so the name is easy to see.
  particles = particles.slice(-250);

  for (const point of nameParticles) {
    addParticle(point.x, point.y, {
      color: currentColor(),
      size: random(1.1, 2.5),
      life: random(180, 260),
      mode: "nebula",
      textParticle: true
    });
  }

  const wrap = document.querySelector(".canvas-wrap");
  wrap?.classList.remove("flash");

  // Restart the flash animation.
  void wrap?.offsetWidth;
  wrap?.classList.add("flash");

  playTone(660, 0.15);
}

nameBtn.addEventListener("click", createNameMagic);

nameInput.addEventListener("keydown", event => {
  if (event.key === "Enter") createNameMagic();
});

/* ---------- Auto magic button ---------- */

autoBtn.addEventListener("click", () => {
  autoMagic = !autoMagic;

  autoBtn.classList.toggle("active", autoMagic);
  autoBtn.querySelector("small").textContent =
    autoMagic ? "On" : "Off";

  if (autoMagic) {
    burst(width / 2, height / 2, 35);
  }
});

/* ---------- Sound controls ---------- */

function playTone(frequency = 440, duration = 0.08) {
  if (!soundEnabled) return;

  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    if (!audioContext) {
      audioContext = new AudioContextClass();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.08,
      audioContext.currentTime + 0.015
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      audioContext.currentTime + duration
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    console.warn("Audio could not start:", error);
  }
}

soundBtn.addEventListener("click", async () => {
  soundEnabled = !soundEnabled;

  soundBtn.classList.toggle("active", soundEnabled);
  soundBtn.querySelector("small").textContent =
    soundEnabled ? "On" : "Off";

  if (soundEnabled) {
    playTone(660, 0.12);
  } else if (audioContext) {
    await audioContext.suspend();
  }
});

/* ---------- Photo magic ---------- */

photoBtn.addEventListener("click", () => {
  photoInput.click();
});

photoInput.addEventListener("change", () => {
  const file = photoInput.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please select an image file.");
    photoInput.value = "";
    return;
  }

  if (photoObjectURL) {
    URL.revokeObjectURL(photoObjectURL);
  }

  photoObjectURL = URL.createObjectURL(file);
  uploadedPhoto.src = photoObjectURL;

  uploadedPhoto.onload = () => {
    const layer = document.getElementById("photoLayer");
    layer.hidden = false;
    removePhotoBtn.hidden = false;

    burst(width / 2, height / 2, 45);
  };

  photoBtn.querySelector("small").textContent = "Loaded";
});

removePhotoBtn.addEventListener("click", () => {
  document.getElementById("photoLayer").hidden = true;
  uploadedPhoto.removeAttribute("src");

  if (photoObjectURL) {
    URL.revokeObjectURL(photoObjectURL);
    photoObjectURL = null;
  }

  removePhotoBtn.hidden = true;
  photoInput.value = "";
  photoBtn.querySelector("small").textContent = "Upload";
});

/* ---------- Save canvas as PNG ---------- */

saveBtn.addEventListener("click", () => {
  if (!secretUnlocked) {
    alert("Unlock Secret Mode before saving.");
    return;
  }

  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = canvas.width;
  exportCanvas.height = canvas.height;

  const exportCtx = exportCanvas.getContext("2d");

  exportCtx.fillStyle = "#050918";
  exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

  exportCtx.drawImage(canvas, 0, 0);

  // Include the uploaded image if one is currently visible.
  const photoLayer = document.getElementById("photoLayer");

  if (!photoLayer.hidden && uploadedPhoto.complete && uploadedPhoto.naturalWidth) {
    const scale = Math.min(
      exportCanvas.width / uploadedPhoto.naturalWidth,
      exportCanvas.height / uploadedPhoto.naturalHeight
    );

    const imgW = uploadedPhoto.naturalWidth * scale;
    const imgH = uploadedPhoto.naturalHeight * scale;

    exportCtx.globalAlpha = 0.38;
    exportCtx.drawImage(
      uploadedPhoto,
      (exportCanvas.width - imgW) / 2,
      (exportCanvas.height - imgH) / 2,
      imgW,
      imgH
    );

    exportCtx.globalAlpha = 1;
  }

  const link = document.createElement("a");
  link.download = "HASSAN-SAJID-DIGITAL-MAGIC.png";
  link.href = exportCanvas.toDataURL("image/png");
  link.click();

  playTone(780, 0.12);
});

/* ---------- Clear canvas ---------- */

clearBtn.addEventListener("click", () => {
  particles = [];
  nameParticles = [];
  ctx.clearRect(0, 0, width, height);

  if (canvasHint) {
    canvasHint.style.opacity = "1";
  }

  playTone(330, 0.08);
});

/* ---------- Secret mode ---------- */

function openSecretDialog() {
  if (!secretDialog) return;

  secretCode.value = "";
  secretMessage.textContent = "";

  if (savedPasscode === null) {
    secretTitle.textContent = "Set secret passcode";
    secretDescription.textContent =
      "Choose a 4–12 character passcode for this browser session.";
    secretSubmit.textContent = "Set passcode";
  } else if (secretUnlocked) {
    secretTitle.textContent = "Lock secret mode";
    secretDescription.textContent =
      "Enter your current passcode to lock the canvas.";
    secretSubmit.textContent = "Lock canvas";
  } else {
    secretTitle.textContent = "Unlock secret mode";
    secretDescription.textContent =
      "Enter your passcode to unlock the canvas.";
    secretSubmit.textContent = "Unlock canvas";
  }

  secretDialog.showModal();
}

secretBtn.addEventListener("click", openSecretDialog);

secretClose.addEventListener("click", () => {
  secretDialog.close();
});

secretForm.addEventListener("submit", event => {
  event.preventDefault();

  const value = secretCode.value;

  if (savedPasscode === null) {
    if (value.length < 4 || value.length > 12) {
      secretMessage.textContent =
        "Passcode must contain 4–12 characters.";
      return;
    }

    savedPasscode = value;
    secretUnlocked = true;

    secretMessage.textContent = "Passcode set for this session.";
    secretBtn.querySelector("small").textContent = "Set";
    secretBtn.classList.add("active");

    setTimeout(() => secretDialog.close(), 700);
    return;
  }

  if (value !== savedPasscode) {
    secretMessage.textContent = "Incorrect passcode. Try again.";
    return;
  }

  secretUnlocked = !secretUnlocked;

  if (secretUnlocked) {
    secretMessage.textContent = "Canvas unlocked.";
    secretBtn.querySelector("small").textContent = "Unlocked";
    secretBtn.classList.add("active");
  } else {
    secretMessage.textContent = "Canvas locked.";
    secretBtn.querySelector("small").textContent = "Locked";
    secretBtn.classList.remove("active");
  }

  setTimeout(() => secretDialog.close(), 700);
});

/* ---------- Dashboard and help ---------- */

startBtn.addEventListener("click", () => {
  dashboard.scrollIntoView({ behavior: "smooth" });
  burst(width / 2, height / 2, 25);
});

howBtn.addEventListener("click", () => {
  helpDialog.showModal();
});

menuBtn.addEventListener("click", () => {
  dashboard.scrollIntoView({ behavior: "smooth" });
});

/* ---------- Effect change ---------- */

modeSelect.addEventListener("change", () => {
  if (modeSelect.value === "space3d") {
    createStars();
  }

  burst(width / 2, height / 2, 24);
});

/* ---------- Initial launch ---------- */

resizeCanvas();

ctx.fillStyle = "#050918";
ctx.fillRect(0, 0, width, height);

for (let i = 0; i < 100; i++) {
  addParticle(
    random(0, width),
    random(0, height),
    {
      life: random(30, 100),
      mode: "firefly",
      size: random(0.6, 2)
    }
  );
}

animate();

console.log("HASSAN SAJID DIGITAL MAGIC PRO MAX is ready!");