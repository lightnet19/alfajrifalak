export function applyParallax(alt, distanceKm) {
  const earthRadius = 6378;
  const parallax = Math.asin(earthRadius / distanceKm) * (180 / Math.PI);

  return alt - parallax;
}
