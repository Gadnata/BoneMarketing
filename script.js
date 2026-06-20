// Находим элементы
const section = document.querySelector('section.vid');
const vid = section.querySelector('#video2'); // Второе видео (для скролла)
const vid1 = section.querySelector('#video1'); // Первое видео (автоплей)

// Переменная-флаг: пока false, скролл заблокирован
let isReadyForScroll = false;

// ФУНКЦИЯ БЛОКИРОВКИ: жестко удерживает страницу на самом верху, пока нет готовности
const preventScroll = (e) => {
  if (!isReadyForScroll) {
    e.preventDefault();
    window.scrollTo(0, 0);
  }
};

// Блокируем прокрутку колесом, тачпадом и стрелками клавиатуры
window.addEventListener('wheel', preventScroll, { passive: false });
window.addEventListener('touchmove', preventScroll, { passive: false });
window.addEventListener('keydown', (e) => {
  const keys = ['Space', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'End', 'Home'];
  if (!isReadyForScroll && keys.includes(e.code)) {
    e.preventDefault();
  }
});

vid.pause();

// Функция для обработки скролла (ваш рабочий алгоритм)
const scroll = () => {
  if (!isReadyForScroll) return;

  const distance = window.scrollY - section.offsetTop;
  const total = section.clientHeight - window.innerHeight;

  let percentage = distance / total;
  percentage = Math.max(0, percentage);
  percentage = Math.min(percentage, 1);

  if (vid.duration > 0) {
    vid.currentTime = vid.duration * percentage;
  }
};

// Запуск первого видео
vid1.play().catch(() => {
  window.addEventListener('click', () => {
    if (!isReadyForScroll) vid1.play();
  }, { once: true });
});

// Таймер на окончание первого видео и подмену
setTimeout(() => {
  isReadyForScroll = true;

  // Плавная подмена через стили
  vid1.style.transition = 'opacity 0.4s ease';
  vid.style.transition = 'opacity 0.4s ease';
  
  vid1.style.opacity = '0';
  vid.style.opacity = '1';

  // Снимаем блокировку с событий
  window.removeEventListener('wheel', preventScroll);
  window.removeEventListener('touchmove', preventScroll);

  // Останавливаем первое видео и "прогреваем" второе
  vid1.pause();
  vid.currentTime = 0;
}, 1583);

// Навешиваем ваш обработчик скролла
window.addEventListener('scroll', scroll);
