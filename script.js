const v1 = document.getElementById("video1");
const v2 = document.getElementById("video2");

let switched = false;

v1.play();

v2.pause();
v2.currentTime = 0;

v1.addEventListener("ended", () => {
  switched = true;

  // ❗ мгновенный switch без opacity fade

  v2.style.opacity = 1;

  // важно: не запускаем play
  v2.pause();
  v2.currentTime = 0;
});

window.addEventListener("scroll", () => {
  if (!switched) return;

  const scrollTop = window.scrollY;
  const max = document.body.scrollHeight - window.innerHeight;

  const p = scrollTop / max;

  if (v2.duration) {
    v2.currentTime = p * v2.duration;
  }
});

// защита от автоплея
v2.addEventListener("play", () => v2.pause());