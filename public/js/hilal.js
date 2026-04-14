/**
 * hilal.js — Kalkulasi Awal Bulan Hijriyah (Rukyat & Wujudul Hilal)
 * Al-Fajri v2.3.3 | Lembaga Falakiyah PCNU Kencong
 * Depends on: math.js, astro.js
 *
 * CHANGELOG:
 *  v2.3.3 (2026-04-15):
 *   - Fix DOM IDs (inpHY -> hilalYear, btnCH, dll) causing crashes
 *   - Remove duplicate const (HM, DAY_ID, PASARAN, weton) to prevent SyntaxError
 */
'use strict';

// ── Konstanta Kriteria Visibilitas ─────────────────────
const ODEH_ZONE = [
  { qMin:-0.293, qMax:9, lbl:'A (Terlihat Mata Biasa)' },
  { qMin:-0.293, qMax:9, lbl:'A' },
  { qMin: 0.216, qMax:9, lbl:'B (Dengan Alat Bantu)' },
  { qMin: 0.216, qMax:9, lbl:'B' },
  { qMin: 8.0,   qMax:9, lbl:'C (Tidak Terlihat)' }
];

const YALLOP_ZONE = [
  { min: 0.216, label:'A — Mudah Terlihat' },
  { min:-0.014, label:'B — Perlu Usaha'    },
  { min:-0.160, label:'C — Perlu Teleskop' },
  { min:-0.232, label:'D — Mungkin Dg Teleskop' },
  { min:-0.293, label:'E — Tidak Mungkin' },
  { min:-9    , label:'F — Tidak Terlihat' }
];

// ── Helper waktu lokal (LT dari JD UT) ────────────────
function lt(jdUT) {
  return ((jdUT - (Math.floor(jdUT+0.5) - 0.5)) * 24) + TZ;
}

// ── Hitung JD sunset/moonset topocentric ───────────────
function calcSunSet(jdMid, lat, lng, tz, elev) {
  const j0 = jdMid + (12-tz)/24;
  const s = sunPos(j0);
  const noon = 12 - lng/15 - s.EqT/60 + tz;
  const ec = 0.8333 + 0.0347 * Math.sqrt(elev||0);
  const c = (sin(-ec) - sin(lat)*sin(s.Dec)) / (cos(lat)*cos(s.Dec));
  if (Math.abs(c) > 1) return null;
  const haH = acos(c)/15;
  const sunsetLT = noon + haH;
  return jdMid + (sunsetLT - tz)/24;
}

function calcMoonSet(jdMid, lat, lng, tz, elev) {
  let bestJD = null, minDiff = 99;
  for (let dh = 14; dh <= 22; dh++) {
    const jdT = jdMid + (dh-tz)/24;
    const m = moonPos(jdT);
    const tc = topoCorrect(m, jdT, lat, lng, elev);
    if (Math.abs(tc.alt) < minDiff) { minDiff = Math.abs(tc.alt); bestJD = jdT; }
  }
  return bestJD;
}

function newMoonJDE(k) {
  const T = k / 1236.85;
  const T2 = T*T, T3 = T2*T, T4 = T3*T;
  let J = 2451550.09766 + 29.530588861*k + 0.00015437*T2 - 0.000000150*T3 + 0.00000000073*T4;
  const E = 1 - 0.002516*T - 0.0000074*T2;
  const M  = fix(2.5534   + 29.10535670*k - 0.0000014*T2);
  const Mp = fix(201.5643 + 385.81693528*k + 0.0107582*T2 + 0.00001238*T3 - 0.000000058*T4);
  const F  = fix(160.7108 + 390.67050284*k - 0.0016118*T2 - 0.00000227*T3 + 0.000000011*T4);
  const Om = fix(124.7746 -   1.56375588*k + 0.0020672*T2 + 0.00000215*T3);

  const corr =
    -0.40720*sin(Mp)      + 0.17241*E*sin(M)
    + 0.01608*sin(2*Mp)   + 0.01039*sin(2*F)
    + 0.00739*E*sin(Mp-M) - 0.00514*E*sin(Mp+M)
    + 0.00208*E*E*sin(2*M)- 0.00111*sin(Mp-2*F)
    - 0.00057*sin(Mp+2*F) + 0.00056*E*sin(2*Mp+M)
    - 0.00042*sin(3*Mp)   + 0.00042*E*sin(M+2*F)
    + 0.00038*E*sin(M-2*F)- 0.00024*E*sin(2*Mp-M)
    - 0.00017*sin(Om)     - 0.00007*sin(Mp+2*M)
    + 0.00004*sin(2*Mp-2*F)+0.00004*sin(3*M)
    + 0.00003*sin(Mp+M-2*F)+0.00003*sin(2*Mp+2*F)
    - 0.00003*sin(Mp+M+2*F)+0.00003*sin(Mp-M+2*F)
    - 0.00002*sin(Mp-M-2*F)-0.00002*sin(3*Mp+M)
    + 0.00002*sin(4*Mp);

  const addCorr =
    + 0.000325*sin(fix(299.77 +  0.107408*k - 0.009173*T2))
    + 0.000165*sin(fix(251.88 +  0.016321*k))
    + 0.000164*sin(fix(251.83 + 26.651886*k))
    + 0.000126*sin(fix(349.42 + 36.412478*k))
    + 0.000110*sin(fix( 84.66 + 18.206239*k))
    + 0.000062*sin(fix(141.74 + 53.303771*k))
    + 0.000060*sin(fix(207.14 +  2.453732*k))
    + 0.000056*sin(fix(154.84 +  7.306860*k))
    + 0.000047*sin(fix( 34.52 + 27.261239*k))
    + 0.000042*sin(fix(207.19 +  0.121824*k))
    + 0.000040*sin(fix(291.34 +  1.844379*k))
    + 0.000037*sin(fix(161.72 + 24.198154*k))
    + 0.000035*sin(fix(239.56 + 25.513099*k))
    + 0.000023*sin(fix(331.55 +  3.592518*k));

  return J + corr + addCorr;
}

function refraction(alt) {
  if (alt < -0.5) return 0;
  return (1.02 / Math.tan((alt + 10.3/(alt+5.11)) * D2R)) / 60;
}
function horizDip(elev) { return 1.76 * Math.sqrt(elev||0) / 60; }

function odehQ(W, ARCV) {
  return ARCV - (6.4160 - 0.7319*W + 0.1018*W*W - 0.0038*W*W*W);
}

function yallopQ(W, ARCV) {
  return (ARCV - (11.8371 - 6.3226*W + 0.7319*W*W - 0.1018*W*W*W)) / 10;
}

function kFromYM(yr, mo) {
  return Math.round((yr + (mo-1)/12 - 2000) * 12.3685);
}

function deltaT_s(year) {
  const t = year - 2000;
  if (year < 2050) return 62.92 + 0.32217*t + 0.005589*t*t;
  const u = (year - 1820)/100;
  return -20 + 32*u*u;
}

function calcHilal(hYear, hMonth, lat, lng, tz, elev) {
  const approxGreg = jdG(hijriToJD(hYear, hMonth, 1) - 15);
  let bestK = kFromYM(approxGreg.year, approxGreg.month);
  let bestDiff = 99;

  for (let dk = -1; dk <= 2; dk++) {
    const jde = newMoonJDE(bestK + dk);
    const h   = jdToHijri(jde);
    // Ijtima di bulan sebelumnya
    const diff = Math.abs((h.year - hYear)*12 + (h.month - (hMonth - 1)));
    if (diff < bestDiff) { bestDiff = diff; bestK = bestK + dk; }
  }

  const jdeTDT  = newMoonJDE(bestK);
  const dT_s    = deltaT_s(approxGreg.year);
  const jdIjtima = jdeTDT - dT_s / 86400;
  const gregI    = jdG(jdIjtima);
  const gregI2   = { year: gregI.year, month: gregI.month, day: gregI.day };
  const hijI     = jdToHijri(jdIjtima);

  const obsBase = jd(gregI2.year, gregI2.month, gregI2.day);
  const ss0     = calcSunSet(obsBase, lat, lng, tz, elev);
  const obsJD   = (ss0 && jdIjtima > ss0) ? obsBase + 1 : obsBase;

  const jdSunset = calcSunSet(obsJD, lat, lng, tz, elev);
  if (!jdSunset) return null;

  const sunsetLT = lt(jdSunset);
  const jdObs   = jdSunset;
  const sunD    = sunPos(jdObs);
  const moonD   = moonPos(jdObs);
  const topoM   = topoCorrect(moonD, jdObs, lat, lng, elev);

  const elong = acos(
    sin(sunD.Dec)*sin(moonD.Dec) +
    cos(sunD.Dec)*cos(moonD.Dec)*cos(moonD.RA - sunD.RA)
  );

  const SD_arcsec   = moonD.SD * 3600;
  const W_arcsec    = SD_arcsec * (1 - cos(elong));
  const nurul       = W_arcsec / (2 * SD_arcsec);
  const W_arcmin    = W_arcsec / 60;

  const altMoonApp  = topoM.alt + refraction(topoM.alt) + horizDip(elev);
  const altSunApp   = sunD.alt !== undefined ? (sunD.alt||0) : 0;

  const ARCV  = altMoonApp - altSunApp;
  const DAZ   = acos(
    (sin(topoM.alt) - sin(lat)*sin(moonD.Dec)) / (cos(lat)*cos(moonD.Dec))
  ) - acos(
    (sin(sunD.alt||0) - sin(lat)*sin(sunD.Dec)) / (cos(lat)*cos(sunD.Dec))
  );

  const qOdeh  = odehQ(W_arcmin, ARCV);
  const qYall  = yallopQ(W_arcmin, ARCV);

  const umurHilalH = (jdSunset - jdIjtima) * 24;

  const moonSetJD = calcMoonSet(obsJD, lat, lng, tz, elev);
  const moonSetLT = moonSetJD ? lt(moonSetJD) : null;

  let predJD = null;
  for (let d = 0; d <= 4; d++) {
    const to = obsJD + d;
    const ts = calcSunSet(to, lat, lng, tz, elev);
    if (!ts) continue;
    const tmh  = topoCorrect(moonPos(ts), ts, lat, lng, elev);
    const tsun = sunPos(ts);
    const tmar = tmh.alt + refraction(tmh.alt) + horizDip(elev);
    const telG = acos(
      sin(tsun.Dec)*sin(tmh.dec||moonPos(ts).Dec) +
      cos(tsun.Dec)*cos(tmh.dec||moonPos(ts).Dec)*cos((tmh.ra||moonPos(ts).RA)-tsun.RA)
    );
    // Kriteria MABIMS IRNU: Mar'i > 3, Elongasi > 6.4
    if (tmar >= 3.0 && telG >= 6.4) { predJD = to; break; }
    if (d >= 3 && !predJD) predJD = to + 1;
  }

  const predGreg = predJD ? jdG(predJD + 1.5) : null;
  const predWtn  = predJD ? weton(predJD + 1.5) : '—';
  const obsGreg  = jdG(obsJD + 0.5);
  const wetonObs = weton(obsJD + 0.5);

  return {
    hYear, hMonth,
    jdIjtima, elong, ARCV, DAZ,
    SD: moonD.SD, HP: moonD.HP,
    W: W_arcmin, nurul,
    altMoon: topoM.alt, altMoonApp,
    altSun: sunD.alt || 0,
    umurHilalH,
    sunsetLT, moonSetLT,
    qOdeh, qYall,
    obsGreg, wetonObs,
    predGreg, predWtn,
    gregI2, hijI,
    dT_s
  };
}

const MON3 = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const HM_QMOJI = ['☽','☽','🌸','🌸','🌿','🌿','✨','🌙','🌙','🎉','📅','🕌'];

function renderHilalReport(r) {
  if (!r) { document.getElementById('hilalOut').innerHTML='<p style="color:#c77">Terjadi kesalahan perhitungan.</p>'; return; }

  // Sembunyikan bagian cards sebelumnya jika ada
  const dc = document.getElementById('hilalCritDiv');
  if (dc) dc.style.display = 'none';

  const fmtG = g => g ? `${g.day} ${MON3[g.month-1]} ${g.year}` : '—';
  const fmtGLong = g => g ? new Date(g.year,g.month-1,g.day)
    .toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) : '—';

  const ijtimaLT   = fmtHM(lt(r.jdIjtima));
  const ijtimaWtn  = weton(r.jdIjtima);
  const sunsetStr  = fmtHM(r.sunsetLT);
  const moonSetStr = r.moonSetLT ? fmtHM(r.moonSetLT) : '—';

  let odehLabel = '—';
  if (r.qOdeh >= 0.216)       odehLabel='<span style="color:#4c9">A — Mudah Terlihat</span>';
  else if (r.qOdeh >= -0.014) odehLabel='<span style="color:#9c6">B — Perlu Alat Bantu</span>';
  else                         odehLabel='<span style="color:#c66">C — Tidak Terlihat</span>';

  let yallLabel = '—';
  const yZones = [
    {min:0.216, lbl:'<span style="color:#4c9">A — Mudah Terlihat</span>'},
    {min:-0.014,lbl:'<span style="color:#9c6">B — Perlu Usaha</span>'},
    {min:-0.160,lbl:'<span style="color:#cc9">C — Perlu Teleskop</span>'},
    {min:-0.232,lbl:'<span style="color:#c96">D — Mungkin Dg Teleskop</span>'},
    {min:-0.293,lbl:'<span style="color:#c66">E — Tidak Terlihat (Mungkin)</span>'},
    {min:-9,    lbl:'<span style="color:#c44">F — Tidak Terlihat</span>'}
  ];
  for (const z of yZones) { if (r.qYall >= z.min) { yallLabel = z.lbl; break; } }

  const pred = r.predGreg
    ? `${r.predWtn}, ${fmtG(r.predGreg)} M`
    : '—';

  document.getElementById('hilalOut').innerHTML = `
  <div class="hi-title">
    ${HM_QMOJI[r.hMonth-1]} Hilal Awal ${HM[r.hMonth-1]} ${r.hYear} H
  </div>
  <table class="hi-tbl">
    <tr><th colspan="2" class="hi-sect">📍 Data Ijtima (Konjungsi)</th></tr>
    <tr><td>Tanggal Ijtima Geo (UT)</td>
        <td>${ijtimaWtn}, ${fmtGLong(r.gregI2)}</td></tr>
    <tr><td>Jam Ijtima (LT UTC+${TZ})</td>
        <td>${ijtimaLT} WIB</td></tr>
    <tr><td>Ijtima Hijriyah</td>
        <td>${r.hijI.day} ${HM[r.hijI.month-1]} ${r.hijI.year} H</td></tr>
    <tr><td>ΔT (TDT−UT)</td>
        <td>${r.dT_s.toFixed(2)} detik</td></tr>

    <tr><th colspan="2" class="hi-sect">🌙 Data Hilal saat Matahari Terbenam</th></tr>
    <tr><td>Tanggal Pengamatan</td>
        <td>${r.wetonObs}, ${fmtG(r.obsGreg)} M</td></tr>
    <tr><td>Jam Matahari Terbenam</td>
        <td>${sunsetStr} WIB</td></tr>
    <tr><td>Jam Bulan Terbenam</td>
        <td>${moonSetStr} WIB</td></tr>
    <tr><td>Umur Hilal</td>
        <td>${r.umurHilalH.toFixed(4)} jam</td></tr>
    <tr><td>Elongasi Geosentrik</td>
        <td>${r.elong.toFixed(4)}°</td></tr>
    <tr><td>Ketinggian Bulan (Topo.)</td>
        <td>${r.altMoon.toFixed(4)}°</td></tr>
    <tr><td>Ketinggian Bulan (Semu)</td>
        <td>${r.altMoonApp.toFixed(4)}°</td></tr>
    <tr><td>ARCV (Arc of Vision)</td>
        <td>${r.ARCV.toFixed(4)}°</td></tr>
    <tr><td>DAZ (Perbedaan Azimuth)</td>
        <td>${r.DAZ.toFixed(4)}°</td></tr>
    <tr><td>Semidiameter Bulan</td>
        <td>${r.SD.toFixed(4)}°</td></tr>
    <tr><td>Lebar Sabit (W)</td>
        <td>${r.W.toFixed(4)}'</td></tr>
    <tr><td>Nurul Hilal</td>
        <td>${(r.nurul*100).toFixed(6)}%</td></tr>

    <tr><th colspan="2" class="hi-sect">📊 Kriteria Visibilitas</th></tr>
    <tr><td>Kriteria Odeh (q)</td>
        <td>${r.qOdeh.toFixed(4)} — ${odehLabel}</td></tr>
    <tr><td>Kriteria Yallop (q)</td>
        <td>${r.qYall.toFixed(4)} — ${yallLabel}</td></tr>

    <tr><th colspan="2" class="hi-sect">📅 Prediksi Awal Bulan</th></tr>
    <tr><td>Prediksi MABIMS (IRNU)</td>
        <td style="color:var(--gold1);font-weight:700">${pred}</td></tr>
  </table>`;
}

// ── UI: Entry Point ─────────────────────────────────────
function doCalcHilal() {
  const yInp = document.getElementById('hilalYear');
  const mInp = document.getElementById('hilalMonth');
  if (!yInp || !mInp) return;

  const hY  = parseInt(yInp.value) || 1447;
  const hM  = parseInt(mInp.value) || 1;
  const res = calcHilal(hY, hM, LAT, LNG, TZ, ELEV);
  renderHilalReport(res);
}

const bCH = document.getElementById('btnCH');
if (bCH) bCH.addEventListener('click', doCalcHilal);
