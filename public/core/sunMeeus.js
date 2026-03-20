import { normalize360 } from "./time.js";

export function getSunPosition(T) {
  const rad = Math.PI / 180;

  const L0 = normalize360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = normalize360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;

  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * rad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M * rad) +
    0.000289 * Math.sin(3 * M * rad);

  const trueLong = L0 + C;
  const trueAnomaly = M + C;
  const R = (1.000001018 * (1 - e * e)) / (1 + e * Math.cos(trueAnomaly * rad));

  const omega = 125.04 - 1934.136 * T;
  const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(omega * rad);

  const epsilon0 =
    23.43929111 -
    0.0130041667 * T -
    0.0000001639 * T * T +
    0.0000005036 * T * T * T;
  const epsilon = epsilon0 + 0.00256 * Math.cos(omega * rad);

  const RA = Math.atan2(
    Math.cos(epsilon * rad) * Math.sin(lambda * rad),
    Math.cos(lambda * rad)
  ) / rad;

  const Dec = Math.asin(
    Math.sin(epsilon * rad) * Math.sin(lambda * rad)
  ) / rad;

  return { RA: normalize360(RA), Dec, lambda: normalize360(lambda), distanceAU: R };
}
