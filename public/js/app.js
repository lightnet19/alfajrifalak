import { drawSky } from "./skyCanvas.js";
import { getSkyData } from "./dataAdapter.js";
import { startAnimation, stopAnimation } from "./timeController.js";
import { getCurrentLocation } from "./locationService.js";
import { getMarkazList, addMarkaz, deleteMarkaz as deleteSavedMarkaz } from "./markazService.js";
import { buildShareText } from "./shareService.js";
import { exportRukyatPDF } from "./exportPdf.js";

const canvas = document.getElementById("skyCanvas");

let baseInput = {
  markaz: "",
  lat: -8.17,
  lon: 113.71,
  elevation: 0,
  tz: 7,
  date: new Date(),
};

let lastRukyatData = null;

function num(v) {
  return Number.isFinite(v) ? v.toFixed(2) : "-";
}

function formatTime(v) {
  if (v == null || Number.isNaN(v)) return "-";
  const h = Math.floor(v);
  const m = Math.floor((v - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function syncInputs() {
  baseInput.markaz = document.getElementById("markaz").value.trim();
  baseInput.lat = parseFloat(document.getElementById("lat").value) || -8.17;
  baseInput.lon = parseFloat(document.getElementById("lon").value) || 113.71;
  baseInput.elevation = parseFloat(document.getElementById("elevation").value) || 0;
  baseInput.tz = parseFloat(document.getElementById("tz").value) || 7;
  const rawDate = document.getElementById("date").value;
  baseInput.date = rawDate ? new Date(rawDate + "T00:00:00") : new Date();
}

function renderAtHour(hour, rukyatMode = false) {
  const d = new Date(baseInput.date);
  const h = Math.floor(hour);
  const m = Math.floor((hour - h) * 60);
  d.setHours(h, m, 0, 0);

  const data = getSkyData({
    ...baseInput,
    date: d,
  });

  if (rukyatMode) data.rukyat = true;

  lastRukyatData = {
    ...data,
    markaz: baseInput.markaz,
    lat: baseInput.lat,
    lon: baseInput.lon,
    elevation: baseInput.elevation,
    tz: baseInput.tz,
    date: baseInput.date.toISOString().slice(0, 10),
  };

  drawSky(canvas, data);
  renderResults(data.raw);
  document.getElementById("timeSlider").value = hour.toFixed(2);
}

function renderResults(result) {
  const bestTime = result.bestTime ? result.bestTime.toLocaleTimeString() : "-";

  document.getElementById("output").innerHTML = `
<div class="grid-2">
  <div class="metric"><span>Markaz</span><strong>${baseInput.markaz || "-"}</strong></div>
  <div class="metric"><span>Sunset</span><strong>${formatTime(result.sunset)}</strong></div>
  <div class="metric"><span>Ijtima</span><strong>${result.ijtima ? result.ijtima.toLocaleString() : "-"}</strong></div>
  <div class="metric"><span>Best Time</span><strong>${bestTime}</strong></div>

  <div class="metric"><span>Altitude (Apparent)</span><strong>${num(result.apparentAltitude)}°</strong></div>
  <div class="metric"><span>Elongasi</span><strong>${num(result.elongation)}°</strong></div>
  <div class="metric"><span>Moon Lag</span><strong>${num(result.moonLagMinutes)} menit</strong></div>
  <div class="metric"><span>Umur Hilal</span><strong>${num(result.moonAgeHours)} jam</strong></div>

  <div class="metric"><span>Yallop</span><strong>${result.yallop?.category || "-"}</strong></div>
  <div class="metric"><span>Odeh</span><strong>${result.odeh?.category || "-"}</strong></div>
  <div class="metric"><span>MABIMS</span><strong class="${result.mabims?.memenuhi ? "yes" : "no"}">${result.mabims?.memenuhi ? "Memenuhi" : "Tidak"}</strong></div>
  <div class="metric"><span>IRNU</span><strong class="${result.irnu?.memenuhi ? "yes" : "no"}">${result.irnu?.memenuhi ? "Memenuhi" : "Tidak"}</strong></div>

  <div class="metric"><span>Muhammadiyah</span><strong class="${result.muhammadiyah?.memenuhi ? "yes" : "no"}">${result.muhammadiyah?.memenuhi ? "Memenuhi" : "Tidak"}</strong></div>
  <div class="metric"><span>Kesimpulan</span><strong class="${result.decision ? "yes" : "no"}">${result.decision ? "Layak (MABIMS)" : "Belum Layak"}</strong></div>
</div>

<hr style="border-color: rgba(255,255,255,0.08); margin: 18px 0;">

<div class="metric">
  <span>Koordinat detail</span>
  <strong>
    Sun Alt ${num(result.sunAltitude)}° | Sun Az ${num(result.sunAzimuth)}°<br>
    Moon Alt ${num(result.apparentAltitude)}° | Moon Az ${num(result.moonAzimuth)}°<br>
    Topo λ ${num(result.topocentricEcliptic?.lambdaTopo)}° | Topo β ${num(result.topocentricEcliptic?.betaTopo)}°
  </strong>
</div>
`;

  document.getElementById("status").textContent = result.decision
    ? "Hilal layak sebagai awal bulan (berdasarkan MABIMS)"
    : "Hilal belum layak / istikmal";
}

window.run = function () {
  syncInputs();
  const hour = parseFloat(document.getElementById("timeSlider").value || "18");
  renderAtHour(hour, false);
};

window.play = function () {
  syncInputs();
  startAnimation((hour) => renderAtHour(hour, false));
  document.getElementById("status").textContent = "Animasi berjalan";
};

window.pause = function () {
  stopAnimation();
  document.getElementById("status").textContent = "Animasi dijeda";
};

window.rukyatMode = function () {
  stopAnimation();
  syncInputs();
  const sunset = lastRukyatData?.raw?.sunset ?? 18;
  renderAtHour(sunset, true);
  document.getElementById("status").textContent = "Mode rukyat aktif";
};

window.exportPDF = async function () {
  if (!lastRukyatData) {
    alert("Jalankan perhitungan dulu.");
    return;
  }
  await exportRukyatPDF(lastRukyatData);
};

window.shareResult = async function () {
  if (!lastRukyatData) {
    alert("Jalankan perhitungan dulu.");
    return;
  }

  const text = buildShareText(lastRukyatData);

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Hasil Rukyat Hilal - Alfajri",
        text,
      });
      return;
    } catch (_) {}
  }

  await navigator.clipboard.writeText(text);
  alert("Hasil rukyat disalin ke clipboard.");
};

window.useGPS = async function () {
  try {
    const loc = await getCurrentLocation();
    document.getElementById("lat").value = loc.lat.toFixed(6);
    document.getElementById("lon").value = loc.lon.toFixed(6);
    alert(`Lokasi GPS berhasil diambil (akurasi ±${Math.round(loc.accuracy)} m)`);
  } catch (err) {
    alert(err.message || String(err));
  }
};

function loadMarkazList() {
  const list = getMarkazList();
  const select = document.getElementById("markazList");
  select.innerHTML = `<option value="">-- pilih markaz --</option>`;
  list.forEach((m, i) => {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = m.name;
    select.appendChild(opt);
  });
}

window.saveMarkaz = function () {
  syncInputs();
  if (!baseInput.markaz) {
    alert("Nama markaz belum diisi.");
    return;
  }

  addMarkaz({
    name: baseInput.markaz,
    lat: baseInput.lat,
    lon: baseInput.lon,
    elevation: baseInput.elevation,
    tz: baseInput.tz,
  });

  loadMarkazList();
  alert("Markaz tersimpan.");
};

window.deleteMarkaz = function () {
  const idx = parseInt(document.getElementById("markazList").value, 10);
  if (Number.isNaN(idx)) {
    alert("Pilih markaz terlebih dahulu.");
    return;
  }
  deleteSavedMarkaz(idx);
  loadMarkazList();
  alert("Markaz dihapus.");
};

document.getElementById("timeSlider").addEventListener("input", (e) => {
  syncInputs();
  renderAtHour(parseFloat(e.target.value), false);
});

document.getElementById("markazList").addEventListener("change", function () {
  const list = getMarkazList();
  const m = list[parseInt(this.value, 10)];
  if (!m) return;

  document.getElementById("markaz").value = m.name;
  document.getElementById("lat").value = m.lat;
  document.getElementById("lon").value = m.lon;
  document.getElementById("elevation").value = m.elevation;
  document.getElementById("tz").value = m.tz ?? 7;

  syncInputs();
  renderAtHour(parseFloat(document.getElementById("timeSlider").value || "18"), false);
});

window.addEventListener("resize", () => {
  if (lastRukyatData) drawSky(canvas, lastRukyatData);
});

const today = new Date();
document.getElementById("date").value = today.toISOString().slice(0, 10);
loadMarkazList();
syncInputs();
renderAtHour(18, false);
