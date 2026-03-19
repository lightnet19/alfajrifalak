export async function exportRukyatPDF(data) {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    alert("Library PDF belum dimuat.");
    return;
  }

  const doc = new jsPDF();
  const result = data.raw;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("LAPORAN RUKYAT HILAL", 20, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Nama Aplikasi : Alfajri`, 20, 32);
  doc.text(`Kredit        : oleh Fuad Baidlowi Al-Fajri`, 20, 39);
  doc.text(`Lokasi        : ${data.location}`, 20, 46);
  doc.text(`Tanggal       : ${data.date}`, 20, 53);

  doc.setFont("helvetica", "bold");
  doc.text("Data Astronomis", 20, 67);
  doc.setFont("helvetica", "normal");
  doc.text(`Sunset            : ${formatNullable(data.sunset)} jam lokal`, 20, 74);
  doc.text(`Tinggi Hilal      : ${num(result.apparentAltitude)}°`, 20, 81);
  doc.text(`Elongasi          : ${num(result.elongation)}°`, 20, 88);
  doc.text(`Refraction        : ${num(result.refraction)}°`, 20, 95);
  doc.text(`Semi-diameter     : ${num(result.semiDiameter)}°`, 20, 102);
  doc.text(`Ijtima            : ${result.ijtima ? result.ijtima.toLocaleString() : "-"}`, 20, 109);

  doc.setFont("helvetica", "bold");
  doc.text("Analisis Visibilitas", 20, 123);
  doc.setFont("helvetica", "normal");
  doc.text(`Yallop            : ${result.yallop?.category ?? "-"}`, 20, 130);
  doc.text(`Odeh              : ${result.odeh?.category ?? "-"}`, 20, 137);
  doc.text(`Keputusan         : ${result.decision ? "Hilal Terlihat / Layak Awal Bulan" : "Belum Layak / Istikmal"}`, 20, 144);

  doc.setFontSize(9);
  doc.text("Dihasilkan oleh Alfajri — Sistem Rukyat Digital Berbasis Ilmu Falak", 20, 280);
  doc.save(`laporan-rukyat-${data.date}.pdf`);
}

function num(v) {
  return Number.isFinite(v) ? v.toFixed(2) : "-";
}
function formatNullable(v) {
  if (v == null) return "-";
  return Number.isFinite(v) ? v.toFixed(2) : String(v);
}
