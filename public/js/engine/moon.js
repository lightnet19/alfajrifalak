export function getMoon(T) {
  const rad = Math.PI / 180;

  const L = 218.316 + 481267.881 * T;
  const M1 = 134.963 + 477198.867 * T;
  const F = 93.272 + 483202.017 * T;

  const lambda =
    L + 6.289 * Math.sin(M1 * rad);

  const beta =
    5.128 * Math.sin(F * rad);

  const epsilon = 23.439;

  const RA =
    Math.atan2(
      Math.sin(lambda * rad) * Math.cos(epsilon * rad) -
      Math.tan(beta * rad) * Math.sin(epsilon * rad),
      Math.cos(lambda * rad)
    ) / rad;

  const Dec =
    Math.asin(
      Math.sin(beta * rad) * Math.cos(epsilon * rad) +
      Math.cos(beta * rad) * Math.sin(epsilon * rad) * Math.sin(lambda * rad)
    ) / rad;

  return {
    lambda,
    RA: (RA + 360) % 360,
    Dec,
  };
}
