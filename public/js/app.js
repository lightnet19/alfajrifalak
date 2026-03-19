import { drawSky } from "./skyCanvas.js";
import { getSkyData } from "./dataAdapter.js";
import { startAnimation, stopAnimation } from "./timeController.js";
import { exportRukyatPDF } from "./exportPdf.js";

const canvas = document.getElementById("skyCanvas");

let baseInput = {
  lat: -8.17,
  lon: 113.71,
  tz: 7,
  date: new Date(),
};

let lastRukyatData = null;

function safeNumber(v, fallback) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
}

function setStatus(text) {
  document.getElementById("status").textContent = text;
}

function formatTime(decimalHours) {
  const h = Math.floor(decimalHours);
  const m = Math.floor((decimalHours - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function num(v) {
  return Number.isFinite(v) ? v.toFixed(2) : "-";
}

function syncInputs() {
  baseInput.lat = safeNumber(document.getElementById("lat").value, -8.17);
  baseInput.lon = safeNumber(document.getElementById("lon").value, 113.71);
  baseInput.tz = safeNumber(document.getElementById("tz").value, 7);
  const rawDate = document.getElementById("date").value;
  baseInput.date = rawDate ? new Date(rawDate + "T00:00:00") : new Date();
}

function renderResults(result) {
  const sunsetText = result.sunset == null ? "-" : formatTime(result.sunset);
  document.getElementById("output").innerHTML = `
<div class="grid-2">
  <div class="metric"><span>Sunset</span><strong>${sunsetText}</strong></div>
  <div class="metric"><span>Ijtima</span><strong>${result.ijtima ? result.ijtima.toLocaleString() : "-"}</strong></div>
  <div class="metric"><span>Altitude (Apparent)</span><strong>${num(result.apparentAltitude)}°</strong></div>
  <div class="metric"><span>Elongation</span><strong>${num(result.elongation)}°</strong></div>
  <div class="metric"><span>Yallop</span><strong>${result.yallop?.category ?? "-"}</strong></div>
  <div class="metric"><span>Odeh</span><strong>${result.odeh?.category ?? "-"}</strong></div>
  <div class="metric"><span>Keputusan</span><strong class="${result.decision ? "yes" : "no"}">${result.decision ? "Layak Awal Bulan" : "Belum Layak"}</strong></div>
  <div class="metric"><span>Moon Lag</span><strong>${result.moonLag ?? "-"} jam</strong></div>
</div>`;

  setStatus(result.decision ? "Hilal layak ditetapkan sebagai awal bulan" : "Hilal belum memenuhi kriteria");
}

function renderAtHour(hour) {
  const d = new Date(baseInput.date);
  const h = Math.floor(hour);
  const m = Math.floor((hour - h) * 60);
  d.setHours(h, m, 0, 0);

  const data = getSkyData({ ...baseInput, date: d });
  lastRukyatData = {
    ...data,
    location: `${baseInput.lat.toFixed(4)}, ${baseInput.lon.toFixed(4)}`,
    date: baseInput.date.toISOString().slice(0, 10),
  };

  drawSky(canvas, data);
  renderResults(data.raw);
  document.getElementById("timeSlider").value = hour.toFixed(2);
}

window.run = function () {
  syncInputs();
  const hour = parseFloat(document.getElementById("timeSlider").value || "18");
  renderAtHour(hour);
};

window.play = function () {
  startAnimation(renderAtHour);
  setStatus("Animasi berjalan");
};

window.pause = function () {
  stopAnimation();
  setStatus("Animasi dijeda");
};

window.rukyatMode = function () {
  stopAnimation();
  syncInputs();
  renderAtHour(18);
  document.getElementById("timeSlider").value = "18";
  setStatus("Mode rukyat aktif");
};

window.exportPDF = async function () {
  if (!lastRukyatData) {
    alert("Jalankan perhitungan dulu.");
    return;
  }
  await exportRukyatPDF(lastRukyatData);
};

document.getElementById("timeSlider").addEventListener("input", (e) => {
  syncInputs();
  renderAtHour(parseFloat(e.target.value));
});

window.addEventListener("resize", () => {
  if (lastRukyatData) drawSky(canvas, lastRukyatData);
});

const today = new Date();
document.getElementById("date").value = today.toISOString().slice(0, 10);
syncInputs();
renderAtHour(18);
