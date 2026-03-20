export function toJulianDate(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

export function getDeltaT(year) {
  const t = year - 2000;
  return 62.92 + 0.32217 * t + 0.005589 * t * t;
}
