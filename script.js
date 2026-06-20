const section = document.querySelector('section.vid');
const vid = section.querySelector('#video2');
const vid1 = section.querySelector('#video1');

let isReadyForScroll = false;

// 1. ВСЕГДА ПЕРЕКИДЫВАЕМ НА САМЫЙ ВЕРХ ПРИ ОБНОВЛЕНИИ СТРАНИЦЫ
if (history.scrollRestoration) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});

// Блокировка скролла в начале (через класс)
document.body.classList.add('scroll-locked');
vid.pause();

// 🌟 НАСТРОЙКИ ДЛЯ СУПЕР-ДЛИННОЙ И ПЛАВНОЙ АНИМАЦИИ САЙТА
let scrollY = 0;       
let scrollVelocity = 0; 
const friction = 0.94;       // Тягучесть скролла
const stepMultiplier = 0.08; // Мягкость отклика на колесо

// 🌟 НАСТРОЙКИ ДЛЯ БОРЬБЫ С ЛАГАМИ ВИДЕО В CHROME
let isSeeking = false;     // Блокировщик спама кадров
const minTimeStep = 0.002; // Ваш проверенный рабочий шаг времени

// Как только Chrome успешно отрендерил кадр — разрешаем следующий шаг
vid.addEventListener('seeked', () => {
  isSeeking = false; 
});

// ЕДИНЫЙ ОБРАБОТЧИК КОЛЕСА (Заменяет все старые варианты)
window.addEventListener('wheel', (e) => {
  e.preventDefault(); // Полностью отключаем дефолтный резкий скролл браузера
  
  if (!isReadyForScroll) return;
  
  // Добавляем импульс скорости от кручения мыши
  scrollVelocity += e.deltaY * stepMultiplier;
}, { passive: false });

// Защита от прокрутки кнопками и тачпадом в первые 1.5 секунды
const preventTouchAndKeys = (e) => {
  if (!isReadyForScroll) e.preventDefault();
};
window.addEventListener('touchmove', preventTouchAndKeys, { passive: false });
window.addEventListener('keydown', (e) => {
  const keys = ['Space', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'End', 'Home'];
  if (!isReadyForScroll && keys.includes(e.code)) e.preventDefault();
});


// ЕДИНЫЙ ЦИКЛ АНИМАЦИИ (Двигает сайт + плавно рендерит видео)
const renderLoop = () => {
  if (isReadyForScroll) {
    const absVelocity = Math.abs(scrollVelocity);

    // ИДЕАЛЬНАЯ ФИНАЛЬНАЯ ДОВОДКА СТРАНИЦЫ
    if (absVelocity < 0.15) {
      scrollVelocity = 0;
    } else if (absVelocity < 1.5) {
      scrollVelocity *= 0.75; // Мягкий тормоз в самом конце
    } else {
      scrollVelocity *= friction; // Стандартное трение в полете
    }

    // Изменяем координату плавного скролла
    scrollY += scrollVelocity;

    // Жестко ограничиваем края сайта, чтобы не улетать за пределы страницы
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollY < 0) {
      scrollY = 0;
      scrollVelocity = 0;
    } else if (scrollY > maxScroll) {
      scrollY = maxScroll;
      scrollVelocity = 0;
    }

    // Физически двигаем страницу в текущую плавную координату
    if (scrollVelocity !== 0) {
      window.scrollTo(0, scrollY);
    }

    // 🌟 ПОДРУЖЕННЫЙ АЛГОРИТМ ВИДЕО (Работает внутри цикла физики)
    // Обновляем кадр только если Chrome не занят (not isSeeking)
    if (vid.duration > 0 && !isSeeking) {
      // Считаем прогресс на основе текущего положения страницы window.scrollY
      const distance = window.scrollY - section.offsetTop;
      const total = section.clientHeight - window.innerHeight;

      let percentage = distance / total;
      percentage = Math.max(0, Math.min(percentage, 1));

      const calculatedTargetTime = vid.duration * percentage;
      
      // Считаем разницу во времени между текущим кадром и тем, куда приплыл плавный скролл
      const timeDifference = Math.abs(calculatedTargetTime - vid.currentTime);

      // Если скролл сдвинулся дальше вашего порога 0.001 — запрашиваем новый кадр
      if (timeDifference > minTimeStep) {
        isSeeking = true; // Запираем светофор, пока Chrome думает
        vid.currentTime = calculatedTargetTime;
      }
    }
  }
  
  requestAnimationFrame(renderLoop);
};

// Запуск первого видео (автоплей)
vid1.play().catch(() => {
  window.addEventListener('click', () => {
    if (document.body.classList.contains('scroll-locked')) vid1.play();
  }, { once: true });
});

// Таймер окончания первого видео и старт главного движка сайта
setTimeout(() => {
  isReadyForScroll = true;
  document.body.classList.remove('scroll-locked');

  // Плавное переключение прозрачности между видео
  vid1.style.transition = 'opacity 0.4s ease';
  vid.style.transition = 'opacity 0.4s ease';
  vid1.style.opacity = '0';
  vid.style.opacity = '1';

  vid1.pause();
  vid.currentTime = 0;
  
  // Привязываем стартовую координату физики к верху страницы
  scrollY = window.scrollY;
  scrollVelocity = 0;
  
  // Запускаем бесконечный рендер-цикл
  requestAnimationFrame(renderLoop);
}, 1583);
