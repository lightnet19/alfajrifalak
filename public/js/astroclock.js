/**
 * astroclock.js — Jam Astronomi Real-Time
 * Al-Fajri v2.8.0 | Lembaga Falakiyah PCNU Kencong
 * Depends on: math.js, astro.js
 */
'use strict';

/**
 * Hitung Greenwich Mean Sidereal Time (GMST) dalam derajat
 * @param {number} jd_ut - Julian Day dalam Universal Time (UT)
 * @returns {number} derajat GMST [0, 360)
 */
function calcGST(jd_ut) {
  const T = (jd_ut - 2451545.0) / 36525;
  const GMST = 280.46061837 + 360.98564736629 * (jd_ut - 2451545.0) 
               + 0.000387933 * T * T - (T * T * T) / 38710000;
  return fix(GMST);
}

/**
 * Konversi derajat sudut (0-360) ke format jam HH:MM:SS
 */
function fmtAngleToTime(deg) {
  let h = deg / 15;
  h = (h % 24 + 24) % 24;
  const hh = Math.floor(h);
  const mm = Math.floor((h - hh) * 60);
  const ss = Math.floor(((h - hh) * 60 - mm) * 60);
  return `${pZ(hh)}:${pZ(mm)}:${pZ(ss)}`;
}

/**
 * Render panel jam astronomi statis (sekali panggil)
 */
function renderAstroClock() {
  // Hanya memastikan UI awal ter-setup, tickAstroClock yang update data.
  // Pastikan elemen koordinat tersedia.
  if (typeof LAT === 'undefined' || typeof LNG === 'undefined') return;
  tickAstroClock();
}

/**
 * Fungsi ini dipanggil setiap detik oleh setInterval di main.js
 */
function tickAstroClock() {
  const elUT = document.getElementById('aclkUT');
  if (!elUT) return; // Panel tidak aktif atau belum di-load

  const LAT_num = typeof LAT !== 'undefined' ? LAT : parseFloat(document.getElementById('inpLat').value) || 0;
  const LNG_num = typeof LNG !== 'undefined' ? LNG : parseFloat(document.getElementById('inpLng').value) || 0;

  const now = new Date();
  const utH = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth() + 1;
  const d = now.getUTCDate();
  
  const jd_ut = jd(y, m, d, utH);
  const gst = calcGST(jd_ut);
  const lst = fix(gst + LNG_num); // Local Sidereal Time in degrees

  // 1. Update Jam
  elUT.textContent = fmtAngleToTime(utH * 15); // UT time
  document.getElementById('aclkGST').textContent = fmtAngleToTime(gst);
  document.getElementById('aclkLST').textContent = fmtAngleToTime(lst);

  // Hitung posisi
  // Untuk presisi TDT
  const dt = deltaT(y + m/12);
  const jde = jd_ut + dt/86400;

  const sun = sunPos(jde);
  const moon = moonPos(jde);

  // Hour Angle
  const haSun = fix(lst - sun.RA);
  const haMoon = fix(lst - moon.RA);

  // Alt Az (Geosentris cukup untuk indikator real-time cepat)
  const sunHor = toHoriz(sun.RA, sun.Dec, LAT_num, LNG_num, jd_ut);
  const moonHor = toHoriz(moon.RA, moon.Dec, LAT_num, LNG_num, jd_ut);

  // Iluminasi Bulan (approx)
  const elong = acos(sin(sun.Dec)*sin(moon.Dec) + cos(sun.Dec)*cos(moon.Dec)*cos(sun.RA - moon.RA));
  const illum = (1 - cos(elong)) / 2 * 100;

  // 2. Update Matahari
  document.getElementById('acSunRA').textContent = fmtAngleToTime(sun.RA);
  document.getElementById('acSunDec').textContent = dms(sun.Dec);
  document.getElementById('acSunHA').textContent = fmtAngleToTime(haSun);
  document.getElementById('acSunAz').textContent = sunHor.az.toFixed(2) + '°';
  document.getElementById('acSunAlt').textContent = (sunHor.alt > 0 ? '+' : '') + sunHor.alt.toFixed(2) + '°';

  // 3. Update Bulan
  document.getElementById('acMoonRA').textContent = fmtAngleToTime(moon.RA);
  document.getElementById('acMoonDec').textContent = dms(moon.Dec);
  document.getElementById('acMoonHA').textContent = fmtAngleToTime(haMoon);
  document.getElementById('acMoonAz').textContent = moonHor.az.toFixed(2) + '°';
  document.getElementById('acMoonAlt').textContent = (moonHor.alt > 0 ? '+' : '') + moonHor.alt.toFixed(2) + '°';
  document.getElementById('acMoonIll').textContent = illum.toFixed(1) + '%';
}
