/**
 * main.js — State global, init, tab, GPS, bintang
 * Al-Fajri v2.4.2 | Lembaga Falakiyah PCNU Kencong
 * HARUS dimuat TERAKHIR setelah semua modul lain.
 *
 * CHANGELOG v2.4.2:
 * - FIX GPS: Loading spinner on button, specific error messages (permission denied, timeout, etc.)
 * - FEAT GPS: Reverse geocoding via OpenStreetMap Nominatim to auto-fill markaz name
 */
'use strict';

// ── State global (dibaca semua modul) ─────────────────
var LAT  = -8.2664;
var LNG  = 113.4203;
var ELEV = 11;
var TZ   = 7;

// ── Bintang latar ─────────────────────────────────────
(function() {
  const bg = document.getElementById('starBg');
  if (!bg) return;
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
    const panel = document.getElementById('panel-' + t.dataset.tab);
    if (panel) panel.classList.add('active');
  });
});

// ── Terapkan lokasi ───────────────────────────────────
function applyLoc() {
  const la = parseFloat(document.getElementById('inpLat').value);
  const ln = parseFloat(document.getElementById('inpLng').value);
  if (isNaN(la) || isNaN(ln)) {
    setLocStatus('⚠ Koordinat tidak valid', 'err'); return;
  }
  LAT  = la;  LNG  = ln;
  ELEV = parseFloat(document.getElementById('inpElev').value) || 0;
  TZ   = parseFloat(document.getElementById('inpTZ').value)   || 7;
  const markaz = document.getElementById('inpMarkaz').value || 'Markaz';
  setLocStatus(`📍 ${markaz} | ${LAT.toFixed(5)}°, ${LNG.toFixed(5)}° | UTC+${TZ}`, 'ok');
  renderAll();
}
document.getElementById('btnCalc').addEventListener('click', applyLoc);

// ── Status Helper ─────────────────────────────────────
function setLocStatus(msg, type) {
  const el = document.getElementById('locSt');
  if (!el) return;
  el.textContent = msg;
  el.style.color = type === 'err' ? 'var(--red)' : type === 'ok' ? 'var(--green)' : 'var(--text2)';
}

// ── GPS ───────────────────────────────────────────────
document.getElementById('btnGPS').addEventListener('click', function() {
  const btn = this;

  // Cek ketersediaan API
  if (!navigator.geolocation) {
    setLocStatus('⚠ Browser ini tidak mendukung GPS/Geolokasi.', 'err');
    return;
  }

  // Cek apakah halaman di-serve via HTTPS (wajib untuk GPS di browser modern)
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    setLocStatus('⚠ GPS memerlukan koneksi HTTPS.', 'err');
    return;
  }

  // Tampilkan loading state
  const origText = btn.textContent;
  btn.disabled = true;
  btn.innerHTML = '<span class="sp" style="border-top-color:#000;width:14px;height:14px;border-width:2px"></span>';
  setLocStatus('🔍 Mendeteksi lokasi GPS...', '');

  navigator.geolocation.getCurrentPosition(
    // SUCCESS
    function(pos) {
      LAT = pos.coords.latitude;
      LNG = pos.coords.longitude;
      TZ  = -new Date().getTimezoneOffset() / 60;

      if (pos.coords.altitude != null && pos.coords.altitude > 0) {
        ELEV = Math.max(0, Math.round(pos.coords.altitude));
        document.getElementById('inpElev').value = ELEV;
      }

      document.getElementById('inpLat').value = LAT.toFixed(6);
      document.getElementById('inpLng').value = LNG.toFixed(6);
      document.getElementById('inpTZ').value  = TZ;

      setLocStatus(`✓ GPS: ${LAT.toFixed(5)}°, ${LNG.toFixed(5)}° | UTC+${TZ} | Elev: ${ELEV}m`, 'ok');
      btn.disabled = false;
      btn.textContent = origText;
      renderAll();

      // Reverse geocoding via Nominatim (OpenStreetMap) — tidak perlu API key
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${LAT}&lon=${LNG}&zoom=14&addressdetails=1`, {
        headers: { 'Accept-Language': 'id', 'User-Agent': 'AlFajriApp/2.4' }
      })
      .then(r => r.json())
      .then(data => {
        const a = data.address || {};
        // Prioritas: village/suburb → town/city_district → city → county
        const lokal = a.village || a.suburb || a.town || a.city_district || a.city || a.county || '';
        const kota  = a.city || a.town || a.county || '';
        const nama  = [lokal, kota].filter(Boolean).join(', ');
        if (nama) {
          document.getElementById('inpMarkaz').value = nama;
          setLocStatus(`📍 ${nama} | ${LAT.toFixed(5)}°, ${LNG.toFixed(5)}° | UTC+${TZ}`, 'ok');
        }
      })
      .catch(() => { /* Geocoding gagal, tidak masalah, koordinat sudah benar */ });
    },
    // ERROR
    function(err) {
      btn.disabled = false;
      btn.textContent = origText;

      let msg;
      switch (err.code) {
        case 1: // PERMISSION_DENIED
          msg = '⚠ GPS ditolak. Silakan izinkan akses lokasi di browser Anda: Ketuk ikon 🔒 di address bar → Izinkan Lokasi.';
          break;
        case 2: // POSITION_UNAVAILABLE
          msg = '⚠ GPS tidak tersedia di perangkat ini. Coba aktifkan Location/GPS di pengaturan HP.';
          break;
        case 3: // TIMEOUT
          msg = '⚠ GPS timeout (>10 detik). Coba di tempat terbuka atau nyalakan GPS perangkat.';
          break;
        default:
          msg = `⚠ GPS error: ${err.message}`;
      }
      setLocStatus(msg, 'err');
    },
    { timeout: 12000, enableHighAccuracy: true, maximumAge: 30000 }
  );
});

// ── Inisialisasi ──────────────────────────────────────
setLocStatus(`📍 Pondok Pesantren Nuris | ${LAT.toFixed(5)}°, ${LNG.toFixed(5)}° | UTC+${TZ}`, 'ok');
renderAll();
doCalcHilal();
tickCountdown();
setInterval(tickCountdown, 1000);
