import { normalize360 } from "./time.js";

export function getSiderealTime(jd, lon) {
  const T = (jd - 2451545.0) / 36525;
  let theta =
    280.46061837 +
    360.98564736629 * (jd - 2451545) +
    0.000387933 * T * T -
    (T * T * T) / 38710000;

  return normalize360(theta + lon);
}

export function equatorialToHorizontal(RA, Dec, lat, LST) {
  const rad = Math.PI / 180;
  const HA = normalize360(LST - RA) * rad;
  const latRad = lat * rad;
  const decRad = Dec * rad;

  const alt = Math.asin(
    Math.sin(latRad) * Math.sin(decRad) +
    Math.cos(latRad) * Math.cos(decRad) * Math.cos(HA)
  ) / rad;

  let az = Math.atan2(
    Math.sin(HA),
    Math.cos(HA) * Math.sin(latRad) - Math.tan(decRad) * Math.cos(latRad)
  ) / rad;

  az = normalize360(az + 180);
  return { alt, az };
}
