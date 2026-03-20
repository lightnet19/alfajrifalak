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

  let y = 15;

  const add = (t) => {
    doc.setFont("courier", "normal");
    doc.setFontSize(9);
    doc.text(t, 10, y);
    y += 5;
  };

  const line = () => {
    doc.text("=".repeat(95), 10, y);
    y += 6;
  };

  // =========================
  // HEADER
  // =========================
  doc.setFont("courier", "bold");
  doc.setFontSize(11);

  doc.text("Awal Bulan Hijriyah (Simulasi Alfajri)", 10, y);
  y += 6;

  add(`Markaz           : PCNU KENCONG`);
  add(`Lintang          : -08° 17′`);
  add(`Bujur            : 113° 22′`);
  add(`Elevasi          : 15 mdpl`);
  add(`Zona Waktu       : UTC+7`);

  y += 4;

  add(`Algoritma        : Meeus + Observatorium Upgrade`);
  add(`Sistem           : Alfajri Digital`);

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
  add(`Az. Matahari     : ${last.sunAzimuth?.toFixed(2)}°`);
  add(`Az. Hilal        : ${last.moonAzimuth?.toFixed(2)}°`);

  line();

  // =========================
  // TINGGI HILAL
  // =========================
  add(`T. Hilal Geo     : ${last.moonAltitude?.toFixed(2)}°`);
  add(`T. Apparent      : ${last.apparentAltitude?.toFixed(2)}°`);
  add(`T. Mar'i         : ${last.observedAltitude?.toFixed(2)}°`);

  line();

  // =========================
  // PARAMETER
  // =========================
  add(`Elongasi         : ${last.elongation?.toFixed(2)}°`);
  add(`Refraction       : ${last.refraction?.toFixed(3)}°`);
  add(`Parallax         : ${last.parallaxAlt?.toFixed(2)}°`);
  add(`Semi Diameter    : ${last.semiDiameter?.toFixed(2)}°`);

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

  line();

  // =========================
  // KESIMPULAN
  // =========================
  const kesimpulan = last.visible
    ? "Layak (MABIMS)"
    : "Tidak Layak";

  add(`KESIMPULAN       : ${kesimpulan}`);

  line();

  // =========================
  // KETERANGAN
  // =========================
  add("Keterangan:");
  add("Az. = Azimuth");
  add("T.  = Tinggi");
  add("Geo = Geosentris");
  add("Mar'i = Teramati");

  line();

  // =========================
  // FOOTER
  // =========================
  add("Powered by Alfajri Observatorium Digital");
  add("Lembaga Falakiyah PCNU Kencong");

  doc.save("laporan-kanzul-style.pdf");
};
