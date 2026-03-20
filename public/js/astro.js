/**
 * astro.js — Al-Fajri
 * Posisi Matahari & Bulan, Koreksi Toposentrik, Refraksi, Terbenam
 * Referensi: Jean Meeus — Astronomical Algorithms, ed.2
 */
'use strict';

// ══════════════════════════════════════════
//  OBLIQUITY EKLIPTIKA — Meeus eq.22.3
// ══════════════════════════════════════════
function obliquity(T) {
  return 23.439291111 - 0.013004167 * T - 0.0000001639 * T * T + 0.0000005036 * T * T * T;
}

// ══════════════════════════════════════════
//  POSISI MATAHARI — Meeus Ch.25
// ══════════════════════════════════════════
function sunPos(j0) {
  const T = (j0 - 2451545.0) / 36525, T2 = T * T;
  const L0 = fix(280.46646 + 36000.76983 * T + 0.0003032 * T2);
  const M  = fix(357.52911 + 35999.05029 * T - 0.0001537 * T2);
  const e  = 0.016708634 - 0.000042037 * T - 0.0000001267 * T2;
  const C  = (1.9146 - 0.004817 * T - 0.000014 * T2) * sin(M)
           + (0.019993 - 0.000101 * T) * sin(2 * M)
           + 0.000290 * sin(3 * M);
  const sunLon = L0 + C;
  const omega  = 125.04 - 1934.136 * T;
  const lambda = fix(sunLon - 0.00569 - 0.00478 * sin(omega));
  const eps    = obliquity(T) + 0.00256 * cos(omega);
  const RA     = fix(atan2(cos(eps) * sin(lambda), cos(lambda)));
  const Dec    = asin(sin(eps) * sin(lambda));
  // Persamaan Waktu (menit)
  const EqT = (L0 - 0.0057183 - RA - 0.000319 * sin(omega) - 0.000024 * sin(2 * sunLon)) * 4;
  const dist = 1.000001018 * (1 - e * e) / (1 + e * cos((M + C) * D2R)); // AU
  const SD   = 0.2666 / dist;  // semidiameter (°)
  const HP   = asin(Math.sin(8.794 / 3600 * D2R) / dist) * R2D; // horizontal parallax (°)
  return { RA, Dec, EqT, sunLon: fix(sunLon), lambda, eps, dist, SD, HP, T, M, e, C, L0, omega };
}

// ══════════════════════════════════════════
//  POSISI BULAN — Meeus Ch.47
//  60 suku longitude/jarak + 30 suku lintang
// ══════════════════════════════════════════
const MLR = [
  [0,0,1,0,6288774,-20905355],[2,0,-1,0,1274027,-3699111],[2,0,0,0,658314,-2955968],
  [0,0,2,0,213618,-569925],[0,1,0,0,-185116,48888],[0,0,0,2,-114332,-3149],
  [2,0,-2,0,58793,246158],[2,-1,-1,0,57066,-152138],[2,0,1,0,53322,-170733],
  [2,-1,0,0,45758,-204586],[0,1,-1,0,-40923,-129620],[1,0,0,0,-34720,108743],
  [0,1,1,0,-30383,104755],[2,0,0,-2,15327,10321],[0,0,1,2,-12528,0],
  [0,0,1,-2,10980,79661],[4,0,-1,0,10675,-34782],[0,0,3,0,10034,-23210],
  [4,0,-2,0,8548,-21636],[2,1,-1,0,-7888,24208],[2,1,0,0,-6766,30824],
  [1,0,-1,0,-5163,-8379],[1,1,0,0,4987,-16675],[2,-1,1,0,4036,-12831],
  [2,0,2,0,3994,-10445],[4,0,0,0,3861,-11650],[2,0,-3,0,3665,14403],
  [0,1,-2,0,-2689,-7003],[2,0,-1,2,-2602,0],[2,-1,-2,0,2390,10056],
  [1,0,1,0,-2348,6322],[2,-2,0,0,2236,-9884],[0,1,2,0,-2120,5751],
  [0,2,0,0,-2069,0],[2,-2,-1,0,2048,-4950],[2,0,1,-2,-1773,4130],
  [2,0,0,2,-1595,0],[4,-1,-1,0,1215,-3958],[0,0,2,2,-1110,0],
  [3,0,-1,0,-892,3258],[2,1,1,0,-810,2616],[4,-1,-2,0,759,-1897],
  [0,2,-1,0,-713,-2117],[2,2,-1,0,-700,2354],[2,1,-2,0,691,0],
  [2,-1,0,-2,596,0],[4,0,1,0,549,-1423],[0,0,4,0,537,-1117],
  [4,-1,0,0,520,-1571],[1,0,-2,0,-487,-1739],[2,1,0,-2,-399,0],
  [0,0,2,-2,-381,-4421],[1,1,1,0,351,0],[3,0,-2,0,-340,0],
  [4,0,-3,0,330,0],[2,-1,2,0,327,0],[0,2,1,0,-323,1165],
  [1,1,-1,0,299,0],[2,0,3,0,294,0],[2,0,-1,-2,0,8752]
];
const MB = [
  [0,0,0,1,5128122],[0,0,1,1,280602],[0,0,1,-1,277693],[2,0,0,-1,173237],
  [2,0,-1,1,55413],[2,0,-1,-1,46271],[2,0,0,1,32573],[0,0,2,1,17198],
  [2,0,1,-1,9266],[0,0,2,-1,8822],[2,-1,0,-1,8216],[2,0,-2,-1,4324],
  [2,0,1,1,4200],[2,1,0,-1,-3359],[2,-1,-1,1,2463],[2,-1,0,1,2211],
  [2,-1,-1,-1,2065],[0,1,-1,-1,-1870],[4,0,-1,-1,1828],[0,1,0,1,-1794],
  [0,0,0,3,-1749],[0,1,-1,1,-1565],[1,0,0,1,-1491],[0,1,1,1,-1475],
  [0,1,1,-1,-1410],[0,1,0,-1,-1344],[1,0,0,-1,-1335],[0,0,3,1,1107],
  [4,0,0,-1,1021],[4,0,-1,1,833]
];

function moonPos(j0) {
  const T = (j0 - 2451545.0) / 36525, T2 = T * T, T3 = T2 * T, T4 = T3 * T;
  const Lp = fix(218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000);
  const Mp = fix(134.9633964 + 477198.8675055  * T + 0.0087414 * T2 + T3 / 69699  - T4 / 14712000);
  const F  = fix( 93.2720950 + 483202.0175233  * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000);
  const M  = fix(357.5291092 +  35999.0502909  * T - 0.0001536 * T2 + T3 / 24490000);
  const D  = fix(297.8501921 + 445267.1114034  * T - 0.0018819 * T2 + T3 / 545868  - T4 / 113065000);
  const E  = 1 - 0.002516 * T - 0.0000074 * T2;
  const A1 = fix(119.75 + 131.849 * T), A2 = fix(53.09 + 479264.29 * T), A3 = fix(313.45 + 481266.484 * T);

  let Sl = 0, Sb = 0, Sr = 0;
  for (const [iD, iM, iMp, iF, cL, cR] of MLR) {
    let ef = 1;
    if (Math.abs(iM) === 1) ef = E;
    else if (Math.abs(iM) === 2) ef = E * E;
    const arg = iD * D + iM * M + iMp * Mp + iF * F;
    Sl += cL * ef * sin(arg);
    Sr += cR * ef * cos(arg);
  }
  Sl += 3958 * sin(A1) + 1962 * sin(Lp - F) + 318 * sin(A2);

  for (const [iD, iM, iMp, iF, cB] of MB) {
    let ef = 1;
    if (Math.abs(iM) === 1) ef = E;
    else if (Math.abs(iM) === 2) ef = E * E;
    Sb += cB * ef * sin(iD * D + iM * M + iMp * Mp + iF * F);
  }
  Sb += -2235 * sin(Lp) + 382 * sin(A3) + 175 * sin(A1 - F) + 175 * sin(A1 + F) + 127 * sin(Lp - Mp) - 115 * sin(Lp + Mp);

  const mlon = fix(Lp + Sl / 1e6), mlat = Sb / 1e6, dist = 385000.56 + Sr / 1000;
  const eps = obliquity(T);
  const RA  = fix(atan2(sin(mlon) * cos(eps) - tan(mlat) * sin(eps), cos(mlon)));
  const Dec = asin(sin(mlat) * cos(eps) + cos(mlat) * sin(eps) * sin(mlon));
  const SD  = asin(1737.4 / dist);  // semidiameter (°)
  const HP  = asin(6378.14 / dist); // horizontal parallax (°)
  return { lon: mlon, lat: mlat, dist, RA, Dec, SD, HP, Lp, Mp, F, M, D, E, T };
}

// ══════════════════════════════════════════
//  KOREKSI TOPOSENTRIK — Meeus Ch.40
//  FIX: rhoSin/rhoCos DIMENSIONLESS (bukan dikali R2D)
//  FIX: dRA pakai atan2, bukan pembagian langsung
//  FIX: Dec_t pakai atan2 dua argumen
// ══════════════════════════════════════════
function topoCorrect(obj, lat, lng, elev, j0) {
  const T = (j0 - 2451545.0) / 36525;
  // Greenwich Mean Sidereal Time (derajat)
  const GMST = fix(280.46061837 + 360.98564736629 * (j0 - 2451545) + 0.000387933 * T * T - T * T * T / 38710000);
  const LST  = fix(GMST + lng);  // Local Sidereal Time
  const H    = LST - obj.RA;     // Local Hour Angle

  const latR = lat * D2R;
  // Koordinat geosentrik pengamat (tanpa satuan, dalam satuan jari-jari bumi)
  const u         = Math.atan(0.99664719 * Math.tan(latR));
  const rhoSinPhi = 0.99664719 * Math.sin(u) + (elev / 6378140) * Math.sin(latR);
  const rhoCosphi = Math.cos(u)               + (elev / 6378140) * Math.cos(latR);

  const sinHP = Math.sin(obj.HP * D2R);

  // Pergeseran RA toposentrik (Meeus eq.40.6)
  const nRA  = -rhoCosphi * sinHP * sin(H);
  const dRA  = Math.atan2(nRA, cos(obj.Dec) - rhoCosphi * sinHP * cos(H)) * R2D;

  // Deklinasi toposentrik (Meeus eq.40.7)
  const Dec_t = Math.atan2(
    (sin(obj.Dec) - rhoSinPhi * sinHP) * Math.cos(dRA * D2R),
    cos(obj.Dec) - rhoCosphi * sinHP * cos(H)
  ) * R2D;

  return { ...obj, RA: fix(obj.RA + dRA), Dec: Dec_t, H_geo: H, dRA, dDec: Dec_t - obj.Dec };
}

// ══════════════════════════════════════════
//  KOORDINAT HORIZONTAL (alt/az)
// ══════════════════════════════════════════
function toHoriz(RA, Dec, lat, lng, j0) {
  const T    = (j0 - 2451545.0) / 36525;
  const GMST = fix(280.46061837 + 360.98564736629 * (j0 - 2451545) + 0.000387933 * T * T - T * T * T / 38710000);
  const LST  = fix(GMST + lng);
  const H    = LST - RA;
  const alt  = asin(sin(lat) * sin(Dec) + cos(lat) * cos(Dec) * cos(H));
  const az   = fix(atan2(sin(H), cos(H) * sin(lat) - tan(Dec) * cos(lat)) + 180);
  return { alt, az, H };
}

// ══════════════════════════════════════════
//  REFRAKSI ATMOSFER — Bennett (1982)
//  Input: ketinggian airless (derajat)
//  Output: koreksi refraksi (derajat)
// ══════════════════════════════════════════
function refraction(altDeg) {
  if (altDeg < -5) return 0;
  return 1.02 / (60 * Math.tan((altDeg + 10.3 / (altDeg + 5.11)) * D2R));
}

// ══════════════════════════════════════════
//  WAKTU TERBENAM MATAHARI (iteratif)
//  FIX: toleransi konvergensi 1e-7 JD (~8 ms)
// ══════════════════════════════════════════
function calcSunset(dateJD, lat, lng, tz, elev) {
  const altTgt = -(0.8333 + 0.0347 * Math.sqrt(elev));
  let jEst = dateJD + (18 - tz) / 24; // tebakan awal: 18:00 LT
  for (let i = 0; i < 15; i++) {
    const s = sunPos(jEst);
    const cosH = (sin(altTgt) - sin(lat) * sin(s.Dec)) / (cos(lat) * cos(s.Dec));
    if (Math.abs(cosH) > 1) return null;
    const T    = (jEst - 2451545) / 36525;
    const GMST = fix(280.46061837 + 360.98564736629 * (jEst - 2451545) + 0.000387933 * T * T);
    // Transit UT = (RA - GMST - lng + 180) / 360 * 24
    const transitUT = (fix(s.RA - GMST - lng) + 180) / 360 * 24;
    const H_set     = acos(cosH) / 15; // jam
    const newJD     = dateJD + (transitUT + H_set - tz) / 24;
    if (Math.abs(newJD - jEst) < 1e-7) break;
    jEst = newJD;
  }
  return jEst;
}

// ══════════════════════════════════════════
//  WAKTU TERBENAM BULAN (iteratif)
// ══════════════════════════════════════════
function calcMoonset(dateJD, lat, lng, tz, elev) {
  const altTgt = -(0.5 + 0.0347 * Math.sqrt(elev));
  let jEst = dateJD + (18.5 - tz) / 24;
  for (let i = 0; i < 15; i++) {
    const m = moonPos(jEst);
    const cosH = (sin(altTgt) - sin(lat) * sin(m.Dec)) / (cos(lat) * cos(m.Dec));
    if (Math.abs(cosH) > 1) return null;
    const T    = (jEst - 2451545) / 36525;
    const GMST = fix(280.46061837 + 360.98564736629 * (jEst - 2451545) + 0.000387933 * T * T);
    const transitUT = (fix(m.RA - GMST - lng) + 180) / 360 * 24;
    const H_set     = acos(cosH) / 15;
    const newJD     = dateJD + (transitUT + H_set - tz) / 24;
    if (Math.abs(newJD - jEst) < 1e-7) break;
    jEst = newJD;
  }
  return jEst;
}

// ══════════════════════════════════════════
//  LOCAL TIME dari JD
// ══════════════════════════════════════════
function jdToLT(j0, tz) {
  // Ambil jam dari bagian fraksi JD + tz
  return ((j0 - Math.floor(j0 - 0.5) - 0.5) * 24 + tz + 24) % 24;
}

// ══════════════════════════════════════════
//  HORIZONTAL COORDINATES (alt / az)
// ══════════════════════════════════════════
function toHoriz(RA, Dec, lat, lng, jd0) {
  const T = (jd0 - 2451545.0) / 36525;
  const theta0 = fix(280.46061837 + 360.98564736629*(jd0-2451545) + 0.000387933*T*T - T*T*T/38710000);
  const LST = fix(theta0 + lng);
  const H   = LST - RA;
  const alt = asin(sin(lat)*sin(Dec) + cos(lat)*cos(Dec)*cos(H));
  const az  = fix(atan2(sin(H), cos(H)*sin(lat) - tan(Dec)*cos(lat)) + 180);
  return { alt, az, H };
}

// ══════════════════════════════════════════
//  DELTA-T (TT – UT1) in seconds
// ══════════════════════════════════════════
function deltaT(year) {
  if (year >= 2015 && year < 2030) return 69.0 + 0.37*(year - 2015);
  if (year >= 2005) return 64.69 + 0.2952*(year-2005) + 0.01422*(year-2005)**2;
  return 63.83 + 0.3197*(year-2000) + 0.006*(year-2000)**2;
}

// ══════════════════════════════════════════
//  ELONGATION (great-circle arc)
// ══════════════════════════════════════════
function elongation(RA1, Dec1, RA2, Dec2) {
  return acos(sin(Dec1)*sin(Dec2) + cos(Dec1)*cos(Dec2)*cos(RA1-RA2));
}

// ══════════════════════════════════════════
//  SUNSET — iterative, converges in ≤15 itr
//  FIX: proper GMST formula; start at 18:00 local
// ══════════════════════════════════════════
function calcSunSet(dateJD, lat, lng, tz, elev) {
  const altTgt = -(0.8333 + 0.0347 * Math.sqrt(elev || 0));
  let jEst = dateJD + (18 - tz) / 24;
  for (let i = 0; i < 15; i++) {
    const s = sunPos(jEst);
    const cosH = (sin(altTgt) - sin(lat)*sin(s.Dec)) / (cos(lat)*cos(s.Dec));
    if (Math.abs(cosH) > 1) return null;
    const T    = (jEst - 2451545) / 36525;
    const GMST = fix(280.46061837 + 360.98564736629*(jEst-2451545) + 0.000387933*T*T);
    const transitUT = (fix(s.RA - GMST - lng) + 180) / 360 * 24;
    const H_set     = acos(cosH) / 15;
    const newJD     = dateJD + (transitUT + H_set - tz) / 24;
    if (Math.abs(newJD - jEst) < 1e-7) break;
    jEst = newJD;
  }
  return jEst;
}

// ══════════════════════════════════════════
//  MOONSET — iterative, start at 19:00 local
// ══════════════════════════════════════════
function calcMoonSet(dateJD, lat, lng, tz, elev) {
  const altTgt = -(0.5 + 0.0347 * Math.sqrt(elev || 0));
  let jEst = dateJD + (19 - tz) / 24;
  for (let i = 0; i < 15; i++) {
    const m = moonPos(jEst);
    const cosH = (sin(altTgt) - sin(lat)*sin(m.Dec)) / (cos(lat)*cos(m.Dec));
    if (Math.abs(cosH) > 1) return null;
    const T    = (jEst - 2451545) / 36525;
    const GMST = fix(280.46061837 + 360.98564736629*(jEst-2451545) + 0.000387933*T*T);
    const transitUT = (fix(m.RA - GMST - lng) + 180) / 360 * 24;
    const H_set     = acos(cosH) / 15;
    const newJD     = dateJD + (transitUT + H_set - tz) / 24;
    if (Math.abs(newJD - jEst) < 1e-7) break;
    jEst = newJD;
  }
  return jEst;
}

// ══════════════════════════════════════════
//  IJTIMA (New Moon) — Meeus Ch.49
// ══════════════════════════════════════════
function newMoonJDE(k) {
  const T  = k / 1236.85;
  const T2 = T*T, T3 = T2*T, T4 = T3*T;
  let JDE = 2451550.09766 + 29.530588861*k + 0.00015437*T2 - 0.00000015*T3 + 0.00000000073*T4;
  const M  = fix(2.5534    + 29.10535670*k  - 0.0000014*T2  - 0.00000011*T3);
  const Mp = fix(201.5643  + 385.81693528*k + 0.0107582*T2  + 0.00001238*T3 - 0.000000058*T4);
  const F  = fix(160.7108  + 390.67050284*k - 0.0016118*T2  - 0.00000227*T3 + 0.000000011*T4);
  const Om = fix(124.7746  - 1.56375588*k   + 0.0020672*T2  + 0.00000215*T3);
  const E  = 1 - 0.002516*T - 0.0000074*T2;
  JDE +=
    -0.40720*sin(Mp)       + 0.17241*E*sin(M)      + 0.01608*sin(2*Mp)    + 0.01039*sin(2*F)
    +0.00739*E*sin(Mp-M)   - 0.00514*E*sin(Mp+M)   + 0.00208*E*E*sin(2*M)
    -0.00111*sin(Mp-2*F)   - 0.00057*sin(Mp+2*F)   + 0.00056*E*sin(2*Mp+M)
    -0.00042*sin(3*Mp)     + 0.00042*E*sin(M+2*F)  + 0.00038*E*sin(M-2*F)
    -0.00024*E*sin(2*Mp-M) - 0.00017*sin(Om)       - 0.00007*sin(Mp+2*M)
    +0.00004*sin(2*Mp-2*F) + 0.00004*sin(3*M)      + 0.00003*sin(Mp+M-2*F)
    +0.00003*sin(2*Mp+2*F) - 0.00003*sin(Mp+M+2*F) + 0.00003*sin(Mp-M+2*F)
    -0.00002*sin(Mp-M-2*F) - 0.00002*sin(3*Mp+M)   + 0.00002*sin(4*Mp);
  return JDE; // Terrestrial Dynamical Time
}

function kFromYM(year, month) {
  return Math.round((year + (month - 1) / 12 - 2000) * 12.3685);
}
