const section = document.querySelector('section.vid');
const vid = section.querySelector('#video2');
const vid1 = section.querySelector('#video1');

// Флаг готовности к работе скролла
let isReadyForScroll = false;

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

  // Запускаем бесконечный цикл анимации видео
  requestAnimationFrame(renderLoop);
};

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


// ЦИКЛ СИНХРОНИЗАЦИИ ВИДЕО С ОБЫЧНЫМ СКРОЛЛОМ
const renderLoop = () => {
  if (!isReadyForScroll) return;

  // АЛГОРИТМ ВТОРОГО ВИДЕО (теперь привязан к нативной позиции окна)
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

// Находим все блоки с классом .question на странице (ВАШ КОД СОХРАНЕН)
document.querySelectorAll('.question').forEach(block => {
  // Вешаем на каждый блок событие клика
  block.addEventListener('click', () => {
    block.classList.toggle('open');
  });
});