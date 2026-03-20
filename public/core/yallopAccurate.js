import { getIllumination } from "./illumination.js";

export function getYallopAccurate({ moonAlt, sunAlt, elongation, semiDiameter = 0.2725 }) {
  const rad = Math.PI / 180;
  const ARCV = moonAlt - sunAlt;
  const ARCL = elongation;

  const { illumination } = getIllumination(elongation);
  const W = semiDiameter * (1 - Math.cos(ARCL * rad)) * Math.sqrt(illumination);

  const q = ARCV - (11.8371 - 6.3226 * W + 0.7319 * W * W - 0.1018 * W * W * W);

  return {
    ARCV,
    ARCL,
    W,
    illumination,
    q,
    category: classify(q),
  };
}

function classify(q) {
  if (q > 0.216) return "A: Easily visible";
  if (q > -0.014) return "B: Visible under perfect conditions";
  if (q > -0.160) return "C: May need optical aid";
  if (q > -0.232) return "D: Will need optical aid";
  if (q > -0.293) return "E: Not visible";
  return "F: Impossible";
}
