/**
 * main.js — Init, state, tabs, GPS, countdown
 * Al-Fajri v2.1 — Lembaga Falakiyah PCNU Kencong
 */
'use strict';

// Global state — shared across all modules
var LAT  = -8.2664;
var LNG  = 113.4203;
var ELEV = 11;
var TZ   = 7;

// Stars background
(function() {
  const bg = document.getElementById('starBg');
  for (let i = 0; i < 175; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const r = Math.random()*1.1+0.2;
    s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;width:${r*2}px;height:${r*2}px;--a:${Math.random()*.5+.1};--d:${Math.random()*3+1.5}s;animation-delay:${Math.random()*5}s`;
    bg.appendChild(s);
  }
})();

// Tabs
document.querySelectorAll('.tab').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    document.getElementById('panel-' + t.dataset.tab).classList.add('active');
  });
});

// Apply location
function applyLoc() {
  const la = parseFloat(document.getElementById('inpLat').value);
  const ln = parseFloat(document.getElementById('inpLng').value);
  if (isNaN(la) || isNaN(ln)) {
    document.getElementById('locSt').textContent = '⚠ Koordinat tidak valid'; return;
  }
  LAT  = la; LNG  = ln;
  ELEV = parseFloat(document.getElementById('inpElev').value) || 0;
  TZ   = parseFloat(document.getElementById('inpTZ').value)   || 7;
  document.getElementById('locSt').textContent =
    `✓ ${document.getElementById('inpMarkaz').value} | ${LAT.toFixed(5)}°, ${LNG.toFixed(5)}° | UTC+${TZ}`;
  renderAll();
}
document.getElementById('btnCalc').addEventListener('click', applyLoc);

// GPS — FIX: use browser timezone offset, not Math.round(lng/15)
// Math.round(113.4/15) = 8 (wrong). -new Date().getTimezoneOffset()/60 = 7 (correct).
document.getElementById('btnGPS').addEventListener('click', () => {
  if (!navigator.geolocation) { alert('GPS tidak tersedia'); return; }
  document.getElementById('locSt').textContent = '📡 Mendeteksi...';
  navigator.geolocation.getCurrentPosition(pos => {
    LAT = pos.coords.latitude;
    LNG = pos.coords.longitude;
    TZ  = -new Date().getTimezoneOffset() / 60;   // device actual timezone
    document.getElementById('inpLat').value  = LAT.toFixed(6);
    document.getElementById('inpLng').value  = LNG.toFixed(6);
    document.getElementById('inpTZ').value   = TZ;
    document.getElementById('locSt').textContent = `📍 GPS: ${LAT.toFixed(5)}°, ${LNG.toFixed(5)}° | UTC+${TZ}`;
    renderAll();
  }, err => {
    document.getElementById('locSt').textContent = `❌ GPS gagal: ${err.message}`;
  }, { timeout: 10000, enableHighAccuracy: true });
});

// Init
document.getElementById('locSt').textContent =
  `✓ Pondok Pesantren Nuris | ${LAT.toFixed(5)}°, ${LNG.toFixed(5)}° | UTC+${TZ}`;
renderAll();
doCalcHilal();

// Countdown — start immediately and tick every second
tickCountdown();
setInterval(tickCountdown, 1000);
