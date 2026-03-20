import { normalize } from "./utils.js";

export function getMoon(T) {
  const rad = Math.PI / 180;

  const L = 218.316 + 481267.881 * T;
  const M1 = 134.963 + 477198.867 * T;

  const lambda =
    L + 6.289 * Math.sin(M1 * rad);

  const distance =
    385000 - 20905 * Math.cos(M1 * rad);

  return {
    lambda: normalize(lambda),
    distance
  };
}
