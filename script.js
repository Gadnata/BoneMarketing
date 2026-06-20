const section = document.querySelector('section.vid');
const vid = section.querySelector('#video2');
const vid1 = section.querySelector('#video1');

let isReadyForScroll = false;

// Блокировка скролла в начале
const preventScroll = (e) => {
  if (!isReadyForScroll) {
    e.preventDefault();
    window.scrollTo(0, 0);
  }
};
window.addEventListener('wheel', preventScroll, { passive: false });
window.addEventListener('touchmove', preventScroll, { passive: false });
window.addEventListener('keydown', (e) => {
  const keys = ['Space', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'End', 'Home'];
  if (!isReadyForScroll && keys.includes(e.code)) e.preventDefault();
});

vid.pause();

// 🌟 НАСТРОЙКИ ДЛЯ БОРЬБЫ С ЛАГАМИ CHROME БЕЗ ПЕРЕКОДИРОВАНИЯ
let isSeeking = false; // Флаг: занят ли Chrome обработкой кадра прямо сейчас
const minTimeStep = 0.002; // Минимальный шаг в секундах. Защищает от микро-запросов.

// Chrome сообщает, когда он УСПЕШНО отрисовал кадр
vid.addEventListener('seeked', () => {
  isSeeking = false; 
});

const scroll = () => {
  if (!isReadyForScroll) return;
  
  // Если Chrome всё еще занят декодированием прошлого кадра — полностью игнорируем текущий шаг скролла
  if (isSeeking) return; 

  const distance = window.scrollY - section.offsetTop;
  const total = section.clientHeight - window.innerHeight;

  let percentage = distance / total;
  percentage = Math.max(0, Math.min(percentage, 1));

  if (vid.duration > 0) {
    const calculatedTargetTime = vid.duration * percentage;
    
    // Проверяем разницу между текущим кадром и тем, куда хочет прыгнуть скролл
    const timeDifference = Math.abs(calculatedTargetTime - vid.currentTime);

    // Обновляем видео только если скролл сдвинулся достаточно ощутимо
    if (timeDifference > minTimeStep) {
      isSeeking = true; // Блокируем новые запросы, пока Chrome занят
      vid.currentTime = calculatedTargetTime;
    }
  }
};

vid1.play().catch(() => {
  window.addEventListener('click', () => {
    if (!isReadyForScroll) vid1.play();
  }, { once: true });
});

// Таймер окончания первого видео
setTimeout(() => {
  isReadyForScroll = true;

  vid1.style.transition = 'opacity 0.4s ease';
  vid.style.transition = 'opacity 0.4s ease';
  vid1.style.opacity = '0';
  vid.style.opacity = '1';

  window.removeEventListener('wheel', preventScroll);
  window.removeEventListener('touchmove', preventScroll);

  vid1.pause();
  vid.currentTime = 0;
}, 1583);

window.addEventListener('scroll', scroll);
