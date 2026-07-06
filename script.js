(() => {
  "use strict";

  const STORAGE_KEY = "cozy.prompts";
  const COUNT_KEY = "cozy.spinCount";

  const DEFAULT_PROMPTS = [
    "Send a selfie with your biggest smile 😄",
    "Show me your view right now 🌆",
    "Send a voice note with 3 things you love about me 🎙️",
    "Blow a kiss 😘",
    "Show me what you're wearing today 👕",
    "Send a photo of your cozy spot right now 🛋️",
    "Show me something that made you think of me 💭",
    "Send your best silly face 🤪",
    "Show me the sky where you are right now 🌤️",
    "Send a photo of your favorite snack rn 🍫",
  ];

  const SPICY_PROMPTS = [
    "Send a voice note whispering what you'd do if I were there right now 😏",
    "Give me your best 'come hither' look 👀",
    "Send a slow, teasing video walking toward the camera",
    "Tell me the first thing you'd do if I walked through your door right now",
    "Send your flirtiest selfie 🔥",
    "Send a voice note describing your favorite memory of us, slowly 🕯️",
    "Send a photo biting your lip 😉",
    "Text me the naughtiest thought you've had about me today",
    "Send a photo of you in bed, thinking about me 🌙",
    "Give me your best sultry eye-contact photo",
  ];

  const PALETTE = ["#ff9ecb", "#ffd8a8", "#c9a7ff", "#a7e8bd", "#a7d8ff", "#ffb4a7"];

  const wheelCanvas = document.getElementById("wheel");
  const ctx = wheelCanvas.getContext("2d");
  const spinBtn = document.getElementById("spinBtn");
  const resultEl = document.getElementById("result");
  const resultTextEl = document.getElementById("resultText");
  const spinCountEl = document.getElementById("spinCount");

  const editBtn = document.getElementById("editBtn");
  const editDialog = document.getElementById("editDialog");
  const editForm = document.getElementById("editForm");
  const promptsArea = document.getElementById("promptsArea");
  const cancelEditBtn = document.getElementById("cancelEditBtn");
  const sweetPackBtn = document.getElementById("sweetPackBtn");
  const spicyPackBtn = document.getElementById("spicyPackBtn");

  const howBtn = document.getElementById("howBtn");
  const howDialog = document.getElementById("howDialog");

  const confettiCanvas = document.getElementById("confetti");
  const confettiCtx = confettiCanvas.getContext("2d");

  let prompts = loadPrompts();
  let currentRotation = 0;
  let spinning = false;
  let spinCount = loadSpinCount();

  function loadPrompts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [...DEFAULT_PROMPTS];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 2) return parsed;
      return [...DEFAULT_PROMPTS];
    } catch {
      return [...DEFAULT_PROMPTS];
    }
  }

  function savePrompts(list) {
    prompts = list;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function loadSpinCount() {
    const raw = localStorage.getItem(COUNT_KEY);
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }

  function renderSpinCount() {
    spinCountEl.textContent = `${spinCount} spin${spinCount === 1 ? "" : "s"}`;
  }

  function incrementSpinCount() {
    spinCount += 1;
    localStorage.setItem(COUNT_KEY, String(spinCount));
    renderSpinCount();
  }

  function wrapText(context, text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (context.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function drawWheel() {
    const size = wheelCanvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 6;
    const n = prompts.length;
    const slice = (Math.PI * 2) / n;

    ctx.clearRect(0, 0, size, size);

    for (let i = 0; i < n; i++) {
      const start = -Math.PI / 2 + i * slice;
      const end = start + slice;
      const mid = start + slice / 2;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = PALETTE[i % PALETTE.length];
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(mid);

      const flip = mid > Math.PI / 2 && mid < (3 * Math.PI) / 2;
      if (flip) ctx.rotate(Math.PI);

      ctx.fillStyle = "#2b1e3d";
      ctx.font = `600 ${Math.max(15, 26 - n)}px -apple-system, "Segoe UI", sans-serif`;
      ctx.textBaseline = "middle";

      const maxWidth = radius * 0.72;
      const lines = wrapText(ctx, prompts[i], maxWidth);
      const lineHeight = Math.max(17, 29 - n);
      const startY = -((lines.length - 1) * lineHeight) / 2;

      lines.forEach((line, li) => {
        const textX = flip ? -(radius * 0.92) : radius * 0.92;
        ctx.textAlign = flip ? "left" : "right";
        ctx.fillText(line, textX, startY + li * lineHeight);
      });

      ctx.restore();
    }

    // hub
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.13, 0, Math.PI * 2);
    ctx.fillStyle = "#fdf6ff";
    ctx.fill();
  }

  function pickSpinTarget() {
    const n = prompts.length;
    const slice = 360 / n;
    const targetIndex = Math.floor(Math.random() * n);
    const jitter = (Math.random() - 0.5) * slice * 0.7;
    const theta = targetIndex * slice + slice / 2 + jitter;

    const rMod = ((360 - theta) % 360 + 360) % 360;
    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const base = currentRotation - (currentRotation % 360);
    let newRotation = base + extraSpins * 360 + rMod;
    while (newRotation <= currentRotation) newRotation += 360;

    return { targetIndex, newRotation };
  }

  function spin() {
    if (spinning || prompts.length < 2) return;
    spinning = true;
    spinBtn.disabled = true;
    resultEl.hidden = true;

    const { targetIndex, newRotation } = pickSpinTarget();
    currentRotation = newRotation;
    wheelCanvas.style.transform = `rotate(${currentRotation}deg)`;

    const onDone = (e) => {
      if (e.propertyName !== "transform") return;
      wheelCanvas.removeEventListener("transitionend", onDone);
      spinning = false;
      spinBtn.disabled = false;
      showResult(prompts[targetIndex]);
      incrementSpinCount();
      burstConfetti();
    };
    wheelCanvas.addEventListener("transitionend", onDone);
  }

  function showResult(text) {
    resultTextEl.textContent = text;
    resultEl.hidden = false;
  }

  function resizeConfettiCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }

  function burstConfetti() {
    resizeConfettiCanvas();
    const colors = PALETTE;
    const count = 90;
    const particles = Array.from({ length: count }, () => ({
      x: confettiCanvas.width / 2,
      y: confettiCanvas.height * 0.32,
      vx: (Math.random() - 0.5) * 12,
      vy: Math.random() * -10 - 4,
      size: 5 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
      life: 0,
    }));

    const gravity = 0.35;
    const maxLife = 100;

    function frame() {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      let alive = false;
      for (const p of particles) {
        p.life++;
        if (p.life > maxLife) continue;
        alive = true;
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vr;

        confettiCtx.save();
        confettiCtx.globalAlpha = Math.max(0, 1 - p.life / maxLife);
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate(p.rotation);
        confettiCtx.fillStyle = p.color;
        confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        confettiCtx.restore();
      }
      if (alive) {
        requestAnimationFrame(frame);
      } else {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }
    }
    requestAnimationFrame(frame);
  }

  spinBtn.addEventListener("click", spin);

  editBtn.addEventListener("click", () => {
    promptsArea.value = prompts.join("\n");
    editDialog.showModal();
  });

  cancelEditBtn.addEventListener("click", () => editDialog.close());

  sweetPackBtn.addEventListener("click", () => {
    promptsArea.value = DEFAULT_PROMPTS.join("\n");
  });

  spicyPackBtn.addEventListener("click", () => {
    promptsArea.value = SPICY_PROMPTS.join("\n");
  });

  editForm.addEventListener("submit", (e) => {
    const lines = promptsArea.value
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) {
      e.preventDefault();
      alert("Add at least 2 prompts.");
      return;
    }
    savePrompts(lines);
    currentRotation = 0;
    wheelCanvas.style.transition = "none";
    wheelCanvas.style.transform = "rotate(0deg)";
    void wheelCanvas.offsetHeight;
    wheelCanvas.style.transition = "";
    drawWheel();
    resultEl.hidden = true;
  });

  howBtn.addEventListener("click", () => howDialog.showModal());

  window.addEventListener("resize", () => {
    if (!confettiCanvas.hidden) resizeConfettiCanvas();
  });

  drawWheel();
  renderSpinCount();
})();
