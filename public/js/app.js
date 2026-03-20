
import { calc } from "./engine.js";

let last=null;

window.run = ()=>{
  last = calc();
  document.getElementById("out").textContent = JSON.stringify(last,null,2);
}

window.exportPDF = ()=>{
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("LAPORAN RUKYAT HILAL", 20,20);
  if(last){
    doc.text("Altitude: "+last.altitude,20,30);
    doc.text("Elongation: "+last.elongation,20,40);
  }
  doc.save("laporan.pdf");
}
