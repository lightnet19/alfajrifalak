export function normalize(v) {
  return ((v % 360) + 360) % 360;
}
