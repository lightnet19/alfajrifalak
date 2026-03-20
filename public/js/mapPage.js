import { generateVisibilityMap } from "./visibilityMap.js";
import { drawMap } from "./mapCanvas.js";
import { startMapAnimation, stopMapAnimation } from "./animationController.js";

const canvas = document.getElementById("mapCanvas");
const info = document.getElementById("mapInfo");
const dateInput = document.getElementById("mapDate");
const latInput = document.getElementById("mapLat");
const lonInput = document.getElementById("mapLon");
const tzInput = document.getElementById("mapTz");

dateInput.value = new Date().toISOString().slice(0, 10);

function renderMapForDate(date) {
  const points = generateVisibilityMap({
    date,
    tz: parseFloat(tzInput.value) || 7,
    step: 2,
  });
  drawMap(canvas, points, {
    highlight: {
      lat: parseFloat(latInput.value) || -8.17,
      lon: parseFloat(lonInput.value) || 113.71,
    }
  });
  info.textContent = `Menampilkan peta untuk ${date.toLocaleDateString("id-ID")} dengan grid Indonesia.`;
}

function refresh() {
  const d = dateInput.value ? new Date(dateInput.value + "T00:00:00") : new Date();
  renderMapForDate(d);
}

document.getElementById("mapStart").addEventListener("click", () => {
  const d = dateInput.value ? new Date(dateInput.value + "T00:00:00") : new Date();
  stopMapAnimation();
  startMapAnimation({
    date: d,
    tz: parseFloat(tzInput.value) || 7,
    canvas,
    timeLabel: info,
    infoLabel: info,
  });
});

document.getElementById("mapStop").addEventListener("click", () => {
  stopMapAnimation();
  refresh();
  info.textContent = "Animasi peta dihentikan.";
});

["change", "input"].forEach(ev => {
  dateInput.addEventListener(ev, refresh);
  latInput.addEventListener(ev, refresh);
  lonInput.addEventListener(ev, refresh);
  tzInput.addEventListener(ev, refresh);
});

window.addEventListener("resize", refresh);

refresh();
