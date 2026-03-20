/**
 * copypdf.js — Copy to clipboard & PDF export
 * Al-Fajri v2.1
 */
'use strict';

function _copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.innerHTML;
    btn.innerHTML = '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Tersalin!';
    btn.classList.add('ok');
    setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('ok'); }, 2200);
  }).catch(() => alert('Gagal menyalin. Izinkan akses clipboard.'));
}

function copyHilal(btn) {
  const text = document.getElementById('hilalOut').innerText;
  if (!text || text.startsWith('Klik')) return alert('Hitung hilal terlebih dahulu.');
  _copyText(text, btn);
}
function copySholat(btn) {
  const p = _pCache.result; if (!p) return;
  const now = new Date();
  _copyText([
    'JADWAL WAKTU SHOLAT','Al-Fajri — Lembaga Falakiyah PCNU Kencong','',
    `Markaz  : ${document.getElementById('inpMarkaz').value}`,
    `Lintang : ${LAT.toFixed(6)}°`, `Bujur   : ${LNG.toFixed(6)}°`,
    `Tanggal : ${now.toLocaleDateString('id-ID',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}`, '',
    `Imsak   : ${p.imsak}`, `Subuh   : ${p.fajr}`, `Syuruq  : ${p.syuruq}`,
    `Dzuhur  : ${p.dhuhr}`, `Ashar   : ${p.ashr}`, `Maghrib : ${p.maghrib}`, `Isya'   : ${p.isya}`, '',
    `Deklinasi: ${p.dec.toFixed(4)}° | EqT: ${p.eqt.toFixed(2)} mnt`
  ].join('\n'), btn);
}
function copyImsak(btn) {
  const rows = document.querySelectorAll('#imsakTable tr'); if (!rows.length) return;
  const lines = ['JADWAL IMSAKIYAH','Al-Fajri — Lembaga Falakiyah PCNU Kencong','',
    document.getElementById('imsakTtl').textContent, ''];
  rows.forEach(r => lines.push(Array.from(r.querySelectorAll('th,td')).map(c=>c.textContent.padEnd(10)).join(' | ')));
  _copyText(lines.join('\n'), btn);
}
function copyEph(btn) {
  const rows = document.querySelectorAll('#ephTable tr'); if (!rows.length) return;
  const now = new Date();
  const lines = ['DATA EPHEMERIS MATAHARI & BULAN','Al-Fajri — Lembaga Falakiyah PCNU Kencong','',
    `Tanggal: ${now.toLocaleDateString('id-ID',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}`,
    `Markaz : ${document.getElementById('inpMarkaz').value}`, ''];
  rows.forEach(r => lines.push(Array.from(r.querySelectorAll('th,td')).map((c,i)=>c.textContent.padEnd(i===0?44:24)).join('')));
  _copyText(lines.join('\n'), btn);
}
function printHilal() {
  const w = window.open('','_blank');
  w.document.write(`<!DOCTYPE html><html><body><pre style="font-family:monospace;font-size:11px;padding:20px;white-space:pre-wrap">${document.getElementById('hilalOut').innerText}</pre></body></html>`);
  w.print(); w.close();
}

// ── PDF helpers ───────────────────────────────────
function _pdfHdr(doc, title, sub) {
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(8,12,22); doc.rect(0,0,W,42,'F');
  doc.setFontSize(15); doc.setTextColor(230,196,106); doc.setFont('helvetica','bold');
  doc.text('AL-FAJRI', W/2, 13, {align:'center'});
  doc.setFontSize(7.5); doc.setTextColor(160,150,130); doc.setFont('helvetica','normal');
  doc.text('Lembaga Falakiyah PCNU Kencong', W/2, 20, {align:'center'});
  doc.setFontSize(10); doc.setTextColor(215,205,180); doc.setFont('helvetica','bold');
  doc.text(title, W/2, 30, {align:'center'});
  if (sub) { doc.setFontSize(7); doc.setFont('helvetica','normal'); doc.setTextColor(110,100,85); doc.text(sub, W/2, 37, {align:'center'}); }
  doc.setDrawColor(180,140,60); doc.setLineWidth(0.35); doc.line(10,43,W-10,43);
  return 49;
}
function _pdfFtr(doc) {
  const W=doc.internal.pageSize.getWidth(), H=doc.internal.pageSize.getHeight();
  doc.setDrawColor(50,45,35); doc.setLineWidth(0.25); doc.line(10,H-12,W-10,H-12);
  doc.setFontSize(6.5); doc.setTextColor(85,80,65); doc.setFont('helvetica','normal');
  doc.text('Al-Fajri v2.1 — Jean Meeus Astronomical Algorithms — Lembaga Falakiyah PCNU Kencong', W/2, H-6, {align:'center'});
}

function exportHilalPDF() {
  const raw = document.getElementById('hilalOut').innerText;
  if (!raw || raw.startsWith('Klik')) return alert('Hitung hilal terlebih dahulu.');
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF({orientation:'p',unit:'mm',format:'a4'});
  const W = doc.internal.pageSize.getWidth();
  let y = _pdfHdr(doc, 'LAPORAN HISAB AWAL BULAN HIJRIYAH', document.getElementById('inpMarkaz').value);
  doc.setFont('courier','normal');
  raw.split('\n').forEach(line => {
    if (y > 273) { doc.addPage(); y = _pdfHdr(doc,'(lanjutan)',''); _pdfFtr(doc); }
    const t = line.trim();
    if (t.startsWith('──')) {
      doc.setFontSize(7.5); doc.setTextColor(200,164,74); doc.setFont('courier','bold');
      doc.text(line, 13, y); y+=4.5;
    } else if (t.startsWith('═')) {
      doc.setDrawColor(55,50,40); doc.setLineWidth(0.15); doc.line(13,y-1,W-13,y-1); y+=2;
    } else if (line.includes(':')) {
      const ci=line.indexOf(':'), key=line.substring(0,ci+1), val=line.substring(ci+1).trim();
      doc.setFontSize(7.5); doc.setFont('courier','normal'); doc.setTextColor(100,92,78);
      doc.text(key, 13, y);
      const vc = val.includes('VISIBLE')||val.includes('✓') ? [82,184,130]
               : val.includes('Not Visible')||val.includes('✗') ? [216,92,92] : [205,195,170];
      doc.setTextColor(...vc); doc.setFont('courier','bold');
      doc.text(val, 13+doc.getTextWidth(key)+0.5, y);
      doc.setFont('courier','normal'); y+=4.3;
    } else if (t) { doc.setFontSize(7); doc.setTextColor(95,88,75); doc.text(line,13,y); y+=3.8; }
    else y+=1.8;
  });
  _pdfFtr(doc);
  const hm = +document.getElementById('hilalMonth').value;
  doc.save(`alfajri-hilal-${HM[hm-1].replace(/['\s]/g,'').toLowerCase()}-${document.getElementById('hilalYear').value}.pdf`);
}

function exportSholatPDF() {
  const {jsPDF}=window.jspdf, p=_pCache.result; if(!p) return;
  const doc=new jsPDF({orientation:'p',unit:'mm',format:'a4'});
  const now=new Date(), W=doc.internal.pageSize.getWidth();
  const hij=jdH(jd(now.getFullYear(),now.getMonth()+1,now.getDate()));
  let y=_pdfHdr(doc,'JADWAL WAKTU SHOLAT',now.toLocaleDateString('id-ID',{weekday:'long',year:'numeric',month:'long',day:'numeric'}));
  doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(155,145,120);
  doc.text(`${document.getElementById('inpMarkaz').value}  |  ${LAT.toFixed(4)}°, ${LNG.toFixed(4)}°  |  UTC+${TZ}`, W/2, y, {align:'center'}); y+=5;
  doc.text(`${hij.day} ${HM[hij.month-1]} ${hij.year} H`, W/2, y, {align:'center'}); y+=9;
  const prs=[{n:'Imsak',t:p.imsak},{n:'Subuh',t:p.fajr},{n:'Syuruq',t:p.syuruq},{n:'Dzuhur',t:p.dhuhr},{n:'Ashar',t:p.ashr},{n:'Maghrib',t:p.maghrib},{n:"Isya'",t:p.isya}];
  const cols=4, bW=(W-28)/cols, bH=18, sX=14;
  prs.forEach((pr,i) => {
    const bx=sX+(i%cols)*bW, by=y+Math.floor(i/cols)*(bH+3);
    doc.setFillColor(14,20,38); doc.setDrawColor(55,45,15); doc.setLineWidth(0.35); doc.roundedRect(bx,by,bW-2,bH,2,2,'FD');
    doc.setFontSize(6.5); doc.setTextColor(110,100,80); doc.setFont('helvetica','normal'); doc.text(pr.n, bx+(bW-2)/2, by+5, {align:'center'});
    doc.setFontSize(13); doc.setTextColor(228,196,106); doc.setFont('helvetica','bold'); doc.text(pr.t, bx+(bW-2)/2, by+13, {align:'center'});
  });
  y+=Math.ceil(prs.length/cols)*(bH+3)+8;
  doc.setDrawColor(55,50,40); doc.setLineWidth(0.25); doc.line(14,y,W-14,y); y+=5;
  doc.setFontSize(7.5); doc.setFont('helvetica','normal'); doc.setTextColor(130,120,100);
  doc.text(`Deklinasi: ${p.dec.toFixed(4)}°   |   EqT: ${p.eqt.toFixed(4)} mnt   |   Kulminasi: ${fmtHM(p.noonRaw)}`, W/2, y, {align:'center'});
  _pdfFtr(doc);
  doc.save(`alfajri-sholat-${now.toISOString().slice(0,10)}.pdf`);
}

function exportImsakPDF() {
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF({orientation:'l',unit:'mm',format:'a4'});
  const now=new Date();
  let y=_pdfHdr(doc,'JADWAL IMSAKIYAH — '+document.getElementById('imsakTtl').textContent.toUpperCase(), document.getElementById('imsakSub').textContent);
  const rows=document.querySelectorAll('#imsakTable tr'), head=[], body=[];
  rows.forEach((r,i)=>{const c=Array.from(r.querySelectorAll('th,td')).map(x=>x.textContent);if(i===0)head.push(c);else body.push(c);});
  doc.autoTable({head,body,startY:y,margin:{left:8,right:8},
    styles:{fontSize:8,cellPadding:2.5,font:'helvetica',textColor:[195,185,160],fillColor:[11,15,26],lineColor:[48,40,18],lineWidth:0.18},
    headStyles:{fillColor:[18,26,48],textColor:[200,164,74],fontStyle:'bold',fontSize:7.5},
    alternateRowStyles:{fillColor:[14,20,35]},
    didParseCell:d=>{if(d.row.element&&d.row.element.classList.contains('today-row'))d.cell.styles.textColor=[228,196,106];}
  });
  _pdfFtr(doc);
  doc.save(`alfajri-imsakiyah-${now.getFullYear()}-${pZ(now.getMonth()+1)}.pdf`);
}

function exportEphPDF() {
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF({orientation:'p',unit:'mm',format:'a4'});
  const now=new Date();
  let y=_pdfHdr(doc,'DATA EPHEMERIS MATAHARI & BULAN',
    now.toLocaleDateString('id-ID',{weekday:'long',year:'numeric',month:'long',day:'numeric'})+'  |  '+document.getElementById('inpMarkaz').value);
  const rows=document.querySelectorAll('#ephTable tr'), head=[], body=[];
  rows.forEach((r,i)=>{const c=Array.from(r.querySelectorAll('th,td')).map(x=>x.textContent);if(i===0)head.push(c);else body.push(c);});
  doc.autoTable({head,body,startY:y,margin:{left:14,right:14},
    styles:{fontSize:8.5,cellPadding:3,font:'helvetica',textColor:[195,185,160],fillColor:[11,15,26],lineColor:[48,40,18],lineWidth:0.18},
    headStyles:{fillColor:[18,26,48],textColor:[200,164,74],fontStyle:'bold'},
    alternateRowStyles:{fillColor:[14,20,35]},
    columnStyles:{0:{fontStyle:'bold',textColor:[215,205,180],cellWidth:72}}
  });
  _pdfFtr(doc);
  doc.save(`alfajri-ephemeris-${now.toISOString().slice(0,10)}.pdf`);
}
