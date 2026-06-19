let currentY = window.scrollY;
let targetY = window.scrollY;

/* УМЕНЬШАЕМ КОЭФФИЦИЕНТ ДЛЯ МАКСИМАЛЬНОЙ ВЯЗКОСТИ И ПЛАВНОСТИ (было 0.1) */
const ease = 0.1; 

// 1. Ловим прокрутку колесика и высчитываем плавную цель
window.addEventListener('wheel', (e) => {
  e.preventDefault(); // Убираем дефолтный резкий прыжок браузера
  
  targetY += e.deltaY;
  
  // Ограничиваем скролл рамками документа
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (targetY < 0) targetY = 0;
  if (targetY > maxScroll) targetY = maxScroll;
}, { passive: false });

// 2. Постоянный математический цикл анимации (Мягкое дотягивание)
function smoothScrollLoop() {
  // Вычисляем стандартный шаг инерции
  let step = (targetY - currentY) * ease;

  /* УЛЬТРА-МЯГКИЙ ФИНАЛ: */
  if (Math.abs(step) < 0.5 && targetY !== currentY) {
    step = targetY > currentY ? 0.5 : -0.5;
  }

  // Прибавляем вычисленный шаг к текущей позиции
  currentY += step;

  // Если из-за шага мы слегка перелетели цель — аккуратно приравниваем их
  if ((step > 0 && currentY > targetY) || (step < 0 && currentY < targetY)) {
    currentY = targetY;
  }

  window.scrollTo(0, Math.round(currentY));

  // Крутим цикл непрерывно в каждом кадре монитора
  requestAnimationFrame(smoothScrollLoop);
}

// Запускаем движок
requestAnimationFrame(smoothScrollLoop);
