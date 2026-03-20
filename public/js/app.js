import { calculateHilal } from "./engine/hilal.js";

let last = null;

// ========================
// MAIN RUN
// ========================
window.run = () => {
  const lat = -8.28;   // Gunungsari (default)
  const lon = 113.38;
  const tz = 7;

  const date = new Date();

  // 🔭 HITUNG (ENGINE OBSERVATORIUM)
  last = calculateHilal(date, lat, lon, tz);

  // ========================
  // 📊 OUTPUT FULL OBSERVATORIUM
  // ========================
  document.getElementById("out").textContent = `
🌙 HASIL RUKYAT (OBSERVATORIUM)

JD                : ${last.JD}
DeltaT            : ${last.deltaT} s
Sunset            : ${last.sunset}

-------------------------------
🌞 MATAHARI
-------------------------------
Altitude Sun      : ${last.sunAltitude?.toFixed(2)}°
Azimuth Sun       : ${last.sunAzimuth?.toFixed(2)}°

-------------------------------
🌙 HILAL
-------------------------------
Altitude (Geo)      : ${last.moonAltitude?.toFixed(2)}°
Altitude (Apparent) : ${last.apparentAltitude?.toFixed(2)}°
Altitude (Observed) : ${last.observedAltitude?.toFixed(2)}°

Azimuth Hilal       : ${last.moonAzimuth?.toFixed(2)}°

Elongasi            : ${last.elongation?.toFixed(2)}°

Refraction          : ${last.refraction?.toFixed(3)}°
Parallax            : ${last.parallaxAlt?.toFixed(2)}°
Semi Diameter       : ${last.semiDiameter?.toFixed(2)}°

-------------------------------
⏳ PARAMETER RUKYAT
-------------------------------
Moon Lag            : ${last.moonLag?.toFixed(1)} menit

-------------------------------
🌍 VISIBILITAS
-------------------------------
Yallop              : ${last.yallop}
Odeh                : ${last.odeh}

-------------------------------
📊 KESIMPULAN
-------------------------------
MABIMS              : ${last.visible ? "✅ MEMENUHI" : "❌ BELUM"}
`;
};

// ========================
// EXPORT PDF (FULL)
// ========================
window.exportPDF = () => {
  if (!last) {
    alert("Klik HITUNG dulu!");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 10;

  const add = (t) => {
    doc.setFont("courier", "normal");
    doc.setFontSize(8.5);
    doc.text(t, 10, y);
    y += 4.5;
  };

  const line = () => {
    doc.text("=".repeat(100), 10, y);
    y += 5;
  };

  const dms = (val) => {
    if (!val && val !== 0) return "-";
    const d = Math.floor(val);
    const m = Math.floor((val - d) * 60);
    const s = (((val - d) * 60 - m) * 60).toFixed(2);
    return `${d}° ${m}′ ${s}″`;
  };

  // =========================
  // HEADER
  // =========================
  doc.setFont("courier", "bold");
  doc.setFontSize(10);

  add("Awal Bulan Hijriyah (Simulasi Alfajri)");

  add("Markaz           : PCNU KENCONG");
  add("Lintang          : -08° 17′");
  add("Bujur            : 113° 22′");
  add("Elevasi          : 15 mdpl");
  add("Zona Waktu       : 7.0 UTC");

  add("");
  add("Algoritma        : Meeus + Observatorium Upgrade");
  add("Jumlah Koreksi   : Simplified High Precision");

  line();

  // =========================
  // IJTIMA
  // =========================
  add(`Tanggal Ijtima   : ${last.ijtima}`);
  add(`JD Ijtima        : ${last.JD}`);
  add(`DeltaT           : ${last.deltaT} s`);

  add(`Sunset           : ${last.sunset}`);

  line();

  // =========================
  // KOORDINAT
  // =========================
  add(`Az. Matahari     : ${dms(last.sunAzimuth)}`);
  add(`Az. Hilal        : ${dms(last.moonAzimuth)}`);

  line();

  // =========================
  // TINGGI HILAL
  // =========================
  add(`T. Hilal Geo     : ${dms(last.moonAltitude)}`);
  add(`T. Apparent      : ${dms(last.apparentAltitude)}`);
  add(`T. Mar'i         : ${dms(last.observedAltitude)}`);

  line();

  // =========================
  // PARAMETER
  // =========================
  add(`Elongasi         : ${dms(last.elongation)}`);
  add(`Refraction       : ${last.refraction?.toFixed(3)}°`);
  add(`Parallax         : ${dms(last.parallaxAlt)}`);
  add(`Semi Diameter    : ${dms(last.semiDiameter)}`);

  // tambahan
  const illumination = (1 - Math.cos(last.elongation * Math.PI/180)) / 2;
  const width = last.semiDiameter * illumination;
  const nurul = illumination * last.observedAltitude;
  const qOdeh = last.observedAltitude - (7.1651 - 6.3226 * last.elongation);

  add(`Illuminasi       : ${(illumination*100).toFixed(2)} %`);
  add(`Lebar Hilal      : ${dms(width)}`);
  add(`Nurul Hilal      : ${nurul.toFixed(4)}`);
  add(`Range q Odeh     : ${qOdeh.toFixed(3)}`);
  add(`Jarak Bumi-Bulan : ${(384400).toFixed(2)} km`);

  line();

  // =========================
  // WAKTU
  // =========================
  add(`Umur Hilal       : ${last.moonAge?.toFixed(2)} jam`);
  add(`Lama Hilal       : ${last.moonLag?.toFixed(2)} menit`);
  add(`Best Time        : ${last.bestTime?.toFixed(2)}`);

  line();

  // =========================
  // VISIBILITAS
  // =========================
  add(`Yallop           : ${last.yallop}`);
  add(`Odeh             : ${last.odeh}`);

  const kesimpulan = last.visible
    ? "Hilal Terlihat"
    : "Tidak Terlihat";

  add(`Is Visible?      : ${kesimpulan}`);

  line();

  // =========================
  // KETERANGAN
  // =========================
  add("Keterangan:");
  add("Az.   = Azimuth");
  add("T.    = Tinggi");
  add("Geo   = Geosentris");
  add("Topo  = Toposentris");
  add("Mar'i = Teramati");
  add("RA    = Right Ascension");

  line();

  add("Powered by: Alfajri Observatorium Digital");
  add("Lembaga Falakiyah PCNU Kencong");

  doc.save("kanzul-style-full.pdf");
};
