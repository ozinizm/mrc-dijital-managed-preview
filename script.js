const body = document.body;
body.classList.add("js");
const menuToggle = document.querySelector(".menu-toggle");
const menuClose = document.querySelector(".menu-close");
const menuPanel = document.querySelector(".menu-panel");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setMenu(open) {
  body.classList.toggle("menu-open", open);
  menuToggle?.setAttribute("aria-expanded", String(open));
  menuPanel?.setAttribute("aria-hidden", String(!open));
}

menuToggle?.addEventListener("click", () => setMenu(true));
menuClose?.addEventListener("click", () => setMenu(false));
menuPanel?.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

function observeReveals(scope = document) {
  scope.querySelectorAll(".reveal").forEach((el) => {
    if (!el.classList.contains("in-view")) revealObserver.observe(el);
  });
}

observeReveals();

let motionItems = [...document.querySelectorAll(".motion-card")];
const processSection = document.querySelector(".process");
const processLine = document.querySelector(".process-line span");
let scrollFrame = null;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateScrollMotion() {
  scrollFrame = null;
  if (reducedMotion) return;

  const viewport = window.innerHeight || 1;
  motionItems.forEach((item, index) => {
    const rect = item.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const distance = (center - viewport / 2) / viewport;
    const depth = Number(item.dataset.depth || 0.22);
    const y = clamp(distance * -90 * depth, -42, 42);
    const x = clamp(distance * 26 * depth, -18, 18);
    const rotate = clamp(distance * -4 * depth, -2.4, 2.4);
    const progress = clamp(1 - Math.abs(distance), 0.08, 1);
    item.style.setProperty("--mx", `${x.toFixed(2)}px`);
    item.style.setProperty("--my", `${y.toFixed(2)}px`);
    item.style.setProperty("--mr", `${rotate.toFixed(3)}deg`);
    item.style.setProperty("--card-progress", progress.toFixed(3));
    item.style.setProperty("--motion-index", index);
  });

  if (processSection && processLine) {
    const rect = processSection.getBoundingClientRect();
    const total = rect.height - viewport;
    const passed = clamp((0 - rect.top) / Math.max(total, 1), 0, 1);
    processLine.style.width = `${(passed * 100).toFixed(1)}%`;
  }
}

function requestScrollMotion() {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(updateScrollMotion);
}

window.addEventListener("scroll", requestScrollMotion, { passive: true });
window.addEventListener("resize", requestScrollMotion);
requestScrollMotion();
window.MRCRefreshMotion = function refreshMotion(scope = document) {
  observeReveals(scope);
  motionItems = [...document.querySelectorAll(".motion-card")];
  requestScrollMotion();
};

const canvas = document.getElementById("signalCanvas");
const ctx = canvas?.getContext("2d");
let width = 0;
let height = 0;
let t = 0;

function resizeCanvas() {
  if (!canvas || !ctx) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = canvas.offsetWidth;
  height = canvas.offsetHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawSignal() {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#050505";
  ctx.fillRect(0, 0, width, height);

  const centerX = width * 0.18;
  const centerY = height * 0.48;
  for (let ring = 0; ring < 34; ring += 1) {
    const radius = 80 + ring * 22;
    ctx.beginPath();
    for (let i = 0; i < 150; i += 1) {
      const angle = i / 149 * Math.PI * 1.4 - Math.PI * 0.68;
      const wobble = Math.sin(angle * 5 + t * 0.012 + ring * 0.3) * 10;
      const x = centerX + Math.cos(angle) * (radius + wobble);
      const y = centerY + Math.sin(angle) * (radius * 0.62 + wobble);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(255,255,255,${Math.max(0.02, 0.24 - ring * 0.006)})`;
    ctx.lineWidth = ring % 5 === 0 ? 2 : 1;
    ctx.stroke();
  }

  for (let i = 0; i < 95; i += 1) {
    const x = (Math.sin(i * 12.989 + t * 0.008) * 43758.5453) % 1 * width;
    const y = (Math.cos(i * 78.233 + t * 0.006) * 24634.6345) % 1 * height;
    const px = Math.abs(x);
    const py = Math.abs(y);
    ctx.fillStyle = i % 9 === 0 ? "rgba(238,51,74,.75)" : "rgba(255,255,255,.45)";
    ctx.fillRect(px, py, i % 9 === 0 ? 4 : 2, i % 9 === 0 ? 4 : 2);
  }

  const gradient = ctx.createRadialGradient(width * 0.45, height * 0.46, 0, width * 0.45, height * 0.46, width * 0.5);
  gradient.addColorStop(0, "rgba(255,255,255,.08)");
  gradient.addColorStop(0.42, "rgba(255,255,255,.02)");
  gradient.addColorStop(1, "rgba(0,0,0,.88)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  t += 1;
  if (!reducedMotion) requestAnimationFrame(drawSignal);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
drawSignal();
