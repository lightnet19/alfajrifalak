export function getYallop(alt, elong) {
  const q = alt - (0.1018 * elong * elong - 1.1 * elong + 6);

  if (q > 0.216) return "A";
  if (q > -0.014) return "B";
  if (q > -0.160) return "C";
  if (q > -0.232) return "D";
  return "E";
}

export function getOdeh(alt, elong) {
  const V = alt - (7.1651 - 6.3226 * elong);

  if (V >= 5.65) return "A";
  if (V >= 2) return "B";
  if (V >= -0.96) return "C";
  if (V >= -2) return "D";
  return "E";
}
