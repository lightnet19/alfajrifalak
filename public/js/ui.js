/**
 * ui.js — Render semua panel: Hijri, Bulan, Kiblat, Konversi, Imsakiyah, Ephemeris
 * Al-Fajri v2.3.3 | Lembaga Falakiyah PCNU Kencong
 * Depends on: math.js, astro.js, prayer.js
 *
 * CHANGELOG:
 *  v2.3.3 (2026-05-22):
 *   - FIX: renderHijri & renderImsakiyah kini memperhitungkan konvensi
 *     kalender Hijriyah: hari baru dimulai saat Maghrib, bukan tengah malam.
 *     Jika waktu saat ini sudah melewati Maghrib, tanggal Hijriyah yang
 *     ditampilkan maju satu hari (= tanggal Hijriyah malam ini).
 *  v2.3.2 (2026-04-15):
 *   - Tambah kolom Dhuha ke tabel Imsakiyah
 */
'use strict';

// ── Helper: Tanggal Hijriyah saat ini (Maghrib-aware) ──
/**
 * Mengembalikan tanggal Hijriyah yang berlaku sekarang.
 * Konvensi Islam: hari baru dimulai saat Maghrib.
 * Jika jam saat ini >= waktu Maghrib hari ini → kembalikan Hijri untuk
 * hari Masehi BESOK (karena secara Hijriyah sudah masuk hari berikutnya).
 *
 * @returns {{ hijri, gregJD, afterMaghrib }}
 *   hijri       — objek { year, month, day } Hijriyah yang berlaku
 *   gregJD      — JD tanggal Masehi yang dipakai untuk konversi
 *   afterMaghrib — true jika waktu sekarang sudah lewat Maghrib
 */
function getCurrentHijri() {
  const now  = new Date();
  const y    = now.getFullYear(), m = now.getMonth()+1, d = now.getDate();
  const j0   = jd(y, m, d);

  // Hitung waktu Maghrib hari ini (dalam menit lokal)
  let maghribMin = null;
  try {
    const p = prayerTimes(y, m, d, LAT, LNG, TZ, ELEV);
    if (p.maghrib && p.maghrib !== '—') {
      const [hh, mm] = p.maghrib.split(':').map(Number);
      maghribMin = hh * 60 + mm;
    }
  } catch(e) { /* gagal ambil maghrib, fallback ke tengah malam */ }

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const afterMaghrib = (maghribMin !== null) && (nowMin >= maghribMin);

  // Jika sudah lewat Maghrib, tanggal Hijriyah = Hijri untuk besok
  const gregJD = afterMaghrib ? j0 + 1 : j0;
  const hijri  = jdToHijri(gregJD);

  return { hijri, gregJD, afterMaghrib, maghribMin, y, m, d };
}

// ── HIJRI ──────────────────────────────────────────────
function renderHijri() {
  const now = new Date();
  const { hijri: h, afterMaghrib } = getCurrentHijri();

  // Label malam: tampilkan keterangan jika sudah masuk malam hari berikutnya
  const malamLabel = afterMaghrib
    ? `<span style="font-size:.72rem;color:var(--gold);opacity:.8"> (malam)</span>`
    : '';

  document.getElementById('hijriDisp').innerHTML =
    `<div class="hday">${h.day}${malamLabel}</div>`+
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
  for (let d = 1; d <= total; d++) cal += `<div class="cal-c ${d===h.day?'td':''}">` +
    (d===h.day && afterMaghrib ? `<span title="Malam ini sudah masuk tanggal ini">${d}*</span>` : d) + `</div>`;
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

// ══ KIBLAT LIVE ═══════════════════════════════════════════
// Konstanta Ka'bah
const KA_LAT = 21.4225, KA_LNG = 39.8262;

// State kompas live
let _qbAzimuth     = 0;   // azimuth kiblat (dari Utara, True)
let _qbHeading     = 0;   // heading perangkat saat ini (smooth)
let _qbHeadingRaw  = 0;   // heading mentah dari sensor
let _qbLiveMode    = false;
let _qbAnimRafId   = null;
let _qbSensorBound = false;

// ── Hitung azimuth kiblat ─────────────────────────────────
function _calcQiblaAzimuth(lat, lng) {
  const dLng = (KA_LNG - lng) * D2R;
  const y2 = Math.sin(dLng) * Math.cos(KA_LAT * D2R);
  const x2 = Math.cos(lat * D2R) * Math.sin(KA_LAT * D2R)
            - Math.sin(lat * D2R) * Math.cos(KA_LAT * D2R) * Math.cos(dLng);
  return fix(Math.atan2(y2, x2) * R2D);
}

// ── Hitung jarak Haversine (km) ───────────────────────────
function _calcDist(lat, lng) {
  const dLat = (KA_LAT - lat) * D2R;
  const dL2  = (KA_LNG - lng) * D2R;
  const a    = Math.sin(dLat / 2) ** 2
              + Math.cos(lat * D2R) * Math.cos(KA_LAT * D2R) * Math.sin(dL2 / 2) ** 2;
  return Math.round(2 * 6371 * Math.asin(Math.sqrt(a)));
}

// ── 16 mata angin ─────────────────────────────────────────
function _azToDir(az) {
  const dirs = ['U','UBL','BL','BBL','B','BSD','SD','SSD',
                'S','STG','TG','TTG','T','TLR','LR','ULR'];
  return dirs[Math.round(az / 22.5) % 16];
}

// ── Format DMS pendek ─────────────────────────────────────
function _fmtDeg(d) {
  const s = d < 0 ? '-' : '+';
  const a = Math.abs(d);
  const dd = Math.floor(a);
  const mm = Math.floor((a - dd) * 60);
  const ss = Math.round(((a - dd) * 60 - mm) * 60);
  return `${s}${dd}° ${pZ(mm)}′ ${pZ(ss)}″`;
}

// ── Gambar kompas di canvas ───────────────────────────────
function _drawQiblaCompass(needleDeg) {
  const canvas = document.getElementById('qbCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, cx = W / 2, cy = W / 2, R = W / 2 - 4;

  ctx.clearRect(0, 0, W, W);

  // 1. Background
  const bg = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R);
  bg.addColorStop(0, 'rgba(18,12,32,0.98)');
  bg.addColorStop(0.6, 'rgba(10,8,22,0.98)');
  bg.addColorStop(1, 'rgba(5,4,14,0.98)');
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fillStyle = bg; ctx.fill();

  // 2. Outer glow ring
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(200,164,74,0.55)'; ctx.lineWidth = 2; ctx.stroke();

  // 3. Inner dashed ring
  ctx.save();
  ctx.setLineDash([4, 5]);
  ctx.beginPath(); ctx.arc(cx, cy, R * 0.84, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(200,164,74,0.22)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();

  // 4. Tick marks (every 5°)
  for (let i = 0; i < 72; i++) {
    const angle = (i * 5 - 90) * D2R;
    const is90  = i % 18 === 0;   // cardinal
    const is45  = i % 9 === 0;    // inter-cardinal
    const len   = is90 ? 14 : is45 ? 10 : 6;
    const w     = is90 ? 2.5 : is45 ? 1.5 : 0.8;
    const color = is90 ? 'rgba(252,225,141,0.9)' : is45 ? 'rgba(200,164,74,0.7)' : 'rgba(200,164,74,0.35)';
    const r1 = R * 0.84, r2 = r1 - len;
    ctx.beginPath();
    ctx.moveTo(cx + r1 * Math.cos(angle), cy + r1 * Math.sin(angle));
    ctx.lineTo(cx + r2 * Math.cos(angle), cy + r2 * Math.sin(angle));
    ctx.strokeStyle = color; ctx.lineWidth = w; ctx.stroke();
  }

  // 5. Degree labels (every 30°)
  const degLabels = [['0','U'],['30',''],['60',''],['90','T'],
                     ['120',''],['150',''],['180','S'],
                     ['210',''],['240',''],['270','B'],
                     ['300',''],['330','']];
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  degLabels.forEach(([deg, cardinal], i) => {
    const angle = (i * 30 - 90) * D2R;
    const label = cardinal || deg;
    const isCard = !!cardinal;
    const ri = isCard ? R * 0.68 : R * 0.72;
    const x0 = cx + ri * Math.cos(angle);
    const y0 = cy + ri * Math.sin(angle);
    if (cardinal === 'U') {
      ctx.fillStyle = '#f26b6b';
      ctx.font = `bold ${W * 0.065}px "Cormorant Garamond", serif`;
    } else if (isCard) {
      ctx.fillStyle = 'rgba(252,225,141,0.95)';
      ctx.font = `bold ${W * 0.058}px "Cormorant Garamond", serif`;
    } else {
      ctx.fillStyle = 'rgba(200,164,74,0.55)';
      ctx.font = `${W * 0.038}px "JetBrains Mono", monospace`;
    }
    ctx.fillText(label, x0, y0);
  });
  ctx.restore();

  // 6. Jarum kiblat — dirotasi berdasarkan needleDeg
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(needleDeg * D2R);

  // Jarum atas (mengarah ke Kiblat)
  const nW = W * 0.032;
  ctx.beginPath();
  ctx.moveTo(0, -R * 0.60);  // ujung atas
  ctx.lineTo(nW, -R * 0.12);
  ctx.lineTo(0, 0);
  ctx.lineTo(-nW, -R * 0.12);
  ctx.closePath();
  const needleGrad = ctx.createLinearGradient(0, -R * 0.60, 0, 0);
  needleGrad.addColorStop(0, '#fce18d');
  needleGrad.addColorStop(0.45, '#e0b95c');
  needleGrad.addColorStop(1, 'rgba(224,185,92,0.2)');
  ctx.fillStyle = needleGrad;
  ctx.shadowColor = 'rgba(252,225,141,0.7)';
  ctx.shadowBlur = 12;
  ctx.fill();

  // Jarum bawah (berlawanan)
  ctx.beginPath();
  ctx.moveTo(0, R * 0.32);
  ctx.lineTo(nW * 0.65, R * 0.08);
  ctx.lineTo(0, 0);
  ctx.lineTo(-nW * 0.65, R * 0.08);
  ctx.closePath();
  ctx.fillStyle = 'rgba(142,136,125,0.5)';
  ctx.shadowBlur = 0;
  ctx.fill();

  // Ka'bah icon di ujung jarum atas
  ctx.font = `${W * 0.1}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(252,225,141,0.6)';
  ctx.shadowBlur = 14;
  ctx.fillText('🕋', 0, -R * 0.75);
  ctx.shadowBlur = 0;

  ctx.restore();

  // 7. Center dot
  const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.032);
  cg.addColorStop(0, '#fff');
  cg.addColorStop(0.4, '#fce18d');
  cg.addColorStop(1, 'rgba(224,185,92,0)');
  ctx.beginPath(); ctx.arc(cx, cy, W * 0.032, 0, Math.PI * 2);
  ctx.fillStyle = cg; ctx.fill();

  // 8. Live indicator ring (jika live mode)
  if (_qbLiveMode) {
    ctx.beginPath(); ctx.arc(cx, cy, R - 1, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(100,217,156,0.45)'; ctx.lineWidth = 3; ctx.stroke();
  }
}

// ── Animasi smooth kompas ─────────────────────────────────
let _qbCurrentAngle = 0;
function _animateQibla() {
  // Hitung delta terpendek (handles 359° → 1°)
  let target  = _qbLiveMode ? (_qbAzimuth - _qbHeading) : _qbAzimuth;
  let delta   = target - _qbCurrentAngle;
  if (delta > 180)  delta -= 360;
  if (delta < -180) delta += 360;
  _qbCurrentAngle += delta * 0.12;  // low-pass factor
  _drawQiblaCompass(_qbCurrentAngle);
  _qbAnimRafId = requestAnimationFrame(_animateQibla);
}

// ── Update heading display ────────────────────────────────
function _updateQbHeadingUI() {
  const el = document.getElementById('qbDeviceHeading');
  if (el) el.textContent = _qbLiveMode ? `${Math.round(_qbHeading)}°` : '— °';
}

// ── Orientasi sensor handler ──────────────────────────────
function _onOrientationEvent(e) {
  // iOS: webkitCompassHeading (0–360, 0=Utara)
  // Android: alpha (0–360, tapi 0=Utara kadang berbeda)
  let raw;
  if (typeof e.webkitCompassHeading === 'number') {
    raw = e.webkitCompassHeading;               // iOS — langsung Utara Magnetik
  } else if (e.absolute && typeof e.alpha === 'number') {
    raw = (360 - e.alpha) % 360;               // Android absolute
  } else if (typeof e.alpha === 'number') {
    raw = (360 - e.alpha) % 360;               // Android fallback
  } else {
    return;
  }

  // Low-pass: smooth raw heading
  let d = raw - _qbHeadingRaw;
  if (d >  180) d -= 360;
  if (d < -180) d += 360;
  _qbHeadingRaw += d * 0.25;
  _qbHeadingRaw = ((_qbHeadingRaw % 360) + 360) % 360;

  // Smooth display heading
  let d2 = _qbHeadingRaw - _qbHeading;
  if (d2 >  180) d2 -= 360;
  if (d2 < -180) d2 += 360;
  _qbHeading += d2 * 0.15;
  _qbHeading = ((_qbHeading % 360) + 360) % 360;

  _updateQbHeadingUI();
}

// ── Set status badge ──────────────────────────────────────
function _setQbStatus(type, text) {
  const bar = document.getElementById('qbStatusBar');
  if (!bar) return;
  const classMap = { live: 'qb-badge-live', static: 'qb-badge-static', denied: 'qb-badge-denied' };
  bar.innerHTML = `<span class="qb-badge ${classMap[type] || 'qb-badge-static'}">${text}</span>`;
  const canvas = document.getElementById('qbCanvas');
  if (canvas) {
    canvas.classList.toggle('live', type === 'live');
  }
}

// ── Mulai listen sensor ───────────────────────────────────
function _startOrientationListener() {
  if (_qbSensorBound) return;
  const handler = _onOrientationEvent;

  // Coba absolute orientation dulu (lebih akurat di Android)
  let useAbsolute = false;
  if ('ondeviceorientationabsolute' in window) {
    window.addEventListener('deviceorientationabsolute', handler, { passive: true });
    useAbsolute = true;
  }
  window.addEventListener('deviceorientation', handler, { passive: true });
  _qbSensorBound = true;

  // Cek apakah event benar-benar datang dalam 2 detik
  let gotEvent = false;
  const once = function(e) {
    if (typeof e.webkitCompassHeading === 'number' || typeof e.alpha === 'number') {
      gotEvent = true;
    }
  };
  window.addEventListener(useAbsolute ? 'deviceorientationabsolute' : 'deviceorientation', once, { once: true, passive: true });

  setTimeout(() => {
    if (!gotEvent) {
      _qbLiveMode = false;
      _setQbStatus('static', '○ Sensor tidak tersedia di perangkat ini');
    } else {
      _qbLiveMode = true;
      _setQbStatus('live', '● LIVE — Kompas Aktif');
    }
  }, 2000);
}

// ── Init kompas (dipanggil dari main.js) ──────────────────
function initQiblaCompass() {
  // Mulai animasi loop segera
  if (!_qbAnimRafId) _animateQibla();

  const hasDeviceOrientation = 'DeviceOrientationEvent' in window;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (!hasDeviceOrientation) {
    _setQbStatus('static', '○ Statis — Browser tidak mendukung sensor');
    return;
  }

  if (isIOS && typeof DeviceOrientationEvent.requestPermission === 'function') {
    // iOS 13+ perlu izin eksplisit
    const bar = document.getElementById('qbStatusBar');
    if (bar) {
      bar.innerHTML = `
        <button class="qb-perm-btn" id="qbPermBtn">
          🧭 Aktifkan Kompas Live
        </button>`;
      document.getElementById('qbPermBtn').addEventListener('click', function() {
        DeviceOrientationEvent.requestPermission().then(state => {
          if (state === 'granted') {
            _startOrientationListener();
          } else {
            _setQbStatus('denied', '✕ Izin sensor ditolak');
          }
        }).catch(() => _setQbStatus('denied', '✕ Tidak bisa meminta izin sensor'));
      });
    }
  } else {
    // Android / Desktop — langsung start
    _startOrientationListener();
  }
}

// ── Hitung Rashdul Qiblah Harian ─────────────────────────
function _calcRashdulHarian(lat, lng, az) {
  try {
    const now = new Date();
    const y = now.getFullYear(), mo = now.getMonth() + 1, d = now.getDate();
    // Iterasi jam 10–14 WIB, cari saat azimuth matahari = azimuth kiblat
    let prevDiff = null, prevH = null;
    for (let hh = 10; hh <= 14; hh += 1/60) {
      const hhInt = Math.floor(hh), mmInt = Math.round((hh - hhInt) * 60);
      const utH = hh - TZ;
      const j0  = jd(y, mo, d, Math.floor(utH), Math.round((utH - Math.floor(utH)) * 60));
      const s   = sunPos(j0);
      // Hour angle
      const T   = (j0 - 2451545) / 36525;
      const GMST = fix(280.46061837 + 360.98564736629 * (j0 - 2451545) + 0.000387933 * T * T - T * T * T / 38710000);
      const LST = fix(GMST + lng);
      const HA  = LST - s.RA;
      const sH  = toHoriz(s.RA, s.Dec, lat, lng, j0);
      const sunAz = sH.az;
      const diff  = sunAz - az;
      if (prevDiff !== null && prevDiff * diff < 0) {
        // Zero crossing — interpolasi
        const t = prevH - prevDiff / (diff - prevDiff) * (1/60);
        const tHH = Math.floor(t), tMM = Math.round((t - tHH) * 60);
        return `${pZ(tHH)}:${pZ(tMM)}`;
      }
      prevDiff = diff; prevH = hh;
    }
    return null;
  } catch(e) { return null; }
}

// ── Render Rashdul Qiblah ─────────────────────────────────
function _renderRashdulQiblah(lat, lng, az) {
  const grid = document.getElementById('qbRashdulGrid');
  if (!grid) return;

  const harian = _calcRashdulHarian(lat, lng, az);
  const now    = new Date();
  const mo = now.getMonth() + 1, d = now.getDate();

  // Rashdul Qiblah Tahunan — 27/28 Mei & 15/16 Juli (tanggal Makkah)
  const tahunan1 = (mo === 5 && (d === 27 || d === 28)) || (mo === 5 && d === 26 && TZ > 3);
  const tahunan2 = (mo === 7 && (d === 15 || d === 16)) || (mo === 7 && d === 14 && TZ > 3);
  const isTahunan = tahunan1 || tahunan2;

  let html = '';
  if (harian) {
    html += `<div class="qb-rashdul-item">
      <div class="qb-rashdul-type">📅 Harian</div>
      <div class="qb-rashdul-time">${harian} WIB</div>
      <div class="qb-rashdul-sub">Waktu Setempat (UTC+${TZ})</div>
    </div>`;
  } else {
    html += `<div class="qb-rashdul-item">
      <div class="qb-rashdul-type">📅 Harian</div>
      <div class="qb-rashdul-time" style="font-size:1rem;color:var(--text3)">Tidak terjadi hari ini</div>
      <div class="qb-rashdul-sub">Matahari tidak melewati azimuth kiblat</div>
    </div>`;
  }

  html += `<div class="qb-rashdul-item ${isTahunan ? 'qb-data-item' : ''}">
    <div class="qb-rashdul-type">🗓 Tahunan — Periode I</div>
    <div class="qb-rashdul-time" style="${isTahunan && tahunan1 ? 'color:var(--green)' : ''}">27–28 Mei</div>
    <div class="qb-rashdul-sub">±12:18 Waktu Makkah<br>≈ ${fmtHM(12.3 + 3 - (39.8262 / 15) + TZ)} WIB</div>
  </div>`;

  html += `<div class="qb-rashdul-item">
    <div class="qb-rashdul-type">🗓 Tahunan — Periode II</div>
    <div class="qb-rashdul-time" style="${isTahunan && tahunan2 ? 'color:var(--green)' : ''}">15–16 Juli</div>
    <div class="qb-rashdul-sub">±12:27 Waktu Makkah<br>≈ ${fmtHM(12.45 + 3 - (39.8262 / 15) + TZ)} WIB</div>
  </div>`;

  if (isTahunan) {
    html = `<div class="qb-rashdul-item" style="grid-column:1/-1;background:rgba(100,217,156,0.08);border-color:rgba(100,217,156,0.4)">
      <div class="qb-rashdul-type" style="color:var(--green)">✨ HARI INI adalah Rashdul Qiblah Tahunan!</div>
      <div class="qb-rashdul-sub" style="color:var(--text);font-size:.8rem">Matahari tepat di atas Ka'bah hari ini. Manfaatkan untuk kalibrasi kiblat.</div>
    </div>` + html;
  }

  grid.innerHTML = html;
}

// ── Render utama Kiblat ───────────────────────────────────
function renderQibla() {
  const lat = typeof LAT !== 'undefined' ? LAT : parseFloat(document.getElementById('inpLat').value) || 0;
  const lng = typeof LNG !== 'undefined' ? LNG : parseFloat(document.getElementById('inpLng').value) || 0;

  const az   = _calcQiblaAzimuth(lat, lng);
  const dist = _calcDist(lat, lng);
  const dirs = ['U','UBL','BL','BBL','B','BSD','SD','SSD',
                'S','STG','TG','TTG','T','TLR','LR','ULR'];
  const dir  = dirs[Math.round(az / 22.5) % 16];

  // Azimuth dari Selatan (metode falak pesantren)
  const azS  = az <= 180 ? az : az - 360;
  const azSStr = az > 180
    ? `${(360 - az).toFixed(2)}° dari Selatan ke Barat`
    : az > 90
      ? `${(180 - az).toFixed(2)}° dari Selatan ke Timur`
      : `${az.toFixed(2)}° dari Utara ke Timur`;

  // Simpan ke state modul agar dipakai animasi
  _qbAzimuth = az;

  // Update elemen UI
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML = val; };
  setEl('qbAzimuth',   `${az.toFixed(2)}°`);
  setEl('qbDir',       dir);
  setEl('qbFromSouth', azSStr);
  setEl('qbDist',      `${dist.toLocaleString('id-ID')}<span>km</span>`);
  setEl('qbMarkaz',    (typeof document !== 'undefined' ? document.getElementById('inpMarkaz')?.value : '') || '—');
  setEl('qbCoords',    `${lat.toFixed(5)}° LU, ${lng.toFixed(5)}° BT`);
  setEl('qbDiffLat',   `${_fmtDeg(KA_LAT - lat)} (${(KA_LAT - lat) > 0 ? 'Ka\'bah di Utara' : 'Ka\'bah di Selatan'})`);
  setEl('qbDiffLng',   `${_fmtDeg(KA_LNG - lng)} (${(KA_LNG - lng) > 0 ? 'Ka\'bah di Timur' : 'Ka\'bah di Barat'})`);

  // Rashdul Qiblah
  _renderRashdulQiblah(lat, lng, az);
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
  // Kolom: Tgl | Hijri (malam) | Imsak | Subuh | Syuruq | Dhuha | Dzuhur | Ashar | Maghrib | Isya
  let html = `<thead><tr><th class="kc">Tgl</th><th class="kc" title="Tanggal Hijriyah yang berlaku mulai Maghrib hari ini (malam hari berikutnya)">Hijri (Malam)</th>`+
             `<th>Imsak</th><th>Subuh</th><th>Syuruq</th><th>Dhuha</th><th>Dzuhur</th>`+
             `<th>Ashar</th><th>Maghrib</th><th>Isya</th></tr></thead><tbody>`;
  for (let day = 1; day <= dInMonth; day++) {
    const p = prayerTimes(y, mo, day, LAT, LNG, TZ, ELEV);
    // Konvensi Hijriyah: tanggal Hijriyah di kolom ini adalah tanggal yang
    // berlaku mulai Maghrib hari ini (= Hijri untuk hari Masehi BERIKUTNYA).
    // Ini menunjukkan "malam" dalam kalender Hijriyah pada baris hari itu.
    const hMalam = jdToHijri(jd(y, mo, day) + 1);
    html += `<tr class="${day===now.getDate()?'today-row':''}">` +
      `<td class="kc">${pZ(day)}/${pZ(mo)}</td>` +
      `<td class="kc" title="Malam ${hMalam.day} ${HM[hMalam.month-1]} ${hMalam.year} H">${hMalam.day} ${HM[hMalam.month-1].slice(0,5)}</td>`+
      `<td>${p.imsak}</td><td>${p.fajr}</td><td>${p.syuruq}</td><td>${p.dhuha}</td>`+
      `<td>${p.dhuhr}</td><td>${p.ashr}</td><td>${p.maghrib}</td><td>${p.isya}</td></tr>`;
  }
  document.getElementById('imsakTable').innerHTML = html + '</tbody>';
}

// ── EPHEMERIS ────────────────────────────────────────
function renderEphemeris() {
  const now = new Date();
  const utH = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
  const j0 = jd(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate(), utH);

  const s = sunPos(j0), m = moonPos(j0), T = (j0 - 2451545) / 36525;

  const lat = typeof LAT !== 'undefined' ? LAT : parseFloat(document.getElementById('inpLat').value) || 0;
  const lng = typeof LNG !== 'undefined' ? LNG : parseFloat(document.getElementById('inpLng').value) || 0;
  const elev = typeof ELEV !== 'undefined' ? ELEV : parseFloat(document.getElementById('inpElev').value) || 0;

  const latR = lat * D2R, u = Math.atan(0.99664719 * Math.tan(latR));
  const rhoS = 0.99664719 * Math.sin(u) + (elev / 6378140) * Math.sin(latR);
  const rhoC = Math.cos(u) + (elev / 6378140) * Math.cos(latR);

  // Topocentric RA/Dec
  const sTopo = topoCorrect(s, lat, lng, elev, j0);
  const mTopo = topoCorrect(m, lat, lng, elev, j0);

  // LST & Hour Angle
  const GMST = fix(280.46061837 + 360.98564736629 * (j0 - 2451545) + 0.000387933 * T * T - T * T * T / 38710000);
  const LST = fix(GMST + lng);
  const sH = LST - s.RA, mH = LST - m.RA;

  // Distances
  const sDec_rad = s.Dec * D2R, sH_rad = sH * D2R;
  const sTopoDist = s.dist - (6378.14 / 1.495978707e8) * (rhoC * Math.cos(sDec_rad) * Math.cos(sH_rad) + rhoS * Math.sin(sDec_rad));

  const dec_rad = m.Dec * D2R, mH_rad = mH * D2R;
  const mTopoDist = m.dist - 6378.14 * (rhoC * Math.cos(dec_rad) * Math.cos(mH_rad) + rhoS * Math.sin(dec_rad));

  // Horizon coords
  const sGeoHor = toHoriz(s.RA, s.Dec, lat, lng, j0);
  const mGeoHor = toHoriz(m.RA, m.Dec, lat, lng, j0);

  const sTopoHor = toHoriz(sTopo.RA, sTopo.Dec, lat, lng, j0);
  const mTopoHor = toHoriz(mTopo.RA, mTopo.Dec, lat, lng, j0);

  // Atmospheric refraction
  const sRef = refraction(sTopoHor.alt);
  const mRef = refraction(mTopoHor.alt);

  const sTopoAltRef = sTopoHor.alt + sRef;
  const mTopoAltRef = mTopoHor.alt + mRef;

  const rows = [
    ['Bujur Ekliptika (λ)',   fix(s.sunLon).toFixed(6)+'°', '—',                           m.lon.toFixed(6)+'°',         '—'],
    ['Lintang Ekliptika (β)',  '—',                          '—',                           m.lat.toFixed(6)+'°',         '—'],
    ['Asensio Rekta (AR)',    dms(s.RA),                    dms(sTopo.RA),                 dms(m.RA),                    dms(mTopo.RA)],
    ['Deklinasi (δ)',         dms(s.Dec),                   dms(sTopo.Dec),                dms(m.Dec),                   dms(mTopo.Dec)],
    ['Persamaan Waktu (EqT)', s.EqT.toFixed(6)+' mnt',      '—',                           '—',                          '—'],
    ['Jarak Bumi',           s.dist.toFixed(8)+' AU',      sTopoDist.toFixed(8)+' AU',    m.dist.toFixed(3)+' km',      mTopoDist.toFixed(3)+' km'],
    ['Semidiameter',         dmsU(s.SD),                   dmsU(0.2666 / sTopoDist),      dmsU(m.SD),                   dmsU(asin(1737.4 / mTopoDist))],
    ['Horizontal Parallax',  dmsU(s.HP),                   dmsU(asin(Math.sin(8.794/3600*D2R)/sTopoDist)*R2D), dmsU(m.HP), dmsU(asin(6378.14 / mTopoDist))],
    ['Altitude (Tinggi)',     (sGeoHor.alt > 0 ? '+' : '') + sGeoHor.alt.toFixed(4) + '°',
                              (sTopoHor.alt > 0 ? '+' : '') + sTopoHor.alt.toFixed(4) + '°',
                              (mGeoHor.alt > 0 ? '+' : '') + mGeoHor.alt.toFixed(4) + '°',
                              (mTopoHor.alt > 0 ? '+' : '') + mTopoHor.alt.toFixed(4) + '°'],
    ['Azimuth',               sGeoHor.az.toFixed(4) + '°',  sTopoHor.az.toFixed(4) + '°',  mGeoHor.az.toFixed(4) + '°',  mTopoHor.az.toFixed(4) + '°'],
    ['Refraksi Atmosfer',     '—',                          sRef.toFixed(6) + '°',         '—',                          mRef.toFixed(6) + '°'],
    ['Tinggi Terbias',        '—',                          (sTopoAltRef > 0 ? '+' : '') + sTopoAltRef.toFixed(4) + '°',
                              '—',                          (mTopoAltRef > 0 ? '+' : '') + mTopoAltRef.toFixed(4) + '°'],
    ['Julian Day (UT)',       j0.toFixed(6),                '—',                           '—',                          '—']
  ];

  let html = `<thead>
    <tr>
      <th class="kc" rowspan="2">Parameter</th>
      <th colspan="2">☀ Matahari</th>
      <th colspan="2">🌙 Bulan</th>
    </tr>
    <tr>
      <th>Geosentris</th>
      <th>Toposentris</th>
      <th>Geosentris</th>
      <th>Toposentris</th>
    </tr>
  </thead><tbody>`;
  
  rows.forEach(r => {
    html += `<tr>
      <td class="kc">${r[0]}</td>
      <td>${r[1]}</td>
      <td>${r[2]}</td>
      <td>${r[3]}</td>
      <td>${r[4]}</td>
    </tr>`;
  });
  
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
  if (typeof renderIstiwa     === 'function') renderIstiwa();
  if (typeof renderEclipse    === 'function') renderEclipse();
  if (typeof renderAstroClock === 'function') renderAstroClock();
}
