/**
 * math.js — Konstanta, helper trigonometri, format, Julian Day, Kalender Hijri
 * Al-Fajri v2.3.3 | Lembaga Falakiyah PCNU Kencong
 */
'use strict';

// ── Konstanta ─────────────────────────────────────────
const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

// ── Trigonometri (derajat in/out) ─────────────────────
function sin(a)      { return Math.sin(a * D2R); }
function cos(a)      { return Math.cos(a * D2R); }
function tan(a)      { return Math.tan(a * D2R); }
function asin(a)     { return Math.asin(Math.max(-1, Math.min(1, a))) * R2D; }
function acos(a)     { return Math.acos(Math.max(-1, Math.min(1, a))) * R2D; }
function atan2(y, x) { return Math.atan2(y, x) * R2D; }
function fix(a)      { return a - 360 * Math.floor(a / 360); }

// ── Format ────────────────────────────────────────────
function pZ(n, w) { return String(Math.abs(Math.floor(n))).padStart(w || 2, '0'); }

/** Derajat desimal → ±DD° MM′ SS.ss″ */
function dms(d) {
  const s = d < 0 ? '−' : ' ', a = Math.abs(d);
  const dd = Math.floor(a), mm = Math.floor((a - dd) * 60);
  const ss = ((a - dd) * 60 - mm) * 60;
  return `${s}${pZ(dd)}° ${pZ(mm)}′ ${ss.toFixed(2).padStart(5,'0')}″`;
}
/** Derajat desimal → DD° MM′ SS.ss″ (tanpa tanda) */
function dmsU(d) {
  const a = Math.abs(d), dd = Math.floor(a), mm = Math.floor((a - dd) * 60);
  const ss = ((a - dd) * 60 - mm) * 60;
  return `${pZ(dd)}° ${pZ(mm)}′ ${ss.toFixed(2).padStart(5,'0')}″`;
}
/** Jam desimal → HH h MM m SS.ss s */
function hms(h) {
  const a = Math.abs(h), hh = Math.floor(a), mm = Math.floor((a - hh) * 60);
  const ss = ((a - hh) * 60 - mm) * 60;
  return `${pZ(hh)} h ${pZ(mm)} m ${ss.toFixed(2).padStart(5,'0')} s`;
}
/** Jam desimal → HH:MM:SS.ss */
function fmtF(h) {
  h = ((h % 24) + 24) % 24;
  const hh = Math.floor(h), mm = Math.floor((h - hh) * 60);
  const ss = ((h - hh) * 60 - mm) * 60;
  return `${pZ(hh)}:${pZ(mm)}:${ss.toFixed(2).padStart(5,'0')}`;
}
/** Jam desimal → HH:MM */
function fmtHM(h) {
  h = ((h % 24) + 24) % 24;
  let hh = Math.floor(h), mm = Math.round((h - hh) * 60);
  if (mm >= 60) { mm = 0; hh++; }
  return `${pZ(hh)}:${pZ(mm)}`;
}

// ── Julian Day ────────────────────────────────────────
function jd(y, m, d, h, mn, s) {
  h = h||0; mn = mn||0; s = s||0;
  if (m <= 2) { y--; m += 12; }
  const A = Math.floor(y/100), B = 2 - A + Math.floor(A/4);
  return Math.floor(365.25*(y+4716)) + Math.floor(30.6001*(m+1)) + d + B - 1524.5
       + (h + mn/60 + s/3600) / 24;
}
/** JD → Gregorian {year,month,day,hour,minute,second} */
function jdG(jd0) {
  const z = Math.floor(jd0+0.5), f = jd0+0.5-z;
  let a = z;
  if (z >= 2299161) { const ai = Math.floor((z-1867216.25)/36524.25); a = z+1+ai-Math.floor(ai/4); }
  const b=a+1524, c=Math.floor((b-122.1)/365.25), dv=Math.floor(365.25*c), e=Math.floor((b-dv)/30.6001);
  const day=b-dv-Math.floor(30.6001*e), month=e<14?e-1:e-13, year=month>2?c-4716:c-4715;
  const fh=f*24, hr=Math.floor(fh), mi=Math.floor((fh-hr)*60), sc=((fh-hr)*60-mi)*60;
  return { year, month, day, hour:hr, minute:mi, second:sc };
}

// ── Kalender Hijriyah ─────────────────────────────────
const HM = [
  'Muharram','Shafar',"Rabi'ul Awal","Rabi'ul Akhir",
  'Jumadal Ula','Jumadal Akhirah','Rajab',"Sya'ban",
  'Ramadan','Syawal',"Dzulqa'dah",'Dzulhijjah'
];
const HM_AR = [
  'مُحَرَّم','صَفَر','رَبِيعُ الأَوَّل','رَبِيعُ الثَّانِي',
  'جُمَادَى الأُولَى','جُمَادَى الآخِرَة','رَجَب','شَعْبَان',
  'رَمَضَان','شَوَّال','ذُو الْقَعْدَة','ذُو الْحِجَّة'
];
const DAY_ID  = ['Ahad','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const PASARAN = ['Legi','Pahing','Pon','Wage','Kliwon'];

function isHLeap(y) { return [2,5,7,10,13,15,18,21,24,26,29].includes(y % 30); }

/** JD → Hijriyah {year,month,day} */
function jdToHijri(jd0) {
  // FIX v2.3.3: floor(jd0 + 0.5) agar tidak meleset saat jam mendekati transisi
  const z = Math.floor(jd0 + 0.5) + 0.5, N = z - 1948438.5;
  const cyc=Math.floor(N/10631), rem=N-10631*cyc, jv=Math.floor((rem-29.5001)/354.3671);
  const hY=30*cyc+jv+1;

  let jDay=Math.floor(rem-354.3671*jv);
  const md=[0,30,29,30,29,30,29,30,29,30,29,30,29];
  for (let m=1; m<=12; m++) {
    const days=(m===12&&isHLeap(hY))?30:md[m];
    if (jDay<=days) return {year:hY,month:m,day:jDay};
    jDay-=days;
  }
  return {year:hY,month:12,day:jDay};
}

/**
 * Hijriyah → JD
 * PENTING: gunakan hy dan hm LANGSUNG (jangan hy-1/hm-1 yang error 384 hari!)
 */
function hijriToJD(hy, hm, hd) {
  return Math.floor((11*hy+3)/30) + 354*hy + 30*hm
       - Math.floor((hm-1)/2) + hd + 1948440 - 385;
}

/** JD → Weton Jawa */
function weton(jd0) {
  const g=jdG(jd0), dow=new Date(g.year,g.month-1,g.day).getDay();
  const p=((Math.floor(jd0+0.5)+2)%5+5)%5;
  return `${DAY_ID[dow]} ${PASARAN[p]}`;
}