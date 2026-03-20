let interval = null;
let currentHour = 18;

export function startAnimation(update) {
  if (interval) return;
  interval = setInterval(() => {
    currentHour += 0.02;
    if (currentHour >= 24) currentHour = 0;
    update(currentHour);
  }, 50);
}

export function stopAnimation() {
  if (interval) clearInterval(interval);
  interval = null;
}

export function setTime(hour, update) {
  currentHour = hour;
  update(currentHour);
}

export function getCurrentHour() {
  return currentHour;
}
