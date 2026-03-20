export function getRefraction(altitude) {
  const rad = Math.PI / 180;
  if (altitude > -1 && altitude < 90) {
    const alt = altitude + 10.3 / (altitude + 5.11);
    const R = 1.02 / Math.tan(alt * rad);
    return R / 60;
  }
  return 0;
}

export function getMoonSemiDiameter(distanceKm = 384400) {
  return 0.2725 * (384400 / distanceKm);
}
