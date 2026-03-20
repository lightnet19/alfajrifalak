export function getSun(T) {
  const rad = Math.PI / 180;

  const L = 280.466 + 36000.77 * T;
  const M = 357.529 + 35999.05 * T;

  const C =
    1.914 * Math.sin(M * rad) +
    0.020 * Math.sin(2 * M * rad);

  const lambda = (L + C) % 360;

  const epsilon = 23.439;

  const RA =
    Math.atan2(
      Math.cos(epsilon * rad) * Math.sin(lambda * rad),
      Math.cos(lambda * rad)
    ) / rad;

  const Dec =
    Math.asin(
      Math.sin(epsilon * rad) * Math.sin(lambda * rad)
    ) / rad;

  return {
    lambda,
    RA: (RA + 360) % 360,
    Dec,
  };
}
