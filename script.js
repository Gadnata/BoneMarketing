// 🌟 ЗАЩИТА ОТ БАГОВ ОБНОВЛЕНИЯ СТРАНИЦЫ (F5)
// Отключаем встроенную память скролла браузера, чтобы сайт не прыгал вниз при перезагрузке
if (history.scrollRestoration) {
  history.scrollRestoration = 'manual';
}

// Принудительно сбрасываем окно в самый верх (в координаты 0,0) прямо в момент загрузки
window.scrollTo(0, 0);

const v1 = document.getElementById("video1");
const v2 = document.getElementById("video2");
const title = document.querySelector(".main-title");
const subtitle = document.querySelector(".sub-title");

let switched = false;         // Закончилось ли видео v1
let videoFinished = false;    // Докручено ли видео v2 до самого конца
let virtualProgress = 0;      // Наш виртуальный скролл от 0 до 1

// 🌟 Переменные из твоего скрипта плавного скролла (жестко стартуют с 0)
let currentY = 0;
let targetY = 0;
const ease = 0.1; // Твой коэффициент вязкости

// 2500 — сколько пикселей прокрутки колесика мы отдаем под плавный ход видео v2
const videoScrollRange = 2500; 

v1.play();
v2.pause();
v2.currentTime = 0;

v1.addEventListener("ended", () => {
  switched = true;
  v2.style.opacity = 1;
  v1.style.opacity = 0;
  v2.pause();
  v2.currentTime = 0;
});

// 1. Твой перехват колесика мыши
window.addEventListener('wheel', (e) => {
  if (!switched) {
    e.preventDefault(); // Полная блокировка скролла, пока идет v1
    return;
  }

  e.preventDefault(); // Убираем дефолтный резкий прыжок браузера
  
  targetY += e.deltaY;
  
  // ДИНАМИЧЕСКИЙ РАСЧЕТ: лимит скролла теперь учитывает реальную высоту всего сайта + запас под видео
  const scrollHeight = Math.max(
    document.body.scrollHeight, document.documentElement.scrollHeight,
    document.body.offsetHeight, document.documentElement.offsetHeight,
    document.body.clientHeight, document.documentElement.clientHeight
  );
  const maxScroll = scrollHeight + videoScrollRange - window.innerHeight;
  
  if (targetY < 0) targetY = 0;
  if (targetY > maxScroll) targetY = maxScroll;
}, { passive: false });

// Перехват свайпов на телефонах
let touchStart = 0;
window.addEventListener("touchstart", (e) => {
  touchStart = e.touches.clientY;
}, { passive: true });

window.addEventListener("touchmove", (e) => {
  if (!switched) {
    e.preventDefault();
    return;
  }

  const touchEnd = e.touches.clientY;
  const deltaY = touchStart - touchEnd;
  
  targetY += deltaY * 2.5; 
  
  const scrollHeight = Math.max(
    document.body.scrollHeight, document.documentElement.scrollHeight,
    document.body.offsetHeight, document.documentElement.offsetHeight,
    document.body.clientHeight, document.documentElement.clientHeight
  );
  const maxScroll = scrollHeight + videoScrollRange - window.innerHeight;
  
  if (targetY < 0) targetY = 0;
  if (targetY > maxScroll) targetY = maxScroll;
  
  touchStart = touchEnd;
}, { passive: false });


// 2. Твой постоянный математический цикл анимации (Мягкое дотягивание)
function smoothScrollLoop() {
  if (!switched) {
    currentY = 0;
    targetY = 0;
    requestAnimationFrame(smoothScrollLoop);
    return;
  }

  // Вычисляем стандартный шаг инерции
  let step = (targetY - currentY) * ease;

  /* УЛЬТРА-МЯГКИЙ ФИНАЛ */
  if (Math.abs(step) < 0.5 && targetY !== currentY) {
    step = targetY > currentY ? 0.5 : -0.5;
  }

  // Прибавляем вычисленный шаг к текущей позиции
  currentY += step;

  // Если из-за шага мы слегка перелетели цель — аккуратно приравниваем их
  if ((step > 0 && currentY > targetY) || (step < 0 && currentY < targetY)) {
    currentY = targetY;
  }

  // МАТЕМАТИКА ОБЪЕДИНЕНИЯ:
  if (currentY <= videoScrollRange) {
    // А) МЫ В ЗОНЕ ВИДЕО:
    if (videoFinished) {
      videoFinished = false;
      document.body.style.height = "100vh";
      document.body.style.overflow = "hidden";
    }

    // Переводим плавный шаг currentY в кадры видео (от 0 до 1)
    virtualProgress = currentY / videoScrollRange;
    if (virtualProgress < 0) virtualProgress = 0;
    if (virtualProgress > 1) virtualProgress = 1;

    if (v2.duration) {
      v2.currentTime = virtualProgress * v2.duration;
    }

    // Намертво держим страницу в нуле, чтобы сайт не улетал вверх, пока крутится видео
    window.scrollTo(0, 0);

  } else {
    // Б) ВИДЕО ДОКРУТИЛОСЬ ДО КОНЦА:
    if (!videoFinished) {
      videoFinished = true;
      virtualProgress = 1;
      if (v2.duration) v2.currentTime = v2.duration;
      
      // Снимаем заглушку высоты с body, возвращая оригинальный размер твоего сайта
      document.body.style.height = "auto"; 
      document.body.style.overflow = "visible";
    }

    // ФИКС ПОЛЗУНКА: Скроллим страницу дальше вниз к блоку .box.
    // За счет динамического расчета лимитов, ползунок теперь будет пропорционально ехать до самого низа!
    const realPageScroll = currentY - videoScrollRange;
    window.scrollTo(0, Math.round(realPageScroll));
  }

  // Крутим цикл непрерывно в каждом кадре монитора
  requestAnimationFrame(smoothScrollLoop);
}

// Запускаем движок
requestAnimationFrame(smoothScrollLoop);

// Защита от автоплея
v2.addEventListener("play", () => {
  if (!switched) v2.pause();
});
