/**
 * main.js — State global, init, tab, GPS, bintang
 * Al-Fajri v3.0.2 | Lembaga Falakiyah PCNU Kencong
 * HARUS dimuat TERAKHIR setelah semua modul lain.
 *
 * CHANGELOG v3.0.2 (2026-07-09):
 *  - FIX: Hapus doCalcHilal() otomatis dari blok init.
 *  - TAMBAH: _initHilalDefaults() untuk set bulan/tahun form secara dinamis.
 */
'use strict';

// ── State global (dibaca semua modul) ─────────────────
var LAT  = -8.2664;
var LNG  = 113.4203;
var ELEV = 11;
var TZ   = 7;
var HIJRI_OFFSET = 1;
var ALGO = 'jeanmeeus';
var IHTIYAT = 2;

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
  HIJRI_OFFSET = parseInt(document.getElementById('inpHijriOffset').value) || 0;
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

  if (!navigator.geolocation) {
    setLocStatus('⚠ Browser ini tidak mendukung GPS/Geolokasi.', 'err');
    return;
  }

  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    setLocStatus('⚠ GPS memerlukan koneksi HTTPS.', 'err');
    return;
  }

  const origText = btn.textContent;
  btn.disabled = true;
  btn.innerHTML = '<span class="sp" style="border-top-color:#000;width:14px;height:14px;border-width:2px"></span>';
  setLocStatus('🔍 Mendeteksi lokasi GPS...', '');

  navigator.geolocation.getCurrentPosition(
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

      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${LAT}&lon=${LNG}&zoom=14&addressdetails=1`, {
        headers: { 'Accept-Language': 'id', 'User-Agent': 'AlFajriApp/2.4' }
      })
      .then(r => r.json())
      .then(data => {
        const a = data.address || {};
        const lokal = a.village || a.suburb || a.town || a.city_district || a.city || a.county || '';
        const kota  = a.city || a.town || a.county || '';
        const nama  = [lokal, kota].filter(Boolean).join(', ');
        if (nama) {
          document.getElementById('inpMarkaz').value = nama;
          setLocStatus(`📍 ${nama} | ${LAT.toFixed(5)}°, ${LNG.toFixed(5)}° | UTC+${TZ}`, 'ok');
        }
      })
      .catch(() => {});
    },
    function(err) {
      btn.disabled = false;
      btn.textContent = origText;

      let msg;
      switch (err.code) {
        case 1:
          msg = '⚠ GPS ditolak. Silakan izinkan akses lokasi di browser Anda: Ketuk ikon 🔒 di address bar → Izinkan Lokasi.';
          break;
        case 2:
          msg = '⚠ GPS tidak tersedia di perangkat ini. Coba aktifkan Location/GPS di pengaturan HP.';
          break;
        case 3:
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

function updateAlgo() {
  const algoEl = document.getElementById('algoSelect');
  const ihtiyatEl = document.getElementById('inpIhtiyat');
  if (algoEl) ALGO = algoEl.value;
  if (ihtiyatEl) IHTIYAT = parseInt(ihtiyatEl.value) || 0;
  
  if (typeof _pCache !== 'undefined') {
    _pCache.key = null;
    _pCache.result = null;
  }
  renderAll();
}

function initAlgoListeners() {
  const algoEl = document.getElementById('algoSelect');
  const ihtiyatEl = document.getElementById('inpIhtiyat');
  if (algoEl) {
    algoEl.value = ALGO;
    algoEl.addEventListener('change', updateAlgo);
  }
  if (ihtiyatEl) {
    ihtiyatEl.value = IHTIYAT;
    ihtiyatEl.addEventListener('input', updateAlgo);
    ihtiyatEl.addEventListener('change', updateAlgo);
  }
}

/**
 * Inisialisasi default bulan & tahun di form hilal berdasarkan tanggal Hijriyah saat ini.
 * Dipanggil sekali saat init. Tidak memicu kalkulasi hilal.
 * FIX v3.0.2: Menggantikan doCalcHilal() otomatis yang menyesatkan.
 */
function _initHilalDefaults() {
  try {
    const now = new Date();
    const currentHijri = jdToHijri(jd(now.getFullYear(), now.getMonth()+1, now.getDate()));

    // Set tahun ke tahun Hijriyah saat ini
    const yearEl = document.getElementById('hilalYear');
    if (yearEl) yearEl.value = currentHijri.year;

    // Set bulan: jika sudah lewat tanggal 20, pre-select bulan berikutnya
    const monthEl = document.getElementById('hilalMonth');
    if (monthEl) {
      let targetMonth = currentHijri.month;
      let targetYear = currentHijri.year;
      if (currentHijri.day > 20) {
        if (currentHijri.month >= 12) {
          targetMonth = 1;
          targetYear = currentHijri.year + 1;
          if (yearEl) yearEl.value = targetYear;
        } else {
          targetMonth = currentHijri.month + 1;
        }
      }
      monthEl.value = targetMonth;
    }
  } catch(e) { /* fallback ke default HTML jika ada error */ }
}

// ── Inisialisasi ──────────────────────────────────────
setLocStatus(`📍 Pondok Pesantren Nuris Salafiyyah | ${LAT.toFixed(5)}°, ${LNG.toFixed(5)}° | UTC+${TZ}`, 'ok');
initAlgoListeners();
_initHilalDefaults();
renderAll();
tickCountdown();
if (typeof tickIstiwa === 'function') tickIstiwa();
if (typeof tickAstroClock === 'function') tickAstroClock();
setInterval(() => {
  tickCountdown();
  if (typeof tickIstiwa === 'function') tickIstiwa();
  if (typeof tickAstroClock === 'function') tickAstroClock();
}, 1000);
