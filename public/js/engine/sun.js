import { normalize } from "./utils.js";

export function getSun(T) {
  const rad = Math.PI / 180;

  const L0 = 280.466 + 36000.77 * T;
  const M = 357.529 + 35999.05 * T;

  const C =
    1.914 * Math.sin(M * rad) +
    0.020 * Math.sin(2 * M * rad);

  const lambda = normalize(L0 + C);

  return { lambda };
}
