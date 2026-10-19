const section = document.querySelector('section.vid');
const frameImg = document.getElementById('video-frame');
const HAS_VIDEO = !!(section && frameImg);

// ===== НАСТРОЙКИ =====
const FRAMES_PATH = '../Content/Videos/Scroll-Video/';
const TOTAL_FRAMES = 291;
const AUTO_PLAY_END = 96;
const AUTO_PLAY_FPS = 30;      // скорость первой анимации: кадров в секунду (больше = быстрее)

// Сглаживание кадров: 1 = видео точно следует за скроллом (без сглаживания), меньше = плавнее, но с задержкой
const EASE_CHROME = 1;
const EASE_SAFARI = 0.2;

// Промежуточные кадры за счёт прозрачности (1 = выкл, 4 = три промежуточных между кадрами)
const BLEND_STEPS = 4;

const ua = navigator.userAgent;
const isSafari =
  /iPad|iPhone|iPod/.test(ua) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
  /^((?!chrome|chromium|android|crios|fxios|edgios|edg\/).)*safari/i.test(ua);

const EASE = isSafari ? EASE_SAFARI : EASE_CHROME;

let currentFrame = 0;
let targetFrame = 0;
let isAutoPlaying = true;
let autoReady = false;         // true, когда первые кадры загружены и можно играть
let scrollStartFrame = AUTO_PLAY_END;
let lastTime = performance.now();

if (HAS_VIDEO) {
if (history.scrollRestoration) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// Канвас вместо <img> (нужен для смешивания кадров)
const canvas = document.createElement('canvas');
canvas.id = frameImg.id;
canvas.className = frameImg.className;
canvas.style.cssText = frameImg.style.cssText;
frameImg.replaceWith(canvas);
const ctx = canvas.getContext('2d');

// ===== ЗАГРУЗКА: сначала первые 96 кадров, потом всё остальное =====
const frames = [];
const loaded = new Array(TOTAL_FRAMES + 1).fill(false);
for (let i = 0; i <= TOTAL_FRAMES; i++) frames.push(new Image());

const loadFrame = (i) => new Promise((resolve) => {
  const img = frames[i];
  img.onload = async () => {
    try { await img.decode(); } catch (e) {}
    loaded[i] = true;
    resolve();
  };
  img.onerror = resolve;
  img.src = `${FRAMES_PATH}${String(i).padStart(4, '0')}.jpg`;
});

const loadRange = async (from, to, threads) => {
  let next = from;
  const worker = async () => {
    while (next <= to) await loadFrame(next++);
  };
  await Promise.all(Array.from({ length: threads }, () => worker()));
};

(async () => {
  await loadRange(0, AUTO_PLAY_END, 8);
  autoReady = true;
  await loadRange(AUTO_PLAY_END + 1, TOTAL_FRAMES, 6);
})();

// ===== ОТРИСОВКА =====
let lastKey = '';
const draw = (value) => {
  value = Math.min(TOTAL_FRAMES, Math.max(0, value));
  value = Math.round(value * BLEND_STEPS) / BLEND_STEPS;
  let a = Math.floor(value);
  let mix = value - a;
  const b = Math.min(TOTAL_FRAMES, a + 1);

  while (a > 0 && !loaded[a]) { a--; mix = 0; }
  if (!loaded[a]) return;

  const key = a + ':' + mix;
  if (key === lastKey) return;

  const img = frames[a];
  if (canvas.width !== img.naturalWidth) {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
  }

  ctx.globalAlpha = 1;
  ctx.drawImage(img, 0, 0);
  if (mix > 0 && b !== a && loaded[b]) {
    ctx.globalAlpha = mix;
    ctx.drawImage(frames[b], 0, 0);
    ctx.globalAlpha = 1;
  }
  lastKey = key;
};

// ===== СКРОЛЛ → КАДР =====
window.addEventListener('scroll', () => {
  if (isAutoPlaying && window.scrollY > 5) {
    isAutoPlaying = false;
    scrollStartFrame = currentFrame;
    targetFrame = currentFrame;
  }
  if (isAutoPlaying) return;

  const scrolled = -section.getBoundingClientRect().top;
  const maxScrollable = section.offsetHeight - window.innerHeight;

  if (scrolled < 0) {
    targetFrame = scrollStartFrame;
  } else if (scrolled > maxScrollable) {
    targetFrame = TOTAL_FRAMES;
  } else {
    targetFrame = scrollStartFrame + (scrolled / maxScrollable) * (TOTAL_FRAMES - scrollStartFrame);
  }
}, { passive: true });

const renderLoop = (now) => {
  const dt = Math.min(50, now - lastTime);
  lastTime = now;

  if (isAutoPlaying && autoReady) {
    if (targetFrame < AUTO_PLAY_END) {
      targetFrame += AUTO_PLAY_FPS * dt / 1000;
    } else {
      isAutoPlaying = false;
      scrollStartFrame = AUTO_PLAY_END;
    }
  }

  if (Math.abs(targetFrame - currentFrame) > 0.01) {
    currentFrame += (targetFrame - currentFrame) * EASE;
  } else {
    currentFrame = targetFrame;
  }

  draw(currentFrame);
  requestAnimationFrame(renderLoop);
};
requestAnimationFrame(renderLoop);

}

document.querySelectorAll('.question').forEach((block) => {
  block.addEventListener('click', () => block.classList.toggle('open'));
});

(function () {
      var box = document.querySelector('.bg-glow-container');
      if (!box) return;

      function buildGlow() {
        var pageH = document.body.offsetHeight;
        var step = Math.max(window.innerHeight * 0.9, 700);
        box.innerHTML = '';

        for (var i = 0, top = -250; top < pageH; i++, top += step) {
          var size = 900 + (i % 3) * 100;
          var shift = -350 - (i % 3) * 50;
          var c = document.createElement('div');
          c.className = 'glow-circle';
          c.style.top = top + 'px';
          c.style.width = c.style.height = size + 'px';
          c.style.opacity = (0.6 - (i % 3) * 0.05).toFixed(2);
          c.style[i % 2 === 0 ? 'left' : 'right'] = shift + 'px';
          box.appendChild(c);
        }
      }

      var timer;
      function rebuild() { clearTimeout(timer); timer = setTimeout(buildGlow, 150); }

      buildGlow();
      window.addEventListener('load', buildGlow);
      window.addEventListener('resize', rebuild);
      if (window.ResizeObserver) new ResizeObserver(rebuild).observe(document.body);
    })();