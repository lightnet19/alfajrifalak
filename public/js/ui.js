/**
 * ui.js — Render semua panel: Hijri, Bulan, Kiblat, Konversi, Imsakiyah, Ephemeris
 * Al-Fajri v2.3.2 | Lembaga Falakiyah PCNU Kencong
 * Depends on: math.js, astro.js, prayer.js
 *
 * CHANGELOG:
 *  v2.3.2 (2026-04-15):
 *   - Tambah kolom Dhuha ke tabel Imsakiyah
 */
'use strict';

// ── HIJRI ──────────────────────────────────────────────
function renderHijri() {
  const now = new Date();
  const j0  = jd(now.getFullYear(), now.getMonth()+1, now.getDate());
  const h   = jdToHijri(j0);
  document.getElementById('hijriDisp').innerHTML =
    `<div class="hday">${h.day}</div>`+
    `<div class="hmon">${HM_AR[h.month-1]}</div>`+
    `<div class="hyr">${HM[h.month-1]} ${h.year} H</div>`+
    `<div class="hgreg">${now.toLocaleDateString('id-ID',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>`;

  // Kalender grid
  const firstJD   = hijriToJD(h.year, h.month, 1);
  const firstGreg = jdG(firstJD);
  const wd    = new Date(firstGreg.year, firstGreg.month-1, firstGreg.day).getDay();
  const total = (h.month % 2===1 || (h.month===12 && isHLeap(h.year))) ? 30 : 29;
  let cal = `<div style="font-family:'Cormorant Garamond',serif;font-size:1.05rem;color:var(--gold2);text-align:center;margin-bottom:9px">`+
            `${HM[h.month-1]} ${h.year} H</div><div class="cal-g">`;
  ['Ahd','Sen','Sel','Rab','Kam','Jum','Sab'].forEach(d => cal += `<div class="cal-h">${d}</div>`);
  for (let i = 0; i < wd; i++) cal += `<div></div>`;
  for (let d = 1; d <= total; d++) cal += `<div class="cal-c ${d===h.day?'td':''}">${d}</div>`;
  document.getElementById('hijriCal').innerHTML = cal + '</div>';
}

// ── BULAN (FASE) ──────────────────────────────────────
function renderMoon() {
  const now = new Date();
  const j0  = jd(now.getFullYear(), now.getMonth()+1, now.getDate(), now.getHours(), now.getMinutes());
  const k0  = Math.floor((j0 - 2451550.1) / 29.53058853);
  let latest = 0;
  for (let k = k0-1; k <= k0+2; k++) {
    const nm = newMoonJDE(k); if (nm <= j0 && nm > latest) latest = nm;
  }
  const age    = j0 - latest;
  const cycle  = age / 29.53058853;
  const illum  = Math.round((1 - Math.cos(cycle * 2 * Math.PI)) / 2 * 1000) / 10;
  const names  = ['Bulan Baru','Sabit Awal','Kuartal Pertama','Cembung Awal',
                  'Purnama','Cembung Akhir','Kuartal Akhir','Sabit Akhir'];
  const cycPos = cycle % 1;
  document.getElementById('moonPN').textContent = names[Math.floor((cycPos + 0.0625) * 8) % 8];
  document.getElementById('moonIl').textContent = `Iluminasi: ${illum} %`;
  document.getElementById('moonAg').textContent = `Umur Bulan: ${age.toFixed(1)} hari`;
  document.getElementById('moonBF').style.width = cycPos * 100 + '%';
  _drawMoon(document.getElementById('moonCanvas'), cycPos);

  // Fase mendatang
  const icons = ['🌑','🌓','🌕','🌗'], phNames = ['Bulan Baru','Kuartal I','Purnama','Kuartal III'];
  const off   = [0, 7.38221, 14.7653, 22.1282];
  const ev = [];
  for (let k = k0; k <= k0+3 && ev.length < 4; k++)
    for (let f = 0; f < 4 && ev.length < 4; f++) {
      const jde = newMoonJDE(k) + off[f];
      if (jde > j0) { const d = jdG(jde); ev.push({ icon:icons[f], name:phNames[f], date:`${d.day}/${d.month}/${d.year}` }); }
    }
  document.getElementById('moonFut').innerHTML = ev.map(e =>
    `<div class="pi"><div style="font-size:1.5rem;margin-bottom:5px">${e.icon}</div>`+
    `<div class="pi-name">${e.name}</div>`+
    `<div style="font-family:'Cormorant Garamond',serif;font-size:.98rem;color:var(--gold2);margin-top:6px">${e.date}</div></div>`).join('');
}

function _drawMoon(canvas, p) {
  const ctx = canvas.getContext('2d'), W = canvas.width, cx=W/2, cy=W/2, r=W/2-3;
  ctx.clearRect(0,0,W,W);
  ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fillStyle='#0b0f1a'; ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.clip();
  const g = ctx.createRadialGradient(cx,cy,r*.1,cx,cy,r);
  g.addColorStop(0,'rgba(255,242,190,.97)'); g.addColorStop(.7,'rgba(215,185,115,.85)'); g.addColorStop(1,'rgba(155,125,65,.55)');
  if (p < 0.5) {
    const xt = cx+r*(1-4*p)*(p<0.25?1:-1);
    ctx.beginPath(); ctx.arc(cx,cy,r,-Math.PI/2,Math.PI/2);
    ctx.bezierCurveTo(xt,cy+r,xt,cy-r,cx,cy-r); ctx.closePath();
    ctx.fillStyle=g; ctx.fill();
  } else {
    const p2=p-.5, xt=cx+r*(1-4*p2)*(p2<0.25?-1:1);
    ctx.beginPath(); ctx.arc(cx,cy,r,Math.PI/2,-Math.PI/2);

ctx.bezierCurveTo(xt,cy-r,xt,cy+r,cx,cy+r); ctx.closePath();
    ctx.fillStyle=g; ctx.fill();
  }
  ctx.restore();
  ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
  ctx.strokeStyle='rgba(200,164,74,.3)'; ctx.lineWidth=1.5; ctx.stroke();
}

// ── KIBLAT ────────────────────────────────────────────
function renderQibla() {
  const kLat=21.4225, kLng=39.8262, dLng=(kLng-LNG)*D2R;
  const y2 = Math.sin(dLng)*Math.cos(kLat*D2R);
  const x2 = Math.cos(LAT*D2R)*Math.sin(kLat*D2R) - Math.sin(LAT*D2R)*Math.cos(kLat*D2R)*Math.cos(dLng);
  const az  = fix(Math.atan2(y2, x2) * R2D);
  const dLat=(kLat-LAT)*D2R, dL2=(kLng-LNG)*D2R;
  const a = Math.sin(dLat/2)**2 + Math.cos(LAT*D2R)*Math.cos(kLat*D2R)*Math.sin(dL2/2)**2;
  const dist = Math.round(2 * 6371 * Math.asin(Math.sqrt(a)));
  const dirs = ['U','UBL','BL','BBL','B','BSD','SD','SSD','S','STG','TG','TTG','T','TLR','LR','ULR'];
  document.getElementById('cpN').style.transform = `rotate(${az}deg)`;
  document.getElementById('qAz').innerHTML  = `${az.toFixed(2)}<span>° dari Utara</span>`;
  document.getElementById('qDir').textContent  = dirs[Math.round(az/22.5)%16];
  document.getElementById('qDist').innerHTML   = `${dist.toLocaleString('id-ID')}<span>km</span>`;
}

// ── KONVERSI TANGGAL ──────────────────────────────────
function renderKonversi() {
  const now = new Date(), y=now.getFullYear(), m=now.getMonth()+1, d=now.getDate();
  document.getElementById('convM').value     = `${y}-${pZ(m)}-${pZ(d)}`;
  document.getElementById('todayJD').textContent = jd(y,m,d).toFixed(5);
  _convM2H();
  document.getElementById('convM').oninput    = _convM2H;
  document.getElementById('convHD').oninput   = _convH2M;
  document.getElementById('convHMo').onchange = _convH2M;
  document.getElementById('convHY').oninput   = _convH2M;
  document.getElementById('convJD').oninput   = () => {
    const v = +document.getElementById('convJD').value; if (!v) return;
    const g = jdG(v);
    document.getElementById('convJDR').textContent =
      new Date(g.year,g.month-1,g.day).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})
      +` ${pZ(g.hour)}:${pZ(g.minute)} UT`;
  };
}
function _convM2H() {
  const v = document.getElementById('convM').value; if (!v) return;
  const [y,m,d] = v.split('-').map(Number), h = jdToHijri(jd(y,m,d));
  document.getElementById('convHR').textContent  = `${h.day} ${HM[h.month-1]} ${h.year} H`;
  document.getElementById('convHAr').textContent = `${h.day} ${HM_AR[h.month-1]} ${h.year}`;
}
function _convH2M() {
  const d=+document.getElementById('convHD').value, m=+document.getElementById('convHMo').value, y=+document.getElementById('convHY').value;
  if (!d||!m||!y) return;
  const g = jdG(hijriToJD(y,m,d));
  document.getElementById('convMR').textContent =
    new Date(g.year,g.month-1,g.day).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
}

// ── IMSAKIYAH ────────────────────────────────────────
function renderImsakiyah() {
  const now=new Date(), y=now.getFullYear(), mo=now.getMonth()+1;
  const dInMonth = new Date(y, mo, 0).getDate();
  const hFirst   = jdToHijri(jd(y, mo, 1));
  document.getElementById('imsakTtl').textContent = now.toLocaleDateString('id-ID',{month:'long',year:'numeric'});
  document.getElementById('imsakSub').textContent =
    `${HM[hFirst.month-1]} ${hFirst.year} H | ${document.getElementById('inpMarkaz').value}`;
  // Kolom: Tgl | Hijri | Imsak | Subuh | Syuruq | Dhuha | Dzuhur | Ashar | Maghrib | Isya
  let html = `<thead><tr><th class="kc">Tgl</th><th class="kc">Hijri</th>`+
             `<th>Imsak</th><th>Subuh</th><th>Syuruq</th><th>Dhuha</th><th>Dzuhur</th>`+
             `<th>Ashar</th><th>Maghrib</th><th>Isya</th></tr></thead><tbody>`;
  for (let day = 1; day <= dInMonth; day++) {
    const p = prayerTimes(y, mo, day, LAT, LNG, TZ, ELEV);
    const h = jdToHijri(jd(y, mo, day));
    html += `<tr class="${day===now.getDate()?'today-row':''}">`+
      `<td class="kc">${pZ(day)}/${pZ(mo)}</td><td class="kc">${h.day} ${HM[h.month-1].slice(0,5)}</td>`+
      `<td>${p.imsak}</td><td>${p.fajr}</td><td>${p.syuruq}</td><td>${p.dhuha}</td>`+
      `<td>${p.dhuhr}</td><td>${p.ashr}</td><td>${p.maghrib}</td><td>${p.isya}</td></tr>`;
  }
  document.getElementById('imsakTable').innerHTML = html + '</tbody>';
}

// ── EPHEMERIS ────────────────────────────────────────
function renderEphemeris() {
  const now = new Date();
  const j0  = jd(now.getFullYear(), now.getMonth()+1, now.getDate(), now.getHours()-TZ, now.getMinutes());
  const s = sunPos(j0), m = moonPos(j0), T = (j0 - 2451545) / 36525;
  const rows = [
    ['Bujur Ekliptika (λ)',    fix(s.sunLon).toFixed(6)+'°',  m.lon.toFixed(6)+'°'],
    ['Lintang Ekliptika (β)', '—',                             m.lat.toFixed(6)+'°'],
    ['Asensio Rekta (AR)',     s.RA.toFixed(6)+'°',            m.RA.toFixed(6)+'°'],
    ['Deklinasi (δ)',          s.Dec.toFixed(6)+'°',           m.Dec.toFixed(6)+'°'],
    ['Persamaan Waktu (EqT)', s.EqT.toFixed(6)+' mnt',        '—'],
    ['Jarak Bumi',            s.dist.toFixed(8)+' AU',         m.dist.toFixed(3)+' km'],
    ['Semidiameter',          s.SD.toFixed(6)+'°',             m.SD.toFixed(6)+'°'],
    ['Horizontal Parallax',   s.HP.toFixed(6)+'°',             m.HP.toFixed(6)+'°'],
    ['Miring Ekliptika (ε)',  obliquity(T).toFixed(6)+'°',    '—'],
    ['Julian Day (UT)',        j0.toFixed(6),                  ''],
  ];
  let html = `<thead><tr><th class="kc">Parameter</th><th>☀ Matahari</th><th>🌙 Bulan</th></tr></thead><tbody>`;
  rows.forEach(r => html += `<tr><td class="kc">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`);
  document.getElementById('ephTable').innerHTML = html + '</tbody>';
}

// ── Master render ─────────────────────────────────────
function renderAll() {
  renderPrayer();
  renderHijri();
  renderMoon();
  renderQibla();
  renderKonversi();
  renderImsakiyah();
  renderEphemeris();
}
