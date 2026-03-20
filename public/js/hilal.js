/**
 * hilal.js — Kalkulasi Hilal & Render Laporan
 * Algoritma: Jean Meeus — Astronomical Algorithms ed.2
 * Al-Fajri v2.1 — Lembaga Falakiyah PCNU Kencong
 *
 * Depends on: math.js, astro.js
 * Functions: calcHilal(), doCalcHilal(), renderHilalReport()
 */
'use strict';

const MON3 = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];

// ════════════════════════════════════════════════════════
//  HITUNG HILAL
// ════════════════════════════════════════════════════════
function calcHilal(hYear, hMonth, lat, lng, elev, tz) {
  const markaz = document.getElementById('inpMarkaz').value || '—';

  // 1. Temukan new moon JDE yang mengawali hMonth/hYear
  //    → pakai titik ~15 hari sebelum 1 hMonth (dengan hijriToJD yang sudah diperbaiki)
  const approxGreg = jdG(hijriToJD(hYear, hMonth, 1) - 15);
  let bestK = kFromYM(approxGreg.year, approxGreg.month), bestDiff = 999;
  for (let dk = -1; dk <= 2; dk++) {
    const jde = newMoonJDE(bestK + dk);
    const h = jdToHijri(jde);   // jdToHijri = alias untuk jdH dari math.js
    const diff = Math.abs((h.year - hYear)*12 + (h.month - (hMonth - 1)));
    if (diff < bestDiff) { bestDiff = diff; bestK = bestK + dk; }
  }

  const jdeTDT = newMoonJDE(bestK);
  const gregI  = jdG(jdeTDT);
  const dT_s   = deltaT(gregI.year + gregI.month / 12);
  const jdIjtima = jdeTDT - dT_s / 86400; // TDT → UT

  // 2. Tentukan tanggal rukyat (hari ijtima, atau besoknya jika ijtima setelah magrib)
  const gregI2 = jdG(jdIjtima);
  const obsBase = jd(gregI2.year, gregI2.month, gregI2.day);
  const ss0 = calcSunSet(obsBase, lat, lng, tz, elev);
  const obsJD = (ss0 && jdIjtima > ss0) ? obsBase + 1 : obsBase;

  // 3. Matahari terbenam & bulan terbenam di hari rukyat
  const jdSunset  = calcSunSet(obsJD, lat, lng, tz, elev);
  if (!jdSunset) return { error: 'Matahari tidak terbenam pada tanggal ini.' };
  const jdMoonset = calcMoonSet(obsJD, lat, lng, tz, elev);

  // 4. Posisi Matahari & Bulan saat matahari terbenam
  const sunG  = sunPos(jdSunset);
  const moonG = moonPos(jdSunset);
  const sunT  = topoCorrect(sunG,  lat, lng, elev, jdSunset);
  const moonT = topoCorrect(moonG, lat, lng, elev, jdSunset);

  // 5. Koordinat horizontal (alt/az)
  const sunH     = toHoriz(sunT.RA,  sunT.Dec,  lat, lng, jdSunset);
  const moonH    = toHoriz(moonT.RA, moonT.Dec, lat, lng, jdSunset);
  const moonGeoH = toHoriz(moonG.RA, moonG.Dec, lat, lng, jdSunset);

  // 6. Tinggi hilal dalam berbagai jenis
  const altMoonGeo      = moonGeoH.alt;
  const altSunAirless   = sunH.alt;
  const altMoonAirless  = moonH.alt;
  const SD = moonT.SD;

  // Apparent = airless + refraksi atmosfer
  const altMoonApparent = altMoonAirless + refraction(altMoonAirless);
  // Mar'i = apparent + dip cakrawala akibat ketinggian
  const horizDip = (elev > 0) ? 0.0353 * Math.sqrt(elev) * R2D : 0;
  const altMoonMari = altMoonApparent + horizDip;

  // 7. Elongasi
  const elongGeo  = elongation(moonG.RA, moonG.Dec, sunG.RA, sunG.Dec);
  const elongTopo = elongation(moonT.RA, moonT.Dec, sunT.RA, sunT.Dec);

  // 8. Lebar hilal, illuminasi, nurul hilal
  const W_arcsec   = moonT.SD * 2 * 3600 * Math.pow(Math.sin(elongTopo * D2R / 2), 2);
  const W_arcmin   = W_arcsec / 60;
  const illuminasi = (1 - Math.cos(elongGeo * D2R)) / 2 * 100;
  const nurulHilal = W_arcsec * Math.PI / 648000;

  // 9. Ijtima toposentrik (elongasi minimum di sekitar geo ijtima)
  let jdIjtimaT = jdIjtima, minE = 999;
  for (let dt = -0.3; dt <= 0.3; dt += 0.002) {
    const jt = jdIjtima + dt;
    const s2 = sunPos(jt), m2 = moonPos(jt);
    const st2 = topoCorrect(s2, lat, lng, elev, jt);
    const mt2 = topoCorrect(m2, lat, lng, elev, jt);
    const e2 = elongation(mt2.RA, mt2.Dec, st2.RA, st2.Dec);
    if (e2 < minE) { minE = e2; jdIjtimaT = jt; }
  }

  // 10. Waktu lokal (dari JD)
  const lt = j => ((j - (Math.floor(j + 0.5) - 0.5)) * 24) + tz;
  const sunsetLT     = lt(jdSunset);
  const moonsetLT    = jdMoonset ? lt(jdMoonset) : null;
  const ijtimaGeoLT  = lt(jdIjtima);
  const ijtimaGeoUT  = ijtimaGeoLT - tz;
  const ijtimaTopoLT = lt(jdIjtimaT);
  const ijtimaTopoUT = ijtimaTopoLT - tz;
  const bestTimeLT   = moonsetLT ? (sunsetLT + moonsetLT) / 2 : sunsetLT + 0.1;
  const lamaHilal    = moonsetLT ? moonsetLT - sunsetLT : 0;
  const umurHilal    = sunsetLT - ijtimaGeoLT;

  // 11. Arc of Vision (ARCV)
  const ARCV = altMoonApparent - altSunAirless;

  // 12. Kriteria visibilitas
  // IRNU 2022: T. Mar'i ≥ 3° DAN Elongasi Geo ≥ 6.4°
  const irnu_vis = altMoonMari >= 3.0 && elongGeo >= 6.4;
  const irnu_mar = altMoonMari >= 2.0 && elongGeo >= 4.0;
  // Wujudul Hilal: ijtima sebelum sunset & bulan terbenam setelah matahari
  const wujud = jdIjtima < jdSunset && (jdMoonset ? jdMoonset > jdSunset : false);
  // Odeh 2006 & Yallop 1997
  const qOdeh   = ARCV - ((-0.1018*W_arcmin**3) + (0.7319*W_arcmin**2) - (6.3226*W_arcmin) + 7.1651);
  const qYallop = (ARCV - (11.8371 - 6.3226*W_arcmin + 0.7319*W_arcmin**2 - 0.1018*W_arcmin**3)) / 10;

  // 13. Posisi hilal relatif terhadap matahari
  const posisiDeg = Math.abs(moonT.Dec - sunT.Dec);
  const posisiDir = moonT.Dec > sunT.Dec ? 'Utara' : 'Selatan';
  const keadaan   = moonT.Dec > 0 ? 'Miring ke Utara' : 'Miring ke Selatan';

  // 14. Azimuth saat hilal terbenam
  const mms     = jdMoonset ? moonPos(jdMoonset) : moonG;
  const tmms    = jdMoonset ? topoCorrect(mms, lat, lng, elev, jdMoonset) : moonT;
  const moonHMs = toHoriz(tmms.RA, tmms.Dec, lat, lng, jdMoonset || jdSunset);

  // 15. Prediksi hari pertama Syawal (kriteria IRNU)
  let predJD = null;
  for (let d = 0; d <= 4; d++) {
    const to   = obsJD + d;
    const ts   = calcSunSet(to, lat, lng, tz, elev);
    if (!ts) continue;
    const tm   = moonPos(ts), tsun = sunPos(ts);
    const tmt  = topoCorrect(tm, lat, lng, elev, ts);
    const tmh  = toHoriz(tmt.RA, tmt.Dec, lat, lng, ts);
    const tmar = tmh.alt + refraction(tmh.alt) + horizDip;
    const telG = elongation(tm.RA, tm.Dec, tsun.RA, tsun.Dec);
    if (tmar >= 3.0 && telG >= 6.4) { predJD = to; break; }
    if (d >= 3 && !predJD) predJD = to + 1;
  }
  const predGreg = predJD ? jdG(predJD + 0.5) : null;
  const predWtn  = predJD ? weton(predJD + 0.5) : '—';

  return {
    markaz, hYear, hMonth, lat, lng, elev, tz,
    jdIjtima, jdSunset, dT_s,
    ijtimaGeoLT, ijtimaGeoUT, ijtimaTopoLT, ijtimaTopoUT,
    sunsetLT, moonsetLT, bestTimeLT, lamaHilal, umurHilal,
    sunG, moonG, sunT, moonT, sunH, moonH,
    altMoonGeo, altSunAirless, altMoonAirless, altMoonApparent, altMoonMari,
    SD, HP: moonT.HP,
    elongGeo, elongTopo,
    W_arcsec, W_arcmin, illuminasi, nurulHilal, ARCV,
    qOdeh, qYallop, irnu_vis, irnu_mar, wujud,
    posisiDeg, posisiDir, keadaan, moonHMs,
    ijtimaGreg: jdG(jdIjtima),
    obsGreg:    jdG(obsJD + 0.5),
    wetonIjtima: weton(jdIjtima + tz / 24),
    wetonObs:    weton(obsJD + 0.5),
    sunAtIjtima:   sunPos(jdIjtima),
    moonAtIjtimaT: moonPos(jdIjtimaT),
    predGreg, predWtn
  };
}

// ════════════════════════════════════════════════════════
//  RENDER LAPORAN
// ════════════════════════════════════════════════════════
function renderHilalReport(r) {
  if (r.error) {
    document.getElementById('hilalOut').innerHTML =
      `<span style="color:var(--red)">${r.error}</span>`;
    return;
  }
  const SEP = '═'.repeat(60);
  function row(k, v, cls) {
    const dots = '.'.repeat(Math.max(1, 32 - k.length));
    return `<span style="color:var(--text3)">${k}${dots}:</span> `
         + `<span class="hv ${cls||''}">${v}</span>\n`;
  }
  function sec(t)  { return `<span style="color:var(--gold)">── ${t} ──</span>\n`; }
  function sep()   { return `<span style="color:var(--text3)">${SEP}</span>\n`; }

  const latStr = `${r.lat < 0?'S':'N'} ${dmsU(Math.abs(r.lat))}`;
  const lngStr = `${r.lng < 0?'W':'E'} ${dmsU(Math.abs(r.lng))}`;
  const pred   = r.predGreg
    ? `${r.predWtn}, ${r.predGreg.day} ${MON3[r.predGreg.month-1]} ${r.predGreg.year} M`
    : '—';

  const lhH = Math.floor(r.lamaHilal);
  const lhM = Math.floor((r.lamaHilal - lhH) * 60);
  const lhS = ((r.lamaHilal - lhH) * 60 - lhM) * 60;
  const uhH = Math.floor(r.umurHilal);
  const uhM = Math.floor((r.umurHilal - uhH) * 60);
  const uhS = ((r.umurHilal - uhH) * 60 - uhM) * 60;

  const hijI  = jdToHijri(r.jdIjtima);   // gunakan jdToHijri (alias jdH)

  let html =
    `<span style="display:block;text-align:center;font-family:'Cormorant Garamond',serif;font-size:1rem;color:var(--gold2)">` +
    `Awal Bulan ${HM[r.hMonth-1]} ${r.hYear} H</span>\n` +
    `<span style="display:block;text-align:center;color:var(--text2);font-size:.72rem">` +
    `Al-Fajri — Lembaga Falakiyah PCNU Kencong | Jean Meeus (${MLR.length}+${MB.length} Suku Koreksi)</span>\n`;

  html += sep();
  html += row('Markaz',      r.markaz);
  html += row('Lintang',     latStr);
  html += row('Bujur',       lngStr);
  html += row('Elevasi',     r.elev.toFixed(1) + ' mdpl');
  html += row('Zona Waktu',  'UTC+' + r.tz);
  html += sep() + sec('DATA IJTIMA');
  html += row('Tanggal Ijtima Geo',
    `${r.wetonIjtima}, ${r.ijtimaGreg.day} ${MON3[r.ijtimaGreg.month-1]} ${r.ijtimaGreg.year} M`, 'gd');
  html += row('Ijtima Hijriyah Geo', `${hijI.day} ${HM[hijI.month-1]} ${hijI.year} H`);
  html += row('Bujur Ijtima Geo',    dms(r.sunAtIjtima.sunLon));
  html += row('Bujur Ijtima Topo',   dms(r.moonAtIjtimaT.lon));
  html += '\n';
  html += row('Is Visible?', r.irnu_vis ? '👁  VISIBLE' : '✗  Not Visible', r.irnu_vis?'g':'r');
  html += row('JD Ijtima',   r.jdIjtima.toFixed(9));
  html += row('JD Sunset',   r.jdSunset.toFixed(9));
  html += row('DeltaT',      r.dT_s.toFixed(2) + ' s');
  html += '\n';
  html += row('Jam Ijtima Geo LT',   fmtF(r.ijtimaGeoLT));
  html += row('Jam Ijtima Geo UT',   fmtF(r.ijtimaGeoUT));
  html += row('Jam Ijtima Topo LT',  fmtF(r.ijtimaTopoLT));
  html += row('Jam Ijtima Topo UT',  fmtF(r.ijtimaTopoUT));
  html += sep() + sec('WAKTU TERBENAM');
  html += row('Matahari Terbenam', fmtF(r.sunsetLT)  + ' LT', 'gd');
  html += row('Hilal Terbenam',    r.moonsetLT ? fmtF(r.moonsetLT) + ' LT' : '—', 'gd');
  html += sep() + sec('POSISI BENDA LANGIT (TOPO AT SUNSET)');
  html += row('Bujur Hilal Topo',    dms(r.moonG.lon));
  html += row('Lintang Hilal Topo',  dms(r.moonG.lat));
  html += row('Bujur Matahari Topo', dms(r.sunT.lambda || r.sunG.sunLon));
  html += row('Hilal RA Topo Hour',  hms(r.moonT.RA / 15));
  html += row('Hilal Topo Decli',    dms(r.moonT.Dec));
  html += row('Sun RA Topo Hour',    hms(r.sunT.RA / 15));
  html += row('Sun Topo Decli',      dms(r.sunT.Dec));
  html += sep() + sec('TINGGI HILAL');
  html += row('T. Hilal Hakiki/Geo',           dms(r.altMoonGeo), 'gd');
  html += row('T. Airless Topo Sun',           dms(r.altSunAirless));
  html += '\n';
  html += row('T. Hilal Topo Airless Upper',   dms(r.altMoonAirless + r.SD));
  html += row('T. Hilal Topo Airless Center',  dms(r.altMoonAirless), 'gd');
  html += row('T. Hilal Topo Airless Lower',   dms(r.altMoonAirless - r.SD));
  html += '\n';
  html += row('T. Hilal Topo Apparent Upper',  dms(r.altMoonApparent + r.SD));
  html += row('T. Hilal Topo Apparent Center', dms(r.altMoonApparent), 'gd');
  html += row('T. Hilal Topo Apparent Lower',  dms(r.altMoonApparent - r.SD));
  html += '\n';
  html += row("T. Hilal Mar'i Upper",           dms(r.altMoonMari + r.SD));
  html += row("T. Hilal Mar'i Center",          dms(r.altMoonMari), 'gd');
  html += row("T. Hilal Mar'i Lower",           dms(r.altMoonMari - r.SD));
  html += sep() + sec('AZIMUTH & ELONGASI');
  html += row('Az. Matahari',         dmsU(r.sunH.az));
  html += row('Az. Hilal',            dmsU(r.moonH.az));
  html += row('Elongasi Hilal Geo',   dms(r.elongGeo), 'gd');
  html += row('Elongasi Hilal Topo',  dms(r.elongTopo));
  html += sep() + sec('PARAMETER HILAL');
  html += row('Best Time',       fmtF(r.bestTimeLT) + ' LT');
  html += row('Lama Hilal',      `${pZ(lhH)} h ${pZ(lhM)} m ${lhS.toFixed(2).padStart(5,'0')} s`);
  html += row('Umur Hilal',      `${pZ(uhH)}h ${pZ(uhM)}m ${uhS.toFixed(2).padStart(5,'0')}s`);
  html += row('Az. Ghurub Hilal',dmsU(r.moonHMs.az));
  html += row('Semidiameter Hilal', dms(r.SD));
  html += row('Horizontal Plx Hilal', dms(r.HP));
  html += row('Posisi Hilal',    `${dmsU(r.posisiDeg)} ${r.posisiDir} Matahari`);
  html += row('Keadaan Hilal',   r.keadaan);
  html += sep() + sec('FOTOMETRI & VISIBILITAS');
  html += row('Illuminasi Hilal', r.illuminasi.toFixed(2) + ' %', 'gd');
  html += row('Lebar Hilal (W)', `${dmsU(r.W_arcsec/3600)} (${r.W_arcsec.toFixed(2)}″)`);
  html += row('Nurul Hilal',     r.nurulHilal.toFixed(8));
  html += row('Range q Odeh',   r.qOdeh.toFixed(3), r.qOdeh>=2?'g':r.qOdeh>=-0.96?'a':'r');
  html += row('ARCV',            r.ARCV.toFixed(4) + '°');
  html += row('Jarak Bumi-Bulan', r.moonG.dist.toFixed(2) + ' km');
  html += sep() + sec('KRITERIA VISIBILITAS');
  html += row("IRNU/NU (Mar'i≥3°,Elong≥6.4°)",
    r.irnu_vis ? '✓ TERPENUHI' : '✗ Tidak Terpenuhi', r.irnu_vis?'g':r.irnu_mar?'a':'r');
  html += row('Wujudul Hilal',
    r.wujud ? '✓ TERPENUHI' : '✗ Tidak Terpenuhi', r.wujud?'g':'r');
  html += row('Odeh',
    r.qOdeh>=5.65?'A — Mudah Terlihat':r.qOdeh>=2?'B — Terlihat':r.qOdeh>=-0.96?'C — Marginal':'D — Tidak Terlihat',
    r.qOdeh>=2?'g':r.qOdeh>=-0.96?'a':'r');
  html += '\n';
  html += row('Prediksi Kri. IRNU', pred, 'gd');
  html += sep();
  html += `<span style="display:block;text-align:center;color:var(--text3);font-size:.68rem">` +
          `Al-Fajri v2.1 — Jean Meeus — Lembaga Falakiyah PCNU Kencong</span>`;

  document.getElementById('hilalOut').innerHTML = html;

  // Kartu kriteria
  document.getElementById('hilalCritDiv').style.display = 'block';
  const crits = [
    {
      name: 'IRNU / NU (LF-PBNU 2022)',
      desc: "T. Mar'i ≥ 3° DAN Elongasi Geo ≥ 6.4°",
      res:  r.irnu_vis ? 'Terlihat (Visible)' : r.irnu_mar ? 'Batas (Marginal)' : 'Tidak Terlihat',
      cls:  r.irnu_vis ? 'v' : r.irnu_mar ? 'm' : 'x',
      det:  `T. Mar'i: ${dms(r.altMoonMari)} | Elong: ${dms(r.elongGeo)}`
    },
    {
      name: 'Wujudul Hilal',
      desc: 'Ijtima sebelum matahari terbenam & bulan terbenam setelah matahari',
      res:  r.wujud ? 'Wujud — Terpenuhi' : 'Tidak Wujud',
      cls:  r.wujud ? 'v' : 'x',
      det:  `Ijtima: ${fmtF(r.ijtimaGeoLT)} | Sunset: ${fmtF(r.sunsetLT)}`
    },
    {
      name: 'Odeh 2006',
      desc: 'Berdasarkan ARCV dan Lebar Hilal (W)',
      res:  r.qOdeh>=5.65?'A — Mudah':r.qOdeh>=2?'B — Terlihat':r.qOdeh>=-0.96?'C — Marginal':'D — Tidak',
      cls:  r.qOdeh>=2?'v':r.qOdeh>=-0.96?'m':'x',
      det:  `q=${r.qOdeh.toFixed(3)} | ARCV=${r.ARCV.toFixed(3)}° | W=${r.W_arcmin.toFixed(4)}'`
    },
    {
      name: 'Yallop 1997',
      desc: 'Berdasarkan ARCV dan Best Time',
      res:  r.qYallop>0.216?'A':r.qYallop>=-0.014?'B':r.qYallop>=-0.160?'C':r.qYallop>=-0.232?'D':'E',
      cls:  r.qYallop>=-0.014?'v':r.qYallop>=-0.160?'m':'x',
      det:  `q=${r.qYallop.toFixed(5)}`
    }
  ];
  document.getElementById('hilalCritCards').innerHTML = crits.map(c => `
    <div class="ccard">
      <div class="cname">${c.name}</div>
      <div class="cres ${c.cls}">${c.res}</div>
      <div class="cdet">${c.desc}<br>${c.det}</div>
    </div>`).join('');
}

// ── Entry point ────────────────────────────────────
function doCalcHilal() {
  const hYear  = +document.getElementById('hilalYear').value;
  const hMonth = +document.getElementById('hilalMonth').value;
  document.getElementById('hilalOut').innerHTML =
    `<span style="color:var(--text2)">Menghitung...<span class="sp"></span></span>`;
  document.getElementById('hilalCritDiv').style.display = 'none';
  setTimeout(() => {
    try {
      renderHilalReport(calcHilal(hYear, hMonth, LAT, LNG, ELEV, TZ));
    } catch(e) {
      document.getElementById('hilalOut').innerHTML =
        `<span style="color:var(--red)">Error: ${e.message}</span>`;
      console.error(e);
    }
  }, 30);
}
