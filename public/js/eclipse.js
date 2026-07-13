/**
 * eclipse.js — Kalkulasi & Render Gerhana Matahari dan Bulan
 * Algoritma: Jean Meeus — Astronomical Algorithms, 2nd ed.
 *   Gerhana Matahari: Chapter 54 | Gerhana Bulan: Chapter 54
 * Al-Fajri v2.6.0 | Lembaga Falakiyah PCNU Kencong
 * Depends on: math.js, astro.js
 */
'use strict';

// ══════════════════════════════════════════════════════
//  INTERNAL HELPERS
// ══════════════════════════════════════════════════════

/** Konversi JD (UT) → Jam Lokal string "HH:MM:SS" */
function _ecJDtoLT(jde, tz) {
  const frac = (jde - Math.floor(jde + 0.5) + 0.5); // 0..1 = jam dalam hari UT
  let h = (frac * 24 + tz + 48) % 24;
  const hh = Math.floor(h);
  const mm = Math.floor((h - hh) * 60);
  const ss = Math.floor(((h - hh) * 60 - mm) * 60);
  return `${pZ(hh)}:${pZ(mm)}:${pZ(ss)}`;
}

/** Format JDE (TDT) → tanggal Gregorian {year,month,day,hour,min} */
function _ecJDtoGreg(jde) {
  return jdG(jde);
}

/**
 * Full-moon JDE untuk indeks k (k adalah bilangan bulat ketika New Moon,
 * k + 0.5 = First Quarter, k + 1 = Full Moon)
 * Menggunakan rumus Meeus Ch.49 yang sama dengan newMoonJDE, tapi untuk Full Moon
 */
function fullMoonJDE(k) {
  // k untuk full moon = k_nm + 0.5
  const kf = k + 0.5;
  const T = kf / 1236.85, T2 = T * T, T3 = T2 * T, T4 = T3 * T;
  let J = 2451550.09766 + 29.530588861 * kf + 0.00015437 * T2 - 0.00000015 * T3 + 0.00000000073 * T4;
  const M  = fix(2.5534     + 29.10535670 * kf - 0.0000014 * T2 - 0.00000011 * T3);
  const Mp = fix(201.5643   + 385.81693528 * kf + 0.0107582 * T2 + 0.00001238 * T3 - 0.000000058 * T4);
  const F  = fix(160.7108   + 390.67050284 * kf - 0.0016118 * T2 - 0.00000227 * T3 + 0.000000011 * T4);
  const Om = fix(124.7746   - 1.56375588 * kf   + 0.0020672 * T2 + 0.00000215 * T3);
  const E  = 1 - 0.002516 * T - 0.0000074 * T2;
  // Full moon corrections (Meeus Table 54.a)
  J += -0.40614 * sin(Mp) + 0.17302 * E * sin(M)   + 0.01614 * sin(2 * Mp)
       + 0.01043 * sin(2 * F) + 0.00734 * E * sin(Mp - M) - 0.00515 * E * sin(Mp + M)
       + 0.00209 * E * E * sin(2 * M) - 0.00111 * sin(Mp - 2 * F) - 0.00057 * sin(Mp + 2 * F)
       + 0.00056 * E * sin(2 * Mp + M) - 0.00042 * sin(3 * Mp) + 0.00042 * E * sin(M + 2 * F)
       + 0.00038 * E * sin(M - 2 * F) - 0.00024 * E * sin(2 * Mp - M) - 0.00017 * sin(Om)
       - 0.00007 * sin(Mp + 2 * M) + 0.00004 * sin(2 * Mp - 2 * F) + 0.00004 * sin(3 * M)
       + 0.00003 * sin(Mp + M - 2 * F) + 0.00003 * sin(2 * Mp + 2 * F) - 0.00003 * sin(Mp + M + 2 * F)
       + 0.00003 * sin(Mp - M + 2 * F) - 0.00002 * sin(Mp - M - 2 * F) - 0.00002 * sin(3 * Mp + M)
       + 0.00002 * sin(4 * Mp);
  return J;
}

// ══════════════════════════════════════════════════════
//  GERHANA BULAN — Meeus Ch.54
// ══════════════════════════════════════════════════════

/**
 * Cek dan hitung parameter gerhana bulan untuk indeks k
 * @returns {object|null} data gerhana, atau null jika tidak terjadi gerhana
 */
function _lunarEclipseForK(k) {
  const kf = k + 0.5; // full moon
  const T  = kf / 1236.85, T2 = T * T, T3 = T2 * T;
  const F  = fix(160.7108 + 390.67050284 * kf - 0.0016118 * T2 - 0.00000227 * T3);

  // Gerhana hanya mungkin jika |sin(F)| < 0.36 (Meeus p.379)
  if (Math.abs(sin(F)) >= 0.36) return null;

  const jde = fullMoonJDE(k);
  const E   = 1 - 0.002516 * T - 0.0000074 * T2;
  const M   = fix(2.5534    + 29.10535670 * kf - 0.0000014 * T2);
  const Mp  = fix(201.5643  + 385.81693528 * kf + 0.0107582 * T2);
  const Om  = fix(124.7746  - 1.56375588 * kf   + 0.0020672 * T2);

  // Parameter u (jarak dari pusat bayangan bumi)
  const u = 0.0059 + 0.0046 * E * cos(M) - 0.0182 * cos(Mp) + 0.0004 * cos(2 * Mp)
            - 0.0005 * cos(M + Mp);

  // Magnitude penumbral & umbral (Meeus p.380)
  const F1 = F - 0.02665 * sin(Om);
  const penMag   = 1.0128 - u - Math.abs(sin(F1));
  const umbraMag = (1.0128 - Math.abs(sin(F1))) / 1.0128; // umbral fraction

  let jenis = null, magnitude = 0;
  if (u < -0.0010) {
    jenis = 'Total'; magnitude = penMag + 0.6864 / (1.0128 - u); // rough umbral mag
  } else if (u < 0.1026) {
    jenis = 'Sebagian'; magnitude = 1.0128 - u - Math.abs(sin(F1));
  } else if (u < 1.0128) {
    jenis = 'Penumbral'; magnitude = 1.0128 - u;
  } else {
    return null; // no eclipse
  }

  // Waktu kontak — Meeus p.381 (semi-durations P1,U1,U2,U3,U4,P4)
  const n = 0.5458 + 0.04 * cos(Mp);
  const gamma = sin(F1);
  const rho   = 1.2847 + u;
  const sigma = 0.7403 - u;

  // Durasi tahapan (menit)
  let P1 = null, U1 = null, U4 = null, P4 = null, U2 = null, U3 = null;
  // penumbral
  const pArg = 1.0128 - u;
  if (pArg * pArg > gamma * gamma) {
    P1 = 60 / n * Math.sqrt(pArg * pArg - gamma * gamma);
    P4 = P1;
  }
  // umbral
  const uArg = 0.4678 - u;
  if (uArg * uArg > gamma * gamma) {
    U1 = 60 / n * Math.sqrt(uArg * uArg - gamma * gamma);
    U4 = U1;
  }
  // totality
  const tArg = 0.1666 + u; // < 0 for partial
  if (u < -0.0010 && tArg * tArg < gamma * gamma) {
    // partial total? Meeus uses different formula
  } else if (u < -0.0010) {
    const t2 = 0.1666 + u;
    if (t2 * t2 > gamma * gamma) {
      U2 = 60 / n * Math.sqrt(t2 * t2 - gamma * gamma);
      U3 = U2;
    }
  }

  // Build contact times (minutes from max eclipse)
  const contacts = [];
  if (P1 != null) contacts.push({ label: 'P1 (Penumbra masuk)', dMin: -P1 });
  if (U1 != null) contacts.push({ label: 'U1 (Umbra masuk)',    dMin: -U1 });
  if (U2 != null) contacts.push({ label: 'U2 (Totalitas mulai)', dMin: -U2 });
  contacts.push(              { label: 'Puncak Gerhana',       dMin:   0 });
  if (U3 != null) contacts.push({ label: 'U3 (Totalitas berakhir)', dMin: U3 });
  if (U4 != null) contacts.push({ label: 'U4 (Umbra keluar)',   dMin:  U4 });
  if (P4 != null) contacts.push({ label: 'P4 (Penumbra keluar)', dMin:  P4 });

  const greg = _ecJDtoGreg(jde);
  const dT = deltaT(greg.year + greg.month / 12);
  const jde_ut = jde - dT / 86400;

  return {
    type: 'lunar',
    jenis,
    magnitude: Math.max(0, magnitude).toFixed(4),
    jde,
    jde_ut,
    greg,
    contacts: contacts.map(c => ({
      label: c.label,
      jde_ut: jde_ut + c.dMin / (24 * 60),
    })),
    F1: F1.toFixed(4),
    gamma: gamma.toFixed(4),
  };
}

/**
 * Gerhana bulan terdekat dari tanggal referensi (year, month)
 * @returns {object} data gerhana terlengkap
 */
function nextLunarEclipse(year, month) {
  let k = kFromYM(year, month);
  for (let dk = -1; dk <= 24; dk++) {
    const res = _lunarEclipseForK(k + dk);
    const jde_check = fullMoonJDE(k + dk);
    const g = _ecJDtoGreg(jde_check);
    const refJD = jd(year, month, 1);
    if (jde_check >= refJD - 16 && res) return res;
  }
  return null;
}

// ══════════════════════════════════════════════════════
//  GERHANA MATAHARI — Meeus Ch.54
// ══════════════════════════════════════════════════════

/**
 * Cek dan hitung parameter gerhana matahari untuk indeks k (new moon)
 * @returns {object|null} data gerhana atau null
 */
function _solarEclipseForK(k) {
  const T  = k / 1236.85, T2 = T * T, T3 = T2 * T;
  const F  = fix(160.7108 + 390.67050284 * k - 0.0016118 * T2 - 0.00000227 * T3);

  // Gerhana hanya mungkin jika |sin(F)| < 0.36
  if (Math.abs(sin(F)) >= 0.36) return null;

  const jde = newMoonJDE(k);
  const E   = 1 - 0.002516 * T - 0.0000074 * T2;
  const M   = fix(2.5534    + 29.10535670 * k - 0.0000014 * T2);
  const Mp  = fix(201.5643  + 385.81693528 * k + 0.0107582 * T2);
  const Om  = fix(124.7746  - 1.56375588 * k   + 0.0020672 * T2);
  const F1  = F - 0.02665 * sin(Om);
  const A1  = fix(299.77 + 0.107408 * k - 0.009173 * T2);

  // u (Meeus Eq 54.1) — parameter penentuan jenis gerhana
  const u = 0.0059 + 0.0046 * E * cos(M) - 0.0182 * cos(Mp) + 0.0004 * cos(2 * Mp)
            - 0.0005 * cos(M + Mp);

  let jenis, magnitude;
  const gam = Math.abs(sin(F1)); // |sin(F1)| ≈ gamma (aproksimasi untuk klasifikasi)

  // Klasifikasi berdasarkan Meeus p.383
  if (gam <= 0.9972 && u < 0) {
    jenis = 'Total'; magnitude = 1 - u / 0.272;
  } else if (gam <= 0.9972 && u >= 0 && u <= 0.0047) {
    jenis = 'Hibrid'; magnitude = 1 - u / 0.272;
  } else if (gam <= 0.9972) {
    jenis = 'Cincin'; magnitude = (1 - u / 0.272).toFixed(4);
  } else if (gam <= 1.5433 + u) {
    jenis = 'Sebagian'; magnitude = (1.5433 + u - gam) / (0.5461 + 2 * u);
  } else {
    return null; // no eclipse
  }

  if (typeof magnitude === 'number') magnitude = magnitude.toFixed(4);

  // Waktu kontak berdasarkan Meeus (semi-durations)
  // Gerhana total/hibrid/cincin memiliki C1-C4, partial hanya C1 & C4
  const n = 0.5458 + 0.04 * cos(Mp);
  const contacts = [];
  const gamF = sin(F1);

  // C1 & C4 (penumbral / first & last external contact)
  const pArg2 = 1.5433 + u;
  if (pArg2 * pArg2 > gamF * gamF) {
    const dC1 = 60 / n * Math.sqrt(pArg2 * pArg2 - gamF * gamF);
    contacts.push({ label: 'C1 (Kontak I)',   dMin: -dC1 });
  }
  // C2 & C3 (internal, untuk total/cincin/hibrid)
  if (['Total','Cincin','Hibrid'].includes(jenis)) {
    const iArg2 = 0.4678 - u;
    if (iArg2 * iArg2 > gamF * gamF) {
      const dC2 = 60 / n * Math.sqrt(iArg2 * iArg2 - gamF * gamF);
      contacts.push({ label: 'C2 (Kontak II)',  dMin: -dC2 });
    }
  }
  contacts.push({ label: 'Puncak Gerhana', dMin: 0 });
  if (['Total','Cincin','Hibrid'].includes(jenis)) {
    const iArg2 = 0.4678 - u;
    if (iArg2 * iArg2 > gamF * gamF) {
      const dC3 = 60 / n * Math.sqrt(iArg2 * iArg2 - gamF * gamF);
      contacts.push({ label: 'C3 (Kontak III)', dMin: dC3 });
    }
  }
  const pArg2c4 = 1.5433 + u;
  if (pArg2c4 * pArg2c4 > gamF * gamF) {
    const dC4 = 60 / n * Math.sqrt(pArg2c4 * pArg2c4 - gamF * gamF);
    contacts.push({ label: 'C4 (Kontak IV)',  dMin: dC4 });
  }

  const greg = _ecJDtoGreg(jde);
  const dT = deltaT(greg.year + greg.month / 12);
  const jde_ut = jde - dT / 86400;

  return {
    type: 'solar',
    jenis,
    magnitude: String(magnitude),
    jde,
    jde_ut,
    greg,
    contacts: contacts.map(c => ({
      label: c.label,
      jde_ut: jde_ut + c.dMin / (24 * 60),
    })),
    gamma: gamF.toFixed(4),
    u: u.toFixed(6),
  };
}

/**
 * Gerhana matahari terdekat dari tanggal referensi
 */
function nextSolarEclipse(year, month) {
  let k = kFromYM(year, month);
  for (let dk = -1; dk <= 24; dk++) {
    const jde_check = newMoonJDE(k + dk);
    const refJD = jd(year, month, 1);
    if (jde_check >= refJD - 16) {
      const res = _solarEclipseForK(k + dk);
      if (res) return res;
    }
  }
  return null;
}

/**
 * Daftar semua gerhana (solar + lunar) dalam rentang 2 tahun ke depan
 * @returns {Array} array objek gerhana diurutkan berdasarkan JDE
 */
function eclipsesInRange(year, month, numMonths) {
  const result = [];
  let k = kFromYM(year, month);
  const totalK = Math.ceil(numMonths * 12.3685 / 12) + 2;
  for (let dk = -1; dk <= totalK; dk++) {
    const kc = k + dk;
    const jde_nm = newMoonJDE(kc);
    const g_nm = _ecJDtoGreg(jde_nm);
    const refEnd = jd(year, month, 1) + numMonths * 30.44;
    if (jde_nm < jd(year, month, 1) - 16) continue;
    if (jde_nm > refEnd) break;

    const sol = _solarEclipseForK(kc);
    if (sol) result.push(sol);

    const lun = _lunarEclipseForK(kc);
    if (lun) result.push(lun);
  }
  return result.sort((a, b) => a.jde_ut - b.jde_ut);
}

// ══════════════════════════════════════════════════════
//  FORMAT HELPERS
// ══════════════════════════════════════════════════════

function _jenisIcon(jenis, type) {
  if (type === 'solar') {
    const m = { 'Total':'🌑☀', 'Cincin':'💍☀', 'Hibrid':'🌑💍', 'Sebagian':'🌓☀' };
    return m[jenis] || '☀';
  } else {
    const m = { 'Total':'🌕🔴', 'Sebagian':'🌔', 'Penumbral':'🌕' };
    return m[jenis] || '🌕';
  }
}

function _jenisColor(jenis) {
  const m = { 'Total':'var(--red)', 'Cincin':'var(--amber)', 'Hibrid':'var(--amber)',
              'Sebagian':'var(--text2)', 'Penumbral':'var(--text3)' };
  return m[jenis] || 'var(--text2)';
}

function _gregStr(g) {
  const mo = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
  return `${g.day} ${mo[g.month - 1]} ${g.year}`;
}

// ══════════════════════════════════════════════════════
//  RENDER UI
// ══════════════════════════════════════════════════════

/** Cache hasil kalkulasi agar tidak dihitung ulang setiap render */
let _ecCache = null;
let _ecCacheKey = '';

function renderEclipse() {
  const cacheKey = `${LAT},${LNG},${TZ}`;
  if (!_ecCache || _ecCacheKey !== cacheKey) {
    const now = new Date();
    const y = now.getFullYear(), mo = now.getMonth() + 1;
    _ecCache = {
      solar: nextSolarEclipse(y, mo),
      lunar: nextLunarEclipse(y, mo),
      list:  eclipsesInRange(y, mo, 24),
    };
    _ecCacheKey = cacheKey;
  }

  _renderEclipseCard('ec-solar-card', _ecCache.solar, 'Gerhana Matahari Terdekat');
  _renderEclipseCard('ec-lunar-card', _ecCache.lunar, 'Gerhana Bulan Terdekat');
  _renderEclipseList('ec-list-body', _ecCache.list);
}

function _renderEclipseCard(cardId, data, title) {
  const el = document.getElementById(cardId);
  if (!el) return;
  if (!data) {
    el.innerHTML = `<div class="ec-empty">Tidak ada gerhana terdeteksi dalam 2 tahun ke depan.</div>`;
    return;
  }

  const icon = _jenisIcon(data.jenis, data.type);
  const col  = _jenisColor(data.jenis);
  const typeLabel = data.type === 'solar' ? 'Gerhana Matahari' : 'Gerhana Bulan';
  const typeAr    = data.type === 'solar' ? 'كُسُوف الشَّمْس' : 'خُسُوف الْقَمَر';

  let contactHtml = '';
  data.contacts.forEach(c => {
    const ltStr = _ecJDtoLT(c.jde_ut, TZ);
    const isMax = c.label.includes('Puncak');
    contactHtml += `
      <tr class="${isMax ? 'ec-max-row' : ''}">
        <td>${c.label}</td>
        <td class="ec-time">${ltStr} ${TZ >= 0 ? 'WIB' : 'UT'}</td>
        <td class="ec-time-ut">${_ecJDtoLT(c.jde_ut, 0)} UT</td>
      </tr>`;
  });

  el.innerHTML = `
    <div class="ec-card-head">
      <div class="ec-icon">${icon}</div>
      <div>
        <div class="ec-type-label" style="color:${col}">${data.jenis} — ${typeLabel}</div>
        <div class="ec-ar">${typeAr}</div>
        <div class="ec-date">${_gregStr(data.greg)}</div>
      </div>
      <div class="ec-mag-box">
        <div class="ec-mag-val">${data.magnitude}</div>
        <div class="ec-mag-lbl">Magnitude</div>
      </div>
    </div>
    <div class="ec-params-row">
      <div class="ec-param-pill">γ = ${data.gamma}</div>
      ${data.u ? `<div class="ec-param-pill">u = ${data.u}</div>` : ''}
      <div class="ec-param-pill">JDE ${data.jde.toFixed(4)}</div>
    </div>
    <div style="overflow-x:auto">
      <table class="dtbl ec-contact-tbl">
        <thead><tr><th>Fase</th><th>Waktu Lokal</th><th>UT</th></tr></thead>
        <tbody>${contactHtml}</tbody>
      </table>
    </div>`;
}

function _renderEclipseList(tbodyId, list) {
  const el = document.getElementById(tbodyId);
  if (!el) return;
  if (!list || list.length === 0) {
    el.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text3)">Tidak ada data</td></tr>`;
    return;
  }
  el.innerHTML = list.map(e => {
    const icon = _jenisIcon(e.jenis, e.type);
    const typeLabel = e.type === 'solar' ? 'Matahari' : 'Bulan';
    const col = _jenisColor(e.jenis);
    return `<tr>
      <td>${_gregStr(e.greg)}</td>
      <td>${icon} ${typeLabel}</td>
      <td style="color:${col}">${e.jenis}</td>
      <td>${e.magnitude}</td>
    </tr>`;
  }).join('');
}
