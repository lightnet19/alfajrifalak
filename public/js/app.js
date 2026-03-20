import {
  getMarkazList,
  addMarkaz,
  deleteMarkaz as removeMarkaz,
  getMarkaz
} from "./markazService.js";
import { calculateHilal } from "./engine/hilal.js";

let last = null;

function el(id) {
  return document.getElementById(id);
}

function num(value, digits = 2) {
  return Number.isFinite(value) ? value.toFixed(digits) : "-";
}

function loadMarkazList() {
  const list = getMarkazList();
  const select = el("markazList");
  if (!select) return;

  select.innerHTML = "";

  if (!list.length) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.text = "-- belum ada markaz tersimpan --";
    select.appendChild(opt);
    return;
  }

  list.forEach((m, i) => {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.text = `${m.name} (${m.lat}, ${m.lon})`;
    select.appendChild(opt);
  });
}

function syncSelectedMarkazToForm(index) {
  const m = getMarkaz(index);
  if (!m) return;

  el("markaz").value = m.name || "";
  el("lat").value = m.lat ?? "";
  el("lon").value = m.lon ?? "";
  el("elevation").value = m.elevation ?? 0;
  el("tz").value = m.tz ?? 7;
}

function renderOutput(result) {
  el("out").textContent = `
🌙 HASIL RUKYAT (OBSERVATORIUM)

MARKAZ              : ${last.markaz || "-"}

JD                  : ${num(result.JD, 6)}
DeltaT              : ${num(result.deltaT, 2)} s
Sunset              : ${num(result.sunset, 6)}

-------------------------------
🌞 MATAHARI
-------------------------------
Altitude Sun        : ${num(result.sunAltitude)}°
Azimuth Sun         : ${num(result.sunAzimuth)}°

-------------------------------
🌙 HILAL
-------------------------------
Altitude (Geo)      : ${num(result.moonAltitude)}°
Altitude (Apparent) : ${num(result.apparentAltitude)}°
Altitude (Observed) : ${num(result.observedAltitude)}°

Azimuth Hilal       : ${num(result.moonAzimuth)}°
Elongasi            : ${num(result.elongation)}°

Refraction          : ${num(result.refraction, 3)}°
Parallax            : ${num(result.parallaxAlt)}°
Semi Diameter       : ${num(result.semiDiameter)}°

-------------------------------
⏳ PARAMETER RUKYAT
-------------------------------
Moon Lag            : ${num(result.moonLag, 1)} menit
Best Time           : ${num(result.bestTime, 2)}
Umur Hilal          : ${num(result.moonAge, 2)} jam

-------------------------------
🌍 VISIBILITAS
-------------------------------
Yallop              : ${result.yallop || "-"}
Odeh                : ${result.odeh || "-"}

-------------------------------
📊 KESIMPULAN
-------------------------------
MABIMS              : ${result.visible ? "✅ MEMENUHI" : "❌ BELUM"}
`;
}

window.getGPS = function () {
  if (!navigator.geolocation) {
    alert("GPS tidak didukung browser ini.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      el("lat").value = pos.coords.latitude.toFixed(6);
      el("lon").value = pos.coords.longitude.toFixed(6);
      el("elevation").value = Math.round(pos.coords.altitude || 0);
      alert("Lokasi GPS berhasil diambil.");
    },
    () => alert("Gagal mengambil GPS.")
  );
};

window.saveMarkaz = function () {
  const name = (el("markaz")?.value || "").trim();
  const lat = parseFloat(el("lat")?.value);
  const lon = parseFloat(el("lon")?.value);
  const elevation = parseFloat(el("elevation")?.value || "0");
  const tz = parseFloat(el("tz")?.value || "7");

  if (!name || !Number.isFinite(lat) || !Number.isFinite(lon)) {
    alert("Isi nama markaz, latitude, dan longitude terlebih dahulu.");
    return;
  }

  addMarkaz({ name, lat, lon, elevation, tz });
  loadMarkazList();
  alert("Markaz disimpan.");
};

window.deleteMarkaz = function () {
  const index = el("markazList")?.value;
  if (index === "" || index === null || index === undefined) {
    alert("Pilih markaz dulu.");
    return;
  }

  removeMarkaz(index);
  loadMarkazList();
  alert("Markaz dihapus.");
};

window.run = function () {
  const markazName = (el("markaz")?.value || "").trim() || "Tanpa Nama";
  const lat = parseFloat(el("lat")?.value);
  const lon = parseFloat(el("lon")?.value);
  const tz = parseFloat(el("tz")?.value || "7");
  const elevation = parseFloat(el("elevation")?.value || "0");

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    alert("Latitude / Longitude belum diisi dengan benar.");
    return;
  }

  const date = new Date();
  const result = calculateHilal(date, lat, lon, tz);

  last = {
    ...result,
    markaz: markazName,
    lat,
    lon,
    tz,
    elevation,
    date
  };

  renderOutput(last);
};

function formatDateTime(value) {
  if (!value) return "-";
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
}

window.exportPDF = function () {
  if (!last) {
    alert("Klik HITUNG dulu.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 15;

  const add = (text) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(text, 15, y);
    y += 6;

    if (y > 280) {
      doc.addPage();
      y = 20;
    }
  };

  const title = (text) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(text, 15, y);
    y += 7;
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("LAPORAN RUKYAT HILAL", 105, y, { align: "center" });
  y += 7;

  doc.setFontSize(11);
  doc.text("LEMBAGA FALAKIYAH PCNU KENCONG", 105, y, { align: "center" });
  y += 10;

  title("A. Identitas Markaz");
  add(`Markaz        : ${last.markaz || "-"}`);
  add(`Lintang       : ${num(last.lat, 6)}`);
  add(`Bujur         : ${num(last.lon, 6)}`);
  add(`Elevasi       : ${num(last.elevation, 2)} mdpl`);
  add(`Zona Waktu    : UTC+${num(last.tz, 1)}`);

  title("B. Data Ijtima");
  add(`Tanggal Ijtima : ${formatDateTime(last.ijtima)}`);
  add(`JD             : ${num(last.JD, 6)}`);
  add(`Delta T        : ${num(last.deltaT, 2)} detik`);

  title("C. Data Matahari");
  add(`Sunset         : ${num(last.sunset, 6)}`);
  add(`Altitude       : ${num(last.sunAltitude)} deg`);
  add(`Azimuth        : ${num(last.sunAzimuth)} deg`);

  title("D. Data Hilal");
  add(`Altitude Geo      : ${num(last.moonAltitude)} deg`);
  add(`Altitude Apparent : ${num(last.apparentAltitude)} deg`);
  add(`Altitude Mar'i    : ${num(last.observedAltitude)} deg`);
  add(`Azimuth           : ${num(last.moonAzimuth)} deg`);
  add(`Elongasi          : ${num(last.elongation)} deg`);

  title("E. Parameter Hilal");
  add(`Refraction    : ${num(last.refraction, 3)} deg`);
  add(`Parallax      : ${num(last.parallaxAlt)} deg`);
  add(`Semi Diameter : ${num(last.semiDiameter)} deg`);

  title("F. Parameter Rukyat");
  add(`Moon Lag   : ${num(last.moonLag, 2)} menit`);
  add(`Best Time  : ${num(last.bestTime, 2)}`);
  add(`Umur Hilal : ${num(last.moonAge, 2)} jam`);

  title("G. Visibilitas");
  add(`Yallop : ${last.yallop || "-"}`);
  add(`Odeh   : ${last.odeh || "-"}`);
  add(`Kesimpulan : ${last.visible ? "Memenuhi Kriteria MABIMS" : "Belum Memenuhi Kriteria"}`);

  title("H. Pengesahan");
  add("Mengetahui,");
  add("Lembaga Falakiyah PCNU Kencong");
  y += 15;
  add("__________________________");
  add("Ketua");
  y += 10;
  add(`Tanggal: ${new Date().toLocaleDateString()}`);

  doc.setFontSize(8);
  doc.text("Generated by Alfajri - Sistem Rukyat Observatorium", 15, 285);

  doc.save("laporan-rukyat-alfajri.pdf");
};

function init() {
  const select = el("markazList");
  if (select) {
    select.addEventListener("change", function () {
      syncSelectedMarkazToForm(this.value);
    });
  }

  loadMarkazList();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
