import { calculateHilal } from "./engine/hilal.js";

let last = null;

window.run = () => {
  const date = new Date();

  last = calculateHilal(date);

  document.getElementById("out").textContent =
    JSON.stringify(last, null, 2);
};

window.exportPDF = () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("LAPORAN RUKYAT HILAL", 20, 20);

  if (last) {
    doc.text("JD: " + last.JD, 20, 30);
    doc.text("DeltaT: " + last.deltaT, 20, 40);
    doc.text("Elongasi: " + last.elongation, 20, 50);
    doc.text(
      "Illuminasi: " +
        (last.illumination * 100).toFixed(2) +
        "%",
      20,
      60
    );
  }

  doc.save("rukyat.pdf");
};
