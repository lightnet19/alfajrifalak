import { normalize24, normalize360 } from "./time.js";

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86400000);
}

export function getSunset({ date, lat, lon, tz }) {
  const rad = Math.PI / 180;
  const N = dayOfYear(date);
  const lngHour = lon / 15;
  const t = N + ((18 - lngHour) / 24);

  const M = 0.9856 * t - 3.289;
  let L = M + 1.916 * Math.sin(M * rad) + 0.020 * Math.sin(2 * M * rad) + 282.634;
  L = normalize360(L);

  let RA = Math.atan(0.91764 * Math.tan(L * rad)) / rad;
  RA = normalize360(RA);

  const Lquadrant = Math.floor(L / 90) * 90;
  const RAquadrant = Math.floor(RA / 90) * 90;
  RA = (RA + (Lquadrant - RAquadrant)) / 15;

  const sinDec = 0.39782 * Math.sin(L * rad);
  const cosDec = Math.cos(Math.asin(sinDec));

  const cosH = (Math.cos(90.833 * rad) - sinDec * Math.sin(lat * rad)) / (cosDec * Math.cos(lat * rad));
  if (cosH < -1 || cosH > 1) return null;

  const H = Math.acos(cosH) / rad / 15;
  const T = H + RA - 0.06571 * t - 6.622;
  const UT = T - lngHour;
  const localT = UT + tz;

  return normalize24(localT);
}
