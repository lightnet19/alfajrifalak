/**
 * api.js — Integration SDK, Query Parameters API, and iframe postMessage Bridge
 * Al-Fajri v3.0.2 | Lembaga Falakiyah PCNU Kencong
 * Menyediakan antarmuka API bagi aplikasi luar untuk mengambil data falakiyah.
 */
'use strict';

(function() {
  // ── Namespace Global API ─────────────────────────────────────────────
  const AlFajriAPI = {
    version: '3.0.2',
    
    /**
     * Mengambil jadwal sholat lengkap
     */
    getPrayerTimes: function(params = {}) {
      const year = params.year || new Date().getFullYear();
      const month = params.month || (new Date().getMonth() + 1);
      const day = params.day || new Date().getDate();
      const lat = typeof params.lat === 'number' ? params.lat : LAT;
      const lng = typeof params.lng === 'number' ? params.lng : LNG;
      const tz = typeof params.tz === 'number' ? params.tz : TZ;
      const elev = typeof params.elev === 'number' ? params.elev : ELEV;
      const algo = params.algo || ALGO;
      const ihtiyat = typeof params.ihtiyat === 'number' ? params.ihtiyat : IHTIYAT;

      if (typeof prayerTimes !== 'function') {
        throw new Error('Modul prayer.js belum dimuat.');
      }

      // Hitung jadwal sholat (wasathi dasar)
      const res = prayerTimes(year, month, day, lat, lng, tz, elev);
      
      // Jika menggunakan algoritma salaf Irsyadul Murid
      let finalTimes = { ...res };
      if (algo === 'irsyadulmurid' && typeof calcSalafPrayerTimes === 'function') {
        const salaf = calcSalafPrayerTimes(year, month, day, lat, lng, tz);
        finalTimes = { ...finalTimes, ...salaf };
      }

      // Tambahkan ihtiyat (kehati-hatian) dalam format string HH:MM
      const timesWithIhtiyat = {};
      const keys = ['imsak', 'subuh', 'terbit', 'dhuha', 'dzuhur', 'ashar', 'maghrib', 'isya'];
      
      keys.forEach(k => {
        let minutesShift = ihtiyat;
        if (k === 'terbit') minutesShift = -ihtiyat; // Terbit dikurangi ihtiyat agar lebih cepat aman
        
        const rawTime = finalTimes[k + 'Raw'];
        if (typeof rawTime === 'number') {
          // Konversi raw time ke jam dan menit
          let h = Math.floor(rawTime);
          let m = Math.round((rawTime - h) * 60) + minutesShift;
          if (m >= 60) { h += Math.floor(m / 60); m = m % 60; }
          if (m < 0) { h -= 1; m = 60 + m; }
          timesWithIhtiyat[k] = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
          timesWithIhtiyat[k + 'Raw'] = rawTime + (minutesShift / 60);
        }
      });

      return {
        meta: {
          tanggal: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          koordinat: { lat, lng, elev, tz },
          konfigurasi: { algo, ihtiyat }
        },
        jadwal: timesWithIhtiyat
      };
    },

    /**
     * Mengambil parameter Jam Istiwa (True Solar Time)
     */
    getIstiwa: function(params = {}) {
      const year = params.year || new Date().getFullYear();
      const month = params.month || (new Date().getMonth() + 1);
      const day = params.day || new Date().getDate();
      const lat = typeof params.lat === 'number' ? params.lat : LAT;
      const lng = typeof params.lng === 'number' ? params.lng : LNG;
      const tz = typeof params.tz === 'number' ? params.tz : TZ;
      const elev = typeof params.elev === 'number' ? params.elev : ELEV;

      if (typeof prayerTimes !== 'function') {
        throw new Error('Modul prayer.js belum dimuat.');
      }

      const p = prayerTimes(year, month, day, lat, lng, tz, elev);
      const noonRaw = p.dzuhurRaw; // kulminasi dalam jam Wasathi (Lokal)
      
      // Rumus baru v3.0.1: offset = 12 - noonRaw
      const offsetHours = 12 - noonRaw;
      const offsetMs = offsetHours * 3600 * 1000;
      
      const korBujur = (lng - tz * 15) / 15; // Koreksi bujur (jam)
      const eqt = p.eqt; // Equation of time (menit)

      return {
        meta: {
          tanggal: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          koordinat: { lat, lng, tz }
        },
        koreksi: {
          eqtMenit: eqt,
          koreksiBujurMenit: korBujur * 60,
          totalSelisihMenit: offsetHours * 60,
          arahOffset: offsetHours >= 0 ? 'MAJU' : 'LAMBAT'
        },
        offsetMs: offsetMs
      };
    },

    /**
     * Mengambil data Hisab Hilal Awal Bulan
     */
    getHilal: function(params = {}) {
      const hMonth = params.hilalMonth || 10; // default Syawal
      const hYear = params.hilalYear || 1447;
      const lat = typeof params.lat === 'number' ? params.lat : LAT;
      const lng = typeof params.lng === 'number' ? params.lng : LNG;
      const tz = typeof params.tz === 'number' ? params.tz : TZ;
      const elev = typeof params.elev === 'number' ? params.elev : ELEV;
      const crit = params.crit || 'irnu';

      if (typeof calcHilal !== 'function') {
        throw new Error('Modul hilal.js belum dimuat.');
      }

      const result = calcHilal(hMonth, hYear, lat, lng, tz, elev);
      
      return {
        meta: {
          bulanHijriyah: hMonth,
          tahunHijriyah: hYear,
          koordinat: { lat, lng, elev, tz },
          kriteria: crit
        },
        kalkulasi: result
      };
    },

    /**
     * Mengambil perkiraan gerhana Matahari & Bulan terdekat
     */
    getEclipse: function(params = {}) {
      if (typeof searchEclipseNear !== 'function') {
        throw new Error('Modul eclipse.js belum dimuat.');
      }
      
      const year = params.year || new Date().getFullYear();
      const solar = searchEclipseNear(year, 'sun');
      const lunar = searchEclipseNear(year, 'moon');

      return {
        solarNear: solar,
        lunarNear: lunar
      };
    },

    /**
     * Mengambil data Jam Astronomi (Sidereal Time)
     */
    getAstroClock: function(params = {}) {
      const lat = typeof params.lat === 'number' ? params.lat : LAT;
      const lng = typeof params.lng === 'number' ? params.lng : LNG;
      const tz = typeof params.tz === 'number' ? params.tz : TZ;
      
      if (typeof jd !== 'function') {
        throw new Error('Modul astro.js belum dimuat.');
      }

      const now = new Date();
      const jD = jd(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate() + (now.getUTCHours() + now.getUTCMinutes()/60 + now.getUTCSeconds()/3600)/24);
      const dT = deltaT(now.getUTCFullYear());
      const jdE = jD + dT / 86400;

      // GST & LST
      const t = (jD - 2451545.0) / 36525;
      let gst = 280.46061837 + 360.98564736629 * (jD - 2451545.0) + 0.000387933 * t * t - t * t * t / 38710000;
      gst = (gst % 360 + 360) % 360;
      const gstHours = gst / 15;
      
      let lstHours = gstHours + lng / 15;
      lstHours = (lstHours % 24 + 24) % 24;

      // Sun & Moon Positions
      const sun = sunPos(jdE);
      const sunH = toHoriz(sun.ra, sun.dec, jD, lat, lng);
      
      const moon = moonPos(jdE);
      const moonH = toHoriz(moon.ra, moon.dec, jD, lat, lng);

      return {
        timestamp: now.toISOString(),
        julianDay: jD,
        universalTime: now.toISOString().substring(11, 19),
        greenwichSiderealTime: formatHms(gstHours),
        localSiderealTime: formatHms(lstHours),
        sunPosition: {
          rightAscension: sun.ra,
          declination: sun.dec,
          azimuth: sunH.az,
          altitude: sunH.alt
        },
        moonPosition: {
          rightAscension: moon.ra,
          declination: moon.dec,
          azimuth: moonH.az,
          altitude: moonH.alt
        }
      };
    },

    /**
     * Memproses semua parameter input URL (Query Parameters API)
     */
    parseQueryParams: function() {
      const urlParams = new URLSearchParams(window.location.search);
      let changed = false;

      if (urlParams.has('lat')) {
        const val = parseFloat(urlParams.get('lat'));
        if (!isNaN(val)) {
          document.getElementById('inpLat').value = val.toFixed(6);
          changed = true;
        }
      }
      if (urlParams.has('lng')) {
        const val = parseFloat(urlParams.get('lng'));
        if (!isNaN(val)) {
          document.getElementById('inpLng').value = val.toFixed(6);
          changed = true;
        }
      }
      if (urlParams.has('elev')) {
        const val = parseFloat(urlParams.get('elev'));
        if (!isNaN(val)) {
          document.getElementById('inpElev').value = Math.round(val);
          changed = true;
        }
      }
      if (urlParams.has('tz')) {
        const val = parseFloat(urlParams.get('tz'));
        if (!isNaN(val)) {
          document.getElementById('inpTZ').value = val;
          changed = true;
        }
      }
      if (urlParams.has('markaz')) {
        const val = urlParams.get('markaz');
        if (val) {
          document.getElementById('inpMarkaz').value = decodeURIComponent(val);
          changed = true;
        }
      }
      if (urlParams.has('algo')) {
        const val = urlParams.get('algo').toLowerCase();
        const select = document.getElementById('algoSelect');
        if (select && (val === 'jeanmeeus' || val === 'irsyadulmurid')) {
          select.value = val;
          if (typeof ALGO !== 'undefined') ALGO = val;
        }
      }
      if (urlParams.has('ihtiyat')) {
        const val = parseInt(urlParams.get('ihtiyat'));
        const input = document.getElementById('inpIhtiyat');
        if (input && !isNaN(val) && val >= 0 && val <= 10) {
          input.value = val;
          if (typeof IHTIYAT !== 'undefined') IHTIYAT = val;
        }
      }

      // Terapkan jika ada perubahan koordinat
      if (changed && typeof applyLoc === 'function') {
        applyLoc();
      }

      // Navigasi ke tab spesifik jika diminta
      if (urlParams.has('tab')) {
        const tabName = urlParams.get('tab').toLowerCase();
        const tabBtn = document.querySelector(`.tab[data-tab="${tabName}"]`);
        if (tabBtn) {
          tabBtn.click();
        }
      }
    }
  };

  // Helper untuk formatting hms
  function formatHms(h) {
    const hh = Math.floor(h);
    const mRaw = (h - hh) * 60;
    const mm = Math.floor(mRaw);
    const ss = Math.round((mRaw - mm) * 60);
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  }

  // Publikasikan ke window global
  window.AlFajriAPI = AlFajriAPI;

  // ── postMessage Bridge (Akses via iframe) ────────────────────────────
  window.addEventListener('message', function(event) {
    const req = event.data;
    if (!req || req.source !== 'AlFajriAPI_Request') return;

    const response = {
      source: 'AlFajriAPI_Response',
      requestId: req.requestId || null,
      success: false,
      error: null,
      data: null
    };

    try {
      const method = req.method;
      if (typeof AlFajriAPI[method] !== 'function') {
        throw new Error(`Metode API '${method}' tidak ditemukan.`);
      }

      // Eksekusi pemanggilan metode
      const result = AlFajriAPI[method](req.params || {});
      response.success = true;
      response.data = result;
    } catch (err) {
      response.success = false;
      response.error = err.message;
    }

    // Kirim kembali ke website induk/pemanggil
    if (event.source && typeof event.source.postMessage === 'function') {
      event.source.postMessage(response, event.origin);
    }
  });

  // ── Auto-initialize parser parameter URL ketika DOM dimuat ───────────
  window.addEventListener('DOMContentLoaded', function() {
    // Jalankan setelah script main.js selesai rendering awal
    setTimeout(function() {
      AlFajriAPI.parseQueryParams();
    }, 150);
  });

})();
