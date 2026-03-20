export function getTopocentricEcliptic({ lambda, beta, distanceKm, lat, LST, RA, Dec }) {
  const rad = Math.PI / 180;
  const pi = Math.asin(6378.14 / distanceKm);
  const HA = (LST - RA) * rad;
  const latRad = lat * rad;
  const decRad = Dec * rad;

  const deltaLambda =
    (-pi * Math.cos(latRad) * Math.sin(HA)) / Math.cos(decRad);

  const deltaBeta =
    -pi *
    (Math.sin(latRad) * Math.cos(decRad) -
      Math.cos(latRad) * Math.sin(decRad) * Math.cos(HA));

  return {
    lambdaTopo: lambda + deltaLambda / rad,
    betaTopo: beta + deltaBeta / rad,
  };
}
