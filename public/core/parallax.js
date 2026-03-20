export function applyParallax({ RA, Dec, lat, LST, distanceKm = 384400 }) {
  const rad = Math.PI / 180;
  const pi = Math.asin(6378.14 / distanceKm);
  const HA = (LST - RA) * rad;
  const latRad = lat * rad;
  const decRad = Dec * rad;

  const sinPi = Math.sin(pi);

  const deltaRA =
    (-sinPi * Math.cos(latRad) * Math.sin(HA)) /
    Math.cos(decRad);

  const newRA = RA + deltaRA / rad;

  const newDec =
    Dec +
    (-sinPi *
      (Math.sin(latRad) * Math.cos(decRad) -
        Math.cos(latRad) * Math.sin(decRad) * Math.cos(HA))) / rad;

  return { RA: newRA, Dec: newDec };
}
