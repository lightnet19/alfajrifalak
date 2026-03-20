import {
  getMarkazList,
  addMarkaz,
  deleteMarkaz as removeMarkaz,
  getMarkaz
} from "./markazService.js";
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
// DMS FORMAT (SAFE)
// ========================
function dms(val) {
  if (val === undefined || val === null || isNaN(val)) return "-";

  // normalize sudut
  val = ((val % 360) + 360) % 360;

  const d = Math.floor(val);
  const m = Math.floor((val - d) * 60);
  const s = (((val - d) * 60 - m) * 60).toFixed(2);

  return `${d} deg ${m} min ${s} sec`;
}
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
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(t, 15, y);
    y += 6;

    // auto page break
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
  };

  const title = (t) => {
    doc.setFont("helvetica", "bold");
    doc.text(t, 15, y);
    y += 7;
  };

  // =========================
  // HEADER RESMI
  // =========================
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("LAPORAN RUKYAT HILAL", 105, y, { align: "center" });
  y += 7;

  doc.setFontSize(11);
  doc.text("LEMBAGA FALAKIYAH PCNU KENCONG", 105, y, { align: "center" });
  y += 10;

  // =========================
  // IDENTITAS
  // =========================
  title("A. Identitas Markaz");

  add("Markaz        : PCNU Kencong");
  add("Lintang       : -8.28");
  add("Bujur         : 113.38");
  add("Elevasi       : 15 mdpl");
  add("Zona Waktu    : UTC+7");

  // =========================
  // IJTIMA
  // =========================
  title("B. Data Ijtima");

  add(`Tanggal Ijtima : ${new Date(last.ijtima).toLocaleString()}`);
  add(`JD             : ${last.JD.toFixed(6)}`);
  add(`Delta T        : ${last.deltaT.toFixed(2)} detik`);

  // =========================
  // MATAHARI
  // =========================
  title("C. Data Matahari");

  add(`Altitude : ${last.sunAltitude.toFixed(2)} deg`);
  add(`Azimuth  : ${last.sunAzimuth.toFixed(2)} deg`);

  // =========================
  // HILAL
  // =========================
  title("D. Data Hilal");

  add(`Altitude Geo      : ${last.moonAltitude.toFixed(2)} deg`);
  add(`Altitude Apparent : ${last.apparentAltitude.toFixed(2)} deg`);
  add(`Altitude Mar'i    : ${last.observedAltitude.toFixed(2)} deg`);

  add(`Azimuth           : ${last.moonAzimuth.toFixed(2)} deg`);
  add(`Elongasi          : ${last.elongation.toFixed(2)} deg`);

  // =========================
  // PARAMETER
  // =========================
  title("E. Parameter Hilal");

  add(`Refraction    : ${last.refraction.toFixed(3)} deg`);
  add(`Parallax      : ${last.parallaxAlt.toFixed(2)} deg`);
  add(`Semi Diameter : ${last.semiDiameter.toFixed(2)} deg`);

  // =========================
  // RUKYAT
  // =========================
  title("F. Parameter Rukyat");

  add(`Moon Lag  : ${last.moonLag.toFixed(2)} menit`);
  add(`Best Time : ${last.bestTime.toFixed(2)}`);

  // =========================
  // VISIBILITAS
  // =========================
  title("G. Visibilitas");

  add(`Yallop : ${last.yallop}`);
  add(`Odeh   : ${last.odeh}`);

  const kesimpulan = last.visible
    ? "Memenuhi Kriteria MABIMS"
    : "Belum Memenuhi Kriteria";

  add(`Kesimpulan : ${kesimpulan}`);

  // =========================
  // PENGESAHAN
  // =========================
  title("H. Pengesahan");

  add("Mengetahui,");
  add("Lembaga Falakiyah PCNU Kencong");

  y += 15;

  add("__________________________");
  add("Ketua");

  y += 10;
  add(`Tanggal: ${new Date().toLocaleDateString()}`);

  // =========================
  // FOOTER
  // =========================
  doc.setFontSize(8);
  doc.text(
    "Generated by Alfajri - Sistem Rukyat Observatorium",
    15,
    285
  );

  doc.save("laporan-rukyat-alfajri.pdf");
};
