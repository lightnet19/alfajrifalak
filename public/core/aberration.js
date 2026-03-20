export function getAberration(lambda, T) {
  const rad = Math.PI / 180;
  const k = 20.49552 / 3600;
  const M = 357.52911 + 35999.05029 * T;
  return -k * Math.cos((lambda - M) * rad);
}
