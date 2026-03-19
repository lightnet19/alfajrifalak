export function toJulianDate(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

export function getDeltaT(year) {
  const t = (year - 2000) / 100;
  return 64.7 + 64.5 * t + 30 * t * t;
}

export function toJulianEphemerisDate(jd, deltaTSeconds) {
  return jd + deltaTSeconds / 86400;
}

export function normalize360(value) {
  return ((value % 360) + 360) % 360;
}

export function normalize24(value) {
  return ((value % 24) + 24) % 24;
}

export function formatTime(decimalHours) {
  const h = Math.floor(normalize24(decimalHours));
  const m = Math.floor((normalize24(decimalHours) - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
