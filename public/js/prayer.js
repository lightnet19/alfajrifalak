/**
 * prayer.js — Kalkulasi Waktu Sholat (Metode Kemenag: Fajr 20°, Isya 18°)
 * Al-Fajri v2.3.2 | Lembaga Falakiyah PCNU Kencong
 * Depends on: math.js, astro.js
 *
 * CHANGELOG:
 *  v2.3.2 (2026-04-15):
 *   - Tambah waktu Dhuha (ketinggian matahari +4.5°)
 *   - Tambah render Dhuha di renderPrayer() antara Syuruq dan Dzuhur
 */
'use strict';

let _pCache = { result: null, key: null };

/**
 * Hitung waktu sholat untuk tanggal dan lokasi tertentu.
 * Selalu pakai JD tengah hari (noon) agar konsisten tanpa bergantung jam saat ini.
 */
function prayerTimes(year, month, day, lat, lng, tz, elev) {
  const j0   = jd(year, month, day, 12 - tz, 0, 0);   // noon UT
  const sun  = sunPos(j0);
  const noon = 12 - lng / 15 - sun.EqT / 60 + tz;     // jam transit surya (LT)
  const ec   = 0.8333 + 0.0347 * Math.sqrt(elev || 0); // koreksi elevasi

  function ha(altDeg) {
    const c = (sin(altDeg) - sin(lat)*sin(sun.Dec)) / (cos(lat)*cos(sun.Dec));
    return Math.abs(c) > 1 ? null : acos(c) / 15;     // jam
  }
  // Ashar Syafi'i: panjang bayangan = 1× tinggi benda
  const ashrAlt = Math.atan(1 / (Math.tan(Math.abs(lat - sun.Dec) * D2R) + 1)) * R2D;

  const fajr    = ha(-20);
  const syuruq  = ha(-ec);
  const dhuha   = ha(4.5);   // Dhuha: matahari setinggi +4.5° (waktu masuk dhuha)
  const maghrib = ha(-ec);
  const isya    = ha(-18);
  const ashr    = ha(ashrAlt);

  return {
    imsak  : fajr    ? fmtHM(noon - fajr    - 1/6) : '—',
    fajr   : fajr    ? fmtHM(noon - fajr)           : '—',
    syuruq : syuruq  ? fmtHM(noon - syuruq)         : '—',
    dhuha  : dhuha   ? fmtHM(noon - dhuha)           : '—',
    dhuhr  : fmtHM(noon + 0.03),
    ashr   : ashr    ? fmtHM(noon + ashr)            : '—',
    maghrib: maghrib ? fmtHM(noon + maghrib)          : '—',
    isya   : isya    ? fmtHM(noon + isya)             : '—',
    noonRaw: noon, dec: sun.Dec, eqt: sun.EqT
  };
}

// ── Render panel Sholat ───────────────────────────────
function renderPrayer() {
  const now = new Date();
  const key = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${LAT}-${LNG}-${TZ}`;
  if (_pCache.key !== key) {
    _pCache.result = prayerTimes(now.getFullYear(), now.getMonth()+1, now.getDate(), LAT, LNG, TZ, ELEV);
    _pCache.key    = key;
  }
  const p = _pCache.result;
  const prayers = [
    { name:'Imsak',   ar:'إمساك',      t: p.imsak   },
    { name:'Subuh',   ar:'الصُّبح',    t: p.fajr    },
    { name:'Syuruq',  ar:'الشُّرُوق', t: p.syuruq  },
    { name:'Dhuha',   ar:'الضُّحى',   t: p.dhuha   },
    { name:'Dzuhur',  ar:'الظُّهر',    t: p.dhuhr   },
    { name:'Ashar',   ar:'الْعَصر',    t: p.ashr    },
    { name:'Maghrib', ar:'الْمَغرِب',  t: p.maghrib },
    { name:"Isya'",   ar:'الْعِشاء',   t: p.isya    }
  ];
  const nowMin = now.getHours()*60 + now.getMinutes();
  const mins   = prayers.map(x => {
    if (x.t === '—') return -1;
    const [h, m] = x.t.split(':').map(Number); return h*60 + m;
  });
  // blok "aktif" = waktu sholat terakhir yang sudah lewat
  let cur = -1;
  for (let i = 0; i < mins.length; i++) if (mins[i] !== -1 && mins[i] <= nowMin) cur = i;

  document.getElementById('prayerGrid').innerHTML = prayers.map((pr, i) =>
    `<div class="pi ${i===cur?'now':''}"
       ${pr.name==='Dhuha'?'title="Waktu masuk Dhuha (matahari +4.5°)"':''}>
      <div class="pi-name">${pr.name}</div>
      <div class="pi-ar">${pr.ar}</div>
      <div class="pi-time">${pr.t}</div>
    </div>`).join('');

  document.getElementById('sunData').innerHTML = [
    { n:'Deklinasi',   v: p.dec.toFixed(4)+'°' },
    { n:'Eq. of Time', v: p.eqt.toFixed(4)+' mnt' },
    { n:'Kulminasi',   v: fmtHM(p.noonRaw) }
  ].map(x => `<div class="pi"><div class="pi-name">${x.n}</div><div class="pi-time" style="font-size:1.15rem">${x.v}</div></div>`).join('');
}

// ── Countdown (dipanggil tiap detik) ─────────────────
// FIX: pakai total detik agar countdown presisi HH:MM:SS
function tickCountdown() {
  const now = new Date();
  const p   = _pCache.result ||
              prayerTimes(now.getFullYear(), now.getMonth()+1, now.getDate(), LAT, LNG, TZ, ELEV);
  const p5 = [
    { n:'Subuh',   t: p.fajr    },
    { n:'Dzuhur',  t: p.dhuhr   },
    { n:'Ashar',   t: p.ashr    },
    { n:'Maghrib', t: p.maghrib },
    { n:"Isya'",   t: p.isya    }
  ];
  const nowSec = now.getHours()*3600 + now.getMinutes()*60 + now.getSeconds();
  const secs = p5.map(x => {
    if (x.t === '—') return Infinity;
    const [h, m] = x.t.split(':').map(Number); return h*3600 + m*60;
  });
  let ni = 0, mn = 86400;
  for (let i = 0; i < secs.length; i++) {
    let d = secs[i] - nowSec;
    if (d <= 0) d += 86400;   // sudah lewat → hitung ke besok
    if (d < mn) { mn = d; ni = i; }
  }

  const hh = Math.floor(mn/3600), mm = Math.floor((mn%3600)/60), ss = mn%60;
  document.getElementById('cdVal').textContent  = `${pZ(hh)}:${pZ(mm)}:${pZ(ss)}`;
  document.getElementById('cdNext').textContent = `Menuju ${p5[ni].n} (${p5[ni].t})`;
}
