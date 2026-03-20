import { getNutation } from "./nutation.js";

export function getTrueObliquity(T) {
  const epsilon0 =
    23.439291 -
    0.0130042 * T -
    1.64e-7 * T * T +
    5.04e-7 * T * T * T;

  const { deltaEpsilon } = getNutation(T);
  return epsilon0 + deltaEpsilon;
}
