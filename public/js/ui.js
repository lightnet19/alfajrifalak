/**
 * ui.js — Render semua panel: Hijri, Bulan, Kiblat, Konversi, Imsakiyah, Ephemeris
 * Al-Fajri v2.3.4 | Lembaga Falakiyah PCNU Kencong
 * Depends on: math.js, astro.js, prayer.js
 *
 * CHANGELOG:
 *  v2.3.4 (2026-04-15):
 *   - Restore missing global constants (HM, HM_AR, pZ) from UI refactoring
 *  v2.3.2 (2026-04-15):
 *   - Tambah kolom Dhuha ke tabel Imsakiyah
 */
'use strict';

const pZ = n => n.toString().padStart(2, '0');
const HM = ['Muharram', 'Safar', 'Rabi\'ul Awal', 'Rabi\'ul Akhir', 'Jumadil Ula', 'Jumadil Akhira', 'Rajab', 'Sya\'ban', 'Ramadhan', 'Syawal', 'Dzulqa\'dah', 'Dzulhijjah'];
const HM_AR = ['مُحَرَّم', 'صَفَر', 'رَبِيع الْأَوَّل', 'رَبِيع الْآخِر', 'جُمَادَى الْأُولَى', 'جُمَادَى الْآخِرَة', 'رَجَب', 'شَعْبَان', 'رَمَضَان', 'شَوَّال', 'ذُو الْقَعْدَة', 'ذُو الْحِجَّة'];

// ── HIJRI ──────────────────────────────────────────────
function renderHijri() {
  const now = new Date();
  const j0  = jd(now.getFullYear(), now.getMonth()+1, now.getDate());
  const h   = jdToHijri(j0);
  
  const hijriDisp = document.getElementById('hijriDisp');
  if (hijriDisp) {
    hijriDisp.innerHTML =
      `<div class="hday">${h.day}</div>`+
      `<div class="hmon">${HM_AR[h.month-1]}</div>`+
      `<div class="hyr">${HM[h.month-1]} ${h.year} H</div>`+
      `<div class="hgreg">${now.toLocaleDateString('id-ID',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>`;
  }

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
  
  const hijriCal = document.getElementById('hijriCal');
  if (hijriCal) hijriCal.innerHTML = cal + '</div>';
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
  const moonPN = document.getElementById('moonPN');
  if (moonPN) moonPN.textContent = names[Math.floor((cycPos + 0.0625) * 8) % 8];
  
  const moonIl = document.getElementById('moonIl');
  if (moonIl) moonIl.textContent = `Iluminasi: ${illum} %`;
  
  const moonAg = document.getElementById('moonAg');
  if (moonAg) moonAg.textContent = `Umur Bulan: ${age.toFixed(1)} hari`;
  
  const moonBF = document.getElementById('moonBF');
  if (moonBF) moonBF.style.width = cycPos * 100 + '%';
  
  const canvas = document.getElementById('moonCanvas');
  if (canvas) _drawMoon(canvas, cycPos);

  // Fase mendatang
  const icons = ['🌑','🌓','🌕','🌗'], phNames = ['Bulan Baru','Kuartal I','Purnama','Kuartal III'];
  const off   = [0, 7.38221, 14.7653, 22.1282];
  const ev = [];
  for (let k = k0; k <= k0+3 && ev.length < 4; k++)
    for (let f = 0; f < 4 && ev.length < 4; f++) {
      const jde = newMoonJDE(k) + off[f];
      if (jde > j0) { const d = jdG(jde); ev.push({ icon:icons[f], name:phNames[f], date:`${d.day}/${d.month}/${d.year}` }); }
    }
  
  const moonFut = document.getElementById('moonFut');
  if (moonFut) {
    moonFut.innerHTML = ev.map(e =>
      `<div class="pi"><div style="font-size:1.5rem;margin-bottom:5px">${e.icon}</div>`+
      `<div class="pi-name">${e.name}</div>`+
      `<div style="font-family:'Cormorant Garamond',serif;font-size:.98rem;color:var(--gold2);margin-top:6px">${e.date}</div></div>`).join('');
  }
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

// ── KIBLAT & LIVE KOMPAS ────────────────────────────────
let qiblaAzimuth = 0;
let isCompassActive = false;

function renderQibla() {
  const kLat=21.4225, kLng=39.8262, dLng=(kLng-LNG)*D2R;
  const y2 = Math.sin(dLng)*Math.cos(kLat*D2R);
  const x2 = Math.cos(LAT*D2R)*Math.sin(kLat*D2R) - Math.sin(LAT*D2R)*Math.cos(kLat*D2R)*Math.cos(dLng);
  qiblaAzimuth = fix(Math.atan2(y2, x2) * R2D);
  const dLat=(kLat-LAT)*D2R, dL2=(kLng-LNG)*D2R;
  const a = Math.sin(dLat/2)**2 + Math.cos(LAT*D2R)*Math.cos(kLat*D2R)*Math.sin(dL2/2)**2;
  const dist = Math.round(2 * 6371 * Math.asin(Math.sqrt(a)));
  const dirs = ['U','UBL','BL','BBL','B','BSD','SD','SSD','S','STG','TG','TTG','T','TLR','LR','ULR'];
  
  if (!isCompassActive) {
    const cpN = document.getElementById('cpN');
    if (cpN) cpN.style.transform = `rotate(${qiblaAzimuth}deg)`;
    const cvDial = document.getElementById('compassDial');
    if (cvDial) cvDial.style.transform = `rotate(0deg)`;
  }
  
  const qAz = document.getElementById('qAz');
  if (qAz) qAz.innerHTML  = `${qiblaAzimuth.toFixed(2)}<span>° dari Utara</span>`;
  const qDir = document.getElementById('qDir');
  if (qDir) qDir.textContent  = dirs[Math.round(qiblaAzimuth/22.5)%16];
  const qDist = document.getElementById('qDist');
  if (qDist) qDist.innerHTML   = `${dist.toLocaleString('id-ID')}<span>km</span>`;
  _drawCompassTicks();
}

function _drawCompassTicks() {
  const t = document.getElementById('compassTicks');
  if (!t) return;
  if (t.children.length > 0) return;
  let h = '';
  for(let i=0; i<72; i++) {
    const deg = i*5, isM = i%9===0;
    h += `<div class="ctk ${isM?'m':''}" style="transform:rotate(${deg}deg) translateX(-50%)"></div>`;
  }
  t.innerHTML = h;
}

// Handler Kompas Live
const btnCompass = document.getElementById('btnCompass');
if (btnCompass) {
  btnCompass.addEventListener('click', async () => {
    const btn = document.getElementById('btnCompass');
    const st = document.getElementById('compassSt');
    
    if (isCompassActive) {
      isCompassActive = false;
      window.removeEventListener('deviceorientationabsolute', _handleOrientation);
      window.removeEventListener('deviceorientation', _handleOrientation);
      btn.innerHTML = '🧭 Aktifkan Kompas Live';
      if (st) st.textContent = 'Kompas dimatikan.';
      const qhr = document.getElementById('qHeadRow');
      if (qhr) qhr.style.display = 'none';
      const glow = document.getElementById('compassGlow');
      if (glow) glow.style.opacity = '0';
      renderQibla(); // reset view
      return;
    }

    // Request perizinan iOS 13+
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceMotionEvent.requestPermission();
        if (permission === 'granted') {
          _startCompass();
        } else {
          if (st) st.textContent = 'Izin akses sensor ditolak.';
        }
      } catch (e) {
        if (st) st.textContent = 'Gagal mengakses sensor.';
      }
    } else {
      _startCompass();
    }
  });
}

function _startCompass() {
  if (!window.DeviceOrientationEvent) {
    const st = document.getElementById('compassSt');
    if (st) st.textContent = 'Perangkat tidak mendukung sensor kompas.';
    return;
  }
  isCompassActive = true;
  document.getElementById('btnCompass').innerHTML = '⏹ Matikan Kompas';
  
  const st = document.getElementById('compassSt');
  if (st) st.textContent = 'Mengkalibrasi... Putar HP angka 8.';
  
  const qHeadRow = document.getElementById('qHeadRow');
  if (qHeadRow) qHeadRow.style.display = 'flex';
  
  // Prioritaskan event absolute
  if ('ondeviceorientationabsolute' in window) {
    window.addEventListener('deviceorientationabsolute', _handleOrientation);
  } else {
    window.addEventListener('deviceorientation', _handleOrientation);
  }
}

let lastDialDeg = 0;
function _handleOrientation(e) {
  if (!isCompassActive) return;
  let heading = null;
  const st = document.getElementById('compassSt');
  
  if (e.webkitCompassHeading) {
    // iOS
    heading = e.webkitCompassHeading;
  } else if (e.absolute && e.alpha !== null) {
    // Android
    heading = 360 - e.alpha;
  }
  
  if (heading !== null) {
    if (st) st.textContent = 'Kompas Aktif & Akurat';
    
    const qh = document.getElementById('qHead');
    if (qh) qh.innerHTML = `${heading.toFixed(1)}<span>°</span>`;
    
    const chl = document.getElementById('compassHeadLbl');
    if (chl) chl.textContent = `${Math.round(heading)}°`;
    
    // Perhitungan putaran dial agar mulus tanpa glitch 360->0
    let dialRot = -heading;
    const diff = dialRot - lastDialDeg;
    if (diff > 180) dialRot -= 360;
    else if (diff < -180) dialRot += 360;
    lastDialDeg = dialRot;
    
    const cDial = document.getElementById('compassDial');
    if (cDial) cDial.style.transform = `rotate(${dialRot}deg)`;
    
    const cpN = document.getElementById('cpN');
    if (cpN) cpN.style.transform = `rotate(${qiblaAzimuth}deg)`;
    
    // Deteksi alignment kiblat
    const diffQ = Math.abs((heading + qiblaAzimuth) % 360 - 360) % 360;
    const diffAbs = Math.min(diffQ, 360 - diffQ);
    const glow = document.getElementById('compassGlow');
    
    if (glow) {
      if (diffAbs < 3) {
        glow.style.opacity = '1';
        glow.style.boxShadow = '0 0 40px var(--green), inset 0 0 20px var(--green)';
        if ("vibrate" in navigator && diffAbs < 1) navigator.vibrate(50);
      } else if (diffAbs < 10) {
        glow.style.opacity = '0.5';
        glow.style.boxShadow = '0 0 20px var(--gold2), inset 0 0 10px var(--gold2)';
      } else {
        glow.style.opacity = '0';
      }
    }
  } else {
    if (st) st.textContent = 'Menunggu data sensor kompas...';
  }
}

// ── KONVERSI TANGGAL ──────────────────────────────────
function renderKonversi() {
  const now = new Date(), y=now.getFullYear(), m=now.getMonth()+1, d=now.getDate();
  const convM = document.getElementById('convM');
  if (convM) {
    convM.value = `${y}-${pZ(m)}-${pZ(d)}`;
    convM.oninput = _convM2H;
  }
  const todayJD = document.getElementById('todayJD');
  if (todayJD) todayJD.textContent = jd(y,m,d).toFixed(5);
  
  _convM2H();
  
  const cHD = document.getElementById('convHD');
  if (cHD) cHD.oninput = _convH2M;
  const cHMo = document.getElementById('convHMo');
  if (cHMo) cHMo.onchange = _convH2M;
  const cHY = document.getElementById('convHY');
  if (cHY) cHY.oninput = _convH2M;
  
  const convJD = document.getElementById('convJD');
  if (convJD) {
    convJD.oninput = () => {
      const v = +document.getElementById('convJD').value; if (!v) return;
      const g = jdG(v);
      const cR = document.getElementById('convJDR');
      if (cR) cR.textContent =
        new Date(g.year,g.month-1,g.day).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})
        +` ${pZ(g.hour)}:${pZ(g.minute)} UT`;
    };
  }
}
function _convM2H() {
  const cM = document.getElementById('convM');
  if (!cM) return;
  const v = cM.value; if (!v) return;
  const [y,m,d] = v.split('-').map(Number), h = jdToHijri(jd(y,m,d));
  
  const hr = document.getElementById('convHR');
  if (hr) hr.textContent = `${h.day} ${HM[h.month-1]} ${h.year} H`;
  const har = document.getElementById('convHAr');
  if (har) har.textContent = `${h.day} ${HM_AR[h.month-1]} ${h.year}`;
}
function _convH2M() {
  const dNode = document.getElementById('convHD');
  const mNode = document.getElementById('convHMo');
  const yNode = document.getElementById('convHY');
  if (!dNode || !mNode || !yNode) return;
  
  const d=+dNode.value, m=+mNode.value, y=+yNode.value;
  if (!d||!m||!y) return;
  const g = jdG(hijriToJD(y,m,d));
  
  const mr = document.getElementById('convMR');
  if (mr) mr.textContent =
    new Date(g.year,g.month-1,g.day).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
}

// ── IMSAKIYAH ────────────────────────────────────────
function renderImsakiyah() {
  const now=new Date(), y=now.getFullYear(), mo=now.getMonth()+1;
  const dInMonth = new Date(y, mo, 0).getDate();
  const hFirst   = jdToHijri(jd(y, mo, 1));
  
  const it = document.getElementById('imsakTtl');
  if (it) it.textContent = now.toLocaleDateString('id-ID',{month:'long',year:'numeric'});
  
  const is = document.getElementById('imsakSub');
  if (is) {
    const markaz = document.getElementById('inpMarkaz') ? document.getElementById('inpMarkaz').value : '';
    is.textContent = `${HM[hFirst.month-1]} ${hFirst.year} H | ${markaz}`;
  }
  
  const tbl = document.getElementById('imsakTable');
  if (!tbl) return;
  
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
  tbl.innerHTML = html + '</tbody>';
}

// ── EPHEMERIS ────────────────────────────────────────
function renderEphemeris() {
  const tbl = document.getElementById('ephTable');
  if (!tbl) return;

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
  tbl.innerHTML = html + '</tbody>';
}

// ── Master render ─────────────────────────────────────
function renderAll() {
  try { renderPrayer(); } catch (e) {}
  try { renderHijri(); } catch (e) {}
  try { renderMoon(); } catch (e) {}
  try { renderQibla(); } catch (e) {}
  try { renderKonversi(); } catch (e) {}
  try { renderImsakiyah(); } catch (e) {}
  try { renderEphemeris(); } catch (e) {}
}