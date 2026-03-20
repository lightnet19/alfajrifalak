import { getIllumination } from "./illumination.js";

export function getOdehVisibility({ moonAlt, sunAlt, elongation, semiDiameter = 0.2725 }) {
  const rad = Math.PI / 180;
  const ARCV = moonAlt - sunAlt;
  const ARCL = elongation;

  const { illumination } = getIllumination(elongation);
  const W = semiDiameter * (1 - Math.cos(ARCL * rad)) * Math.sqrt(illumination);

  const V = ARCV - (7.1651 - 6.3226 * W + 0.7319 * W * W - 0.1018 * W * W * W);

  return {
    ARCV,
    ARCL,
    W,
    illumination,
    V,
    category: classify(V),
  };
}

function classify(V) {
  if (V >= 5.65) return "A: Naked eye easily visible";
  if (V >= 2.0) return "B: Visible with naked eye under good conditions";
  if (V >= -0.96) return "C: Visible with optical aid";
  if (V >= -2.0) return "D: Possibly visible with telescope";
  return "E: Not visible";
}
