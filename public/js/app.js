import { calculateHilal } from "./engine/hilal.js";

let last = null;

// ========================
// MAIN RUN
// ========================
window.run = () => {
  const lat = -8.28;      // Gunungsari (default)
  const lon = 113.38;
  const tz = 7;

  const date = new Date();

  // 🔭 HITUNG HILAL (ENGINE BARU)
  last = calculateHilal(date, lat, lon, tz);

  // 📊 OUTPUT DETAIL
  document.getElementById("out").textContent = `
🌙 HASIL HISAB HILAL

JD           : ${last.JD}
DeltaT       : ${last.deltaT} s
Sunset       : ${last.sunset}

Altitude Sun : ${last.sunAltitude?.toFixed(2)}°
Azimuth Sun  : ${last.sunAzimuth?.toFixed(2)}°

Altitude Moon: ${last.moonAltitude?.toFixed(2)}°
Azimuth Moon : ${last.moonAzimuth?.toFixed(2)}°

Elongasi     : ${last.elongation?.toFixed(2)}°
`;
};

// ========================
// EXPORT PDF (UPGRADED)
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
    y += 8;
  };

  // HEADER RESMI
  doc.setFontSize(14);
  doc.text("LAPORAN RUKYAT HILAL", 105, y, { align: "center" });
  y += 8;

  doc.setFontSize(10);
  doc.text("LEMBAGA FALAKIYAH PCNU KENCONG", 105, y, { align: "center" });
  y += 10;

  // DATA
  add(`JD           : ${last.JD}`);
  add(`DeltaT       : ${last.deltaT} s`);
  add(`Sunset       : ${last.sunset}`);

  add(`Altitude Sun : ${last.sunAltitude?.toFixed(2)}°`);
  add(`Azimuth Sun  : ${last.sunAzimuth?.toFixed(2)}°`);

  add(`Altitude Moon: ${last.moonAltitude?.toFixed(2)}°`);
  add(`Azimuth Moon : ${last.moonAzimuth?.toFixed(2)}°`);

  add(`Elongasi     : ${last.elongation?.toFixed(2)}°`);

  y += 10;

  // KESIMPULAN
  const visible =
    last.moonAltitude > 3 && last.elongation > 6.4;

  add(`KESIMPULAN: ${visible ? "LAYAK (MABIMS)" : "BELUM LAYAK"}`);

  doc.save("laporan-rukyat.pdf");
};
