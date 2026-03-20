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

  let y = 20;

  const add = (t) => {
    doc.text(t, 20, y);
    y += 7;
  };

  // HEADER RESMI
  doc.setFontSize(14);
  doc.text("LAPORAN RUKYAT HILAL", 105, y, { align: "center" });
  y += 7;

  doc.setFontSize(10);
  doc.text("LEMBAGA FALAKIYAH PCNU KENCONG", 105, y, { align: "center" });
  y += 10;

  // DATA UTAMA
  add(`JD                : ${last.JD}`);
  add(`DeltaT            : ${last.deltaT} s`);
  add(`Sunset            : ${last.sunset}`);

  y += 5;

  add(`Altitude Sun      : ${last.sunAltitude?.toFixed(2)}°`);
  add(`Azimuth Sun       : ${last.sunAzimuth?.toFixed(2)}°`);

  y += 5;

  add(`Altitude Geo      : ${last.moonAltitude?.toFixed(2)}°`);
  add(`Altitude Apparent : ${last.apparentAltitude?.toFixed(2)}°`);
  add(`Altitude Observed : ${last.observedAltitude?.toFixed(2)}°`);

  add(`Azimuth Hilal     : ${last.moonAzimuth?.toFixed(2)}°`);
  add(`Elongasi          : ${last.elongation?.toFixed(2)}°`);

  y += 5;

  add(`Refraction        : ${last.refraction?.toFixed(3)}°`);
  add(`Parallax          : ${last.parallaxAlt?.toFixed(2)}°`);
  add(`Semi Diameter     : ${last.semiDiameter?.toFixed(2)}°`);

  y += 5;

  add(`Moon Lag          : ${last.moonLag?.toFixed(1)} menit`);

  y += 5;

  add(`Yallop            : ${last.yallop}`);
  add(`Odeh              : ${last.odeh}`);

  y += 5;

  add(`KESIMPULAN        : ${last.visible ? "LAYAK (MABIMS)" : "BELUM LAYAK"}`);

  doc.save("laporan-rukyat-observatorium.pdf");
};
