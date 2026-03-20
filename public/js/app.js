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
    alert("Silakan klik HITUNG dulu!");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 15;

  const add = (t) => {
    doc.text(t, 15, y);
    y += 5;
  };

  const line = () => {
    doc.line(15, y, 195, y);
    y += 6;
  };

  // =========================
  // HEADER
  // =========================
  doc.setFontSize(14);
  doc.text("LAPORAN RUKYAT HILAL", 105, y, { align: "center" });
  y += 6;

  doc.setFontSize(10);
  doc.text("LEMBAGA FALAKIYAH PCNU KENCONG", 105, y, { align: "center" });
  y += 6;

  doc.text("Sistem Alfajri - Observatorium Digital", 105, y, { align: "center" });
  y += 8;

  line();

  // =========================
  // DATA UMUM
  // =========================
  doc.setFontSize(10);
  add(`JD Ijtima           : ${last.JD}`);
  add(`Delta T             : ${last.deltaT} s`);
  add(`Sunset              : ${last.sunset}`);

  add(`Tanggal Ijtima      : ${last.ijtima}`);
  add(`Umur Hilal          : ${last.moonAge?.toFixed(2)} jam`);

  line();

  // =========================
  // MATAHARI
  // =========================
  add("DATA MATAHARI");
  add(`Altitude            : ${last.sunAltitude?.toFixed(2)}°`);
  add(`Azimuth             : ${last.sunAzimuth?.toFixed(2)}°`);

  line();

  // =========================
  // HILAL
  // =========================
  add("DATA HILAL");

  add(`Altitude Geo        : ${last.moonAltitude?.toFixed(2)}°`);
  add(`Altitude Apparent   : ${last.apparentAltitude?.toFixed(2)}°`);
  add(`Altitude Mar'i      : ${last.observedAltitude?.toFixed(2)}°`);

  add(`Azimuth             : ${last.moonAzimuth?.toFixed(2)}°`);
  add(`Elongasi            : ${last.elongation?.toFixed(2)}°`);

  line();

  // =========================
  // KOREKSI
  // =========================
  add("KOREKSI");

  add(`Refraction          : ${last.refraction?.toFixed(3)}°`);
  add(`Parallax            : ${last.parallaxAlt?.toFixed(2)}°`);
  add(`Semi Diameter       : ${last.semiDiameter?.toFixed(2)}°`);

  line();

  // =========================
  // PARAMETER RUKYAT
  // =========================
  add("PARAMETER RUKYAT");

  add(`Moon Lag            : ${last.moonLag?.toFixed(2)} menit`);
  add(`Best Time           : ${last.bestTime?.toFixed(2)}`);

  line();

  // =========================
  // VISIBILITAS
  // =========================
  add("VISIBILITAS");

  add(`Yallop              : ${last.yallop}`);
  add(`Odeh                : ${last.odeh}`);

  line();

  // =========================
  // KESIMPULAN
  // =========================
  doc.setFont("helvetica", "bold");

  const kesimpulan = last.visible
    ? "HILAL LAYAK TERLIHAT (MABIMS)"
    : "HILAL BELUM LAYAK (ISTIKMAL)";

  add(`KESIMPULAN          : ${kesimpulan}`);

  y += 8;

  // =========================
  // PENGESAHAN
  // =========================
  doc.setFont("helvetica", "normal");

  add("Mengetahui,");
  y += 5;

  add("Lembaga Falakiyah PCNU Kencong");
  y += 20;

  add("______________________________");
  add("Ketua");

  y += 10;
  add(`Tanggal: ${new Date().toLocaleDateString()}`);

  // FOOTER
  doc.setFontSize(8);
  doc.text(
    "Generated by Alfajri - Sistem Rukyat Observatorium",
    15,
    285
  );

  doc.save("laporan-rukyat-observatorium.pdf");
};
