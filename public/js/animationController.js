import { generateVisibilityMap } from "./visibilityMap.js";
import { drawMap } from "./mapCanvas.js";

let interval = null;
let currentHour = 12;

export function startMapAnimation({ date, tz, canvas, timeLabel, infoLabel }) {
  if (interval) return;

  interval = setInterval(() => {
    currentHour += 0.5;
    if (currentHour > 24) currentHour = 12;

    const d = new Date(date);
    d.setHours(Math.floor(currentHour), Math.floor((currentHour % 1) * 60), 0, 0);

    const points = generateVisibilityMap({ date: d, tz, step: 2 });
    drawMap(canvas, points);

    if (timeLabel) timeLabel.textContent = `Waktu peta: ${String(Math.floor(currentHour)).padStart(2, "0")}:${String(Math.floor((currentHour % 1) * 60)).padStart(2, "0")}`;
    if (infoLabel) infoLabel.textContent = `Tampilan jam ${currentHour.toFixed(1)} — peta visibilitas Indonesia`;
  }, 900);
}

export function stopMapAnimation() {
  if (interval) clearInterval(interval);
  interval = null;
}
