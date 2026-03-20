export function getNutation(T) {
  const rad = Math.PI / 180;

  const D = 297.85036 + 445267.11148 * T;
  const F = 93.27191 + 483202.017538 * T;
  const omega = 125.04452 - 1934.136261 * T;

  const deltaPsi =
    (-17.20 * Math.sin(omega * rad) -
      1.32 * Math.sin(2 * D * rad) -
      0.23 * Math.sin(2 * F * rad) +
      0.21 * Math.sin(2 * omega * rad)) / 3600;

  const deltaEpsilon =
    (9.20 * Math.cos(omega * rad) +
      0.57 * Math.cos(2 * D * rad) +
      0.10 * Math.cos(2 * F * rad) -
      0.09 * Math.cos(2 * omega * rad)) / 3600;

  return { deltaPsi, deltaEpsilon };
}
