/**
 * istiwa.js — Modul Jam Istiwa (Waktu Hakiki)
 * Al-Fajri v2.5.0 | Lembaga Falakiyah PCNU Kencong
 * Depends on: math.js, astro.js, prayer.js
 */
'use strict';

/**
 * Ambil offset Istiwa dari noonRaw prayer cache.
 * noonRaw adalah waktu kulminasi Matahari dalam jam lokal.
 * Offset = noonRaw - 12 (jam) → positif = Istiwa lebih lambat.
 * @returns {number} offset dalam jam desimal
 */
function getIstiwaOffset() {
  if (typeof _pCache === 'undefined' || !_pCache.result) return 0;
  return _pCache.result.noonRaw - 12;
}

/** Jam desimal → HH:MM:SS string (looping 0-24h) */
function fmtIstiwaHMS(h) {
  h = ((h % 24) + 24) % 24;
  const hh = Math.floor(h);
  const mm = Math.floor((h - hh) * 60);
  const ss = Math.floor(((h - hh) * 60 - mm) * 60);
  return `${pZ(hh)}:${pZ(mm)}:${pZ(ss)}`;
}

/** Format selisih jam desimal → "+X mnt YY dtk" atau "-X mnt YY dtk" */
function fmtDiff(diffHour) {
  const sign   = diffHour >= 0 ? '+' : '-';
  const total  = Math.abs(diffHour) * 3600; // detik
  const mnt    = Math.floor(total / 60);
  const dtk    = Math.round(total % 60);
  return `${sign}${mnt} mnt ${pZ(dtk)} dtk`;
}

/** Nama zona waktu dari TZ offset */
function tzLabel(tz) {
  if (tz === 7) return 'WIB';
  if (tz === 8) return 'WITA';
  if (tz === 9) return 'WIT';
  return `UTC+${tz}`;
}

/**
 * tickIstiwa — dipanggil setiap detik dari main.js
 * Update tampilan Jam Istiwa dan Jam Lokal
 */
function tickIstiwa() {
  const el_iw  = document.getElementById('istiwaClockVal');
  const el_loc = document.getElementById('localClockVal');
  const el_dif = document.getElementById('istiwaClockDiff');
  if (!el_iw || !el_loc || !el_dif) return;

  const now    = new Date();
  const localH = now.getHours() + now.getMinutes()/60 + now.getSeconds()/3600;
  const offset = getIstiwaOffset(); // jam desimal
  const istiwaH = localH + offset;

  el_iw.textContent  = fmtIstiwaHMS(istiwaH);
  el_loc.textContent = fmtIstiwaHMS(localH);

  const sign  = offset >= 0 ? 'MAJU' : 'LAMBAT';
  const color = offset >= 0 ? 'var(--green)' : 'var(--amber)';
  el_dif.textContent  = `Selisih: ${fmtDiff(offset)} (Istiwa ${sign} dari ${tzLabel(TZ)})`;
  el_dif.style.color  = color;
}

/**
 * renderIstiwa — dipanggil dari renderAll() di ui.js
 * Render: parameter koreksi, tabel sholat istiwa, konverter
 */
function renderIstiwa() {
  if (typeof _pCache === 'undefined' || !_pCache.result) return;
  const p      = _pCache.result;
  const offset = p.noonRaw - 12; // jam desimal

  // Komponen individual
  const korBujur = (LNG - TZ * 15) / 15;   // jam
  const eqtHour  = p.eqt / 60;             // menit → jam

  _renderIstiwaParams(offset, korBujur, eqtHour, p.noonRaw);
  _renderIstiwaSholat(p, offset);
  _initIstiwaConverter(offset);
}

function _renderIstiwaParams(offset, korBujur, eqtHour, noonRaw) {
  const el = document.getElementById('istiwaParams');
  if (!el) return;
  el.innerHTML = `
    <div class="iw-param-card">
      <div class="iw-param-lbl">Eq. of Time</div>
      <div class="iw-param-ar">تَعْدِيلُ الزَّمَان</div>
      <div class="iw-param-val ${eqtHour >= 0 ? 'pos' : 'neg'}">${fmtDiff(eqtHour)}</div>
    </div>
    <div class="iw-param-card">
      <div class="iw-param-lbl">Koreksi Bujur</div>
      <div class="iw-param-ar">فَضْلُ الْبَيْض</div>
      <div class="iw-param-val ${korBujur >= 0 ? 'pos' : 'neg'}">${fmtDiff(korBujur)}</div>
    </div>
    <div class="iw-param-card">
      <div class="iw-param-lbl">Total Selisih</div>
      <div class="iw-param-ar">Istiwa − Wasathi</div>
      <div class="iw-param-val ${offset >= 0 ? 'pos' : 'neg'}">${fmtDiff(offset)}</div>
    </div>
    <div class="iw-param-card">
      <div class="iw-param-lbl">Kulminasi (Zawal)</div>
      <div class="iw-param-ar">الزَّوَال</div>
      <div class="iw-param-val">${fmtIstiwaHMS(noonRaw)} ${tzLabel(TZ)}</div>
    </div>
  `;
}

function _renderIstiwaSholat(p, offset) {
  const el = document.getElementById('istiwaSholat');
  if (!el) return;
  const rows = [
    { n:'Imsak',   ar:'إمساك',     w: p.imsak   },
    { n:'Subuh',   ar:'الصبح',    w: p.fajr    },
    { n:'Syuruq',  ar:'الشروق',  w: p.syuruq  },
    { n:'Dhuha',   ar:'الضحى',   w: p.dhuha   },
    { n:'Dzuhur',  ar:'الظهر',    w: p.dhuhr   },
    { n:'Ashar',   ar:'العصر',    w: p.ashr    },
    { n:'Maghrib', ar:'المغرب',  w: p.maghrib },
    { n:"Isya'",   ar:'العشاء',   w: p.isya    },
  ];
  let html = `<thead><tr>
    <th>Sholat</th><th>Arab</th>
    <th>${tzLabel(TZ)}</th><th>Istiwa</th>
  </tr></thead><tbody>`;
  rows.forEach(r => {
    let iw = '—';
    if (r.w !== '—') {
      const parts = r.w.split(':');
      if(parts.length === 2) {
        const h = Number(parts[0]);
        const m = Number(parts[1]);
        iw = fmtIstiwaHMS(h + m/60 + offset);
        iw = iw.substring(0, 5); // HH:MM saja
      }
    }
    html += `<tr>
      <td class="kc">${r.n}</td>
      <td style="font-family:var(--arabic);font-size:1.1rem">${r.ar}</td>
      <td>${r.w}</td>
      <td class="iw-col">${iw}</td>
    </tr>`;
  });
  el.innerHTML = html + '</tbody>';
}

function _initIstiwaConverter(offset) {
  // Wasathi -> Istiwa
  const inpLI = document.getElementById('convLtoI');
  const outLI = document.getElementById('convLtoIRes');
  // Istiwa -> Wasathi
  const inpIL = document.getElementById('convItoL');
  const outIL = document.getElementById('convItoLRes');

  if (!inpLI || !outLI || !inpIL || !outIL) return;

  function doLtoI() {
    const v = inpLI.value;
    if (!v) { outLI.textContent = '--:--:--'; return; }
    const parts = v.split(':').map(Number);
    const h = parts[0] || 0;
    const m = parts[1] || 0;
    const s = parts[2] || 0;
    const localH = h + m/60 + s/3600;
    outLI.textContent = fmtIstiwaHMS(localH + offset);
  }
  
  function doItoL() {
    const v = inpIL.value;
    if (!v) { outIL.textContent = '--:--:--'; return; }
    const parts = v.split(':').map(Number);
    const h = parts[0] || 0;
    const m = parts[1] || 0;
    const s = parts[2] || 0;
    const istiwaH = h + m/60 + s/3600;
    outIL.textContent = fmtIstiwaHMS(istiwaH - offset);
  }

  inpLI.oninput = doLtoI;
  inpIL.oninput = doItoL;
}
