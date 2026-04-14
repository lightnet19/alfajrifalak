/**
 * main.js — State global, init, tab, GPS, bintang
 * Al-Fajri v2.3.2 | Lembaga Falakiyah PCNU Kencong
 * HARUS dimuat TERAKHIR setelah semua modul lain.
 */
'use strict';

// ── State global (dibaca semua modul) ────────────────
var LAT  = -8.2664;
var LNG  = 113.4203;
var ELEV = 11;
var TZ   = 7;

// ── Bintang latar ─────────────────────────────────────
(function() {
  const bg = document.getElementById('starBg');
  for (let i = 0; i < 175; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const r = Math.random()*1.1 + 0.2;
    s.style.cssText =
      `left:${Math.random()*100}%;top:${Math.random()*100}%;`+
      `width:${r*2}px;height:${r*2}px;`+
      `--a:${Math.random()*.5+.1};--d:${Math.random()*3+1.5}s;`+
      `animation-delay:${Math.random()*5}s`;
    bg.appendChild(s);
  }
})();

// ── Tabs ──────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    document.getElementById('panel-' + t.dataset.tab).classList.add('active');
  });
});

// ── Terapkan lokasi ───────────────────────────────────
function applyLoc() {
  const la = parseFloat(document.getElementById('inpLat').value);
  const ln = parseFloat(document.getElementById('inpLng').value);
  if (isNaN(la) || isNaN(ln)) {
    document.getElementById('locSt').textContent = '⚠ Koordinat tidak valid'; return;
  }
  LAT  = la;  LNG  = ln;
  ELEV = parseFloat(document.getElementById('inpElev').value) || 0;
  TZ   = parseFloat(document.getElementById('inpTZ').value)   || 7;
  document.getElementById('locSt').textContent =
    `✓ ${document.getElementById('inpMarkaz').value} | ${LAT.toFixed(5)}°, ${LNG.toFixed(5)}° | UTC+${TZ}`;
  renderAll();
}
document.getElementById('btnCalc').addEventListener('click', applyLoc);

// ── GPS ────────────────────────────────────────────────
// FIX v2.3.1: Gunakan timezone device, BUKAN Math.round(lng/15)
// FIX v2.3.2: Juga update ELEV dari coords.altitude jika tersedia
document.getElementById('btnGPS').addEventListener('click', () => {
  if (!navigator.geolocation) { alert('GPS tidak tersedia'); return; }
  document.getElementById('locSt').textContent = '📡 Mendeteksi...';
  navigator.geolocation.getCurrentPosition(pos => {
    LAT  = pos.coords.latitude;
    LNG  = pos.coords.longitude;
    TZ   = -new Date().getTimezoneOffset() / 60;  // timezone perangkat yang benar
    // FIX: update elevasi dari GPS jika tersedia (browser HTML5 Geolocation API)
    if (pos.coords.altitude != null) {
      ELEV = Math.max(0, Math.round(pos.coords.altitude));
      document.getElementById('inpElev').value = ELEV;
    }
    document.getElementById('inpLat').value  = LAT.toFixed(6);
    document.getElementById('inpLng').value  = LNG.toFixed(6);
    document.getElementById('inpTZ').value   = TZ;
    document.getElementById('locSt').textContent =
      `📍 GPS: ${LAT.toFixed(5)}°, ${LNG.toFixed(5)}° | UTC+${TZ} | Elev: ${ELEV}m`;
    renderAll();
  }, err => {
    document.getElementById('locSt').textContent = `❌ GPS gagal: ${err.message}`;
  }, { timeout: 10000, enableHighAccuracy: true });
});

// ── Inisialisasi ──────────────────────────────────────
document.getElementById('locSt').textContent =
  `✓ Pondok Pesantren Nuris | ${LAT.toFixed(5)}°, ${LNG.toFixed(5)}° | UTC+${TZ}`;
renderAll();
doCalcHilal();
tickCountdown();
setInterval(tickCountdown, 1000);
