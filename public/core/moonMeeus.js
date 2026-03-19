import { normalize360 } from "./time.js";

export function getMoonPosition(T) {
  const rad = Math.PI / 180;

  const L = normalize360(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T);
  const D = normalize360(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T);
  const M = normalize360(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T);
  const Mprime = normalize360(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T);
  const F = normalize360(93.2720950 + 483202.0175233 * T - 0.0036539 * T * T);

  const lambda =
    L +
    6.289 * Math.sin(Mprime * rad) +
    1.274 * Math.sin((2 * D - Mprime) * rad) +
    0.658 * Math.sin(2 * D * rad) +
    0.214 * Math.sin(2 * Mprime * rad) +
    0.11 * Math.sin(D * rad);

  const beta =
    5.128 * Math.sin(F * rad) +
    0.280 * Math.sin((Mprime + F) * rad) +
    0.277 * Math.sin((Mprime - F) * rad) +
    0.173 * Math.sin((2 * D - F) * rad);

  const distanceKm = 385001 - 20905 * Math.cos(Mprime * rad) - 3699 * Math.cos((2 * D - Mprime) * rad) - 2956 * Math.cos(2 * D * rad);

  const epsilon = 23.439291;

  const RA =
    Math.atan2(
      Math.sin(lambda * rad) * Math.cos(epsilon * rad) - Math.tan(beta * rad) * Math.sin(epsilon * rad),
      Math.cos(lambda * rad)
    ) / rad;

  const Dec =
    Math.asin(
      Math.sin(beta * rad) * Math.cos(epsilon * rad) +
      Math.cos(beta * rad) * Math.sin(epsilon * rad) * Math.sin(lambda * rad)
    ) / rad;

  return { RA: normalize360(RA), Dec, lambda: normalize360(lambda), beta, distanceKm };
}
