const section = document.querySelector('section.vid');
const vid = section.querySelector('#video2');
const vid1 = section.querySelector('#video1');

// Флаг готовности к работе плавного скролла
let isReadyForScroll = false;

// НАСТРОЙКИ ДЛЯ СУПЕР-ДЛИННОЙ И ПЛАВНОЙ АНИМАЦИИ САЙТА
let scrollY = 0;       
let scrollVelocity = 0; 
const friction = 0.94;       // Тягучесть скролла
const stepMultiplier = 0.08; // Мягкость отклика на колесо

// НАСТРОЙКИ ДЛЯ БОРЬБЫ С ЛАГАМИ ВТОРОГО ВИДЕО В CHROME
let isSeeking = false;     
const minTimeStep = 0.002; 

vid.addEventListener('seeked', () => {
  isSeeking = false; 
});

// 1. СБРОС СКРОЛЛА ПРИ ЗАГРУЗКЕ
if (history.scrollRestoration) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// 2. БЛОКИРОВКА КЛАССОМ CSS
document.body.classList.add('scroll-locked');
vid.pause();

// 🌟 ФУНКЦИЯ ВКЛЮЧЕНИЯ ДВИЖКА (Запускается строго по таймеру)
const activateSmoothScrollEngine = () => {
  isReadyForScroll = true;
  document.body.classList.remove('scroll-locked');

  // Плавная подмена слоев
  vid1.style.opacity = '0';
  vid.style.opacity = '0.8';

  vid1.pause();
  vid.currentTime = 0;

  // Инициализируем стартовые координаты физики
  scrollY = window.scrollY;
  scrollVelocity = 0;

  // Навешиваем слушатель колеса ТОЛЬКО СЕЙЧАС, чтобы не злить браузер при старте
  window.addEventListener('wheel', handleWheelInput, { passive: false });
  
  // Запускаем бесконечный цикл анимации
  requestAnimationFrame(renderLoop);
};

// Функция обработки колеса мыши (работает только ПОСЛЕ таймера)
function handleWheelInput(e) {
  e.preventDefault(); 
  scrollVelocity += e.deltaY * stepMultiplier;
}

// 🌟 БЕЗОПАСНЫЙ ЗАПУСК ПЕРВОГО ВИДЕО (Прямой вызов без посредников)
const triggerFirstVideo = () => {
  // Убеждаемся, что видео имеет атрибут muted, иначе автоплей запрещен законом браузеров
  vid1.muted = true; 
  
  vid1.play()
    .then(() => {
      // ТАЙМЕР ЗАПУСКАЕТСЯ СТРОГО ПОСЛЕ ТОГО, КАК ВИДЕО КОРРЕКТНО ПОЕХАЛО
      setTimeout(activateSmoothScrollEngine, 1583);
      
      // Удаляем стартовые слушатели
      window.removeEventListener('click', triggerFirstVideo);
      window.removeEventListener('wheel', triggerFirstVideo);
    })
    .catch((err) => {
      console.log("Браузер ждет физического клика по экрану от пользователя...");
    });
};

// Слушатели «первого жеста» на случай жесткой блокировки Chrome
window.addEventListener('click', triggerFirstVideo, { once: true });
window.addEventListener('wheel', triggerFirstVideo, { once: true });


// ЕДИНЫЙ ЦИКЛ АНИМАЦИИ (Включается только после завершения video1)
const renderLoop = () => {
  if (!isReadyForScroll) return;

  const absVelocity = Math.abs(scrollVelocity);

  // ИДЕАЛЬНАЯ ФИНАЛЬНАЯ ДОВОДКА СТРАНИЦЫ
  if (absVelocity < 0.15) {
    scrollVelocity = 0;
  } else if (absVelocity < 1.5) {
    scrollVelocity *= 0.75; 
  } else {
    scrollVelocity *= friction; 
  }

  scrollY += scrollVelocity;

  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollY < 0) {
    scrollY = 0;
    scrollVelocity = 0;
  } else if (scrollY > maxScroll) {
    scrollY = maxScroll;
    scrollVelocity = 0;
  }

  if (scrollVelocity !== 0) {
    window.scrollTo(0, scrollY);
  }

  // АЛГОРИТМ ВТОРОГО ВИДЕО
  if (vid.duration > 0 && !isSeeking) {
    const distance = window.scrollY - section.offsetTop;
    const total = section.clientHeight - window.innerHeight;

    let percentage = distance / total;
    percentage = Math.max(0, Math.min(percentage, 1));

    const calculatedTargetTime = vid.duration * percentage;
    const timeDifference = Math.abs(calculatedTargetTime - vid.currentTime);

    if (timeDifference > minTimeStep) {
      isSeeking = true; 
      vid.currentTime = calculatedTargetTime;
    }
  }
  
  requestAnimationFrame(renderLoop);
};

// Пробуем стартовать видео мгновенно при чтении документа
if (vid1.readyState >= 1) {
  triggerFirstVideo();
} else {
  vid1.addEventListener('loadedmetadata', triggerFirstVideo);
}

// Находим все блоки с классом .question на странице
document.querySelectorAll('.question').forEach(block => {
  // Вешаем на каждый блок событие клика
  block.addEventListener('click', () => {
    // toggle сам добавляет класс .open, если его нет, и убирает, если он есть
    block.classList.toggle('open');
  });
});