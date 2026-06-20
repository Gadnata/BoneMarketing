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

// 🌟 НАСТРОЙКИ ДЛЯ СУПЕР-ДЛИННОЙ И ПЛАВНОЙ АНИМАЦИИ
let scrollY = 0;       
let scrollVelocity = 0; 
const friction = 0.94;   // Увеличили до 0.94 — теперь анимация стала ОЧЕНЬ долгой и тягучей
const stepMultiplier = 0.08; // Снизили силу отклика для максимальной мягкости

// Перехватываем прокрутку колесиком мыши
window.addEventListener('wheel', (e) => {
  if (!isReadyForScroll) {
    e.preventDefault();
    return;
  }
  
  e.preventDefault();
  scrollVelocity += e.deltaY * stepMultiplier;
}, { passive: false });


// ЕДИНЫЙ ЦИКЛ АНИМАЦИИ
const renderLoop = () => {
  if (isReadyForScroll) {
    const absVelocity = Math.abs(scrollVelocity);

    // 🌟 ИДЕАЛЬНАЯ ФИНАЛЬНАЯ ДОВОДКА:
    if (absVelocity < 0.15) {
      // Когда скорость падает до неощутимого минимума, жестко обнуляем её.
      // Это убирает микро-рывки и застревание видео на долях пикселя.
      scrollVelocity = 0;
    } else if (absVelocity < 1.5) {
      // Когда мы в самой фазе финиша (скорость меньше 1.5px за кадр),
      // мы искусственно увеличиваем сопротивление (душим трение до 0.75).
      // Страница мягко, но быстро делает финишный "прикол" и встает намертво.
      scrollVelocity *= 0.75;
    } else {
      // Основной режим долгого и плавного полета страницы
      scrollVelocity *= friction;
    }

    // Изменяем координату скролла
    scrollY += scrollVelocity;

    // Жестко ограничиваем края сайта
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollY < 0) {
      scrollY = 0;
      scrollVelocity = 0;
    } else if (scrollY > maxScroll) {
      scrollY = maxScroll;
      scrollVelocity = 0;
    }

    // Физически скроллим страницу только если есть движение
    if (scrollVelocity !== 0) {
      window.scrollTo(0, scrollY);
    }

    // Твой алгоритм для видео
    if (vid.duration > 0) {
      const distance = window.scrollY - section.offsetTop;
      const total = section.clientHeight - window.innerHeight;

      let percentage = distance / total;
      percentage = Math.max(0, Math.min(percentage, 1));
      
      vid.currentTime = vid.duration * percentage;
    }
  }
  
  requestAnimationFrame(renderLoop);
};

// Запуск первого видео
vid1.play().catch(() => {
  window.addEventListener('click', () => {
    if (document.body.classList.contains('scroll-locked')) vid1.play();
  }, { once: true });
});

// Таймер окончания первого видео
setTimeout(() => {
  isReadyForScroll = true;
  document.body.classList.remove('scroll-locked');

  vid1.style.transition = 'opacity 0.4s ease';
  vid.style.transition = 'opacity 0.4s ease';
  vid1.style.opacity = '0';
  vid.style.opacity = '1';

  vid1.pause();
  vid.currentTime = 0;
  
  scrollY = window.scrollY;
  scrollVelocity = 0;
  
  requestAnimationFrame(renderLoop);
}, 1583);
