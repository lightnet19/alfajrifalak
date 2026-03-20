/**
 * math.js — Al-Fajri
 * Helper matematika, Julian Day, Kalender Hijriyah, Weton Jawa
 */
'use strict';

// ── Konstanta ──
const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

// ── Trig dalam derajat ──
const sin  = a => Math.sin(a * D2R);
const cos  = a => Math.cos(a * D2R);
const tan  = a => Math.tan(a * D2R);
const asin = a => Math.asin(Math.max(-1, Math.min(1, a))) * R2D;
const acos = a => Math.acos(Math.max(-1, Math.min(1, a))) * R2D;
const atan2 = (y, x) => Math.atan2(y, x) * R2D;

// Normalisasi sudut 0–360
function fix(a) { return a - 360 * Math.floor(a / 360); }

// Zero-pad
function pZ(n, w = 2) { return String(Math.abs(Math.floor(n))).padStart(w, '0'); }

// ── Format waktu ──
// Decimal degree → ±DD° MM′ SS.ss″
function dms(d) {
  const sg = d < 0 ? '−' : ' ';
  const a  = Math.abs(d);
  const dd = Math.floor(a), mm = Math.floor((a - dd) * 60), ss = ((a - dd) * 60 - mm) * 60;
  return `${sg}${pZ(dd)}° ${pZ(mm)}′ ${ss.toFixed(2).padStart(5,'0')}″`;
}
// Tanpa tanda (absolute)
function dmsU(d) {
  const a = Math.abs(d), dd = Math.floor(a), mm = Math.floor((a - dd) * 60), ss = ((a - dd) * 60 - mm) * 60;
  return `${pZ(dd)}° ${pZ(mm)}′ ${ss.toFixed(2).padStart(5,'0')}″`;
}
// Decimal hour → HH h MM m SS.ss s
function hms(h) {
  const a = Math.abs(h), hh = Math.floor(a), mm = Math.floor((a - hh) * 60), ss = ((a - hh) * 60 - mm) * 60;
  return `${pZ(hh)} h ${pZ(mm)} m ${ss.toFixed(2).padStart(5,'0')} s`;
}
// Decimal hour → HH:MM:SS.ss (full)
function fmtF(h) {
  h = ((h % 24) + 24) % 24;
  const hh = Math.floor(h), mm = Math.floor((h - hh) * 60), ss = ((h - hh) * 60 - mm) * 60;
  return `${pZ(hh)}:${pZ(mm)}:${ss.toFixed(2).padStart(5,'0')}`;
}
// Decimal hour → HH:MM (untuk tampilan sholat)
function fmtHM(h) {
  h = ((h % 24) + 24) % 24;
  let hh = Math.floor(h), mm = Math.round((h - hh) * 60);
  if (mm >= 60) { mm = 0; hh++; }
  return `${pZ(hh)}:${pZ(mm)}`;
}

// ══════════════════════════════════════════
//  JULIAN DAY
// ══════════════════════════════════════════
function jd(y, m, d, h = 0, mn = 0, s = 0) {
  if (m <= 2) { y--; m += 12; }
  const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5 + (h + mn / 60 + s / 3600) / 24;
}

function jdG(j0) {
  const z = Math.floor(j0 + 0.5), f = j0 + 0.5 - z;
  let a = z;
  if (z >= 2299161) { const ai = Math.floor((z - 1867216.25) / 36524.25); a = z + 1 + ai - Math.floor(ai / 4); }
  const b = a + 1524, c = Math.floor((b - 122.1) / 365.25), dv = Math.floor(365.25 * c), e = Math.floor((b - dv) / 30.6001);
  const day = b - dv - Math.floor(30.6001 * e), month = e < 14 ? e - 1 : e - 13, year = month > 2 ? c - 4716 : c - 4715;
  const fh = f * 24, hr = Math.floor(fh), mi = Math.floor((fh - hr) * 60), sc = ((fh - hr) * 60 - mi) * 60;
  return { year, month, day, hour: hr, minute: mi, second: sc };
}

// ══════════════════════════════════════════
//  KALENDER HIJRIYAH (Tabular/Arithmetical)
// ══════════════════════════════════════════
const HM = ['Muharram','Shafar',"Rabi'ul Awal","Rabi'ul Akhir",'Jumadal Ula','Jumadal Akhirah','Rajab',"Sya'ban",'Ramadan','Syawal',"Dzulqa'dah",'Dzulhijjah'];
const HM_AR = ['مُحَرَّم','صَفَر','رَبِيعُ الأَوَّل','رَبِيعُ الثَّانِي','جُمَادَى الأُولَى','جُمَادَى الآخِرَة','رَجَب','شَعْبَان','رَمَضَان','شَوَّال','ذُو الْقَعْدَة','ذُو الْحِجَّة'];
const DAY_ID = ['Ahad','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const PAS = ['Legi','Pahing','Pon','Wage','Kliwon'];

function isHLeap(y) { return [2,5,7,10,13,15,18,21,24,26,29].includes(y % 30); }

function jdToHijri(j0) {
  const z = Math.floor(j0) + 0.5, N = z - 1948438.5;
  const cyc = Math.floor(N / 10631), rem = N - 10631 * cyc, jv = Math.floor((rem - 29.5001) / 354.3671);
  const hY = 30 * cyc + jv + 1;
  let jDay = Math.floor(rem - 354.3671 * jv);
  const md = [0,30,29,30,29,30,29,30,29,30,29,30,29];
  for (let m = 1; m <= 12; m++) {
    const days = (m === 12 && isHLeap(hY)) ? 30 : md[m];
    if (jDay <= days) return { year: hY, month: m, day: jDay };
    jDay -= days;
  }
  return { year: hY, month: 12, day: jDay };
}

function hijriToJD(hy, hm, hd) {
  const y = hy - 1, m = hm - 1;
  return Math.floor((11 * hy + 3) / 30) + 354 * y + 30 * m - Math.floor((m - 1) / 2) + hd + 1948440 - 385;
}

// ══════════════════════════════════════════
//  WETON JAWA
// ══════════════════════════════════════════
function weton(j0) {
  const g = jdG(j0);
  const dow = new Date(g.year, g.month - 1, g.day).getDay();
  const p = ((Math.floor(j0 + 0.5) + 2) % 5 + 5) % 5; // offset kalibrasi
  return `${DAY_ID[dow]} ${PAS[p]}`;
}

// ══════════════════════════════════════════
//  ELONGASI (busur besar)
// ══════════════════════════════════════════
